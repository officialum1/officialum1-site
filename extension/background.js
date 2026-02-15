
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
                    console.log(`[OfficialUM1 Sync] Sending cookies to: ${apiBase}/api/admin/settings`);

                    try {
                        const res = await fetch(`${apiBase}/api/admin/settings`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json", "X-Admin-Password": adminPass },
                            body: JSON.stringify({ action: "save_session", site: baseDomain, cookies: cookieString })
                        });

                        const data = await res.json().catch(() => ({}));
                        console.log(`[OfficialUM1 Sync] Server Response: ${res.status}`, data);

                        if (res.ok) sendResponse({ success: true });
                        else {
                            console.error(`[OfficialUM1 Sync] Auth Failed: ${res.status} ${data.error || ''}`);
                            sendResponse({ success: false, error: data.error || 'Server Error' });
                        }

                    } catch (e) {
                        console.error("[OfficialUM1 Sync] Connection/Network Error:", e);
                        sendResponse({ success: false, error: e.message });
                    }
                });
            } catch (e) { console.error("Sync Logic Fail", e); sendResponse({ success: false }); }
        })();
        return true;
    }

    // REMOTE DASHBOARD COMMANDS
    if (request.action === "REMOTE_SYNC" || request.action === "REMOTE_BUMP" || request.action === "Z2U_SYNC" || request.action === "POST_THREAD") {
        (async () => {
            const res = await getStorage(['admin_pass']);
            const adminPass = request.adminPass || res.admin_pass;
            const apiBase = await getApiUrl();

            if (!adminPass) {
                console.error("[OfficialUM1] Missing Admin Password.");
                return;
            }

            if (request.action === "POST_THREAD") {
                console.log("[OfficialUM1] Starting Quick Post Process...", request.data.title);
                await performPostAction(request.data, adminPass, apiBase);
                return;
            }

            if (request.action === "Z2U_SYNC") {
                const dashboardTabId = sender.tab ? sender.tab.id : null;
                console.log("[OfficialUM1] Starting Z2U Stealth Sync via Dashboard", dashboardTabId);

                if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_LOG", message: "Opening stealth window..." });

                const primaryUrl = 'https://www.z2u.com/sell/manage';
                const altUrl = 'https://www.z2u.com/sell/manageList?service=5&game=15132';
                const legacyUrl = 'https://www.z2u.com/product/manage/index';

                await new Promise((resolve) => {
                    chrome.windows.create({
                        url: primaryUrl,
                        type: 'popup',
                        focused: false,
                        left: -9999,
                        top: -9999,
                        width: 1,
                        height: 1
                    }, async (win) => {
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
                                    if (attempts > 30) { r(false); return; }
                                    chrome.scripting.executeScript({
                                        target: { tabId: tabId },
                                        func: () => document.querySelectorAll('tr[data-id], .item, .row, .list-item, .table-row, li.gl-item, li.item, .product-item, div[data-id]').length > 0
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

                        // 🔥 DEEP SEARCH: Try all candidate URLs
                        let data = await runScraper("Account Center");

                        if (!data || data.count === 0) {
                            if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_LOG", message: "Trying Alternative URL..." });
                            await chrome.tabs.update(tabId, { url: altUrl });
                            data = await runScraper("Category Hub");
                        }

                        if (!data || data.count === 0) {
                            if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_LOG", message: "Trying Legacy Manager..." });
                            await chrome.tabs.update(tabId, { url: legacyUrl });
                            data = await runScraper("Standard View");
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
                    chrome.windows.create({
                        url: targetUrl,
                        type: 'popup',
                        focused: false,
                        left: -9999,
                        top: -9999,
                        width: 1,
                        height: 1
                    }, async (win) => {
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
            } else if (request.action === "REMOTE_BUMP") {
                try {
                    if (request.singleUrl) {
                        await performBumpAction({ id: request.id, url: request.singleUrl, title: "Requested Thread" }, adminPass, apiBase);
                    } else {
                        const listRes = await fetch(`${apiBase}/api/admin/playerup`);
                        const data = await listRes.json();
                        if (data.isPaused) {
                            console.log("[OfficialUM1] Bumping is PAUSED globally. Skipping.");
                            return;
                        }
                        let targets = Array.isArray(data) ? data : (data.listings || []);
                        if (request.limit > 0) targets = targets.slice(0, request.limit);

                        for (const item of targets) {
                            await performBumpAction(item, adminPass, apiBase);
                            // Brief pause between requests
                            await new Promise(r => setTimeout(r, 3000));
                        }
                    }
                } catch (e) {
                    console.error("Bump Command Error:", e);
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
            const action = request.type === 'BUMP_UPDATE' ? 'manual_bump' : 'turbo_sync';

            fetch(`${apiBase}/api/admin/playerup`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Admin-Password": request.adminPass },
                body: JSON.stringify({ action, listings: request.listings })
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
        const data = await listRes.json();
        if (data.isPaused) {
            console.log("[OfficialUM1] Bumping is PAUSED. Skipping run.");
            return;
        }
        const activeListings = (Array.isArray(data) ? data : (data.listings || []))
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
    let success = false;
    let limitReached = false;
    let errorDetail = "";

    console.log(`[OfficialUM1] Starting Stealth Window Bump: ${item.title}`);

    try {
        await new Promise((resolve) => {
            // 🛰️ GOD-MODE STEALTH (Off-screen + 1x1 size)
            // Note: Cannot combine 'minimized' state with coordinates/size in Chrome
            chrome.windows.create({
                url: threadUrl,
                type: 'popup',
                focused: false,
                left: -9999,
                top: -9999,
                width: 1,
                height: 1
            }, async (win) => {
                if (chrome.runtime.lastError || !win || !win.tabs || !win.tabs[0]) {
                    const err = chrome.runtime.lastError ? chrome.runtime.lastError.message : "Window creation blocked";
                    errorDetail = `Creation failed: ${err}`;
                    resolve();
                    return;
                }
                const tabId = win.tabs[0].id;

                // Wait for the page to load and the security checks to pass
                const checkStatus = async () => {
                    try {
                        const results = await chrome.scripting.executeScript({
                            target: { tabId: tabId },
                            func: () => {
                                const bodyText = document.body.innerText;
                                if (bodyText.includes("reached todays max bumping limit") || bodyText.includes("4 bump(s) per day")) {
                                    // 🚀 LIMIT REACHED - TRY REPLY BUMP (INFINITE BUMP)
                                    const editor = document.querySelector('.fr-element, .js-editor, .redactor-editor');
                                    const textArea = document.querySelector('textarea[name="message"]');
                                    const submitBtn = document.querySelector('button.button--primary, button.js-quickReply--button, .js-submitReply');

                                    if ((editor || textArea) && submitBtn) {
                                        const msgs = [
                                            "Still available! Premium quality. DM or visit site.",
                                            "BUMP! Stock updated. Check OfficialUM1 Store.",
                                            "Available for instant delivery. Contact on Telegram @OfficialUM1.",
                                            "Premium Accounts in stock. Fast service guaranteed.",
                                            "Daily update: Current listings active and ready!"
                                        ];
                                        const msg = msgs[Math.floor(Math.random() * msgs.length)];

                                        if (editor) {
                                            editor.focus(); editor.innerText = msg;
                                            editor.dispatchEvent(new Event('input', { bubbles: true }));
                                        } else if (textArea) {
                                            textArea.value = msg;
                                        }

                                        setTimeout(() => submitBtn.click(), 1000);
                                        return "REPLY_SUCCESS";
                                    }
                                    return "LIMIT_REACHED";
                                }

                                const btn = document.querySelector('a.UpControl.UpButtonView') || document.getElementById('upButtonCountdown');
                                if (btn) {
                                    if (btn.innerText.includes("UP") || btn.id === 'upButtonCountdown') {
                                        btn.click();
                                        return "SUCCESS";
                                    }
                                    return "WAITING_TIMER";
                                }
                                if (document.body.innerHTML.toLowerCase().includes('log in')) return "LOGIN_REQUIRED";
                                return "NOT_FOUND";
                            }
                        });

                        if (results && results[0]) {
                            const res = results[0].result;
                            if (res === "SUCCESS" || res === "REPLY_SUCCESS") {
                                success = true;
                                if (res === "REPLY_SUCCESS") errorDetail = "Success (Reply Bump)";
                                return true;
                            } else if (res === "LIMIT_REACHED") {
                                limitReached = true;
                                errorDetail = "Daily limit reached (4/4)";
                                return true;
                            } else if (res === "LOGIN_REQUIRED") {
                                errorDetail = "Login Required (Cookies Expired)";
                                return true;
                            } else if (res === "WAITING_TIMER") {
                                errorDetail = "Wait Timer Active (Cooldown)";
                                // We don't return true because we might want to wait a few more seconds if the page is still loading
                            } else if (res === "NOT_FOUND") {
                                errorDetail = "Bump button not found on page";
                            }
                        }
                    } catch (e) {
                        console.error("Script injection failed", e);
                    }
                    return false;
                };

                // Poll for up to 45 seconds (Ensuring 'Never Fail' even on slow connections)
                let attempts = 0;
                const interval = setInterval(async () => {
                    const done = await checkStatus();
                    attempts++;
                    // After 15 attempts (~30-45s) or Success/Limit hit, close window
                    if (done || attempts > 15) {
                        clearInterval(interval);
                        // Small delay to let the click register
                        setTimeout(() => {
                            chrome.windows.remove(win.id, () => {
                                if (chrome.runtime.lastError) { /* ignore already closed */ }
                            });
                            resolve();
                        }, 3000);
                    }
                }, 2000);
            });
        });

    } catch (e) {
        console.error("Stealth Bump Process Failed", e);
        errorDetail = e.message;
    }

    // Update Server
    try {
        await fetch(`${apiBase}/api/admin/playerup`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Admin-Password": adminPass },
            body: JSON.stringify({
                action: "update_bump",
                id: item.id,
                success: success,
                limitReached: limitReached,
                error: errorDetail
            })
        });
    } catch (e) { console.error("Log update failed", e); }

    return success;
}

// Remove fallbackBump as it's no longer needed or used
async function fallbackBump(url) { return false; }

async function performPostAction(data, adminPass, apiBase) {
    const { title, price, description, categoryUrl, postKarma, commentKarma, ageString, ownership, delivery } = data;
    console.log("[OfficialUM1] Executing Auto-Post for:", title);

    return new Promise((resolve) => {
        chrome.windows.create({
            url: categoryUrl,
            type: 'popup',
            focused: true,
            width: 1100,
            height: 900,
            state: 'normal'
        }, (win) => {
            const tabId = win && win.tabs && win.tabs[0] ? win.tabs[0].id : null;
            if (!tabId) { resolve(); return; }

            // Polling approach to wait for the specific form elements
            let attempts = 0;
            const interval = setInterval(async () => {
                attempts++;
                try {
                    const results = await chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        func: (t, p, d, meta) => {
                            const titleField = document.querySelector('input[name="title"]');
                            if (!titleField) return "WAITING";

                            // 1. Fill Title
                            titleField.value = t;
                            titleField.dispatchEvent(new Event('input', { bubbles: true }));
                            titleField.dispatchEvent(new Event('change', { bubbles: true }));

                            // 2. Fill Message
                            const editor = document.querySelector('.fr-element, .redactor-editor, .js-editor');
                            if (editor) {
                                editor.focus();
                                editor.innerText = d;
                                editor.dispatchEvent(new Event('input', { bubbles: true }));
                            } else {
                                const txt = document.querySelector('textarea[name="message"]');
                                if (txt) txt.value = d;
                            }

                            // 3. Fill Metadata (Karma, Age, Ownership)
                            const findAndSelect = (labelText, value) => {
                                const rows = Array.from(document.querySelectorAll('dl.formRow, .formRow'));
                                for (const row of rows) {
                                    if (row.innerText.toLowerCase().includes(labelText.toLowerCase())) {
                                        const select = row.querySelector('select');
                                        if (select) {
                                            // Try to find matching option
                                            const options = Array.from(select.options);
                                            let bestOption = null;

                                            // Handle Karma Ranges (e.g. if pk=1200, match "1k - 5k")
                                            for (const opt of options) {
                                                if (opt.text.toLowerCase().includes(value.toString().toLowerCase())) {
                                                    bestOption = opt.value;
                                                    break;
                                                }
                                            }

                                            if (bestOption) {
                                                select.value = bestOption;
                                                select.dispatchEvent(new Event('change', { bubbles: true }));
                                            } else if (options.length > 1) {
                                                // Fallback to first valid option if no match
                                                select.selectedIndex = 1;
                                                select.dispatchEvent(new Event('change', { bubbles: true }));
                                            }
                                            return true;
                                        }
                                    }
                                }
                                return false;
                            };

                            findAndSelect("Post Karma", meta.postKarma);
                            findAndSelect("Comment Karma", meta.commentKarma);
                            findAndSelect("Age", meta.ageString);
                            findAndSelect("Ownership", meta.ownership);
                            findAndSelect("Delivery", meta.delivery);

                            // 4. Fill Price
                            const inputs = document.querySelectorAll('input, select');
                            for (const input of inputs) {
                                const rowText = input.closest('dl, .formRow')?.innerText.toLowerCase() || "";
                                if (input.name && input.name.includes('custom_fields') && (rowText.includes('price') || rowText.includes('amount'))) {
                                    input.value = p;
                                    input.dispatchEvent(new Event('input', { bubbles: true }));
                                }
                            }

                            // 4. Inject visual indicator
                            const banner = document.createElement('div');
                            banner.innerHTML = "✨ OFFICIALUM1 REDDIT AUTOMATION: FIELDS FILLED ✨";
                            banner.style.cssText = "position:fixed; top:0; left:0; width:100%; background:#f97316; color:white; text-align:center; padding:15px; font-weight:bold; z-index:2147483647; font-family:sans-serif; border-bottom:3px solid #c2410c; box-shadow:0 0 20px rgba(0,0,0,0.5);";
                            document.body.appendChild(banner);

                            // Scroll to Title Field to ensure visibility
                            titleField.scrollIntoView({ behavior: 'smooth', block: 'center' });

                            // 5. Try Submit
                            const submitBtn = document.querySelector('button.button--primary, button[type="submit"]');
                            if (submitBtn) {
                                setTimeout(() => submitBtn.click(), 1000);
                                return "POSTED";
                            }
                            return "FILLED_NO_BTN";
                        },
                        args: [title, price, description, { postKarma, commentKarma, ageString, ownership, delivery }]
                    });

                    if (results && results[0] && (results[0].result === "POSTED" || results[0].result === "FILLED_NO_BTN")) {
                        clearInterval(interval);
                        // Stay open for 8 seconds to show the user it worked, then close.
                        setTimeout(() => {
                            chrome.windows.remove(win.id, () => { if (chrome.runtime.lastError) { } });
                            resolve();
                        }, 8000);
                    }
                } catch (e) { console.error("Post Script Error", e); }

                if (attempts > 10) {
                    clearInterval(interval);
                    resolve();
                }
            }, 3000);
        });
    });
}
