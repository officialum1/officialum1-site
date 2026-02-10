
document.addEventListener('DOMContentLoaded', async () => {
    const syncBtn = document.getElementById('sync-btn');
    const openDash = document.getElementById('open-dash');
    const siteLabel = document.getElementById('active-site');
    const logDiv = document.getElementById('log');

    // Get current tab info
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab && tab.url) {
        if (tab.url.includes('playerup.com')) {
            siteLabel.innerText = "PlayerUp Profile / Forum";
            syncBtn.disabled = false;
        } else if (tab.url.includes('g2g.com')) {
            siteLabel.innerText = "G2G Store Detected";
            syncBtn.disabled = false;
        } else if (tab.url.includes('z2u.com')) {
            siteLabel.innerText = "Z2U Marketplace Detected";
            syncBtn.disabled = false;
        } else {
            siteLabel.innerText = "Incompatible Site";
            siteLabel.style.color = "#ff4444";
        }
    }

    syncBtn.addEventListener('click', async () => {
        syncBtn.innerText = "⏳ SYNCING...";
        syncBtn.disabled = true;
        logDiv.style.display = 'block';
        logDiv.innerHTML = `<div>> Initializing Bridge...</div>`;

        // Attempt to "wake up" the content script
        try {
            await chrome.tabs.sendMessage(tab.id, { action: "PING" });
            startSync();
        } catch (e) {
            // If ping fails, force-inject the script and try again
            logDiv.innerHTML += `<div>> Waking up sync engine...</div>`;
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            }, () => {
                setTimeout(startSync, 500);
            });
        }
    });

    function startSync() {
        chrome.tabs.sendMessage(tab.id, { action: "START_SYNC" }, (response) => {
            if (chrome.runtime.lastError) {
                logDiv.innerHTML += `<div style="color:#ff6666">Error: Still sleeping! Please refresh F5.</div>`;
                syncBtn.innerText = "START SYNC";
                syncBtn.disabled = false;
            }
        });
    }

    // Listen for progress from content script
    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.action === "SYNC_PROGRESS") {
            logDiv.innerHTML += `<div>${msg.text}</div>`;
            logDiv.scrollTop = logDiv.scrollHeight;
        }
        if (msg.action === "SYNC_COMPLETE") {
            syncBtn.innerText = "✅ DONE!";
            logDiv.innerHTML += `<div style="color:#00ff88">> ${msg.count} threads synced!</div>`;
            setTimeout(() => {
                syncBtn.innerText = "START TURBO SYNC";
                syncBtn.disabled = false;
            }, 3000);
        }
    });

    openDash.addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://officialum1.com/admin' });
    });
});
