import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/lib/db';
import { makeG2GRequest } from '@/lib/g2g';

// Webhook Secrets (Should match what user puts in G2G Dashboard)
const ORDER_WEBHOOK_SECRET = process.env.ORDER_WEBHOOK_SECRET || "nKkGeGGv5Gzx";
const OFFER_WEBHOOK_SECRET = process.env.OFFER_WEBHOOK_SECRET || "5xaz6MvvSBV661I";

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
        // Ensure table exists with stats columns
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
                purchase_cost DECIMAL(10,2) DEFAULT 0,
                profit DECIMAL(10,2) DEFAULT 0,
                is_auto_delivered BOOLEAN DEFAULT FALSE,
                raw_payload JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Migration: Add columns if they don't exist
        try { await query("ALTER TABLE g2g_orders ADD COLUMN purchase_cost DECIMAL(10,2) DEFAULT 0"); } catch (e) { }
        try { await query("ALTER TABLE g2g_orders ADD COLUMN profit DECIMAL(10,2) DEFAULT 0"); } catch (e) { }
        try { await query("ALTER TABLE g2g_orders ADD COLUMN is_auto_delivered BOOLEAN DEFAULT FALSE"); } catch (e) { }

        if (eventType.startsWith('order.')) {
            const payload = data.payload || {};
            const orderId = payload.order_id;
            const status = payload.order_status || 'Paid';
            const productName = payload.product_name || '';
            const amount = payload.total_price || 0;

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
                productName,
                payload.display_name || '',
                amount,
                payload.currency || 'USD',
                status,
                JSON.stringify(payload)
            ]);

            // --- AUTO-PILOT LOGIC ---
            // Only auto-pilot if it's Paid and not already delivered
            if (status.toLowerCase().includes('paid')) {
                // Check if already auto-delivered (check DB)
                const [existing]: any = await query("SELECT is_auto_delivered FROM g2g_orders WHERE order_id = ?", [orderId]);

                if (existing && !existing.is_auto_delivered) {
                    const isBoosting = productName.toLowerCase().includes('boost');

                    if (isBoosting) {
                        console.log(`Auto-Pilot: Order ${orderId} is a Boosting service. Skipping automation.`);
                    } else {
                        // 1. Try to find a matching Account in Inventory
                        const [stock]: any = await query(
                            "SELECT * FROM inventory WHERE (name LIKE ? OR platform LIKE ?) AND status = 'In Stock' LIMIT 1",
                            [`%${productName}%`, `%${productName}%`]
                        );

                        if (stock) {
                            // FOUND STOCK! Start Auto-Delivery
                            console.log(`Auto-Pilot: Delivering Order ${orderId} using stock ${stock.id}`);

                            const deliveryPayload = {
                                status: 'completed',
                                content: stock.accountDetails
                            };

                            const g2gRes = await makeG2GRequest('POST', `/orders/${orderId}/delivery`, deliveryPayload);

                            if (g2gRes.status === 200 || g2gRes.status === 201 || (g2gRes.data && g2gRes.data.success)) {
                                // Mark Stock as Sold
                                await query("UPDATE inventory SET status = 'Sold' WHERE id = ?", [stock.id]);

                                // Update G2G Order Record with profit stats
                                const profit = amount - stock.purchasePrice;
                                await query(`
                                UPDATE g2g_orders 
                                SET is_auto_delivered = TRUE, 
                                    purchase_cost = ?,
                                    profit = ?,
                                    status = 'Delivered'
                                WHERE order_id = ?
                            `, [stock.purchasePrice, profit, orderId]);

                                // Log Action
                                await query("INSERT INTO activity_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
                                    [`log_${Date.now()}`, 'System (Auto-Pilot)', 'Auto Delivery', `G2G Order ${orderId} fulfilled automatically.`]
                                );
                            }
                        } else {
                            // If no stock, check if it's Boosting (maybe just log it)
                            console.log(`Auto-Pilot: No matching stock for ${productName}. Likely Boosting or manual fulfillment needed.`);
                        }
                    }
                }
            }

            return NextResponse.json({ success: true });
        } catch (e: any) {
            console.error("G2G Webhook Error:", e.message);
            return NextResponse.json({ error: e.message }, { status: 500 });
        }
    }
