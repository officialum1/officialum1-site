
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
    }
    return true;
});

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
