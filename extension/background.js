// BACKGROUND SERVICE WORKER - Bypasses CORS and handles API requests

let isBumpingEngineRunning = false;

// Helper to get storage as a Promise
const getStorage = (keys) => new Promise(resolve => chrome.storage.local.get(keys, resolve));

// Keep-Alive Connection Listener
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "OFFICIALUM1_KEEP_ALIVE") {
        console.log("[OfficialUM1] Keep-Alive Connection Established.");
        port.onDisconnect.addListener(() => {
            console.log("[OfficialUM1] Keep-Alive Connection Lost.");
        });
    }
});

// Dynamic API Resolver
async function getApiUrl() {
    const res = await getStorage(['last_api_url', 'api_url']);
    let url = res.last_api_url || res.api_url || "https://officialum1.com";
    if (url.endsWith('/')) url = url.slice(0, -1);
    return url;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("[OfficialUM1 Background] Message Received:", request.action);

    // PING FOR CONNECTIVITY
    if (request.action === "PING" || request.action === "HEARTBEAT_PING") {
        sendResponse({ status: "ALIVE", timestamp: Date.now() });
        return true;
    }

    // COOKIE SYNC
    if (request.action === "SYNC_COOKIES") {
        (async () => {
            try {
                const apiBase = await getApiUrl();
                const res = await getStorage(['admin_pass']);
                const adminPass = request.adminPass || res.admin_pass;
                const url = new URL(request.url);
                const baseDomain = url.hostname.split('.').slice(-2).join('.');

                chrome.cookies.getAll({ domain: baseDomain }, async (cookies) => {
                    const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
                    try {
                        const sRes = await fetch(`${apiBase}/api/admin/settings`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json", "X-Admin-Password": adminPass },
                            body: JSON.stringify({ action: "save_session", site: baseDomain, cookies: cookieString })
                        });
                        sendResponse({ success: sRes.ok });
                    } catch (e) { sendResponse({ success: false, error: e.message }); }
                });
            } catch (e) { sendResponse({ success: false }); }
        })();
        return true;
    }

    // REMOTE DASHBOARD COMMANDS (SYNC, BUMP, POST)
    const SYNC_ACTIONS = ["REMOTE_SYNC", "REMOTE_BUMP", "Z2U_SYNC", "POST_THREAD", "G2G_SYNC", "Z2U_BATCH_ACTION", "Z2U_SAVE_CHANGES", "Z2U_POST_OFFER"];
    if (SYNC_ACTIONS.includes(request.action)) {
        (async () => {
            try {
                const apiBase = await getApiUrl();
                const res = await getStorage(['admin_pass']);
                const adminPass = request.adminPass || res.admin_pass;
                const dashboardTabId = sender.tab ? sender.tab.id : null;

                if (!adminPass) {
                    if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "PU_LOG", message: "❌ EXTENSION AUTH ERROR: Please Refresh Dashboard." });
                    sendResponse({ success: false, error: "No Auth" });
                    return;
                }

                if (request.action === "POST_THREAD") {
                    console.log("[OfficialUM1] Starting Quick Post Process...", request.data.title);
                    const result = await performPostAction(request.data, adminPass, apiBase);
                    sendResponse({ success: result === "POSTED", status: result });
                }
                else if (request.action === "G2G_SYNC") {
                    await runG2GSync(request, sender, dashboardTabId, adminPass, apiBase);
                    sendResponse({ success: true });
                }
                else if (request.action === "Z2U_SYNC") {
                    await runZ2USync(request, sender, dashboardTabId, adminPass, apiBase);
                    sendResponse({ success: true });
                }
                else if (request.action === "REMOTE_SYNC") {
                    await runPlayerUpSync(request, sender, dashboardTabId, adminPass, apiBase);
                    sendResponse({ success: true });
                }
                else if (request.action === "REMOTE_BUMP") {
                    await runRemoteBump(request, adminPass, apiBase);
                    sendResponse({ success: true });
                }
                else if (request.action === "Z2U_BATCH_ACTION") {
                    await runZ2UBatchAction(request, sender, dashboardTabId, adminPass, apiBase);
                    sendResponse({ success: true });
                }
                else if (request.action === "Z2U_SAVE_CHANGES") {
                    await runZ2USaveChanges(request, sender, dashboardTabId, adminPass, apiBase);
                    sendResponse({ success: true });
                }
                else if (request.action === "PLAYERUP_BATCH_ACTION") {
                    await runPlayerUpBatchAction(request, sender, dashboardTabId, adminPass, apiBase);
                    sendResponse({ success: true });
                }
                else if (request.action === "Z2U_POST_OFFER") {
                    const result = await performZ2UPostAction(request.data, adminPass, apiBase);
                    sendResponse({ success: result === "POSTED" });
                }
            } catch (e) {
                console.error("Dashboard Command Error:", e);
                sendResponse({ success: false, error: e.message });
            }
        })();
        return true;
    }

    // SYNC DATA TO SERVER
    if (request.action === "SYNC_TO_SERVER") {
        (async () => {
            try {
                const apiBase = await getApiUrl();
                let endpoint = '/api/admin/playerup';
                let action = 'turbo_sync';

                if (request.type === 'Z2U_SYNC') endpoint = '/api/admin/z2u';
                else if (request.type === 'BUMP_UPDATE') action = 'manual_bump';

                const sRes = await fetch(`${apiBase}${endpoint}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "X-Admin-Password": request.adminPass },
                    body: JSON.stringify({ action: action, listings: request.listings })
                });
                const data = await sRes.json().catch(() => ({}));
                sendResponse({ success: sRes.ok, count: data.count });
            } catch (e) { sendResponse({ success: false }); }
        })();
        return true;
    }
});

// MODULAR SYNC FUNCTIONS
async function runG2GSync(request, sender, dashboardTabId, adminPass, apiBase) {
    const startUrl = 'https://www.g2g.com/sell/manage';
    if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "G2G_LOG", message: "Opening G2G..." });

    return new Promise((resolve) => {
        chrome.windows.create({ url: startUrl, type: 'popup', focused: true, width: 1200, height: 800 }, async (win) => {
            const tabId = win.tabs?.[0]?.id;
            if (!tabId) { resolve(); return; }
            await new Promise(r => setTimeout(r, 10000)); // 10s wait for G2G heavy load
            const results = await chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    const items = [];
                    document.querySelectorAll('tr, .list-item').forEach(el => {
                        const link = el.querySelector('a[href*="/product/"]');
                        if (link) {
                            const idMatch = link.href.match(/product\/([A-Z0-9]+)/);
                            if (idMatch) {
                                // Scrape price/stock if possible
                                const priceEl = el.innerText.match(/\$\s?([0-9.]+)/);
                                const stockEl = el.innerText.match(/Stock:\s?(\d+)/i) || el.innerText.match(/Qty:\s?(\d+)/i);
                                items.push({
                                    id: idMatch[1],
                                    title: el.innerText.split('\n')[0].substring(0, 100).trim(),
                                    price: priceEl ? priceEl[1] : "0.00",
                                    stock: stockEl ? stockEl[1] : "1",
                                    status: 'Active',
                                    url: link.href
                                });
                            }
                        }
                    });
                    return { listings: items, count: items.length };
                }
            });
            const data = results[0]?.result || { listings: [], count: 0 };
            if (data.count > 0) {
                try {
                    await fetch(`${apiBase}/api/admin/g2g`, {
                        method: "POST", headers: { "Content-Type": "application/json", "X-Admin-Password": adminPass },
                        body: JSON.stringify({ action: "turbo_sync", listings: JSON.parse(JSON.stringify(data.listings)) })
                    });
                } catch (e) { console.error("G2G Server Sync Error:", e); }
            }
            if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "G2G_RESULT", count: data.count });
            setTimeout(() => chrome.windows.remove(win.id), 1000);
            resolve();
        });
    });
}

async function runZ2USync(request, sender, dashboardTabId, adminPass, apiBase) {
    const startUrl = request.url || 'https://www.z2u.com/sell/manageList';
    if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_LOG", message: "🛰️ Initiating Deep Satellite Scan on Z2U..." });

    return new Promise((resolve) => {
        chrome.windows.create({ url: startUrl, type: 'popup', focused: true, width: 1200, height: 800 }, async (win) => {
            const tabId = win.tabs?.[0]?.id;
            if (!tabId) { resolve(); return; }

            // Wait 15s - Z2U is heavy and slow
            await new Promise(r => setTimeout(r, 15000));
            if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_LOG", message: "📡 Synchronizing with Z2U DOM..." });

            const results = await chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    const items = [];
                    const logs = [];
                    const log = (m) => logs.push(m);

                    const clean = (t) => t.replace(/<[^>]*>/g, '').replace(/#\d+/g, '').replace(/\s+/g, ' ').trim();

                    // Strategy: Find all valid listing rows
                    const rows = document.querySelectorAll('.div-table-row, tr, .product-item, .manage-list-item, [data-id]');
                    const processedIds = new Set();

                    rows.forEach(row => {
                        const rowText = row.innerText;

                        // Strict ID detection: Look for # followed by 7-15 digits
                        const idMatch = rowText.match(/#(\d{7,15})/);
                        if (!idMatch) return;
                        const id = idMatch[1];

                        // Avoid duplicates from nested structures
                        if (processedIds.has(id)) return;
                        processedIds.add(id);

                        // TITLE DISCOVERY (Enhanced)
                        let title = "";

                        // 1. High Priority: Specific Z2U title elements
                        const titleEl = row.querySelector('.product-title, .title-box .name, .p-title, .main-text .product-title');
                        if (titleEl) title = titleEl.innerText.trim();

                        // 2. Fallback: Search for links to the product page
                        if (!title || title.length < 5) {
                            const prodLinks = row.querySelectorAll('a[href*="product/"]');
                            for (let l of prodLinks) {
                                let t = l.innerText.trim();
                                if (t.length > 8 && !t.includes('#')) { title = t; break; }
                            }
                        }

                        // 3. Fallback: General name containers
                        if (!title || title.length < 5) {
                            const nameEl = row.querySelector('.product-name, .title, .p-name');
                            if (nameEl) {
                                // Try to find bold text within name container if full text is too noisy
                                const boldTxt = nameEl.querySelector('b, strong, .product-title');
                                title = (boldTxt || nameEl).innerText.trim();
                            }
                        }

                        if (!title || title.length < 5) title = `Z2U Listing #${id}`;

                        // Final cleaning: Remove "Publish YYYY/MM/DD", IDs (#123), and excessive space
                        title = title.replace(/Publish\s*\d{4}\/\d{2}\/\d{2}/gi, '')
                            .replace(/#\d+/g, '')
                            .replace(/\s+/g, ' ')
                            .trim();

                        title = clean(title).substring(0, 250);

                        // PRICE & STOCK DISCOVERY (Row-Specific)
                        let price = "0.00";
                        let stock = "1";

                        // Pass A: Explicit Cell Association (Best for div-table)
                        const cells = row.querySelectorAll('.div-table-cell, td');
                        cells.forEach(cell => {
                            const titleText = (cell.querySelector('.title, .label')?.innerText || "").toLowerCase();
                            const valInput = cell.querySelector('input, select');
                            const rawTxt = cell.innerText || "";

                            if (titleText.includes('price')) {
                                const pVal = (valInput?.value || rawTxt).replace(/[^\d.]/g, '');
                                if (pVal && parseFloat(pVal) > 0) price = pVal;
                            }
                            if (titleText.includes('stock') || titleText.includes('inventory') || titleText.includes('qty')) {
                                let sVal = "";
                                if (valInput && valInput.value) {
                                    sVal = valInput.value.replace(/[^\d]/g, '');
                                } else {
                                    // Surgical Fix: Take only the first number block to avoid merging with time
                                    const segments = rawTxt.trim().split(/[\s\n]+/);
                                    for (const seg of segments) {
                                        const cleanSeg = seg.replace(/[^\d]/g, '');
                                        if (cleanSeg && !seg.toLowerCase().includes('min') && !seg.toLowerCase().includes('hour')) {
                                            sVal = cleanSeg;
                                            break;
                                        }
                                    }
                                }
                                if (sVal) stock = sVal;
                            }
                        });

                        // Pass B: Marker Search (change_price, change-price-group)
                        if (price === "0.00") {
                            const pEl = row.querySelector('.change_price, .input-price, .sell-price, .change-price-group input');
                            if (pEl) {
                                const pVal = (pEl.value || pEl.innerText).replace(/[^\d.]/g, '');
                                if (pVal && parseFloat(pVal) > 0) price = pVal;
                            }
                        }

                        // Pass C: Aggressive Search (Ignore Sort inputs)
                        if (price === "0.00") {
                            row.querySelectorAll('input').forEach(input => {
                                const name = (input.name || '').toLowerCase();
                                const cls = (input.className || '').toLowerCase();
                                if (name.includes('sort') || cls.includes('sort')) return;
                                const val = input.value.replace(/[^\d.]/g, '');
                                if (val && parseFloat(val) > 0 && price === "0.00") price = val;
                            });
                        }

                        // Final Sanity & Clean up
                        price = parseFloat(price).toFixed(2);
                        stock = parseInt(stock) || 0;

                        // STATUS
                        let status = "Active";
                        const lowText = rowText.toLowerCase();
                        if (lowText.includes('deactivated') || lowText.includes('offline') || lowText.includes('inactive')) status = "Inactive";

                        log(`✅ Discovered #${id} | $${price} | ${stock} pcs`);

                        items.push({
                            id, title, price, stock, status,
                            url: `https://www.z2u.com/product/${id}.html`,
                            editUrl: `https://www.z2u.com/sell/manageEdit.html?id=${id}`, // Standard fallback patterns
                            relistUrl: `https://www.z2u.com/sell/manage/relist?id=${id}`,
                            extendUrl: `https://www.z2u.com/sell/manage/extend?id=${id}`
                        });
                    });

                    // Final Fallback: Link search
                    if (items.length === 0) {
                        document.querySelectorAll('a[href*="product/"]').forEach(a => {
                            const m = a.href.match(/product\/(\d+)\.html/);
                            if (m && !items.find(i => i.id === m[1])) {
                                items.push({ id: m[1], title: a.innerText.trim() || `Offer ${m[1]}`, price: "0.00", stock: "1", status: "Active", url: a.href });
                            }
                        });
                    }

                    return { listings: items, count: items.length, logs };
                }
            });

            const data = results[0]?.result || { listings: [], count: 0, logs: ["Scan failed to return results."] };

            // Pipe logs back to dashboard
            if (dashboardTabId && data.logs) {
                for (const m of data.logs) {
                    chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_LOG", message: m });
                    await new Promise(r => setTimeout(r, 200));
                }
            }

            if (data.count > 0) {
                try {
                    const res = await fetch(`${apiBase}/api/admin/z2u`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "X-Admin-Password": adminPass },
                        body: JSON.stringify({ action: "turbo_sync", listings: JSON.parse(JSON.stringify(data.listings)) })
                    });
                    if (res.ok) {
                        if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_LOG", message: `✅ Successfully saved ${data.count} items.` });
                    }
                } catch (e) {
                    if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_LOG", message: "❌ Server Sync Error." });
                }
            }

            if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_RESULT", count: data.count });
            setTimeout(() => chrome.windows.remove(win.id), 2000);
            resolve();
        });
    });
}

