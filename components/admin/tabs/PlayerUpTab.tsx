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
    const [showAdd, setShowAdd] = useState(false);
    const [newListing, setNewListing] = useState({ title: '', url: '' });
    const [showImport, setShowImport] = useState(false);
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

    const handleShareToMarketing = async (listing: Listing) => {
        const ok = await modernConfirm("Create Social Draft?", `Send this listing to your Marketing Hub as a draft?`);
        if (!ok) return;

        try {
            const res = await fetch('/api/social', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `🚀 NEW LISTING: ${listing.title}\n\nCheck it out here: ${listing.url}\n\n#${listing.platform.toLowerCase()} #DigitalSolutions #OfficialUM1`,
                    platforms: ['All']
                })
            });
            if (res.ok) {
                modernAlert("Success", "Sent to Marketing Hub! You can find it under the 'Marketing' tab.", "success");
            }
        } catch (e) {
            modernAlert("Error", "Failed to share listing.");
        }
    };

    const handleBulkImport = async () => {
        const importBox = document.getElementById('magic-import-box');
        if (!importBox) {
            modernAlert("Error: Import box not found. Please refresh.");
            return;
        }

        const htmlContent = importBox.innerHTML;
        const textContent = importBox.innerText;

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
            const slugMatch = urlPath.match(/threads\/([^\.]+)\./);
            let title = "PlayerUp Listing";
            if (slugMatch) {
                title = slugMatch[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            }
            parsedListings.push({ title, url: urlPath });
        });

        if (matches.length === 0) {
            const textRegex = /playerup\.com\/threads\/([^\s"']+)\/?/g;
            const textMatches = [...textContent.matchAll(textRegex)];
            textMatches.forEach(match => {
                let tempUrl = `https://www.${match[0].replace('www.', '')}`;
                const cleanUrl = tempUrl.split('"')[0].split("'")[0];
                if (!uniqueUrls.has(cleanUrl)) {
                    uniqueUrls.add(cleanUrl);
                    let titleSlug = match[1].split('.')[0];
                    let title = titleSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    parsedListings.push({ title, url: cleanUrl });
                }
            });
        }

        if (parsedListings.length === 0) {
            modernAlert("No PlayerUp threads found! \n\nMake sure to:\n1. Copy from PlayerUp\n2. Paste here.");
            return;
        }

        if (!(await modernConfirm(`🪄 Magic Sync found ${parsedListings.length} threads! Import them now?`))) return;

        setLoading(true);
        const originalContent = importBox.innerHTML;
        importBox.innerHTML = '<div style="color: #00c3ff; font-family: monospace; text-align: center; padding: 2rem;">⚡ Syncing with Database...</div>';

        try {
            const res = await fetch('/api/admin/playerup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bulk_import', listings: parsedListings })
            });
            if (res.ok) {
                const data = await res.json();
                modernAlert(`✅ Sync Complete!`, `Imported ${data.count} threads.`);
                importBox.innerHTML = '';
                setShowImport(false);
                fetchListings();
            } else {
                throw new Error("Server error");
            }
        } catch (e) {
            importBox.innerHTML = originalContent;
            modernAlert("Import failed");
            setLoading(false);
        }
    };

    const filteredListings = activeFilter === 'All'
        ? listings
        : listings.filter(l => l.platform === activeFilter);

    const platforms = ['All', 'Instagram', 'TikTok', 'Facebook', 'Twitter', 'YouTube', 'Discord', 'Telegram', 'Social'];

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
                    <p style={{ color: '#888', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Automate your account bumps and cross-platform promotion.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setShowImport(true)} className="btn btn-primary" style={{ background: 'linear-gradient(45deg, #00c3ff, #0088cc)', border: 'none' }}>
                        🪄 Magic Sync
                    </button>
                </div>
            </div>

            {/* Platform Filter */}
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
                <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>⚡ Syncing database...</div>
            ) : filteredListings.length === 0 ? (
                <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '24px', color: '#666', border: '1px dashed #333' }}>
                    No {activeFilter === 'All' ? '' : activeFilter} threads found.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {filteredListings.map(l => (
                        <div key={l.id} className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid #1f2937', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                                <img src={getPlatformIcon(l.platform)} style={{ width: '24px', height: '24px', borderRadius: '4px', opacity: 0.8 }} alt={l.platform} />
                            </div>

                            <div style={{ marginBottom: '1.2rem', paddingRight: '2.5rem' }}>
                                <div style={{ fontSize: '0.65rem', color: '#00c3ff', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>{l.platform}</div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                                    {l.title}
                                </h3>
                                <a href={l.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#555', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {l.url}
                                </a>
                            </div>

                            <div style={{ background: '#000', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                    Last Bumped: <br />
                                    <span style={{ color: l.lastBumped ? '#00ff88' : '#888', fontWeight: 'bold' }}>
                                        {l.lastBumped ? new Date(l.lastBumped).toLocaleTimeString() : 'Never'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleDelete(l.id)}
                                        style={{ background: '#ff444411', border: '1px solid #ff444422', color: '#ff4444', padding: '5px 8px', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        🗑️
                                    </button>
                                    <button
                                        onClick={() => handleBump(l)}
                                        className="btn-primary"
                                        style={{ background: '#00c3ff', color: '#000', padding: '6px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                                    >
                                        🚀 BUMP
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => handleShareToMarketing(l)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid #222',
                                    color: '#888',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: '0.2s'
                                }}
                            >
                                📢 Share to Marketing Hub
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Import Modal */}
            {showImport && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px', width: '600px', maxWidth: '90vw', border: '1px solid #00c3ff' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#00c3ff' }}>🪄 Magic Sync (Bulk Hub)</h3>
                        <div style={{ background: 'rgba(0,195,255,0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(0,195,255,0.2)' }}>
                            <p style={{ fontSize: '0.85rem', color: '#fff', margin: 0, lineHeight: '1.5' }}>
                                <b>Import Hundreds of Threads:</b><br />
                                1. Go to PlayerUp <a href="https://www.playerup.com/account/threads" target="_blank" style={{ color: '#00c3ff' }}>Your Threads</a>.<br />
                                2. Copy multiple pages if needed (Ctrl+A, Ctrl+C).<br />
                                3. Paste them all below. We'll automatically sort them by <b>Social Platform</b>!<br />
                            </p>
                        </div>

                        <div
                            id="magic-import-box"
                            contentEditable={true}
                            style={{
                                width: '100%',
                                height: '200px',
                                padding: '1rem',
                                borderRadius: '12px',
                                background: '#000',
                                border: '1px solid #333',
                                color: '#ccc',
                                fontFamily: 'monospace',
                                marginBottom: '1.5rem',
                                fontSize: '0.8rem',
                                overflowY: 'auto',
                                whiteSpace: 'pre-wrap'
                            }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: '#555', maxWidth: '60%' }}>
                                <span style={{ color: '#888' }}>Social Wise:</span> We auto-detect Instagram, TikTok, etc. from titles to keep your manager organized.
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowImport(false)} className="btn btn-outline" disabled={loading}>Cancel</button>
                                <button type="button" onClick={handleBulkImport} className="btn btn-primary" style={{ background: '#00c3ff', color: '#000', fontWeight: 'bold' }} disabled={loading}>
                                    {loading ? 'Processing...' : '✨ Start Magic Sync'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
