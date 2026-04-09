/**
 * Z2U Automation Tool
 * Batch Sort only: automatically performs "Batch Sort" on manage list page.
 */

const CONFIG = {
    selectors: {
        selectAllLabel: 'label[for="inlineCheckbox3"], label.form-check-label[for="inlineCheckbox3"]',
        batchSortBtn: 'button.zu-btn-outline-success[onclick*="sort()"]'
    },
    autoSort: true,
    sortInterval: 30000,
    apiEndpoint: 'https://officialum1.com/api/admin/z2u'
};

/**
 * Real user-like click: dispatches mouseover, mousedown, mouseup, click.
 */
function realClick(el) {
    if (!el || !el.offsetParent) return;
    try {
        el.scrollIntoView({ behavior: 'auto', block: 'center' });
        ['mouseover', 'mousedown', 'mouseup', 'click'].forEach(eventType => {
            el.dispatchEvent(new MouseEvent(eventType, {
                view: window,
                bubbles: true,
                cancelable: true,
                buttons: 1,
                button: 0,
                clientX: el.getBoundingClientRect().left + el.offsetWidth / 2,
                clientY: el.getBoundingClientRect().top + el.offsetHeight / 2
            }));
        });
    } catch (e) {
        el.click();
    }
}

/**
 * Log action to storage and sync to Admin Panel
 */
async function addLog(message, type = 'info') {
    chrome.storage.local.get(['bumpLogs', 'adminPass'], (data) => {
        const logs = data.bumpLogs || [];
        logs.unshift({
            timestamp: new Date().toLocaleString(),
            message: message,
            type: type
        });
        const trimmedLogs = logs.slice(0, 100);
        chrome.storage.local.set({ bumpLogs: trimmedLogs });

        if (data.adminPass) {
            syncLogToAdmin(message, type, data.adminPass);
        }
    });

    if (type === 'process' || type === 'success') {
        showBumpStatus(message, type === 'success' ? 3000 : 0);
    }
}

let bumpBox = null;
function showBumpStatus(message, duration = 0) {
    if (bumpBox) bumpBox.remove();

    bumpBox = document.createElement('div');
    bumpBox.className = 'z2u-bump-overlay';
    bumpBox.innerHTML = `
        <div class="pulse"></div>
        <div class="text">${message}</div>
    `;
    document.body.appendChild(bumpBox);

    if (duration > 0) {
        setTimeout(() => {
            if (bumpBox) {
                bumpBox.style.opacity = '0';
                bumpBox.style.transform = 'translateX(50px)';
                bumpBox.style.transition = '0.5s';
                setTimeout(() => bumpBox.remove(), 500);
            }
        }, duration);
    }
}

async function syncLogToAdmin(message, type, pass) {
    try {
        await fetch(CONFIG.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': pass
            },
            body: JSON.stringify({
                action: 'log_bump',
                message: message,
                type: type
            })
        });
    } catch (e) {
        console.error('[Z2U Tool] Failed to sync log to Admin Panel:', e);
    }
}

/**
 * Handle Auto Batch Sort for Z2U listings (every 30s on manage list page)
 */
async function handleAutoSort() {
    if (!CONFIG.autoSort || !window.location.href.includes('sell/manageList')) {
        return;
    }

    console.log('[Z2U Tool] Auto-Sort Logic Initialized');

    chrome.storage.local.get(['lastSortTime'], (data) => {
        const now = Date.now();
        const lastRun = data.lastSortTime || 0;
        const timeSinceLast = now - lastRun;

        if (timeSinceLast >= CONFIG.sortInterval) {
            console.log('[Z2U Tool] 30s has passed, initiating sort now.');
            performSort();
        } else {
            const waitTime = CONFIG.sortInterval - timeSinceLast;
            console.log(`[Z2U Tool] Waiting ${Math.round(waitTime / 1000)}s for next sort cycle...`);
            setTimeout(performSort, waitTime);
        }
    });
}

function performSort() {
    const selectAll = document.querySelector(CONFIG.selectors.selectAllLabel);
    const sortBtn = document.querySelector(CONFIG.selectors.batchSortBtn);

    if (selectAll && sortBtn) {
        console.log('[Z2U Tool] Selecting All and Batch Sorting...');
        addLog('Initiating Batch Sort (Bump)...', 'process');

        realClick(selectAll);

        setTimeout(() => {
            chrome.storage.local.set({ lastSortTime: Date.now() }, () => {
                realClick(sortBtn);
                addLog('Successfully clicked Batch Sort. Closing worker window...', 'success');
                console.log('[Z2U Tool] Sort button clicked. Signalling closure.');

                chrome.runtime.sendMessage({ action: 'CLOSE_WORKER_WINDOW' });
            });
        }, 1500);
    } else {
        console.warn('[Z2U Tool] Required sort elements not found. Retrying in 5s...');
        addLog('Waiting for items to load...', 'warning');
        setTimeout(performSort, 5000);
    }
}

/** Worker: do Batch Sort only */
function performBatchSortOnly() {
    const selectAll = document.querySelector(CONFIG.selectors.selectAllLabel);
    const sortBtn = document.querySelector(CONFIG.selectors.batchSortBtn);
    if (!selectAll || !sortBtn) {
        addLog('Batch Sort: waiting for page...', 'warning');
        setTimeout(performBatchSortOnly, 4000);
        return;
    }
    addLog('Step: Batch Sort', 'process');
    realClick(selectAll);
    setTimeout(() => {
        realClick(sortBtn);
        addLog('Batch Sort done.', 'success');
        chrome.runtime.sendMessage({ action: 'CLOSE_WORKER_WINDOW' });
    }, 1500);
}

function init() {
    console.log('%c [Z2U Tool] Active on Z2U.com (Batch Sort only) ', 'background: #da251c; color: #fff');

    const isWorker = window.location.href.includes('worker=1');
    const isManageList = window.location.href.includes('sell/manageList');

    if (isWorker && isManageList) {
        console.log('[Z2U Worker] Batch Sort only');
        setTimeout(performBatchSortOnly, 3500);
        return;
    }

    if (isManageList) {
        handleAutoSort();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