/**
 * Z2U BATCH ACTIONS (EXTEND, RELIST, DEACTIVATE)
 * Runs at background, selects IDs or All, and clicks the Z2U action buttons.
 */
async function runZ2UBatchAction(request, sender, dashboardTabId, adminPass, apiBase) {
    const targetUrl = request.url || 'https://www.z2u.com/sell/manageList';
    const actionType = request.actionType; // 'extend', 'active' (relist), 'inactive' (deactivate), 'delete'
    const targetId = request.id; // Optional for single action
    const targetIds = request.ids; // Array of IDs

    if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_LOG", message: `🛰️ Initializing Batch Operation: ${actionType.toUpperCase()}...` });

    return new Promise((resolve) => {
        chrome.windows.create({ url: targetUrl, type: 'popup', focused: true, width: 1200, height: 800 }, async (win) => {
            const tabId = win.tabs?.[0]?.id;
            if (!tabId) { resolve(); return; }

            // Wait for Z2U hydration (10s is usually enough for control bar)
            await new Promise(r => setTimeout(r, 10000));

            const result = await chrome.scripting.executeScript({
                target: { tabId },
                func: (type, tid, tids) => {
                    const findRowInput = (id) => {
                        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
                        let node;
                        while (node = walker.nextNode()) {
                            if (node.textContent.includes(`#${id}`)) {
                                let row = node.parentElement;
                                for (let i = 0; i < 10; i++) {
                                    if (row.tagName === 'TR' || row.classList.contains('product-item') || row.classList.contains('div-table-row')) break;
                                    row = row.parentElement || row;
                                }
                                return row.querySelector('input[type="checkbox"]');
                            }
                        }
                        return null;
                    };

                    // 1. SELECT TARGETS
                    console.log("[Z2U] Selecting targets...");

                    // BUMPER STRATEGY: If it's a sort/bump, always use Select All for maximum speed
                    if (type === 'sort' || (!tid && (!tids || tids.length === 0))) {
                        console.log("[Z2U] Clicking Select All (Bumper Mode)...");
                        const selectAllInput = document.querySelector('#inlineCheckbox3') || document.querySelector('.selectAll input, .zu-checkbox-all');
                        if (selectAllInput) {
                            selectAllInput.click();
                            // Fix for UI lag
                            setTimeout(() => {
                                if (!selectAllInput.checked) {
                                    const label = document.querySelector('label[for="inlineCheckbox3"]');
                                    if (label) label.click();
                                }
                            }, 50);
                        }
                    } else if (tids && Array.isArray(tids)) {
                        tids.forEach(id => {
                            const input = findRowInput(id);
                            if (input && !input.checked) input.click();
                        });
                    } else if (tid) {
                        const input = findRowInput(tid);
                        if (input && !input.checked) input.click();
                    }

                    // 2. TRIGGER ACTION
                    return new Promise((r) => {
                        setTimeout(() => {
                            console.log(`[Z2U] Triggering ${type}...`);

                            if (type === 'sort') {
                                // Execution Strategy: Direct Function Call is most reliable (Like PlayerUp)
                                if (typeof window.sort === 'function') {
                                    console.log("[Z2U] Executing global sort() function...");
                                    window.sort();
                                } else {
                                    const actionBtn = document.querySelector('button[onclick*="sort("], .zu-btn-outline-success') ||
                                        [...document.querySelectorAll('button')].find(b => b.innerText.toLowerCase().includes('batch sort'));
                                    if (actionBtn) actionBtn.click();
                                }
                            } else if (type === 'delete') {
                                const actionBtn = document.querySelector('.deleteAll, .btn-delete-all, button[data-type="delete"]') ||
                                    [...document.querySelectorAll('button')].find(b => b.innerText.toLowerCase().includes('delete'));
                                if (actionBtn) actionBtn.click();
                            } else {
                                const actionBtn = document.querySelector(`.activeMk[data-type="${type}"], button[data-type="${type}"]`) ||
                                    [...document.querySelectorAll('button')].find(b => {
                                        const search = type === 'extend' ? 'extend duration' : (type === 'active' ? 'relist' : 'offline');
                                        return b.innerText.toLowerCase().includes(search);
                                    });

                                if (actionBtn) actionBtn.click();
                            }

                            // Confirm Dialog
                            setTimeout(() => {
                                // Scrape for ANY primary confirmation button
                                const okBtn = document.querySelector('.zu-confirm-btn-primary, .swal2-confirm, .layui-layer-btn0, .zu-btn-solid-danger, .zu-btn-solid-success.batchUpdateBtn');
                                if (okBtn) {
                                    console.log("[Z2U] Confirming action...");
                                    okBtn.click();
                                } else {
                                    // Extreme fallback: look for any button with "Confirm" or "OK" or "Yes"
                                    const confirmBtn = [...document.querySelectorAll('button, .layui-layer-btn a')].find(b =>
                                        ['confirm', 'ok', 'yes', 'restore'].some(t => b.innerText.toLowerCase().includes(t))
                                    );
                                    if (confirmBtn) confirmBtn.click();
                                }
                                r({ success: true });
                            }, 2000); // Slightly longer wait for dialog
                        }, 800); // 800ms delay to ensure "Select All" is registered
                    });
                },
                args: [
                    actionType ? JSON.parse(JSON.stringify(actionType)) : "sort",
                    targetId ? JSON.parse(JSON.stringify(targetId)) : null,
                    targetIds ? JSON.parse(JSON.stringify(targetIds)) : []
                ]
            });

            const res = result[0]?.result;
            if (dashboardTabId) {
                if (res?.success) chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_LOG", message: `✅ Batch Operation Sent: ${actionType.toUpperCase()}` });
                else chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_LOG", message: `❌ Operation Failed: ${res?.error || 'Unknown Error'}` });
            }

            // Keep window open for a bit to let Z2U process
            setTimeout(() => {
                chrome.windows.remove(win.id);
                resolve();
            }, 3000);
        });
    });
}

