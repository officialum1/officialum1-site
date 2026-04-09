"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function ClientDashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [wallet, setWallet] = useState({ balance: 0, affiliate_earnings: 0 });
    const [verification, setVerification] = useState({ status: 'none' });
    const [formations, setFormations] = useState<any[]>([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('buyer_user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            fetchDashboardData(userData);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchDashboardData = async (userData: any) => {
        try {
            const res = await fetch(`/api/dashboard?userId=${userData.id}&email=${userData.email}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
                setNotifications(data.notifications || []);
                if (data.wallet) setWallet(data.wallet);
                if (data.verification) setVerification(data.verification);
                if (data.formations) setFormations(data.formations);
            }
        } catch (e) {
            console.error("Dashboard Fetch Error", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ background: '#050505', minHeight: '100vh', padding: '120px 20px' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div className="skeleton" style={{ width: '300px', height: '40px', marginBottom: '1rem', background: '#111', borderRadius: '8px' }}></div>
                <div className="skeleton" style={{ width: '500px', height: '20px', marginBottom: '3rem', background: '#111', borderRadius: '4px' }}></div>
                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className="skeleton" style={{ height: '400px', borderRadius: '24px', background: '#111' }}></div>
                    <div className="skeleton" style={{ height: '400px', borderRadius: '24px', background: '#111' }}></div>
                </div>
            </div>
        </div>
    );

    if (!user) return (
        <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', flexDirection: 'column' }}>
            <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🔒</div>
            <h2 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Access Restricted</h2>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Please login to your account to access the buyer dashboard.</p>
            <Link href="/login" className="btn btn-primary" style={{ textDecoration: 'none', padding: '1rem 3rem' }}>Login Now</Link>
        </div>
    );

    return (
        <main style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />

            <div className="dashboard-content" style={{ maxWidth: '1400px', margin: '0 auto', padding: '140px 20px 80px' }}>

                {/* Header Section */}
                <div style={{ marginBottom: '4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <span style={{ padding: '5px 12px', background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {verification.status === 'approved' ? '✓ Verified Pro Account' : 'Standard Buyer'}
                        </span>
                        <span style={{ color: '#444' }}>•</span>
                        <span style={{ color: '#888', fontSize: '12px' }}>Member since 2026</span>
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1.5px', marginBottom: '10px' }}>
                        Welcome back, <span className="text-gradient" style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.2))' }}>{user.email.split('@')[0]}</span>
                    </h1>
                    <p style={{ color: '#888', fontSize: '1.1rem' }}>Manage your digital assets, track deliveries, and top up your wallet.</p>

                    {(user.role === 'seller' || user.role === 'admin') && (
                        <div style={{ marginTop: '20px' }}>
                            <Link href="/dashboard/seller" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 20px', borderRadius: '12px', border: '1px solid #ffd700', color: '#ffd700', textDecoration: 'none', background: 'rgba(255, 215, 0, 0.05)' }}>
                                <span>🛍️</span> Switch to Seller Dashboard
                            </Link>
                        </div>
                    )}
                </div>

                {/* Quick Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>

                    {/* Wallet Stat */}
                    <div className="glass" style={{ padding: '25px', borderRadius: '28px', background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05), transparent)', border: '1px solid rgba(255, 215, 0, 0.15)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <span style={{ color: '#ffd700', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Wallet Balance</span>
                            <span style={{ fontSize: '1.5rem' }}>💳</span>
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>${wallet.balance.toFixed(2)}</div>
                        <div style={{ marginTop: '15px' }}>
                            <Link href="/membership" style={{ color: '#ffd700', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 'bold' }}>+ Top Up Balance</Link>
                        </div>
                    </div>

                    {/* Orders Stat */}
                    <div className="glass" style={{ padding: '25px', borderRadius: '28px', background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.05), transparent)', border: '1px solid rgba(0, 255, 136, 0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <span style={{ color: '#00ff88', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Deliveries</span>
                            <span style={{ fontSize: '1.5rem' }}>🚀</span>
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{orders.length}</div>
                        <div style={{ marginTop: '15px', color: '#888', fontSize: '0.85rem' }}>Total Digital Assets Owned</div>
                    </div>

                    {/* Affiliate Stat */}
                    <div className="glass" style={{ padding: '25px', borderRadius: '28px', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05), transparent)', border: '1px solid rgba(124, 58, 237, 0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <span style={{ color: '#7c3aed', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Referral Rewards</span>
                            <span style={{ fontSize: '1.5rem' }}>🎁</span>
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>${wallet.affiliate_earnings.toFixed(2)}</div>
                        <Link href="/refer" style={{ display: 'block', marginTop: '15px', color: '#7c3aed', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 'bold' }}>Share & Earn commissions</Link>
                    </div>

                </div>

                <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '40px' }}>

                    {/* Main Section: Digital Vault */}
                    <div>
                        {formations.length > 0 && (
                            <div style={{ marginBottom: '3rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px' }}>🏢 Business Formations</h3>
                                </div>
                                <div style={{ display: 'grid', gap: '20px' }}>
                                    {formations.map((f: any) => (
                                        <div key={f.id} className="glass" style={{ padding: '25px', borderRadius: '28px', border: '1px solid #1f2937', background: 'linear-gradient(135deg, #0d1117, #050505)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                    <div style={{ width: '60px', height: '60px', background: 'rgba(0, 255, 136, 0.05)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: '1px solid rgba(0, 255, 136, 0.1)' }}>
                                                        🏢
                                                    </div>
                                                    <div>
                                                        <h4 style={{ fontSize: '1.2rem', margin: '0', fontWeight: 'bold' }}>{f.clientName}</h4>
                                                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>{f.platform}</div>
                                                        <div style={{ fontSize: '0.7rem', color: '#444', marginTop: '4px' }}>Status: <span style={{ color: f.status === 'Completed' ? '#00ff88' : '#ffd700' }}>{f.status}</span></div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    {f.document_link ? (
                                                        <a href={f.document_link} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '10px 20px', textDecoration: 'none' }}>
                                                            📥 Download Documents
                                                        </a>
                                                    ) : (
                                                        <button disabled className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '10px 20px', opacity: 0.5 }}>
                                                            ⏳ Processing...
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px' }}>📦 Digital Vault & Inventory</h3>
                            <Link href="/shop" style={{ fontSize: '0.9rem', color: '#00ff88', textDecoration: 'none', fontWeight: 'bold' }}>Browse Store &rarr;</Link>
                        </div>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            {orders.length === 0 ? (
                                <div className="glass" style={{ padding: '60px', textAlign: 'center', borderRadius: '32px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🛒</div>
                                    <h4 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Your Vault is Empty</h4>
                                    <p style={{ color: '#666', marginBottom: '25px', maxWidth: '400px', margin: '0 auto 25px' }}>You haven't purchased any digital items yet. Explore our premium accounts and services to get started.</p>
                                    <Link href="/shop" className="btn btn-primary" style={{ padding: '12px 35px' }}>Browse Marketplace</Link>
                                </div>
                            ) : orders.map((order: any) => (
                                <div key={order.orderId} className="glass card-hover" style={{ padding: '25px', borderRadius: '28px', border: '1px solid #1f2937', background: '#0d1117' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div style={{ width: '60px', height: '60px', background: '#111', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: '1px solid #1f2937' }}>
                                                🔑
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}>Order #{order.orderId}</div>
                                                <h4 style={{ fontSize: '1.2rem', margin: '4px 0', fontWeight: 'bold' }}>{order.productName || order.productId}</h4>
                                                <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#888' }}>📅 {new Date(order.date).toLocaleDateString()}</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#888' }}>💰 ${order.amount ? parseFloat(order.amount).toFixed(2) : '0.00'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                padding: '6px 15px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                background: order.status === 'completed' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                                                color: order.status === 'completed' ? '#00ff88' : '#ff4444',
                                                marginBottom: '10px',
                                                display: 'inline-block'
                                            }}>
                                                {order.status}
                                            </div>
                                            <div>
                                                <Link href={`/my-orders?id=${order.orderId}`} style={{ color: '#00c3ff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}>View Details </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Sections */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                        {/* Trust & Verification Card */}
                        <div className="glass" style={{ padding: '30px', borderRadius: '32px', border: verification.status === 'approved' ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid rgba(255, 68, 68, 0.2)', background: 'linear-gradient(180deg, #0d1117 0%, transparent 100%)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '1.2rem', fontWeight: '800' }}>🛡️ Trust Identity</h4>
                                <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '10px', background: '#000', color: verification.status === 'approved' ? '#00ff88' : '#ff4444', fontWeight: 'bold' }}>
                                    {verification.status.toUpperCase()}
                                </span>
                            </div>

                            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' }}>
                                <div style={{
                                    width: verification.status === 'approved' ? '100%' : (verification.status === 'pending' ? '70%' : '30%'),
                                    height: '100%',
                                    background: verification.status === 'approved' ? '#00ff88' : (verification.status === 'pending' ? '#ffd700' : '#ff4444'),
                                    boxShadow: `0 0 10px ${verification.status === 'approved' ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 68, 68, 0.3)'}`
                                }}></div>
                            </div>

                            <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.6', marginBottom: '25px' }}>
                                {verification.status === 'approved'
                                    ? "Verified Pro. You have full access to premium assets, instant delivery, and high limits."
                                    : (verification.status === 'pending'
                                        ? "Verification is under review. This usually takes 2-6 hours."
                                        : "Standard account. Verify your identity to unlock higher purchase limits.")}
                            </p>

                            {verification.status === 'none' && (
                                <Link href="/dashboard/verification" className="btn btn-primary" style={{ width: '100%', padding: '12px', textAlign: 'center', borderRadius: '12px', border: '1px solid #00ff88', background: 'transparent', color: '#00ff88' }}>Complete Verification</Link>
                            )}
                            {verification.status === 'pending' && (
                                <div style={{ textAlign: 'center', color: '#ffd700', fontSize: '0.9rem', fontWeight: 'bold' }}>⏳ Reviewing Documents</div>
                            )}
                        </div>

                        {/* Recent Activity / Notifications */}
                        <div className="glass" style={{ padding: '30px', borderRadius: '32px' }}>
                            <h4 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: '800' }}>🔔 Recent Alerts</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {notifications.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#444' }}>
                                        <p style={{ fontSize: '0.85rem' }}>No new notifications.</p>
                                    </div>
                                ) : notifications.map((n: any) => (
                                    <div key={n.id} style={{ display: 'flex', gap: '15px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88', marginTop: '6px' }}></div>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{n.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>{new Date(n.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Support Center */}
                        <div className="glass" style={{ padding: '30px', borderRadius: '32px', background: 'linear-gradient(135deg, rgba(0, 195, 255, 0.05), transparent)' }}>
                            <h4 style={{ marginBottom: '10px', fontWeight: '800' }}>Need Assistance?</h4>
                            <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '20px', lineHeight: '1.6' }}>Our dedicated staff is online 24/7 to help you with your inventory.</p>
                            <Link href="/support" className="btn btn-primary" style={{ width: '100%', padding: '12px', textAlign: 'center', borderRadius: '12px' }}>Open Ticket</Link>
                        </div>

                    </div>

                </div>
            </div>

            <Footer />

            <style jsx>{`
                .card-hover {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .card-hover:hover {
                    transform: translateY(-5px);
                    border-color: rgba(0, 255, 136, 0.3) !important;
                    background: #111827 !important;
                }
                @media (max-width: 1024px) {
                    .dashboard-grid { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 768px) {
                    h1 { font-size: 2.2rem !important; }
                    .dashboard-content { padding-top: 100px !important; }
                }
            `}</style>
        </main>
    );
}
