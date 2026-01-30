"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function UserManager() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!localStorage.getItem('admin_key')) {
            window.location.href = '/admin/login';
            return;
        }
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (Array.isArray(data)) setUsers(data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleAction = async (userId: string, action: 'ban' | 'unban' | 'add_balance') => {
        let amount = 0;
        if (action === 'add_balance') {
            const input = prompt("Enter amount to ADD (e.g. 10.50):");
            if (!input) return;
            amount = parseFloat(input);
        }

        if (!confirm(`Confirm action: ${action.toUpperCase()}?`)) return;

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action, amount })
            });
            const data = await res.json();
            if (data.success) {
                alert("Success!");
                fetchUsers();
            } else {
                alert("Error: " + data.error);
            }
        } catch (e) { alert("Failed"); }
    };

    if (loading) return <div className="container" style={{ paddingTop: '150px' }}>Loading Users...</div>;

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px' }}>
                <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '3rem', marginBottom: '2rem' }}>User Manager 👥</h1>

                <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#888' }}>
                                    <th style={{ padding: '1rem' }}>ID</th>
                                    <th style={{ padding: '1rem' }}>Email</th>
                                    <th style={{ padding: '1rem' }}>Wallet</th>
                                    <th style={{ padding: '1rem' }}>Joined</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>{(u.id || '').toString().substring(0, 8)}...</td>
                                        <td style={{ padding: '1rem' }}>{u.email}</td>
                                        <td style={{ padding: '1rem', color: '#00ff88' }}>${Number(u.wallet_balance || 0).toFixed(2)}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#888' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                                background: u.is_banned ? 'rgba(255,68,68,0.1)' : 'rgba(0,255,136,0.1)',
                                                color: u.is_banned ? '#ff4444' : '#00ff88'
                                            }}>
                                                {u.is_banned ? 'BANNED' : 'Active'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleAction(u.id, 'add_balance')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}>+ $</button>
                                            {u.is_banned ? (
                                                <button onClick={() => handleAction(u.id, 'unban')} className="btn btn-primary" style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem', background: '#00ff88', color: 'black' }}>Unban</button>
                                            ) : (
                                                <button onClick={() => handleAction(u.id, 'ban')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem', borderColor: '#ff4444', color: '#ff4d4d' }}>Ban</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