/**
 * PLAYERUP BATCH ACTIONS (SORT/BUMP, DELETE)
 * Opens the account threads page, selects all, and triggers batch actions.
 */
async function runPlayerUpBatchAction(request, sender, dashboardTabId, adminPass, apiBase) {
    const targetUrl = request.url || 'https://www.playerup.com/account/threads';
    const actionType = request.actionType;

    if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "PU_LOG", message: `🛰️ Initializing PlayerUp Batch ${actionType.toUpperCase()}...` });

    return new Promise((resolve) => {
        chrome.windows.create({ url: targetUrl, type: 'popup', focused: true, width: 1200, height: 800 }, async (win) => {
            const tabId = win.tabs?.[0]?.id;
            if (!tabId) { resolve(); return; }

            // Wait for XenForo load
            await new Promise(r => setTimeout(r, 8000));

            const result = await chrome.scripting.executeScript({
                target: { tabId },
                func: (type) => {
                    console.log("[PlayerUp] Starting Batch Sequence...");

                    // 1. SELECT ALL
                    const selectAll = document.querySelector('input.CheckAll, .column-check input, input[name="all_threads"]');
                    if (selectAll) {
                        console.log("[PlayerUp] Clicking Select All...");
                        if (!selectAll.checked) selectAll.click();
                    } else {
                        // Manual fallback
                        document.querySelectorAll('input[type="checkbox"][name*="thread_ids"]').forEach(c => { if (!c.checked) c.click(); });
                    }

                    // 2. TRIGGER ACTION
                    return new Promise((r) => {
                        setTimeout(() => {
                            console.log(`[PlayerUp] Triggering ${type}...`);
                            let actionBtn = null;

                            if (type === 'sort') {
                                // XenForo "Up Thread" or specific Sort
                                actionBtn = document.querySelector('input[value*="Up"], button[value*="Up"], .button--primary.js-inlineModTrigger') ||
                                    [...document.querySelectorAll('input, button, a')].find(b =>
                                        b.innerText?.toLowerCase().includes('sort') ||
                                        b.value?.toLowerCase().includes('sort') ||
                                        b.innerText?.toLowerCase().includes('up thread')
                                    );
                            } else if (type === 'delete') {
                                actionBtn = document.querySelector('.js-inlineModTrigger[data-action="delete"]');
                            }

                            if (actionBtn) {
                                console.log("[PlayerUp] Clicking action button...");
                                actionBtn.click();

                                // Handling XenForo Inline Mod Overlay
                                setTimeout(() => {
                                    const confirmBtn = document.querySelector('.overlay-title .button--primary, .js-overlayClose + .button--primary, input[value="Up Thread"]');
                                    if (confirmBtn) confirmBtn.click();
                                }, 1500);
                                r({ success: true });
                            } else {
                                r({ success: false, error: "Action button not found." });
                            }
                        }, 1000);
                    });
                },
                args: [actionType]
            });

            const res = result[0]?.result;
            if (dashboardTabId) {
                if (res?.success) chrome.tabs.sendMessage(dashboardTabId, { action: "PU_LOG", message: `✅ PlayerUp Batch ${actionType.toUpperCase()} Complete!` });
                else chrome.tabs.sendMessage(dashboardTabId, { action: "PU_LOG", message: `❌ Failed: ${res?.error || 'Unknown'}` });
            }

            setTimeout(() => {
                chrome.windows.remove(win.id);
                resolve();
            }, 5000);
        });
    });
}

