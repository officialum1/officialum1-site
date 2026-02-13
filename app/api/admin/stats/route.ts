import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET(request: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // Calculate Total Stats from Transactions
        const stats: any = await query(`
            SELECT 
                COALESCE(SUM(amount), 0) as totalRevenue,
                COALESCE(SUM(amount - cost), 0) as totalProfit,
                COUNT(*) as totalOrders
            FROM transactions
            WHERE type = 'sale'
            AND currency = 'USD'
        `);

        // Also include Website Orders (from 'orders' table) if not already in transactions
        // Note: Currently orders might not be synced to transactions automatically.
        // Let's check 'orders' table too.
        const webOrders: any = await query(`
            SELECT 
                COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as webRevenue,
                COUNT(*) as webCount
            FROM orders
            WHERE status = 'paid' OR status = 'completed'
        `);

        // G2G Stats (from g2g_orders)
        const g2gStats: any = await query(`
            SELECT 
                COALESCE(SUM(amount), 0) as g2gRevenue,
                COUNT(*) as g2gCount
            FROM g2g_orders
        `);

        const combinedRevenue = Number(stats[0].totalRevenue) + Number(webOrders[0].webRevenue) + Number(g2gStats[0].g2gRevenue);
        const combinedOrders = Number(stats[0].totalOrders) + Number(webOrders[0].webCount) + Number(g2gStats[0].g2gCount);

        // For profit, assume 95% margin on web/g2g if cost is unknown
        const combinedProfit = Number(stats[0].totalProfit) + (Number(webOrders[0].webRevenue) * 0.95) + (Number(g2gStats[0].g2gRevenue) * 0.95);

        return NextResponse.json({
            totalRevenue: combinedRevenue,
            totalProfit: combinedProfit,
            totalOrders: combinedOrders,
            breakdown: {
                direct: stats[0].totalRevenue,
                website: webOrders[0].webRevenue,
                g2g: g2gStats[0].g2gRevenue
            }
        });
    } catch (error: any) {
        console.error('Stats API Error:', error);
        return NextResponse.json({
            totalRevenue: "0.00",
            totalProfit: "0.00",
            totalOrders: 0,
            error: error.message
        });
    }
}
