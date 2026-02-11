
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
                const dashboardTabId = sender.tab ? sender.tab.id : null;
                console.log("[OfficialUM1] Starting Z2U Stealth Sync via Dashboard", dashboardTabId);

                if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_LOG", message: "Opening stealth window..." });

                // Try Primary URL: https://www.z2u.com/sell/manageList
                // Fallback URL: https://www.z2u.com/product/manage/index
                const primaryUrl = 'https://www.z2u.com/sell/manageList';
                const fallbackUrl = 'https://www.z2u.com/product/manage/index';

                await new Promise((resolve) => {
                    chrome.windows.create({ url: primaryUrl, state: 'minimized' }, async (win) => {
                        const tabId = win.tabs && win.tabs.length > 0 ? win.tabs[0].id : null;
                        if (!tabId) { resolve(); return; }

                        let foundCount = 0;

                        // Reusable Scraper Logic
                        const runScraper = async (mode) => {
                            if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_LOG", message: `Scanning ${mode}...` });

                            // 1. Wait
                            const waitForContent = () => new Promise(r => {
                                let attempts = 0;
                                const check = () => {
                                    if (attempts > 15) { r(false); return; }
                                    chrome.scripting.executeScript({
                                        target: { tabId: tabId },
                                        func: () => document.querySelectorAll('tr[data-id], .item, .list-item').length > 0
                                    }).then(res => {
                                        if (res && res[0] && res[0].result === true) r(true);
                                        else { attempts++; setTimeout(check, 500); }
                                    }).catch(() => r(false));
                                };
                                const listener = (tid, changeInfo) => {
                                    if (tid === tabId && changeInfo.status === 'complete') {
                                        chrome.tabs.onUpdated.removeListener(listener);
                                        setTimeout(check, 1000);
                                    }
                                };
                                chrome.tabs.onUpdated.addListener(listener);
                            });
                            await waitForContent();

                            // 2. Scrape
                            try {
                                const results = await chrome.scripting.executeScript({
                                    target: { tabId: tabId },
                                    func: () => {
                                        const listings = [];
                                        const rows = Array.from(document.querySelectorAll('tr, .item, .row, .list, .list-item'));
                                        for (const row of rows) {
                                            const html = row.outerHTML;
                                            const idMatch = html.match(/data-id=["'](\d+)["']/) || html.match(/id=["']\D*(\d+)["']/) || html.match(/products\/(\d+)\.html/) || html.match(/manage\/edit\?id=(\d+)/);
                                            if (!idMatch) continue;
                                            const id = idMatch[1];
                                            if (listings.some(l => l.id === id)) continue;

                                            let title = `Z2U Listing #${id}`;
                                            const tEl = row.querySelector('a[href*="products"], .title, .product-name, h3, h4');
                                            if (tEl) title = tEl.innerText.trim();

                                            let price = "0.00";
                                            const pMatch = html.match(/(?:\$|USD)\s*([\d,]+\.?\d*)/i) || html.match(/class=["']price["'][^>]*>([\s\S]*?)<\/span>/i);
                                            if (pMatch) price = pMatch[1].replace(/[^\d.]/g, '');

                                            let stock = "1";
                                            const sMatch = html.match(/Stock:?\s*(\d+)/i) || html.match(/>(\d+)<\/td>\s*<td[^>]*>[^<]*<\/td>\s*<td[^>]*Actions/i);
                                            if (sMatch) stock = sMatch[1];

                                            const status = (html.toLowerCase().includes('publish') || html.includes('active') || html.includes('manage/offline')) ? 'Active' : 'Deactivated';

                                            listings.push({ id, title, url: `https://www.z2u.com/products/${id}.html`, price, stock, status });
                                        }
                                        return { listings, count: listings.length, url: window.location.href };
                                    }
                                });

                                if (results && results[0] && results[0].result) {
                                    const data = results[0].result;
                                    if (data.count > 0) {
                                        return data; // Success return Object
                                    }
                                }
                            } catch (e) { console.error("Scrape Error", e); }
                            return null; // Failed
                        };

                        // TRY 1: Primary URL
                        let data = await runScraper("Standard Dashboard");

                        if (!data) {
                            // FAIL: Try Fallback
                            if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_LOG", message: "Standard URL empty. Trying fallback..." });
                            await chrome.tabs.update(tabId, { url: fallbackUrl });
                            data = await runScraper("Legacy Dashboard");
                        }

                        if (data && data.listings.length > 0) {
                            if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_LOG", message: `Found ${data.count} items!` });
                            foundCount = data.count;

                            await fetch(`${apiBase}/api/admin/z2u`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json", "X-Admin-Password": adminPass },
                                body: JSON.stringify({ action: "turbo_sync", listings: data.listings, debug_url: data.url })
                            });
                        }

                        if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_RESULT", count: foundCount });

                        setTimeout(() => chrome.windows.remove(win.id), 500);
                        resolve();
                    });
                });
            }
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
            } catch (e) {
                console.error("Bump Error:", e);
            }
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

// ALARM SYSTEM - Keeps Service Worker alive and running tasks
chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create("OFFICIALUM1_HEARTBEAT", { periodInMinutes: 1 });
    startFastLoop();
});