/**
 * Z2U SAVE CHANGES (PRICE & STOCK UPDATE)
 * Takes updates: [{id: string, price: string, stock: string}]
 */
async function runZ2USaveChanges(request, sender, dashboardTabId, adminPass, apiBase) {
    const targetUrl = request.url || 'https://www.z2u.com/sell/manageList';
    const updates = request.updates;

    if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_LOG", message: `🛰️ Initializing Bulk Price/Stock Update for ${updates.length} items...` });

    return new Promise((resolve) => {
        chrome.windows.create({ url: targetUrl, type: 'popup', focused: true, width: 1200, height: 800 }, async (win) => {
            const tabId = win.tabs?.[0]?.id;
            if (!tabId) { resolve(); return; }

            // Wait 15s for Z2U to load fully
            await new Promise(r => setTimeout(r, 15000));

            const result = await chrome.scripting.executeScript({
                target: { tabId },
                func: (data) => {
                    const findRow = (id) => {
                        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
                        let node;
                        while (node = walker.nextNode()) {
                            if (node.textContent.includes(`#${id}`)) {
                                let row = node.parentElement;
                                for (let i = 0; i < 15; i++) {
                                    if (row.tagName === 'TR' || row.classList.contains('div-table-row') || row.classList.contains('product-item')) break;
                                    row = row.parentElement || row;
                                }
                                return row;
                            }
                        }
                        return null;
                    };

                    let successCount = 0;
                    data.forEach(item => {
                        const row = findRow(item.id);
                        if (!row) return;

                        // 1. Fill Price
                        const pInput = row.querySelector('.change_price, [name*="price"], .input-price');
                        if (pInput && item.price) {
                            pInput.value = item.price;
                            pInput.dispatchEvent(new Event('change', { bubbles: true }));
                        }

                        // 2. Fill Stock
                        const sInput = row.querySelector('[name*="stock"], .input-stock, [name*="qty"]');
                        if (sInput && item.stock) {
                            sInput.value = item.stock;
                            sInput.dispatchEvent(new Event('change', { bubbles: true }));
                        }

                        // 3. Select Listing
                        const check = row.querySelector('input[type="checkbox"]');
                        if (check && !check.checked) check.click();

                        successCount++;
                    });

                    // 4. Trigger Batch Update
                    const updateBtn = document.querySelector('.batchUpdateBtn, .btn-batch-update, .layui-btn-warm');
                    if (updateBtn) {
                        updateBtn.click();
                        // Confirm if needed
                        setTimeout(() => {
                            const ok = document.querySelector('.zu-confirm-btn-primary, .swal2-confirm, .layui-layer-btn0');
                            if (ok) ok.click();
                        }, 1000);
                        return { success: true, count: successCount };
                    }
                    return { success: false, error: "Batch Update button not found." };
                },
                args: [updates]
            });

            const res = result[0]?.result;
            if (dashboardTabId) {
                if (res?.success) chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_LOG", message: `✅ Successfully pushed updates for ${res.count} items.` });
                else chrome.tabs.sendMessage(dashboardTabId, { action: "Z2U_LOG", message: `❌ Bulk Update Failed: ${res?.error || 'Z2U error'}` });
            }

            setTimeout(() => {
                chrome.windows.remove(win.id);
                resolve();
            }, 5000);
        });
    });
}

