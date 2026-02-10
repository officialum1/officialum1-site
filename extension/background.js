
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
    if (request.action === "REMOTE_SYNC" || request.action === "REMOTE_BUMP" || request.action === "Z2U_SYNC") {
        const adminPassAction = request.adminPass; // Can be passed directly or fetched from storage

        chrome.storage.local.get(['admin_pass'], async (res) => {
            const adminPass = adminPassAction || res.admin_pass;

            if (request.action === "Z2U_SYNC") {
                try {
                    const response = await fetch("https://www.z2u.com/sell/manage", {
                        credentials: 'include',
                        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36" }
                    });
                    if (response.ok) {
                        const html = await response.text();
                        const listings = [];

                        // Z2U Seller Manage Page uses a table with data-id or similar attributes
                        // We'll use a more flexible regex to capture rows and common class names
                        const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
                        const idRegex = /data-id="(\d+)"|id="listing-(\d+)"/;
                        const titleRegex = /<a[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/a>|<div[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/div>/;
                        const priceRegex = /unit-price">([^<]+)<\/span>|\$([\d.]+)/;
                        const stockRegex = /stock-input"[^>]*value="(\d+)"|stock">(\d+)<\/div>/;
                        const statusRegex = /status-text">([^<]+)<\/span>|status">([^<]+)<\/div>/;


                        let match;
                        while ((match = rowRegex.exec(html)) !== null) {
                            const content = match[1];
                            const idMatch = content.match(idRegex) || match[0].match(idRegex);
                            const titleMatch = content.match(titleRegex);
                            const priceMatch = content.match(priceRegex);
                            const stockMatch = content.match(stockRegex);
                            const statusMatch = content.match(statusRegex);

                            if (idMatch && titleMatch) {
                                const id = idMatch[1] || idMatch[2];
                                listings.push({
                                    id,
                                    title: (titleMatch[1] || titleMatch[2]).trim(),
                                    url: `https://www.z2u.com/products/${id}.html`,
                                    price: priceMatch ? (priceMatch[1] || priceMatch[2]).replace(/[^\d.]/g, '') : '0',
                                    stock: stockMatch ? (stockMatch[1] || stockMatch[2]) : '0',
                                    status: statusMatch ? (statusMatch[1] || statusMatch[2]).trim() : 'Unknown'
                                });
                            }
                        }


                        if (listings.length > 0) {
                            await fetch("https://officialum1.com/api/admin/z2u", {
                                method: "POST",
                                headers: { "Content-Type": "application/json", "X-Admin-Password": adminPass },
                                body: JSON.stringify({ action: "turbo_sync", listings })
                            });
                        }
                    }
                } catch (e) { console.error("Z2U Sync Error:", e); }
            } else if (request.action === "REMOTE_SYNC") {

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
                    if (request.singleUrl) {
                        const upUrl = request.singleUrl.replace(/\/$/, '') + '/up';
                        await fetch(upUrl, {
                            credentials: 'include',
                            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36" }
                        });
                    } else {
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
