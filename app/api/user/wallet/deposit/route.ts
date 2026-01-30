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

        if (!userId || !amount || !method) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const orderId = `DEP-${Date.now()}`;
        let paymentUrl = null;

        // 1. STRIPE
        if (method === 'stripe') {
            const stripeSecret = (settings.stripeSecret && settings.stripeSecret !== '...') ? settings.stripeSecret : process.env.STRIPE_SECRET_KEY;
            if (!stripeSecret) throw new Error("Stripe is not configured.");

            const params = new URLSearchParams();
            params.append('payment_method_types[]', 'card');
            params.append('line_items[0][price_data][currency]', 'usd');
            params.append('line_items[0][price_data][product_data][name]', 'Wallet Top-up');
            params.append('line_items[0][price_data][unit_amount]', (parseFloat(amount) * 100).toFixed(0));
            params.append('line_items[0][quantity]', '1');
            params.append('mode', 'payment');
            // We'll use metadata to identify the deposit on checkout.session.completed
            params.append('metadata[userId]', userId);
            params.append('metadata[type]', 'deposit');
            params.append('metadata[amount]', amount.toString());

            params.append('success_url', `${req.headers.get('origin')}/dashboard?success=true&orderId=${orderId}`);
            params.append('cancel_url', `${req.headers.get('origin')}/dashboard`);

            const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${stripeSecret}`, 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            });
            const stripeData = await stripeRes.json();
            if (stripeData.error) throw new Error(stripeData.error.message);
            paymentUrl = stripeData.url;
        }

        // 2. CRYPTOMUS
        if (method === 'cryptomus') {
            const cryptoKey = (settings.cryptomusKey && settings.cryptomusKey !== '...') ? settings.cryptomusKey : process.env.CRYPTOMUS_API_KEY;
            const cryptoId = (settings.cryptomusId && settings.cryptomusId !== '...') ? settings.cryptomusId : process.env.CRYPTOMUS_MERCHANT_ID;
            if (!cryptoKey || !cryptoId) throw new Error("Cryptomus is not configured.");

            const payload = {
                amount: amount.toString(),
                currency: "USD",
                order_id: orderId,
                url_callback: `${req.headers.get('origin')}/api/webhooks/cryptomus`,
                url_return: `${req.headers.get('origin')}/dashboard?orderId=${orderId}`,
                url_success: `${req.headers.get('origin')}/dashboard?success=true&orderId=${orderId}`,
                is_payment_multiple: true,
                lifetime: 3600,
                to_currency: "USDT",
                additional_data: JSON.stringify({ userId, type: 'deposit', amount })
            };

            const jsonPayload = JSON.stringify(payload);
            const dataBase64 = Buffer.from(jsonPayload).toString('base64');
            const sign = crypto.createHash('md5').update(dataBase64 + cryptoKey.trim()).digest('hex');

            const cryptoRes = await fetch('https://api.cryptomus.com/v1/payment', {
                method: 'POST',
                headers: {
                    'merchant': cryptoId.trim(),
                    'sign': sign,
                    'Content-Type': 'application/json'
                },
                body: jsonPayload
            });
            const cryptoData = await cryptoRes.json();
            if (cryptoData.result && cryptoData.result.url) {
                paymentUrl = cryptoData.result.url;
            } else {
                throw new Error("Cryptomus Error: " + (cryptoData.message || JSON.stringify(cryptoData)));
            }
        }

        if (!paymentUrl) throw new Error("Payment Gateway failed to initialize.");

        // We create a "pending" transaction or order for the deposit if we want to track it
        await query("INSERT INTO orders (orderId, userId, amount, method, status, date) VALUES (?, ?, ?, ?, 'pending', NOW())",
            [orderId, userId, amount, method]);

        return NextResponse.json({ success: true, paymentUrl, orderId });

    } catch (e: any) {
        console.error("Deposit Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