async function runPlayerUpSync(request, sender, dashboardTabId, adminPass, apiBase) {
    const targetUrl = request.url || "https://www.playerup.com/account/threads";
    if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "PU_LOG", message: "Opening PlayerUp..." });

    return new Promise((resolve) => {
        chrome.windows.create({ url: targetUrl, type: 'popup', focused: false, left: -9999, top: -9999, width: 1, height: 1 }, async (win) => {
            const tabId = win.tabs?.[0]?.id;
            if (!tabId) { resolve(); return; }
            await new Promise(r => setTimeout(r, 5000));
            const results = await chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    const threads = [];
                    // Scrape Forum Threads
                    document.querySelectorAll('a[href*="/threads/"]').forEach(a => {
                        if (a.innerText.length > 5 && !a.href.includes('/threads/create')) {
                            threads.push({ title: a.innerText.trim(), url: a.href.split('?')[0].split('#')[0], status: 'Active' });
                        }
                    });
                    // Scrape Middleman Listings (Accounts page)
                    document.querySelectorAll('a[href*="/accounts/"]').forEach(a => {
                        if (a.innerText.length > 5 && !a.href.includes('/accounts/create')) {
                            threads.push({ title: a.innerText.trim(), url: a.href.split('?')[0].split('#')[0], status: 'Active' });
                        }
                    });
                    return { threads, count: threads.length };
                }
            });
            const data = results[0]?.result || { threads: [], count: 0 };
            if (data.count > 0) {
                await fetch(`${apiBase}/api/admin/playerup`, {
                    method: "POST", headers: { "Content-Type": "application/json", "X-Admin-Password": adminPass },
                    body: JSON.stringify({ action: "turbo_sync", listings: data.threads })
                });
            }
            if (dashboardTabId) chrome.tabs.sendMessage(dashboardTabId, { action: "PU_RESULT", count: data.count });
            setTimeout(() => chrome.windows.remove(win.id), 1000);
            resolve();
        });
    });
}

