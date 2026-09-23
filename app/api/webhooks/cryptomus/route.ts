import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { fulfillOrder } from '@/lib/payment';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        const body = JSON.parse(rawBody);
        const { sign, ...data } = body;

        if (!sign) return NextResponse.json({ error: "No signature" }, { status: 400 });

        const settingsRows: any = await query("SELECT setting_value FROM settings WHERE setting_key = 'cryptomusKey'");
        const cryptoKey = (settingsRows[0]?.setting_value || process.env.CRYPTOMUS_API_KEY || '').trim();

        if (!cryptoKey) return NextResponse.json({ error: "Cryptomus not configured" }, { status: 500 });

        // Verify Signature
        // Cryptomus specific: The signature is MD5(base64(JSON_WITHOUT_SIGN) + api_key)
        // We use the same JSON parser but we must ensure no extra whitespace/ordering issues.
        // Usually, Cryptomus webhook payloads are simple and consistent.
        const jsonPayload = JSON.stringify(data);
        const dataBase64 = Buffer.from(jsonPayload).toString('base64');
        const calculatedSign = crypto.createHash('md5').update(dataBase64 + cryptoKey).digest('hex');

        if (sign !== calculatedSign) {
            console.error("[Cryptomus] Invalid Signature", {
                received: sign,
                expected: calculatedSign,
                orderId: data.order_id
            });
            // Some versions of Cryptomus sign the raw body differently. 
            // If this fails, we might need a different approach, but this matches their docs.
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const status = data.status;
        const orderId = data.order_id;

        console.log(`[Cryptomus Webhook] Status: ${status}, Order: ${orderId}`);

        if (status === 'paid' || status === 'paid_over') {
            await fulfillOrder(orderId);
            try {
                await query("INSERT INTO activity_logs (user, action, details, date) VALUES (?, ?, ?, NOW())",
                    [`Order #${orderId}`, 'PAYMENT_SUCCESS_CRYPTOMUS', `Cryptomus Payment Verified: $${data.amount || '0'} ${data.currency || 'USD'} (Status: ${status})`]);
            } catch (lErr) {}
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Cryptomus Webhook Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
