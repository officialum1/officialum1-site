// BRIDGE SCRIPT - Links Dashboard with Extension
console.log("🚀 OfficialUM1 Extension Bridge Active");

// Listen for custom signals from the React Dashboard
window.addEventListener('OFFICIALUM1_REMOTE_SYNC', (e) => {
    console.log("📡 Remote Sync Signal Received...");
    chrome.runtime.sendMessage({ action: "REMOTE_SYNC" });
});

window.addEventListener('OFFICIALUM1_REMOTE_BUMP', (e) => {
    console.log("📡 Remote Bump Signal Received (Limit: " + e.detail.limit + ")...");
    chrome.runtime.sendMessage({ action: "REMOTE_BUMP", limit: e.detail.limit });
});