async function runRemoteBump(request, adminPass, apiBase) {
    if (isBumpingEngineRunning) {
        console.log("[OfficialUM1] Engine is already running. Ignoring bump request.");
        return;
    }
    isBumpingEngineRunning = true;
    try {
        if (request.singleUrl) {
            await performBumpAction({ id: request.id, url: request.singleUrl, title: "Thread" }, adminPass, apiBase);
        } else {
            const listRes = await fetch(`${apiBase}/api/admin/playerup`, {
                headers: { "X-Admin-Password": adminPass }
            });
            const data = await listRes.json();
            const targets = Array.isArray(data) ? data : (data.listings || []);
            for (const item of targets.slice(0, request.limit || 100)) {
                await performBumpAction(item, adminPass, apiBase);
                await new Promise(r => setTimeout(r, 5000));
            }
        }
    } catch (e) {
        console.error("Bump Error:", e);
    } finally {
        isBumpingEngineRunning = false;
    }
}

// BUMP LOGIC
async function performBumpAction(item, adminPass, apiBase) {
    console.log("[OfficialUM1] Bumping:", item.title);
    return new Promise((resolve) => {
        chrome.windows.create({ url: item.url, type: 'popup', focused: false, left: -9999, top: -9999, width: 1, height: 1 }, async (win) => {
            if (!win) { resolve({ success: false, error: "Window failed" }); return; }
            const tabId = win.tabs?.[0]?.id;

            // Wait for load
            setTimeout(async () => {
                try {
                    const results = await chrome.scripting.executeScript({
                        target: { tabId },
                        func: () => {
                            const upBtn = document.querySelector('a.UpControl, #upButtonCountdown, .UpButtonView, input[value="Up Thread"], a[href*="/up"]');
                            if (upBtn) {
                                if (upBtn.innerText?.includes("Wait") || upBtn.value?.includes("Wait")) return "LIMIT";

                                // Advanced Human-like Click Simulation
                                try {
                                    upBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });

                                    // Trigger events
                                    ['mouseover', 'mousedown', 'mouseup', 'click'].forEach(eventType => {
                                        const event = new MouseEvent(eventType, {
                                            view: window,
                                            bubbles: true,
                                            cancelable: true,
                                            buttons: 1
                                        });
                                        upBtn.dispatchEvent(event);
                                    });
                                } catch (e) {
                                    upBtn.click(); // Fallback
                                }

                                return "CLICKED";
                            }
                            else {
                                const reply = document.querySelector('.fr-element, textarea[name="message"]');
                                const submit = document.querySelector('button.button--primary, .js-submitReply');
                                if (reply && submit) {
                                    if (reply.tagName === 'TEXTAREA') reply.value = "Bump! Active.";
                                    else reply.innerText = "Bump! Active.";
                                    submit.click();
                                    return "REPLY";
                                }
                            }
                            return "NOT_FOUND";
                        }
                    });

                    const resType = results?.[0]?.result;
                    const success = ["CLICKED", "REPLY"].includes(resType);
                    const limit = resType === "LIMIT";

                    // Reporting
                    await fetch(`${apiBase}/api/admin/playerup`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "X-Admin-Password": adminPass },
                        body: JSON.stringify({
                            action: "update_bump",
                            id: item.id,
                            success: success,
                            limitReached: limit,
                            error: resType === "NOT_FOUND" ? "Button not found" : (limit ? "Daily limit" : null)
                        })
                    });

                    setTimeout(() => {
                        chrome.windows.remove(win.id, () => { });
                        resolve({ success, limit });
                    }, 5000);

                } catch (e) {
                    chrome.windows.remove(win.id, () => { });
                    resolve({ success: false, error: e.message });
                }
            }, 8000);
        });
    });
}

