import { NextResponse } from 'next/server';
import { query, withTransaction } from '@/lib/db';
import { makeG2GRequest } from '@/lib/g2g';

/**
 * Background Sync for G2G Orders
 * This should be called by a Vercel Cron or a similar service.
 * It fetches the latest orders from G2G and updates the local DB.
 */
export async function GET(req: Request) {
    // Basic Security: Check for a secret key in headers or params
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    if (key !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('[G2G Sync] Starting background order sync...');

        // 1. Fetch latest orders from G2G (page 1)
        const res = await makeG2GRequest('GET', '/orders?page=1&limit=20');
        if (res.status !== 200) throw new Error(`G2G API Error: ${JSON.stringify(res.data)}`);

        const g2gOrders = res.data?.payload || [];
        let updatedCount = 0;

        for (const order of g2gOrders) {
            // 2. Map G2G Status to Internal Status
            // Statuses: 100=Pending, 200=Processing, 300=Delivered, 400=Completed, 500=Cancelled, etc.
            const statusMap: any = {
                100: 'pending',
                200: 'processing',
                300: 'delivered',
                400: 'completed',
                500: 'cancelled'
            };

            await query(`
                INSERT INTO g2g_orders (
                    g2g_id, product_name, amount, currency, status, buyer_username, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE 
                    status = VALUES(status),
                    updated_at = NOW()
            `, [
                order.order_id,
                order.product_name,
                order.total_amount,
                order.currency,
                statusMap[order.order_status] || 'unknown',
                order.buyer_username
            ]);
            updatedCount++;
        }

        console.log(`[G2G Sync] Successfully synced ${updatedCount} orders.`);
        return NextResponse.json({ success: true, synced: updatedCount });

    } catch (e: any) {
        console.error('[G2G Sync] Critical Error:', e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
