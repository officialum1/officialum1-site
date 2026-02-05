"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ClientDashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [wallet, setWallet] = useState({ balance: 0, affiliate_earnings: 0 });

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
                <div className="skeleton" style={{ width: '300px', height: '40px', marginBottom: '1rem' }}></div>
                <div className="skeleton" style={{ width: '500px', height: '20px', marginBottom: '3rem' }}></div>
                <div className="grid-2">
                    <div className="skeleton" style={{ height: '400px', borderRadius: '24px' }}></div>
                    <div className="skeleton" style={{ height: '400px', borderRadius: '24px' }}></div>
                </div>
            </div>
        </div>
    );

    if (!user) return (
        <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', flexDirection: 'column' }}>
            <h2 style={{ marginBottom: '1rem' }}>Please Login to View Progress</h2>
            <a href="/login.html" className="btn btn-primary" style={{ textDecoration: 'none' }}>Go to Login</a>
        </div>
    );

    return (
        <main style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />
            <div className="container-main" style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 20px 60px' }}>

                {/* Header Section */}
                <div style={{ marginBottom: '3rem', borderLeft: '4px solid #00ff88', paddingLeft: '1.5rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Welcome back, <span className="text-gradient">{user.email.split('@')[0]}</span></h1>
                    <p style={{ color: '#888', marginTop: '0.5rem' }}>Track your project progress and view recent updates in real-time.</p>
                </div>

                <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>

                    {/* Active Projects */}
                    <div>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            🚀 Active Projects & Orders
                        </h3>
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {orders.length === 0 ? (
                                <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '24px' }}>
                                    <p style={{ color: '#666' }}>No active projects found. Ready to start something new?</p>
                                    <a href="/#services" className="btn btn-outline" style={{ marginTop: '1rem', display: 'inline-block' }}>Explore Services</a>
                                </div>
                            ) : orders.map((order: any) => (
                                <div key={order.orderId} className="glass" style={{ padding: '2rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Order #{order.orderId}</div>
                                            <h4 style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>{order.productId}</h4>
                                        </div>
                                        <div style={{
                                            padding: '5px 15px',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            background: order.status === 'paid' ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.05)',
                                            color: order.status === 'paid' ? '#00ff88' : '#888'
                                        }}>
                                            {order.status.toUpperCase()}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div style={{ marginTop: '2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
                                            <span style={{ color: '#888' }}>Current Progress</span>
                                            <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{order.progress_percent || 0}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${order.progress_percent || 0}%`,
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #00ff88, #00ccff)',
                                                boxShadow: '0 0 10px rgba(0,255,136,0.5)'
                                            }} />
                                        </div>
                                    </div>

                                    {order.report_link && (
                                        <a
                                            href={order.report_link}
                                            target="_blank"
                                            style={{
                                                marginTop: '1.5rem',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                color: '#00ccff',
                                                textDecoration: 'none',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            📄 View Delivery Report
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notifications & Support */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Custom Wallet Card */}
                        <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(255,215,0,0.1), transparent)', border: '1px solid rgba(255,215,0,0.3)' }}>
                            <h4 style={{ marginBottom: '0.5rem', color: '#ffd700', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>💰 Wallet Balance</h4>
                            <div className="wallet-amt" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>${wallet.balance.toFixed(2)}</div>
                            <p style={{ color: '#ccc', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: '1.4' }}>
                                Available Store Credit.<br />
                                <span style={{ color: '#00ff88', fontSize: '0.8rem' }}>Lifetime Earnings: ${wallet.affiliate_earnings.toFixed(2)}</span>
                            </p>
                            <a href="/shop" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', background: '#ffd700', color: '#000', fontWeight: 'bold', textAlign: 'center', display: 'block' }}>Shop Now</a>
                        </div>

                        <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                            <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>🔔 Notifications</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {notifications.length === 0 ? (
                                    <p style={{ color: '#444', fontSize: '0.9rem' }}>No new notifications.</p>
                                ) : notifications.map((n: any) => (
                                    <div key={n.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
                                        <div style={{ fontSize: '0.9rem', color: '#fff' }}>{n.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>{new Date(n.created_at).toLocaleDateString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(0, 195, 255, 0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '1.1rem' }}>🛡️ Trust Score</h4>
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>Level 1</span>
                            </div>
                            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '1.5rem' }}>
                                <div style={{ width: '30%', height: '100%', background: '#00c3ff' }}></div>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1.5rem' }}>Verify your identity to increase limits and unlock "Pro" account features.</p>
                            <a href="/dashboard/verification" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', display: 'block', background: 'rgba(0,195,255,0.1)', color: '#00c3ff', border: '1px solid #00c3ff' }}>Verify Identity</a>
                        </div>

                        <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(0,255,136,0.05), transparent)' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Need Assistance?</h4>
                            <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1.5rem' }}>Our team is available 24/7 for project updates and support.</p>
                            <a href="/support" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>Open Support Ticket</a>
                        </div>
                    </div>

                </div>
            </div>
            <Footer />
            <style jsx>{`
                @media (max-width: 968px) {
                    .container-main { padding-top: 100px !important; }
                    .dashboard-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
                    h1 { font-size: 1.8rem !important; }
                    .glass { padding: 1.5rem !important; }
                }
                @media (max-width: 480px) {
                    h1 { font-size: 1.5rem !important; }
                    .wallet-amt { font-size: 2rem !important; }
                    .btn { padding: 0.8rem !important; font-size: 0.85rem !important; }
                }
            `}</style>
        </main>
    );
}
