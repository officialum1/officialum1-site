// 💓 Persistent Keep-Alive Port: Forces Service Worker to stay "Active"
let keepAlivePort;
function connectPort() {
    try {
        keepAlivePort = chrome.runtime.connect({ name: "OFFICIALUM1_KEEP_ALIVE" });
        keepAlivePort.onDisconnect.addListener(() => {
            console.log("💓 Port disconnected, reconnecting...");
            setTimeout(connectPort, 1000);
        });
        console.log("✅ Persistent Keep-Alive Port Connected.");
    } catch (e) {
        setTimeout(connectPort, 5000);
    }
}
connectPort();

// Auto-detect and save the API URL for the background script
chrome.storage.local.set({ last_api_url: window.location.origin });

// Listen for custom signals from the React Dashboard
window.addEventListener('OFFICIALUM1_REMOTE_SYNC', (e) => {
    console.log("📡 Remote Sync Signal Received...");
    try {
        chrome.runtime.sendMessage({ action: "REMOTE_SYNC", detail: e.detail }, (res) => {
            if (chrome.runtime.lastError && chrome.runtime.lastError.message.includes("invalidated")) {
                alert("Extension Updated! Please REFRESH this page.");
            }
        });
    } catch (err) {
        if (err.message.includes("invalidated")) alert("Extension update detected. Please REFRESH.");
    }
});

window.addEventListener('OFFICIALUM1_Z2U_SYNC', (e) => {
    console.log("📡 Z2U Sync Signal Received...");
    try {
        chrome.runtime.sendMessage({
            action: "Z2U_SYNC",
            url: e.detail?.url,
            adminPass: e.detail?.pass // PURE AUTH PASS-THROUGH
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.warn("Extension connect warning:", chrome.runtime.lastError.message);
                if (chrome.runtime.lastError.message.includes("invalidated")) {
                    alert("Extension was updated! Please REFRESH this page to reconnect.");
                }
            }
        });
    } catch (err) {
        console.error("Bridge Error:", err);
        if (err.message.includes("invalidated")) {
            alert("Extension was updated! Please REFRESH this page to reconnect.");
        }
    }
});

window.addEventListener('OFFICIALUM1_G2G_SYNC', (e) => {
    console.log("📡 G2G Sync Signal Received...");
    chrome.storage.local.get(['admin_pass'], (res) => {
        try {
            chrome.runtime.sendMessage({
                action: "G2G_SYNC",
                url: e.detail?.url,
                adminPass: res.admin_pass
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.warn("Extension connect warning:", chrome.runtime.lastError.message);
                }
            });
        } catch (err) {
            console.error("Bridge Error:", err);
            if (err.message && err.message.includes("invalidated")) {
                alert("Extension updated! Please REFRESH this page to reconnect.");
            }
        }
    });
});

window.addEventListener('OFFICIALUM1_G2G_AUTO_ONLINE', (e) => {
    console.log("📡 G2G Auto-Online Signal: " + e.detail);
    chrome.storage.local.set({ g2g_auto_online: e.detail }, () => {
        console.log("✅ G2G Auto-Online Preference Saved to Extension.");
    });
});

window.addEventListener('OFFICIALUM1_G2G_AUTO_REPLY_TOGGLE', (e) => {
    console.log("📡 G2G Flash Reply Toggle: " + e.detail);
    chrome.storage.local.set({ g2g_auto_reply: e.detail });
});

window.addEventListener('OFFICIALUM1_G2G_AUTO_REPLY_MSG', (e) => {
    console.log("📡 G2G Repy Message Update...");
    chrome.storage.local.set({ g2g_reply_msg: e.detail });
});

// Z2U Listeners
window.addEventListener('OFFICIALUM1_Z2U_AUTO_ONLINE', (e) => {
    console.log("📡 Z2U Auto-Online Signal: " + e.detail);
    chrome.storage.local.set({ z2u_auto_online: e.detail });
});
window.addEventListener('OFFICIALUM1_Z2U_AUTO_REPLY_TOGGLE', (e) => {
    console.log("📡 Z2U Flash Reply Toggle: " + e.detail);
    chrome.storage.local.set({ z2u_auto_reply: e.detail });
});
window.addEventListener('OFFICIALUM1_Z2U_AUTO_REPLY_MSG', (e) => {
    console.log("📡 Z2U Flash Reply Message: " + e.detail);
    chrome.storage.local.set({ z2u_reply_msg: e.detail });
});

