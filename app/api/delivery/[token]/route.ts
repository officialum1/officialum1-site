import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request, context: { params: Promise<{ token: string }> }) {
    try {
        const { token } = await context.params;

        // Fetch delivery
        const orders: any = await query("SELECT * FROM deliveries WHERE token = ?", [token]);

        if (orders.length === 0) {
            return NextResponse.json({ error: 'Order not found or Expired Link' }, { status: 404 });
        }

        const order = orders[0];

        // Increment Views
        await query("UPDATE deliveries SET views = views + 1 WHERE token = ?", [token]);

        // Parse JSON details
        const parsedOrder = {
            ...order,
            details: order.details ? JSON.parse(order.details) : {},
            views: (order.views || 0) + 1
        };

        return NextResponse.json(parsedOrder);
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
    try {
        const { token } = await context.params;
        const body = await request.json();

        const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown';
        const userAgent = request.headers.get('user-agent') || 'Unknown';

        // Check if already revealed
        const orders: any = await query("SELECT revealedAt FROM deliveries WHERE token = ?", [token]);
        if (orders.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        if (!orders[0].revealedAt) {
            // First time reveal - log it
            await query("UPDATE deliveries SET ipAddress = ?, userAgent = ?, revealedAt = CURRENT_TIMESTAMP WHERE token = ?", [ipAddress, userAgent, token]);
        }

        return NextResponse.json({ success: true, ip: ipAddress });
    } catch (e) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
