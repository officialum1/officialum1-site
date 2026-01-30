import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { sendAuditReport } from '@/lib/email';
import { query } from '@/lib/db';
import { sendTelegramMessage, sendTelegramAdminAlert } from '@/lib/telegram';
import crypto from 'crypto';

// Paths
const PRODUCTS_PATH = path.join(process.cwd(), 'data', 'products.json');
const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');

// Helper to load JSON
async function load(filePath: string) {
    try { return JSON.parse(await fs.readFile(filePath, 'utf8')); } catch { return []; }
}

async function getSettings() {
    try {
        const rows = await query("SELECT setting_key, setting_value FROM settings") as any[];
        // Convert rows array to a single object
        if (Array.isArray(rows)) {
            return rows.reduce((acc: any, row: any) => {
                acc[row.setting_key] = row.setting_value;
                return acc;
            }, {});
        }
        return {};
    } catch (e: unknown) {
        console.error("Failed to load settings from DB:", e);
        throw new Error("Database Configuration Error: " + (e instanceof Error ? e.message : String(e)));
    }
}


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, productId, method, guestEmail, promoCode, finalPrice, quantity = 1, cartItems, membershipPlan } = body;
        const orderId = (cartItems && Array.isArray(cartItems)) ? 'BULK-' + Date.now() : 'ORD-' + Date.now();

        // 1. Load Settings
        const settings = await getSettings();

        // Check if Bulk or Single
        const isBulk = !!cartItems && Array.isArray(cartItems) && cartItems.length > 0;
        let product: any = null;
        let amountToCharge = "0";
        let safeQuantity = quantity;

        if (membershipPlan) {
            const PLANS: any = {
                silver: { name: 'Silver VIP Membership', price: '9.99', platform: 'VIP', id: 'm1' },
                gold: { name: 'Gold VIP Membership', price: '24.99', platform: 'VIP', id: 'm2' },
                diamond: { name: 'Diamond VIP Membership', price: '49.99', platform: 'VIP', id: 'm3' }
            };
            product = PLANS[membershipPlan];
            if (!product) throw new Error("Invalid membership plan selected.");
            amountToCharge = product.price;
            safeQuantity = 1;
        } else if (!isBulk) {
            // 2. Fetch Single Product from DB/Memory
            const productRows = await query("SELECT * FROM products WHERE id = ?", [productId]) as any[];
            product = productRows[0];
            if (!product) return NextResponse.json({ error: "Product not found" }, { status: 400 });

            const q = parseInt(quantity as string, 10) || 1;
            safeQuantity = q;
            let unitPrice = parseFloat(product.price);
            if (product.sale_price && product.sale_ends_at) {
                const saleEnd = new Date(product.sale_ends_at);
                if (saleEnd > new Date()) unitPrice = parseFloat(product.sale_price);
            }
            amountToCharge = finalPrice ? finalPrice : (unitPrice * q).toFixed(2);
        } else {
            // Bulk Cart
            amountToCharge = finalPrice ? finalPrice : cartItems.reduce((acc: number, item: any) => acc + (parseFloat(item.price) * (item.quantity || 1)), 0).toFixed(2);
            product = { name: "Bulk Cart Purchase", id: 0, platform: "Multiple" };
        }

        // Create/Get User Object
        let user: any = null;
        if (userId === 'guest') {
            user = { id: 'guest', email: guestEmail, telegram: null };
        } else {
            const userRows = await query("SELECT id, email, telegram FROM users WHERE id = ?", [userId]) as any[];
            if (userRows.length > 0) user = userRows[0];
        }

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 400 });

        // amountToCharge is already calculated above for both single and bulk

        // 2. Process Payment
        let paymentUrl = null;
        let orderStatus = 'pending'; // Default to pending, NOT paid

        // A. STRIPE
        const stripeSecret = (settings.stripeSecret && settings.stripeSecret !== '...')
            ? settings.stripeSecret
            : process.env.STRIPE_SECRET_KEY;

        if (method === 'stripe') {
            if (!stripeSecret) throw new Error("Stripe is not configured by Admin (Missing Secret Key).");
            try {
                const params = new URLSearchParams();
                params.append('payment_method_types[]', 'card');
                params.append('line_items[0][price_data][currency]', 'usd');
                params.append('line_items[0][price_data][product_data][name]', isBulk ? `Cart Purchase (${cartItems.length} items)` : `${product.name} (x${safeQuantity})` + (promoCode ? ` [${promoCode}]` : ''));
                params.append('line_items[0][price_data][unit_amount]', (parseFloat(amountToCharge) * 100).toFixed(0)); // Total Amount
                params.append('line_items[0][quantity]', '1'); // Total session
                params.append('mode', 'payment');
                params.append('success_url', `${req.headers.get('origin')}/order-success?session_id={CHECKOUT_SESSION_ID}&orderId=${orderId}`);
                params.append('cancel_url', `${req.headers.get('origin')}/checkout?id=${productId}`);
                params.append('metadata[orderId]', orderId);
                params.append('metadata[userId]', userId);

                const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${stripeSecret}`, 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: params
                });
                const stripeData = await stripeRes.json();
                if (stripeData.error) throw new Error(stripeData.error.message);
                if (stripeData.url) { paymentUrl = stripeData.url; orderStatus = 'pending'; }
            } catch (err: any) { throw new Error("Stripe Error: " + err.message); }
        }

        // B. CRYPTOMUS
        const cryptoKey = (settings.cryptomusKey && settings.cryptomusKey !== '...')
            ? settings.cryptomusKey
            : process.env.CRYPTOMUS_API_KEY;

        const cryptoId = (settings.cryptomusId && settings.cryptomusId !== '...')
            ? settings.cryptomusId
            : process.env.CRYPTOMUS_MERCHANT_ID;

        if (method === 'cryptomus') {
            if (!cryptoKey || !cryptoId) throw new Error("Cryptomus is not configured by Admin.");
            try {
                const payload = {
                    amount: amountToCharge.toString(),
                    currency: "USD",
                    order_id: orderId,
                    url_callback: `${req.headers.get('origin')}/api/webhooks/cryptomus`,
                    url_return: `${req.headers.get('origin')}/order-success`,
                    url_success: `${req.headers.get('origin')}/order-success`,
                    is_payment_multiple: true,
                    lifetime: 3600,
                    to_currency: "USDT"
                };

                const safeKey = cryptoKey.trim();
                const safeId = cryptoId.trim();

                const jsonPayload = JSON.stringify(payload);
                const dataBase64 = Buffer.from(jsonPayload).toString('base64');
                const sign = crypto.createHash('md5').update(dataBase64 + safeKey).digest('hex');

                console.log("[Cryptomus Debug] Payload:", jsonPayload);
                console.log("[Cryptomus Debug] Sign:", sign);

                const cryptoRes = await fetch('https://api.cryptomus.com/v1/payment', {
                    method: 'POST',
                    headers: {
                        'merchant': safeId,
                        'sign': sign,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                const cryptoData = await cryptoRes.json();
                console.log("Cryptomus Response:", JSON.stringify(cryptoData));

                if (cryptoData.result && cryptoData.result.url) {
                    paymentUrl = cryptoData.result.url;
                    orderStatus = 'pending';
                } else {
                    const errorMsg = cryptoData.message || JSON.stringify(cryptoData);
                    throw new Error("Cryptomus Error: " + errorMsg);
                }
            } catch (e: any) {
                console.error('Cryptomus Error Details:', e);
                throw new Error(e.message || "Cryptomus Payment Failed");
            }
        }

        // C. BINANCE PAY
        const binanceKey = (settings.binanceKey && settings.binanceKey !== '...')
            ? settings.binanceKey
            : process.env.BINANCE_API_KEY;

        const binanceSecret = (settings.binanceSecret && settings.binanceSecret !== '...')
            ? settings.binanceSecret
            : process.env.BINANCE_SECRET_KEY;

        if (method === 'binance') {
            if (!binanceKey || !binanceSecret) throw new Error("Binance Pay is not configured.");
            try {
                const requestBody = JSON.stringify({
                    env: { terminalType: "WEB" },
                    merchantTradeNo: Date.now().toString(),
                    orderAmount: parseFloat(amountToCharge).toFixed(2),
                    currency: "USDT",
                    goods: {
                        goodsType: "01",
                        goodsCategory: "Z000",
                        referenceGoodsId: product.id,
                        goodsName: product.name,
                        goodsDetail: "Digital Product"
                    },
                    returnUrl: `${req.headers.get('origin')}/order-success?orderId=${Date.now()}`,
                    cancelUrl: `${req.headers.get('origin')}/checkout?id=${productId}`
                });

                const timestamp = Date.now();
                const nonce = crypto.randomBytes(16).toString('hex');
                const payload = `${timestamp}\n${nonce}\n${requestBody}\n`;
                const signature = crypto.createHmac('sha512', binanceSecret).update(payload).digest('hex').toUpperCase();

                const binanceRes = await fetch('https://bpay.binanceapi.com/binancepay/openapi/v2/order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'BinancePay-Timestamp': timestamp.toString(),
                        'BinancePay-Nonce': nonce,
                        'BinancePay-Certificate-SN': binanceKey,
                        'BinancePay-Signature': signature
                    },
                    body: requestBody
                });
                const binanceData = await binanceRes.json();
                if (binanceData.status === 'SUCCESS' && binanceData.data && binanceData.data.checkoutUrl) {
                    paymentUrl = binanceData.data.checkoutUrl;
                    orderStatus = 'pending';
                } else {
                    throw new Error("Binance Error: " + JSON.stringify(binanceData));
                }
            } catch (e: any) { throw new Error("Binance Error: " + e.message); }
        }

        // D. INTERNAL WALLET
        if (method === 'wallet') {
            if (userId === 'guest') throw new Error("Wallet payment is only available for registered users.");
            const userFullRows = await query("SELECT wallet_balance FROM users WHERE id = ?", [userId]) as any[];
            const balance = parseFloat(userFullRows[0]?.wallet_balance || 0);

            if (balance < parseFloat(amountToCharge)) {
                throw new Error(`Insufficient wallet balance. You need $${amountToCharge} but have $${balance.toFixed(2)}.`);
            }

            // Deduct Balance
            await query("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?", [amountToCharge, userId]);

            // Record Transaction
            await query("INSERT INTO wallet_transactions (user_id, amount, type, description, status) VALUES (?, ?, 'purchase', ?, 'completed')",
                [userId, amountToCharge, membershipPlan ? `VIP Membership Upgrade: ${membershipPlan}` : (isBulk ? `Bulk Cart Purchase (${cartItems.length} items)` : `Purchase of ${product.name}`)]);

            // UPDATE MEMBERSHIP IF APPLICABLE
            if (membershipPlan) {
                await query("UPDATE users SET membership = ?, membership_expires = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE id = ?", [membershipPlan, userId]);
            }

            // UPDATE TOTAL SPENT & POINTS
            await query("UPDATE users SET total_spent = total_spent + ?, points = points + ? WHERE id = ?",
                [parseFloat(amountToCharge), Math.floor(parseFloat(amountToCharge)), userId]);

            orderStatus = 'paid';
        }

        // CRITICAL CHECK
        if (parseFloat(amountToCharge) > 0 && !paymentUrl && method !== 'wallet') {
            throw new Error("Payment Gateway Initialization Failed. Please check Admin Settings.");
        }
        if (parseFloat(amountToCharge) === 0) {
            orderStatus = 'paid';
        }

        // --- AFFILIATE COMMISSION LOGIC ---
        let commissionAmount = 0;
        if (orderStatus === 'paid' && userId !== 'guest') {
            const userRefRows: any = await query("SELECT referred_by FROM users WHERE id = ?", [userId]);
            const referrerId = userRefRows[0]?.referred_by;

            if (referrerId) {
                const commissionRate = parseFloat(settings.referral_commission_rate || 10); // Default 10%
                commissionAmount = (parseFloat(amountToCharge) * commissionRate) / 100;

                if (commissionAmount > 0) {
                    await query("UPDATE users SET affiliate_balance = affiliate_balance + ?, total_affiliate_earnings = total_affiliate_earnings + ? WHERE id = ?",
                        [commissionAmount, commissionAmount, referrerId]);

                    await query("INSERT INTO wallet_transactions (user_id, amount, type, description, status) VALUES (?, ?, 'affiliate_payout', ?, 'completed')",
                        [referrerId, commissionAmount, `Commission from ${user.email} purchase`]);
                }
            }
        }

        // --- STOCK DEPLETION CHECK (Task 3) ---
        if (orderStatus === 'paid') {
            // Check current stock if platform is Direct
            const invCountRows = await query("SELECT COUNT(*) as count FROM inventory WHERE name = ? AND status = 'In Stock'", [product.name]) as any[];
            const inStock = invCountRows[0]?.count || 0;

            if (inStock < safeQuantity) {
                const alertMsg = `⚠️ <b>LOW STOCK ALERT!</b>\nProduct: ${product.name}\nAvailable: ${inStock}\nRequested: ${safeQuantity}\nPlease restock immediately.`;
                await sendTelegramAdminAlert(alertMsg);

                if (settings.admin_email || settings.smtpUser) {
                    await sendAuditReport(settings.admin_email || settings.smtpUser, "CRITICAL: Low Stock Alert", {
                        da: "STOCK ALERT",
                        pa: product.name,
                        links: inStock,
                        details: `The product "${product.name}" is running low. Current stock is ${inStock}. This order requested ${safeQuantity}. Please restock immediately to avoid lost sales.`
                    }, settings);
                }
            }
        }

        // 3. Create Order
        const newOrder = {
            orderId: orderId, // Use the same orderId used in gateways
            userId: user.id,
            guestEmail: user.email || (userId === 'guest' ? guestEmail : null),
            productId: isBulk ? 0 : product.id,
            amount: amountToCharge,
            originalPrice: isBulk ? amountToCharge : product.price,
            promoCode: promoCode || null,
            method,
            status: orderStatus,
            quantity: isBulk ? cartItems.length : safeQuantity,
            date: new Date()
        };

        // Save to Hostinger Database
        try {
            await query(`
                INSERT INTO orders (orderId, userId, guestEmail, productId, amount, originalPrice, promoCode, method, status, quantity, date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                newOrder.orderId,
                newOrder.userId,
                newOrder.guestEmail,
                newOrder.productId,
                newOrder.amount,
                newOrder.originalPrice,
                newOrder.promoCode,
                newOrder.method,
                newOrder.status,
                newOrder.quantity,
                newOrder.date
            ]);
        } catch (dbError) {
            console.error("Failed to save order to Database:", dbError);
        }

        if (paymentUrl) {
            // Telegram Alert
            await sendTelegramAdminAlert(`💰 <b>New Order Initiated!</b>\nOrder ID: #${newOrder.orderId}\nProduct: ${product.name}\nAmount: $${amountToCharge}\nCustomer: ${user.email}\nMethod: ${method}`);

            const adminEmail = process.env.ADMIN_EMAIL || settings.smtpUser;
            if (adminEmail) {
                await sendAuditReport(adminEmail, "New Order Initiated #" + newOrder.orderId, {
                    da: "NEW ORDER PENDING",
                    pa: product.name,
                    links: Number(amountToCharge || 0),
                    details: `Customer: ${user.email} has initiated a ${method} payment for $${amountToCharge} (Qty: ${safeQuantity}). Order status: ${orderStatus}.`
                }, settings);
            }
            return NextResponse.json({ success: true, paymentUrl, orderId: newOrder.orderId });
        }

        // 4. DELIVERY AUTOMATION
        let combinedEmailBody = "Thank you for your purchase! Here are your order details:\n\n";
        let combinedTelegramBody = "💰 **New Order Confirmed!**\n\n";
        const itemsToProcess = isBulk ? cartItems : [{ id: productId, quantity: safeQuantity }];

        for (const item of itemsToProcess) {
            const currentProductId = item.id;
            const currentQuantity = item.quantity || 1;

            // Fetch Product Data
            const pRows: any = await query("SELECT * FROM products WHERE id = ?", [currentProductId]);
            const p = pRows[0];
            if (!p) continue;

            let itemCreds = "";

            if (p.bundle_items) {
                const bundleIds = JSON.parse(p.bundle_items);
                itemCreds += `📦 **${p.name} Bundle:**\n`;
                for (const bundleId of bundleIds) {
                    const subRows: any = await query("SELECT name FROM products WHERE id = ?", [bundleId]);
                    if (subRows.length === 0) continue;
                    const subName = subRows[0].name;
                    const stockRows: any = await query("SELECT * FROM inventory WHERE name = ? AND status = 'In Stock' LIMIT ?", [subName, currentQuantity]);
                    if (stockRows.length < currentQuantity) {
                        itemCreds += `  ⚠️ ${subName}: Out of Stock (Contact Support)\n`;
                    } else {
                        for (const stockItem of stockRows) {
                            await query("UPDATE inventory SET status = 'Sold' WHERE id = ?", [stockItem.id]);
                            const details = stockItem.accountDetails ? JSON.parse(stockItem.accountDetails) : {};
                            itemCreds += `  ✅ ${subName}: ${details.extraInfo || (details.email + ":" + details.password)}\n`;
                        }
                    }
                }
            } else if (p.type === 'service') {
                itemCreds += `⚡ **${p.name}:** Processing shortly.\n`;
            } else {
                const stockRows: any = await query("SELECT * FROM inventory WHERE (name = ? OR platform = ?) AND status = 'In Stock' LIMIT ?", [p.name, p.platform, currentQuantity]);
                if (stockRows.length >= currentQuantity) {
                    itemCreds += `✅ **${p.name}:**\n`;
                    for (const stockItem of stockRows) {
                        await query("UPDATE inventory SET status = 'Sold' WHERE id = ?", [stockItem.id]);
                        const details = stockItem.accountDetails ? JSON.parse(stockItem.accountDetails) : {};
                        const creds = details.extraInfo || (details.email ? `Email: ${details.email}\nPass: ${details.password}` : Object.values(details).join(':'));
                        itemCreds += `${creds}\n`;
                    }
                } else {
                    await query("UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?", [currentQuantity, p.id]);
                    itemCreds += `⏳ **${p.name}:** Pending manual fulfillment.\n`;
                }
            }
            combinedEmailBody += itemCreds + "\n---\n";
            combinedTelegramBody += itemCreds + "\n";
        }

        // A. Email Delivery to User
        if (user.email) {
            await sendAuditReport(user.email, "Order #" + newOrder.orderId, {
                da: "ORDER CONFIRMED",
                pa: isBulk ? "Multiple Items" : product.name,
                links: Number(amountToCharge || 0),
                details: combinedEmailBody
            }, settings);
        }

        // B. Telegram Delivery
        if (user.telegram && settings.telegramToken) {
            await sendTelegramMessage(user.telegram, combinedTelegramBody, settings.telegramToken);
        }

        return NextResponse.json({ success: true, orderId: newOrder.orderId });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown Checkout Error" }, { status: 500 });
    }
}