window.addEventListener('OFFICIALUM1_Z2U_BATCH_ACTION', (e) => {
    console.log("📡 Z2U Batch Action Signal Received...");
    try {
        chrome.runtime.sendMessage({
            action: "Z2U_BATCH_ACTION",
            actionType: e.detail.actionType,
            id: e.detail.id,
            url: e.detail.url,
            adminPass: e.detail.pass
        }, (res) => {
            if (chrome.runtime.lastError && chrome.runtime.lastError.message.includes("invalidated")) alert("Extension Updated! Please REFRESH.");
        });
    } catch (err) { }
});


window.addEventListener('OFFICIALUM1_REMOTE_BUMP', (e) => {
    console.log("📡 Remote Bump Signal Received (Limit: " + e.detail.limit + ")...");
    try {
        chrome.runtime.sendMessage({ action: "REMOTE_BUMP", limit: e.detail.limit }, (res) => {
            if (chrome.runtime.lastError && chrome.runtime.lastError.message.includes("invalidated")) alert("Extension Updated! Please REFRESH.");
        });
    } catch (err) { }
});

window.addEventListener('OFFICIALUM1_SINGLE_BUMP', (e) => {
    console.log("📡 Single Bump Signal Received (Listing: " + e.detail.id + ")...");
    try {
        chrome.runtime.sendMessage({
            action: "REMOTE_BUMP",
            singleUrl: e.detail.url,
            id: e.detail.id
        }, (res) => {
            if (chrome.runtime.lastError && chrome.runtime.lastError.message.includes("invalidated")) alert("Extension Updated! Please REFRESH.");
        });
    } catch (err) { }
});

window.addEventListener('OFFICIALUM1_POST_THREAD', (e) => {
    console.log("📡 Quick Post Signal Received: " + e.detail.title);
    try {
        // First PING to check if alive
        chrome.runtime.sendMessage({ action: "PING" }, (resp) => {
            if (chrome.runtime.lastError) {
                alert("Extension Updated or Offline. Please REFRESH the page.");
                return;
            }

            // Proceed with POST
            chrome.runtime.sendMessage({
                action: "POST_THREAD",
                data: e.detail
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Post Error:", chrome.runtime.lastError.message);
                } else {
                    console.log("✅ Post Action Response:", response);
                    if (response && response.success) {
                        // Notify Frontend
                        window.dispatchEvent(new CustomEvent('OFFICIALUM1_POST_SUCCESS', { detail: response }));
                    }
                }
            });
        });
    } catch (err) {
        console.error("Bridge failure:", err);
    }
});

window.addEventListener('OFFICIALUM1_AUTH_UPDATE', (e) => {
    console.log("📡 Auth Update Signal Received...");
    if (e.detail.pass) {
        try {
            chrome.storage.local.set({ admin_pass: e.detail.pass }, () => {
                if (chrome.runtime.lastError) {
                    console.warn("Storage sync failed:", chrome.runtime.lastError.message);
                } else {
                    console.log("✅ Admin Password Synced to Extension");
                }
            });
        } catch (err) {
            console.error("Auth Sync Error:", err);
        }
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
        if (msg.error) {
            alert(`Z2U Sync Failed: ${msg.error}`);
        } else if (msg.count === 0) {
            alert("Z2U Sync: 0 listings found.\n\nNOTE: If you see the Category view (boxes), please click on a category (e.g. 'Reddit Accounts') first until you can see the individual IDs (#), then run Sync again.");
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
    if (msg.action === "G2G_LOG") {
        console.log(`[G2G BACKEND]: ${msg.message}`);
    }
    if (msg.action === "G2G_RESULT") {
        console.log(`[G2G FINAL]: Sync complete.`);
        alert("G2G Sync Process Completed!");
    }
});
