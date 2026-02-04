import { NextResponse } from 'next/server';
import { sendAuditReport } from '@/lib/email';
import { query, getConnection, withTransaction } from '@/lib/db';
import { sendTelegramMessage, sendTelegramAdminAlert } from '@/lib/telegram';
import crypto from 'crypto';

async function getSettings() {
    try {
        const rows = await query("SELECT setting_key, setting_value FROM settings") as any[];
        if (Array.isArray(rows)) {
            return rows.reduce((acc: any, row: any) => {
                acc[row.setting_key] = row.setting_value;
                return acc;
            }, {});
        }
        return {};
    } catch (e: unknown) {
        console.error("Failed to load settings from DB:", e);
        throw new Error("Database Configuration Error");
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

        const PLANS: any = {
            silver: { name: 'Silver VIP Membership', price: '9.99', platform: 'VIP', id: 'm1' },
            gold: { name: 'Gold VIP Membership', price: '24.99', platform: 'VIP', id: 'm2' },
            diamond: { name: 'Diamond VIP Membership', price: '49.99', platform: 'VIP', id: 'm3' }
        };

        if (membershipPlan) {
            product = PLANS[membershipPlan];
            if (!product) throw new Error("Invalid membership plan.");
            amountToCharge = product.price;
            safeQuantity = 1;
        } else if (!isBulk) {
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
            amountToCharge = (unitPrice * q).toFixed(2);
        } else {
            // SECURITY: Never trust client-side prices. Re-fetch from DB.
            let verifiedTotal = 0;
            const itemIds = cartItems.map((item: any) => item.id);
            if (itemIds.length === 0) throw new Error("Cart is empty");

            const placeholders = itemIds.map(() => '?').join(',');
            const dbProducts = await query(`SELECT id, price, sale_price, sale_ends_at FROM products WHERE id IN (${placeholders})`, itemIds) as any[];

            for (const item of cartItems) {
                const dbProd = dbProducts.find(p => p.id === item.id);
                if (!dbProd) throw new Error(`Product ${item.name} no longer available.`);

                let currentPrice = parseFloat(dbProd.price);
                if (dbProd.sale_price && dbProd.sale_ends_at && new Date(dbProd.sale_ends_at) > new Date()) {
                    currentPrice = parseFloat(dbProd.sale_price);
                }

                verifiedTotal += currentPrice * (item.quantity || 1);
            }

            amountToCharge = verifiedTotal.toFixed(2);
            product = { name: "Bulk Cart Purchase", id: 0, platform: "Multiple", price: amountToCharge };
        }

        // Coupon Validation
        if (promoCode) {
            const couponRows: any = await query("SELECT * FROM coupons WHERE code = ? AND status = 'active'", [promoCode]);
            if (couponRows.length > 0) {
                const coupon = couponRows[0];
                const baseAmount = parseFloat(amountToCharge);
                if (!(coupon.expiry && new Date(coupon.expiry) < new Date()) && baseAmount >= parseFloat(coupon.min_amount)) {
                    const discount = coupon.type === 'percent' ? baseAmount * (parseFloat(coupon.value) / 100) : parseFloat(coupon.value);
                    amountToCharge = Math.max(0, baseAmount - discount).toFixed(2);
                }
            }
        }

        // Security Check
        if (finalPrice && Math.abs(parseFloat(finalPrice) - parseFloat(amountToCharge)) > 0.05) {
            return NextResponse.json({ error: "Price discrepancy detected." }, { status: 400 });
        }

        let user: any = null;
        if (userId === 'guest') {
            user = { id: 'guest', email: guestEmail };
        } else {
            const userRows = await query("SELECT id, email, telegram FROM users WHERE id = ?", [userId]) as any[];
            if (userRows.length > 0) user = userRows[0];
        }
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 400 });

        let paymentUrl = null;
        let orderStatus = 'pending';

        // Payment Gateways (Strict Env Vars)
        if (method === 'stripe') {
            const stripeSecret = process.env.STRIPE_SECRET_KEY;
            if (!stripeSecret) throw new Error("Config Error: STRIPE_SECRET_KEY missing.");

            const params = new URLSearchParams();
            params.append('payment_method_types[]', 'card');
            params.append('line_items[0][price_data][currency]', 'usd');
            params.append('line_items[0][price_data][product_data][name]', isBulk ? `Cart Purchase` : `${product.name} (x${safeQuantity})`);
            params.append('line_items[0][price_data][unit_amount]', (parseFloat(amountToCharge) * 100).toFixed(0));
            params.append('line_items[0][quantity]', '1');
            params.append('mode', 'payment');
            params.append('success_url', `${req.headers.get('origin')}/order-success?orderId=${orderId}`);
            params.append('cancel_url', `${req.headers.get('origin')}/checkout`);

            const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${stripeSecret}`, 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            });
            const stripeData = await stripeRes.json();
            if (stripeData.url) paymentUrl = stripeData.url;
        } else if (method === 'cryptomus') {
            const cryptoKey = process.env.CRYPTOMUS_API_KEY;
            const cryptoId = process.env.CRYPTOMUS_MERCHANT_ID;
            if (!cryptoKey || !cryptoId) throw new Error("Config Error: Cryptomus credentials missing.");

            const payload = {
                amount: amountToCharge,
                currency: "USD",
                order_id: orderId,
                url_callback: `${req.headers.get('origin')}/api/webhooks/cryptomus`,
                url_return: `${req.headers.get('origin')}/order-success`,
                is_payment_multiple: true
            };
            const dataBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
            const sign = crypto.createHash('md5').update(dataBase64 + cryptoKey).digest('hex');

            const cryptoRes = await fetch('https://api.cryptomus.com/v1/payment', {
                method: 'POST',
                headers: { 'merchant': cryptoId, 'sign': sign, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const cryptoData = await cryptoRes.json();
            if (cryptoData.result?.url) paymentUrl = cryptoData.result.url;
        } else if (method === 'binance') {
            const binanceKey = process.env.BINANCE_API_KEY;
            const binanceSecret = process.env.BINANCE_SECRET_KEY;
            if (!binanceKey || !binanceSecret) throw new Error("Config Error: Binance credentials missing.");

            const requestBody = JSON.stringify({
                env: { terminalType: "WEB" },
                merchantTradeNo: orderId,
                orderAmount: parseFloat(amountToCharge).toFixed(2),
                currency: "USDT",
                goods: { goodsType: "01", goodsCategory: "Z000", referenceGoodsId: product.id, goodsName: product.name },
                returnUrl: `${req.headers.get('origin')}/order-success`,
                cancelUrl: `${req.headers.get('origin')}/checkout`
            });
            const timestamp = Date.now();
            const nonce = crypto.randomBytes(16).toString('hex');
            const signature = crypto.createHmac('sha512', binanceSecret).update(`${timestamp}\n${nonce}\n${requestBody}\n`).digest('hex').toUpperCase();

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
            if (binanceData.data?.checkoutUrl) paymentUrl = binanceData.data.checkoutUrl;
        } else if (method === 'wallet') {
            if (userId === 'guest') throw new Error("Wallet not available for guests.");

            await withTransaction(async (conn) => {
                const [userRows]: any = await conn.execute("SELECT wallet_balance FROM users WHERE id = ? FOR UPDATE", [userId]);
                const balance = parseFloat(userRows[0]?.wallet_balance || 0);

                if (balance < parseFloat(amountToCharge)) throw new Error("Insufficient balance.");

                await conn.execute("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?", [amountToCharge, userId]);
                await conn.execute("INSERT INTO wallet_transactions (user_id, amount, type, description) VALUES (?, ?, 'purchase', ?)",
                    [userId, amountToCharge, isBulk ? "Cart Purchase" : `Purchase: ${product.name}`]);

                if (membershipPlan) {
                    await conn.execute("UPDATE users SET membership = ?, membership_expires = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE id = ?", [membershipPlan, userId]);
                }

                await conn.execute("UPDATE users SET total_spent = total_spent + ?, points = points + ? WHERE id = ?",
                    [amountToCharge, Math.floor(parseFloat(amountToCharge)), userId]);

                await conn.execute(`
                    INSERT INTO orders (orderId, userId, guestEmail, productId, amount, originalPrice, promoCode, method, status, quantity)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?)
                `, [orderId, userId, user.email, isBulk ? 0 : product.id, amountToCharge, product.price || amountToCharge, promoCode || null, method, isBulk ? cartItems.length : safeQuantity]);
            });
            orderStatus = 'paid';
        }

        if (parseFloat(amountToCharge) > 0 && !paymentUrl && method !== 'wallet') {
            throw new Error("Payment Gateway initialization failed.");
        }
        if (parseFloat(amountToCharge) === 0) orderStatus = 'paid';

        // Create Order in DB (if not already created by wallet logic)
        if (method !== 'wallet') {
            await query(`
                INSERT INTO orders (orderId, userId, guestEmail, productId, amount, originalPrice, promoCode, method, status, quantity)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [orderId, userId, user.email || guestEmail, isBulk ? 0 : product.id, amountToCharge, product.price || amountToCharge, promoCode || null, method, orderStatus, isBulk ? cartItems.length : safeQuantity]);
        }

        // Handle Fulfillment if paid
        if (orderStatus === 'paid') {
            try {
                const recipientEmail = user.email || guestEmail;

                // 1. VIP Membership
                if (membershipPlan) {
                    const planName = PLANS[membershipPlan]?.name || "VIP Membership";
                    await sendAuditReport(recipientEmail, "VIP Access Activated!", {
                        pa: planName,
                        details: `Welcome to the elite! Your ${planName} is now active. Refresh your dashboard to see your new pricing.`
                    }, settings);
                }
                // 2. Single Product (Most Common)
                else if (!isBulk) {
                    const pRows: any = await query("SELECT name FROM products WHERE id = ?", [productId]);
                    const pName = pRows[0]?.name;

                    if (pName) {
                        // Check Stock
                        const stockRows: any = await query("SELECT * FROM inventory WHERE name = ? AND status = 'In Stock' LIMIT ?", [pName, safeQuantity]);

                        // Full Fulfillment
                        if (stockRows.length >= safeQuantity) {
                            let combinedCreds = "";
                            const soldIds = [];

                            for (const stock of stockRows) {
                                await query("UPDATE inventory SET status = 'Sold' WHERE id = ?", [stock.id]);
                                const creds = JSON.parse(stock.accountDetails || '{}');
                                // Format: user:pass:email (if available)
                                const line = `${creds.email || creds.username}:${creds.password}${creds.extraInfo ? ` (${creds.extraInfo})` : ''}`;
                                combinedCreds += line + "\n";
                                soldIds.push(stock.id);
                            }

                            // Create Delivery Token
                            const token = Math.random().toString(36).substring(2, 10);
                            await query("INSERT INTO deliveries (token, orderId, itemName, details) VALUES (?, ?, ?, ?)",
                                [token, orderId, pName, JSON.stringify({ accounts: combinedCreds, inventoryIds: soldIds })]);

                            // Mark Complete
                            await query("UPDATE orders SET status = 'completed', delivery_details = ? WHERE orderId = ?", [combinedCreds, orderId]);

                            // Send Email
                            await sendAuditReport(recipientEmail, `Order Delivered: ${pName}`, {
                                pa: pName,
                                details: combinedCreds
                            }, settings);
                        } else {
                            // Partial/No Stock - Send Receipt
                            const { sendEmail } = require('@/lib/email'); // Lazy import helper
                            await sendEmail({
                                to: recipientEmail,
                                subject: `Order Received: ${pName}`,
                                html: `
                                    <div style="font-family: sans-serif; padding: 20px; background: #111; color: #fff;">
                                        <h2>Order Confirmed</h2>
                                        <p>Thank you for purchasing <strong>${pName}</strong>.</p>
                                        <p>We are currently establishing the secure connection to deliver your goods. You will receive a separate email with your credentials shortly.</p>
                                        <p>Order ID: ${orderId}</p>
                                    </div>
                                `
                            });
                        }
                    }
                }
                // 3. Bulk Order
                else if (isBulk) {
                    const { sendEmail } = require('@/lib/email');
                    await sendEmail({
                        to: recipientEmail,
                        subject: `Bulk Order Confirmed: #${orderId}`,
                        html: `
                            <div style="font-family: sans-serif; padding: 20px; background: #111; color: #fff;">
                                <h2>Bulk Order Received</h2>
                                <p>Thank you for your bulk purchase of <strong>${cartItems.length} items</strong>.</p>
                                <p>Total Paid: $${amountToCharge}</p>
                                <p>Your items are being prepared and will be delivered via email shortly.</p>
                            </div>
                        `
                    });
                }

                // 4. Referral Commission (Automatic Payout)
                if (user && user.id !== 'guest') {
                    const refRows: any = await query("SELECT referred_by, email FROM users WHERE id = ?", [user.id]);
                    if (refRows.length > 0 && refRows[0].referred_by) {
                        const referrerId = refRows[0].referred_by;
                        const commission = (parseFloat(amountToCharge) * 0.05).toFixed(2); // 5%

                        if (parseFloat(commission) > 0) {
                            // Credit Referrer
                            await query("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?", [commission, referrerId]);
                            await query("INSERT INTO wallet_transactions (user_id, amount, type, description) VALUES (?, ?, 'referral', ?)",
                                [referrerId, commission, `Commission from Order #${orderId}`]);

                            console.log(`💰 Paid $${commission} referral commission to ${referrerId}`);
                        }
                    }
                }

            } catch (err) {
                console.error("Fulfillment Error:", err);
                // Do not fail the request, just log it. The order is paid.
            }
        }
        return NextResponse.json({ success: true, paymentUrl, orderId });

    } catch (e: any) {
        console.error("Checkout Process Error:", e);
        return NextResponse.json({ error: e.message || "Internal Error" }, { status: 500 });
    }
}
