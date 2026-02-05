import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // 1. Get Stats
        const [reviewStats] = await query("SELECT COUNT(*) as count, AVG(rating) as avgRating FROM reviews WHERE status = 'approved'") as any[];
        const [testiStats] = await query("SELECT COUNT(*) as count, AVG(rating) as avgRating FROM testimonials WHERE approved = 1") as any[];
        const [orderStats] = await query("SELECT COUNT(*) as count FROM orders WHERE status = 'completed'") as any[];

        const totalReviews = (reviewStats?.count || 0) + (testiStats?.count || 0);
        const avgRating = totalReviews > 0
            ? (((reviewStats?.avgRating || 0) * (reviewStats?.count || 0)) + ((testiStats?.avgRating || 0) * (testiStats?.count || 0))) / totalReviews
            : 5.0;

        // 2. Get Latest Combined Feed (Last 50)
        // We'll normalize both tables into a common format
        const combinedReviews = await query(`
            (SELECT id, user_id as name, comment as review, rating, status as approved, created_at, 'Product Review' as role,
             (SELECT COUNT(*) FROM orders o WHERE o.userId = reviews.user_id AND o.status IN ('paid', 'completed')) as has_purchased
             FROM reviews WHERE status = 'approved')
            UNION ALL
            (SELECT id, name, review, rating, approved, created_at, role,
             (SELECT COUNT(*) FROM orders o WHERE o.userId = testimonials.user_id AND o.status IN ('paid', 'completed')) as has_purchased
             FROM testimonials WHERE approved = 1)
            ORDER BY created_at DESC
            LIMIT 50
        `) as any[];

        return NextResponse.json({
            stats: {
                totalReviews: totalReviews + 2450, // Base offset from user request
                avgRating: avgRating.toFixed(1),
                totalOrders: (orderStats?.count || 0) + 2400 // Base offset
            },
            reviews: combinedReviews
        });
    } catch (e: any) {
        console.error("Global Reviews Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
