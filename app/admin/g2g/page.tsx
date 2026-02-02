"use client";

import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';

export default function G2GCenterPage() {
    return (
        <Suspense fallback={<div style={{ background: '#050505', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>Loading Hub...</div>}>
            <G2GDashboard />
        </Suspense>
    );
}

function G2GDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [g2gStats, setG2GStats] = useState<any>({});
    const [trackedG2GOrders, setTrackedG2GOrders] = useState<any[]>([]);
    const [g2gOrderId, setG2GOrderId] = useState('');
    const [g2gOrderData, setG2GOrderData] = useState<any>(null);
    const [g2gLoading, setG2GLoading] = useState(false);
    const [g2gTab, setG2GTab] = useState<'orders' | 'create_offer' | 'my_offers' | 'my_orders'>('orders');
    const [g2gDelivery, setG2GDelivery] = useState({ status: 'delivered', account_details: '', type: 'account' });
    const [settings, setSettings] = useState<any>({});

    const fetchData = async () => {
        // Auth check
        const userStr = localStorage.getItem('buyer_user');
        if (!userStr) return router.push('/login');
        const user = JSON.parse(userStr);
        if (user.role !== 'admin' && user.role !== 'seller') return router.push('/');

        try {
            const res = await fetch('/api/admin/g2g?action=get_stats');
            const data = await res.json();
            setG2GStats(data);

            const ordersRes = await fetch('/api/admin/g2g?action=get_tracked_orders');
            setTrackedG2GOrders(await ordersRes.json());

            const g2gSettings = await (await fetch('/api/admin/settings')).json();
            setSettings(g2gSettings);
        } catch (e) {
            console.error("Failed to load G2G data", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
            <div className="loader"></div>
        </div>
    );

    return (
        <main style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />
            <div style={{ display: 'flex', paddingTop: '80px', minHeight: '100vh' }}>

                {/* Sidebar (Simplified copy for G2G Context) */}
                <div style={{ width: '280px', flexShrink: 0, padding: '2rem 1rem', borderRight: '1px solid #222', background: '#0a0a0a', position: 'sticky', top: '80px', height: 'calc(100vh - 80px)' }}>
                    <div onClick={() => router.push('/admin/inventory')} style={{ cursor: 'pointer', color: '#888', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>← Back to Dashboard</span>
                    </div>
                    <h1 className="text-gradient" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>G2G Global Hub</h1>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {[
                            { id: 'orders', label: '📦 Order Fulfillment' },
                            { id: 'create_offer', label: '➕ Create Offer' },
                            { id: 'my_offers', label: '📋 My Listings' },
                            { id: 'my_orders', label: '🛒 Buying Orders' }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setG2GTab(t.id as any)}
                                style={{
                                    textAlign: 'left', padding: '0.8rem 1rem', borderRadius: '8px',
                                    background: g2gTab === t.id ? 'rgba(0,188,255,0.1)' : 'transparent',
                                    color: g2gTab === t.id ? '#00ccff' : '#888',
                                    border: 'none', fontWeight: g2gTab === t.id ? 'bold' : 'normal',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ flex: 1, padding: '2rem 3rem', maxWidth: '1400px' }}>

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '2rem' }}>G2G CENTER</h2>
                            <p style={{ color: '#666', margin: '0.5rem 0 0 0' }}>Manage global gaming sales and deliveries</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', padding: '8px 20px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                STATUS: SECURE CONNECTED
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '15px' }}>
                            <div style={{ color: '#888', fontSize: '0.7rem', textTransform: 'uppercase' }}>G2G Revenue</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>${(g2gStats.totalRevenue || 0).toLocaleString()}</div>
                        </div>
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '15px', borderLeft: '4px solid #00ff88' }}>
                            <div style={{ color: '#00ff88', fontSize: '0.7rem', textTransform: 'uppercase' }}>Net Profit</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#00ff88' }}>${(g2gStats.totalProfit || 0).toLocaleString()}</div>
                        </div>
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '15px' }}>
                            <div style={{ color: '#888', fontSize: '0.7rem', textTransform: 'uppercase' }}>Orders</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{g2gStats.totalOrders || 0}</div>
                        </div>
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '15px' }}>
                            <div style={{ color: '#888', fontSize: '0.7rem', textTransform: 'uppercase' }}>Success Rate</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>98.2%</div>
                        </div>
                    </div>

                    {/* Sub-Tabs View */}
                    {g2gTab === 'orders' && (
                        <div className="FadeIn" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                            {/* Left: Events */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                                    <h3 style={{ fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Recent Activity</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '500px', overflowY: 'auto' }}>
                                        {trackedG2GOrders.map((o: any) => (
                                            <div
                                                key={o.id}
                                                onClick={() => { setG2GOrderId(o.order_id); setG2GOrderData(o.payload?.payload || o.payload); }}
                                                style={{
                                                    padding: '1rem', background: g2gOrderId === o.order_id ? 'rgba(0,188,255,0.1)' : 'rgba(255,255,255,0.02)',
                                                    borderRadius: '12px', border: g2gOrderId === o.order_id ? '1px solid #00ccff' : '1px solid #222', cursor: 'pointer'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                                    <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>#{o.order_id}</span>
                                                    <span style={{ fontSize: '0.65rem', color: '#666' }}>{new Date(o.updated_at).toLocaleTimeString()}</span>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#aaa' }}>{o.product_name}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Fulfillment Hub */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', display: 'flex', gap: '1rem' }}>
                                    <input className="input-field" placeholder="Search Global ID..." value={g2gOrderId} onChange={(e) => setG2GOrderId(e.target.value)} style={{ flex: 1 }} />
                                    <button
                                        className="btn btn-primary"
                                        disabled={g2gLoading}
                                        onClick={async () => {
                                            let cleanId = g2gOrderId.trim();
                                            if (cleanId.includes('-')) cleanId = cleanId.split('-')[0];
                                            if (!cleanId) return;
                                            setG2GLoading(true);
                                            try {
                                                const res = await fetch(`/api/admin/g2g?action=get_order&orderId=${encodeURIComponent(cleanId)}`);
                                                const data = await res.json();
                                                setG2GOrderData(data.payload || data);
                                            } catch { alert('API Error'); }
                                            finally { setG2GLoading(false); }
                                        }}
                                    >FETCH</button>
                                </div>

                                <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px', minHeight: '400px', background: 'linear-gradient(145deg, rgba(255,255,255,0.02), rgba(0,0,0,0.3))' }}>
                                    {!g2gOrderData ? (
                                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0.2 }}>
                                            <div style={{ fontSize: '5rem' }}>📦</div>
                                            <p>Select order to dispatch</p>
                                        </div>
                                    ) : (g2gOrderData.message || g2gOrderData.error) ? (
                                        <div style={{ color: '#ff4444' }}>
                                            <h2>❌ CONNECTION ERROR</h2>
                                            <p>{g2gOrderData.message}</p>
                                            <pre style={{ background: '#000', padding: '1rem', borderRadius: '12px', marginTop: '1rem', fontSize: '0.8rem' }}>{JSON.stringify(g2gOrderData, null, 2)}</pre>
                                        </div>
                                    ) : (
                                        <div className="FadeIn">
                                            <div style={{ borderBottom: '1px solid #222', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                                                <h2 style={{ fontSize: '2rem', margin: 0 }}>Dispatch Hub</h2>
                                                <span style={{ color: '#00ccff', fontWeight: 'bold' }}>ORDER #{g2gOrderData.order_id}</span>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                                <div>
                                                    <label style={{ color: '#00ccff', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Account Payload</label>
                                                    <textarea
                                                        className="input-field"
                                                        value={g2gDelivery.account_details}
                                                        onChange={(e) => setG2GDelivery({ ...g2gDelivery, account_details: e.target.value })}
                                                        style={{ height: '150px', background: '#000', color: '#00ff88', fontFamily: 'monospace' }}
                                                        placeholder="Login:Password..."
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    <div>
                                                        <label style={{ color: '#888', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Delivery Method</label>
                                                        <div style={{
                                                            background: 'rgba(0, 204, 255, 0.1)',
                                                            padding: '0.8rem 1rem',
                                                            borderRadius: '10px',
                                                            color: '#00ccff',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.85rem',
                                                            border: '1px solid rgba(0, 204, 255, 0.2)'
                                                        }}>
                                                            🚀 {(g2gOrderData.delivery_method_code || g2gOrderData.delivery_mode || 'Standard').toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="glass" style={{ padding: '1rem', borderRadius: '12px' }}>
                                                        <span style={{ display: 'block', fontSize: '0.6rem', color: '#666' }}>BUYER</span>
                                                        <span style={{ fontWeight: 'bold' }}>{g2gOrderData.buyer_name}</span>
                                                    </div>
                                                    <div className="glass" style={{ padding: '1rem', borderRadius: '12px' }}>
                                                        <span style={{ display: 'block', fontSize: '0.6rem', color: '#666' }}>EST. INCOME</span>
                                                        <span style={{ fontWeight: 'bold', color: '#00ff88' }}>+${(Number(g2gOrderData.amount || 0) * 0.95).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                className="btn"
                                                style={{ width: '100%', padding: '1.2rem', background: 'linear-gradient(90deg, #00ff88, #00ccff)', color: '#000', fontWeight: 'bold', fontSize: '1.1rem', borderRadius: '12px' }}
                                                onClick={async () => {
                                                    setG2GLoading(true);
                                                    try {
                                                        const res = await fetch('/api/admin/g2g', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ action: 'deliver_order', orderId: g2gOrderId, delivery_details: { content: g2gDelivery.account_details, type: g2gDelivery.type } })
                                                        });
                                                        if (res.ok) { alert('Delivered!'); fetchData(); }
                                                        else alert('Failed to deliver');
                                                    } catch { alert('Error'); }
                                                    finally { setG2GLoading(false); }
                                                }}
                                            >DISPATCH TO BUYER</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
}
