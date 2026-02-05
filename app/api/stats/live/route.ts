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

        // 2. Define High-Traffic Offsets (to match user's latest 3.6k+ request)
        const baseOrders = 3600;
        const baseReviews = 3675;
        const baseProjects = 250;
        const baseUptime = 4.9;

        return NextResponse.json({
            orders: (orderCount?.count || 0) + baseOrders,
            reviews: (reviewCount?.count || 0) + (testiCount?.count || 0) + baseReviews,
            projects: (orderCount?.count || 0) + baseProjects,
            satisfaction: 4.8 + (Math.random() * 0.15), // Realistic 4.8 - 4.95 range
            activeUsers: (userCount?.count || 0) + 120, // 120 base real-time users
            kbEngagement: (kbViews?.total || 0) + 12000
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
