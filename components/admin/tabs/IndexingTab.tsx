"use client";

import { useState, useEffect } from 'react';
import { modernAlert } from '@/components/ModernUIOverlay';

export default function IndexingTab() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [checkingUrl, setCheckingUrl] = useState<string | null>(null);
    const [statuses, setStatuses] = useState<Record<string, any>>({});
    const [notifyingUrl, setNotifyingUrl] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/indexing');
            const json = await res.json();
            setData(json);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const checkStatus = async (url: string) => {
        setCheckingUrl(url);
        try {
            const res = await fetch(`/api/admin/indexing?url=${encodeURIComponent(url)}`);
            const json = await res.json();
            setStatuses(prev => ({ ...prev, [url]: json }));
        } catch (e) {
            modernAlert("Failed to check status");
        } finally {
            setCheckingUrl(null);
        }
    };

    const notifyGoogle = async (url: string) => {
        setNotifyingUrl(url);
        try {
            const res = await fetch('/api/admin/indexing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            const json = await res.json();
            if (json.success) {
                modernAlert("Google Notified!", "Crawler has been requested.", "success");
            } else {
                modernAlert("Notification Failed", json.error || "Unknown error", "error");
            }
        } catch (e) {
            modernAlert("Failed to notify Google");
        } finally {
            setNotifyingUrl(null);
        }
    };

    const StatusBadge = ({ url }: { url: string }) => {
        const status = statuses[url];
        if (!status) return null;

        const isIndexed = status.indexStatusResult?.verdict === 'PASS';
        const color = isIndexed ? '#00ff88' : '#ff4d4d';
        const text = isIndexed ? 'Indexed' : 'Not Indexed';

        return (
            <div style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', background: `${color}15`, border: `1px solid ${color}33`, color, fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
                {text}
                {status.indexStatusResult?.lastCrawlTime && (
                    <span style={{ opacity: 0.6, fontWeight: 'normal' }}>
                        (Crawled: {new Date(status.indexStatusResult.lastCrawlTime).toLocaleDateString()})
                    </span>
                )}
            </div>
        );
    };

    if (loading) return <div style={{ color: '#888', padding: '2rem' }}>Loading Indexing Data...</div>;

    return (
        <div className="FadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0 }}>🚀 Google Instant Indexing</h2>
                    <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '0.4rem' }}>Manage page visibility and request immediate crawls.</p>
                </div>
                <button onClick={fetchData} className="btn btn-outline">🔄 Refresh List</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Section: Core Pages */}
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>🔗 Core Site Pages</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {data.core.map((item: any) => (
                            <div key={item.url} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.2rem' }}>{item.url}</div>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <StatusBadge url={item.url} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => checkStatus(item.url)}
                                        className="btn btn-outline"
                                        style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}
                                        disabled={checkingUrl === item.url}
                                    >
                                        {checkingUrl === item.url ? 'Checking...' : 'Check Status'}
                                    </button>
                                    <button
                                        onClick={() => notifyGoogle(item.url)}
                                        className="btn btn-primary"
                                        style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}
                                        disabled={notifyingUrl === item.url}
                                    >
                                        {notifyingUrl === item.url ? 'Notifying...' : 'Index Now'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section: Recent Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {['blogs', 'products', 'kb'].map((type: string) => (
                        <div key={type} className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', textTransform: 'capitalize' }}>🆕 Recent {type}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {data.recent[type].map((item: any) => (
                                    <div key={item.url} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', borderRadius: '10px', background: 'rgba(255,255,255,0.01)' }}>
                                        <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '1rem' }}>
                                            <div style={{ fontSize: '0.85rem' }}>{item.title}</div>
                                            <StatusBadge url={item.url} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                            <button
                                                onClick={() => checkStatus(item.url)}
                                                className="btn btn-outline"
                                                style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem' }}
                                                disabled={checkingUrl === item.url}
                                            >
                                                Check
                                            </button>
                                            <button
                                                onClick={() => notifyGoogle(item.url)}
                                                className="btn btn-primary"
                                                style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem' }}
                                                disabled={notifyingUrl === item.url}
                                            >
                                                Index
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {data.recent[type].length === 0 && <p style={{ fontSize: '0.8rem', color: '#666' }}>No recent {type} found.</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
