import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendAuditReport } from '@/lib/email';
import { sendTelegramMessage } from '@/lib/telegram';

export async function GET() {
    try {
        // Fetch Orders + Product Names
        const orders = await query(`
            SELECT o.*, p.name as product_name, p.platform 
            FROM orders o 
            LEFT JOIN products p ON o.productId = p.id 
            ORDER BY o.date DESC
        `);
        return NextResponse.json(orders);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { orderId, credentials } = body;

        // 1. Get Order Details
        const orderRows = await query("SELECT * FROM orders WHERE orderId = ?", [orderId]) as any[];
        if (!orderRows.length) return NextResponse.json({ error: "Order not found" }, { status: 404 });
        const order = orderRows[0];

        // 2. Get Product Name (for email)
        const prodRows = await query("SELECT name FROM products WHERE id = ?", [order.productId]) as any[];
        const productName = prodRows[0]?.name || "Product";

        // 3. Update Order Status
        await query("UPDATE orders SET status = 'completed', delivery_details = ? WHERE orderId = ?", [credentials, orderId]);

        // 4. Send Email to Customer
        const emailTarget = order.guestEmail || (await getUserEmail(order.userId));

        if (emailTarget) {
            await sendAuditReport(emailTarget, `Order #${orderId} Delivered!`, {
                da: "ORDER DELIVERED",
                pa: productName,
                links: Number(order.amount),
                details: `Here is your delivery:\n\n${credentials}\n\nThank you for shopping with us!`
            }, await getSettings());
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Fulfillment Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// Helpers
async function getUserEmail(userId: string) {
    if (userId === 'guest') return null;
    const rows = await query("SELECT email FROM users WHERE id = ?", [userId]) as any[];
    return rows[0]?.email;
}

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
