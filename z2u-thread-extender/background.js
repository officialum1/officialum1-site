/**
 * Z2U Automation - Background Service Worker
 * Batch Sort only: opens 1x1 popup to run Batch Sort, then closes.
 */

let workerWindowId = null;
const TARGET_URL = 'https://www.z2u.com/sell/manageList?service=5&game=15132';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'CLOSE_WORKER_WINDOW' && sender.tab && sender.tab.windowId) {
        const winId = sender.tab.windowId;

        workerWindowId = null;

        chrome.windows.remove(winId, () => {
            if (chrome.runtime.lastError) console.log('[Z2U Background] Window already closed or not found.');

            chrome.storage.local.get(['satelliteMode'], (d) => {
                if (d.satelliteMode) {
                    setTimeout(openWorkerPopup, 5000);
                }
            });
        });
    }
});

/**
 * Open 1x1 popup to run Batch Sort only.
 */
function openWorkerPopup() {
    chrome.storage.local.get(['satelliteMode'], (data) => {
        if (!data.satelliteMode) return;
        if (workerWindowId) return;

        const workerUrl = `${TARGET_URL}${TARGET_URL.includes('?') ? '&' : '?'}worker=1`;

        console.log('[Z2U Background] Starting Batch Sort worker');

        chrome.windows.create({
            url: workerUrl,
            type: 'popup',
            width: 1,
            height: 1,
            focused: false
        }, (win) => {
            if (chrome.runtime.lastError || !win) {
                workerWindowId = null;
                return;
            }
            workerWindowId = win.id;

            const currentWinId = win.id;
            setTimeout(() => {
                if (workerWindowId === currentWinId) {
                    chrome.windows.remove(currentWinId, () => {
                        workerWindowId = null;
                        console.log('[Z2U Background] Worker timeout. Retrying...');
                    });
                }
            }, 45000);
        });
    });
}

setInterval(async () => {
    try {
        const data = await chrome.storage.local.get(['satelliteMode']);
        if (!data.satelliteMode) return;

        if (workerWindowId === null) {
            openWorkerPopup();
        }
    } catch (e) {
        console.error('[Z2U Background] Heartbeat Error:', e);
    }
}, 15000);
