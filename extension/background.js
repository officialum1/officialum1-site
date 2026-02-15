
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
        (async () => {
            try {
                const url = new URL(request.url);
                const baseDomain = url.hostname.split('.').slice(-2).join('.');

                // Robust Admin Pass Retrieval
                let adminPass = request.adminPass;
                if (!adminPass) {
                    const stored = await getStorage(['admin_pass']);
                    adminPass = stored.admin_pass;
                }

                chrome.cookies.getAll({ domain: baseDomain }, async (cookies) => {
                    const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
                    const apiBase = await getApiUrl();

                    try {
                        const res = await fetch(`${apiBase}/api/admin/settings`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json", "X-Admin-Password": adminPass },
                            body: JSON.stringify({ action: "save_session", site: baseDomain, cookies: cookieString })
                        });

                        // Try to parse JSON if possible, else just check ok
                        let data;
                        try { data = await res.json(); } catch (e) { data = {}; }

                        if (res.ok) sendResponse({ success: true });
                        else sendResponse({ success: false, error: data.error || 'Server Error' });

                    } catch (e) {
                        console.error("Cookie Sync Error", e);
                        sendResponse({ success: false, error: e.message });
                    }
                });
            } catch (e) { console.error("Sync Logic Fail", e); sendResponse({ success: false }); }
        })();
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
                // Prioritize the user's specific category URL
                const primaryUrl = 'https://www.z2u.com/sell/manageList?service=5&game=15132';
                const fallbackUrl = 'https://www.z2u.com/product/manage/index';

                await new Promise((resolve) => {
                    chrome.windows.create({ url: primaryUrl, state: 'minimized' }, async (win) => {
                        const tabId = win.tabs && win.tabs.length > 0 ? win.tabs[0].id : null;
                        if (!tabId) { resolve(); return; }

                        let foundCount = 0;
                        let lastDebug = "";

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
                            let debugInfo = "";
                            try {
                                const results = await chrome.scripting.executeScript({
                                    target: { tabId: tabId },
                                    func: () => {
                                        const title = document.title;
                                        const bodyText = document.body.innerText.toLowerCase();
                                        const currentUrl = window.location.href;
                                        const isLogin = currentUrl.includes('login') || title.toLowerCase().includes("login") || bodyText.includes("sign in") || bodyText.includes("welcome back");
                                        const htmlLen = document.body.innerHTML.length;
                                        const snippet = document.body.innerText.substring(0, 500).replace(/\s+/g, ' ');

                                        const listings = [];
                                        // Broad selector to catch any list-like element
                                        const rows = Array.from(document.querySelectorAll('tr, .item, .row, .list-item, .table-row, li.gl-item, li.item'));

                                        // Debug info
                                        const rowCount = rows.length;
                                        let firstRowHTML = rowCount > 0 ? rows[0].outerHTML.substring(0, 150) : "N/A";

                                        for (const row of rows) {
                                            const html = row.outerHTML;
                                            // Skip header/control rows
                                            if (row.innerText.includes('Select All') || row.innerText.includes('Batch sort')) continue;

                                            // Strategy 1: Data Attributes or ID Match
                                            // Prioritize longer numbers (5+ digits)
                                            let idMatch = html.match(/data-id=["'](\d{5,})["']/) || html.match(/id=["']\D*(\d{5,})["']/) || html.match(/value=["'](\d{5,})["']/);

                                            // Fallback: Check specific inputs
                                            if (!idMatch) {
                                                const inputs = row.querySelectorAll('input[name="ids[]"], input[type="checkbox"], input[name="id"]');
                                                for (const input of inputs) {
                                                    if (input.value && input.value.length > 5 && /^\d+$/.test(input.value)) {
                                                        idMatch = [null, input.value];
                                                        break;
                                                    }
                                                }
                                            }

                                            // Strategy 2: Link Analysis (href="/products/123.html" or "manage?id=123")
                                            if (!idMatch) {
                                                const links = row.querySelectorAll('a[href]');
                                                for (const link of links) {
                                                    const href = link.getAttribute('href');
                                                    const match = href.match(/products\/(\d+)\.html/) || href.match(/id=(\d+)/);
                                                    if (match) {
                                                        idMatch = match;
                                                        break;
                                                    }
                                                }
                                            }

                                            // Strategy 3: Text Content (ID: 12345)
                                            if (!idMatch) {
                                                const text = row.innerText;
                                                idMatch = text.match(/ID:?\s*(\d{5,})/);
                                            }

                                            if (!idMatch) continue;

                                            const id = idMatch[1];
                                            if (id.length < 5) continue; // Ignore junk IDs
                                            if (listings.some(l => l.id === id)) continue;

                                            let title = `Z2U Listing #${id}`;
                                            const tEl = row.querySelector('a[href*="products"], .title, .product-name, h3, h4, .gl-name');
                                            if (tEl) title = tEl.innerText.trim();
                                            else {
                                                // Fallback: Use text content of the second cell/div
                                                const cells = row.querySelectorAll('td, div');
                                                if (cells.length > 1 && cells[1].innerText.length > 5) title = cells[1].innerText.trim();
                                            }

                                            let price = "0.00";
                                            const pMatch = html.match(/(?:\$|USD)\s*([\d,]+\.?\d*)/i) || html.match(/class=["']price["'][^>]*>([\s\S]*?)<\/span>/i);
                                            if (pMatch) price = pMatch[1].replace(/[^\d.]/g, '');

                                            let stock = "1";
                                            const sMatch = html.match(/Stock:?\s*(\d+)/i) || html.match(/>(\d+)<\/td>\s*<td[^>]*>[^<]*<\/td>\s*<td[^>]*Actions/i);
                                            if (sMatch) stock = sMatch[1];

                                            const status = (html.toLowerCase().includes('publish') || html.includes('active') || html.includes('manage/offline')) ? 'Active' : 'Deactivated';

                                            listings.push({ id, title, url: `https://www.z2u.com/products/${id}.html`, price, stock, status });
                                        }
                                        return { listings, count: listings.length, url: window.location.href, title, isLogin, htmlLen, rowCount, firstRowHTML, snippet };
                                    }
                                });

                                if (results && results[0] && results[0].result) {
                                    const data = results[0].result;
                                    lastDebug = `[${mode}] URL: ${data.url}. Title: ${data.title}. Login? ${data.isLogin}. Rows: ${data.rowCount}. Snippet: ${data.snippet}`;

                                    if (dashboardTabId) {
                                        if (data.isLogin) {
                                            chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_LOG", message: "⚠️ LOGIN DETECTED. Please log in to Z2U!" });
                                            chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_LOG", message: `URL: ${data.url}` });
                                        }
                                        else chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_LOG", message: `Scanned ${mode}: ${data.count} items found.` });
                                    }

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

                        if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_RESULT", count: foundCount, debug: lastDebug });

                        setTimeout(() => chrome.windows.remove(win.id), 500);
                        resolve();
                    });
                });
            } else if (request.action === "REMOTE_SYNC") {
                const dashboardTabId = sender.tab ? sender.tab.id : null;
                const targetUrl = request.detail && request.detail.url ? request.detail.url : (request.url || "https://www.playerup.com/account/threads");
                const isSingle = targetUrl.includes('/threads/');

                console.log("[OfficialUM1] PlayerUp Sync... Target:", targetUrl);
                if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "PU_LOG", message: isSingle ? "Analyzing Single Thread..." : "Launching Stealth Crawler..." });

                await new Promise((resolve) => {
                    chrome.windows.create({ url: targetUrl, state: 'minimized' }, async (win) => {
                        const tabId = win.tabs && win.tabs.length > 0 ? win.tabs[0].id : null;
                        if (!tabId) { resolve(); return; }

                        let allThreads = [];
                        let pageCount = 0;
                        const maxPages = isSingle ? 1 : 100; // Scrape up to 100 pages if not a single thread

                        // 1. Wait for content function
                        const waitForContent = () => new Promise(r => {
                            let attempts = 0;
                            const check = () => {
                                if (attempts > 20) { r(false); return; }
                                chrome.scripting.executeScript({
                                    target: { tabId: tabId },
                                    func: () => document.querySelectorAll('a[href*="/threads/"]').length > 0
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

                        if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "PU_LOG", message: "Acccessing PlayerUp securely..." });

                        let totalFound = 0;

                        while (pageCount < maxPages) {
                            pageCount++;
                            if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "PU_LOG", message: isSingle ? "Deep Scanning..." : `Scanning Page ${pageCount}...` });

                            await waitForContent();

                            try {
                                const results = await chrome.scripting.executeScript({
                                    target: { tabId: tabId },
                                    func: () => {
                                        const threads = [];
                                        const seen = new Set();
                                        const debugLog = [];

                                        // Strategy 0: Single Thread
                                        const h1 = document.querySelector('h1.titleText, h1');
                                        if (window.location.href.includes('/threads/') && h1 && !window.location.href.includes('/account/')) {
                                            threads.push({ title: h1.innerText.trim(), url: window.location.href.split('?')[0].split('#')[0], source: 'single', status: 'Active' });
                                        }

                                        // Strategy 1: Standard Forum List
                                        const listItems = document.querySelectorAll('.discussionListItem, .node .nodeText .nodeTitle a');
                                        listItems.forEach(item => {
                                            const link = item.querySelector('.title a, .PreviewTooltip') || item;
                                            if (link && link.href && link.href.includes('/threads/')) {
                                                let url = link.href.split('?')[0].split('#')[0];
                                                let title = link.innerText.trim();

                                                // Status
                                                let status = 'Active';
                                                const lowerTitle = title.toLowerCase();
                                                const prefix = item.querySelector('.prefix');
                                                if (lowerTitle.includes('[sold]') || lowerTitle.includes('sold -') || lowerTitle.includes('[closed]') || (prefix && (prefix.innerText.includes('Sold') || prefix.innerText.includes('Closed')))) {
                                                    status = 'Inactive';
                                                }

                                                if (!seen.has(url) && title.length > 3) {
                                                    seen.add(url);
                                                    threads.push({ title, url, source: 'forum', status });
                                                }
                                            }
                                        });

                                        // Strategy 2: Grid Rows
                                        const gridRows = document.querySelectorAll('.dataGrid tr.dataRow, .dataTable tr');
                                        gridRows.forEach(row => {
                                            const link = row.querySelector('a[href*="/threads/"]');
                                            if (link) {
                                                let url = link.href.split('?')[0].split('#')[0];
                                                let title = link.innerText.trim();
                                                if (title.toLowerCase() === 'view' || title === '') {
                                                    const titleCell = row.querySelector('td:nth-child(2), td.title');
                                                    if (titleCell) title = titleCell.innerText.trim();
                                                }
                                                // Status
                                                let status = 'Active';
                                                const rowText = row.innerText.toLowerCase();
                                                if (rowText.includes('sold') || rowText.includes('closed') || rowText.includes('inactive')) status = 'Inactive';
                                                if (row.classList.contains('im-sold') || row.classList.contains('im-closed') || row.querySelector('img[src*="sold"]')) status = 'Inactive';

                                                if (!seen.has(url) && title.length > 3) {
                                                    seen.add(url);
                                                    threads.push({ title, url, source: 'grid', status });
                                                }
                                            }
                                        });

                                        // Strategy 3: Usage (only if needed)
                                        if (threads.length === 0) {
                                            debugLog.push("Zero generic items found. Brute forcing links...");
                                            const allLinks = document.querySelectorAll('a[href*="/threads/"]');
                                            allLinks.forEach(link => {
                                                if (link.innerText.length < 5 || link.innerText.includes('Last Post')) return;
                                                let url = link.href.split('?')[0];
                                                if (!seen.has(url)) {
                                                    seen.add(url);
                                                    let status = 'Active';
                                                    if (link.innerText.toLowerCase().includes('sold')) status = 'Inactive';
                                                    threads.push({ title: link.innerText.trim(), url, source: 'brute', status });
                                                }
                                            });
                                        }

                                        return { threads, count: threads.length, url: window.location.href, title: document.title, debug: debugLog.join(' | ') };
                                    }
                                });

                                if (results && results[0] && results[0].result) {
                                    const data = results[0].result;
                                    totalFound += data.count;
                                    if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "PU_LOG", message: `Found ${data.count} threads on Page ${pageCount}.` });

                                    if (data.count > 0) {
                                        await fetch(`${apiBase}/api/admin/playerup`, {
                                            method: "POST", headers: { "Content-Type": "application/json", "X-Admin-Password": adminPass },
                                            body: JSON.stringify({ action: "turbo_sync", listings: data.threads })
                                        });
                                    }
                                }
                            } catch (e) { console.error("PlayerUp Scrape Failed", e); }

                            if (isSingle) break;

                            // Pagination Logic
                            try {
                                const nextRes = await chrome.scripting.executeScript({
                                    target: { tabId },
                                    func: () => {
                                        // 1. Link Tag (Best Practice)
                                        const linkNext = document.querySelector('link[rel="next"]');
                                        if (linkNext) return linkNext.href;

                                        // 2. Common XenForo/Forum Class Names
                                        const navNext = document.querySelector('.PageNav a.text:last-child, .pageNav-jump--next, a[rel="next"]');
                                        if (navNext) return navNext.href;

                                        // 3. Text Content (Robust Fallback)
                                        const anchors = Array.from(document.querySelectorAll('a[href]'));
                                        const next = anchors.find(a => {
                                            const t = a.innerText.trim().toLowerCase();
                                            return t.includes('next >') || t === 'next' || t.includes('next page');
                                        });
                                        return next ? next.href : null;
                                    }
                                });

                                if (nextRes && nextRes[0].result) {
                                    const nextUrl = nextRes[0].result;
                                    if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "PU_LOG", message: "Moving to Next Page..." });

                                    await chrome.tabs.update(tabId, { url: nextUrl });
                                    // Wait for page load initiation
                                    await new Promise(r => setTimeout(r, 2500));
                                } else {
                                    if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "PU_LOG", message: "No more pages found." });
                                    break;
                                }
                            } catch (e) {
                                console.error("Pagination Failed", e);
                                break;
                            }
                        }

                        if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "PU_RESULT", count: totalFound });

                        setTimeout(() => chrome.windows.remove(win.id), 500);
                        resolve();
                    });
                });
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
            .filter(l =>
                l.status === 'Active' &&
                (l.autoBump === 1 || l.autoBump === true) &&
                (l.limitReached === 0 || l.limitReached === false) &&
                (l.dailyBumpCount < 4 || !l.dailyBumpCount)
            );

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
                // Safety delay between bumps (Increased to 5s for OS window stability)
                await new Promise(r => setTimeout(r, 5000));
            }
        }
    } catch (e) { console.error("Engine Error:", e); }
}

