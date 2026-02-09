
import { NextResponse } from 'next/server';
import { query, initDB } from '@/lib/db';

function detectPlatform(title: string, url: string) {
    const t = title.toLowerCase();
    const u = url.toLowerCase();

    if (t.includes('reddit') || u.includes('reddit')) return 'Reddit';
    if (t.includes('snapchat') || u.includes('snapchat') || t.includes('snap ') || u.includes('snap ')) return 'Snapchat';
    if (t.includes('instagram') || u.includes('instagram') || t.includes(' ig ')) return 'Instagram';
    if (t.includes('tiktok') || u.includes('tiktok') || t.includes(' tt ')) return 'TikTok';
    if (t.includes('youtube') || u.includes('youtube') || t.includes(' yt ')) return 'YouTube';
    if (t.includes('facebook') || u.includes('facebook') || t.includes(' fb ')) return 'Facebook';
    if (t.includes('twitter') || t.includes(' x ') || u.includes('twitter')) return 'Twitter';
    if (t.includes('discord') || u.includes('discord')) return 'Discord';
    if (t.includes('telegram') || u.includes('telegram') || t.includes(' tg ')) return 'Telegram';
    if (t.includes('linkedin') || u.includes('linkedin')) return 'LinkedIn';
    if (t.includes('google') || t.includes('gmail')) return 'Google';
    if (t.includes('webhosting') || t.includes('hosting')) return 'Hosting';

    return 'Social';
}

export async function GET() {
    try {
        await initDB();
        const listings = await query("SELECT * FROM playerup_listings ORDER BY createdAt DESC");
        return NextResponse.json(listings);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await initDB();
        const body = await req.json();
        const { action, id, listings, username } = body;

        // NEW: Action for Turbo Sync to handle massive bursts
        if (action === 'turbo_sync' || action === 'bulk_import') {
            if (Array.isArray(listings)) {
                // Efficient Batching: Get all existing URLs in one go
                const existingRows: any = await query("SELECT url FROM playerup_listings");
                const existingUrls = new Set(existingRows.map((r: any) => r.url));

                // Buffer for bulk insert (if supported by query helper)
                for (const item of listings) {
                    if (!existingUrls.has(item.url)) {
                        const newId = Date.now() + Math.random().toString(36).substr(2, 9);
                        const platform = detectPlatform(item.title, item.url);
                        await query(
                            "INSERT IGNORE INTO playerup_listings (id, title, url, platform, lastBumped, createdAt) VALUES (?, ?, ?, ?, NULL, NOW())",
                            [newId, item.title, item.url, platform]
                        );
                        existingUrls.add(item.url);
                    }
                }
                return NextResponse.json({ success: true, count: listings.length });
            }
        }

        if (action === 'delete') {
            await query("DELETE FROM playerup_listings WHERE id = ?", [id]);
        } else if (action === 'update_bump') {
            await query("UPDATE playerup_listings SET lastBumped = NOW() WHERE id = ?", [id]);
        }

        const data: any = await query("SELECT * FROM playerup_listings ORDER BY createdAt DESC");
        return NextResponse.json({ success: true, count: data.length, listings: data });
    } catch (e) {
        console.error("PlayerUp API Error:", e);
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }
}
