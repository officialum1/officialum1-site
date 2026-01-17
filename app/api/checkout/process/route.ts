import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { sendAuditReport } from '@/lib/email';
import { query } from '@/lib/db';

// Paths
const PRODUCTS_PATH = path.join(process.cwd(), 'data', 'products.json');
const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');
const ORDERS_PATH = path.join(process.cwd(), 'data', 'orders.json');
const SETTINGS_PATH = path.join(process.cwd(), 'data', 'settings.json');

// Helper to load JSON
async function load(filePath: string) {
    try { return JSON.parse(await fs.readFile(filePath, 'utf8')); } catch { return []; }
}

async function getSettings() {
    try {
        const rows = await query("SELECT * FROM settings");
        // Convert rows array to a single object
        if (Array.isArray(rows)) {
            return rows.reduce((acc: any, row: any) => {
                acc[row.key] = row.value;
                return acc;
            }, {});
        }
        return {};
    } catch (e) {
        console.error("Failed to load settings from DB:", e);
        return {};
    }
}

// Simulated Telegram Alert
async function sendTelegramAlert(token: string, chatId: string, message: string) {
    if (!token || !chatId) return;
    try {
        // In real app: fetch(`https://api.telegram.org/bot${token}/sendMessage`, { body: ... })
        console.log(`[Telegram] Sending to ${chatId}: ${message}`);
    } catch { }
}

