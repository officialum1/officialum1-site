
// BACKGROUND SERVICE WORKER - Bypasses CORS and handles API requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SYNC_COOKIES") {
        const url = new URL(request.url);
        const baseDomain = url.hostname.split('.').slice(-2).join('.'); // e.g. playerup.com

        // Get all cookies for the entire domain (not just sub-domain)
        chrome.cookies.getAll({ domain: baseDomain }, async (cookies) => {
            const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

            // Send to our settings/session API
            fetch("https://officialum1.com/api/admin/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Password": request.adminPass
                },
                body: JSON.stringify({
                    action: "save_session",
                    site: baseDomain,
                    cookies: cookieString
                })
            })
                .then(res => res.ok ? sendResponse({ success: true }) : sendResponse({ success: false }))
                .catch(() => sendResponse({ success: false }));
        });
        return true;
    }

    if (request.action === "SYNC_TO_SERVER") {
        // Run the fetch in background script to bypass CORS
        fetch("https://officialum1.com/api/admin/playerup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Admin-Password": request.adminPass
            },
            body: JSON.stringify({ action: "turbo_sync", listings: request.listings })
        })
            .then(res => res.json())
            .then(data => {
                sendResponse({ success: true, count: data.count });
            })
            .catch(err => {
                console.error("Sync Error:", err);
                sendResponse({ success: false, error: err.message });
            });
        return true; // Keep channel open for async response
    }
});
