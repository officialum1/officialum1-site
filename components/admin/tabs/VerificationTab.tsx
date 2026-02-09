"use client";

import { useState, useEffect } from 'react';
import { modernAlert, modernConfirm, modernPrompt } from '@/components/ModernUIOverlay';

export default function VerificationTab() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [viewImage, setViewImage] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    async function fetchRequests() {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/verification');
            const data = await res.json();
            if (Array.isArray(data)) setRequests(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const handleAction = async (requestId: string, userId: string, status: 'approved' | 'rejected') => {
        let reason = "";
        if (status === 'rejected') {
            reason = await modernPrompt("Reason for rejection:", "Images are blurry") || "";
            if (!reason) return;
        } else {
            if (!(await modernConfirm("Approve this user's identity?"))) return;
        }

        try {
            const res = await fetch('/api/admin/verification', {
                method: 'POST',
                body: JSON.stringify({ requestId, userId, status, reason })
            });
            if (res.ok) {
                modernAlert(`User verification ${status}`);
                fetchRequests();
            }
        } catch (e) {
            modernAlert("Action failed");
        }
    };

    const filtered = requests.filter(r => filter === 'all' ? true : r.status === filter);

    return (
        <div className="FadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        🛡️ Trust & Verification
                        <span style={{ fontSize: '0.8rem', background: '#ff444422', color: '#ff4444', padding: '2px 8px', borderRadius: '4px' }}>
                            {requests.filter(r => r.status === 'pending').length} Pending
                        </span>
                    </h2>
                    <p style={{ color: '#888', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Review identity documents and selfies for Buyer Verification.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '12px' }}>
                    {['pending', 'approved', 'rejected', 'all'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', textTransform: 'capitalize' }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>Fetching security requests...</div>
            ) : filtered.length === 0 ? (
                <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '24px', color: '#666', border: '1px dashed #333' }}>
                    No verification requests found for this filter.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {filtered.map(req => (
                        <div key={req.id} className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid #1f2937' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr', gap: '2rem', alignItems: 'center' }}>

                                {/* User Info */}
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>
                                        Trust Identity - {req.user_tier || 'Bronze'}
                                    </div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', margin: '5px 0' }}>{req.user_email}</div>
                                    {req.user_username && <div style={{ fontSize: '0.9rem', color: '#888' }}>@{req.user_username}</div>}
                                    <div style={{ fontSize: '0.8rem', color: '#444', marginTop: '5px' }}>Submitted: {new Date(req.created_at).toLocaleString()}</div>
                                    <div style={{ marginTop: '10px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '8px',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            background: req.status === 'approved' ? 'rgba(0,255,136,0.1)' : (req.status === 'pending' ? 'rgba(255,215,0,0.1)' : 'rgba(255,68,68,0.1)'),
                                            color: req.status === 'approved' ? '#00ff88' : (req.status === 'pending' ? '#ffd700' : '#ff4444')
                                        }}>
                                            {req.status === 'pending' ? 'UNDER REVIEW' : req.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* ID Document */}
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '10px' }}>IDENTITY CARD</div>
                                    {req.document_image ? (
                                        <div onClick={() => setViewImage(req.document_image)} style={{ cursor: 'pointer' }}>
                                            <img src={req.document_image} alt="ID" style={{ height: '80px', borderRadius: '12px', border: '1px solid #333' }} title="Click to enlarge" />
                                        </div>
                                    ) : <div style={{ color: '#333' }}>N/A</div>}
                                </div>

                                {/* Selfie */}
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '10px' }}>SELFIE MATCH</div>
                                    {req.selfie_image ? (
                                        <div onClick={() => setViewImage(req.selfie_image)} style={{ cursor: 'pointer' }}>
                                            <img src={req.selfie_image} alt="Selfie" style={{ height: '80px', borderRadius: '12px', border: '1px solid #333' }} title="Click to enlarge" />
                                        </div>
                                    ) : <div style={{ color: '#333' }}>N/A</div>}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {req.status === 'pending' ? (
                                        <>
                                            <button onClick={() => handleAction(req.id, req.user_id, 'approved')} className="btn btn-primary" style={{ background: '#00ff88', color: '#000', border: 'none' }}>Approve User</button>
                                            <button onClick={() => handleAction(req.id, req.user_id, 'rejected')} className="btn btn-outline" style={{ color: '#ff4444', borderColor: '#ff444422' }}>Decline</button>
                                        </>
                                    ) : (
                                        <div style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
                                            {req.status === 'rejected' && <div style={{ color: '#ff4444', marginBottom: '5px' }}>Reason: {req.rejection_reason}</div>}
                                            Closed
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

{/* Image Viewer Modal */ }
{
    viewImage && (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: 'rgba(0,0,0,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
            }}
            onClick={() => setViewImage(null)}
        >
            <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
                <img
                    src={viewImage}
                    alt="Full View"
                    style={{
                        maxWidth: '100%',
                        maxHeight: '90vh',
                        borderRadius: '8px',
                        boxShadow: '0 0 50px rgba(0,0,0,0.5)',
                        objectFit: 'contain'
                    }}
                />
                <button
                    onClick={() => setViewImage(null)}
                    style={{
                        position: 'absolute',
                        top: '-40px',
                        right: '-40px',
                        background: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        color: 'black',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    ✕
                </button>
            </div>
        </div>
    )
}
        </div >
    );
}