export async function POST(req: Request) {
    try {
        const { userId, productId, method, guestEmail, promoCode, finalPrice } = await req.json();

        // 1. Load Data
        const products = await load(PRODUCTS_PATH);
        const users = await load(USERS_PATH);
        const orders = await load(ORDERS_PATH);
        const settings = await getSettings();

        const product = products.find((p: any) => p.id.toString() === productId.toString());

        // Handle User (Registered or Guest)
        let user: any = null;
        if (userId === 'guest') {
            user = { id: 'guest', email: guestEmail, telegram: null };
        } else {
            user = users.find((u: any) => u.id.toString() === userId.toString());
        }

        if (!product || !user) return NextResponse.json({ error: "Invalid Request" }, { status: 400 });

        // Calculate Amount to Charge
        const amountToCharge = finalPrice ? finalPrice : product.price; // Use discounted price if valid

        // 2. Process Payment
        let paymentUrl = null;
        let orderStatus = 'pending'; // Default to pending, NOT paid

        // A. STRIPE
        if (method === 'stripe') {
            if (!settings.stripeSecret) throw new Error("Stripe is not configured by Admin.");
            try {
                const params = new URLSearchParams();
                params.append('payment_method_types[]', 'card');
                params.append('line_items[0][price_data][currency]', 'usd');
                params.append('line_items[0][price_data][product_data][name]', product.name + (promoCode ? ` (Promo: ${promoCode})` : ''));
                params.append('line_items[0][price_data][unit_amount]', (parseFloat(amountToCharge) * 100).toFixed(0)); // Convert to cents
                params.append('line_items[0][quantity]', '1');
                params.append('mode', 'payment');
                params.append('success_url', `${req.headers.get('origin')}/order-success?session_id={CHECKOUT_SESSION_ID}&orderId=${Date.now()}`);
                params.append('cancel_url', `${req.headers.get('origin')}/checkout?id=${productId}`);

                const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${settings.stripeSecret}`, 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: params
                });
                const stripeData = await stripeRes.json();
                if (stripeData.error) throw new Error(stripeData.error.message);
                if (stripeData.url) { paymentUrl = stripeData.url; orderStatus = 'pending'; }
            } catch (err: any) { throw new Error("Stripe Error: " + err.message); }
        }

        // B. CRYPTOMUS
        // PRIORITY: Database > Env Var > Settings File
        const cryptoKey = (settings.cryptomusKey && settings.cryptomusKey !== '...') ? settings.cryptomusKey : (process.env.CRYPTOMUS_API_KEY || settings.cryptomusKey);
        const cryptoId = (settings.cryptomusId && settings.cryptomusId !== '...') ? settings.cryptomusId : (process.env.CRYPTOMUS_MERCHANT_ID || settings.cryptomusId);

        if (method === 'cryptomus') {
            if (!cryptoKey || !cryptoId) throw new Error("Cryptomus is not configured by Admin.");
            try {
                const crypto = require('crypto');
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

                // Ensure payload is properly formatted for signature
                // Cryptomus requires: MD5(Base64(JSON_STRING) + API_KEY)
                // IMPORTANT: Node's JSON.stringify doesn't escape slashes, but PHP's json_encode does.
                // Cryptomus expects escaped slashes (e.g. "https:\/\/")
                const jsonPayload = JSON.stringify(payload).replace(/\//g, '\\/');

                // Encode to Base64 (handling UTF-8)
                const dataBase64 = Buffer.from(jsonPayload).toString('base64');
                const sign = crypto.createHash('md5').update(dataBase64 + cryptoKey).digest('hex');

                console.log("[Cryptomus Debug] Payload:", jsonPayload);
                console.log("[Cryptomus Debug] Sign:", sign);

                const cryptoRes = await fetch('https://api.cryptomus.com/v1/payment', {
                    method: 'POST',
                    headers: {
                        'merchant': cryptoId,
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
                    // Pass specific error to frontend
                    const errorMsg = cryptoData.message || JSON.stringify(cryptoData);
                    throw new Error("Cryptomus Error: " + errorMsg);
                }
            } catch (e: any) {
                console.error('Cryptomus Error Details:', e);
                // Return the clean error message to the user
                throw new Error(e.message || "Cryptomus Payment Failed");
            }
        }

        // C. BINANCE PAY
        if (method === 'binance') {
            if (!settings.binanceKey || !settings.binanceSecret) throw new Error("Binance Pay is not configured.");
            try {
                const crypto = require('crypto');
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
                const signature = crypto.createHmac('sha512', settings.binanceSecret).update(payload).digest('hex').toUpperCase();

                const binanceRes = await fetch('https://bpay.binanceapi.com/binancepay/openapi/v2/order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'BinancePay-Timestamp': timestamp.toString(),
                        'BinancePay-Nonce': nonce,
                        'BinancePay-Certificate-SN': settings.binanceKey,
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

        // CRITICAL CHECK: If not free, MUST have a payment URL
        if (parseFloat(amountToCharge) > 0 && !paymentUrl) {
            throw new Error("Payment Gateway Initialization Failed. Please check Admin Settings.");
        }

        // If amount is 0, status is paid immediately
        if (parseFloat(amountToCharge) === 0) {
            orderStatus = 'paid';
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
            date: new Date()
        };

        // Save to Hostinger Database
        try {
            await query(`
                INSERT INTO orders (orderId, userId, guestEmail, productId, amount, originalPrice, promoCode, method, status, date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                newOrder.date
            ]);
        } catch (dbError) {
            console.error("Failed to save order to Database:", dbError);
            // Continue processed because payment might be successful
        }

        if (paymentUrl) return NextResponse.json({ success: true, paymentUrl, orderId: newOrder.orderId });

        // 4. DELIVERY AUTOMATION
        let emailBody = "";
        let telegramBody = "";

        if (product.type === 'service') {
            emailBody = `Thank you for your purchase!\n\nWe have received your order for ${product.name}.\nOur team will begin processing your boost shortly.\nYou will receive updates via email or Telegram.`;
            telegramBody = `Order Confirmed: ${product.name}\n\nStatus: Processing\nWe will update you soon!`;
        } else {
            const credentials = product.creds || "Contact Support for Access";
            emailBody = `Your Credentials:\n\n${credentials}\n\nPlease change your passwords immediately.`;
            telegramBody = `Thanks for buying ${product.name}!\n\nHere are your details:\n${credentials}`;
        }

        // A. Email Delivery
        if (user.email) {
            console.log(`[Email] Sending order update to ${user.email}`);
            await sendAuditReport(user.email, "Order #" + newOrder.orderId, {
                da: "ORDER CONFIRMED",
                pa: product.name,
                links: amountToCharge, // Using amount as 'links' placeholder
                details: emailBody
            }, settings);
        }

        // B. Telegram Delivery
        if (user.telegram && settings.telegramToken) {
            await sendTelegramAlert(settings.telegramToken, user.telegram, telegramBody);
        }

        return NextResponse.json({ success: true, orderId: newOrder.orderId });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown Checkout Error" }, { status: 500 });
    }
}
