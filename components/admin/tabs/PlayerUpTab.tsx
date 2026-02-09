
"use client";

import { useState, useEffect } from 'react';
import { modernAlert, modernConfirm, modernPrompt } from '@/components/ModernUIOverlay';

interface Listing {
    id: string;
    title: string;
    url: string;
    lastBumped: string | null;
    createdAt: string;
}

export default function PlayerUpTab() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newListing, setNewListing] = useState({ title: '', url: '' });
    const [importData, setImportData] = useState('');
    const [showImport, setShowImport] = useState(false);

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

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListing.title || !newListing.url) {
            modernAlert("Please provide both Title and URL");
            return;
        }

        try {
            const res = await fetch('/api/admin/playerup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'add', listing: newListing })
            });
            if (res.ok) {
                modernAlert("Listing Added Successfully");
                setShowAdd(false);
                setNewListing({ title: '', url: '' });
                fetchListings();
            }
        } catch (e) {
            modernAlert("Failed to add listing");
        }
    };

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
        // Optimistically update UI
        try {
            // Open the bump URL in a new tab
            let bumpUrl = listing.url;
            if (!bumpUrl.endsWith('/up')) {
                // If it's a thread URL, append /up if it doesn't have it.
                // Assuming standard PlayerUp structure, usually it's thread_url/up or similar action.
                // However, user provided: ...threads/....6707365/up
                // If the URL provided is the thread URL, we might need to construct the bump URL.
                // If it already has /up, use it.
                if (bumpUrl.endsWith('/')) bumpUrl += 'up';
                else bumpUrl += '/up';
            }

            window.open(bumpUrl, '_blank');

            // Update timestamp in backend
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
        if (!importData) return;

        // Smart Regex to find all PlayerUp thread URLs in ANY pasted text
        // Matches: playerup.com/threads/some-title.12345/
        const regex = /playerup\.com\/threads\/([^\/]+)\/?/g;
        const matches = [...importData.matchAll(regex)];

        if (matches.length === 0) {
            modernAlert("No PlayerUp thread URLs found. \n\nTip: Go to your 'Your Threads' page on PlayerUp, press Ctrl+A then Ctrl+C, then paste EVERYTHING here.");
            return;
        }

        const parsedListings: any[] = [];
        const uniqueUrls = new Set();

        matches.forEach(match => {
            const urlPath = match[0]; // playerup.com/threads/title.123/
            const fullUrl = `https://www.${urlPath.replace('www.', '')}`;

            if (uniqueUrls.has(fullUrl)) return;
            uniqueUrls.add(fullUrl);

            // Extract Title from URL (heuristic)
            // match[1] is "title-slug.123456"
            let titleSlug = match[1].split('.')[0]; // remove .123456
            let title = titleSlug.replace(/-/g, ' '); // replace dashes with spaces
            // Capitalize
            title = title.replace(/\b\w/g, l => l.toUpperCase());

            parsedListings.push({
                title: title,
                url: fullUrl
            });
        });

        if (parsedListings.length === 0) return;

        if (!(await modernConfirm(`🪄 Magic Sync found ${parsedListings.length} threads! Import them now?`))) return;

        try {
            const res = await fetch('/api/admin/playerup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bulk_import', listings: parsedListings })
            });
            if (res.ok) {
                modernAlert(`✅ Successfully syncronized ${parsedListings.length} listings!`);
                setImportData('');
                setShowImport(false);
                fetchListings();
            }
        } catch (e) {
            modernAlert("Import failed");
        }
    };

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
                    <p style={{ color: '#888', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Manage and bump your PlayerUp listings efficiently.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setShowImport(true)} className="btn btn-outline" style={{ borderColor: '#00c3ff', color: '#00c3ff' }}>
                        🪄 Magic Sync
                    </button>
                    <button onClick={() => setShowAdd(true)} className="btn btn-primary">
                        + Add Manually
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>Loading listings...</div>
            ) : listings.length === 0 ? (
                <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '24px', color: '#666', border: '1px dashed #333' }}>
                    No listings found. Add one manually or import from text.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {listings.map(l => (
                        <div key={l.id} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid #1f2937', position: 'relative' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.title}>
                                    {l.title}
                                </h3>
                                <a href={l.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#00c3ff', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {l.url}
                                </a>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                    Last Bumped: <br />
                                    <span style={{ color: l.lastBumped ? '#aaa' : '#666' }}>
                                        {l.lastBumped ? new Date(l.lastBumped).toLocaleString() : 'Never'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleDelete(l.id)}
                                        className="btn btn-outline"
                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#ff4444', borderColor: '#ff444422' }}
                                    >
                                        🗑️
                                    </button>
                                    <button
                                        onClick={() => handleBump(l)}
                                        className="btn btn-primary"
                                        style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: '#00c3ff', color: '#000', border: 'none' }}
                                    >
                                        🚀 Bump
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAdd && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px', width: '400px', maxWidth: '90vw' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Add New Listing</h3>
                        <form onSubmit={handleAdd}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Selling Level 50 Account"
                                    value={newListing.title}
                                    onChange={e => setNewListing({ ...newListing, title: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: '#000', border: '1px solid #333', color: '#fff' }}
                                    autoFocus
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>PlayerUp Thread URL</label>
                                <input
                                    type="text"
                                    placeholder="https://www.playerup.com/threads/..."
                                    value={newListing.url}
                                    onChange={e => setNewListing({ ...newListing, url: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: '#000', border: '1px solid #333', color: '#fff' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowAdd(false)} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Listing</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {showImport && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px', width: '600px', maxWidth: '90vw', border: '1px solid #00c3ff' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#00c3ff' }}>🪄 Magic Sync (Auto-Import)</h3>
                        <div style={{ background: 'rgba(0,195,255,0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(0,195,255,0.2)' }}>
                            <p style={{ fontSize: '0.9rem', color: '#fff', margin: 0, lineHeight: '1.5' }}>
                                1. Open <a href="https://www.playerup.com/account/threads" target="_blank" style={{ color: '#00c3ff' }}>Your Threads</a> on PlayerUp.<br />
                                2. Press <b>Ctrl + A</b> (Select All) then <b>Ctrl + C</b> (Copy).<br />
                                3. Paste EVERYTHING in the box below.<br />
                            </p>
                        </div>
                        <textarea
                            value={importData}
                            onChange={e => setImportData(e.target.value)}
                            placeholder="Paste your copied text here..."
                            style={{ width: '100%', height: '200px', padding: '1rem', borderRadius: '12px', background: '#000', border: '1px solid #333', color: '#fff', fontFamily: 'monospace', marginBottom: '1.5rem', fontSize: '0.8rem' }}
                        />
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setShowImport(false)} className="btn btn-outline">Cancel</button>
                            <button type="button" onClick={handleBulkImport} className="btn btn-primary" style={{ background: '#00c3ff', color: '#000', fontWeight: 'bold' }}>Find Threads</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
