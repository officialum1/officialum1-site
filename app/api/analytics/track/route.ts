import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sessionId, currentPath, userAgent } = body;

        if (!sessionId) return NextResponse.json({ error: 'Missing session' }, { status: 400 });

        const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown';

        // Check if exists
        const existing: any = await query("SELECT session_id FROM live_traffic WHERE session_id = ?", [sessionId]);

        if (existing.length > 0) {
            await query(
                "UPDATE live_traffic SET current_page = ?, ip_address = ?, user_agent = ?, last_active_at = CURRENT_TIMESTAMP WHERE session_id = ?",
                [currentPath || '/', ipAddress, userAgent || 'Unknown', sessionId]
            );
        } else {
            // Very basic geo location via free API if you want it later, or just mock 'Global'
            let location = 'Global Visitor';
            if (ipAddress !== 'Unknown' && ipAddress !== '127.0.0.1' && ipAddress !== '::1') {
                // If you want real GeoIP later, insert here. For now we use the IP or a proxy.
                location = `IP: ${ipAddress}`;
            }

            await query(
                `INSERT INTO live_traffic (session_id, ip_address, current_page, user_agent, location, last_active_at) 
                 VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [sessionId, ipAddress, currentPath || '/', userAgent || 'Unknown', location]
            );
        }

        // Clean up dead sessions older than 5 minutes
        await query(`DELETE FROM live_traffic WHERE last_active_at < (NOW() - INTERVAL 5 MINUTE)`);

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
