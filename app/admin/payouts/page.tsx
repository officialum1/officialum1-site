"use client";

import { useState, useEffect } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';

export default function PayoutsAdmin() {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        try {
            const res = await fetch('/api/admin/payouts');
            const data = await res.json();
            if (Array.isArray(data)) setPayouts(data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleAction = async (payoutId: number, action: 'approve' | 'reject') => {
        if (!confirm(`Are you sure you want to ${action.toUpperCase()} this payout?`)) return;
        try {
            const res = await fetch('/api/admin/payouts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payoutId, action })
            });
            if (res.ok) {
                alert("Success!");
                fetchPayouts();
            } else {
                alert("Failed.");
            }
        } catch { alert("Error."); }
    };

    if (loading) return <div className="container" style={{ paddingTop: '150px' }}>Loading Payouts...</div>;

    return (
        <AdminShell title="Payouts" subtitle="Approve or reject affiliate payout requests.">
            <a href="/admin/dashboard" className="btn-ghost" style={{ marginBottom: '1rem', display: 'inline-flex' }}>← Back to Dashboard</a>

            <div className="card" style={{ padding: '1.5rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#888' }}>
                                <th style={{ padding: '1rem' }}>ID</th>
                                <th style={{ padding: '1rem' }}>User Email</th>
                                <th style={{ padding: '1rem' }}>Amount</th>
                                <th style={{ padding: '1rem' }}>Method - Details</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payouts.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>#{p.id}</td>
                                    <td style={{ padding: '1rem' }}>{p.email}</td>
                                    <td style={{ padding: '1rem', color: '#00ff88', fontWeight: 'bold' }}>${p.amount}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold' }}>{p.method}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#ccc' }}>{p.details}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                            background: p.status === 'approved' ? 'rgba(0,255,136,0.1)' : p.status === 'rejected' ? 'rgba(255,68,68,0.1)' : 'rgba(255,170,0,0.1)',
                                            color: p.status === 'approved' ? '#00ff88' : p.status === 'rejected' ? '#ff4444' : '#ffaa00'
                                        }}>
                                            {p.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {p.status === 'pending' && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleAction(p.id, 'approve')} className="btn btn-primary" style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}>Approve</button>
                                                <button onClick={() => handleAction(p.id, 'reject')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem', borderColor: '#ff4444', color: '#ff4d4d' }}>Reject</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {payouts.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No payout requests found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
        </AdminShell>
    );
}
