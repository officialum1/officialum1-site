import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Get Wallet & Earnings
        const userRows: any = await query("SELECT wallet_balance FROM users WHERE id = ?", [userId]);
        const balance = userRows[0]?.wallet_balance || 0;

        // 2. Get Sales Stats
        const salesRows: any = await query(`
            SELECT 
                COUNT(*) as total_orders,
                SUM(orders.amount) as total_sales
            FROM orders 
            JOIN products ON orders.productId = products.id 
            WHERE products.user_id = ? AND orders.status = 'completed'
        `, [userId]);

        const totalSales = salesRows[0]?.total_sales || 0;
        const totalOrders = salesRows[0]?.total_orders || 0;

        // 3. Get Active Listings
        const listingRows: any = await query("SELECT COUNT(*) as count FROM products WHERE user_id = ? AND status = 'active'", [userId]);
        const activeListings = listingRows[0]?.count || 0;

        // 4. Get Recent Orders
        const recentOrders = await query(`
            SELECT 
                orders.orderId,
                orders.amount,
                orders.status,
                orders.date,
                products.name as productName
            FROM orders 
            JOIN products ON orders.productId = products.id 
            WHERE products.user_id = ? 
            ORDER BY orders.date DESC 
            LIMIT 5
        `, [userId]);

        return NextResponse.json({
            balance,
            totalSales,
            totalOrders,
            activeListings,
            recentOrders
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
