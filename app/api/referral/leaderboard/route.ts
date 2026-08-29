import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const topReferrers = await query(`
            SELECT email, total_affiliate_earnings 
            FROM users 
            WHERE total_affiliate_earnings > 0 
            ORDER BY total_affiliate_earnings DESC 
            LIMIT 5
        `);

        // Mask emails for privacy (e.g., user***@email.com)
        const maskedData = (topReferrers as any[]).map(r => ({
            username: r.email.split('@')[0].substring(0, 3) + '***',
            earnings: parseFloat(r.total_affiliate_earnings).toFixed(2)
        }));

        return NextResponse.json(maskedData);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
