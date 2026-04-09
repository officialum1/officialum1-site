import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendAuditReport } from '@/lib/email';

export async function POST() {
    try {
        // 1. Get completed orders that haven't been reviewed yet (sent after 24h preferably, but here we just check for null)
        const orders: any = await query(`
            SELECT o.*, u.email as userEmail, p.name as productName
            FROM orders o
            LEFT JOIN users u ON o.userId = u.id
            LEFT JOIN products p ON o.productId = p.id
            WHERE o.status = 'completed' AND o.review_sent IS NULL
        `);

        if (orders.length === 0) return NextResponse.json({ success: true, message: "No orders to remind" });

        // 2. Load Settings for Email
        const settingsRows: any = await query("SELECT setting_key, setting_value FROM settings");
        const settings = settingsRows.reduce((acc: any, row: any) => ({ ...acc, [row.setting_key]: row.setting_value }), {});

        const processed = [];

        for (const order of orders) {
            const email = order.guestEmail || order.userEmail;
            if (!email) continue;

            const reviewLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://officialum1.com'}/shop/review?orderId=${order.orderId}`;

            // Send Email
            await sendAuditReport(email, `Share your feedback on ${order.productName}!`, {
                da: "REVIEW REQUEST",
                pa: order.productName,
                links: 5, // Just for the badge count in template if any
                details: `Thank you for your recent purchase! \n\nWe'd love to hear about your experience. Leave a review and get a 10% discount on your next order! \n\nReview Link: ${reviewLink} \n\nCoupon Code: REPEAT10`
            }, settings);

            // Update Order
            await query("UPDATE orders SET review_sent = 1 WHERE orderId = ?", [order.orderId]);
            processed.push(order.orderId);
        }

        return NextResponse.json({ success: true, count: processed.length });

    } catch (e: any) {
        console.error("Remind Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
