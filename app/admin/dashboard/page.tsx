"use client";

import { useState, useEffect } from 'react';
import SalesChart from '@/components/SalesChart';
import LiveTrafficDashboard from '@/components/LiveTrafficDashboard';
import { AdminShell } from '@/components/admin/AdminShell';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Authenticate Admin (Simplified)
        const rawUser = localStorage.getItem('buyer_user');
        try {
            const user = rawUser ? JSON.parse(rawUser) : null;
            if (!user || (user.role !== 'admin' && user.role !== 'seller')) {
                window.location.href = '/admin/login';
                return;
            }
        } catch (e) {
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
        <AdminShell title="Dashboard" subtitle="Live analytics and operational overview.">
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <a href="/admin/catalog" className="btn-secondary">Workspace</a>
                <a href="/admin/buyers" className="btn-secondary">Buyers</a>
                <a href="/admin/reviews" className="btn-secondary">Review Moderator</a>
                <a href="/admin/coupons" className="btn-secondary">Promo Codes</a>
                <a href="/admin/newsletter" className="btn-secondary">Newsletter</a>
                <a href="/admin/payouts" className="btn-secondary">Payout Requests</a>
                <a href="/admin/blogs" className="btn-secondary">AI Blogs</a>
                <a href="/admin/kb" className="btn-secondary">FAQ / KB</a>
                <a href="/admin/settings" className="btn-primary">Settings</a>
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

                {/* Live Traffic Dashboard */}
                <LiveTrafficDashboard />

                {/* Charts & Analytics Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                        <SalesChart data={stats?.salesChartData || []} />
                    </div>
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>🔥 Top Products</h3>
                        {stats?.topProducts?.map((p: any, i: number) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                                <span>{i + 1}. {p.name}</span>
                                <span style={{ color: '#aaa' }}>{p.sales} Sold</span>
                            </div>
                        ))}
                    </div>
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
            <style jsx>{`
                @media (max-width: 1024px) {
                    div[style*="display: flex; justify-content: space-between"] {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 1.5rem !important;
                    }
                    div[style*="display: flex; gap: 10px"] {
                        flex-wrap: wrap !important;
                        width: 100% !important;
                    }
                    .btn {
                        flex: 1 1 calc(50% - 10px) !important;
                        font-size: 0.8rem !important;
                        padding: 0.8rem 1rem !important;
                    }
                    div[style*="grid-template-columns: 2fr 1fr"] {
                        grid-template-columns: 1fr !important;
                    }
                    h1 { font-size: 2.2rem !important; }
                }

                @media (max-width: 640px) {
                    .container { 
                        padding-top: 100px !important;
                        padding-left: 15px !important; 
                        padding-right: 15px !important; 
                    }
                    .btn {
                        flex: 1 1 100% !important;
                    }
                    .glass { padding: 1.25rem !important; }
                    h2 { font-size: 1.5rem !important; }
                }
            `}</style>
        </AdminShell>
    );
}
