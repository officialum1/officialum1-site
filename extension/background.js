
// BACKGROUND SERVICE WORKER - Bypasses CORS and handles API requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SYNC_TO_SERVER") {
        // Run the fetch in background script to bypass CORS
        fetch("https://officialum1.com/api/admin/playerup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
