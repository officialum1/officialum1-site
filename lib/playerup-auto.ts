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
    } catch (e) { }

    // 2. Fetch Listings - SMART SCHEDULING
    // Fetch all candidates that are set to Auto Bump
    const allCandidates: any = await query("SELECT id, title, url, dailyBumpCount, lastResetDate, limitReached, lastBumped, frequency FROM playerup_listings WHERE autoBump = 1 AND status = 'Active'");

    const now = Date.now();
    const due = [];

    for (const item of allCandidates) {
        // Default frequency: 4 hours
        let interval = 4 * 60 * 60 * 1000;

        if (item.frequency) {
            const f = item.frequency.toLowerCase();
            const val = parseInt(f.replace(/[^0-9]/g, '')) || 1;

            if (f.includes('second')) interval = val * 1000;
            else if (f.includes('minute')) interval = val * 60 * 1000;
            else if (f.includes('hour')) interval = val * 60 * 60 * 1000;
            else if (f.includes('day')) interval = val * 24 * 60 * 60 * 1000;
        }

        const last = item.lastBumped ? new Date(item.lastBumped).getTime() : 0;

        // Smart Jitter: Calculate a consistent random offset for this item based on its ID
        // This ensures the item bump time "drifts" slightly in a human-like way (0-20 mins)
        // using simple checksum of ID
        const idSum = item.id.split('').reduce((acc: any, char: any) => acc + char.charCodeAt(0), 0);
        const jitter = (idSum % 20) * 60 * 1000; // 0 to 19 minutes delay

        // Check if due (Interval + Jitter)
        if (now - last >= (interval + jitter)) {
            // Check Daily Limit (4 per day)
            const today = new Date().toISOString().split('T')[0];
            const isToday = item.lastResetDate === today;

            // If it's a new day, reset logic handles it during update, but for selection we assume 0 count if not today
            const currentCount = isToday ? item.dailyBumpCount : 0;

            if (currentCount < 4) {
                due.push(item);
            }
        }
    }

    // Sort by oldest bump first
    due.sort((a, b) => {
        const tA = a.lastBumped ? new Date(a.lastBumped).getTime() : 0;
        const tB = b.lastBumped ? new Date(b.lastBumped).getTime() : 0;
        return tA - tB;
    });

    // Apply batch limit (Default 50 to avoid timeouts/bans)
    const batchSize = limit > 0 ? limit : 50;
    const listings = due.slice(0, batchSize);

    console.log(`[Auto-Cloud] Found ${due.length} due items. Processing batch of ${listings.length}.`);

    const today = new Date().toISOString().split('T')[0];
    let bumpCount = 0;

    // Process in small parallel chunks (5 at a time) to save CPU time
    const chunkSize = 5;
    for (let i = 0; i < listings.length; i += chunkSize) {
        const chunk = listings.slice(i, i + chunkSize);

        await Promise.all(chunk.map(async (item: any) => {
            try {
                const headers = {
                    "Cookie": cookies,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Referer": item.url,
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-Fetch-User": "?1",
                    "Upgrade-Insecure-Requests": "1",
                    "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                    "Sec-Ch-Ua-Mobile": "?0",
                    "Sec-Ch-Ua-Platform": '"Windows"',
                    "Cache-Control": "max-age=0",
                    "DNT": "1"
                };

                const upUrl = `${item.url.replace(/\/$/, '')}/up`;
                const res = await fetch(upUrl, { headers });

                let limitReached = false;
                let success = false;
                let errorCode = res.status;
                let errorText = "";

                if (res.ok) {
                    const text = await res.text();
                    if (text.includes("reached todays max bumping limit") || text.includes("4 bump(s) per day")) {
                        limitReached = true;
                    } else if (text.toLowerCase().includes("log in") || text.toLowerCase().includes("login") || text.includes("Security Check")) {
                        errorCode = 401; // Treat security checks as auth failures for retry logic
                        errorText = "Login/Security Check";
                    } else {
                        success = true;
                    }
                } else {
                    errorText = res.statusText;
                }

                // If 429 Too Many Requests, stop everything
                if (res.status === 429) {
                    console.warn("[Auto-Cloud] 429 Too Many Requests. Backing off.");
                    // Optionally pause system here?
                }

                const status = success ? 'success' : (limitReached ? 'limit_reached' : 'failed');

                if (item.lastResetDate !== today) {
                    await query("UPDATE playerup_listings SET lastBumped = IF(?, NOW(), lastBumped), dailyBumpCount = IF(?, 1, 0), lastResetDate = ?, lastBumpStatus = ?, limitReached = ? WHERE id = ?", [success, success, today, status, limitReached, item.id]);
                } else {
                    await query("UPDATE playerup_listings SET lastBumped = IF(?, NOW(), lastBumped), dailyBumpCount = dailyBumpCount + IF(?, 1, 0), lastBumpStatus = ?, limitReached = ? WHERE id = ?", [success, success, status, limitReached, item.id]);
                }

                const logId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
                let logDetail = "";
                if (success) {
                    logDetail = `Auto-Cloud: Successfully bumped ${item.title}`;
                    bumpCount++;
                } else if (limitReached) {
                    logDetail = `Auto-Cloud Skipped: Limit reached for ${item.title}`;
                } else if (errorCode === 401 || errorText.includes("Security")) {
                    logDetail = `Auto-Cloud Failed: LOGIN/SECURITY CHECK for ${item.title}`;
                } else {
                    logDetail = `Auto-Cloud Failed: Blocked (${errorCode}) for ${item.title}`;
                }

                // Log unique failures or successes
                if (success || limitReached || errorCode) {
                    // Only log if not a mass block (to keep UI clean)
                    if (errorCode === 403) {
                        // Silent skip or summary log
                    } else {
                        await query("INSERT INTO activity_logs (id, user, action, details, date) VALUES (?, ?, ?, ?, NOW())", [logId, 'System', 'PlayerUp Bump', logDetail]);
                    }
                }

            } catch (e: any) {
                console.error(`[Auto-Cloud] Error processing ${item.title}:`, e);
            }
        }));

        // Randomized delay between chunks to appear human (5s to 15s)
        const delay = Math.floor(Math.random() * 10000) + 5000;
        await new Promise(r => setTimeout(r, delay));
    }

    // FINAL SUMMARY LOG IF BLOCKED
    if (bumpCount === 0 && listings.length > 0) {
        await query("INSERT INTO activity_logs (id, user, action, details, date) VALUES (?, ?, ?, ?, NOW())",
            [Date.now().toString(), 'System', 'PlayerUp Status', `Server Bumping is BLOCKED (403) by PlayerUp. The Extension will take over automation in the background.`]);
    }

    console.log(`[Auto-Cloud] Finished Batch. Bumped ${bumpCount} threads.`);
    return { success: true, bumped: bumpCount };
}
