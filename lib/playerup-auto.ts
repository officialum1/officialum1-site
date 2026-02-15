import { query } from './db';

export async function runCloudBump(limit: number = 0) {
    // 🔥 MASTER SWITCH CHECK
    const statusRows: any = await query("SELECT setting_value FROM settings WHERE setting_key = 'playerup_bump_enabled'");
    if (statusRows[0]?.setting_value === 'false') {
        console.log("[Auto-Cloud] Bumping is PAUSED. Skipping.");
        return { success: false, error: "Paused" };
    }

    console.log("[Auto-Cloud] Starting Scheduled Bump...");

    // 1. Get Cookies
    const siteKeys = ['session_cookies_www_playerup_com', 'session_cookies_playerup_com'];
    let cookies = null;
    for (const key of siteKeys) {
        const rows: any = await query("SELECT setting_value FROM settings WHERE setting_key = ?", [key]);
        if (rows[0]?.setting_value) {
            cookies = rows[0].setting_value;
            break;
        }
    }

    if (!cookies) {
        console.error("[Auto-Cloud] No cookies found. Stopping.");
        return { success: false, error: "No cookies" };
    }

    // 🔥 KEEP-ALIVE: Ping the dashboard to show as "Online/Active"
    try {
        await fetch("https://www.playerup.com/accounts/-/threads", {
            headers: {
                "Cookie": cookies,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
        console.log("[Auto-Cloud] Status Ping: Account marked as Active.");
    } catch (e) { }

    // 2. Fetch Listings
    let sql = "SELECT id, title, url, dailyBumpCount, lastResetDate, limitReached FROM playerup_listings WHERE status = 'Active' ORDER BY lastBumped ASC";
    const params: any[] = [];
    if (limit > 0) {
        sql += " LIMIT ?";
        params.push(limit);
    }

    const listings: any = await query(sql, params);
    const today = new Date().toISOString().split('T')[0];
    let bumpCount = 0;

    for (const item of listings) {
        // Skip if limit reached today
        if (item.limitReached && item.lastResetDate === today) continue;
        if (item.dailyBumpCount >= 4 && item.lastResetDate === today) continue;

        try {
            const headers = {
                "Cookie": cookies,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Referer": item.url,
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "same-origin",
                "Sec-Fetch-User": "?1",
                "Upgrade-Insecure-Requests": "1",
                "DNT": "1"
            };

            const upUrl = `${item.url.replace(/\/$/, '')}/up`;
            const res = await fetch(upUrl, { headers });

            let limitReached = false;
            let success = false;
            let errorCode = res.status;

            if (res.ok) {
                const text = await res.text();
                if (text.includes("reached todays max bumping limit") || text.includes("4 bump(s) per day")) {
                    limitReached = true;
                } else if (text.toLowerCase().includes("log in") || text.toLowerCase().includes("login")) {
                    errorCode = 401; // Fake code for login required
                } else {
                    success = true;
                }
            }

            const status = success ? 'success' : (limitReached ? 'limit_reached' : 'failed');

            // Update Database
            if (item.lastResetDate !== today) {
                await query("UPDATE playerup_listings SET lastBumped = IF(?, NOW(), lastBumped), dailyBumpCount = IF(?, 1, 0), lastResetDate = ?, lastBumpStatus = ?, limitReached = ? WHERE id = ?", [success, success, today, status, limitReached, item.id]);
            } else {
                await query("UPDATE playerup_listings SET lastBumped = IF(?, NOW(), lastBumped), dailyBumpCount = dailyBumpCount + IF(?, 1, 0), lastBumpStatus = ?, limitReached = ? WHERE id = ?", [success, success, status, limitReached, item.id]);
            }

            // Create Log
            const logId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
            let logDetail = "";
            if (success) {
                logDetail = `Auto-Cloud: Successfully bumped ${item.title}`;
            } else if (limitReached) {
                logDetail = `Auto-Cloud Skipped: Limit reached for ${item.title}`;
            } else if (errorCode === 401) {
                logDetail = `Auto-Cloud Failed: LOGIN REQUIRED for ${item.title}`;
            } else {
                logDetail = `Auto-Cloud Failed: Site blocked server (Status: ${errorCode}) for ${item.title}`;
            }

            await query("INSERT INTO activity_logs (id, user, action, details, date) VALUES (?, ?, ?, ?, NOW())", [logId, 'System', 'PlayerUp Bump', logDetail]);

            if (success) bumpCount++;

            // Random delay to mimic human
            await new Promise(r => setTimeout(r, 2000 + Math.random() * 3000));

        } catch (e: any) {
            console.error(`[Auto-Cloud] Error on ${item.url}:`, e.message);
        }
    }

    console.log(`[Auto-Cloud] Finished. Bumped ${bumpCount} threads.`);
    return { success: true, bumped: bumpCount };
}
