
// BACKGROUND SERVICE WORKER - Bypasses CORS and handles API requests

// Helper to get storage as a Promise
const getStorage = (keys) => new Promise(resolve => chrome.storage.local.get(keys, resolve));

// Dynamic API Resolver
async function getApiUrl() {
    const res = await getStorage(['last_api_url']);
    return res.last_api_url || "https://officialum1.com";
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    // COOKIE SYNC
    if (request.action === "SYNC_COOKIES") {
        const url = new URL(request.url);
        const baseDomain = url.hostname.split('.').slice(-2).join('.');
        chrome.cookies.getAll({ domain: baseDomain }, async (cookies) => {
            const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
            const apiBase = await getApiUrl();
            fetch(`${apiBase}/api/admin/settings`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Admin-Password": request.adminPass },
                body: JSON.stringify({ action: "save_session", site: baseDomain, cookies: cookieString })
            })
                .then(res => res.ok ? sendResponse({ success: true }) : sendResponse({ success: false }))
                .catch(() => sendResponse({ success: false }));
        });
        return true;
    }

    // REMOTE DASHBOARD COMMANDS
    if (request.action === "REMOTE_SYNC" || request.action === "REMOTE_BUMP" || request.action === "Z2U_SYNC") {
        (async () => {
            const res = await getStorage(['admin_pass']);
            const adminPass = request.adminPass || res.admin_pass;
            const apiBase = await getApiUrl();

            if (!adminPass) {
                console.error("[OfficialUM1] Missing Admin Password.");
                return;
            }

            if (request.action === "Z2U_SYNC") {
                console.log("[OfficialUM1] Starting Z2U Smart Sync...");
                try {
                    let queue = [
                        "https://www.z2u.com/sell/manage",
                        "https://www.z2u.com/sell/manageList?service=5"
                    ];

                    let visited = new Set();
                    let listings = [];
                    let pageCount = 0;

                    while (queue.length > 0 && pageCount < 30) {
                        const targetUrl = queue.shift();
                        if (visited.has(targetUrl)) continue;
                        visited.add(targetUrl);
                        pageCount++;

                        console.log(`[Z2U] Scanning Page ${pageCount}: ${targetUrl}`);

                        // Z2U often requires basic headers to not look like a robot
                        const response = await fetch(targetUrl, {
                            credentials: 'include',
                            headers: {
                                'Accept': 'text/html,application/xhtml+xml,application/xml',
                                'Upgrade-Insecure-Requests': '1'
                            }
                        });

                        if (!response.ok) {
                            console.error(`[Z2U] Failed to fetch ${targetUrl}: ${response.status}`);
                            continue;
                        }

                        const html = await response.text();

                        // 1. Z2U Parsing Logic (Refined for "Fix Issue")
                        if (html.includes("Log In") || html.includes("Sign In") || html.includes("login-form")) {
                            console.error("[Z2U] Login Page Detected! Cookie might be invalid or expired.");
                            // Attempt to notify UI? 
                            continue;
                        }

                        // Debug: Log first 200 chars to ensure we got HTML
                        console.log(`[Z2U] Page Preview: ${html.substring(0, 100).replace(/\n/g, ' ')}...`);

                        // Find valid rows (tr or div with product info)
                        // Relaxed: match ANY container that has a product link
                        const itemRegex = /<(?:tr|div)[^>]*class=["']?[^"']*(?:item|row|list)[^"']*["']?[^>]*>([\s\S]*?)<\/(?:tr|div)>/gi;
                        // Fallback: standard table rows
                        const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;

                        let loopRegex = rowRegex;
                        // Check if we find matches with rowRegex, if not try itemRegex
                        if ((html.match(rowRegex) || []).length < 2) loopRegex = itemRegex;

                        let match;
                        while ((match = loopRegex.exec(html)) !== null) {
                            const content = match[1];

                            // Critical Indicator: Must have a product link or ID
                            if (!content.includes('products/') && !content.includes('data-id=') && !content.includes('manage/edit')) continue;

                            // ID Extraction
                            const idMatch = content.match(/data-id=["'](\d+)["']/)
                                || content.match(/id=["']\D*(\d+)["']/)
                                || content.match(/products\/(\d+)\.html/)
                                || content.match(/manage\/edit\?id=(\d+)/);

                            if (!idMatch) continue;
                            const id = idMatch[1];

                            let title = `Z2U Listing #${id}`;
                            // Title Extraction: Look for the product link anchor text
                            // Regex: <a href="...products/..." ... > TITLE </a>
                            const titleRegex = /<a[^>]+href=["'][^"']*products\/\d+\.html["'][^>]*>([\s\S]*?)<\/a>/i;
                            const tMatch = content.match(titleRegex);
                            if (tMatch) {
                                title = tMatch[1].replace(/<[^>]*>/g, '').trim();
                            } else {
                                // Fallback: look for ANY meaningful link valid for a title
                                const genericLink = content.match(/<a[^>]*class=["'][^"']*title[^"']*["'][^>]*>([\s\S]*?)<\/a>/i);
                                if (genericLink) title = genericLink[1].replace(/<[^>]*>/g, '').trim();
                            }

                            if (title.length < 3) title = `Listing ${id}`; // Safety

                            // Price & Stock
                            const priceMatch = content.match(/(?:\$|USD)\s*([\d,]+\.?\d*)/i) || content.match(/class=["']price["'][^>]*>([\s\S]*?)<\/span>/i);
                            const stockMatch = content.match(/Stock:?\s*(\d+)/i) || content.match(/value=["'](\d+)["'][^>]*name=["']stock["']/i) || content.match(/>\s*(\d+)\s*</);

                            const price = priceMatch ? priceMatch[1].replace(/[^\d.]/g, '') : "0.00";
                            const stock = stockMatch ? stockMatch[1].replace(/[^\d]/g, '') : "1";

                            const status = (content.toLowerCase().includes('active') || content.includes('manage/offline')) ? 'Active' : 'Deactivated';

                            listings.push({
                                id,
                                title: title.replace(/&amp;/g, '&'),
                                url: `https://www.z2u.com/products/${id}.html`,
                                price,
                                stock,
                                status
                            });
                        }

                        console.log(`[Z2U] Found ${listings.length} listings so far...`);

                        // 2. Find Next Page (Robust Finder)
                        // Look for a link with text "Next", or class "next"
                        const nextMatch = html.match(/<a[^>]+href="([^"]+)"[^>]*>[^<]*Next[^<]*<\/a>/i) || html.match(/<a[^>]+class="[^"]*next[^"]*"[^>]+href="([^"]+)"/i);
                        if (nextMatch) {
                            let nextUrl = nextMatch[1];
                            if (!nextUrl.startsWith('http')) nextUrl = "https://www.z2u.com" + (nextUrl.startsWith('/') ? '' : '/') + nextUrl;
                            if (!visited.has(nextUrl)) queue.push(nextUrl);
                        }

                        // Batch upload every page
                        if (listings.length > 0) {
                            await fetch(`${apiBase}/api/admin/z2u`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json", "X-Admin-Password": adminPass },
                                body: JSON.stringify({ action: "turbo_sync", listings })
                            });
                            // Clear batch to avoid re-sending
                            listings = [];
                        }
                        await new Promise(r => setTimeout(r, 2000));
                    }
                    console.log("[OfficialUM1] Z2U Sync Complete.");
                } catch (e) { console.error("Z2U Sync Error:", e); }

            } else if (request.action === "REMOTE_SYNC") {
                console.log("[OfficialUM1] Starting PlayerUp Crawler...");

                // Expanded queue to catch all variations
                let queue = [
                    "https://www.playerup.com/accounts/-/threads",
                    "https://www.playerup.com/accounts/-/postings",
                    "https://www.playerup.com/accounts/threads",
                    "https://www.playerup.com/accounts/postings"
                ];
                let visited = new Set();
                let pageCount = 0;

                while (queue.length > 0 && pageCount < 50) {
                    const url = queue.shift();
                    if (visited.has(url)) continue;
                    visited.add(url);
                    pageCount++;

                    console.log(`[PlayerUp] Crawling Page ${pageCount}: ${url}`);

                    try {
                        // Removed custom User-Agent to avoid Cloudflare flags
                        const response = await fetch(url, { credentials: 'include' });
                        if (!response.ok) continue;
                        const html = await response.text();

                        // 1. Extract Listings - Relaxed Regex
                        // Matches href=".../threads/..." and captures URL and Title
                        const threadRegex = /href="([^"]*\/threads\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
                        const listings = [];
                        let match;
                        while ((match = threadRegex.exec(html)) !== null) {
                            let threadUrl = match[1];
                            const title = match[2].replace(/<[^>]*>/g, '').trim();

                            // Basic filtering
                            if (threadUrl.includes('page-') || threadUrl.includes('#') || title.length < 5) continue;

                            if (threadUrl.startsWith('/')) threadUrl = "https://www.playerup.com" + threadUrl;
                            listings.push({ url: threadUrl, title });
                        }

                        if (listings.length > 0) {
                            await fetch(`${apiBase}/api/admin/playerup`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json", "X-Admin-Password": adminPass },
                                body: JSON.stringify({ action: "turbo_sync", listings })
                            });
                        }

                        // 2. Find "Next >" Button (Robust)
                        const nextLinkRegex = /<a[^>]+href="([^"]+)"[^>]*class="[^"]*pageNav-jump--next[^"]*"|<a[^>]+class="[^"]*pageNav-jump--next[^"]*"[^>]*href="([^"]+)"/i;
                        const nextMatch = nextLinkRegex.exec(html);

                        if (nextMatch) {
                            let nextUrl = nextMatch[1] || nextMatch[2];
                            if (nextUrl) {
                                if (nextUrl.startsWith('/')) nextUrl = "https://www.playerup.com" + nextUrl;
                                nextUrl = nextUrl.replace(/&amp;/g, '&');
                                if (!visited.has(nextUrl)) queue.push(nextUrl);
                            }
                        }
                        await new Promise(r => setTimeout(r, 1200));

                    } catch (e) { console.error("Page Fetch failed", url, e); }
                }
                console.log("[OfficialUM1] PlayerUp Sync Finished.");

            } else {
                // BUMPING LOGIC (Hybrid: Fetch -> Tab Fallback)
                try {
                    const fallbackBump = async (url) => {
                        // Open tab, wait, close
                        const tab = await chrome.tabs.create({ url: url, active: false });
                        await new Promise(r => setTimeout(r, 5000)); // Wait for load
                        await chrome.tabs.remove(tab.id);
                        return true;
                    };

                    const verifyBump = async (url) => {
                        const upUrl = url.replace(/\/$/, '') + '/up';
                        try {
                            const res = await fetch(upUrl, { credentials: 'include' });
                            if (!res.ok) throw new Error("Fetch Failed");
                            const text = await res.text();
                            if (res.url.includes('login') || text.includes('Log in') || text.includes('error')) {
                                throw new Error("Login/Error detected");
                            }
                            return true;
                        } catch (e) {
                            console.log("Fetch bump failed, trying Tab Fallback...", e);
                            return await fallbackBump(upUrl);
                        }
                    };

                    if (request.singleUrl) {
                        const success = await verifyBump(request.singleUrl);
                        if (request.id) {
                            await fetch(`${apiBase}/api/admin/playerup`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json", "X-Admin-Password": adminPass },
                                body: JSON.stringify({ action: "update_bump", id: request.id, success })
                            });
                        }
                    } else {
                        const listRes = await fetch(`${apiBase}/api/admin/playerup`);
                        const data = await listRes.json();
                        let targets = Array.isArray(data) ? data : (data.listings || []);
                        if (request.limit > 0) targets = targets.slice(0, request.limit);

                        for (const item of targets) {
                            const success = await verifyBump(item.url);
                            await fetch(`${apiBase}/api/admin/playerup`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json", "X-Admin-Password": adminPass },
                                body: JSON.stringify({ action: "update_bump", id: item.id, success })
                            });
                            await new Promise(r => setTimeout(r, 2000));
                        }
                    }
                } catch (e) { console.error("Bump Error:", e); }
            }
        })();
        sendResponse({ success: true });
        return true;
    }

    // SYNC DATA TO SERVER
    if (request.action === "SYNC_TO_SERVER") {
        (async () => {
            const apiBase = await getApiUrl();
            fetch(`${apiBase}/api/admin/playerup`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Admin-Password": request.adminPass },
                body: JSON.stringify({ action: "turbo_sync", listings: request.listings })
            })
                .then(res => res.json())
                .then(data => sendResponse({ success: true, count: data.count }))
                .catch(err => sendResponse({ success: false, error: err.message }));
        })();
        return true;
    }
});

// AUTO-BUMP ENGINE
let _isLooping = false;
async function startBumpLoop() {
    if (_isLooping) return;
    _isLooping = true;
    console.log("[OfficialUM1] Auto-Bump Loop Started.");
    while (true) {
        try {
            await runAutoBumpEngine();
        } catch (e) { console.error("Loop Error:", e); }
        await new Promise(r => setTimeout(r, 15000)); // Every 15s
    }
}

async function runAutoBumpEngine() {
    const res = await getStorage(['admin_pass']);
    const adminPass = res.admin_pass;
    const apiBase = await getApiUrl();
    if (!adminPass) return;

    try {
        const listRes = await fetch(`${apiBase}/api/admin/playerup`);
        if (!listRes.ok) return;
        const listings = await listRes.json();
        const activeListings = (Array.isArray(listings) ? listings : (listings.listings || []))
            .filter(l => l.status === 'Active');

        const now = Date.now();
        for (const item of activeListings) {
            const lastBump = item.lastBumped ? new Date(item.lastBumped).getTime() : 0;
            let intervalMs = 24 * 60 * 60 * 1000; // Default 24h

            const freq = item.frequency.toLowerCase();
            if (freq.includes('5 seconds')) intervalMs = 5000;
            else if (freq.includes('15 seconds')) intervalMs = 15000;
            else if (freq.includes('30 seconds')) intervalMs = 30000;
            else if (freq.includes('1 minute')) intervalMs = 60000;
            else if (freq.includes('2 minutes')) intervalMs = 120000;
            else if (freq.includes('5 minutes')) intervalMs = 5 * 60000;
            else if (freq.includes('10 minutes')) intervalMs = 10 * 60000;
            else if (freq.includes('30 minutes')) intervalMs = 30 * 60000;
            else if (freq.includes('1 hour')) intervalMs = 60 * 60000;
            else if (freq.includes('2 hours')) intervalMs = 2 * 60 * 60000;
            else if (freq.includes('6 hours')) intervalMs = 6 * 60 * 60000;
            else if (freq.includes('12 hours')) intervalMs = 12 * 60 * 60000;

            if (now - lastBump >= intervalMs) {
                console.log(`[OfficialUM1] Bumping: ${item.title}`);
                const upUrl = item.url.replace(/\/$/, '') + '/up';
                let success = false;

                try {
                    const bumpRes = await fetch(upUrl, { credentials: 'include' });
                    if (bumpRes.ok) {
                        const text = await bumpRes.text();
                        const finalUrl = bumpRes.url;

                        // Strict Verification:
                        // 1. Must not be a login page
                        // 2. Must not contain "do not have permission" or "log in"
                        // 3. Must not be the same as the thread URL (it should redirect)
                        const isLogin = finalUrl.includes('login') || text.includes('Log in');
                        const noPermission = text.includes('do not have permission') || text.includes('error_not_found');

                        if (!isLogin && !noPermission) {
                            success = true;
                        } else {
                            console.warn(`[OfficialUM1] Bump failed for ${item.title}: Permission Denied or Login required.`);
                        }
                    }
                } catch (e) { console.error("Bump Failure", e); }

                await fetch(`${apiBase}/api/admin/playerup`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "X-Admin-Password": adminPass },
                    body: JSON.stringify({ action: "update_bump", id: item.id, success })
                });
                await new Promise(r => setTimeout(r, 2000));
            }
        }
    } catch (e) { console.error("Engine Error:", e); }
}

startBumpLoop();
startZ2UKeepAlive();

async function startZ2UKeepAlive() {
    console.log("[OfficialUM1] Z2U Keep-Alive Service Started.");
    while (true) {
        try {
            // Fetching these pages keeps the user "Online" on Z2U
            await fetch("https://www.z2u.com/sell/manage", { credentials: 'include' });
            await fetch("https://www.z2u.com/chat/list", { credentials: 'include' });
            console.log("[OfficialUM1] Z2U Keep-Alive Ping Sent 🔔");
        } catch (e) {
            console.error("Z2U Keep-Alive Failed:", e);
        }
        // Ping every 3 minutes (180s)
        await new Promise(r => setTimeout(r, 180000));
    }
}
