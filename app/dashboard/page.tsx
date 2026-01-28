"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DailyBonus from '@/components/DailyBonus';
import WalletCard from '@/components/WalletCard';
import DepositModal from '@/components/DepositModal';
import Link from 'next/link';

export default function UserDashboard() {
    const [user, setUser] = useState<any>(null);
    const [balance, setBalance] = useState(0);
    const [referralCode, setReferralCode] = useState('');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeposit, setShowDeposit] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('buyer_user');
        if (!storedUser) {
            window.location.href = '/login';
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        fetchWallet(parsedUser.id);
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

    if (loading) return <div style={{ minHeight: '100vh', background: '#050505', color: 'white' }}>Loading...</div>;

    return (
        <main style={{ minHeight: '100vh', background: '#050505', backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(79, 70, 229, 0.1) 0%, transparent 40%)' }}>
            <Navbar />

            <DepositModal
                isOpen={showDeposit}
                onClose={() => setShowDeposit(false)}
                userId={user?.id}
                onSuccess={() => fetchWallet(user.id)}
            />

            <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>

                {/* Header */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ marginBottom: '0.2rem', fontSize: '2.5rem' }}>Dashboard</h1>
                        <p style={{ color: '#888' }}>Welcome back, <span style={{ color: 'white', fontWeight: 'bold' }}>{user?.email?.split('@')[0]}</span> 👋</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <a href="/support" className="btn btn-outline" style={{ fontSize: '0.9rem' }}>Support</a>
                        <button onClick={() => { localStorage.removeItem('buyer_user'); window.location.href = '/login'; }} className="btn btn-outline" style={{ color: '#ff4444', borderColor: '#ff4444', fontSize: '0.9rem' }}>Logout</button>
                    </div>
                </div>

                {/* Main Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.5fr', gap: '2rem' }} className="dashboard-grid">

                    {/* Left Column: Wallet & Transactions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* 1. Wallet & Quick Daily */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            <WalletCard balance={balance} onDeposit={() => setShowDeposit(true)} />
                            <div className="glass" style={{ borderRadius: '24px', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <DailyBonus /> {/* Reusing the component, fits nicely inside */}
                            </div>
                        </div>

                        {/* 2. Recent Transactions */}
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                                <h3>Recent Activity</h3>
                                <button onClick={() => fetchWallet(user.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>🔄</button>
                            </div>

                            {transactions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧊</div>
                                    No transactions yet. Add funds to get started!
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {transactions.map((t: any) => (
                                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                                                    background: t.type === 'deposit' ? 'rgba(0,255,136,0.1)' : t.type === 'purchase' ? 'rgba(255,68,68,0.1)' : 'rgba(255,170,0,0.1)',
                                                    color: t.type === 'deposit' ? '#00ff88' : t.type === 'purchase' ? '#ff4444' : '#ffaa00'
                                                }}>
                                                    {t.type === 'deposit' ? '↓' : t.type === 'purchase' ? '↑' : '★'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: '#fff' }}>{t.description || t.type.toUpperCase()}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(t.created_at).toLocaleDateString()} • {new Date(t.created_at).toLocaleTimeString()}</div>
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: 'bold', color: t.amount > 0 ? '#00ff88' : '#ff4444' }}>
                                                {t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Right Column: Affiliate & Quick Links */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Affiliate Card */}
                        <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(255,215,0,0.05) 0%, rgba(0,0,0,0.2) 100%)', border: '1px solid rgba(255,215,0,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3 style={{ color: '#ccc', fontSize: '1rem' }}>Affiliate Earnings</h3>
                                <Link href="/refer" style={{ fontSize: '0.8rem', color: '#ffd700', textDecoration: 'underline' }}>View Details</Link>
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ffd700', marginBottom: '0.5rem' }}>
                                ${Number(user?.affiliate_balance || 0).toFixed(2)}
                            </h2>
                            <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.8rem' }}>Lifetime Earned: ${Number(user?.total_affiliate_earnings || 0).toFixed(2)}</p>

                            <button
                                onClick={async () => {
                                    if (Number(user?.affiliate_balance || 0) <= 0) return;
                                    const confirmConvert = confirm("Convert affiliate earnings to wallet balance?");
                                    if (confirmConvert) {
                                        const res = await fetch('/api/user/wallet/convert', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ userId: user.id, amount: Number(user.affiliate_balance) })
                                        });
                                        if (res.ok) {
                                            alert("Converted successfully!");
                                            fetchWallet(user.id);
                                        }
                                    }
                                }}
                                disabled={Number(user?.affiliate_balance || 0) <= 0}
                                className="btn"
                                style={{ width: '100%', background: 'rgba(255,215,0,0.1)', color: '#ffd700', border: '1px solid rgba(255,215,0,0.3)', fontSize: '0.9rem' }}
                            >
                                🔄 Convert to Balance
                            </button>
                        </div>

                        {/* Quick Links */}
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#ccc' }}>Quick Actions</h3>
                            <div style={{ display: 'grid', gap: '0.8rem' }}>
                                <Link href="/shop" className="btn btn-outline" style={{ textAlign: 'left', border: '1px solid rgba(255,255,255,0.05)', color: '#ccc' }}>🛍️ Browse Shop</Link>
                                <Link href="/my-orders" className="btn btn-outline" style={{ textAlign: 'left', border: '1px solid rgba(255,255,255,0.05)', color: '#ccc' }}>📦 My Orders</Link>
                                <Link href="/help" className="btn btn-outline" style={{ textAlign: 'left', border: '1px solid rgba(255,255,255,0.05)', color: '#ccc' }}>❓ Help Center</Link>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
            <Footer />
            <style jsx>{`
                @media (max-width: 900px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </main>
    );
}
