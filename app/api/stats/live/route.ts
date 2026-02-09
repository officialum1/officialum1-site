import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // 1. Fetch Real Counts from DB
        const [orderCount] = await query("SELECT COUNT(*) as count FROM orders WHERE status = 'completed'") as any[];
        const [reviewCount] = await query("SELECT COUNT(*) as count FROM reviews WHERE status = 'approved'") as any[];
        const [testiCount] = await query("SELECT COUNT(*) as count FROM testimonials WHERE approved = 1") as any[];
        const [userCount] = await query("SELECT COUNT(*) as count FROM users") as any[];
        const [kbViews] = await query("SELECT SUM(views) as total FROM knowledge_base") as any[];
        const [productCount] = await query("SELECT COUNT(*) as count FROM products") as any[];

        // 2. Define High-Traffic Offsets (to match user's latest 3.6k+ request)
        const baseOrders = 3600;
        const baseReviews = 3675;
        const baseProjects = 250;
        const baseUptime = 4.9;
        const baseProducts = 10000;

        // 3. Get Latest Activity Feed
        const latestOrders = await query(`
            SELECT productId, amount, date FROM orders 
            WHERE status IN ('paid', 'completed') 
            ORDER BY date DESC LIMIT 5
        `) as any[];

        const latestReviews = await query(`
            (SELECT comment as review, rating, created_at FROM reviews WHERE status = 'approved')
            UNION ALL
            (SELECT review, rating, created_at FROM testimonials WHERE approved = 1)
            ORDER BY created_at DESC LIMIT 5
        `) as any[];

        return NextResponse.json({
            stats: {
                orders: (orderCount?.count || 0) + baseOrders,
                reviews: (reviewCount?.count || 0) + (testiCount?.count || 0) + baseReviews,
                projects: (orderCount?.count || 0) + baseProjects,
                satisfaction: Number((4.85 + (Math.random() * 0.1)).toFixed(2)),
                activeUsers: (userCount?.count || 0) + 142 + Math.floor(Math.random() * 10),
                kbEngagement: (kbViews?.total || 0) + 12000,
                marketAssets: (productCount?.count || 0) + baseProducts
            },
            feed: {
                latestOrders,
                latestReviews
            }
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