async function performBumpAction(item, adminPass, apiBase) {
    const threadUrl = item.url;
    // URL transformation: .../threads/slug.123/ -> .../threads/slug.123/up
    const bumpUrl = threadUrl.replace(/\/$/, '') + '/up';
    let success = false;
    let limitReached = false;
    let errorDetail = "";

    console.log(`[OfficialUM1] 👻 Ghost Bumping: ${item.title}`);

    try {
        // We use fetch with credentials 'include' which uses the extension's cookie permissions
        const res = await fetch(bumpUrl, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1'
            }
        });

        const text = await res.text();
        const lowText = text.toLowerCase();

        // Detect states from the HTML response
        if (lowText.includes("reached todays max bumping limit") || lowText.includes("4 bump(s) per day")) {
            limitReached = true;
            console.warn(`[OfficialUM1] Limit Reached for ${item.title}`);
        } else if (lowText.includes("thread has been bumped") || lowText.includes("success") || res.redirected) {
            // PlayerUp usually redirects back to the thread on success
            success = true;
            console.log(`[OfficialUM1] Ghost Bump Success: ${item.title}`);
        } else if (lowText.includes("log in") || lowText.includes("login") || lowText.includes("sign up")) {
            errorDetail = "LOGIN_REQUIRED";
            console.error(`[OfficialUM1] Login Required for ${item.title}`);
        } else if (lowText.includes("must wait") || lowText.includes("remaining")) {
            errorDetail = "ON_TIMER";
            console.log(`[OfficialUM1] Still on timer for ${item.title}`);
        } else {
            // If we can't find clear success/fail, it might have failed
            errorDetail = "UNCERTAIN_RESPONSE";
            console.warn(`[OfficialUM1] Uncertain response for ${item.title}`);
        }

    } catch (e) {
        console.error(`[OfficialUM1] Ghost Bump Error:`, e);
        errorDetail = e.message;
    }

    // Always update server
    try {
        await fetch(`${apiBase}/api/admin/playerup`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Admin-Password": adminPass },
            body: JSON.stringify({
                action: "update_bump",
                id: item.id,
                success,
                limitReached,
                error: errorDetail
            })
        });
    } catch (e) { console.error("Failed to update server logs", e); }

    return success;
}

// Remove fallbackBump as it's no longer needed or used
async function fallbackBump(url) { return false; }
