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
    const [showTurbo, setShowTurbo] = useState(false);
    const [username, setUsername] = useState('officialum1');
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        fetchListings();
    }, []);

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
    console.log("🚀 STARTING TURBO SYNC FOR ${username.toUpperCase()}...");
    let page = 1;
    let hasMore = true;
    let totalSynced = 0;

    while(hasMore && page <= 500) { 
        console.log("Reading Page " + page + "...");
        try {
            const res = await fetch("https://www.playerup.com/" + "${username}" + "/page-" + page);
            if (!res.ok) { hasMore = false; break; }
            const html = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const links = [...doc.querySelectorAll('a[href*="threads/"]')];
            
            if(links.length === 0) { hasMore = false; break; }

            const batch = links.map(a => ({
                title: a.innerText.trim() || "PlayerUp Listing",
                url: a.href.split('?')[0]
            })).filter(item => item.url.includes('threads/'));

            if (batch.length > 0) {
                await fetch("${siteUrl}/api/admin/playerup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "turbo_sync", listings: batch })
                });
                totalSynced += batch.length;
                console.log("✅ Page " + page + " Synced! Total: " + totalSynced);
            }

            page++;
            await new Promise(r => setTimeout(r, 600)); 
        } catch(e) { 
            console.error("Error on page " + page, e);
            hasMore = false; 
        }
    }
    alert("🏁 TURBO SYNC COMPLETE! Total threads processed: " + totalSynced);
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
                <button
                    onClick={() => setShowTurbo(true)}
                    className="btn btn-primary pulse-btn"
                    style={{ background: 'linear-gradient(45deg, #ff0055, #ff00aa)', border: 'none', padding: '0.8rem 1.5rem', fontWeight: 'bold' }}
                >
                    ⚡ Auto-Fetch All Pages
                </button>
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

            {showTurbo && (
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
                            <button onClick={() => setShowTurbo(false)} className="btn btn-outline" style={{ borderColor: '#333' }}>Close</button>
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
