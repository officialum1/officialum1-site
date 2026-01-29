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
        const { userId, productId, method, guestEmail, promoCode, finalPrice, quantity = 1 } = await req.json();

        // 1. Load Settings
        const settings = await getSettings();

        // 2. Fetch Product from DB
        const productRows = await query("SELECT * FROM products WHERE id = ?", [productId]) as any[];
        const product = productRows[0];

        // Create/Get User Object
        let user: any = null;

        if (userId === 'guest') {
            user = { id: 'guest', email: guestEmail, telegram: null };
        } else {
            // Fetch from DB
            const userRows = await query("SELECT id, email, telegram FROM users WHERE id = ?", [userId]) as any[];
            if (userRows.length > 0) {
                user = userRows[0];
            }
        }

        if (!product || !user) return NextResponse.json({ error: "Invalid Request: User or Product not found" }, { status: 400 });

        // Calculate Amount to Charge (With Flash Sale Logic)
        const safeQuantity = parseInt(quantity as string, 10) || 1;
        let unitPrice = parseFloat(product.price);

        // Check Flash Sale
        if (product.sale_price && product.sale_ends_at) {
            const saleEnd = new Date(product.sale_ends_at);
            if (saleEnd > new Date()) {
                unitPrice = parseFloat(product.sale_price);
            }
        }

        const amountToCharge = finalPrice ? finalPrice : (unitPrice * safeQuantity).toFixed(2);

        // 2. Process Payment
        let paymentUrl = null;
        let orderStatus = 'pending'; // Default to pending, NOT paid

        // A. STRIPE
        const stripeSecret = (settings.stripeSecretKey && settings.stripeSecretKey !== '...')
            ? settings.stripeSecretKey
            : (settings.stripeSecret || process.env.STRIPE_SECRET_KEY); // Fallback to old keys just in case

        if (method === 'stripe') {
            if (!stripeSecret) throw new Error("Stripe is not configured by Admin (Missing Secret Key).");
            try {
                const params = new URLSearchParams();
                params.append('payment_method_types[]', 'card');
                params.append('line_items[0][price_data][currency]', 'usd');
                params.append('line_items[0][price_data][product_data][name]', `${product.name} (x${safeQuantity})` + (promoCode ? ` [${promoCode}]` : ''));
                params.append('line_items[0][price_data][unit_amount]', (parseFloat(amountToCharge) * 100).toFixed(0)); // Total Amount
                params.append('line_items[0][quantity]', '1'); // We are charging the TOTAL as one line item
                params.append('mode', 'payment');
                params.append('success_url', `${req.headers.get('origin')}/order-success?session_id={CHECKOUT_SESSION_ID}&orderId=${Date.now()}`);
                params.append('cancel_url', `${req.headers.get('origin')}/checkout?id=${productId}`);

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
        const cryptoKey = (settings.cryptomusPaymentKey && settings.cryptomusPaymentKey !== '...')
            ? settings.cryptomusPaymentKey
            : (settings.cryptomusKey || process.env.CRYPTOMUS_API_KEY);

        const cryptoId = (settings.cryptomusMerchantId && settings.cryptomusMerchantId !== '...')
            ? settings.cryptomusMerchantId
            : (settings.cryptomusId || process.env.CRYPTOMUS_MERCHANT_ID);

        if (method === 'cryptomus') {
            if (!cryptoKey || !cryptoId) throw new Error("Cryptomus is not configured by Admin.");
            try {
                const payload = {
                    amount: amountToCharge.toString(),
                    currency: "USD",
                    order_id: Date.now().toString(),
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
        const binanceKey = (settings.binanceApiKey && settings.binanceApiKey !== '...') ? settings.binanceApiKey : settings.binanceKey;
        const binanceSecret = (settings.binanceSecretKey && settings.binanceSecretKey !== '...') ? settings.binanceSecretKey : settings.binanceSecret;

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
                [userId, amountToCharge, `Purchase of ${product.name}`]);

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
            orderId: Date.now().toString(),
            userId: user.id,
            guestEmail: userId === 'guest' ? guestEmail : null,
            productId: product.id,
            amount: amountToCharge,
            originalPrice: product.price,
            promoCode: promoCode || null,
            method,
            status: orderStatus,
            quantity: safeQuantity, // ADDED
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
        let emailBody = "";
        let telegramBody = "";
        const deliveredItems: any[] = [];

        if (product.bundle_items) {
            // --- BUNDLE DELIVERY ---
            const bundleIds = JSON.parse(product.bundle_items);
            let bundleCreds = "📦 **BUNDLE CONTENTS:**\n\n";

            for (const bundleId of bundleIds) {
                // Get Product Name
                const subRows: any = await query("SELECT name FROM products WHERE id = ?", [bundleId]);
                if (subRows.length === 0) continue;
                const subName = subRows[0].name;

                // Fetch Stock
                const stockRows: any = await query("SELECT * FROM inventory WHERE name = ? AND status = 'In Stock' LIMIT ?", [subName, safeQuantity]);

                if (stockRows.length < safeQuantity) {
                    bundleCreds += `⚠️ ${subName}: Out of Stock (Contact Support)\n`;
                } else {
                    for (const stockItem of stockRows) {
                        // Mark Sold
                        await query("UPDATE inventory SET status = 'Sold' WHERE id = ?", [stockItem.id]);

                        // Parse Details
                        const details = stockItem.accountDetails ? JSON.parse(stockItem.accountDetails) : {};
                        const creds = details.extraInfo || `${details.email}:${details.password}`;
                        bundleCreds += `✅ **${subName}**:\n${creds}\n\n`;
                        deliveredItems.push({ name: subName, stockId: stockItem.id });
                    }
                }
            }
            emailBody = `Thank you for purchasing the ${product.name} Bundle!\n\n${bundleCreds}\n\nPlease save these details immediately.`;
            telegramBody = `Bundle Order: ${product.name}\n\n${bundleCreds}`;

        } else if (product.type === 'service') {
            emailBody = `Thank you for your purchase!\n\nWe have received your order for ${product.name} (x${safeQuantity}).\nOur team will begin processing your boost shortly.\nYou will receive updates via email or Telegram.`;
            telegramBody = `Order Confirmed: ${product.name} (x${safeQuantity})\n\nStatus: Processing\nWe will update you soon!`;
        } else {
            // --- SINGLE ITEM DYNAMIC DELIVERY ---
            // 1. Try to fetch from Inventory FIRST (Priority)
            const stockRows: any = await query("SELECT * FROM inventory WHERE (name = ? OR platform = ?) AND status = 'In Stock' LIMIT ?", [product.name, product.platform, safeQuantity]);

            if (stockRows.length >= safeQuantity) {
                let dynamicCreds = "";
                for (const stockItem of stockRows) {
                    await query("UPDATE inventory SET status = 'Sold' WHERE id = ?", [stockItem.id]);
                    const details = stockItem.accountDetails ? JSON.parse(stockItem.accountDetails) : {};
                    const creds = details.extraInfo || (details.email ? `Email: ${details.email}\nPass: ${details.password}` : Object.values(details).join(':'));
                    dynamicCreds += `${creds}\n---\n`;
                    deliveredItems.push({ name: product.name, stockId: stockItem.id });
                }

                emailBody = `Your Order Details for ${product.name}:\n\n${dynamicCreds}\n\nThank you for choosing us!`;
                telegramBody = `Order: ${product.name}\n\n${dynamicCreds}`;
            } else if (Number(product.stock || 0) >= safeQuantity) {
                // 2. FALLBACK to Manual Stock (If configured in Catalog)
                // Decrement the manual stock column
                await query("UPDATE products SET stock = stock - ? WHERE id = ?", [safeQuantity, product.id]);

                const credentials = product.creds || "Product purchased! Our team will provide your access via Telegram/Email shortly.";
                emailBody = `Your Order for ${product.name} (x${safeQuantity}) is confirmed!\n\nDetails / Status:\n${credentials}\n\nPlease check your Telegram or wait for further email updates.`;
                telegramBody = `Thanks for buying ${product.name} (x${safeQuantity})!\n\nStatus: Paid & Pending Fulfillment\nDetails:\n${credentials}`;
            } else {
                // 3. Last resort (should not happen if frontend stock check works)
                emailBody = `Thank you for your order. We are currently processing your delivery for ${product.name}. Please contact support with Order ID #${newOrder.orderId}.`;
                telegramBody = `New Order #${newOrder.orderId} for ${product.name}. Manual fulfillment required.`;
            }
        }

        // A. Email Delivery to User
        if (user.email) {
            await sendAuditReport(user.email, "Order #" + newOrder.orderId, {
                da: "ORDER CONFIRMED",
                pa: product.name,
                links: Number(amountToCharge || 0),
                details: emailBody
            }, settings);
        }

        // B. Email Alert to Admin
        const adminEmail = process.env.ADMIN_EMAIL || settings.smtpUser;
        if (adminEmail) {
            await sendAuditReport(adminEmail, "New FREE Order #" + newOrder.orderId, {
                da: "FREE ORDER CLAIMED",
                pa: product.name,
                links: 0,
                details: `Customer: ${user.email} received ${product.name} (x${safeQuantity}) for free.`
            }, settings);
        }

        // C. Telegram Delivery
        if (user.telegram && settings.telegramToken) {
            await sendTelegramMessage(user.telegram, telegramBody, settings.telegramToken);
        }

        return NextResponse.json({ success: true, orderId: newOrder.orderId });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown Checkout Error" }, { status: 500 });
    }
}
