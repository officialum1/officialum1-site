"use client";
import { useState, useEffect } from 'react';
import { modernAlert, modernConfirm } from '@/components/ModernUIOverlay';
import { getPlatformIcon } from '@/lib/icons';

interface Z2UListing {
    id: string;
    title: string;
    url: string;
    platform: string;
    price: string;
    stock: string;
    status: string;
    last_sync: string;
    editUrl?: string;
    relistUrl?: string;
    extendUrl?: string;
}

export default function Z2UTab() {
    const [listings, setListings] = useState<Z2UListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [cookieStatus, setCookieStatus] = useState<'connected' | 'disconnected'>('disconnected');
    const [debugLog, setDebugLog] = useState<string[]>([]);

    const [showManualImport, setShowManualImport] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [editingData, setEditingData] = useState<Record<string, { price: string, stock: string }>>({});

    useEffect(() => {
        fetchListings();
        checkCookieStatus();

        const handleLog = (e: any) => {
            if (e.detail?.message) setDebugLog(prev => [e.detail.message, ...prev].slice(0, 50));
        };
        window.addEventListener('OFFICIALUM1_Z2U_LOG', handleLog);
        return () => window.removeEventListener('OFFICIALUM1_Z2U_LOG', handleLog);
    }, []);


    const checkCookieStatus = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const settings = await res.json();
            if (settings['session_cookies_z2u_com'] && settings['session_cookies_z2u_com'].length > 20) {
                setCookieStatus('connected');
            }
        } catch (e) { console.error("Cookie check failed", e); }
    };

    const fetchListings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/z2u');
            const data = await res.json();
            const fetchedListings = Array.isArray(data.listings) ? data.listings : (Array.isArray(data) ? data : []);
            setListings(fetchedListings);

            // Initialize editing data with current values
            const initialEditing: Record<string, { price: string, stock: string }> = {};
            fetchedListings.forEach((l: Z2UListing) => {
                initialEditing[l.id] = { price: l.price, stock: l.stock };
            });
            setEditingData(initialEditing);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const [targetUrl, setTargetUrl] = useState("https://www.z2u.com/sell/manageList?service=5&game=15132");

    const handleSync = () => {
        setSyncing(true);
        const adminKey = localStorage.getItem('admin_key');
        window.dispatchEvent(new CustomEvent('OFFICIALUM1_Z2U_SYNC', {
            detail: { url: targetUrl, pass: adminKey }
        }));

        setDebugLog(["🛰️ Signal Transmitted. Awaiting Satellite Link...", ...debugLog]);

        setTimeout(fetchListings, 12000);
        setTimeout(fetchListings, 20000);
        setTimeout(fetchListings, 30000);
        setTimeout(() => {
            fetchListings();
            setSyncing(false);
        }, 45000);
    };

    const handleZ2UAction = (type: 'extend' | 'active' | 'inactive' | 'delete' | 'sort', id?: string) => {
        const adminKey = localStorage.getItem('admin_key');
        const idsToProcess = id ? [id] : (selectedIds.length > 0 ? selectedIds : undefined);

        if (type === 'delete') {
            if (!confirm(`⚠️ WARNING: This will DESTRUCTIVELY delete the listing(s) from Z2U platform. Are you sure?`)) return;
        }

        window.dispatchEvent(new CustomEvent('OFFICIALUM1_Z2U_BATCH_ACTION', {
            detail: {
                actionType: type,
                id: id,
                ids: idsToProcess,
                pass: adminKey,
                url: targetUrl
            }
        }));

        const label = id ? `#${id}` : (selectedIds.length > 0 ? `${selectedIds.length} SELECTED` : 'GLOBAL');
        setDebugLog([`🛰️ Operation Dispatched: ${type.toUpperCase()} (${label})`, ...debugLog]);

        // Removed automatic handleSync to prevent overlapping logs. 
        // User can click Manual Import/Sync if they want to refresh after the operation window closes.
        if (!id) setSelectedIds([]);
    };

    const handleBulkSave = () => {
        const adminKey = localStorage.getItem('admin_key');
        const updates = listings
            .filter(l => editingData[l.id] && (editingData[l.id].price !== l.price || editingData[l.id].stock !== l.stock))
            .map(l => ({
                id: l.id,
                price: editingData[l.id].price,
                stock: editingData[l.id].stock
            }));

        if (updates.length === 0) {
            modernAlert("No Changes Found", "You haven't modified any prices or stock levels.");
            return;
        }

        setSaving(true);
        window.dispatchEvent(new CustomEvent('OFFICIALUM1_Z2U_SAVE_CHANGES', {
            detail: {
                updates,
                pass: adminKey,
                url: targetUrl
            }
        }));

        setDebugLog([`🛰️ Dispatching Bulk Update for ${updates.length} items...`, ...debugLog]);

        // Auto refresh after a while
        setTimeout(() => {
            fetchListings();
            setSaving(false);
        }, 35000);
    };

    const handleFieldChange = (id: string, field: 'price' | 'stock', value: string) => {
        setEditingData(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));
    };

    const handleRemoveFromDB = async (id: string) => {
        if (!confirm("Remove this record from your local dashboard? (Listings still on Z2U will reappear on next sync)")) return;
        try {
            await fetch('/api/admin/z2u', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', id })
            });
            fetchListings();
        } catch (e) {
            modernAlert("Failed to remove record");
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === listings.length) setSelectedIds([]);
        else setSelectedIds(listings.map(l => l.id));
    };

    const [singleIdInput, setSingleIdInput] = useState("");

    const handleManualImport = async (input: string) => {
        const newListings: Z2UListing[] = [];
        const foundIds = new Set<string>();

        const addListing = (id: string, partial: Partial<Z2UListing>) => {
            if (foundIds.has(id)) return;
            foundIds.add(id);
            newListings.push({
                id,
                title: partial.title || `Z2U Listing #${id}`,
                url: partial.url || `https://www.z2u.com/product/${id}.html`,
                platform: 'Other',
                price: partial.price || "0.00",
                stock: partial.stock || "1",
                status: partial.status || "Active",
                last_sync: new Date().toISOString(),
                editUrl: partial.editUrl || `https://www.z2u.com/sell/manage/edit?id=${id}`
            });
        };

        if (singleIdInput.trim()) {
            const ids = singleIdInput.match(/\d+/g);
            if (ids) ids.forEach(id => addListing(id, { title: `Force Add ID #${id}` }));
        }

        if (input) {
            const idRegex = /#(\d{7,15})/g;
            let m;
            while ((m = idRegex.exec(input)) !== null) {
                addListing(m[1], { title: `Imported from Source #${m[1]}` });
            }
        }

        if (newListings.length > 0) {
            await fetch('/api/admin/z2u', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'turbo_sync', listings: newListings })
            });
            modernAlert("Import Successful", `Injected ${newListings.length} items into database.`, "success");
            setShowManualImport(false);
            fetchListings();
        } else {
            modernAlert("No IDs Found", "I couldn't find any ID pattern like #1234567 in that text.", "error");
        }
    };

    const handleDelete = async (id: string) => {
        if (!(await modernConfirm("Remove this Z2U listing from panel?"))) return;
        try {
            await fetch('/api/admin/z2u', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', id })
            });
            fetchListings();
        } catch (e) {
            modernAlert("Failed to delete");
        }
    };

    return (
        <div className="FadeIn p-4">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        🛰️ Z2U Command Center
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">{listings.length} OFFERS</span>
                        {cookieStatus === 'connected' ? (
                            <span className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                Auto-Online ACTIVE
                            </span>
                        ) : (
                            <span className="text-xs bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                CONNECTION REQUIRED
                            </span>
                        )}
                    </h2>
                    <div className="flex flex-col gap-1 mt-1 leading-none">
                        <p className="text-gray-400 text-sm">Underground synchronization engine. Keeps your listings sync'd and your status online.</p>
                        {debugLog.length > 0 && (
                            <div className="mt-3 bg-black/40 border border-white/5 rounded-xl p-3 max-h-24 overflow-y-auto scrollbar-hide">
                                {debugLog.map((log, i) => (
                                    <div key={i} className={`text-[10px] font-mono flex items-center gap-2 ${i === 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                                        <span className="opacity-30">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                                        {i === 0 && <span className="animate-pulse">●</span>}
                                        {log}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        placeholder="Paste manageList? URL here..."
                        className="bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-xs w-64 text-white focus:border-emerald-500/50 outline-none placeholder:text-gray-600"
                    />
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className={`bg-white/5 text-white border border-white/10 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2 ${syncing ? 'opacity-50 cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.2)]' : ''}`}
                    >
                        <span>{syncing ? '⌛' : '🛰️'}</span> {syncing ? 'Linking...' : 'Synchronize'}
                    </button>
                    <button onClick={() => setShowManualImport(!showManualImport)} className="bg-emerald-600/10 text-emerald-400 border border-emerald-600/30 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-600 hover:text-white transition-all">
                        📄 Manual Import
                    </button>
                </div>
            </div>


            {/* Satellite Bulk Operations Bar */}
            <div className="mb-6 flex items-center justify-between glass p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Satellite Bulk Controls:</span>
                    <button onClick={() => handleZ2UAction('active')} className="bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white px-4 py-2 rounded-xl text-[11px] font-black border border-amber-500/20 transition-all uppercase tracking-wider">♻️ Relist</button>
                    <button onClick={() => handleZ2UAction('extend')} className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white px-4 py-2 rounded-xl text-[11px] font-black border border-emerald-500/20 transition-all uppercase tracking-wider">⏳ Extend Duration</button>
                    <button onClick={() => handleZ2UAction('inactive')} className="bg-white/5 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-[11px] font-black border border-white/10 transition-all uppercase tracking-wider">⏹️ Offline</button>
                    <button onClick={handleBulkSave} disabled={saving} className="bg-emerald-500 text-white px-6 py-2 rounded-xl text-[11px] font-black shadow-lg shadow-emerald-500/30 transition-all uppercase tracking-wider animate-pulse hover:animate-none">{saving ? '🛰️ SAVING...' : '💾 BATCH UPDATE (SAVE)'}</button>
                    <button onClick={() => handleZ2UAction('delete')} className="bg-red-900/10 hover:bg-red-900 text-red-500 hover:text-white px-4 py-2 rounded-xl text-[11px] font-black border border-red-900/20 transition-all uppercase tracking-wider">🗑️ Delete</button>
                </div>
                <div className="text-[10px] text-gray-600 font-mono italic pr-2">
                    {syncing || saving ? "📡 Uplink Active..." : "🛰️ Satellite Standby"}
                </div>
            </div>

            {showManualImport && (
                <div className="mb-8 glass p-6 rounded-2xl border border-emerald-500/30 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">📋 Quick Injected Importer</h3>
                    <div className="flex gap-4 mb-4">
                        <textarea className="flex-1 h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-300 outline-none" placeholder='Paste Source Code...' id="z2u-manual-area"></textarea>
                        <input type="text" value={singleIdInput} onChange={(e) => setSingleIdInput(e.target.value)} placeholder="Single ID" className="w-1/3 bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-mono text-white outline-none" />
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => setShowManualImport(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                        <button onClick={() => handleManualImport((document.getElementById('z2u-manual-area') as HTMLTextAreaElement).value)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-sm">Process & Sync</button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto glass rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-[11px] uppercase tracking-[0.2em] text-gray-400 font-black">
                            <th className="px-3 py-4 text-center"><input type="checkbox" className="accent-emerald-500 scale-110" checked={listings.length > 0 && selectedIds.length === listings.length} onChange={toggleSelectAll} /></th>
                            <th className="px-6 py-4">ID & Status</th>
                            <th className="px-6 py-5">Product Information</th>
                            <th className="px-6 py-5 text-right">Price (USD)</th>
                            <th className="px-6 py-5 text-center">Stock</th>
                            <th className="px-6 py-5 text-center">Last Sync</th>
                            <th className="px-6 py-5 text-right">Remote Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {loading && listings.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-20 text-gray-500 animate-pulse font-mono tracking-widest uppercase">Fetching Satellite Data...</td></tr>
                        ) : listings.map(l => (
                            <tr key={l.id} className={`border-b border-white/[0.03] hover:bg-white/[0.02] group transition-all ${selectedIds.includes(l.id) ? 'bg-emerald-500/[0.03]' : ''}`}>
                                <td className="px-3 py-4 text-center">
                                    <input type="checkbox" className="accent-emerald-500 scale-110 cursor-pointer" checked={selectedIds.includes(l.id)} onChange={() => toggleSelect(l.id)} />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-mono text-xs text-white font-bold mb-1">#{l.id}</div>
                                    <div className={`text-[10px] ${l.status === 'Active' ? 'text-emerald-500' : 'text-red-500'} font-bold uppercase`}>{l.status || 'Active'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white text-[13px] max-w-[340px] truncate group-hover:text-emerald-400 transition-colors uppercase">{l.title}</div>
                                    <div className="text-[10px] text-gray-600 mt-0.5 truncate max-w-[340px] font-mono opacity-50">{l.url}</div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex flex-col items-end">
                                        <div className="relative group/price">
                                            <span className="absolute left-[-15px] top-[7px] text-[10px] text-emerald-500 font-bold">$</span>
                                            <input
                                                type="text"
                                                value={editingData[l.id]?.price || l.price}
                                                onChange={(e) => handleFieldChange(l.id, 'price', e.target.value)}
                                                className={`bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-right font-bold text-lg w-24 focus:border-emerald-500 outline-none transition-all ${editingData[l.id]?.price !== l.price ? 'text-amber-400 border-amber-500/50' : 'text-emerald-400'}`}
                                            />
                                        </div>
                                        <div className="text-[9px] text-gray-600 font-black tracking-widest uppercase mt-1">UNIT PRICE</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <input
                                            type="number"
                                            value={editingData[l.id]?.stock || l.stock}
                                            onChange={(e) => handleFieldChange(l.id, 'stock', e.target.value)}
                                            className={`bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-center font-bold text-sm w-16 focus:border-emerald-500 outline-none transition-all ${editingData[l.id]?.stock !== l.stock ? 'text-amber-400 border-amber-500/50' : 'text-white'}`}
                                        />
                                        <div className="text-[9px] text-gray-600 font-black mt-1 tracking-widest uppercase">STOCK</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center font-mono">
                                    <div className="text-gray-400 text-xs">{l.last_sync ? new Date(l.last_sync).toLocaleTimeString() : '---'}</div>
                                    <div className="text-[9px] text-gray-700 font-black mt-1 tracking-widest uppercase">SYNC TIME</div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex gap-1 justify-end">
                                        <button onClick={() => handleZ2UAction('extend', l.id)} className="bg-emerald-500/5 hover:bg-emerald-500 text-emerald-500 hover:text-white px-2 py-1.5 rounded-lg text-[9px] font-black border border-emerald-500/20 transition-all uppercase tracking-wider">EXT</button>
                                        <button onClick={() => handleZ2UAction('active', l.id)} className="bg-amber-500/5 hover:bg-amber-500 text-amber-400 hover:text-white px-2 py-1.5 rounded-lg text-[9px] font-black border border-amber-500/20 transition-all uppercase tracking-wider">RE</button>
                                        <button onClick={() => handleZ2UAction('inactive', l.id)} className="bg-white/5 hover:bg-white/20 text-white px-2 py-1.5 rounded-lg text-[9px] font-black border border-white/10 transition-all uppercase tracking-wider">OFF</button>
                                        <button onClick={() => handleZ2UAction('delete', l.id)} className="bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white px-2 py-1.5 rounded-lg text-[9px] font-black border border-red-500/20 transition-all uppercase tracking-wider">🗑️</button>
                                        <button onClick={() => handleRemoveFromDB(l.id)} className="bg-white/5 hover:bg-gray-500 text-gray-400 hover:text-white w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 transition-all text-xs">✖</button>
                                        <a href={l.editUrl || `https://www.z2u.com/sell/manage/edit?id=${l.id}`} target="_blank" className="bg-white/5 hover:bg-emerald-500 text-white w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 transition-all text-xs">⚙️</a>
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
