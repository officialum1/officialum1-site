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
    const [showImport, setShowImport] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const [draftCount, setDraftCount] = useState(0);

    useEffect(() => {
        fetchListings();
    }, []);

    async function fetchListings() {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/playerup');
            const data = await res.json();
            if (Array.isArray(data)) setListings(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string) => {
        if (!(await modernConfirm("Delete this listing?"))) return;
        try {
            const res = await fetch('/api/admin/playerup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', id })
            });
            if (res.ok) fetchListings();
        } catch (e) {
            modernAlert("Failed to delete");
        }
    };

    const handleBump = async (listing: Listing) => {
        try {
            let bumpUrl = listing.url;
            if (!bumpUrl.endsWith('/up')) {
                if (bumpUrl.endsWith('/')) bumpUrl += 'up';
                else bumpUrl += '/up';
            }
            window.open(bumpUrl, '_blank');
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

    const handleBulkImport = async () => {
        const importBox = document.getElementById('magic-import-box');
        if (!importBox) return;

        const htmlContent = importBox.innerHTML;

        // Advanced Storefront & Thread Regex
        const linkRegex = /href=["'](https:\/\/www\.playerup\.com\/)?(threads\/[^"']+\.\d+\/?)["']/g;
        const matches = [...htmlContent.matchAll(linkRegex)];

        const parsedListings: any[] = [];
        const uniqueUrls = new Set();

        matches.forEach(match => {
            let urlPath = match[2];
            if (!urlPath.startsWith('http')) {
                urlPath = `https://www.playerup.com/${urlPath}`;
            }
            if (uniqueUrls.has(urlPath)) return;
            uniqueUrls.add(urlPath);

            // Clean title from URL slug
            const slugMatch = urlPath.match(/threads\/([^\.]+)\./);
            let title = "PlayerUp Listing";
            if (slugMatch) {
                title = slugMatch[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            }
            parsedListings.push({ title, url: urlPath });
        });

        if (parsedListings.length === 0) {
            modernAlert("No threads found in pasted content.", "Make sure to copy the table from your PlayerUp Storefront.");
            return;
        }

        if (!(await modernConfirm(`🪄 Magic Sync found ${parsedListings.length} deals! Deploy to database?`))) return;

        setLoading(true);
        importBox.innerHTML = `<div style="text-align:center; padding: 2rem; color: #00c3ff;">⚡ Syncing ${parsedListings.length} items to database...</div>`;

        try {
            const res = await fetch('/api/admin/playerup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bulk_import', listings: parsedListings })
            });
            if (res.ok) {
                const data = await res.json();
                modernAlert("Sync Complete", `Successfully merged ${parsedListings.length} listings into your database.`, "success");
                setShowImport(false);
                fetchListings();
            }
        } catch (e) {
            modernAlert("Import Error");
            setLoading(false);
        }
    };

    const platforms = ['All', 'Reddit', 'Snapchat', 'Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter', 'Google', 'Discord', 'Telegram', 'Streaming', 'Social'];

    const filteredListings = activeFilter === 'All'
        ? listings
        : listings.filter(l => l.platform === activeFilter);

    return (
        <div className="FadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        🚀 PlayerUp Manager
                        <span style={{ fontSize: '0.8rem', background: '#00c3ff22', color: '#00c3ff', padding: '2px 8px', borderRadius: '4px' }}>
                            {listings.length} Active
                        </span>
                    </h2>
                    <p style={{ color: '#888', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Managing ${(listings.length * 150).toLocaleString()}+ in digital assets.</p>
                </div>
                <button onClick={() => setShowImport(true)} className="btn btn-primary" style={{ background: 'linear-gradient(45deg, #00c3ff, #0088cc)', border: 'none', padding: '0.8rem 1.5rem' }}>
                    ✨ Mass Power Sync
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
                            <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
                                <img src={getPlatformIcon(l.platform)} style={{ width: '28px', height: '28px', borderRadius: '6px' }} alt={l.platform} />
                            </div>

                            <div style={{ marginBottom: '1.2rem', paddingRight: '2rem' }}>
                                <div style={{ fontSize: '0.65rem', color: '#00c3ff', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>{l.platform}</div>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem', lineHeight: '1.4' }}>{l.title}</h3>
                                <a href={l.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.7rem', color: '#555', textDecoration: 'none' }}>Link: {l.url.substring(0, 40)}...</a>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                    Last Sync Wave:<br />
                                    <span style={{ color: l.lastBumped ? '#00ff88' : '#888' }}>
                                        {l.lastBumped ? new Date(l.lastBumped).toLocaleTimeString() : 'Ready'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleDelete(l.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1rem' }}>🗑️</button>
                                    <button
                                        onClick={() => handleBump(l)}
                                        className="btn btn-primary"
                                        style={{ fontSize: '0.75rem', padding: '4px 12px', background: '#00c3ff', color: '#000' }}
                                    >
                                        BUMP
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showImport && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                    <div className="glass" style={{ padding: '2.5rem', borderRadius: '32px', width: '700px', maxWidth: '95vw', border: '1px solid #00c3ff44' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#00c3ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>✨</span> Power Mass Sync (19,000+ Mode)
                        </h3>

                        <div style={{ background: '#00c3ff11', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid #00c3ff22' }}>
                            <p style={{ fontSize: '0.85rem', color: '#fff', margin: 0, lineHeight: '1.6' }}>
                                <b>Storefront Syncing:</b><br />
                                1. Go to <a href="https://www.playerup.com/officialum1" target="_blank" style={{ color: '#00c3ff' }}>officialum1 Storefront</a>.<br />
                                2. Select the whole table (Ctrl + A) and Copy (Ctrl + C).<br />
                                3. Paste below. We auto-sort <b>Reddit, Snapchat, Google</b> etc. by the "Game" column!<br />
                                <span style={{ color: '#00c3ff' }}>Tip: You can paste multiple pages one after another!</span>
                            </p>
                        </div>

                        <div
                            id="magic-import-box"
                            contentEditable={true}
                            onInput={(e) => {
                                const html = (e.target as HTMLDivElement).innerHTML;
                                const links = [...html.matchAll(/href=["'][^"']+threads\/[^"']+["']/g)];
                                setDraftCount(links.length);
                            }}
                            style={{
                                width: '100%',
                                height: '250px',
                                padding: '1.5rem',
                                borderRadius: '16px',
                                background: '#000',
                                border: '1px solid #333',
                                color: '#00c3ff',
                                fontFamily: 'monospace',
                                marginBottom: '1.5rem',
                                fontSize: '0.8rem',
                                overflowY: 'auto'
                            }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                📑 Currently detected: <b style={{ color: '#00c3ff' }}>{draftCount}</b> listings in paste buffer.
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setShowImport(false)} className="btn btn-outline">Cancel</button>
                                <button
                                    onClick={handleBulkImport}
                                    className="btn btn-primary"
                                    style={{ background: '#00c3ff', color: '#000', fontWeight: 'bold' }}
                                    disabled={loading || draftCount === 0}
                                >
                                    {loading ? 'SYNCING...' : '⚡ IMPORT TO DATABASE'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
