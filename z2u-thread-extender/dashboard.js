/**
 * Z2U Dashboard Logic
 * Displays logs of auto-sort/bump actions
 */

const logContainer = document.getElementById('logContainer');
const refreshBtn = document.getElementById('refreshBtn');
const clearBtn = document.getElementById('clearBtn');
const adminPassInput = document.getElementById('adminPass');
const savePassBtn = document.getElementById('savePassBtn');
const launchBtn = document.getElementById('launchWorker');

let satelliteMode = false;

function loadLogs() {
    // Load Logs
    chrome.storage.local.get(['bumpLogs', 'adminPass'], (data) => {
        if (data.adminPass) adminPassInput.value = data.adminPass;

        const logs = data.bumpLogs || [];

        if (logs.length === 0) {
            logContainer.innerHTML = '<div class="empty-log">No history found. The tool will log activity here once it runs on Z2U.</div>';
            return;
        }

        logContainer.innerHTML = '';
        logs.forEach(log => {
            const item = document.createElement('div');
            item.className = `log-item type-${log.type || 'info'}`;

            item.innerHTML = `
                <span class="log-time">[${log.timestamp}]</span>
                <span class="log-msg">${log.message}</span>
            `;

            logContainer.appendChild(item);
        });

        // Update Satellite Button UI
        satelliteMode = data.satelliteMode || false;
        if (satelliteMode) {
            launchBtn.textContent = '🛰️ Satellite Active (Running...)';
            launchBtn.style.background = '#4caf50';
        } else {
            launchBtn.textContent = '🚀 Launch Satellite (Batch Sort)';
            launchBtn.style.background = 'linear-gradient(to right, #da251c, #9b1d16)';
        }
    });
}

refreshBtn.addEventListener('click', () => {
    refreshBtn.disabled = true;
    refreshBtn.textContent = 'Updating...';
    loadLogs();
    setTimeout(() => {
        refreshBtn.disabled = false;
        refreshBtn.textContent = 'Refresh Logs';
    }, 500);
});

clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all log history?')) {
        chrome.storage.local.set({ bumpLogs: [] }, () => {
            loadLogs();
        });
    }
});

savePassBtn.addEventListener('click', () => {
    const pass = adminPassInput.value.trim();
    chrome.storage.local.set({ adminPass: pass }, () => {
        alert('Admin Password Saved! Logs will now sync to OfficialUM1 Panel.');
    });
});

launchBtn.addEventListener('click', () => {
    satelliteMode = !satelliteMode;
    chrome.storage.local.set({ satelliteMode: satelliteMode }, () => {
        loadLogs();
        if (satelliteMode) {
            alert('Satellite Mode Started! A small window will open automatically to run Batch Sort and close when done.');
        } else {
            alert('Satellite Mode Stopped.');
        }
    });
});

// Initial load
document.addEventListener('DOMContentLoaded', loadLogs);

// Poll for updates every 2 seconds while popup is open
setInterval(loadLogs, 2000);
