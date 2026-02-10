
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

    useEffect(() => {
        fetchListings();
    }, []);

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
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Direct bridge to Z2U listing management.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleSync} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-orange-600/20 transition-all flex items-center gap-2">
                        <span>🛰️</span> Synchronize Z2U
                    </button>
                    <button onClick={() => window.open('https://www.z2u.com/user/listing', '_blank')} className="bg-white/5 text-white border border-white/10 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-white/10 transition-all">
                        Open Z2U Panel
                    </button>
                </div>
            </div>

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
                            <tr><td colSpan={8} className="text-center py-20 text-gray-500">No Z2U listings found. Run Sync to fetch data.</td></tr>
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
