import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/lib/db';

// Webhook Secrets (Should match what user puts in G2G Dashboard)
const ORDER_WEBHOOK_SECRET = process.env.ORDER_WEBHOOK_SECRET || "t0kQkpU6lKhz9P";
const OFFER_WEBHOOK_SECRET = process.env.OFFER_WEBHOOK_SECRET || "s4CheGaCDqiso";

export async function POST(request: Request) {
    const rawBody = await request.text();
    const signature = request.headers.get('g2g-signature') || request.headers.get('x-g2g-signature');

    // Choose secret based on event type in body
    let data;
    try {
        data = JSON.parse(rawBody);
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const eventType = data.event_type || '';
    const secret = eventType.startsWith('order.') ? ORDER_WEBHOOK_SECRET : OFFER_WEBHOOK_SECRET;

    // Verify Signature
    if (signature) {
        const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
        if (expectedSignature !== signature) {
            console.error("G2G Webhook: Invalid Signature");
            return NextResponse.json({ error: 'Invalid Signature' }, { status: 401 });
        }
    }

    try {
        // Ensure table exists
        await query(`
            CREATE TABLE IF NOT EXISTS g2g_orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id VARCHAR(100) UNIQUE,
                event_type VARCHAR(50),
                product_name TEXT,
                buyer_name VARCHAR(255),
                amount DECIMAL(10,2),
                currency VARCHAR(10),
                status VARCHAR(50),
                raw_payload JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        if (eventType.startsWith('order.')) {
            const payload = data.payload || {};
            const orderId = payload.order_id;

            // Insert or Update G2G Order
            await query(`
                INSERT INTO g2g_orders (order_id, event_type, product_name, buyer_name, amount, currency, status, raw_payload)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                event_type = VALUES(event_type),
                status = VALUES(status),
                raw_payload = VALUES(raw_payload),
                updated_at = CURRENT_TIMESTAMP
            `, [
                orderId,
                eventType,
                payload.product_name || '',
                payload.display_name || '',
                payload.total_price || 0,
                payload.currency || 'USD',
                payload.order_status || 'Paid',
                JSON.stringify(payload)
            ]);

            console.log(`G2G Order Webhook: ${eventType} for Order ${orderId}`);
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("G2G Webhook Error:", e.message);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
