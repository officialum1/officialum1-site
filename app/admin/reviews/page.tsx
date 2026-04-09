"use client";

import { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import { AdminShell } from '@/components/admin/AdminShell';

export default function ReviewsManager() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        const res = await fetch('/api/admin/reviews');
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
        setLoading(false);
    };

    const handleAction = async (reviewId: number, action: string) => {
        if (!confirm(`Are you sure you want to ${action} this review?`)) return;
        try {
            await fetch('/api/admin/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId, action })
            });
            fetchReviews();
        } catch (e) { alert('Action failed'); }
    };

    if (loading) return <div className="container" style={{ paddingTop: '150px' }}>Loading Reviews...</div>;

    return (
        <AdminShell title="Reviews" subtitle="Moderate customer reviews across products.">
            <a href="/admin/dashboard" className="btn-ghost" style={{ marginBottom: '1rem', display: 'inline-flex' }}>← Back to Dashboard</a>

            <div className="card" style={{ padding: '1.5rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #333', color: '#888' }}>
                                <th style={{ padding: '1rem' }}>Product</th>
                                <th style={{ padding: '1rem' }}>User</th>
                                <th style={{ padding: '1rem' }}>Rating</th>
                                <th style={{ padding: '1rem' }}>Comment</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map(r => (
                                <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>{r.product_name || `ID: ${r.product_id}`}</td>
                                    <td style={{ padding: '1rem' }}>{r.user_email}</td>
                                    <td style={{ padding: '1rem', color: '#ffd700' }}>{'★'.repeat(r.rating)}</td>
                                    <td style={{ padding: '1rem', maxWidth: '300px' }}>{r.comment}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                            background: r.status === 'approved' ? 'rgba(0,255,136,0.1)' : r.status === 'rejected' ? 'rgba(255,68,68,0.1)' : 'rgba(255, 170, 0, 0.1)',
                                            color: r.status === 'approved' ? '#00ff88' : r.status === 'rejected' ? '#ff4444' : '#ffaa00'
                                        }}>
                                            {r.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        {r.status !== 'approved' && (
                                            <button onClick={() => handleAction(r.id, 'approve')} className="btn-primary" style={{ padding: '0.45rem 0.7rem', fontSize: '0.8rem' }}>Approve</button>
                                        )}
                                        {r.status !== 'rejected' && (
                                            <button onClick={() => handleAction(r.id, 'reject')} className="btn-secondary" style={{ padding: '0.45rem 0.7rem', fontSize: '0.8rem' }}>Reject</button>
                                        )}
                                        <button onClick={() => handleAction(r.id, 'delete')} className="btn-ghost" style={{ padding: '0.45rem 0.7rem', fontSize: '0.8rem', color: '#b91c1c' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {reviews.length === 0 && <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>No reviews found.</p>}
                </div>
            <Footer />
        </AdminShell>
    );
}
