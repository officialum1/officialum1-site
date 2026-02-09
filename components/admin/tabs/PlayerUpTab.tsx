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
    const [isTurboing, setIsTurboing] = useState(false);
    const [progress, setProgress] = useState('');

    useEffect(() => {
        fetchListings();
    }, []);

    async function fetchListings() {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/playerup');
            const data = await res.json();
            if (Array.isArray(data)) setListings(data);
            else if (data.listings) setListings(data.listings);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string) => {
        if (!(await modernConfirm("Delete?"))) return;
        await fetch('/api/admin/playerup', {
            method: 'POST',
            body: JSON.stringify({ action: 'delete', id })
        });
        fetchListings();
    };

    const handleBump = async (listing: Listing) => {
        window.open(listing.url + '/up', '_blank');
        await fetch('/api/admin/playerup', {
            method: 'POST',
            body: JSON.stringify({ action: 'update_bump', id: listing.id })
        });
        fetchListings();
    };

    // THE TURBO CRAWLER CONSOLE SCRIPT
    const getTurboScript = () => {
        return `
(async () => {
    console.log("🚀 STARTING TURBO SYNC FOR ${username.toUpperCase()}...");
    let allLinks = [];
    let page = 1;
    let hasMore = true;

    while(hasMore && page <= 100) { // Limit to 100 pages per burst for safety
        console.log("Reading Page " + page + "...");
        try {
            const res = await fetch("https://www.playerup.com/" + "${username}" + "/page-" + page);
            const html = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const links = [...doc.querySelectorAll('a[href*="threads/"]')];
            
            if(links.length === 0) { hasMore = false; break; }

            const batch = links.map(a => ({
                title: a.innerText.trim() || "PlayerUp Listing",
                url: a.href.split('?')[0]
            }));

            allLinks = [...allLinks, ...batch];
            
            // Send current batch to your site immediately
            await fetch("https://officialum1.com/api/admin/playerup", {
                method: "POST",
                body: JSON.stringify({ action: "turbo_sync", listings: batch })
            });

            console.log("✅ Page " + page + " Synced! Total: " + allLinks.length);
            page++;
            await new Promise(r => setTimeout(r, 500)); // Be nice to PlayerUp
        } catch(e) { 
            console.error("Error on page " + page, e);
            hasMore = false; 
        }
    }
    alert("🏁 TURBO SYNC COMPLETE! Total threads processed: " + allLinks.length);
})();
        `.trim();
    };

    const handleCopyScript = () => {
        navigator.clipboard.writeText(getTurboScript());
        modernAlert("Script Copied!", "1. Go to your PlayerUp profile.\n2. Press F12 -> Console.\n3. Paste and press Enter.", "success");
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
                    <p style={{ color: '#888', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Managing ${(listings.length * 150).toLocaleString()}+ in digital assets.</p>
                </div>
                <button
                    onClick={() => setShowTurbo(true)}
                    className="btn btn-primary"
                    style={{ background: 'linear-gradient(45deg, #ff0055, #ff00aa)', border: 'none', padding: '0.8rem 1.5rem', fontWeight: 'bold', animation: 'pulse 2s infinite' }}
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
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {p}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>⚡ Accessing SQL Database...</div>
            ) : filteredListings.length === 0 ? (
                <div className="glass" style={{ padding: '6rem', textAlign: 'center', borderRadius: '24px', color: '#444' }}>
                    No listings found for <b>{activeFilter}</b>.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {filteredListings.map(l => (
                        <div key={l.id} className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid #1f2937' }}>
                            <div style={{ marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: '0.65rem', color: '#00c3ff', textTransform: 'uppercase', fontWeight: 'bold' }}>{l.platform}</div>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#fff', margin: '5px 0' }}>{l.title}</h3>
                                </div>
                                <img src={getPlatformIcon(l.platform)} style={{ width: '24px', height: '24px' }} alt="" />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', padding: '0.8rem', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                    Sync: {l.lastBumped ? new Date(l.lastBumped).toLocaleTimeString() : 'Ready'}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleDelete(l.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}>🗑️</button>
                                    <button onClick={() => handleBump(l)} style={{ background: '#00c3ff', border: 'none', color: '#000', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>BUMP</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Turbo Sync Modal */}
            {showTurbo && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(15px)' }}>
                    <div className="glass" style={{ padding: '2.5rem', borderRadius: '32px', width: '600px', border: '1px solid #ff005544' }}>
                        <h3 style={{ color: '#ff0055', marginBottom: '1rem' }}>⚡ Turbo Auto-Fetch (All Pages)</h3>
                        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            You have **19,000+** items. Forcing a server to scrape this would get your ID blocked by Cloudflare.
                            Use this **Safe Browser Bridge** to fetch all data using your own verified browser.
                        </p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>PLAYERUP USERNAME</label>
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: '#000', border: '1px solid #333', color: '#fff' }}
                            />
                        </div>

                        <div style={{ background: 'rgba(255,0,85,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,0,85,0.1)', marginBottom: '2rem' }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#fff' }}>How to Auto-Sync:</h4>
                            <ol style={{ fontSize: '0.8rem', color: '#ccc', paddingLeft: '1.2rem', margin: 0, lineHeight: '1.6' }}>
                                <li>Click <b>Copy Turbo Script</b> below.</li>
                                <li>Open your <a href={`https://www.playerup.com/${username}`} target="_blank" style={{ color: '#ff0055' }}>PlayerUp Profile</a>.</li>
                                <li>Right-click anywhere -> <b>Inspect</b> -> Click <b>Console</b> tab.</li>
                                <li>Paste (`Ctrl + V`) and press <b>Enter</b>.</li>
                                <li>Watch it fetch 100s of pages and sync them here!</li>
                            </ol>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowTurbo(false)} className="btn btn-outline" style={{ borderColor: '#444' }}>Close</button>
                            <button onClick={handleCopyScript} className="btn btn-primary" style={{ background: '#ff0055', color: '#fff', border: 'none' }}>
                                📋 Copy Turbo Script
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{\`
                @keyframes pulse {
                    0 % { box- shadow: 0 0 0 0 rgba(255, 0, 85, 0.4); }
                70% {box - shadow: 0 0 0 15px rgba(255, 0, 85, 0); }
                100% {box - shadow: 0 0 0 0 rgba(255, 0, 85, 0); }
                }
            \`}</style>
        </div>
    );
}
