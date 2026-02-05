/**
 * OfficialUM1 Live Data Engine
 * This script allows any page to fetch real-time database stats
 * without slowing down the initial page load.
 */

window.OfficialUM1_LiveStats = {
    data: null,
    listeners: [],

    async init() {
        await this.sync();
        // Constant background syncing every 15 seconds
        setInterval(() => this.sync(), 15000);
    },

    async sync() {
        try {
            const res = await fetch('/api/stats/live');
            this.data = await res.json();
            this.notify();
        } catch (e) {
            console.error("LiveEngine Sync Failed:", e);
        }
    },

    onChange(callback) {
        this.listeners.push(callback);
        if (this.data) callback(this.data);
    },

    notify() {
        this.listeners.forEach(cb => cb(this.data));
        this.autoInject();
    },

    // Automatically inject data into elements with data-live-metric attribute
    autoInject() {
        if (!this.data) return;
        document.querySelectorAll('[data-live-metric]').forEach(el => {
            const metric = el.getAttribute('data-live-metric');
            const decimals = parseInt(el.getAttribute('data-live-decimals') || '0');
            const suffix = el.getAttribute('data-live-suffix') || '';
            const prefix = el.getAttribute('data-live-prefix') || '';

            if (this.data[metric] !== undefined) {
                const val = this.data[metric];
                el.innerText = prefix + (decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toLocaleString()) + suffix;
            }
        });
    }
};

// Start the engine
document.addEventListener('DOMContentLoaded', () => {
    window.OfficialUM1_LiveStats.init();
});
