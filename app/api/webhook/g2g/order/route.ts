import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/lib/db';

const WEBHOOK_SECRET = process.env.ORDER_WEBHOOK_SECRET || 't0kQkpU6lKhz9P';

export async function POST(request: Request) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('g2g-signature') || request.headers.get('x-g2g-signature') || '';

        // Verify Signature
        if (WEBHOOK_SECRET && signature) {
            const expectedSignature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');
            // Timing safe comparison recommended but string comparison ok for simple case
            if (expectedSignature !== signature) {
                console.error('Invalid G2G Webhook Signature');
                return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
            }
        }

        const data = JSON.parse(rawBody);
        const eventType = data.event_type;
        const payload = data.payload || {};
        const orderId = payload.order_id; // payload has order_id in G2G webhook

        if (orderId) {
            // Ensure table exists (Lazy migration)
            await query(`
                CREATE TABLE IF NOT EXISTS g2g_orders (
                    order_id VARCHAR(255) PRIMARY KEY,
                    product_name VARCHAR(255),
                    amount DECIMAL(10,2),
                    profit DECIMAL(10,2) DEFAULT 0,
                    status VARCHAR(50),
                    buyer_name VARCHAR(255),
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    raw_data JSON
                )
            `);

            // Map Status from Event Type or Payload
            // event_type: order.created, order.paid, order.completed, order.cancelled
            let status = eventType;
            if (payload.order_status) status = payload.order_status; // Prefer payload status if available

            // Upsert Order
            await query(`
                INSERT INTO g2g_orders (order_id, product_name, amount, status, buyer_name, raw_data)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    product_name = VALUES(product_name),
                    amount = VALUES(amount),
                    status = VALUES(status),
                    buyer_name = VALUES(buyer_name),
                    raw_data = VALUES(raw_data)
            `, [
                orderId,
                payload.product_name || 'N/A',
                parseFloat(payload.total_price || payload.amount || 0),
                status || 'unknown',
                payload.buyer_name || 'N/A',
                JSON.stringify(payload)
            ]);

            console.log(`G2G Webhook: Processed Order ${orderId} (${status})`);
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('G2G Webhook Error:', e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
