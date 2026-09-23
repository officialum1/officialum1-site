import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

async function getSettings() {
    const rows = await query("SELECT setting_key, setting_value FROM settings") as any[];
    if (Array.isArray(rows)) {
        return rows.reduce((acc: any, row: any) => {
            acc[row.setting_key] = row.setting_value;
            return acc;
        }, {});
    }
    return {};
}

export async function POST(req: Request) {
    try {
        const { userId, amount, method } = await req.json();
        const settings = await getSettings();

        if (!userId) return NextResponse.json({ error: "Missing required field: userId" }, { status: 400 });
        if (!amount) return NextResponse.json({ error: "Missing required field: amount" }, { status: 400 });
        if (!method) return NextResponse.json({ error: "Missing required field: method" }, { status: 400 });

        const orderId = `DEP-${Date.now()}`;
        let paymentUrl = null;

        // 1. STRIPE
        if (method === 'stripe') {
            const stripeSecret = (settings.stripeSecret && settings.stripeSecret !== '...' ? settings.stripeSecret : process.env.STRIPE_SECRET_KEY || '').trim();
            if (!stripeSecret) throw new Error("Stripe is not configured correctly.");

            // Add 2.9% Fee for Stripe
            const originalAmount = parseFloat(amount);
            const fee = originalAmount * 0.029;
            const finalAmount = originalAmount + fee;

            const origin = req.headers.get('origin') || 'https://officialum1.com';
            const params = new URLSearchParams();
            params.append('payment_method_types[]', 'card');
            params.append('line_items[0][price_data][currency]', 'usd');
            params.append('line_items[0][price_data][product_data][name]', 'Wallet Top-up (Inc. 2.9% Fee)');
            params.append('line_items[0][price_data][unit_amount]', (finalAmount * 100).toFixed(0));
            params.append('line_items[0][quantity]', '1');
            params.append('mode', 'payment');
            params.append('metadata[userId]', userId);
            params.append('metadata[type]', 'deposit');
            params.append('metadata[amount]', amount.toString());

            params.append('success_url', `${origin}/dashboard?success=true&orderId=${orderId}`);
            params.append('cancel_url', `${origin}/dashboard`);

            const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${stripeSecret}`, 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            });
            const stripeData = await stripeRes.json();
            if (stripeData.error) {
                console.error("Stripe Deposit Error:", stripeData.error);
                throw new Error(stripeData.error.message);
            }
            paymentUrl = stripeData.url;
        }

        // 2. CRYPTOMUS
        if (method === 'cryptomus') {
            const cryptoKey = (settings.cryptomusKey && settings.cryptomusKey !== '...' ? settings.cryptomusKey : process.env.CRYPTOMUS_API_KEY || '').trim();
            const cryptoId = (settings.cryptomusId && settings.cryptomusId !== '...' ? settings.cryptomusId : process.env.CRYPTOMUS_MERCHANT_ID || '').trim();
            if (!cryptoKey || !cryptoId) throw new Error("Cryptomus is not configured correctly.");

            const origin = req.headers.get('origin') || 'https://officialum1.com';
            const payload = {
                amount: amount.toString(),
                currency: "USD",
                order_id: orderId,
                url_callback: `${origin}/api/webhooks/cryptomus`,
                url_return: `${origin}/dashboard?orderId=${orderId}`,
                url_success: `${origin}/dashboard?success=true&orderId=${orderId}`,
                is_payment_multiple: true,
                lifetime: 3600,
                to_currency: "USDT",
                additional_data: JSON.stringify({ userId, type: 'deposit', amount })
            };

            const jsonPayload = JSON.stringify(payload);
            const dataBase64 = Buffer.from(jsonPayload).toString('base64');
            const sign = crypto.createHash('md5').update(dataBase64 + cryptoKey).digest('hex');

            const cryptoRes = await fetch('https://api.cryptomus.com/v1/payment', {
                method: 'POST',
                headers: {
                    'merchant': cryptoId,
                    'sign': sign,
                    'Content-Type': 'application/json'
                },
                body: jsonPayload
            });
            const cryptoData = await cryptoRes.json();
            if (cryptoData.result && cryptoData.result.url) {
                paymentUrl = cryptoData.result.url;
            } else {
                console.error("Cryptomus Deposit Error:", cryptoData);
                throw new Error("Cryptomus Error: " + (cryptoData.message || "Failed to initialize"));
            }
        }

        // 3. BINANCE PAY
        if (method === 'binance') {
            const binanceKey = (settings.binanceKey && settings.binanceKey !== '...' ? settings.binanceKey : process.env.BINANCE_API_KEY || '').trim();
            const binanceSecret = (settings.binanceSecret && settings.binanceSecret !== '...' ? settings.binanceSecret : process.env.BINANCE_SECRET_KEY || '').trim();

            if (!binanceKey || !binanceSecret) throw new Error("Binance Pay is not configured correctly.");

            const origin = req.headers.get('origin') || 'https://officialum1.com';
            const requestBody = JSON.stringify({
                env: { terminalType: "WEB" },
                merchantTradeNo: orderId,
                orderAmount: parseFloat(amount).toFixed(2),
                currency: "USDT",
                goods: {
                    goodsType: "01",
                    goodsCategory: "Z000",
                    referenceGoodsId: "deposit",
                    goodsName: "Wallet Top-up",
                    goodsDetail: `Deposit for User ${userId}`
                },
                returnUrl: `${origin}/dashboard?success=true&orderId=${orderId}`,
                cancelUrl: `${origin}/dashboard`
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
                    'BinancePay-Signature': signature,
                    'BinancePay-Certificate-SN': binanceKey
                },
                body: requestBody
            });
            const binanceData = await binanceRes.json();
            if (binanceData.status === 'SUCCESS' && binanceData.data && binanceData.data.checkoutUrl) {
                paymentUrl = binanceData.data.checkoutUrl;
            } else {
                console.error("Binance Deposit Error:", binanceData);
                throw new Error("Binance Error: " + (binanceData.errorMessage || "Failed to initialize"));
            }
        }

        if (!paymentUrl) throw new Error("Payment Gateway failed to initialize.");

        // We create a "pending" transaction or order for the deposit if we want to track it
        await query("INSERT INTO orders (orderId, userId, amount, method, status, date) VALUES (?, ?, ?, ?, 'pending', NOW())",
            [orderId, userId, amount, method]);

        try {
            const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'Unknown IP';
            await query("INSERT INTO activity_logs (user, action, details, date) VALUES (?, ?, ?, NOW())",
                [`User #${userId}`, `DEPOSIT_CLICK_${method.toUpperCase()}`, `Wallet Top-Up Click: $${amount} USD via ${method.toUpperCase()} | Deposit #${orderId} | IP: ${ip}`]);
        } catch (logErr) {}

        return NextResponse.json({ success: true, paymentUrl, orderId });

    } catch (e: any) {
        console.error("Deposit Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