chrome.runtime.onStartup.addListener(() => {
    startFastLoop();
});

let _isRunningFastLoop = false;

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "OFFICIALUM1_HEARTBEAT") {
        console.log("[OfficialUM1] Heartbeat Alarm Triggered 💓 - Ensuring Fast Loop is active.");
        startFastLoop();
    }
});

// Fast Loop: Runs every 10 seconds to support 5s/15s/30s/1m frequencies
async function startFastLoop() {
    if (_isRunningFastLoop) return;
    _isRunningFastLoop = true;

    // We run for about 55 seconds, then yield so the next alarm can take over
    const startTime = Date.now();
    while (Date.now() - startTime < 55000) {
        try {
            await runAutoBumpEngine();
            await runZ2UKeepAlive();
        } catch (e) { console.error("Fast Loop Error:", e); }

        await new Promise(r => setTimeout(r, 10000)); // 10s precision
    }

    _isRunningFastLoop = false;
}

// Run immediately on startup
startFastLoop();

async function runZ2UKeepAlive() {
    try {
        // Fetching these pages keeps the user "Online" on Z2U
        await fetch("https://www.z2u.com/sell/manage", { credentials: 'include' });
        await fetch("https://www.z2u.com/chat/list", { credentials: 'include' });
        console.log("[OfficialUM1] Z2U Keep-Alive Ping Sent 🔔");
    } catch (e) {
        console.error("Z2U Keep-Alive Failed:", e);
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
                console.log(`[OfficialUM1] Auto-Bumping: ${item.title}`);
                await performBumpAction(item, adminPass, apiBase);
                // Safety delay between bumps
                await new Promise(r => setTimeout(r, 3000));
            }
        }
    } catch (e) { console.error("Engine Error:", e); }
}

async function performBumpAction(item, adminPass, apiBase) {
    const threadUrl = item.url;
    let success = false;

    console.log(`[OfficialUM1] Starting Stealth Bump for: ${item.title}`);

    try {
        await new Promise((resolve) => {
            chrome.windows.create({ url: threadUrl, state: 'minimized' }, async (win) => {
                const tabId = win.tabs && win.tabs.length > 0 ? win.tabs[0].id : null;
                if (!tabId) { resolve(false); return; }

                // Wait for load
                const waitForLoad = () => new Promise(r => {
                    const listener = (tid, changeInfo) => {
                        if (tid === tabId && changeInfo.status === 'complete') {
                            chrome.tabs.onUpdated.removeListener(listener);
                            setTimeout(r, 2000);
                        }
                    };
                    chrome.tabs.onUpdated.addListener(listener);
                });
                await waitForLoad();

                // Inject Click Script
                try {
                    const results = await chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        func: () => {
                            const btn = document.querySelector('a.UpControl.UpButtonView') || document.getElementById('upButtonCountdown');
                            if (btn) {
                                btn.click();
                                return true;
                            }
                            return false;
                        }
                    });

                    if (results && results[0] && results[0].result === true) {
                        success = true;
                        console.log("[OfficialUM1] Bump Clicked Successfully!");
                        // Wait for action to register
                        await new Promise(r => setTimeout(r, 2000));
                    } else {
                        console.warn("[OfficialUM1] Bump button not found on page.");
                    }
                } catch (e) {
                    console.error("Bump Script Failed", e);
                }

                setTimeout(() => {
                    chrome.windows.remove(win.id);
                    resolve(success);
                }, 1000);
            });
        });

    } catch (e) {
        console.error("Bump Window process failed", e);
    }

    await fetch(`${apiBase}/api/admin/playerup`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Password": adminPass },
        body: JSON.stringify({ action: "update_bump", id: item.id, success })
    });
}

// Remove fallbackBump as it's no longer needed or used
async function fallbackBump(url) { return false; }
