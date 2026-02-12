
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
        const { action, id, listings: bulkListings, username, limit, status, frequency, autoBump } = body;

        if (action === 'cloud_fetch') {
            // Check both variations
            const siteKeys = ['session_cookies_www_playerup_com', 'session_cookies_playerup_com'];
            let cookies = null;

            for (const key of siteKeys) {
                const rows: any = await query("SELECT setting_value FROM settings WHERE setting_key = ?", [key]);
                if (rows[0]?.setting_value) {
                    cookies = rows[0].setting_value;
                    break;
                }
            }

            if (!cookies) return NextResponse.json({ success: false, error: "No cookies found. Please sync cookies via extension first." });

            const targets = [
                "https://www.playerup.com/accounts/-/threads",
                "https://www.playerup.com/accounts/-/postings"
            ];

            const scrapedListings = [];
            const seen = new Set();
            const debugLogs: string[] = [];

            for (const target of targets) {
                try {
                    const response = await fetch(target, {
                        headers: {
                            "Cookie": cookies,
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
                        }
                    });

                    if (!response.ok) {
                        debugLogs.push(`Blocked/Failed [${response.status}] on ${target}`);
                        continue;
                    }

                    const html = await response.text();

                    // Robust Regex: Matches <a ... href=".../threads/...">Title</a>
                    // Handles attributes before/after href, and multiline titles
                    const threadRegex = /<a[^>]+href="([^"]*\/threads\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g;

                    let match;
                    let count = 0;
                    while ((match = threadRegex.exec(html)) !== null) {
                        let url = match[1];
                        let title = match[2].replace(/<[^>]*>/g, '').trim(); // Remove inner tags (like <span>)

                        // Normalize URL
                        if (!url.startsWith('http')) {
                            // Ensure leading slash for concatenation
                            if (!url.startsWith('/')) url = '/' + url;
                            url = 'https://www.playerup.com' + url;
                        }
                        url = url.split('?')[0]; // Remove query params

                        // Filter junk
                        if (
                            title.length > 3 &&
                            !seen.has(url) &&
                            !title.toLowerCase().includes('contact') &&
                            !url.includes('/page-') &&
                            !url.includes('#')
                        ) {
                            scrapedListings.push({ title, url });
                            seen.add(url);
                            count++;
                        }
                    }
                    debugLogs.push(`Scraped ${count} items from ${target}`);

                } catch (e: any) {
                    debugLogs.push(`Error fetching ${target}: ${e.message}`);
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
                        "INSERT IGNORE INTO playerup_listings (id, title, url, platform, lastBumped, createdAt, status, frequency, username, autoBump) VALUES (?, ?, ?, ?, NULL, NOW(), 'Inactive', 'Every 24 hours', 'officialum1', FALSE)",
                        [newId, item.title, item.url, platform]
                    );
                    newCount++;
                }
            }

            return NextResponse.json({
                success: true,
                count: scrapedListings.length,
                new: newCount,
                debug: debugLogs
            });
        }

        // NEW: Cloud Bump All (Pings /up URL for all listings)
        if (action === 'cloud_bump_all') {
            const siteKey = 'session_cookies_www_playerup_com';
            const rows: any = await query("SELECT setting_value FROM settings WHERE setting_key = ?", [siteKey]);
            const cookies = rows[0]?.setting_value;

            if (!cookies) return NextResponse.json({ success: false, error: "No session cookies. Sync via extension first." });

            let sql = "SELECT id, url FROM playerup_listings ORDER BY lastBumped ASC, createdAt DESC";
            const params: any[] = [];

            if (limit && limit > 0) {
                sql += " LIMIT ?";
                params.push(limit);
            }

            const listings: any = await query(sql, params);
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
            console.log(`[PlayerUp] Received ${bulkListings?.length} listings for import.`);

            if (Array.isArray(bulkListings)) {
                const existingRows: any = await query("SELECT url FROM playerup_listings");
                // Normalize existing URLs for comparison (strip protocol, www, trailing slash)
                const normalize = (u: string) => u.toLowerCase().replace(/https?:\/\/(www\.)?/, '').replace(/\/$/, '');
                const existingUrls = new Set(existingRows.map((r: any) => normalize(r.url)));

                let adedCount = 0;

                for (const item of bulkListings) {
                    if (!item.url || !item.url.includes('playerup')) continue;

                    const normalizedUrl = normalize(item.url);

                    if (!existingUrls.has(normalizedUrl)) {
                        const newId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
                        // Ensure title isn't empty
                        const title = item.title || "Imported PlayerUp Thread";
                        const platform = detectPlatform(title, item.url);

                        await query(
                            `INSERT IGNORE INTO playerup_listings 
                            (id, title, url, platform, lastBumped, createdAt, status, frequency, username, autoBump) 
                            VALUES (?, ?, ?, ?, NULL, NOW(), 'Active', 'Every 24 hours', 'officialum1', FALSE)`,
                            // Default to 'Active' so they start bumping immediately if needed
                            [newId, title, item.url, platform]
                        );
                        existingUrls.add(normalizedUrl);
                        adedCount++;
                    }
                }
                console.log(`[PlayerUp] Successfully imported ${adedCount} new listings.`);

                const allData: any = await query("SELECT * FROM playerup_listings ORDER BY createdAt DESC");
                return NextResponse.json({ success: true, count: allData.length, new: adedCount, listings: allData }, {
                    headers: { 'Access-Control-Allow-Origin': '*' }
                });
            }
        }

        if (action === 'bulk') {
            const { ids, subAction, value } = body;
            if (!ids || !Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: "No IDs" });

            if (subAction === 'status') {
                await query(`UPDATE playerup_listings SET status = ? WHERE id IN (${ids.map(() => '?').join(',')})`, [value, ...ids]);
            } else if (subAction === 'frequency') {
                await query(`UPDATE playerup_listings SET frequency = ? WHERE id IN (${ids.map(() => '?').join(',')})`, [value, ...ids]);
            } else if (subAction === 'autoBump') {
                const val = value === '1' || value === 'true';
                await query(`UPDATE playerup_listings SET autoBump = ? WHERE id IN (${ids.map(() => '?').join(',')})`, [val, ...ids]);
            } else if (subAction === 'delete') {
                await query(`DELETE FROM playerup_listings WHERE id IN (${ids.map(() => '?').join(',')})`, ids);
            }
        }

        if (action === 'delete') {
            await query("DELETE FROM playerup_listings WHERE id = ?", [id]);
        } else if (action === 'update') {
            if (autoBump !== undefined) {
                await query("UPDATE playerup_listings SET autoBump = ? WHERE id = ?", [autoBump, id]);
            } else {
                await query("UPDATE playerup_listings SET status = ?, frequency = ?, username = ? WHERE id = ?", [status, frequency, username, id]);
            }
        } else if (action === 'get_logs') {
            // Fetch recent logs
            const logs = await query("SELECT * FROM activity_logs WHERE action = 'PlayerUp Bump' ORDER BY date DESC LIMIT 50");
            return NextResponse.json({ success: true, logs });
        }

        if (action === 'update_bump') {
            const success = body.success === true;
            const status = success ? 'success' : 'failed';

            // 1. Update Listing
            if (success) {
                await query("UPDATE playerup_listings SET lastBumped = NOW(), lastBumpStatus = ? WHERE id = ?", [status, id]);
            } else {
                await query("UPDATE playerup_listings SET lastBumpStatus = ? WHERE id = ?", [status, id]);
            }

            // 2. Fetch Title for Log
            const rows: any = await query("SELECT title, url FROM playerup_listings WHERE id = ?", [id]);
            const title = rows[0]?.title || "Unknown Thread";

            // 3. Create Log Entry
            const logId = Date.now().toString();
            const logDetail = success ? `Successfully bumped: ${title}` : `Failed to bump: ${title}`;
            await query("INSERT INTO activity_logs (id, user, action, details, date) VALUES (?, ?, ?, ?, NOW())",
                [logId, 'System', 'PlayerUp Bump', logDetail]
            );

            // Return early as we don't need the full list
            return NextResponse.json({ success: true });
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