// POST LOGIC
async function performPostAction(data, adminPass, apiBase) {
    return new Promise((resolve) => {
        chrome.windows.create({
            url: data.categoryUrl, type: 'popup', focused: true, width: 1100, height: 900
        }, (win) => {
            const tabId = win.tabs?.[0]?.id;
            if (!tabId) { resolve(); return; }

            const interval = setInterval(async () => {
                try {
                    const results = await chrome.scripting.executeScript({
                        target: { tabId },
                        func: (offer) => {
                            const titleField = document.querySelector('input[name="title"]');
                            if (!titleField) return "WAITING";

                            // 1. Core Fields
                            titleField.value = offer.title;
                            titleField.dispatchEvent(new Event('input', { bubbles: true }));

                            const editor = document.querySelector('.fr-element, .redactor-editor, textarea[name="message"]');
                            if (editor) {
                                if (editor.tagName === 'TEXTAREA') editor.value = offer.description;
                                else editor.innerText = offer.description;
                                editor.dispatchEvent(new Event('input', { bubbles: true }));
                            }

                            // 2. Pricing
                            const priceField = document.getElementById('ctrl_custom_field_price') || document.querySelector('input[name*="price"]');
                            if (priceField) {
                                priceField.value = offer.price;
                                priceField.dispatchEvent(new Event('input', { bubbles: true }));
                            }

                            // 3. Custom Reddit Fields (Heuristics for PlayerUp)
                            // Post Karma
                            const pkField = document.querySelector('input[name*="post_karma"], input[id*="pk"], input[id*="post_karma"]');
                            if (pkField) { pkField.value = offer.postKarma; pkField.dispatchEvent(new Event('input', { bubbles: true })); }

                            // Comment Karma
                            const ckField = document.querySelector('input[name*="comment_karma"], input[id*="ck"]');
                            if (ckField) { ckField.value = offer.commentKarma; ckField.dispatchEvent(new Event('input', { bubbles: true })); }

                            // Age
                            const ageField = document.querySelector('input[name*="age"], input[id*="age"]');
                            if (ageField) { ageField.value = offer.ageString; ageField.dispatchEvent(new Event('input', { bubbles: true })); }

                            // Generic Text Detail (Often used for combined stats)
                            const detailField = document.querySelector('input[name*="detail"]');
                            if (detailField) {
                                detailField.value = `${offer.postKarma} PK / ${offer.commentKarma} CK`;
                                detailField.dispatchEvent(new Event('input', { bubbles: true }));
                            }

                            // 4. Dropdowns (Ownership / Delivery)
                            const selects = Array.from(document.querySelectorAll('select'));
                            selects.forEach(s => {
                                Array.from(s.options).forEach(opt => {
                                    if (opt.text.toLowerCase().includes(offer.ownership.toLowerCase())) s.value = opt.value;
                                    if (opt.text.toLowerCase().includes(offer.delivery.toLowerCase())) s.value = opt.value;
                                });
                                s.dispatchEvent(new Event('change', { bubbles: true }));
                            });

                            // 5. Buy Now Link
                            const buyNowBtn = document.querySelector('.fc_get_buy_now, .button.OverlayTrigger');
                            if (buyNowBtn && buyNowBtn.innerText.includes('Buy Now Link')) {
                                buyNowBtn.click();
                            }

                            const submitBtn = document.querySelector('input[type="submit"].primary, button.button--primary');
                            if (submitBtn) {
                                setTimeout(() => submitBtn.click(), 3000);
                                return "CLICKED";
                            }
                            return "FILLED";
                        },
                        args: [JSON.parse(JSON.stringify(data))]
                    });

                    if (results?.[0]?.result === "CLICKED") {
                        clearInterval(interval);
                        setTimeout(() => {
                            if (!tabId) { resolve("POSTED"); return; }
                            chrome.tabs.get(tabId, async (tab) => {
                                if (chrome.runtime.lastError || !tab) {
                                    console.log("[Extension] Tab unavailable, resolving anyway.");
                                    resolve("POSTED");
                                    return;
                                }
                                if (tab.url && tab.url.includes('/threads/')) {
                                    try {
                                        await fetch(`${apiBase}/api/admin/playerup`, {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json", "X-Admin-Password": adminPass },
                                            body: JSON.stringify({ action: "turbo_sync", listings: [{ title: data.title, url: tab.url.split('?')[0], status: 'Active' }] })
                                        });
                                    } catch (e) { console.error("Sync Error:", e); }
                                }
                                if (win.id) {
                                    chrome.windows.remove(win.id, () => {
                                        if (chrome.runtime.lastError) { /* ignore */ }
                                        resolve("POSTED");
                                    });
                                } else { resolve("POSTED"); }
                            });
                        }, 8000);
                    }
                } catch (e) {
                    console.error("Post Script Error:", e);
                    clearInterval(interval);
                    resolve("ERROR");
                }
            }, 3000);
        });
    });
}

