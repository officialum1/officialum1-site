
"use client";
import { useState, useEffect } from 'react';
import { modernAlert, modernConfirm } from '@/components/ModernUIOverlay';
import { getPlatformIcon } from '@/lib/icons';

interface Z2UListing {
    id: string;
    title: string;
    url: string;
    platform: string;
    unit_price: string;
    stock: string;
    status: string;
    lastSync: string;
}

export default function Z2UTab() {
    const [listings, setListings] = useState<Z2UListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [cookieStatus, setCookieStatus] = useState<'connected' | 'disconnected'>('disconnected');

    const [showManualImport, setShowManualImport] = useState(false);

    useEffect(() => {
        fetchListings();
        checkCookieStatus();
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
            if (Array.isArray(data)) setListings(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = () => {
        window.dispatchEvent(new CustomEvent('OFFICIALUM1_Z2U_SYNC'));
        modernAlert("Z2U Underground Sync", "Scanning your Z2U listings in the background... No tabs needed! 🛰️", "success");
        setTimeout(fetchListings, 15000);
    };

    const handleManualImport = async (input: string) => {
        if (!input) return;

        // Robust Z2U Parsing Logic (Client-Side)
        const listings: Z2UListing[] = [];
        const foundIds = new Set<string>();

        // Helper to add listing safely
        const addListing = (id: string, partial: Partial<Z2UListing>) => {
            if (foundIds.has(id)) return;
            foundIds.add(id);
            listings.push({
                id,
                title: partial.title || `Z2U Listing #${id}`,
                url: partial.url || `https://www.z2u.com/products/${id}.html`,
                platform: 'Other',
                unit_price: partial.unit_price || "0.00",
                stock: partial.stock || "1",
                status: partial.status || "Active",
                lastSync: new Date().toISOString()
            });
        };

        // Strategy A: Row-based (Rich Data)
        const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
        const itemRegex = /<(?:tr|div)[^>]*class=["']?[^"']*(?:item|row|list)[^"']*["']?[^>]*>([\s\S]*?)<\/(?:tr|div)>/gi;

        let loopRegex = rowRegex;
        // If strict rows aren't found, try div items, or just proceed to Strategy B
        if ((input.match(rowRegex) || []).length < 2) loopRegex = itemRegex;

        let match;
        while ((match = loopRegex.exec(input)) !== null) {
            const content = match[1];

            // Extract ID
            const idMatch = content.match(/data-id=["'](\d+)["']/)
                || content.match(/id=["']\D*(\d+)["']/)
                || content.match(/products\/(\d+)\.html/)
                || content.match(/manage\/edit\?id=(\d+)/);

            if (!idMatch) continue;
            const id = idMatch[1];

            // Extract Metadata
            let title = `Z2U Listing #${id}`;
            const tMatch = content.match(/<a[^>]+href=["'][^"']*products\/\d+\.html["'][^>]*>([\s\S]*?)<\/a>/i) || content.match(/<a[^>]*class=["'][^"']*title[^"']*["'][^>]*>([\s\S]*?)<\/a>/i);
            if (tMatch) title = tMatch[1].replace(/<[^>]*>/g, '').trim();

            const priceMatch = content.match(/(?:\$|USD)\s*([\d,]+\.?\d*)/i) || content.match(/class=["']price["'][^>]*>([\s\S]*?)<\/span>/i);
            const stockMatch = content.match(/Stock:?\s*(\d+)/i) || content.match(/value=["'](\d+)["'][^>]*name=["']stock["']/i) || content.match(/>\s*(\d+)\s*</);

            addListing(id, {
                title,
                unit_price: priceMatch ? priceMatch[1].replace(/[^\d.]/g, '') : "0.00",
                stock: stockMatch ? stockMatch[1].replace(/[^\d]/g, '') : "1",
                status: (content.toLowerCase().includes('active') || content.includes('manage/offline')) ? 'Active' : 'Deactivated'
            });
        }

        // Strategy B: Fallback Global Link Scan (If rows failed)
        if (listings.length === 0) {
            const fallbackRegex = /<a[^>]+href=["'].*?products\/(\d+)\.html["'][^>]*>([\s\S]*?)<\/a>/gi;
            let fMatch;
            while ((fMatch = fallbackRegex.exec(input)) !== null) {
                if (fMatch[2].includes('<img')) continue;
                addListing(fMatch[1], {
                    title: fMatch[2].replace(/<[^>]*>/g, '').trim(),
                    status: "Active"
                });
            }
        }

        // Strategy C: Ultra-Aggressive ID Scan (e.g. "edit?id=12345")
        // This catches "manageList" pages where the preview link might be missing but edit buttons exist
        if (listings.length === 0) {
            console.log("Attempting Strategy C: Raw ID Scan");
            // Match href=".../edit?id=123" or value="123" name="id"
            const editIdRegex = /edit\?id=(\d+)/gi;
            let eMatch;
            while ((eMatch = editIdRegex.exec(input)) !== null) {
                addListing(eMatch[1], { title: `Imported Offer #${eMatch[1]}` });
            }

            // Also look for data-id="123" globally
            const dataIdRegex = /data-id=["'](\d+)["']/gi;
            while ((eMatch = dataIdRegex.exec(input)) !== null) {
                addListing(eMatch[1], { title: `Imported Offer #${eMatch[1]}` });
            }
        }

        if (listings.length > 0) {
            await fetch('/api/admin/z2u', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'turbo_sync', listings })
            });
            modernAlert("Import Successful", `Processed ${listings.length} listings.`, "success");
            setShowManualImport(false);
            fetchListings();
        } else {
            modernAlert(
                "No Listings Found",
                "Could not parse listings. \n\nTip: If 'View Source' is empty, try this:\n1. Open Z2U Page\n2. Right Click on the Table > Inspect\n3. Right Click the <table> tag > Copy > Copy OuterHTML\n4. Paste that here.",
                "error"
            );
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
                        🥈 Z2U Command Center
                        <span className="text-xs bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full border border-orange-500/20 uppercase tracking-widest">{listings.length} OFFERS</span>
                        {cookieStatus === 'connected' ? (
                            <div className="flex gap-2">
                                <span className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Cookies Connected
                                </span>
                                <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                    Auto-Online Active
                                </span>
                            </div>
                        ) : (
                            <span className="text-xs bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                Cookies Disconnected
                            </span>
                        )}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Direct bridge to Z2U listing management.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowManualImport(!showManualImport)} className="bg-emerald-600/10 text-emerald-400 border border-emerald-600/30 px-5 py-2 rounded-xl font-bold text-sm hover:bg-emerald-600 hover:text-white transition-all">
                        📋 Manual Import
                    </button>
                    <button onClick={handleSync} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-orange-600/20 transition-all flex items-center gap-2">
                        <span>🛰️</span> Synchronize Z2U
                    </button>
                    <button onClick={() => window.open('https://www.z2u.com/sell/manage', '_blank')} className="bg-white/5 text-white border border-white/10 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-white/10 transition-all">
                        Open Z2U Panel
                    </button>
                </div>
            </div>

            {showManualImport && (
                <div className="mb-8 glass p-6 rounded-2xl border border-emerald-500/30 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">📋 Manual Z2U Importer (Fallback)</h3>
                    <p className="text-sm text-gray-400 mb-4">If Auto-Sync fails, go to your <b>Z2U My Offers Page</b>, right click &gt; View Page Source, copy everything, and paste it here.</p>
                    <textarea
                        className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-300 focus:border-emerald-500/50 outline-none resize-y"
                        placeholder='Paste HTML Source Code here...'
                        id="z2u-manual-import-area"
                    ></textarea>
                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => setShowManualImport(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                        <button onClick={() => handleManualImport((document.getElementById('z2u-manual-import-area') as HTMLTextAreaElement).value)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20">Process & Import</button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto glass rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-[11px] uppercase tracking-[0.2em] text-gray-400 font-black">
                            <th className="px-6 py-5">Status</th>
                            <th className="px-6 py-5">ID</th>
                            <th className="px-6 py-5">Offer Title</th>
                            <th className="px-6 py-5 text-center">Platform</th>
                            <th className="px-6 py-5 text-right">Price</th>
                            <th className="px-6 py-5 text-center">Stock</th>
                            <th className="px-6 py-5 text-center">Last Sync</th>
                            <th className="px-6 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {loading && listings.length === 0 ? (
                            <tr><td colSpan={8} className="text-center py-20 text-gray-500 animate-pulse">Connecting to Z2U Database...</td></tr>
                        ) : listings.length === 0 ? (
                            <tr><td colSpan={8} className="text-center py-20 text-gray-500">No Z2U listings found. Ensure you are logged into Z2U in your browser, then click Synchronize.</td></tr>
                        ) : listings.map(l => (
                            <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${l.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'}`}>
                                        {l.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-gray-500 text-xs">#{l.id}</td>
                                <td className="px-6 py-4 font-semibold text-gray-200">
                                    <div className="max-w-[300px] truncate">{l.title}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <img src={getPlatformIcon(l.platform)} className="w-6 h-6 inline-block opacity-70" alt="" />
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-white">${l.unit_price}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="bg-white/5 px-2 py-1 rounded text-xs text-gray-400">{l.stock}</span>
                                </td>
                                <td className="px-6 py-4 text-center text-gray-500 text-xs uppercase font-medium">
                                    {l.lastSync ? new Date(l.lastSync).toLocaleTimeString() : 'Pending'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(l.id)} className="text-red-500 hover:text-red-400 transition-colors p-2">
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
