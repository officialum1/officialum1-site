import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sessionId, currentPath, userAgent } = body;

        if (!sessionId) return NextResponse.json({ error: 'Missing session' }, { status: 400 });

        const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown';

        let location = 'Global Visitor';
        if (ipAddress !== 'Unknown' && ipAddress !== '127.0.0.1' && ipAddress !== '::1' && ipAddress !== '::ffff:127.0.0.1') {
            location = `IP: ${ipAddress}`;
        }

        await query(
            `INSERT INTO live_traffic (session_id, ip_address, current_page, user_agent, location, last_active_at)
             VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
             ON DUPLICATE KEY UPDATE
                ip_address = VALUES(ip_address),
                current_page = VALUES(current_page),
                user_agent = VALUES(user_agent),
                last_active_at = CURRENT_TIMESTAMP`,
            [sessionId, ipAddress, currentPath || '/', userAgent || 'Unknown', location]
        );

        // Clean up dead sessions older than 5 minutes
        await query(`DELETE FROM live_traffic WHERE last_active_at < (NOW() - INTERVAL 5 MINUTE)`);

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ success: false });
    }
}
