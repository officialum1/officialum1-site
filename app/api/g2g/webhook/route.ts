import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';
import { sendTelegramMessage } from '@/lib/telegram';
import { makeG2GRequest, sendG2GMessage } from '@/lib/g2g';
import { sendDiscordNotification } from '@/lib/discord';

import { getG2GCredentials } from '@/lib/g2g';

export async function POST(request: Request) {
    const rawBody = await request.text();
    const signature = request.headers.get('g2g-signature') || request.headers.get('x-g2g-signature');

    const { orderWebhookSecret, offerWebhookSecret } = await getG2GCredentials();

    const ORDER_WEBHOOK_SECRET = orderWebhookSecret;
    const OFFER_WEBHOOK_SECRET = offerWebhookSecret;

    if (!ORDER_WEBHOOK_SECRET || !OFFER_WEBHOOK_SECRET) {
        console.error("FATAL: G2G webhook secrets not configured (Env or DB)");
    }

    let data;
    try {
        data = JSON.parse(rawBody);
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const eventType = data.event_type || '';
    const secret = eventType.startsWith('order.') ? ORDER_WEBHOOK_SECRET : OFFER_WEBHOOK_SECRET;

    if (signature) {
        if (!secret) {
            console.error("G2G Webhook: Secret not configured");
            return NextResponse.json({ error: 'Webhook configuration error' }, { status: 500 });
        }
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
                auto_message_sent BOOLEAN DEFAULT FALSE,
                raw_payload JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Migration: Add columns if they don't exist
        try { await query("ALTER TABLE g2g_orders ADD COLUMN purchase_cost DECIMAL(10,2) DEFAULT 0"); } catch (e) { }
        try { await query("ALTER TABLE g2g_orders ADD COLUMN profit DECIMAL(10,2) DEFAULT 0"); } catch (e) { }
        try { await query("ALTER TABLE g2g_orders ADD COLUMN is_auto_delivered BOOLEAN DEFAULT FALSE"); } catch (e) { }
        try { await query("ALTER TABLE g2g_orders ADD COLUMN auto_message_sent BOOLEAN DEFAULT FALSE"); } catch (e) { }

        if (eventType.startsWith('order.')) {
            const payload = data.payload || {};
            const orderId = payload.order_id;
            const status = payload.order_status || 'Paid';
            const productName = payload.product_name || '';
            const amount = parseFloat(payload.total_price || payload.total_amount || payload.amount || 0);

            // Insert or Update G2G Order
            await query(`
                INSERT INTO g2g_orders (order_id, event_type, product_name, buyer_name, amount, currency, status, raw_payload)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                event_type = VALUES(event_type),
                status = VALUES(status),
                amount = VALUES(amount),
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

            // Discord Notification for New Orders
            if (eventType === 'order.paid' || (eventType === 'order.status_changed' && status.toLowerCase().includes('paid'))) {
                await sendDiscordNotification(`🛍️ **New G2G Order Paid!**`, {
                    title: `Order #${orderId}`,
                    description: `Product: **${productName}**\nBuyer: **${payload.display_name || 'G2G Customer'}**\nAmount: **${amount} ${payload.currency || 'USD'}**`,
                    color: 3066993, // Green
                    timestamp: new Date().toISOString()
                });
            }

            // --- AUTO-PILOT LOGIC ---
            if (status.toLowerCase().includes('paid')) {
                // Check if Auto-Pilot is enabled in settings
                const [setting]: any = await query("SELECT setting_value FROM settings WHERE setting_key = 'g2g_auto_pilot'");
                const isAutoPilotEnabled = setting?.setting_value === 'true';

                const [existing]: any = await query("SELECT is_auto_delivered, auto_message_sent FROM g2g_orders WHERE order_id = ?", [orderId]);

                if (existing) {
                    const isBoosting = productName.toLowerCase().includes('boost');

                    // --- AUTO CHAT LOGIC ---
                    if (!existing.auto_message_sent) {
                        let greeting = "";
                        if (isBoosting) {
                            greeting = `Hi ${payload.display_name || 'there'}! 👋 Thanks for choosing OfficialUM1 for your boosting service. Our pro is being assigned now. Please provide your character name/server here if not already specified!`;
                        } else {
                            greeting = `Hi ${payload.display_name || 'there'}! 👋 Your account is being prepared for instant delivery. Please stay online. If you are happy with the service, don't forget to leave us a 5-star review! ⭐⭐⭐⭐⭐`;
                        }
                        await sendG2GMessage(orderId, greeting);
                        await query("UPDATE g2g_orders SET auto_message_sent = TRUE WHERE order_id = ?", [orderId]);
                    }

                    if (isAutoPilotEnabled && !existing.is_auto_delivered && !isBoosting) {
                        const [stock]: any = await query(
                            "SELECT * FROM inventory WHERE (name LIKE ? OR platform LIKE ?) AND status = 'In Stock' LIMIT 1",
                            [`%${productName}%`, `%${productName}%`]
                        );

                        if (stock) {
                            console.log(`Auto-Pilot: Delivering Order ${orderId} using stock ${stock.id}`);
                            const deliveryPayload = { status: 'completed', content: stock.accountDetails };
                            const g2gRes = await makeG2GRequest('POST', `/orders/${orderId}/delivery`, deliveryPayload);

                            if (g2gRes.status === 200 || g2gRes.status === 201 || (g2gRes.data && g2gRes.data.success)) {
                                await query("UPDATE inventory SET status = 'Sold' WHERE id = ?", [stock.id]);
                                const profit = amount - stock.purchasePrice;
                                await query(`
                                    UPDATE g2g_orders 
                                    SET is_auto_delivered = TRUE, purchase_cost = ?, profit = ?, status = 'Delivered'
                                    WHERE order_id = ?
                                `, [stock.purchasePrice, profit, orderId]);

                                await query("INSERT INTO activity_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
                                    [`log_${Date.now()}`, 'System (Auto-Pilot)', 'Auto Delivery', `G2G Order ${orderId} fulfilled automatically.`]
                                );

                                // Discord Notification for Auto-Delivery
                                await sendDiscordNotification(`✅ **G2G Auto-Pilot Delivered!**`, {
                                    title: `Order #${orderId} Fulfilled`,
                                    description: `Item: **${productName}**\nStock Used: \`${stock.id}\`\nProfit: **+$${profit}** 🛡️`,
                                    color: 1752220, // Aqua
                                    timestamp: new Date().toISOString()
                                });
                            }
                        }
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
