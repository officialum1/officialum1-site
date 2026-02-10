
import { NextRequest, NextResponse } from 'next/server';
import { query, initDB } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

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


export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function GET() {
    try {
        await initDB();
        const listings = await query("SELECT * FROM playerup_listings ORDER BY createdAt DESC");
        return NextResponse.json(listings, {
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
}

export async function POST(req: NextRequest) {
    const adminPass = req.headers.get('X-Admin-Password');
    const isExtension = adminPass === process.env.ADMIN_PASSWORD;

    if (!isExtension && !await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await initDB();
        const body = await req.json();
        const { action, id, listings: bulkListings, username } = body;

        // NEW: Cloud Fetch (Uses saved cookies to fetch from server)
        if (action === 'cloud_fetch') {
            const siteKey = 'session_cookies_www_playerup_com';
            const rows: any = await query("SELECT setting_value FROM settings WHERE setting_key = ?", [siteKey]);
            const cookies = rows[0]?.setting_value;

            if (!cookies) return NextResponse.json({ success: false, error: "No cookies found. Please sync cookies via extension first." });

            const target = `https://www.playerup.com/accounts/-/postings`;

            const response = await fetch(target, {
                headers: {
                    "Cookie": cookies,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });

            if (!response.ok) return NextResponse.json({ success: false, error: "PlayerUp rejected the cloud request." });

            const html = await response.text();
            const threadRegex = /href="([^"]*\/threads\/[^"]*)"[^>]*>([^<]+)<\/a>/g;
            let match;
            const scrapedListings = [];
            const seen = new Set();

            while ((match = threadRegex.exec(html)) !== null) {
                let url = match[1];
                const title = match[2].trim();
                if (!url.startsWith('http')) url = 'https://www.playerup.com/' + url.replace(/^\//, '');
                url = url.split('?')[0];
                if (title && !seen.has(url) && !title.toLowerCase().includes('contact')) {
                    scrapedListings.push({ title, url });
                    seen.add(url);
                }
            }

            const existingRows: any = await query("SELECT url FROM playerup_listings");
            const existingUrls = new Set(existingRows.map((r: any) => r.url));
            let newCount = 0;

            for (const item of scrapedListings) {
                if (!existingUrls.has(item.url)) {
                    const newId = Date.now() + Math.random().toString(36).substr(2, 9);
                    const platform = detectPlatform(item.title, item.url);
                    await query(
                        "INSERT IGNORE INTO playerup_listings (id, title, url, platform, lastBumped, createdAt) VALUES (?, ?, ?, ?, NULL, NOW())",
                        [newId, item.title, item.url, platform]
                    );
                    newCount++;
                }
            }

            return NextResponse.json({ success: true, count: scrapedListings.length, new: newCount });
        }

        // NEW: Cloud Bump All (Pings /up URL for all listings)
        if (action === 'cloud_bump_all') {
            const siteKey = 'session_cookies_www_playerup_com';
            const rows: any = await query("SELECT setting_value FROM settings WHERE setting_key = ?", [siteKey]);
            const cookies = rows[0]?.setting_value;

            if (!cookies) return NextResponse.json({ success: false, error: "No session cookies. Sync via extension first." });

            const listings: any = await query("SELECT id, url FROM playerup_listings");
            let bumpCount = 0;

            // We do this in a background-style loop
            for (const item of listings) {
                try {
                    // PlayerUp bumps are triggered by visiting the /up URL with a session
                    await fetch(`${item.url.replace(/\/$/, '')}/up`, {
                        headers: {
                            "Cookie": cookies,
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                        }
                    });

                    await query("UPDATE playerup_listings SET lastBumped = NOW() WHERE id = ?", [item.id]);
                    bumpCount++;

                    // Tiny delay to be safe
                    await new Promise(r => setTimeout(r, 300));
                } catch (e) {
                    console.error(`Failed to bump ${item.url}`, e);
                }
            }

            return NextResponse.json({ success: true, bumped: bumpCount });
        }

        // Action for Turbo Sync
        if (action === 'turbo_sync' || action === 'bulk_import') {
            if (Array.isArray(bulkListings)) {
                const existingRows: any = await query("SELECT url FROM playerup_listings");
                const existingUrls = new Set(existingRows.map((r: any) => r.url));

                for (const item of bulkListings) {
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
                return NextResponse.json({ success: true, count: bulkListings.length }, {
                    headers: { 'Access-Control-Allow-Origin': '*' }
                });
            }
        }

        if (action === 'delete') {
            await query("DELETE FROM playerup_listings WHERE id = ?", [id]);
        } else if (action === 'update_bump') {
            await query("UPDATE playerup_listings SET lastBumped = NOW() WHERE id = ?", [id]);
        }

        const data: any = await query("SELECT * FROM playerup_listings ORDER BY createdAt DESC");
        return NextResponse.json({ success: true, count: data.length, listings: data }, {
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    } catch (e) {
        console.error("PlayerUp API Error:", e);
        return NextResponse.json({ success: false, error: 'Database error' }, {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    }
}
