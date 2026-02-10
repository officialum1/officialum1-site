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
    lastBumpStatus?: 'pending' | 'success' | 'failed';
    createdAt: string;

    status: string;
    frequency: string;
    username: string;
}

export default function PlayerUpTab() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAutoFetch, setShowAutoFetch] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/playerup');
            const data = await res.json();
            if (Array.isArray(data)) setListings(data);
            else if (data && data.listings) setListings(data.listings);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

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

    const handleCloudSync = async () => {
        window.dispatchEvent(new CustomEvent('OFFICIALUM1_REMOTE_SYNC'));
        modernAlert("Sync Sweep Started", "Fetching latest threads... Wait 15s. 🛰️", "success");
        setTimeout(() => fetchListings(), 15000);
        try { await fetch('/api/admin/playerup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cloud_fetch' }) }); } catch (e) { }
    };

    const handleCloudBump = async () => {
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

    const handleManualBump = async (listing: Listing) => {
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
    while(page <= 50) {
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

    const filtered = activeFilter === 'All' ? listings : listings.filter(l => l.platform === activeFilter);
    const frequencies = ['Every 5 seconds', 'Every 15 seconds', 'Every 30 seconds', 'Every 1 minute', 'Every 5 minutes', 'Every 1 hour', 'Every 24 hours'];

    return (
        <div className="FadeIn p-4">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        🚀 PlayerUp Command Center
                        <span className="text-xs bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20 uppercase tracking-widest">{listings.length} THREADS</span>
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Automated listing management & scheduled bumping engine.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleCloudSync} className="bg-blue-600/10 text-blue-400 border border-blue-600/30 px-5 py-2 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all">☁️ Cloud Sync</button>
                    <button onClick={handleCloudBump} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 transition-all">🔥 Bump All</button>
                    <button onClick={() => { navigator.clipboard.writeText(getTurboScript()); modernAlert("Turbo Script Copied!", "Paste in PlayerUp Console.", "success"); }} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-all">⚡ Turbo Script</button>
                </div>
            </div>

            <div className="overflow-x-auto glass rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-[11px] uppercase tracking-[0.2em] text-gray-400 font-black">
                            <th className="px-6 py-5">Status</th>
                            <th className="px-6 py-5">Account</th>
                            <th className="px-6 py-5">Thread / Title</th>
                            <th className="px-6 py-5 text-center">Type</th>
                            <th className="px-6 py-5">Frequency</th>
                            <th className="px-6 py-5 text-center">Last Bump</th>
                            <th className="px-6 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {loading && listings.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-20 text-gray-500 animate-pulse">Syncing with encrypted database...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-20 text-gray-500">No listings found. Synchronize to begin.</td></tr>
                        ) : filtered.map(l => (
                            <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleUpdate(l, { status: l.status === 'Active' ? 'Inactive' : 'Active' })}
                                        className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase border tracking-tighter transition-all ${l.status === 'Active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
                                    >
                                        {l.status}
                                    </button>
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
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                    <div className={`text-xs font-mono font-bold ${l.lastBumpStatus === 'failed' ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {l.lastBumped ? new Date(l.lastBumped).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '[Off]'}
                                    </div>
                                    <div className="text-[10px] text-gray-500 mt-1 uppercase font-bold flex items-center justify-center gap-1.5">
                                        {l.lastBumpStatus === 'failed' ? (
                                            <span className="text-red-500/80">❌ FAILED</span>
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
        </div>
    );
}
