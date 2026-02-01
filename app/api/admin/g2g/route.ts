import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { makeG2GRequest } from '@/lib/g2g';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const orderId = searchParams.get('orderId');

    try {
        if (action === 'get_order') {
            if (!orderId) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
            const result = await makeG2GRequest('GET', `/orders/${orderId}`);
            return NextResponse.json(result.data, { status: result.status });
        }

        if (action === 'get_tracked_orders') {
            const rows = await query("SELECT * FROM g2g_orders ORDER BY updated_at DESC LIMIT 50");
            return NextResponse.json(rows);
        }

        if (action === 'get_stats') {
            const stats: any = await query(`
                SELECT 
                    SUM(amount) as totalRevenue,
                    SUM(profit) as totalProfit,
                    COUNT(*) as totalOrders
                FROM g2g_orders
            `);

            const [autoPilot]: any = await query("SELECT setting_value FROM settings WHERE setting_key = 'g2g_auto_pilot'");

            return NextResponse.json({
                ...stats[0],
                autoPilot: autoPilot?.setting_value === 'true'
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, orderId, delivery_details } = body;

        if (action === 'toggle_auto_pilot') {
            const { enabled } = body;
            await query(`
                INSERT INTO settings (setting_key, setting_value)
                VALUES ('g2g_auto_pilot', ?)
                ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
            `, [enabled ? 'true' : 'false']);
            return NextResponse.json({ success: true });
        }

        if (action === 'deliver_order') {
            if (!orderId) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
            const result = await makeG2GRequest('POST', `/orders/${orderId}/delivery`, delivery_details);
            return NextResponse.json(result.data, { status: result.status });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
