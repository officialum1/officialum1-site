
console.log("🛠️ OfficialUM1 Sync Bridge Active");

const SITE_CONFIG = {
    'playerup.com': {
        selector: '.structItem-title a, a[href*="/threads/"]',
        name: 'PlayerUp'
    },
    'g2g.com': {
        selector: '.p-l-item__title a, a[href*="/product/"]',
        name: 'G2G'
    },
    'z2u.com': {
        selector: 'tr', // We select the ROW, not just the title
        name: 'Z2U',
        isTable: true
    }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "PING") {
        sendResponse({ status: "ALIVE" });
    } else if (request.action === "START_SYNC") {
        sendResponse({ status: "STARTED" }); // Reply immediately to fix "Still sleeping" error
        startSyncProcess();
    } else if (request.action === "START_BUMP") {
        sendResponse({ status: "BUMPING" });
        startBumpProcess(request.limit);
    } else if (request.action === "Z2U_LOG") {
        window.dispatchEvent(new CustomEvent('OFFICIALUM1_Z2U_LOG', { detail: { message: request.message } }));
    } else if (request.action === "PU_LOG") {
        window.dispatchEvent(new CustomEvent('OFFICIALUM1_PU_LOG', { detail: { message: request.message } }));
    }
    return true;
});

async function startBumpProcess(limit = 0) {
    chrome.runtime.sendMessage({ action: "SYNC_PROGRESS", text: `> Starting Auto-Bump Engine...` });

    // Target common thread links
    const container = document.querySelector('.p-body-main, .main-content, #content, .structItemContainer, .ProfilePostings') || document;
    const links = [...container.querySelectorAll('.structItem-title a, .previewLink, a[href*="/threads/"]')];

    const uniqueUrls = [...new Set(links.map(a => a.href.split('?')[0]))].filter(url => url.includes('/threads/'));
    const finalTargets = limit > 0 ? uniqueUrls.slice(0, limit) : uniqueUrls;

    let bumped = 0;
    for (const url of finalTargets) {
        chrome.runtime.sendMessage({ action: "SYNC_PROGRESS", text: `🔥 Bumping: ${url.split('/').pop()}` });
        try {
            const upUrl = url.endsWith('/') ? url + 'up' : url + '/up';
            const res = await fetch(upUrl);
            const text = await res.text();

            let status = 'success';
            let error = '';

            if (!res.ok) {
                status = 'failed';
                error = `HTTP ${res.status}`;
            } else {
                const lowerText = text.toLowerCase();
                if (lowerText.includes("reached todays max bumping limit") || lowerText.includes("4 bump(s) per day")) {
                    status = 'limit_reached';
                    error = 'Daily limit reached';
                } else if (lowerText.includes("log in") || lowerText.includes("sign in")) {
                    status = 'failed';
                    error = 'Login required';
                } else if (lowerText.includes("already bumped") || lowerText.includes("you must wait")) {
                    status = 'failed';
                    error = 'Wait Timer (Cooldown)';
                }
            }

            if (status === 'success') bumped++;

            // Tell our server we bumped it so the dashboard updates
            chrome.runtime.sendMessage({
                action: "SYNC_TO_SERVER",
                listings: [{ url, status, error }],
                type: "BUMP_UPDATE"
            });

        } catch (e) {
            console.error(e);
            chrome.runtime.sendMessage({
                action: "SYNC_TO_SERVER",
                listings: [{ url, status: 'failed', error: e.message }],
                type: "BUMP_UPDATE"
            });
        }
        await new Promise(r => setTimeout(r, 1500)); // Increased safety delay
    }

    chrome.runtime.sendMessage({ action: "SYNC_PROGRESS", text: `✅ Finished! Bumped ${bumped} threads.` });
}

