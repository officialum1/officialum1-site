'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Z2UManager() {
    const router = useRouter();
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [settings, setSettings] = useState<any>({});
    const [scanUrl, setScanUrl] = useState('');

    // Load Settings & Sync to Extension
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings');
                const data = await res.json();
                setSettings(data);

                // Sync to Extension immediately
                if (typeof window !== 'undefined') {
                    if (data.z2u_auto_online !== undefined) window.dispatchEvent(new CustomEvent('OFFICIALUM1_Z2U_AUTO_ONLINE', { detail: data.z2u_auto_online }));
                    if (data.z2u_auto_reply !== undefined) window.dispatchEvent(new CustomEvent('OFFICIALUM1_Z2U_AUTO_REPLY_TOGGLE', { detail: data.z2u_auto_reply }));
                    if (data.z2u_reply_message) window.dispatchEvent(new CustomEvent('OFFICIALUM1_Z2U_AUTO_REPLY_MSG', { detail: data.z2u_reply_message }));
                }
            } catch (e) {
                console.error("Failed to load settings", e);
            }
        };
        loadSettings();
    }, []);

    const saveSetting = async (key: string, value: any) => {
        try {
            await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            });
        } catch (e) { console.error("Save failed", e); }
    };

    const fetchListings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/z2u');
            const data = await res.json();

            if (!res.ok) {
                console.error("Z2U API Error Response:", data);
                alert("API Error: " + (data.error || "Unknown Error"));
                return;
            }

            if (data.listings) {
                setListings(data.listings);
                const active = data.listings.filter((l: any) => l.status === 'Active').length;
                setStats({
                    total: data.listings.length,
                    active,
                    inactive: data.listings.length - active
                });
            }
        } catch (error) {
            console.error("Failed to load listings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();

        // Listen for extension updates
        const updateListener = (e: any) => {
            if (e.detail?.count) {
                // Refresh data if extension says it found stuff
                setTimeout(fetchListings, 2000);
            }
        };
        window.addEventListener('OFFICIALUM1_Z2U_RESULT', updateListener);
        return () => window.removeEventListener('OFFICIALUM1_Z2U_RESULT', updateListener);
    }, []);

    const triggerSync = () => {
        // Dispatch event for Extension
        const event = new CustomEvent('OFFICIALUM1_Z2U_SYNC', { detail: { url: scanUrl } });
        window.dispatchEvent(event);
        alert('Extension Command Sent: Scanning Z2U' + (scanUrl ? ' URL...' : ' Listings...'));
    };

    // Filter Logic
    const filteredListings = listings.filter(l =>
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.id.includes(searchTerm)
    );

    return (
        <div className="p-8 bg-gray-900 min-h-screen text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Z2U Global Hub 🛰️
                        </h1>
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            {stats.total} Offers
                        </span>
                        {settings.z2u_auto_online && (
                            <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                ● Auto-Online Active
                            </span>
                        )}
                    </div>
                    <p className="text-gray-400 text-sm">Underground synchronization engine. Syncs listings and keeps you "Online" in the background.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-gray-800/50 p-2 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                    <input
                        type="text"
                        placeholder="Optional: Paste Z2U Store URL..."
                        value={scanUrl}
                        onChange={(e) => setScanUrl(e.target.value)}
                        className="bg-black/40 border border-gray-700/50 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 w-64 transition-all"
                    />
                    <button
                        onClick={triggerSync}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        🔄 Synchronize
                    </button>
                </div>
            </div>

            {/* Z2U Command Center */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                {/* 1. Stats Column */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h3 className="text-gray-400 text-xs uppercase tracking-widest">Active Listings</h3>
                        <p className="text-4xl font-bold text-green-400 mt-2">{stats.active}</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex-1">
                            <h3 className="text-gray-400 text-xs uppercase">Total</h3>
                            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex-1">
                            <h3 className="text-gray-400 text-xs uppercase">Inactive</h3>
                            <p className="text-2xl font-bold text-red-400 mt-1">{stats.inactive}</p>
                        </div>
                    </div>
                </div>

                {/* 2. Automation Center */}
                <div className="lg:col-span-2 bg-gray-900 border border-gray-700 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <span style={{ fontSize: '100px' }}>🤖</span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="text-green-500">●</span> Z2U Automation Suite
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Auto-Online */}
                        <div className="bg-black/30 p-4 rounded-xl border border-gray-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-300 font-bold">Auto-Online Status</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.z2u_auto_online || false}
                                        onChange={async (e) => {
                                            const val = e.target.checked;
                                            setSettings({ ...settings, z2u_auto_online: val });
                                            await saveSetting('z2u_auto_online', val);
                                            if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('OFFICIALUM1_Z2U_AUTO_ONLINE', { detail: val }));
                                        }}
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">Keeps your "Online" status active 24/7 via Extension.</p>
                        </div>

                        {/* Flash Reply */}
                        <div className="bg-black/30 p-4 rounded-xl border border-gray-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-300 font-bold">Flash Reply (Auto-Greeter)</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.z2u_auto_reply || false}
                                        onChange={async (e) => {
                                            const val = e.target.checked;
                                            setSettings({ ...settings, z2u_auto_reply: val });
                                            await saveSetting('z2u_auto_reply', val);
                                            if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('OFFICIALUM1_Z2U_AUTO_REPLY_TOGGLE', { detail: val }));
                                        }}
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">Instantly replies to new Z2U chats.</p>
                        </div>
                    </div>

                    {/* Message Input */}
                    {settings.z2u_auto_reply && (
                        <div className="mt-6 animate-fade-in-up">
                            <label className="text-gray-400 text-xs uppercase font-bold mb-2 block">Auto-Reply Message</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="Type your greeting here..."
                                    value={settings.z2u_reply_message || ''}
                                    onChange={(e) => setSettings({ ...settings, z2u_reply_message: e.target.value })}
                                />
                                <button
                                    onClick={async () => {
                                        const msg = settings.z2u_reply_message || "Hello!";
                                        await saveSetting('z2u_reply_message', msg);
                                        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('OFFICIALUM1_Z2U_AUTO_REPLY_MSG', { detail: msg }));
                                        alert("✅ Z2U Message Saved!");
                                    }}
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-sm transition-colors"
                                >
                                    SAVE
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls & Search */}
            <div className="flex justify-between items-center mb-6 bg-gray-800 p-4 rounded-lg">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">🔍</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Search IDs or Titles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 w-80"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-green-600/20 text-green-400 rounded hover:bg-green-600/30 font-medium opacity-50 cursor-not-allowed">
                        Batch Relist (Coming Soon)
                    </button>
                    <button className="px-4 py-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 font-medium opacity-50 cursor-not-allowed">
                        Deactivate All (Coming Soon)
                    </button>
                </div>
            </div>

            {/* Listings Table */}
            <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-900/50 text-gray-400 uppercase text-xs font-semibold">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Title</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading listings...</td></tr>
                            ) : filteredListings.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No listings found. Click 'Sync Now' to import.</td></tr>
                            ) : (
                                filteredListings.map((listing) => (
                                    <tr key={listing.id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="p-4 font-mono text-sm text-gray-400">#{listing.id}</td>
                                        <td className="p-4 text-white max-w-xs truncate" title={listing.title}>
                                            {listing.title}
                                        </td>
                                        <td className="p-4 text-green-400 font-bold">${listing.price}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${Number(listing.stock) > 0 ? 'bg-blue-900 text-blue-300' : 'bg-red-900 text-red-300'}`}>
                                                {listing.stock}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold w-fit ${listing.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                <span className={`w-2 h-2 rounded-full ${listing.status === 'Active' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                                {listing.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <a
                                                href={listing.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                                            >
                                                View ↗
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 text-center text-gray-500 text-sm">
                Last synced: {new Date().toLocaleTimeString()}
            </div>
        </div>
    );
}
