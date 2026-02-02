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
    const [trackedG2GOffers, setTrackedG2GOffers] = useState<any[]>([]);
    const [g2gOrderId, setG2GOrderId] = useState('');
    const [g2gOrderData, setG2GOrderData] = useState<any>(null);
    const [g2gLoading, setG2GLoading] = useState(false);
    const [g2gTab, setG2GTab] = useState<'orders' | 'create_offer' | 'my_offers' | 'my_orders'>('orders');
    const [g2gDelivery, setG2GDelivery] = useState({ status: 'delivered', account_details: '', type: 'account' });
    const [offerForm, setOfferForm] = useState<any>({ product_id: '', unit_price: '', api_qty: 10, currency: 'USD', description: '', offer_attributes: [], delivery_method_ids: [] });
    const [offerStep, setOfferStep] = useState(1);
    const [searchBrand, setSearchBrand] = useState('');
    const [brandsList, setBrandsList] = useState<any[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<any>(null);
    const [services, setServices] = useState<any[]>([]);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [productAttributes, setProductAttributes] = useState<any[]>([]);
    const [deliveryMethods, setDeliveryMethods] = useState<any[]>([]);
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

            const offersRes = await fetch('/api/admin/g2g?action=get_tracked_offers');
            setTrackedG2GOffers(await offersRes.json());

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

    // Also fetch services once on load
    useEffect(() => {
        const loadServices = async () => {
            try {
                const res = await fetch('/api/admin/g2g?action=get_services');
                const data = await res.json();
                setServices(data.payload || data || []);
            } catch (e) { console.error("Failed to load services", e); }
        };
        loadServices();
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
                                                onClick={async () => {
                                                    setG2GOrderId(o.order_id);
                                                    setG2GLoading(true);
                                                    try {
                                                        const res = await fetch(`/api/admin/g2g?action=get_order&orderId=${encodeURIComponent(o.order_id)}`);
                                                        const data = await res.json();
                                                        if (res.ok) setG2GOrderData(data.payload || data);
                                                        else setG2GOrderData({ ...o, message: 'Cached Webhook Data', code: 'WEBHOOK' });
                                                    } catch { setG2GOrderData(o); }
                                                    finally { setG2GLoading(false); }
                                                }}
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
                                                    <div className="glass" style={{ padding: '0.8rem 1rem', borderRadius: '12px' }}>
                                                        <span style={{ display: 'block', fontSize: '0.6rem', color: '#666', textTransform: 'uppercase' }}>Buyer Name</span>
                                                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{g2gOrderData.buyer_name || 'N/A'}</span>
                                                    </div>
                                                    <div className="glass" style={{ padding: '0.8rem 1rem', borderRadius: '12px' }}>
                                                        <span style={{ display: 'block', fontSize: '0.6rem', color: '#666', textTransform: 'uppercase' }}>Buyer ID</span>
                                                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#00ccff' }}>{g2gOrderData.buyer_id || 'N/A'}</span>
                                                    </div>
                                                    <div className="glass" style={{ padding: '0.8rem 1rem', borderRadius: '12px', borderLeft: '3px solid #00ff88' }}>
                                                        <span style={{ display: 'block', fontSize: '0.6rem', color: '#666', textTransform: 'uppercase' }}>Est. Income</span>
                                                        <span style={{ fontWeight: 'bold', color: '#00ff88', fontSize: '1.1rem' }}>+${(Number(g2gOrderData.amount || g2gOrderData.total_price || 0) * 0.95).toFixed(2)}</span>
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

                    {g2gTab === 'create_offer' && (
                        <div className="FadeIn">
                            <div className="glass" style={{ padding: '3rem', borderRadius: '32px', maxWidth: '1000px', margin: '0 auto', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                                    <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>Step {offerStep}: {offerStep === 1 ? 'Select Category' : offerStep === 2 ? 'Select Game' : offerStep === 3 ? 'Select Product' : 'Configure Offer'}</h3>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                                        {[1, 2, 3, 4].map(s => (
                                            <div key={s} style={{ width: '30px', height: '4px', borderRadius: '2px', background: s <= offerStep ? '#00ccff' : '#222' }}></div>
                                        ))}
                                    </div>
                                </div>

                                {/* STEP 1: SELECT SERVICE */}
                                {offerStep === 1 && (
                                    <div className="FadeIn">
                                        <p style={{ textAlign: 'center', color: '#888', marginBottom: '2rem' }}>What are you selling today?</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                            {(services.length > 0 ? services : [
                                                { service_id: '42', service_name: 'Game Accounts' },
                                                { service_id: '45', service_name: 'Game Boosting' },
                                                { service_id: '43', service_name: 'Game Items' },
                                                { service_id: '44', service_name: 'Game Coins' }
                                            ]).map((s: any) => (
                                                <div
                                                    key={s.service_id}
                                                    onClick={() => { setSelectedService(s); setOfferStep(2); }}
                                                    className="glass hover-row"
                                                    style={{ padding: '2rem', borderRadius: '20px', textAlign: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}
                                                >
                                                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                                                        {s.service_name.includes('Account') ? '👤' : s.service_name.includes('Boosting') ? '🚀' : s.service_name.includes('Items') ? '⚔️' : '💰'}
                                                    </div>
                                                    <div style={{ fontWeight: 'bold' }}>{s.service_name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: SELECT BRAND (GAME) */}
                                {offerStep === 2 && (
                                    <div className="FadeIn">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                            <button onClick={() => setOfferStep(1)} style={{ background: 'none', border: 'none', color: '#00ccff', cursor: 'pointer' }}>← Back</button>
                                            <span style={{ color: '#888' }}>Category: <b>{selectedService?.service_name}</b></span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                            <input
                                                className="input-field"
                                                placeholder="Search Game (e.g. Genshin Impact, Reddit, etc.)..."
                                                value={searchBrand}
                                                onChange={(e) => setSearchBrand(e.target.value)}
                                                style={{ flex: 1, padding: '1.2rem', background: '#000' }}
                                                onKeyDown={(e) => e.key === 'Enter' && (document.getElementById('searchBrandsBtn') as any)?.click()}
                                                autoFocus
                                            />
                                            <button
                                                id="searchBrandsBtn"
                                                className="btn"
                                                disabled={searchLoading}
                                                onClick={async () => {
                                                    if (!searchBrand) return;
                                                    setSearchLoading(true);
                                                    try {
                                                        const res = await fetch(`/api/admin/g2g?action=get_brands&service_id=${selectedService.service_id}&q=${encodeURIComponent(searchBrand)}`);
                                                        const data = await res.json();
                                                        setBrandsList(data.payload?.brand_list || data.brand_list || []);
                                                    } catch (e) { alert('Search failed'); }
                                                    finally { setSearchLoading(false); }
                                                }}
                                                style={{ padding: '0 2.5rem', background: '#00ccff', color: '#000', fontWeight: 'bold' }}
                                            >
                                                {searchLoading ? '...' : 'FIND GAME'}
                                            </button>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', maxHeight: '400px', overflowY: 'auto', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '15px' }}>
                                            {brandsList.map((b: any) => (
                                                <div
                                                    key={b.brand_id}
                                                    onClick={async () => {
                                                        setSelectedBrand(b);
                                                        setSearchLoading(true);
                                                        try {
                                                            const res = await fetch(`/api/admin/g2g?action=get_products&service_id=${selectedService.service_id}&brand_id=${b.brand_id}`);
                                                            const data = await res.json();
                                                            setSearchResults(data.payload?.product_list || data.product_list || []);
                                                            setOfferStep(3);
                                                        } catch (e) { alert('Failed to fetch products'); }
                                                        finally { setSearchLoading(false); }
                                                    }}
                                                    className="glass hover-row"
                                                    style={{ padding: '1rem', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', fontSize: '0.85rem' }}
                                                >
                                                    {b.brand_name}
                                                </div>
                                            ))}
                                            {brandsList.length === 0 && !searchLoading && <p style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.3, padding: '2rem' }}>Search for a game above to see results</p>}
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: SELECT PRODUCT TEMPLATE */}
                                {offerStep === 3 && (
                                    <div className="FadeIn">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                            <button onClick={() => setOfferStep(2)} style={{ background: 'none', border: 'none', color: '#00ccff', cursor: 'pointer' }}>← Back</button>
                                            <span style={{ color: '#888' }}>Game: <b>{selectedBrand?.brand_name}</b></span>
                                        </div>
                                        <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Select the specific product template for your listing:</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '500px', overflowY: 'auto' }}>
                                            {searchResults.map((p: any) => (
                                                <div
                                                    key={p.product_id}
                                                    onClick={async () => {
                                                        setOfferForm({ ...offerForm, product_id: p.product_id });
                                                        setSearchLoading(true);
                                                        try {
                                                            const res = await fetch(`/api/admin/g2g?action=get_attributes&productId=${p.product_id}`);
                                                            const attrData = await res.json();
                                                            const payload = attrData.payload || attrData;
                                                            setProductAttributes(payload.attribute_group_list || []);
                                                            setDeliveryMethods(payload.delivery_method_list || []);
                                                            setOfferStep(4);
                                                        } catch (e) { alert('Failed to fetch product attributes'); }
                                                        finally { setSearchLoading(false); }
                                                    }}
                                                    className="glass hover-row"
                                                    style={{ padding: '1.5rem', borderRadius: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                                >
                                                    <div>
                                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{p.product_name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{p.region_name} • {p.brand_name}</div>
                                                    </div>
                                                    <div style={{ color: '#00ccff', fontSize: '0.8rem' }}>ID: {p.product_id}</div>
                                                </div>
                                            ))}
                                            {searchResults.length === 0 && <p style={{ textAlign: 'center', padding: '3rem', opacity: 0.3 }}>No product templates found for this Brand/Service combination.</p>}
                                        </div>
                                    </div>
                                )}

                                {/* STEP 4: CONFIGURE OFFER */}
                                {offerStep === 4 && (
                                    <div className="FadeIn">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                            <button onClick={() => setOfferStep(3)} style={{ background: 'none', border: 'none', color: '#00ccff', cursor: 'pointer' }}>← Back</button>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#666' }}>SELECTED PRODUCT</div>
                                                <div style={{ fontWeight: 'bold', color: '#00ff88' }}>{selectedBrand?.brand_name} - {searchResults.find(p => p.product_id === offerForm.product_id)?.product_name}</div>
                                            </div>
                                        </div>

                                        <form onSubmit={async (e) => {
                                            e.preventDefault();
                                            if (!confirm('Proceed with creating this G2G listing?')) return;
                                            setG2GLoading(true);
                                            try {
                                                const res = await fetch('/api/admin/g2g', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ action: 'create_offer', payload: offerForm })
                                                });
                                                const data = await res.json();
                                                if (res.ok) {
                                                    alert('✅ Offer Created Successfully!\nOffer ID: ' + (data.payload?.offer_id || data.offer_id));
                                                    setG2GTab('my_offers');
                                                    setOfferStep(1);
                                                    fetchData();
                                                } else {
                                                    alert('❌ G2G Error: ' + (data.message || data.error || JSON.stringify(data)));
                                                }
                                            } catch (e) { alert('Network Error: ' + e); }
                                            finally { setG2GLoading(false); }
                                        }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                                {/* Attributes */}
                                                {productAttributes.map((group: any) => (
                                                    <div key={group.attribute_group_id}>
                                                        <label style={{ display: 'block', color: '#00ccff', marginBottom: '0.8rem', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{group.attribute_group_name}</label>
                                                        <select
                                                            className="input-field"
                                                            style={{ width: '100%', padding: '1rem', background: '#000' }}
                                                            required
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                const attrs = [...(offerForm.offer_attributes || [])].filter(a => a.attribute_group_id !== group.attribute_group_id);
                                                                if (val) attrs.push({ attribute_group_id: group.attribute_group_id, attribute_id: val });
                                                                setOfferForm({ ...offerForm, offer_attributes: attrs });
                                                            }}
                                                        >
                                                            <option value="">Select...</option>
                                                            {group.attribute_list?.map((attr: any) => (
                                                                <option key={attr.attribute_id} value={attr.attribute_id}>{attr.attribute_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ))}

                                                {/* Delivery */}
                                                <div>
                                                    <label style={{ display: 'block', color: '#00ccff', marginBottom: '0.8rem', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Delivery Method</label>
                                                    <select
                                                        className="input-field"
                                                        style={{ width: '100%', padding: '1rem', background: '#000' }}
                                                        required
                                                        onChange={(e) => setOfferForm({ ...offerForm, delivery_method_ids: [e.target.value] })}
                                                    >
                                                        <option value="">Select...</option>
                                                        {deliveryMethods.map((dm: any) => (
                                                            <option key={dm.delivery_method_id} value={dm.delivery_method_id}>{dm.delivery_method_name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                                                <div>
                                                    <label style={{ display: 'block', color: '#888', marginBottom: '0.8rem', fontSize: '0.7rem' }}>Unit Price (USD)</label>
                                                    <input type="number" className="input-field" value={offerForm.unit_price} onChange={e => setOfferForm({ ...offerForm, unit_price: e.target.value })} style={{ width: '100%', padding: '1rem', background: '#000' }} step="0.01" required placeholder="0.00" />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', color: '#888', marginBottom: '0.8rem', fontSize: '0.7rem' }}>Currency</label>
                                                    <select className="input-field" value={offerForm.currency} onChange={e => setOfferForm({ ...offerForm, currency: e.target.value })} style={{ width: '100%', padding: '1rem', background: '#000' }}>
                                                        <option value="USD">USD</option>
                                                        <option value="EUR">EUR</option>
                                                        <option value="GBP">GBP</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', color: '#888', marginBottom: '0.8rem', fontSize: '0.7rem' }}>Available Stock</label>
                                                    <input type="number" className="input-field" value={offerForm.api_qty} onChange={e => setOfferForm({ ...offerForm, api_qty: parseInt(e.target.value) })} style={{ width: '100%', padding: '1rem', background: '#000' }} required placeholder="10" />
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '2.5rem' }}>
                                                <label style={{ display: 'block', color: '#888', marginBottom: '0.8rem', fontSize: '0.7rem' }}>Offer Description (Optional)</label>
                                                <textarea className="input-field" value={offerForm.description} onChange={e => setOfferForm({ ...offerForm, description: e.target.value })} style={{ width: '100%', height: '100px', padding: '1rem', background: '#000', resize: 'none' }} placeholder="e.g. Instant Delivery, Full access, etc." />
                                            </div>

                                            <button disabled={g2gLoading} type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.5rem', fontWeight: 'bold', fontSize: '1.2rem', background: 'linear-gradient(90deg, #00ccff, #00ff88)', color: '#000', borderRadius: '15px' }}>
                                                {g2gLoading ? 'CREATING...' : '🚀 PUBLISH GLOBAL OFFER'}
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {g2gTab === 'my_offers' && (
                        <div className="FadeIn">
                            <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h3 style={{ margin: 0 }}>📋 Tracked Listings</h3>
                                    <button onClick={fetchData} className="btn" style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>Refresh List</button>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #222', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                                <th style={{ padding: '1.2rem', textAlign: 'left' }}>Product / Details</th>
                                                <th style={{ padding: '1.2rem', textAlign: 'center' }}>Stock</th>
                                                <th style={{ padding: '1.2rem', textAlign: 'right' }}>Price</th>
                                                <th style={{ padding: '1.2rem', textAlign: 'center' }}>Status</th>
                                                <th style={{ padding: '1.2rem', textAlign: 'right' }}>Synced</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trackedG2GOffers.length > 0 ? trackedG2GOffers.map(offer => (
                                                <tr key={offer.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }} className="hover-row">
                                                    <td style={{ padding: '1.2rem' }}>
                                                        <div style={{ fontWeight: 'bold', color: '#fff' }}>{offer.product_name || 'G2G Offer'}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#00ccff' }}>ID: {offer.offer_id}</div>
                                                    </td>
                                                    <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                                                        <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' }}>{offer.api_qty}</span>
                                                    </td>
                                                    <td style={{ padding: '1.2rem', textAlign: 'right', color: '#00ff88', fontWeight: 'bold' }}>
                                                        {offer.unit_price} {offer.currency}
                                                    </td>
                                                    <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                                                        <span style={{
                                                            padding: '5px 12px', borderRadius: '30px', fontSize: '0.7rem', fontWeight: 'bold',
                                                            background: offer.status === 'active' || offer.status === 'offer.updated' ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)',
                                                            color: offer.status === 'active' || offer.status === 'offer.updated' ? '#00ff88' : '#ff4444'
                                                        }}>
                                                            {offer.status ? offer.status.replace('offer.', '').toUpperCase() : 'ACTIVE'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.2rem', textAlign: 'right', color: '#444', fontSize: '0.75rem' }}>
                                                        {new Date(offer.updated_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', opacity: 0.3 }}>
                                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                                                        <div>No tracked listings found. Create your first offer to see it here.</div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {g2gTab === 'my_orders' && (
                        <div className="FadeIn">
                            <div className="glass" style={{ padding: '4rem', borderRadius: '24px', textAlign: 'center', opacity: 0.5 }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
                                <h2>Buying Dashboard</h2>
                                <p>Manage orders where you are the buyer. Coming soon.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
}
