"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function UserDashboard() { // Renamed from AdminDashboard to UserDashboard logic
    const [user, setUser] = useState<any>(null);
    const [balance, setBalance] = useState(0);
    const [referralCode, setReferralCode] = useState('');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [depositAmount, setDepositAmount] = useState('');
    const [isDepositing, setIsDepositing] = useState(false);

    useEffect(() => {
        // 1. Get User from LocalStorage (Mock Session)
        const storedUser = localStorage.getItem('buyer_user');
        if (!storedUser) {
            window.location.href = '/login';
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // 2. Fetch Wallet Data
        fetchWallet(parsedUser.id);

        // 3. Fetch Orders history (Optional)
        // fetchOrders(parsedUser.id);

        setLoading(false);
    }, []);

    const fetchWallet = async (userId: string) => {
        try {
            const res = await fetch(`/api/user/wallet?userId=${userId}`);
            const data = await res.json();
            if (data.balance !== undefined) {
                setBalance(data.balance);
                setReferralCode(data.referralCode);
                setTransactions(data.transactions);
            }
        } catch (e) {
            console.error("Failed to fetch wallet");
        }
    };

    const handleDeposit = async () => {
        if (!depositAmount || parseFloat(depositAmount) <= 0) return;
        setIsDepositing(true);
        try {
            // For MVP, we simulate a direct "Admin Deposit" or "Test Deposit"
            // In production, this would redirect to Stripe/Crypto Checkout calling a deposit API
            await fetch('/api/user/wallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, amount: depositAmount, source: 'Admin Test' })
            });

            alert('Deposit Successful (Test Mode)');
            setDepositAmount('');
            fetchWallet(user.id);
        } catch (e) {
            alert('Deposit Failed');
        } finally {
            setIsDepositing(false);
        }
    };

    if (loading) return <div style={{ minHeight: '100vh', background: '#000', color: 'white' }}>Loading...</div>;

    return (
        <main style={{ minHeight: '100vh', background: '#050505' }}>
            <Navbar />
            <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ marginBottom: '0.5rem' }}>My Dashboard</h1>
                        <p style={{ color: '#888' }}>Welcome back, {user?.email}</p>
                    </div>
                    <button onClick={() => { localStorage.removeItem('buyer_user'); window.location.href = '/login'; }} className="btn btn-outline" style={{ color: '#ff4444', borderColor: '#ff4444' }}>Logout</button>
                </div>

                {/* GRID LAYOUT */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                    {/* 1. Wallet Card */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(0,255,136,0.05) 0%, rgba(0,0,0,0.2) 100%)', border: '1px solid rgba(0,255,136,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ color: '#ccc' }}>Wallet Balance</h3>
                            <span style={{ fontSize: '1.5rem' }}>💳</span>
                        </div>
                        <h2 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#00ff88', marginBottom: '1.5rem' }}>
                            ${Number(balance).toFixed(2)}
                        </h2>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                type="number"
                                placeholder="Amount ($)"
                                value={depositAmount}
                                onChange={e => setDepositAmount(e.target.value)}
                                className="input-field"
                                style={{ flex: 1 }}
                            />
                            <button onClick={handleDeposit} disabled={isDepositing} className="btn btn-primary" style={{ minWidth: '120px' }}>
                                {isDepositing ? '...' : '+ Deposit'}
                            </button>
                        </div>
                    </div>

                    {/* 2. Affiliate Card */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(255,215,0,0.05) 0%, rgba(0,0,0,0.2) 100%)', border: '1px solid rgba(255,215,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ color: '#ccc' }}>Affiliate Earnings</h3>
                            <span style={{ fontSize: '1.5rem' }}>📈</span>
                        </div>
                        <h2 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#ffd700', marginBottom: '0.5rem' }}>
                            ${Number(user?.affiliate_balance || 0).toFixed(2)}
                        </h2>
                        <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Total Earned: ${Number(user?.total_affiliate_earnings || 0).toFixed(2)}</p>

                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px dashed rgba(255,215,0,0.3)' }}>
                            <code style={{ fontSize: '0.9rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '1rem' }}>
                                {typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${referralCode}` : `ref=${referralCode}`}
                            </code>
                            <button
                                onClick={() => {
                                    const link = `${window.location.origin}/register?ref=${referralCode}`;
                                    navigator.clipboard.writeText(link);
                                    alert('Affiliate link copied!');
                                }}
                                style={{ background: 'none', border: 'none', color: '#ffd700', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                COPY
                            </button>
                        </div>
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.8rem' }}>
                            <button
                                onClick={async () => {
                                    const amount = prompt("Amount to convert to wallet balance:", Number(user?.affiliate_balance || 0).toFixed(2));
                                    if (amount && parseFloat(amount) > 0) {
                                        const res = await fetch('/api/user/wallet/convert', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ userId: user.id, amount: parseFloat(amount) })
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                            alert('Successfully converted!');
                                            window.location.reload();
                                        } else {
                                            alert(data.error || 'Conversion failed');
                                        }
                                    }
                                }}
                                disabled={Number(user?.affiliate_balance || 0) <= 0}
                                className="btn btn-outline"
                                style={{ flex: 1, borderColor: '#ffd700', color: '#ffd700', fontSize: '0.85rem', opacity: Number(user?.affiliate_balance || 0) <= 0 ? 0.5 : 1 }}
                            >
                                🔄 Convert to Balance
                            </button>
                        </div>
                        <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666' }}>Share your link and earn commissions on every automated purchase!</p>
                    </div>

                </div>

                {/* Recent Activity / Transactions */}
                <div style={{ marginTop: '3rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Recent Transactions</h3>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                        {transactions.length === 0 ? (
                            <p style={{ color: '#666', textAlign: 'center' }}>No transactions yet.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ccc' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
                                        <th style={{ padding: '1rem' }}>Type</th>
                                        <th style={{ padding: '1rem' }}>Description</th>
                                        <th style={{ padding: '1rem' }}>Amount</th>
                                        <th style={{ padding: '1rem' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((t: any) => (
                                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                                    background: t.type === 'deposit' ? 'rgba(0,255,136,0.1)' : t.type === 'purchase' ? 'rgba(255,68,68,0.1)' : 'rgba(255,255,255,0.1)',
                                                    color: t.type === 'deposit' ? '#00ff88' : t.type === 'purchase' ? '#ff4444' : '#fff'
                                                }}>
                                                    {t.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>{t.description}</td>
                                            <td style={{ padding: '1rem', color: t.amount > 0 ? '#00ff88' : '#ff4444' }}>
                                                {t.amount > 0 ? '+' : ''}${t.amount}
                                            </td>
                                            <td style={{ padding: '1rem', color: '#666', fontSize: '0.9rem' }}>
                                                {new Date(t.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </div>
            <Footer />
        </main>
    );
}
