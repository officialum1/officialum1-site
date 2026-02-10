// BRIDGE SCRIPT - Links Dashboard with Extension
console.log("🚀 OfficialUM1 Extension Bridge Active");

// Auto-detect and save the API URL for the background script
chrome.storage.local.set({ last_api_url: window.location.origin });

// Listen for custom signals from the React Dashboard
window.addEventListener('OFFICIALUM1_REMOTE_SYNC', (e) => {
    console.log("📡 Remote Sync Signal Received...");
    chrome.runtime.sendMessage({ action: "REMOTE_SYNC" });
});

window.addEventListener('OFFICIALUM1_Z2U_SYNC', (e) => {
    console.log("📡 Z2U Sync Signal Received...");
    chrome.runtime.sendMessage({ action: "Z2U_SYNC" });
});

window.addEventListener('OFFICIALUM1_REMOTE_BUMP', (e) => {
    console.log("📡 Remote Bump Signal Received (Limit: " + e.detail.limit + ")...");
    chrome.runtime.sendMessage({ action: "REMOTE_BUMP", limit: e.detail.limit });
});

window.addEventListener('OFFICIALUM1_SINGLE_BUMP', (e) => {
    console.log("📡 Single Bump Signal Received (Listing: " + e.detail.id + ")...");
    chrome.runtime.sendMessage({
        action: "REMOTE_BUMP",
        singleUrl: e.detail.url,
        id: e.detail.id
    });
});

window.addEventListener('OFFICIALUM1_AUTH_UPDATE', (e) => {
    console.log("📡 Auth Update Signal Received...");
    if (e.detail.pass) {
        chrome.storage.local.set({ admin_pass: e.detail.pass }, () => {
            console.log("✅ Admin Password Synced to Extension");
        });
    }
});
