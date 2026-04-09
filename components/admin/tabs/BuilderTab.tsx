"use client";

import { useState, useEffect } from 'react';
import { modernAlert, modernConfirm } from '@/components/ModernUIOverlay';

export default function BuilderTab() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/admin/builder');
            const data = await res.json();
            if (Array.isArray(data)) setRequests(data);
        } catch (e) {
            console.error("Failed to fetch builder requests", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            const res = await fetch('/api/admin/builder', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });

            if (res.ok) {
                modernAlert(`Request marked as ${newStatus}`);
                fetchRequests();
            }
        } catch (e) {
            modernAlert("Failed to update status");
        }
    };

    const pinnedRequests = requests.filter(r => {
        if (filter === 'all') return true;
        return r.status === filter;
    });

    if (loading) return <div className="text-center py-10">Loading Requests...</div>;

    return (
        <div className="FadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontFamily: 'var(--font-outfit)' }}>🛠️ Account Builder Requests</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['all', 'pending', 'completed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'}`}
                            style={{ padding: '0.4rem 1.2rem', fontSize: '0.8rem', textTransform: 'capitalize' }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {pinnedRequests.map((req: any) => (
                    <div key={req.id} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: `4px solid ${req.status === 'completed' ? '#00ff88' : '#3b82f6'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{new Date(req.created_at).toLocaleString()}</div>
                                <h4 style={{ margin: 0, color: '#fff' }}>{req.platform} - {req.niche}</h4>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#00ff88' }}>${req.budget}</div>
                                <div style={{ fontSize: '0.7rem', color: '#888' }}>BUDGET</div>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.5rem' }}>REQUIREMENTS:</div>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#eee', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{req.requirements}</p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.85rem', color: '#888' }}>
                                USER ID: <span style={{ color: '#ccc' }}>{req.user_id}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                {req.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusChange(req.id, 'completed')}
                                            className="btn btn-primary"
                                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                                        >
                                            Mark Completed
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (await modernConfirm("Reject this request?")) {
                                                    handleStatusChange(req.id, 'rejected');
                                                }
                                            }}
                                            className="btn btn-outline"
                                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: '#ff4d4d', borderColor: 'rgba(255,77,77,0.2)' }}
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {req.status !== 'pending' && (
                                    <span style={{ color: req.status === 'completed' ? '#00ff88' : '#ff4d4d', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                                        {req.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {pinnedRequests.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '5rem', color: '#666', border: '1px dashed #333', borderRadius: '24px' }}>
                        No builder requests found.
                    </div>
                )}
            </div>
        </div>
    );
}
