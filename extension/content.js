
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
        selector: '.item-title a',
        name: 'Z2U'
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
            if (res.ok) {
                bumped++;
                // Tell our server we bumped it so the dashboard updates
                chrome.runtime.sendMessage({ action: "SYNC_TO_SERVER", listings: [{ url, title: "BUMPED" }], type: "BUMP_UPDATE" });
            }
        } catch (e) { console.error(e); }
        await new Promise(r => setTimeout(r, 800)); // Safety delay
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

    while (page <= 50) { // Safety limit
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
        chrome.runtime.sendMessage({ action: "REMOTE_BUMP", adminPass: res.admin_pass, singleUrl: e.detail.url });
    });
});

window.addEventListener('OFFICIALUM1_SYNC_COOKIES', (e) => {

    chrome.storage.local.get(['admin_pass'], (res) => {
        chrome.runtime.sendMessage({ action: "SYNC_COOKIES", url: e.detail.url, adminPass: res.admin_pass });
    });
});
