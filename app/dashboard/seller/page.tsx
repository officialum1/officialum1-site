"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function SellerDashboard() {
    const [stats, setStats] = useState({
        balance: 0,
        totalSales: 0,
        totalOrders: 0,
        activeListings: 0,
        recentOrders: []
    });
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('buyer_user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.role !== 'seller' && userData.role !== 'admin') {
                window.location.href = '/dashboard'; // Redirect non-sellers
            }
            setUser(userData);
            fetchSellerData(userData);
        } else {
            window.location.href = '/login';
        }
    }, []);

    const fetchSellerData = async (userData: any) => {
        try {
            const res = await fetch(`/api/dashboard/seller?userId=${userData.id}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (e) {
            console.error("Seller Dashboard Fetch Error", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
            <div className="spinner"></div>
        </div>
    );

    return (
        <main style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />

            <div className="dashboard-content" style={{ maxWidth: '1400px', margin: '0 auto', padding: '140px 20px 80px' }}>

                {/* Header Section */}
                <div style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                            <span style={{ padding: '5px 12px', background: 'rgba(255, 215, 0, 0.1)', color: '#ffd700', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                ★ SELLER DASHBOARD
                            </span>
                        </div>
                        <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1.5px', marginBottom: '10px' }}>
                            Hello, <span className="text-gradient" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.2))' }}>{user?.username || user?.email?.split('@')[0]}</span>
                        </h1>
                        <p style={{ color: '#888', fontSize: '1.1rem' }}>Manage your products, track sales, and withdraw earnings.</p>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>

                    {/* Active Listings */}
                    <div className="glass" style={{ padding: '25px', borderRadius: '28px', background: 'linear-gradient(135deg, rgba(0, 195, 255, 0.05), transparent)', border: '1px solid rgba(0, 195, 255, 0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <span style={{ color: '#00c3ff', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Listings</span>
                            <span style={{ fontSize: '1.5rem' }}>📦</span>
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{stats.activeListings}</div>
                        <div style={{ marginTop: '15px' }}>
                            <Link href="/seller/products/new" style={{ color: '#00c3ff', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 'bold' }}>+ Add New Product</Link>
                        </div>
                    </div>

                    {/* Total Sales */}
                    <div className="glass" style={{ padding: '25px', borderRadius: '28px', background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.05), transparent)', border: '1px solid rgba(0, 255, 136, 0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <span style={{ color: '#00ff88', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Sales</span>
                            <span style={{ fontSize: '1.5rem' }}>📈</span>
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>${stats.totalSales.toFixed(2)}</div>
                        <div style={{ marginTop: '15px', color: '#888', fontSize: '0.85rem' }}>{stats.totalOrders} total orders</div>
                    </div>

                    {/* Earnings / Wallet */}
                    <div className="glass" style={{ padding: '25px', borderRadius: '28px', background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05), transparent)', border: '1px solid rgba(255, 215, 0, 0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <span style={{ color: '#ffd700', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>My Earnings</span>
                            <span style={{ fontSize: '1.5rem' }}>💰</span>
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>${(stats.balance).toFixed(2)}</div>
                        <div style={{ marginTop: '15px' }}>
                            <Link href="/withdraw" style={{ color: '#ffd700', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 'bold' }}>Request Payout &rarr;</Link>
                        </div>
                    </div>

                </div>

                {/* Main Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '40px' }}>

                    {/* Recent Orders */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Recent Sales</h3>
                            <Link href="/seller/orders" style={{ fontSize: '0.9rem', color: '#00ff88', textDecoration: 'none', fontWeight: 'bold' }}>View All Sales &rarr;</Link>
                        </div>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            {stats.recentOrders.length === 0 ? (
                                <div className="glass" style={{ padding: '60px', textAlign: 'center', borderRadius: '32px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🛒</div>
                                    <h4 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>No Sales Yet</h4>
                                    <p style={{ color: '#666', marginBottom: '25px' }}>Start listing products to make your first sale!</p>
                                    <Link href="/seller/products/new" className="btn btn-primary" style={{ padding: '12px 35px' }}>Create Listing</Link>
                                </div>
                            ) : stats.recentOrders.map((order: any) => (
                                <div key={order.orderId} className="glass card-hover" style={{ padding: '25px', borderRadius: '28px', border: '1px solid #1f2937', background: '#0d1117' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div style={{ width: '50px', height: '50px', background: '#111', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', border: '1px solid #1f2937' }}>
                                                👤
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}>Order #{order.orderId}</div>
                                                <h4 style={{ fontSize: '1.1rem', margin: '4px 0', fontWeight: 'bold' }}>{order.productName || 'Unknown Product'}</h4>
                                                <div style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(order.date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#00ff88' }}>+${parseFloat(order.amount).toFixed(2)}</div>
                                            <div style={{
                                                marginTop: '5px',
                                                padding: '4px 10px',
                                                borderRadius: '8px',
                                                fontSize: '0.7rem',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                background: 'rgba(0, 255, 136, 0.1)',
                                                color: '#00ff88',
                                                display: 'inline-block'
                                            }}>
                                                Completed
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar / Tools */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                        {/* Quick Actions */}
                        <div className="glass" style={{ padding: '30px', borderRadius: '32px' }}>
                            <h4 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: '800' }}>⚡ Quick Actions</h4>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                <Link href="/seller/products/new" className="btn btn-outline" style={{ textAlign: 'center', padding: '12px', borderColor: '#333', color: '#ccc' }}>+ New Product</Link>
                                <Link href="/seller/products" className="btn btn-outline" style={{ textAlign: 'center', padding: '12px', borderColor: '#333', color: '#ccc' }}>Manage Inventory</Link>
                                <Link href="/seller/settings" className="btn btn-outline" style={{ textAlign: 'center', padding: '12px', borderColor: '#333', color: '#ccc' }}>Store Settings</Link>
                            </div>
                        </div>

                        {/* Support Center */}
                        <div className="glass" style={{ padding: '30px', borderRadius: '32px', background: 'linear-gradient(135deg, rgba(0, 195, 255, 0.05), transparent)' }}>
                            <h4 style={{ marginBottom: '10px', fontWeight: '800' }}>Seller Support</h4>
                            <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '20px', lineHeight: '1.6' }}>Having trouble with a sale? Contact our seller support team.</p>
                            <Link href="/support" className="btn btn-primary" style={{ width: '100%', padding: '12px', textAlign: 'center', borderRadius: '12px' }}>Contact Support</Link>
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
                .spinner {
                    border: 4px solid rgba(255, 255, 255, 0.1);
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border-left-color: #00ff88;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
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
