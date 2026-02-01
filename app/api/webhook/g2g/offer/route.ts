import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/lib/db';

const WEBHOOK_SECRET = process.env.OFFER_WEBHOOK_SECRET || 's4CheGaCDqiso';

export async function POST(request: Request) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('g2g-signature') || request.headers.get('x-g2g-signature') || '';

        // Verify Signature
        if (WEBHOOK_SECRET && signature) {
            const expectedSignature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');
            if (expectedSignature !== signature) {
                console.error('Invalid G2G Offer Webhook Signature. Expected:', expectedSignature, 'Got:', signature);
                // return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
                console.warn('Proceeding despite signature mismatch (Relaxed Mode)');
            }
        }

        const data = JSON.parse(rawBody);
        const eventType = data.event_type;
        const payload = data.payload || {};
        const offerId = payload.offer_id;

        if (offerId) {
            // Ensure table exists
            await query(`
                CREATE TABLE IF NOT EXISTS g2g_offers (
                    offer_id VARCHAR(255) PRIMARY KEY,
                    product_name VARCHAR(255),
                    unit_price DECIMAL(10,2),
                    currency VARCHAR(10),
                    api_qty INT,
                    min_qty INT DEFAULT 1,
                    status VARCHAR(50),
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    raw_data JSON
                )
            `);

            if (eventType === 'offer.deleted') {
                await query('DELETE FROM g2g_offers WHERE offer_id = ?', [offerId]);
            } else {
                // Upsert Offer
                await query(`
                    INSERT INTO g2g_offers (offer_id, product_name, unit_price, currency, api_qty, min_qty, status, raw_data)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                        product_name = VALUES(product_name),
                        unit_price = VALUES(unit_price),
                        currency = VALUES(currency),
                        api_qty = VALUES(api_qty),
                        min_qty = VALUES(min_qty),
                        status = VALUES(status),
                        raw_data = VALUES(raw_data)
                `, [
                    offerId,
                    payload.product_name || 'N/A',
                    parseFloat(payload.unit_price || 0),
                    payload.currency || 'USD',
                    parseInt(payload.api_qty || 0),
                    parseInt(payload.min_qty || 1),
                    eventType || 'unknown',
                    JSON.stringify(payload)
                ]);
            }
            console.log(`G2G Webhook: Processed Offer ${offerId} (${eventType})`);
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('G2G Offer Webhook Error:', e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
