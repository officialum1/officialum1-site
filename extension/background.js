
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

        // Get the saved admin password for the final push
        chrome.storage.local.get(['admin_pass'], async (res) => {
            const adminPass = res.admin_pass;

            if (isSync) {
                // UNDERGROUND SYNC: Fetch & Parse without showing anything
                try {
                    const response = await fetch("https://www.playerup.com/accounts/-/postings", {
                        credentials: 'include'
                    });
                    const html = await response.text();

                    // Regex to find thread links
                    const threadRegex = /href="([^"]*\/threads\/[^"]*)"[^>]*>([^<]+)<\/a>/g;
                    const listings = [];
                    let match;
                    while ((match = threadRegex.exec(html)) !== null) {
                        listings.push({ url: match[1], title: match[2].trim() });
                    }

                    if (listings.length > 0) {
                        fetch("https://officialum1.com/api/admin/playerup", {
                            method: "POST",
                            headers: { "Content-Type": "application/json", "X-Admin-Password": adminPass },
                            body: JSON.stringify({ action: "turbo_sync", listings })
                        });
                    }
                } catch (e) { console.error("Underground Sync Failed:", e); }
            } else {
                // UNDERGROUND BUMP: Ping /up URLs in sequence
                try {
                    // 1. Get listings from our server
                    const listRes = await fetch("https://officialum1.com/api/admin/playerup");
                    const data = await listRes.json();
                    let targets = Array.isArray(data) ? data : (data.listings || []);
                    if (request.limit > 0) targets = targets.slice(0, request.limit);

                    for (const item of targets) {
                        const upUrl = item.url.replace(/\/$/, '') + '/up';
                        await fetch(upUrl, { credentials: 'include' });
                        await new Promise(r => setTimeout(r, 600)); // Stealth delay
                    }
                } catch (e) { console.error("Underground Bump Failed:", e); }
            }
        });

        sendResponse({ success: true, mode: "UNDERGROUND" });
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
