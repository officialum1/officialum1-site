// PlayerUp Management API - Stable Version
import { NextRequest, NextResponse } from 'next/server';
import { query, initDB } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { runCloudBump } from '@/lib/playerup-auto';

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
        const statusRow: any = await query("SELECT setting_value FROM settings WHERE setting_key = 'playerup_bump_enabled'");
        const isPaused = statusRow[0]?.setting_value === 'false';

        return NextResponse.json({ listings, isPaused }, {
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

        if (action === 'toggle_pause') {
            const newState = body.pause === true ? 'false' : 'true';
            await query("INSERT INTO settings (setting_key, setting_value) VALUES ('playerup_bump_enabled', ?) ON DUPLICATE KEY UPDATE setting_value = ?", [newState, newState]);
            return NextResponse.json({ success: true, isPaused: body.pause === true });
        }

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
            const result = await runCloudBump(limit || 0);
            return NextResponse.json(result);
        }

        if (action === 'manual_bump') {
            const today = new Date().toISOString().split('T')[0];
            if (Array.isArray(bulkListings)) {
                for (const item of bulkListings) {
                    const { url, status, error } = item;
                    if (!url) continue;

                    // 1. Find listing by URL (case-insensitive and stripping protocol/trailing slash)
                    const normalize = (u: string) => u.toLowerCase().replace(/https?:\/\/(www\.)?/, '').replace(/\/$/, '');
                    const nUrl = normalize(url);

                    const rows: any = await query(`SELECT id, title, dailyBumpCount, lastResetDate FROM playerup_listings WHERE LOWER(REPLACE(REPLACE(REPLACE(url, 'https://', ''), 'http://', ''), 'www.', '')) LIKE ?`, [`%${nUrl}%`]);
                    const listing = rows[0];

                    if (listing) {
                        const success = status === 'success';
                        const limitReached = status === 'limit_reached';
                        const dbStatus = success ? 'success' : (limitReached ? 'limit_reached' : 'failed');

                        // 2. Update Listing
                        if (listing.lastResetDate !== today) {
                            await query("UPDATE playerup_listings SET lastBumped = IF(?, NOW(), lastBumped), dailyBumpCount = IF(?, 1, 0), lastResetDate = ?, lastBumpStatus = ?, limitReached = ? WHERE id = ?", [success, success, today, dbStatus, limitReached, listing.id]);
                        } else {
                            await query("UPDATE playerup_listings SET lastBumped = IF(?, NOW(), lastBumped), dailyBumpCount = dailyBumpCount + IF(?, 1, 0), lastBumpStatus = ?, limitReached = ? WHERE id = ?", [success, success, dbStatus, limitReached, listing.id]);
                        }

                        // 3. Create Log
                        const logId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
                        let logDetail = "";
                        if (success) {
                            logDetail = `Successfully bumped: ${listing.title}`;
                        } else if (limitReached) {
                            logDetail = `Skipped: Daily limit hit (4/4) for ${listing.title}`;
                        } else {
                            logDetail = `Manual Bump ${error || 'Failed'} for ${listing.title}`;
                        }

                        await query("INSERT INTO activity_logs (id, user, action, details, date) VALUES (?, ?, ?, ?, NOW())", [logId, 'System', 'PlayerUp Bump', logDetail]);
                    }
                }
            }
            return NextResponse.json({ success: true });
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

        if (action === 'update_all') {
            const { frequency, autoBump } = body;
            if (frequency) {
                await query("UPDATE playerup_listings SET frequency = ?", [frequency]);
            }
            if (autoBump !== undefined) {
                const val = autoBump === true || autoBump === '1';
                await query("UPDATE playerup_listings SET autoBump = ?", [val]);
            }
            return NextResponse.json({ success: true });
        }

        if (action === 'smart_schedule') {
            const { strategy } = body;

            // 1. Reset EVERYONE to a safe 'base' frequency first (12 hours)
            await query("UPDATE playerup_listings SET frequency = 'Every 12 hours'");

            // 2. Apply Top 50 Strategy
            if (strategy === 'reddit_top50') {
                // Get IDs of top 50 Reddit threads (latest added first)
                const rows: any = await query("SELECT id FROM playerup_listings WHERE platform = 'Reddit' ORDER BY id DESC LIMIT 50");
                const ids = rows.map((r: any) => r.id);
                if (ids.length > 0) {
                    // Update those specific IDs to High Frequency
                    await query(`UPDATE playerup_listings SET frequency = 'Every 2 hours' WHERE id IN (${ids.map(() => '?').join(',')})`, ids);
                }
            } else if (strategy === 'social_top50') {
                // Get IDs of top 50 Social threads (Snapchat, Insta, Other) - anything NOT Reddit
                const rows: any = await query("SELECT id FROM playerup_listings WHERE platform != 'Reddit' ORDER BY id DESC LIMIT 50");
                const ids = rows.map((r: any) => r.id);
                if (ids.length > 0) {
                    await query(`UPDATE playerup_listings SET frequency = 'Every 2 hours' WHERE id IN (${ids.map(() => '?').join(',')})`, ids);
                }
            }

            return NextResponse.json({ success: true, message: "Strategy Applied" });
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
            const limitReached = body.limitReached === true;
            const status = success ? 'success' : (limitReached ? 'limit_reached' : 'failed');

            // 1. Fetch current listing to check reset
            const currentRows: any = await query("SELECT dailyBumpCount, lastResetDate FROM playerup_listings WHERE id = ?", [id]);
            const current = currentRows[0];
            const today = new Date().toISOString().split('T')[0];

            let queryStr = "";
            const queryParams = [];

            if (!current || current.lastResetDate !== today) {
                // Reset for today
                queryStr = "UPDATE playerup_listings SET lastBumped = IF(?, NOW(), lastBumped), lastBumpStatus = ?, dailyBumpCount = IF(?, 1, 0), lastResetDate = ?, limitReached = ? WHERE id = ?";
                queryParams.push(success, status, success, today, limitReached, id);
            } else {
                // Update today's count
                queryStr = "UPDATE playerup_listings SET lastBumped = IF(?, NOW(), lastBumped), lastBumpStatus = ?, dailyBumpCount = dailyBumpCount + IF(?, 1, 0), limitReached = ? WHERE id = ?";
                queryParams.push(success, status, success, limitReached, id);
            }

            await query(queryStr, queryParams);

            // 2. Fetch Title for Log
            const rows: any = await query("SELECT title, url FROM playerup_listings WHERE id = ?", [id]);
            const title = rows[0]?.title || "Unknown Thread";

            // 3. Create Log Entry
            const logId = Date.now().toString();
            let logDetail = "";
            const extError = body.error;

            if (success) {
                if (extError?.includes("Reply Bump")) {
                    logDetail = `Successfully bumped (REPLY): ${title}`;
                } else {
                    logDetail = `Successfully bumped: ${title}`;
                }
            } else if (limitReached) {
                logDetail = `Skipped: Bumping limit reached for ${title}`;
            } else if (extError) {
                logDetail = `Failed: ${extError} for ${title}`;
            } else {
                logDetail = `Failed to bump: ${title}`;
            }

            await query("INSERT INTO activity_logs (id, user, action, details, date) VALUES (?, ?, ?, ?, NOW())",
                [logId, 'System', 'PlayerUp Bump', logDetail]
            );

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