// ALARMS & BACKGROUND TASKS
chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create("OFFICIALUM1_HEARTBEAT", { periodInMinutes: 0.5 }); // High frequency heartbeat
    chrome.alarms.create("OFFICIALUM1_AUTO_BUMP", { periodInMinutes: 1 }); // 1-minute aggressive checking
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "OFFICIALUM1_HEARTBEAT") {
        console.log("[OfficialUM1] Heartbeat - Active.");
        // Keep-alive: Accessing storage keeps the SW from suspending immediately
        await chrome.storage.local.get(['admin_pass']);
    }

    if (alarm.name === "OFFICIALUM1_AUTO_BUMP") {
        if (isBumpingEngineRunning) {
            console.log("[OfficialUM1] Aggressive Background Bump Cycle Skipped: Engine is currently bumping.");
            return;
        }

        console.log("[OfficialUM1] Starting Aggressive Background Bump Cycle...");
        const res = await chrome.storage.local.get(['admin_pass', 'api_url']);
        const apiBase = res.api_url || "https://officialum1.com";
        const adminPass = res.admin_pass;

        if (!adminPass) return;

        try {
            // Check for due bumps on server
            const listRes = await fetch(`${apiBase}/api/admin/playerup`, {
                headers: { "X-Admin-Password": adminPass }
            });
            const data = await listRes.json();
            const listings = Array.isArray(data) ? data : (data.listings || []);

            const now = Date.now();
            const due = listings.filter(item => {
                if (item.status !== 'Active' || !item.autoBump) return false;

                // DESTRUCTIVE USER REQUEST: Remove the 4-bump daily limit
                // if (item.dailyBumpCount >= 4) return false; 

                let interval = 2 * 60 * 60 * 1000; // Default 2 hours
                if (item.frequency) {
                    const f = item.frequency.toLowerCase();
                    if (f === 'never stop' || f === 'continuous' || f.includes('instant')) interval = 30 * 1000; // 30s safety
                    else {
                        const val = parseInt(f.replace(/[^0-9]/g, '')) || 1;
                        if (f.includes('second')) interval = val * 1000;
                        else if (f.includes('minute')) interval = val * 60 * 1000;
                        else if (f.includes('hour')) interval = val * 60 * 60 * 1000;
                    }
                }

                const last = item.lastBumped ? new Date(item.lastBumped).getTime() : 0;
                return (now - last) >= interval;
            });

            if (due.length > 0) {
                isBumpingEngineRunning = true;
                console.log(`[OfficialUM1] Turbo-Bump: Dispatching ${due.length} items...`);
                try {
                    // Process ALL due items in sequence with 5s delay to avoid IP triggering
                    for (const item of due) {
                        await performBumpAction(item, adminPass, apiBase);
                        await new Promise(r => setTimeout(r, 5000));
                    }
                } finally {
                    isBumpingEngineRunning = false;
                }
            }
        } catch (e) {
            console.error("[OfficialUM1] Autonomous Bump Engine Network Error:", e.message);
            isBumpingEngineRunning = false;
        }
    }
});
/**
 * Z2U POST ACTION (Wizard & Form)
 */
async function performZ2UPostAction(data, adminPass, apiBase) {
    return new Promise((resolve) => {
        chrome.windows.create({
            url: data.categoryUrl, type: 'popup', focused: true, width: 1200, height: 900
        }, (win) => {
            const tabId = win.tabs?.[0]?.id;
            if (!tabId) { resolve(); return; }

            const interval = setInterval(async () => {
                try {
                    const results = await chrome.scripting.executeScript({
                        target: { tabId },
                        func: (offer) => {
                            // Step 1: Handle Category Selection (Wizard)
                            const nextBtn = document.querySelector('.next-step-btn, .zu-btn-primary.wizard-next');
                            if (nextBtn && document.querySelector('.level-box')) {
                                // If categories are selected or we just need to click next
                                nextBtn.click();
                                return "WIZARD_STEP";
                            }

                            // Step 2: Fill Product Form
                            const nameField = document.querySelector('input[name="product_name"], .product-name input');
                            if (!nameField) return "WAITING_FOR_FORM";

                            // Fill Name
                            nameField.value = offer.title;
                            nameField.dispatchEvent(new Event('input', { bubbles: true }));

                            // Fill Price
                            const priceField = document.querySelector('input[name="product_price"], input[name="unit_price"]');
                            if (priceField) {
                                priceField.value = offer.price;
                                priceField.dispatchEvent(new Event('input', { bubbles: true }));
                            }

                            // Fill Stock
                            const stockField = document.querySelector('input[name="inventory"], input[name="stock"]');
                            if (stockField) {
                                stockField.value = offer.stock;
                                stockField.dispatchEvent(new Event('input', { bubbles: true }));
                            }

                            // Fill Description (handling both textarea and ueditor/iframe)
                            const descArea = document.querySelector('textarea[name="product_description"]');
                            if (descArea) {
                                descArea.value = offer.description;
                                descArea.dispatchEvent(new Event('input', { bubbles: true }));
                            } else {
                                // Ueditor/Iframe fallback
                                const iframe = document.querySelector('iframe[id*="ueditor"]');
                                if (iframe && iframe.contentDocument) {
                                    iframe.contentDocument.body.innerHTML = offer.description;
                                }
                            }

                            // Set minimal quantity to 1
                            const minField = document.querySelector('input[name="min_count"]');
                            if (minField) { minField.value = "1"; minField.dispatchEvent(new Event('input', { bubbles: true })); }

                            // Submit
                            const submitBtn = document.querySelector('.release-btn, .submit-btn, button[type="submit"]');
                            if (submitBtn) {
                                setTimeout(() => submitBtn.click(), 2000);
                                return "CLICKED";
                            }

                            return "FILLED";
                        },
                        args: [data]
                    });

                    const status = results?.[0]?.result;
                    if (status === "CLICKED") {
                        clearInterval(interval);
                        setTimeout(async () => {
                            // Sync the new listing back to our DB
                            await fetch(`${apiBase}/api/admin/z2u`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'X-Admin-Password': adminPass },
                                body: JSON.stringify({
                                    action: 'turbo_sync', listings: [{
                                        id: 'PENDING', // Will be updated on next full sync
                                        title: data.title,
                                        price: data.price,
                                        stock: data.stock,
                                        status: 'Active',
                                        url: data.categoryUrl
                                    }]
                                })
                            });
                            chrome.windows.remove(win.id);
                            resolve("POSTED");
                        }, 5000);
                    }
                } catch (e) { console.error("Z2U Post Error:", e); }
            }, 3000);
        });
    });
}
