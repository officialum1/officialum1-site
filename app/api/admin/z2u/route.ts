
import { NextRequest, NextResponse } from 'next/server';
import { query, initDB } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

function detectPlatform(title: string) {
    const t = title.toLowerCase();
    if (t.includes('reddit')) return 'Reddit';
    if (t.includes('snapchat')) return 'Snapchat';
    if (t.includes('instagram')) return 'Instagram';
    if (t.includes('tiktok')) return 'TikTok';
    if (t.includes('youtube')) return 'YouTube';
    if (t.includes('facebook')) return 'Facebook';
    if (t.includes('twitter') || t.includes(' x ')) return 'Twitter';
    if (t.includes('discord')) return 'Discord';
    if (t.includes('telegram')) return 'Telegram';
    return 'Other';
}

export async function GET() {
    try {
        await initDB();
        const listings = await query("SELECT * FROM z2u_listings ORDER BY createdAt DESC");
        return NextResponse.json(listings);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch Z2U listings' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const adminPass = req.headers.get('X-Admin-Password');
    const isExtension = adminPass === process.env.ADMIN_PASSWORD;

    if (!isExtension && !await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await initDB();
        const body = await req.json();
        const { action, listings } = body;

        if (action === 'turbo_sync' && Array.isArray(listings)) {
            for (const item of listings) {
                const platform = detectPlatform(item.title);
                await query(
                    "INSERT INTO z2u_listings (id, title, url, platform, unit_price, stock, status, lastSync, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE title = VALUES(title), unit_price = VALUES(unit_price), stock = VALUES(stock), status = VALUES(status), lastSync = NOW()",
                    [item.id, item.title, item.url || '', platform, item.price, item.stock, item.status]
                );
            }
            return NextResponse.json({ success: true, count: listings.length });
        }

        if (action === 'delete') {
            await query("DELETE FROM z2u_listings WHERE id = ?", [body.id]);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e) {
        console.error("Z2U API Error:", e);
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }
}