async function startSyncProcess() {
    const host = window.location.hostname.replace('www.', '');
    const config = SITE_CONFIG[host] || SITE_CONFIG['playerup.com']; // Fallback

    chrome.runtime.sendMessage({ action: "SYNC_PROGRESS", text: `> Sync Engine Online...` });

    const JUNK_TITLES = ['contact', 'help', 'terms', 'privacy', 'rules', 'navigation', 'search', 'profile', 'logout', 'login'];

    let page = 1;
    let totalSynced = 0;
    let consecutiveEmptyCount = 0;

    // Detect base URL
    let baseUrl = window.location.href.split('?')[0].split('/page-')[0];
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

    if (config.isTable) {
        // Z2U SPECIFIC LOGIC
        while (page <= 50) {
            const targetUrl = page === 1 ? baseUrl : baseUrl + "?page=" + page;
            try {
                const res = await fetch(targetUrl);
                if (!res.ok) break;
                const html = await res.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const rows = [...doc.querySelectorAll('tr')];

                const batch = [];
                rows.forEach(row => {
                    const check = row.querySelector('input.checkbox-item');
                    if (check) {
                        const id = check.value;
                        const statusSpan = row.querySelector('.status-text') || row.querySelector('.status');
                        const status = statusSpan ? statusSpan.innerText.trim() : "Active";
                        const titleEl = row.querySelector('.product-name');
                        const title = titleEl ? titleEl.innerText.trim() : "Unknown";
                        const priceEl = row.querySelector('.price');
                        const price = priceEl ? priceEl.innerText.replace('$', '').trim() : "0";
                        const stockInput = row.querySelector('input[name*="stock"], input[name*="qty"], .input-stock, input[type="number"]');
                        let stock = "1";
                        if (stockInput && stockInput.value) {
                            stock = stockInput.value.trim();
                        } else {
                            const stockEl = row.querySelector('.stock, .inventory, .qty') || row.querySelector('.div-table-cell:nth-child(5)'); // Fallback to cell column
                            if (stockEl) {
                                // Split by segments to avoid merging 97 and 15
                                const segments = stockEl.innerText.trim().split(/[\s\n]+/);
                                for (const seg of segments) {
                                    const cleanSeg = seg.replace(/[^\d]/g, '');
                                    if (cleanSeg && !seg.toLowerCase().includes('min')) {
                                        stock = cleanSeg;
                                        break;
                                    }
                                }
                            }
                        }
                        const editLink = row.querySelector('a[href*="edit"]');
                        const url = editLink ? editLink.href : "";

                        if (id && title !== "Unknown") {
                            batch.push({
                                id,
                                title,
                                price,
                                stock,
                                status,
                                url,
                                platform: 'Z2U'
                            });
                        }
                    }
                });

                if (batch.length === 0) {
                    consecutiveEmptyCount++;
                    if (consecutiveEmptyCount >= 3) break;
                } else {
                    consecutiveEmptyCount = 0;
                    chrome.runtime.sendMessage({ action: "SYNC_PROGRESS", text: `+ Found ${batch.length} Z2U items on page ${page}...` });
                    await new Promise((resolve) => {
                        chrome.runtime.sendMessage({ action: "SYNC_TO_SERVER", listings: batch, type: "Z2U_SYNC" }, resolve);
                    });
                    totalSynced += batch.length;
                }
                page++;
                await new Promise(r => setTimeout(r, 600));

            } catch (e) {
                console.error(e);
                break;
            }
        }
    } else {
        // PLAYERUP / G2G LOGIC (Existing)
        while (page <= 50) {
            const targetUrl = page === 1 ? baseUrl : baseUrl + "/page-" + page;
            try {
                const res = await fetch(targetUrl);
                if (!res.ok) break;
                const html = await res.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");

                // Broaden container search for Profile vs Forum support
                const mainContent = doc.querySelector('.p-body-main, .main-content, #content, .structItemContainer, .ProfilePostings') || doc;
                const links = [...mainContent.querySelectorAll(config.selector)];

                const uniqueThreads = new Map();

                links.forEach(a => {
                    const url = a.href.split('?')[0];
                    const title = a.innerText.trim();
                    const cleanTitle = title.toLowerCase();

                    // Advanced Filter: Must have title, must be a thread/product, must not be junk
                    const isJunk = JUNK_TITLES.some(junk => cleanTitle.includes(junk));
                    const isValidType = (url.includes('/threads/') || url.includes('/product/')) && !url.endsWith('/threads/') && !url.endsWith('/product/');

                    if (title && isValidType && !isJunk && !uniqueThreads.has(url)) {
                        uniqueThreads.set(url, { title, url });
                    }
                });

                const batch = Array.from(uniqueThreads.values());

                if (batch.length === 0) {
                    consecutiveEmptyCount++;
                    if (consecutiveEmptyCount >= 3) break;
                } else {
                    consecutiveEmptyCount = 0;
                    // Show actual titles in the log so the user knows what's happening
                    batch.slice(0, 2).forEach(item => {
                        chrome.runtime.sendMessage({ action: "SYNC_PROGRESS", text: `+ Found: ${item.title.substring(0, 20)}...` });
                    });

                    // DELEGATE TO BACKGROUND: Fixes CORS and connection drops
                    await new Promise((resolve) => {
                        chrome.runtime.sendMessage({ action: "SYNC_TO_SERVER", listings: batch }, (response) => {
                            if (response && response.success) {
                                totalSynced += batch.length;
                            }
                            resolve();
                        });
                    });
                }

                page++;
                await new Promise(r => setTimeout(r, 600));
            } catch (e) {
                console.error(e);
                break;
            }
        }
    }

    chrome.runtime.sendMessage({ action: "SYNC_COMPLETE", count: totalSynced });
}
// LISTENER FOR REMOTE COMMANDS FROM DASHBOARD
window.addEventListener('OFFICIALUM1_Z2U_SYNC', () => {
    chrome.storage.local.get(['admin_pass'], (res) => {
        chrome.runtime.sendMessage({ action: "Z2U_SYNC", adminPass: res.admin_pass });
    });
});

