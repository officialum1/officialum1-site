
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendAuditReport } from '@/lib/email';

// GET: List All Orders
export async function GET() {
    try {
        const rows = await query("SELECT * FROM orders ORDER BY date DESC LIMIT 100");
        return NextResponse.json(rows);
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

// POST: Update Order (Delivery / Status)
export async function POST(req: Request) {
    try {
        const { orderId, status, deliveryInfo } = await req.json();

        // 1. Update DB
        if (deliveryInfo) {
            await query("UPDATE orders SET status = ?, delivery_info = ?, delivery_status = 'delivered' WHERE orderId = ?", [status, deliveryInfo, orderId]);
        } else {
            await query("UPDATE orders SET status = ? WHERE orderId = ?", [status, orderId]);
        }

        // 2. Fetch Order Details for Email
        const [order] = await query("SELECT * FROM orders WHERE orderId = ?", [orderId]) as any;
        const [settingsRows] = await query("SELECT setting_key, setting_value FROM settings") as any;

        const settings = Array.isArray(settingsRows) ? settingsRows.reduce((acc: any, r: any) => {
            acc[r.setting_key] = r.setting_value;
            return acc;
        }, {}) : {};

        // 3. Send Delivery Email if delivered
        if (status === 'completed' || deliveryInfo) {
            const emailTarget = order.guestEmail || (await getUserEmail(order.userId));
            if (emailTarget) {
                await sendAuditReport(emailTarget, "Order Delivered #" + orderId, {
                    da: "ORDER DELIVERED",
                    pa: "Order #" + orderId,
                    links: Number(order.amount),
                    details: deliveryInfo || "Your order has been marked as completed."
                }, settings);
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

async function getUserEmail(userId: string) {
    if (userId === 'guest') return null;
    const [user] = await query("SELECT email FROM users WHERE id = ?", [userId]) as any;
    return user ? user.email : null;
}
