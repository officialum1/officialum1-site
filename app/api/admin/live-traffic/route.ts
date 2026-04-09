import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET(request: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // Only return traffic active in the last 5 minutes
        const activeUsers: any = await query(`
            SELECT session_id, ip_address, current_page, user_agent, location, 
            TIMESTAMPDIFF(SECOND, last_active_at, NOW()) as seconds_idle
            FROM live_traffic 
            WHERE last_active_at >= NOW() - INTERVAL 5 MINUTE
            ORDER BY last_active_at DESC
        `);

        return NextResponse.json({ activeUsers });
    } catch (error) {
        console.error("Live Traffic Error:", error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
