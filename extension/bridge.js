
// BRIDGE SCRIPT - Runs on OfficialUM1 Dashboard to link with the extension
console.log("🚀 OfficialUM1 Extension Bridge Active");

// Listen for clicks on the Cloud Sync / Bump buttons
document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    if (btn.innerText.includes('Cloud Master Sync')) {
        console.log("📡 Triggering Browser Master Sync...");
        chrome.runtime.sendMessage({ action: "REMOTE_SYNC" });
    }

    if (btn.innerText.includes('BUMP ALL LISTINGS')) {
        console.log("📡 Triggering Browser Master Bump...");
        chrome.runtime.sendMessage({ action: "REMOTE_BUMP" });
    }
});
