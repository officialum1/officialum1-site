"use client";
import { useState, useEffect } from 'react';
import { modernAlert, modernConfirm } from '@/components/ModernUIOverlay';
import { getPlatformIcon } from '@/lib/icons';

interface Listing {
    id: string;
    title: string;
    url: string;
    platform: string;
    lastBumped: string | null;
    lastBumpStatus?: 'pending' | 'success' | 'failed' | 'limit_reached';
    createdAt: string;
    dailyBumpCount: number;
    lastResetDate: string | null;
    limitReached: boolean;

    status: string;
    frequency: string;
    username: string;
    autoBump: boolean;
}


export default function PlayerUpTab() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAutoFetch, setShowAutoFetch] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const [cookieStatus, setCookieStatus] = useState<'connected' | 'disconnected'>('disconnected');
    const [showManualImport, setShowManualImport] = useState(false);
    const [isPaused, setIsPaused] = useState(false);


    useEffect(() => {
        fetchListings();
        checkCookieStatus();
    }, []);


    const checkCookieStatus = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const settings = await res.json();
            if (settings['session_cookies_playerup_com'] && settings['session_cookies_playerup_com'].length > 20) {
                setCookieStatus('connected');
            }

            // 🔥 LAZY CRON TRIGGER
            // Every time the admin opens this tab, we hit the cron endpoint 
            // to ensure background tasks are running.
            fetch(`/api/cron/playerup?key=${settings['admin_password'] || ''}`).catch(() => { });

        } catch (e) { console.error("Cookie check failed", e); }
    };

    const fetchListings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/playerup');
            const data = await res.json();
            if (data && data.listings) {
                setListings(data.listings.map((l: any) => ({ ...l, autoBump: l.autoBump === 1 || l.autoBump === true })));
                setIsPaused(data.isPaused === true);
            } else if (Array.isArray(data)) {
                setListings(data.map((l: any) => ({ ...l, autoBump: l.autoBump === 1 || l.autoBump === true })));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // ... (rest of functions)

    const handleUpdate = async (listing: Listing, updates: Partial<Listing>) => {
        const updated = { ...listing, ...updates };
        try {
            await fetch('/api/admin/playerup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update', ...updated })
            });
            setListings(prev => prev.map(l => l.id === listing.id ? updated : l));
        } catch (e) {
            modernAlert("Update Failed");
        }
    };

    const [importUrl, setImportUrl] = useState('');

    const handleImportSingle = async () => {
        if (!importUrl.includes('playerup.com/threads')) {
            modernAlert("Invalid URL", "Please enter a valid PlayerUp thread URL.", "error");
            return;
        }
        setLoading(true);
        try {
            // Trigger extension to scrape this specific URL
            window.dispatchEvent(new CustomEvent('OFFICIALUM1_REMOTE_SYNC', { detail: { url: importUrl } }));
            modernAlert("Importing...", "The extension is scanning this thread. Please wait...", "success");
            setImportUrl('');
        } catch (e) {
            modernAlert("Import Failed", String(e), "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCloudSync = async () => {
        window.dispatchEvent(new CustomEvent('OFFICIALUM1_REMOTE_SYNC'));
        modernAlert("Cloud Sync Initiated", "The extension is now scanning PlayerUp in the background. Please wait for the success alert.", "success");

        // Polling to update UI as items come in
        let count = 0;
        const interval = setInterval(() => {
            fetchListings();
            count++;
            if (count > 6) clearInterval(interval);
        }, 10000);
    };


    const handleCloudBump = async () => {
        if (isPaused) {
            modernAlert("System Paused", "You cannot bump while the system is STOPPED. Please click 'Start Bumping' first.", "error");
            return;
        }
        const countStr = prompt("Bump limit? (0 for ALL)", "10");
        if (countStr === null) return;
        const limit = parseInt(countStr) || 0;
        window.dispatchEvent(new CustomEvent('OFFICIALUM1_REMOTE_BUMP', { detail: { limit } }));
        modernAlert("Active Bump", `Bumping ${limit || 'all'} threads... 🛰️🔥`, "success");
        try {
            const res = await fetch('/api/admin/playerup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cloud_bump_all', limit }) });
            if ((await res.json()).success) { modernAlert("Complete!", "Threads bumped! 🔥", "success"); fetchListings(); }
        } catch (e) { }
    };

    const handleDelete = async (id: string) => {
        if (!(await modernConfirm("Delete this listing?"))) return;
        try {
            await fetch('/api/admin/playerup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id }) });
            fetchListings();
        } catch (e) { modernAlert("Failed to delete"); }
    };

    const [bumpingIds, setBumpingIds] = useState<Set<string>>(new Set());

    const handleTogglePause = async () => {
        const actionText = isPaused ? "Resume" : "Stop";
        if (!(await modernConfirm(`${actionText} all bumping? This affects both the server and extension.`))) return;

        try {
            const res = await fetch('/api/admin/playerup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle_pause', pause: !isPaused })
            });
            const data = await res.json();
            if (data.success) {
                setIsPaused(!isPaused);
                modernAlert(isPaused ? "Bumping Resumed!" : "Bumping Stopped!", `The system will now ${isPaused ? 'resume' : 'pause'} all sequences.`, "success");
            }
        } catch (e) {
            modernAlert("Failed to toggle status");
        }
    };

    const handleManualBump = async (listing: Listing) => {
        if (isPaused) {
            modernAlert("System Paused", "You cannot bump while the system is STOPPED. Please click 'Start Bumping' first.", "error");
            return;
        }
        setBumpingIds(prev => new Set(prev).add(listing.id));
        window.dispatchEvent(new CustomEvent('OFFICIALUM1_SINGLE_BUMP', {
            detail: { url: listing.url, id: listing.id }
        }));
        modernAlert("Bump Queued", "Bumping listing in the background... 🚀", "success");

        // Refresh UI after a short delay for the extension to work
        setTimeout(() => {
            setBumpingIds(prev => {
                const next = new Set(prev);
                next.delete(listing.id);
                return next;
            });
            fetchListings();
        }, 4000);
    };



    const getTurboScript = () => `
(async () => {
    console.clear();
    let baseUrl = window.location.href.split('?')[0].split('/page-')[0];
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
    let page = 1, total = 0;
    while(page <= 100) {
        const html = await (await fetch(page === 1 ? baseUrl : baseUrl + "/page-" + page)).text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        const links = [...doc.querySelectorAll('.structItem-title a, a[href*="/threads/"]')];
        const batch = Array.from(new Set(links.map(a => ({ title: a.innerText.trim(), url: a.href.split('?')[0] })))).filter(t => t.title && t.url.includes('/threads/'));
        if (batch.length === 0) break;
        await fetch("${window.location.origin}/api/admin/playerup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "turbo_sync", listings: batch }) });
        total += batch.length; page++;
        await new Promise(r => setTimeout(r, 1000));
    }
    alert("Sync Finished! Total: " + total);
})();`.trim();

    const [searchQuery, setSearchQuery] = useState('');

    const filtered = listings.filter(l => {
        const matchesFilter = activeFilter === 'All' || l.platform === activeFilter;
        const matchesSearch = !searchQuery ||
            l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.username.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const frequencies = ['Every 5 seconds', 'Every 15 seconds', 'Every 30 seconds', 'Every 1 minute', 'Every 2 minutes', 'Every 5 minutes', 'Every 10 minutes', 'Every 30 minutes', 'Every 1 hour', 'Every 2 hours', 'Every 6 hours', 'Every 12 hours', 'Every 24 hours'];

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // LOGGING SYSTEM
    const [logs, setLogs] = useState<{ date: string, details: string, action: string }[]>([]);

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/admin/playerup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'get_logs' })
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.logs)) {
                setLogs(data.logs);
            }
        } catch (e) { console.error("Log fetch error", e); }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, []);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Reset page when filter or search changes
    useEffect(() => { setCurrentPage(1); }, [activeFilter, searchQuery]);

    const countStart = (currentPage - 1) * itemsPerPage + 1;
    const countEnd = Math.min(currentPage * itemsPerPage, filtered.length);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const paginatedListings = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSelectAll = () => {
        const pageIds = paginatedListings.map(l => l.id);
        const allSelected = pageIds.every(id => selectedIds.has(id));

        setSelectedIds(prev => {
            const next = new Set(prev);
            if (allSelected) {
                pageIds.forEach(id => next.delete(id));
            } else {
                pageIds.forEach(id => next.add(id));
            }
            return next;
        });
    };

    const isPageSelected = paginatedListings.length > 0 && paginatedListings.every(l => selectedIds.has(l.id));

    const handleBulkAction = async (action: string, value?: string) => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;

        setLoading(true);
        try {
            await fetch('/api/admin/playerup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bulk', ids, subAction: action, value })
            });
            await fetchListings();
            setSelectedIds(new Set());
            modernAlert("Bulk Action Success", `Applied ${action} to ${ids.length} threads.`, "success");
        } catch (e) {
            modernAlert("Bulk Action Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="FadeIn p-4">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        🚀 PlayerUp Command Center
                        <span className="text-xs bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20 uppercase tracking-widest">{listings.length} THREADS</span>
                        {cookieStatus === 'connected' ? (
                            <span className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Cookies Connected
                            </span>
                        ) : (
                            <span className="text-xs bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                Cookies Disconnected
                            </span>
                        )}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Automated listing management & scheduled bumping engine.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleCloudSync} className="bg-white/5 text-white border border-white/10 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2">
                        <span>☁️</span> Cloud Sync
                    </button>
                    <button
                        onClick={handleTogglePause}
                        className={`${isPaused ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'} text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl transition-all flex items-center gap-2`}
                    >
                        {isPaused ? '▶️ Start Bumping' : '🛑 Stop Bumping'}
                    </button>
                    <button onClick={handleCloudBump} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-orange-600/20 transition-all">
                        🔥 Bump All
                    </button>
                    <button onClick={() => {
                        const script = getTurboScript();
                        navigator.clipboard.writeText(script);
                        modernAlert("Turbo Script Copied!", "1. Go to PlayerUp My Threads\n2. Open Console (F12)\n3. Paste & Enter manually.", "success");
                    }} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-purple-600/20 transition-all">
                        ⚡ Turbo Script
                    </button>
                    <button onClick={() => setShowManualImport(!showManualImport)} className="bg-emerald-600/10 text-emerald-400 border border-emerald-600/30 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-600 hover:text-white transition-all">
                        📋 Manual Import
                    </button>
                </div>
            </div>


            {/* FILTER & SEARCH BAR */}
            <div className="flex flex-wrap items-center gap-4 mb-8 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="flex-1 min-w-[300px] relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                    <input
                        type="text"
                        placeholder="Search threads, IDs or accounts..."
                        className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-cyan-500/50 outline-none transition-all placeholder:text-gray-600"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                    {['All', ...Array.from(new Set(listings.map(l => l.platform)))].map(platform => (
                        <button
                            key={platform}
                            onClick={() => setActiveFilter(platform)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${activeFilter === platform
                                ? 'bg-cyan-500 text-black border-cyan-400 shadow-lg shadow-cyan-500/20'
                                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {platform !== 'All' && (
                                <img src={getPlatformIcon(platform)} className="w-4 h-4 object-contain" alt="" />
                            )}
                            {platform}
                        </button>
                    ))}
                </div>
            </div>

            {showManualImport && (
                <div className="mb-8 bg-gray-900/50 border border-emerald-500/20 p-6 rounded-2xl animate-fade-in-down">
                    <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                        <span className="text-xl">📥</span> Import Single Thread
                    </h3>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="https://www.playerup.com/threads/..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 outline-none transition-all"
                            value={importUrl}
                            onChange={(e) => setImportUrl(e.target.value)}
                        />
                        <button
                            onClick={handleImportSingle}
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Scanning...' : 'Import Now'}
                        </button>
                    </div>
                    <p className="text-gray-500 text-xs mt-2 pl-2">
                        * Supports standard thread URLs. The item will be scraped and added to your database automatically.
                    </p>
                </div>
            )}

            {/* ANALYTICS QUICK-VIEW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Bumps (24h)', value: logs.filter(l => new Date().getTime() - new Date(l.date).getTime() < 86400000).length, icon: '🔥', color: 'text-orange-400' },
                    {
                        label: 'Success Rate',
                        value: (() => {
                            const last24 = logs.filter(l => new Date().getTime() - new Date(l.date).getTime() < 86400000);
                            const success = last24.filter(l => l.details.includes('Successfully')).length;
                            return last24.length > 0 ? Math.round((success / last24.length) * 100) + '%' : '0%';
                        })(),
                        icon: '📈', color: 'text-emerald-400'
                    },
                    { label: 'Limit Hits', value: logs.filter(l => l.details.includes('limit reached') || l.details.includes('Skipped')).length, icon: '🛑', color: 'text-red-400' },
                    { label: 'Auto-Cloud', value: 'Active (Lazy)', icon: '🤖', color: 'text-cyan-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</span>
                            <span className="text-xl group-hover:scale-120 transition-transform">{stat.icon}</span>
                        </div>
                        <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* LIVE CONSOLE LOGS */}
            <div className="mb-8 glass-heavy rounded-xl border border-white/10 overflow-hidden flex flex-col shadow-2xl">
                <div className="bg-black/50 px-4 py-2 border-b border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">⚡ Real-Time Bump Logs</span>
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50 animate-pulse"></div>
                    </div>
                </div>
                <div className="h-48 overflow-y-auto p-4 font-mono text-xs space-y-1 custom-scrollbar bg-black/80">
                    {logs.length === 0 ? (
                        <div className="text-gray-600 italic">Waiting for bump activity...</div>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className="flex gap-3">
                                <span className="text-gray-500">[{new Date(log.date).toLocaleTimeString()}]</span>
                                <span className={log.details.includes('Success') ? 'text-green-400' : 'text-red-400'}>
                                    {log.details}
                                </span >
                            </div>
                        ))
                    )}
                </div>
            </div>

            {selectedIds.size > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 glass-heavy border border-white/20 px-10 py-6 rounded-[32px] shadow-[0_30px_100px_rgba(0,0,0,0.8)] z-[100] flex items-center gap-10 animate-in slide-in-from-bottom-12 duration-500">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">Bulk Selection</span>
                        <span className="text-2xl font-black text-white">{selectedIds.size} <span className="text-xs text-gray-400 font-medium">THREADS</span></span>
                    </div>

                    <div className="h-12 w-px bg-white/10"></div>

                    <div className="flex gap-4">
                        <button onClick={() => handleBulkAction('status', 'Active')} className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95">Mark Selling</button>
                        <button onClick={() => handleBulkAction('status', 'Inactive')} className="bg-white/5 text-white border border-white/10 hover:bg-white/10 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95">Mark Sold</button>
                        <button onClick={() => handleBulkAction('autoBump', '1')} className="bg-purple-500 hover:bg-purple-400 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-500/20 active:scale-95">Bump ON</button>
                        <button onClick={() => handleBulkAction('autoBump', '0')} className="bg-white/5 text-white border border-white/10 hover:bg-white/10 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95">Bump OFF</button>

                        <div className="relative group">
                            <button className="bg-white/5 text-white border border-white/10 hover:bg-white/10 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2">
                                Frequency ▾
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 glass-heavy border border-white/10 rounded-3xl shadow-3xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all py-3 max-h-72 overflow-y-auto custom-scrollbar">
                                {frequencies.map(f => (
                                    <button
                                        key={f}
                                        onClick={() => handleBulkAction('frequency', f)}
                                        className="w-full text-left px-5 py-3 text-xs text-gray-400 hover:bg-white/5 hover:text-white font-bold transition-all"
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={() => handleBulkAction('delete')} className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95">Delete</button>
                    </div>

                    <div className="h-12 w-px bg-white/10"></div>

                    <button onClick={() => setSelectedIds(new Set())} className="text-xs text-gray-500 hover:text-white font-black uppercase tracking-widest transition-all">Cancel</button>
                </div>
            )}

            {showManualImport && (
                <div className="mb-8 glass p-6 rounded-2xl border border-emerald-500/30 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">📋 Manual Thread Importer</h3>
                    <p className="text-sm text-gray-400 mb-4">Paste your Page HTML Source. We will ONLY import threads that have a <b>Bump Button</b> (".../up"). This filters out junk links.</p>
                    <textarea
                        className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-300 focus:border-emerald-500/50 outline-none resize-y"
                        placeholder='Paste HTML Source Code here...'
                        id="manual-import-area"
                    ></textarea>
                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => setShowManualImport(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                        <button onClick={() => {
                            const input = (document.getElementById('manual-import-area') as HTMLTextAreaElement).value;
                            if (!input) return;

                            // STRICT Parsing Logic: Only find /up links
                            const threads: { title: string, url: string }[] = [];
                            const playerupDomain = "https://www.playerup.com";

                            // Strategy: Find hrefs ending in /up (or containing /up")
                            // Example: href="threads/slug.123/up"
                            const upLinkRegex = /href=["'](threads\/[^"']+\/up)["']|href=["'](\/threads\/[^"']+\/up)["']/gi;

                            let match;
                            while ((match = upLinkRegex.exec(input)) !== null) {
                                let rawUrl = match[1] || match[2];
                                // transform "threads/slug.123/up" -> "https://www.playerup.com/threads/slug.123/"
                                let cleanUrl = rawUrl.replace(/\/up$/, '');
                                if (cleanUrl.startsWith('/')) cleanUrl = playerupDomain + cleanUrl;
                                else cleanUrl = playerupDomain + "/" + cleanUrl;

                                // Extract pseudo-title from slug
                                // url: .../threads/my-cool-thread.123
                                const slug = cleanUrl.split('/threads/')[1]?.split('.')[0] || "Imported Thread";
                                const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Capitalize

                                threads.push({ title, url: cleanUrl });
                            }

                            // Deduplicate
                            const unique = Array.from(new Set(threads.map(t => t.url))).map(url => threads.find(t => t.url === url)!);

                            if (unique.length > 0) {
                                fetch('/api/admin/playerup', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ action: 'turbo_sync', listings: unique })
                                }).then(() => {
                                    modernAlert("Import Successful", `Processed ${unique.length} threads.`, "success");
                                    setShowManualImport(false);
                                    fetchListings();
                                });
                            } else {
                                modernAlert("No Threads Found", "Could not find any 'Bump' links. Ensure you are copying the full page source where the 'Bump' buttons are visible.", "error");
                            }

                        }} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20">Process & Import</button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto glass rounded-3xl border border-white/5 shadow-2xl overflow-hidden min-h-[600px]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-[11px] uppercase tracking-[0.2em] text-gray-400 font-black">
                            <th className="px-6 py-5 w-10">
                                <input type="checkbox"
                                    checked={isPageSelected}
                                    onChange={handleSelectAll}
                                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                                />
                            </th>
                            <th className="px-6 py-5">Status</th>
                            <th className="px-6 py-5">Auto Bump</th>
                            <th className="px-6 py-5">Account</th>
                            <th className="px-6 py-5">Thread / Title</th>
                            <th className="px-6 py-5 text-center">Type</th>
                            <th className="px-6 py-5">Frequency</th>
                            <th className="px-6 py-5 text-center">Daily (4 Max)</th>
                            <th className="px-6 py-5 text-center">Last Bump</th>
                            <th className="px-6 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {loading && listings.length === 0 ? (
                            <tr><td colSpan={9} className="text-center py-20 text-gray-500 animate-pulse">Syncing with encrypted database...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={9} className="text-center py-20 text-gray-500">No listings found. Synchronize to begin.</td></tr>
                        ) : paginatedListings.map(l => (
                            <tr key={l.id} className={`hover:bg-white/[0.02] transition-colors ${selectedIds.has(l.id) ? 'bg-blue-500/5' : ''}`}>
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(l.id)}
                                        onChange={() => setSelectedIds(prev => {
                                            const next = new Set(prev);
                                            if (next.has(l.id)) next.delete(l.id);
                                            else next.add(l.id);
                                            return next;
                                        })}
                                        className="accent-emerald-500 w-4 h-4 cursor-pointer"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleUpdate(l, { status: l.status === 'Active' ? 'Inactive' : 'Active' })}
                                        className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase border tracking-tighter transition-all ${l.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
                                    >
                                        {l.status === 'Active' ? 'SELLING' : 'SOLD'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div
                                        onClick={() => handleUpdate(l, { autoBump: !l.autoBump })}
                                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors mx-auto ${l.autoBump ? 'bg-emerald-500' : 'bg-white/10'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${l.autoBump ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => { const u = prompt("Enter PlayerUp Username", l.username); if (u) handleUpdate(l, { username: u }); }}
                                        className="flex items-center gap-2 bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-all font-medium text-xs"
                                    >
                                        <span className="opacity-50">👤</span> {l.username}
                                    </button>
                                </td>
                                <td className="px-6 py-4 max-w-[300px]">
                                    <a href={l.url} target="_blank" className="text-blue-400 hover:text-blue-300 font-semibold truncate block transition-colors">{l.title}</a>
                                    <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-tight font-black opacity-30">{l.url.split('/').pop()}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <img src={getPlatformIcon(l.platform)} className="w-6 h-6 inline-block opacity-80" alt="" />
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        value={l.frequency}
                                        onChange={(e) => handleUpdate(l, { frequency: e.target.value })}
                                        className="bg-zinc-900 text-xs text-gray-300 border border-zinc-700 rounded-lg px-2 py-1.5 outline-none hover:border-zinc-500 transition-all cursor-pointer"
                                    >
                                        {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map(num => (
                                                <div
                                                    key={num}
                                                    className={`w-2.5 h-2.5 rounded-full border ${(l.dailyBumpCount >= num)
                                                        ? 'bg-orange-500 border-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.4)]'
                                                        : 'bg-white/5 border-white/10'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className={`text-[10px] font-black tracking-widest ${l.limitReached ? 'text-orange-400' : 'text-gray-500'}`}>
                                            {l.dailyBumpCount || 0} / 4
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                    <div className={`text-xs font-mono font-bold ${l.lastBumpStatus === 'failed' ? 'text-red-400' : (l.lastBumpStatus === 'limit_reached' ? 'text-orange-400' : 'text-emerald-400')}`}>
                                        {l.lastBumped ? new Date(l.lastBumped).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '[Off]'}
                                    </div>
                                    <div className="text-[10px] text-gray-500 mt-1 uppercase font-bold flex items-center justify-center gap-1.5">
                                        {l.lastBumpStatus === 'failed' ? (
                                            <span className="text-red-500/80">❌ FAILED</span>
                                        ) : l.lastBumpStatus === 'limit_reached' ? (
                                            <span className="text-orange-500/80">⚠️ LIMIT HIT</span>
                                        ) : (l.lastBumpStatus === 'success' || l.lastBumped) ? (
                                            <span className="text-emerald-500/80">✅ SUCCESS</span>
                                        ) : (
                                            <span>PENDING</span>
                                        )}
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-right">
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => handleDelete(l.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 transition-all">🗑️</button>
                                        <button
                                            onClick={() => handleManualBump(l)}
                                            disabled={bumpingIds.has(l.id)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${bumpingIds.has(l.id) ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)] text-white animate-pulse' : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-black'}`}
                                        >
                                            {bumpingIds.has(l.id) ? '🔥' : '▶️'}
                                        </button>

                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {filtered.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-6 px-2">
                    <div className="text-xs text-gray-500 font-mono">
                        Showing {countStart}-{countEnd} of {filtered.length} threads
                    </div>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:hover:bg-white/5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                        >
                            PREV
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let p = i + 1;
                                if (totalPages > 5 && currentPage > 3) {
                                    p = currentPage - 2 + i;
                                    if (p > totalPages) p = totalPages - (4 - i);
                                    if (p < 1) p = i + 1;
                                }
                                if (p > totalPages) return null;

                                return (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === p ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className="bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:hover:bg-white/5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                        >
                            NEXT
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
