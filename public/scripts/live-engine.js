/**
 * OfficialUM1 Live Data Engine
 * This script allows any page to fetch real-time database stats
 * without slowing down the initial page load.
 */

window.OfficialUM1_LiveStats = {
    data: null,
    listeners: [],

    async init() {
        // Load from cache for "Instant Alive" feel
        const cached = localStorage.getItem('officialum1_live_cache');
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                this.data = parsed.stats;
                this.feed = parsed.feed;
                this.notify();
            } catch (e) { }
        }

        await this.sync();
        // 2 Second Heartbeat for Ultra-Live Feed
        setInterval(() => this.sync(), 2000);
    },

    async sync() {
        try {
            const res = await fetch('/api/stats/live');
            const result = await res.json();

            // Handle nested stats structure
            this.data = result.stats || result;
            this.feed = result.feed || {};

            // Save to cache
            localStorage.setItem('officialum1_live_cache', JSON.stringify({
                stats: this.data,
                feed: this.feed,
                updated: Date.now()
            }));

            this.notify();
        } catch (e) {
            console.error("LiveEngine Pulse Error:", e);
        }
    },

    onChange(callback) {
        this.listeners.push(callback);
        if (this.data) callback({ stats: this.data, feed: this.feed });
    },

    notify() {
        this.listeners.forEach(cb => cb({ stats: this.data, feed: this.feed }));
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
            const isShort = el.getAttribute('data-live-short') === 'true';

            if (this.data[metric] !== undefined) {
                let val = this.data[metric];
                let displayVal = "";

                if (isShort && val >= 1000) {
                    displayVal = (val / 1000).toFixed(1) + "k";
                } else {
                    displayVal = (decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toLocaleString());
                }

                const finalStr = prefix + displayVal + suffix;
                if (el.innerText !== finalStr) {
                    el.innerText = finalStr;
                }
            }
        });
    }
};

// Start the engine
document.addEventListener('DOMContentLoaded', () => {
    window.OfficialUM1_LiveStats.init();
});
