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

// Listen for messages from Background Script (Feedback Loop)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "Z2U_LOG") {
        console.log(`[Z2U BACKEND]: ${msg.message}`);
        // Optional: Dispatch event if React needs to show toast
    }
    if (msg.action === "Z2U_RESULT") {
        console.log(`[Z2U FINAL]: Found ${msg.count} listings.`);
        if (msg.count === 0) {
            console.warn("⚠️ Zero listings found. You might need to log in or check the URL.");
            alert("Z2U Sync: 0 listings found. Please ensure you are logged into Z2U in this browser.");
        } else {
            alert(`Z2U Sync Success! Found ${msg.count} listings.`);
        }
    }
    if (msg.action === "PU_LOG") {
        console.log(`[PLAYERUP BACKEND]: ${msg.message}`);
    }
    if (msg.action === "PU_RESULT") {
        console.log(`[PLAYERUP FINAL]: Found ${msg.count} threads.`);
        if (msg.count === 0) {
            alert("PlayerUp Sync: 0 threads found. Please ensure you are logged into PlayerUp in this browser.");
        } else {
            alert(`PlayerUp Sync Success! Found ${msg.count} threads.`);
        }
    }
});
