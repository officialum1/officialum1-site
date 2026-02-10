
document.addEventListener('DOMContentLoaded', async () => {
    const syncBtn = document.getElementById('sync-btn');
    const syncCookiesBtn = document.getElementById('sync-cookies-btn');
    const openDash = document.getElementById('open-dash');
    const siteLabel = document.getElementById('active-site');
    const logDiv = document.getElementById('log');
    const adminPassInput = document.getElementById('admin-pass');

    // Load saved password
    chrome.storage.local.get(['admin_pass'], (res) => {
        if (res.admin_pass) adminPassInput.value = res.admin_pass;
    });

    adminPassInput.addEventListener('change', () => {
        chrome.storage.local.set({ admin_pass: adminPassInput.value });
    });

    // ... (site detection remains same)

    syncCookiesBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const domain = new URL(tab.url).hostname;
        const adminPass = adminPassInput.value;

        logDiv.style.display = 'block';
        logDiv.innerHTML = `<div>> Syncing cookies for ${domain}...</div>`;

        chrome.runtime.sendMessage({
            action: "SYNC_COOKIES",
            url: tab.url,
            adminPass
        }, (response) => {
            if (response && response.success) {
                logDiv.innerHTML += `<div style="color:#ffaa00">> Session Saved on OfficialUM1!</div>`;
            } else {
                logDiv.innerHTML += `<div style="color:red">> Auth Failed or Network Error.</div>`;
            }
        });
    });

    // Get current tab info
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab && tab.url) {
        const url = tab.url.toLowerCase();
        if (url.includes('playerup.com')) {
            siteLabel.innerText = "PlayerUp Detected";
            syncBtn.disabled = false;
        } else if (url.includes('g2g.com')) {
            siteLabel.innerText = "G2G Detected";
            syncBtn.disabled = false;
        } else if (url.includes('z2u.com')) {
            siteLabel.innerText = "Z2U Detected";
            syncBtn.disabled = false;
        } else {
            siteLabel.innerText = "Not Supported";
        }
    }

    syncBtn.addEventListener('click', async () => {
        const adminPass = adminPassInput.value;
        if (!adminPass) {
            alert("Please enter your Admin Passphrase first!");
            return;
        }

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
        const adminPass = adminPassInput.value;
        chrome.tabs.sendMessage(tab.id, {
            action: "START_SYNC",
            adminPass
        }, (response) => {
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
