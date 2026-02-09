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
                // If the URL provided is the thread URL, we might need to construct the bump URL.
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

    // MAGIC SYNC: Handle pasting rich text (HTML) to get links
    const handleBulkImport = async () => {
        const importBox = document.getElementById('magic-import-box');
        if (!importBox) {
            modernAlert("Error: Import box not found. Please refresh.");
            return;
        }

        const htmlContent = importBox.innerHTML;
        const textContent = importBox.innerText;

        // Regex to match hrefs that point to threads
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
                title = slugMatch[1].replace(/-/g, ' ');
                title = title.replace(/\b\w/g, l => l.toUpperCase());
            }

            parsedListings.push({ title, url: urlPath });
        });

        // Fallback for plain text
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
            modernAlert("No PlayerUp threads found! \n\nMake sure to:\n1. Copy the entries from PlayerUp (Ctrl+A, Ctrl+C)\n2. Paste them here directly.");
            return;
        }

        // Delay slightly to ensure UI is ready
        await new Promise(r => setTimeout(r, 50));

        if (!(await modernConfirm(`🪄 Magic Sync found ${parsedListings.length} threads! Import them now?`))) return;

        // Show loading state
        setLoading(true); // Disable buttons
        const originalContent = importBox.innerHTML;
        importBox.innerHTML = '<div style="color: #00c3ff; font-family: monospace; text-align: center; padding: 2rem;">⚡ Syncing with database... please wait...</div>';

        try {
            const res = await fetch('/api/admin/playerup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bulk_import', listings: parsedListings })
            });

            if (res.ok) {
                const data = await res.json();
                modernAlert(`✅ Sync Complete!`, `Successfully imported ${data.count} threads.`);
                importBox.innerHTML = '';
                setShowImport(false);
                fetchListings(); // This will reset loading=false eventually
            } else {
                throw new Error("Server responded with error");
            }
        } catch (e) {
            console.error(e);
            importBox.innerHTML = originalContent;
            modernAlert("Import failed", "Something went wrong. Check console for details.");
            setLoading(false); // Re-enable on error
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
                    <button onClick={() => setShowImport(true)} className="btn btn-primary" style={{ background: 'linear-gradient(45deg, #00c3ff, #0088cc)', border: 'none' }}>
                        🪄 Magic Sync
                    </button>
                    <button onClick={() => setShowAdd(true)} className="btn btn-outline">
                        + Manual Add
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>Loading listings...</div>
            ) : listings.length === 0 ? (
                <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '24px', color: '#666', border: '1px dashed #333' }}>
                    No listings found. Use <b>Magic Sync</b> to import your threads automatically.
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
                                    <span style={{ color: l.lastBumped ? '#00ff88' : '#666' }}>
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
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px', width: '600px', maxWidth: '90vw', border: '1px solid #00c3ff' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#00c3ff' }}>🪄 Magic Sync (Auto-Import)</h3>
                        <div style={{ background: 'rgba(0,195,255,0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(0,195,255,0.2)' }}>
                            <p style={{ fontSize: '0.9rem', color: '#fff', margin: 0, lineHeight: '1.5' }}>
                                <b>Instructions:</b><br />
                                1. Go to <a href="https://www.playerup.com/account/threads" target="_blank" style={{ color: '#00c3ff' }}>Your Threads</a> page.<br />
                                2. Select everything (Ctrl + A) and Copy (Ctrl + C).<br />
                                3. Click the box below and Paste (Ctrl + V).<br />
                                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>(We'll auto-extract the hidden links!)</span>
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
                                <span style={{ color: '#888' }}>Why no auto-login?</span> PlayerUp uses Cloudflare security which blocks server bots. <b>Magic Sync</b> is the safest way to import your data without getting blocked.
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowImport(false)} className="btn btn-outline" disabled={loading}>Cancel</button>
                                <button type="button" onClick={handleBulkImport} className="btn btn-primary" style={{ background: '#00c3ff', color: '#000', fontWeight: 'bold', opacity: loading ? 0.5 : 1 }} disabled={loading}>
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