window.addEventListener('OFFICIALUM1_REMOTE_SYNC', () => {
    chrome.storage.local.get(['admin_pass'], (res) => {
        chrome.runtime.sendMessage({ action: "REMOTE_SYNC", adminPass: res.admin_pass });
    });
});

window.addEventListener('OFFICIALUM1_REMOTE_BUMP', (e) => {
    chrome.storage.local.get(['admin_pass'], (res) => {
        chrome.runtime.sendMessage({ action: "REMOTE_BUMP", adminPass: res.admin_pass, limit: e.detail?.limit || 0 });
    });
});


window.addEventListener('OFFICIALUM1_SINGLE_BUMP', (e) => {
    chrome.storage.local.get(['admin_pass'], (res) => {
        chrome.runtime.sendMessage({
            action: "REMOTE_BUMP",
            adminPass: res.admin_pass,
            singleUrl: e.detail.url,
            id: e.detail.id
        });
    });
});


window.addEventListener('OFFICIALUM1_SYNC_COOKIES', (e) => {
    chrome.storage.local.get(['admin_pass'], (res) => {
        chrome.runtime.sendMessage({ action: "SYNC_COOKIES", url: e.detail.url, adminPass: res.admin_pass });
    });
});

// NEW COMMANDS FOR Z2U & PLAYERUP POSTING
window.addEventListener('OFFICIALUM1_Z2U_SAVE_CHANGES', (e) => {
    chrome.storage.local.get(['admin_pass'], (res) => {
        chrome.runtime.sendMessage({ action: "Z2U_SAVE_CHANGES", updates: e.detail.updates, url: e.detail.url, adminPass: res.admin_pass });
    });
});

window.addEventListener('OFFICIALUM1_Z2U_BATCH_ACTION', (e) => {
    chrome.storage.local.get(['admin_pass'], (res) => {
        chrome.runtime.sendMessage({ action: "Z2U_BATCH_ACTION", actionType: e.detail.actionType, id: e.detail.id, ids: e.detail.ids, url: e.detail.url, adminPass: res.admin_pass });
    });
});

window.addEventListener('OFFICIALUM1_Z2U_POST_OFFER', (e) => {
    chrome.storage.local.get(['admin_pass'], (res) => {
        chrome.runtime.sendMessage({ action: "Z2U_POST_OFFER", data: e.detail, adminPass: res.admin_pass });
    });
});

window.addEventListener('OFFICIALUM1_POST_THREAD', (e) => {
    chrome.storage.local.get(['admin_pass'], (res) => {
        chrome.runtime.sendMessage({ action: "POST_THREAD", data: e.detail, adminPass: res.admin_pass });
    });
});
window.addEventListener('OFFICIALUM1_PLAYERUP_BATCH_ACTION', (e) => {
    chrome.storage.local.get(['admin_pass'], (res) => {
        chrome.runtime.sendMessage({ action: "PLAYERUP_BATCH_ACTION", actionType: e.detail.actionType, url: e.detail.url, adminPass: res.admin_pass });
    });
});
