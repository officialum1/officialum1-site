
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
                        "https://www.z2u.com/sell/manageList?service=5&game=15132",
                        "https://www.z2u.com/sell/manageList?service=5&game=15133"
                    ];

                    let visited = new Set();
                    let listings = [];

                    while (queue.length > 0) {
                        const targetUrl = queue.shift();
                        if (visited.has(targetUrl)) continue;
                        visited.add(targetUrl);

                        console.log(`[Z2U] Scanning: ${targetUrl}`);
                        const response = await fetch(targetUrl, { credentials: 'include' });
                        if (!response.ok) continue;

                        const html = await response.text();

                        // 1. Parse Listings
                        const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
                        const idRegex = /data-id="(\d+)"|id="listing-(\d+)"|#(\d{6,})/;
                        const titleRegex = /<a[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/a>|<div[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/div>/;

                        let match;
                        while ((match = rowRegex.exec(html)) !== null) {
                            const content = match[1];
                            const urlMatch = content.match(/href="[^"]*products\/(\d+)\.html"/);
                            const id = urlMatch ? urlMatch[1] : (content.match(idRegex) || match[0].match(idRegex))?.[1];
                            let titleMatch = content.match(titleRegex);
                            let titleStr = titleMatch ? (titleMatch[1] || titleMatch[2]).replace(/<[^>]*>/g, '').trim() : "";
                            if (!titleStr) {
                                const anyLink = content.match(/<a[^>]*>([^<]{10,})<\/a>/);
                                if (anyLink) titleStr = anyLink[1].trim();
                            }

                            if (id && titleStr && titleStr.length > 5) {
                                listings.push({
                                    id, title: titleStr,
                                    url: `https://www.z2u.com/products/${id}.html`,
                                    price: (content.match(/unit-price">([\s\S]*?)<\/span>|\$([\d.]+)/)?.[1] || "0").replace(/[^\d.]/g, ''),
                                    stock: (content.match(/stock-input"[^>]*value="(\d+)"|stock">(\d+)<\/div>|(\d+)\s*Stock/)?.[1] || "0"),
                                    status: content.includes('Deactivate') || content.includes('Active') ? 'Active' : 'Deactivated'
                                });
                            }
                        }

                        // 2. Find Next Page (Robust Finder)
                        const nextMatch = html.match(/href="([^"]+)"[^>]*>[^<]*Next[^<]*<\/a>/i) || html.match(/<a[^>]+href="([^"]+)"[^>]*class="[^"]*next[^"]*"/i);
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
                                body: JSON.stringify({ action: "turbo_sync", listings: listings.splice(0, listings.length) })
                            });
                        }
                        await new Promise(r => setTimeout(r, 1500));
                    }
                } catch (e) { console.error("Z2U Sync Error:", e); }

            } else if (request.action === "REMOTE_SYNC") {
                console.log("[OfficialUM1] Starting PlayerUp Crawler...");

                // Start with both Postings (replies/activity) and Threads (topics created)
                let queue = [
                    "https://www.playerup.com/accounts/-/threads",
                    "https://www.playerup.com/accounts/-/postings"
                ];
                let visited = new Set();
                let pageCount = 0;

                while (queue.length > 0 && pageCount < 50) { // Increased limit
                    const url = queue.shift();
                    if (visited.has(url)) continue;
                    visited.add(url);
                    pageCount++;

                    console.log(`[PlayerUp] Crawling Page ${pageCount}: ${url}`);

                    try {
                        const response = await fetch(url, { credentials: 'include' });
                        if (!response.ok) continue;
                        const html = await response.text();

                        // 1. Extract Listings
                        const threadRegex = /href="([^"]*\/threads\/[^"]+\.\d+\/?)"[^>]*>([\s\S]*?)<\/a>/g;
                        const listings = [];
                        let match;
                        while ((match = threadRegex.exec(html)) !== null) {
                            let threadUrl = match[1];
                            if (threadUrl.startsWith('/')) threadUrl = "https://www.playerup.com" + threadUrl;
                            listings.push({ url: threadUrl, title: match[2].replace(/<[^>]*>/g, '').trim() });
                        }

                        if (listings.length > 0) {
                            await fetch(`${apiBase}/api/admin/playerup`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json", "X-Admin-Password": adminPass },
                                body: JSON.stringify({ action: "turbo_sync", listings })
                            });
                        }

                        // 2. Find "Next >" Button (Handle arbitrary attribute order)
                        // Matches <a ... class="...pageNav-jump--next..." ... href="..." ...> OR <a ... href="..." ... class="...pageNav-jump--next..." ...>
                        const nextLinkRegex = /<a[^>]+href="([^"]+)"[^>]*class="[^"]*pageNav-jump--next[^"]*"|<a[^>]+class="[^"]*pageNav-jump--next[^"]*"[^>]*href="([^"]+)"/i;
                        const nextMatch = nextLinkRegex.exec(html);

                        if (nextMatch) {
                            let nextUrl = nextMatch[1] || nextMatch[2];
                            if (nextUrl) {
                                if (nextUrl.startsWith('/')) nextUrl = "https://www.playerup.com" + nextUrl;
                                // Decode entities like &amp; to &
                                nextUrl = nextUrl.replace(/&amp;/g, '&');
                                if (!visited.has(nextUrl)) queue.push(nextUrl);
                            }
                        }

                        await new Promise(r => setTimeout(r, 1000));

                    } catch (e) { console.error("Page Fetch failed", url, e); }
                }

                console.log("[OfficialUM1] PlayerUp Sync Finished.");

            } else {
                // BUMPING LOGIC (With Validation)
                try {
                    const verifyBump = async (url) => {
                        const upUrl = url.replace(/\/$/, '') + '/up';
                        const res = await fetch(upUrl, { credentials: 'include' });
                        if (!res.ok) return false;

                        const finalUrl = res.url;
                        const text = await res.text();

                        if (finalUrl.includes('login') || text.includes('Log in')) return false;
                        if (text.includes('error') && !text.includes('success')) return false;
                        return true;
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
                            await new Promise(r => setTimeout(r, 1200));
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
            let intervalMs = 24 * 60 * 60 * 1000;

            if (item.frequency.includes('5 seconds')) intervalMs = 5000;
            else if (item.frequency.includes('15 seconds')) intervalMs = 15000;
            else if (item.frequency.includes('30 seconds')) intervalMs = 30000;
            else if (item.frequency.includes('1 minute')) intervalMs = 60000;
            else if (item.frequency.includes('5 minutes')) intervalMs = 5 * 60000;
            else if (item.frequency.includes('1 hour')) intervalMs = 60 * 60000;

            if (now - lastBump >= intervalMs) {
                console.log(`[OfficialUM1] Bumping: ${item.title}`);
                const upUrl = item.url.replace(/\/$/, '') + '/up';
                let success = false;

                try {
                    const bumpRes = await fetch(upUrl, { credentials: 'include' });
                    if (bumpRes.ok) {
                        const text = await bumpRes.text();
                        const finalUrl = bumpRes.url;
                        if (!finalUrl.includes('login') && !text.includes('Log in') && !text.includes('error')) {
                            success = true;
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
