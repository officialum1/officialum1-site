import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // Time Ranges
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // 1. Revenue & Orders (This Month)
        const revenueRows = await query(`
            SELECT 
                SUM(CASE 
                    WHEN CAST(o.amount AS DECIMAL(10,2)) > 0 THEN CAST(o.amount AS DECIMAL(10,2))
                    ELSE CAST(p.price AS DECIMAL(10,2))
                END * o.quantity) as totalDisplay, 
                COUNT(*) as count 
            FROM orders o
            LEFT JOIN products p ON o.productId = p.id
            WHERE o.status IN ('paid', 'completed') AND o.date >= ?
        `, [startOfMonth]) as any[];
        const revenueMonth = revenueRows[0]?.totalDisplay || 0;
        const ordersMonth = revenueRows[0]?.count || 0;

        // 2. Total Users
        const userRows = await query("SELECT COUNT(*) as count FROM users") as any[];
        const totalUsers = userRows[0]?.count || 0;

        // 3. Top Platform (by Sales Volume)
        // Need to join with products to get platform. Assuming we store productId.
        const platformRows = await query(`
            SELECT p.platform, COUNT(*) as count 
            FROM orders o 
            JOIN products p ON o.productId = p.id 
            WHERE o.status IN ('paid', 'completed') 
            GROUP BY p.platform 
            ORDER BY count DESC 
            LIMIT 1
        `) as any[];

        let topPlatform = { platform: 'None', percent: 0 };
        if (platformRows.length > 0) {
            const top = platformRows[0];
            const totalOrders = await query("SELECT COUNT(*) as c FROM orders WHERE status IN ('paid', 'completed')") as any[];
            const total = totalOrders[0]?.c || 1;
            topPlatform = {
                platform: top.platform,
                percent: Math.round((top.count / total) * 100)
            };
        }

        // 4. Recent Orders
        const recentOrders = await query(`
            SELECT o.orderId, o.amount, o.date, o.productId,
                   COALESCE(u.email, o.guestEmail) as user_email
            FROM orders o
            LEFT JOIN users u ON o.userId = u.id
            ORDER BY o.date DESC
            LIMIT 5
        `);

        // 5. Chart Data (Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const chartRows = await query(`
            SELECT DATE(date) as day, SUM(amount) as total
            FROM orders
            WHERE status IN ('paid', 'completed') AND date >= ?
            GROUP BY DATE(date)
            ORDER BY DATE(date) ASC
        `, [thirtyDaysAgo]) as any[];

        const salesChartData = chartRows.map(row => ({
            date: new Date(row.day).toLocaleDateString(),
            total: row.total
        }));

        // 6. Top Products
        const topProdRows = await query(`
            SELECT p.name, COUNT(*) as sales
            FROM orders o
            JOIN products p ON o.productId = p.id
            WHERE o.status IN ('paid', 'completed')
            GROUP BY p.id
            ORDER BY sales DESC
            LIMIT 5
        `);

        return NextResponse.json({
            revenueMonth,
            ordersMonth,
            totalUsers,
            topPlatform,
            recentOrders,
            salesChartData,
            topProducts: topProdRows
        });

    } catch (e: unknown) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
