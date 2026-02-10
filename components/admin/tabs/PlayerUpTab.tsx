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
    createdAt: string;
}

export default function PlayerUpTab() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAutoFetch, setShowAutoFetch] = useState(false);
    const [username, setUsername] = useState('officialum1');
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        fetchListings();
    }, []);

    const handleCloudSync = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/playerup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'cloud_fetch' })
            });
            const data = await res.json();
            if (data.success) {
                modernAlert("Cloud Sync Complete!", `Found ${data.count} listings. Added ${data.new} new items.`, "success");
                fetchListings();
            } else {
                modernAlert("Cloud Sync Failed", data.error || "Check your session cookies status.", "error");
            }
        } catch (e) {
            modernAlert("Cloud Sync Error", "The server couldn't reach PlayerUp.", "error");
        } finally {
            setLoading(false);
        }
    };

    async function fetchListings() {
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
    }

    const handleDelete = async (id: string) => {
        if (!(await modernConfirm("Delete this listing?"))) return;
        try {
            await fetch('/api/admin/playerup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', id })
            });
            fetchListings();
        } catch (e) {
            modernAlert("Failed to delete");
        }
    };

    const handleBump = async (listing: Listing) => {
        try {
            window.open(listing.url + '/up', '_blank');
            await fetch('/api/admin/playerup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update_bump', id: listing.id })
            });
            fetchListings();
        } catch (e) {
            console.error(e);
        }
    };

    const getTurboScript = () => {
        const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://officialum1.com';
        return `
(async () => {
    console.clear();
    console.log("%c 🚀 OFFICIALUM1 TURBO ENGINE STARTING... ", "background: #ff0055; color: white; font-weight: bold; font-size: 16px; padding: 10px; border-radius: 5px;");
    console.log("%cTarget Site: ${siteUrl}", "color: #00c3ff; font-weight: bold;");

    let page = 1;
    let totalSynced = 0;
    let consecutiveEmptyCount = 0;
    const maxEmptyPages = 3; // Stop if 3 pages in a row have 0 results
    
    // Auto-detect the base URL from current tab or default to slug
    let baseUrl = window.location.href.split('?')[0].split('/page-')[0];
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
    
    console.log("Starting sync from: " + baseUrl);

    while(page <= 1000) { 
        const targetUrl = page === 1 ? baseUrl : baseUrl + "/page-" + page;
        console.log("%cScanning Page " + page + "... %c(" + targetUrl + ")", "color: #ffaa00; font-weight: bold;", "color: #555; font-size: 0.8rem;");

        try {
            const res = await fetch(targetUrl);
            if (!res.ok) {
                console.warn("Page " + page + " not found (404/Limit). Stopping.");
                break;
            }
            const html = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            
            // XenForo Selectors: .structItem-title a, .previewLink, or general thread links
            const threadLinks = [...doc.querySelectorAll('.structItem-title a, a[href*="/threads/"]')];
            
            // Deduplicate and clean
            const uniqueThreads = new Map();
            threadLinks.forEach(a => {
                const url = a.href.split('?')[0];
                const title = a.innerText.trim();
                if (url.includes('/threads/') && title && !uniqueThreads.has(url)) {
                    uniqueThreads.set(url, { title, url });
                }
            });

            const batch = Array.from(uniqueThreads.values());

            if (batch.length === 0) {
                consecutiveEmptyCount++;
                console.log("%cNo threads found on page " + page, "color: #666;");
                if (consecutiveEmptyCount >= maxEmptyPages) {
                    console.log("3 consecutive empty pages. Ending sync.");
                    break;
                }
            } else {
                consecutiveEmptyCount = 0;
                console.log("%cFound " + batch.length + " listings. Syncing to database...", "color: #00ff88;");
                
                const syncResponse = await fetch("${siteUrl}/api/admin/playerup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "turbo_sync", listings: batch })
                });
                
                if (syncResponse.ok) {
                    totalSynced += batch.length;
                    console.log("%c✅ Successfully Synced! Total: " + totalSynced, "background: #004422; color: #00ff88; padding: 2px 5px;");
                } else {
                    console.error("❌ Failed to sync batch to your website database.");
                }
            }

            page++;
            // Randomized delay to stay under the radar
            await new Promise(r => setTimeout(r, 800 + Math.random() * 400)); 
        } catch(e) { 
            console.error("Critical error on page " + page, e);
            break; 
        }
    }
    
    alert("🏁 TURBO ENGINE FINISHED!\\n\\nTotal threads synced: " + totalSynced + "\\nCheck your admin dashboard for the live listings.");
})();
        `.trim();
    };

    const handleCopyScript = () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(getTurboScript());
            modernAlert("Script Copied!", "1. Go to your PlayerUp profile.\n2. Press F12 -> Console.\n3. Paste and press Enter.", "success");
        } else {
            modernAlert("Clipboard Error", "Please copy the script manually from the console (if you can see it).");
            console.log(getTurboScript());
        }
    };

    const platforms = ['All', 'Reddit', 'Snapchat', 'Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter', 'Google', 'Discord', 'Telegram', 'Streaming', 'Social'];
    const filteredListings = activeFilter === 'All' ? listings : listings.filter(l => l.platform === activeFilter);

    return (
        <div className="FadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        🚀 PlayerUp Manager
                        <span style={{ fontSize: '0.8rem', background: '#00c3ff22', color: '#00c3ff', padding: '2px 8px', borderRadius: '4px' }}>
                            {listings.length} Threads
                        </span>
                    </h2>
                    <p style={{ color: '#888', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Managing digital assets live on database.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleCloudSync}
                        disabled={loading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                    >
                        <span>☁️</span>
                        {loading ? 'Powering Sync...' : 'Cloud Master Sync'}
                    </button>
                    <button
                        onClick={() => setShowAutoFetch(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg hover:shadow-pink-500/20"
                    >
                        <span>⚡</span>
                        Auto-Fetch All Pages
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '10px' }}>
                {platforms.map(p => (
                    <button
                        key={p}
                        onClick={() => setActiveFilter(p)}
                        style={{
                            padding: '6px 16px',
                            borderRadius: '20px',
                            background: activeFilter === p ? '#00c3ff' : '#111',
                            color: activeFilter === p ? '#000' : '#888',
                            border: '1px solid',
                            borderColor: activeFilter === p ? '#00c3ff' : '#222',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            transition: '0.2s'
                        }}
                    >
                        {p}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>⚡ Accessing SQL Database...</div>
            ) : filteredListings.length === 0 ? (
                <div className="glass" style={{ padding: '6rem', textAlign: 'center', borderRadius: '24px', color: '#444', border: '1px dashed #222' }}>
                    No listings found for <b>{activeFilter}</b>.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {filteredListings.map(l => (
                        <div key={l.id} className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid #1f2937', position: 'relative' }}>
                            <div style={{ marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: '0.65rem', color: '#00c3ff', textTransform: 'uppercase', fontWeight: 'bold' }}>{l.platform}</div>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#fff', margin: '5px 0', lineHeight: '1.4' }}>{l.title}</h3>
                                </div>
                                <img src={getPlatformIcon(l.platform)} style={{ width: '24px', height: '24px', borderRadius: '4px' }} alt="" />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', padding: '0.8rem', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                    Last Sync Wave:<br />
                                    <span style={{ color: l.lastBumped ? '#00ff88' : '#888', fontWeight: 'bold' }}>
                                        {l.lastBumped ? new Date(l.lastBumped).toLocaleTimeString() : 'Ready'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleDelete(l.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1rem' }}>🗑️</button>
                                    <button onClick={() => handleBump(l)} style={{ background: '#00c3ff', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>BUMP</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showAutoFetch && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(20px)' }}>
                    <div className="glass" style={{ padding: '2.5rem', borderRadius: '32px', width: '600px', maxWidth: '90vw', border: '1px solid #ff005544' }}>
                        <h3 style={{ color: '#ff0055', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>⚡</span> Turbo Auto-Fetch (All Pages)
                        </h3>
                        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                            You have **19,000+** items. Forcing our server to scrape this would get your account blocked.
                            Use this **Safe Browser Bridge** to fetch all data using your own browser session.
                        </p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.7rem', color: '#555', fontWeight: 'bold', marginBottom: '0.5rem', textTransform: 'uppercase' }}>PLAYERUP USERNAME</label>
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: '#000', border: '1px solid #333', color: '#fff', fontSize: '1rem' }}
                            />
                        </div>

                        <div style={{ background: 'rgba(255,0,85,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,0,85,0.1)', marginBottom: '2rem' }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#fff' }}>How to Auto-Sync:</h4>
                            <ol style={{ fontSize: '0.8rem', color: '#ccc', paddingLeft: '1.2rem', margin: 0, lineHeight: '1.7' }}>
                                <li>Click <b>Copy Turbo Script</b> below.</li>
                                <li>Open your <a href={`https://www.playerup.com/${username}`} target="_blank" style={{ color: '#ff0055', fontWeight: 'bold' }}>PlayerUp Profile</a>.</li>
                                <li>Right-click &rarr; <b>Inspect</b> &rarr; Click <b>Console</b>.</li>
                                <li>Paste (Ctrl + V) and press <b>Enter</b>.</li>
                                <li>Watch it turns pages automatically and sync everything here!</li>
                            </ol>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowAutoFetch(false)} className="btn btn-outline" style={{ borderColor: '#333' }}>Close</button>
                            <button onClick={handleCopyScript} className="btn btn-primary" style={{ background: '#ff0055', color: '#fff', border: 'none', fontWeight: 'bold' }}>
                                📋 Copy Turbo Script
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
