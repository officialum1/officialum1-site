import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { orderId, rating, comment } = body;

        if (!orderId || !rating) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        // Check if order exists and is completed
        const orders: any = await query("SELECT * FROM orders WHERE orderId = ? AND status = 'completed'", [orderId]);
        if (orders.length === 0) return NextResponse.json({ error: 'Order not found or not completed' }, { status: 404 });

        // Check if already reviewed
        const existing: any = await query("SELECT * FROM testimonials WHERE order_id = ?", [orderId]);
        if (existing.length > 0) return NextResponse.json({ error: 'Already reviewed' }, { status: 400 });

        // Insert into testimonials
        await query(
            "INSERT INTO testimonials (name, content, rating, order_id, product_id) VALUES (?, ?, ?, ?, ?)",
            [orders[0].guestEmail || 'Customer', comment, rating, orderId, orders[0].productId]
        );

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
