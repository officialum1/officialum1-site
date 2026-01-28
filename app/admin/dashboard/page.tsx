"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Authenticate Admin (Simplified)
        const adminKey = localStorage.getItem('admin_key');
        if (!adminKey) {
            window.location.href = '/admin/login';
            return;
        }

        fetch('/api/admin/dashboard')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="container" style={{ paddingTop: '150px' }}>Loading Analytics...</div>;

    const cards = [
        { label: "Total Revenue (Mo)", value: `$${stats?.revenueMonth || 0}`, color: "#00ff88", icon: "💰" },
        { label: "Total Orders (Mo)", value: stats?.ordersMonth || 0, color: "#00c3ff", icon: "📦" },
        { label: "Total Users", value: stats?.totalUsers || 0, color: "#ffaa00", icon: "👥" },
        { label: "Top Platform", value: stats?.topPlatform?.platform || "N/A", color: "#ff4444", icon: "🏆", sub: `${stats?.topPlatform?.percent || 0}% of Sales` }
    ];

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '3rem' }}>Admin Dashboard</h1>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <a href="/admin/inventory" className="btn btn-outline">Inventory</a>
                        <a href="/admin/users" className="btn btn-outline">Users</a>
                        <a href="/admin/reviews" className="btn btn-outline">Reviews</a>
                        <a href="/admin/blogs" className="btn btn-outline">Blogs</a>
                        <a href="/admin/settings" className="btn btn-primary">⚙️ Settings</a>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    {cards.map((c, i) => (
                        <div key={i} className="glass" style={{ padding: '1.5rem', borderRadius: '20px', borderLeft: `4px solid ${c.color}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{c.label}</p>
                                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{c.value}</h2>
                                    {c.sub && <p style={{ fontSize: '0.8rem', color: c.color, marginTop: '0.5rem' }}>{c.sub}</p>}
                                </div>
                                <div style={{ fontSize: '2rem', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }}>{c.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Orders Table */}
                <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Recent Orders</h3>
                    {stats?.recentOrders?.length === 0 ? (
                        <p style={{ color: '#666' }}>No recent orders found.</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#888' }}>
                                        <th style={{ padding: '1rem' }}>ID</th>
                                        <th style={{ padding: '1rem' }}>User</th>
                                        <th style={{ padding: '1rem' }}>Product</th>
                                        <th style={{ padding: '1rem' }}>Amount</th>
                                        <th style={{ padding: '1rem' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.recentOrders?.map((o: any) => (
                                        <tr key={o.orderId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace' }}>#{o.orderId.substring(6)}</td>
                                            <td style={{ padding: '1rem' }}>{o.user_email || 'Guest'}</td>
                                            <td style={{ padding: '1rem' }}>{o.productId}</td>
                                            <td style={{ padding: '1rem', color: '#00ff88' }}>${o.amount}</td>
                                            <td style={{ padding: '1rem', color: '#888', fontSize: '0.9rem' }}>{new Date(o.date).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
}
