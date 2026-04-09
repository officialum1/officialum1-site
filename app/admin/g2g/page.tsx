"use client";

import { useState, useEffect, Suspense } from 'react';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';

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

            const offersRes = await fetch('/api/admin/g2g?action=get_all_offers');
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
                // Fix: Extract array from payload.service_list
                const list = data.payload?.service_list || data.service_list || (Array.isArray(data.payload) ? data.payload : []);
                setServices(list || []);
            } catch (e) { console.error("Failed to load services", e); }
        };
        loadServices();
    }, []);

    // Sync DB Setting -> Extension Storage on Load
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (settings?.g2g_auto_online !== undefined) window.dispatchEvent(new CustomEvent('OFFICIALUM1_G2G_AUTO_ONLINE', { detail: settings.g2g_auto_online }));

            // Sync Auto Reply
            if (settings?.g2g_auto_reply !== undefined) window.dispatchEvent(new CustomEvent('OFFICIALUM1_G2G_AUTO_REPLY_TOGGLE', { detail: settings.g2g_auto_reply }));
            if (settings?.g2g_reply_message) window.dispatchEvent(new CustomEvent('OFFICIALUM1_G2G_AUTO_REPLY_MSG', { detail: settings.g2g_reply_message }));
        }
    }, [settings?.g2g_auto_online, settings?.g2g_auto_reply, settings?.g2g_reply_message]);

    if (loading) {
        return (
            <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--fg)' }}>
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <AdminShell title="G2G Center" subtitle="Offers, orders, and fulfillment workflows in one place." hideSidebar>
            <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>

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
                                                        <span style={{ fontWeight: 'bold', color: '#00ff88', fontSize: '1.1rem' }}>+${(Number(g2gOrderData.amount || g2gOrderData.total_price || g2gOrderData.total_amount || 0) * 0.95).toFixed(2)}</span>
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
                                    <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>Step {offerStep}: {offerStep === 1 ? 'Find Product' : offerStep === 2 ? 'Select Template' : offerStep === 3 ? 'Classify Type' : 'Finalize Offer'}</h3>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                                        {[1, 2, 3, 4].map(s => (
                                            <div key={s} style={{ width: '30px', height: '4px', borderRadius: '2px', background: s <= offerStep ? '#00ccff' : '#222' }}></div>
                                        ))}
                                    </div>
                                </div>

                                {/* STEP 1: FIND PRODUCT (SEARCH OR BROWSE) */}
                                {offerStep === 1 && (
                                    <div className="FadeIn">
                                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Find Product</h2>
                                            <p style={{ color: '#888' }}>Search globally or browse by category</p>
                                        </div>

                                        {/* OPTION A: GLOBAL SEARCH */}
                                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', marginBottom: '2rem' }}>
                                            <label style={{ display: 'block', color: '#00ccff', fontWeight: 'bold', marginBottom: '1rem' }}>🔍 Global Search (Fastest)</label>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <input
                                                    className="input-field"
                                                    placeholder="e.g. 'Reddit', 'Genshin', 'WoW'..."
                                                    value={searchBrand}
                                                    onChange={(e) => setSearchBrand(e.target.value)}
                                                    style={{ flex: 1, padding: '1rem', background: '#000', fontSize: '1rem' }}
                                                    onKeyDown={(e) => e.key === 'Enter' && (document.getElementById('searchGlobalBtn') as any)?.click()}
                                                />
                                                <button
                                                    id="searchGlobalBtn"
                                                    className="btn"
                                                    disabled={searchLoading}
                                                    onClick={async () => {
                                                        if (!searchBrand) return;
                                                        setSearchLoading(true);
                                                        try {
                                                            const res = await fetch(`/api/admin/g2g?action=get_products&q=${encodeURIComponent(searchBrand)}`);
                                                            const data = await res.json();
                                                            // Fix Parsing
                                                            const list = Array.isArray(data.payload) ? data.payload : (data.payload?.product_list || data.payload?.results || data.product_list || []);
                                                            setSearchResults(list);
                                                            if (list.length === 0) alert('No products found for this search. Try using the Dropdowns below.');
                                                            else setOfferStep(2);
                                                        } catch (e) { alert('Search failed: ' + e); }
                                                        finally { setSearchLoading(false); }
                                                    }}
                                                    style={{ padding: '0 2rem', background: '#00ccff', color: '#000', fontWeight: 'bold' }}
                                                >
                                                    {searchLoading ? '...' : 'SEARCH'}
                                                </button>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'center', marginBottom: '2rem', opacity: 0.5 }}>- OR -</div>

                                        {/* OPTION B: MANUAL DROPDOWNS (PHP TOOL STYLE) */}
                                        <div className="glass" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <label style={{ display: 'block', color: '#00ff88', fontWeight: 'bold', marginBottom: '1.5rem', fontSize: '1.1rem' }}>📂 Browse by Category</label>

                                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                                {/* Service Dropdown */}
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>1. Select Service</label>
                                                    <select
                                                        className="input-field"
                                                        style={{ width: '100%', padding: '1rem', background: '#000' }}
                                                        onChange={async (e) => {
                                                            const sId = e.target.value;
                                                            setSelectedService(sId);
                                                            setBrandsList([]);
                                                            setSelectedBrand(null);
                                                            if (sId) {
                                                                // Fetch Brands safely
                                                                try {
                                                                    const res = await fetch(`/api/admin/g2g?action=get_brands&service_id=${sId}`);
                                                                    const d = await res.json();
                                                                    const list = d.payload?.brand_list || d.brand_list || (Array.isArray(d.payload) ? d.payload : []);
                                                                    setBrandsList(Array.isArray(list) ? list : []);
                                                                } catch (e) {
                                                                    console.error(e);
                                                                    setBrandsList([]);
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <option value="">Select Service...</option>
                                                        {services.map((s: any) => (
                                                            <option key={s.service_id} value={s.service_id}>{s.service_name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Brand Dropdown */}
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>2. Select Brand (Game)</label>
                                                    <select
                                                        className="input-field"
                                                        style={{ width: '100%', padding: '1rem', background: '#000' }}
                                                        disabled={!selectedService || brandsList.length === 0}
                                                        onChange={async (e) => {
                                                            const bId = e.target.value;
                                                            setSelectedBrand(bId);
                                                            if (bId && selectedService) {
                                                                // Fetch Products safely
                                                                setSearchLoading(true);
                                                                try {
                                                                    const res = await fetch(`/api/admin/g2g?action=get_products&service_id=${selectedService}&brand_id=${bId}`);
                                                                    const d = await res.json();
                                                                    const list = d.payload?.product_list || d.product_list || (Array.isArray(d.payload) ? d.payload : []);
                                                                    const safeList = Array.isArray(list) ? list : [];

                                                                    setSearchResults(safeList);
                                                                    if (safeList.length > 0) setOfferStep(2);
                                                                    else alert('No products found for this brand.');
                                                                } catch (e) {
                                                                    alert('Error fetching products');
                                                                } finally {
                                                                    setSearchLoading(false);
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <option value="">Select Brand...</option>
                                                        {brandsList.map((b: any) => (
                                                            <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: SELECT PRODUCT FROM SEARCH LIST */}
                                {offerStep === 2 && (
                                    <div className="FadeIn">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                            <button onClick={() => setOfferStep(1)} style={{ background: 'none', border: 'none', color: '#00ccff', cursor: 'pointer' }}>← Search Again</button>
                                            <span style={{ color: '#888' }}>Results for: <b>{searchBrand}</b></span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '500px', overflowY: 'auto', padding: '0.5rem' }}>
                                            {searchResults.map((p: any) => (
                                                <div
                                                    key={p.product_id}
                                                    onClick={async () => {
                                                        setOfferForm({
                                                            ...offerForm,
                                                            product_id: p.product_id,
                                                            product_name: p.product_name,
                                                            service_id: p.service_id,
                                                            brand_id: p.brand_id,
                                                            offer_attributes: []
                                                        });
                                                        setOfferStep(3);
                                                        // Pre-fetch attributes in background
                                                        fetch(`/api/admin/g2g?action=get_attributes&productId=${p.product_id}`)
                                                            .then(r => r.json())
                                                            .then(data => {
                                                                const payload = data.payload || data;
                                                                setProductAttributes(payload.attribute_group_list || []);
                                                                setDeliveryMethods(payload.delivery_method_list || []);
                                                            });
                                                    }}
                                                    className="glass hover-row"
                                                    style={{ padding: '1.2rem', borderRadius: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}
                                                >
                                                    <div>
                                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fff' }}>{p.product_name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                                            {p.service_name} • {p.brand_name} ({p.region_name || 'Global'})
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ color: '#00ccff', fontSize: '0.7rem' }}>#{p.product_id}</div>
                                                        <div style={{ color: '#00ff88', fontSize: '0.7rem', fontWeight: 'bold' }}>SELECT →</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: CLASSIFY SERVICE TYPE */}
                                {offerStep === 3 && (
                                    <div className="FadeIn">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                            <button onClick={() => setOfferStep(2)} style={{ background: 'none', border: 'none', color: '#00ccff', cursor: 'pointer' }}>← Back</button>
                                            <span style={{ color: '#888' }}>Selected: <b>{offerForm.product_name}</b></span>
                                        </div>
                                        <h4 style={{ textAlign: 'center', marginBottom: '2rem' }}>What type of service is this?</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                            <div
                                                onClick={() => { setOfferForm({ ...offerForm, internal_type: 'account' }); setOfferStep(4); }}
                                                className="glass hover-row"
                                                style={{ padding: '3rem', borderRadius: '24px', textAlign: 'center', cursor: 'pointer' }}
                                            >
                                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
                                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>ACCOUNT</div>
                                                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>Selling a ready-made account (Login/Pass)</p>
                                            </div>
                                            <div
                                                onClick={() => { setOfferForm({ ...offerForm, internal_type: 'boosting' }); setOfferStep(4); }}
                                                className="glass hover-row"
                                                style={{ padding: '3rem', borderRadius: '24px', textAlign: 'center', cursor: 'pointer' }}
                                            >
                                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
                                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>BOOSTING</div>
                                                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>Selling a service or currency delivery</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 4: FINAL CONFIGURATION */}
                                {offerStep === 4 && (
                                    <div className="FadeIn">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                            <button onClick={() => setOfferStep(3)} style={{ background: 'none', border: 'none', color: '#00ccff', cursor: 'pointer' }}>← Back</button>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#666' }}>SELECTED PRODUCT</div>
                                                <div style={{ fontWeight: 'bold', color: '#00ff88' }}>{offerForm.product_name}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#00ccff' }}>TYPE: {offerForm.internal_type?.toUpperCase()}</div>
                                            </div>
                                        </div>

                                        <form onSubmit={async (e) => {
                                            e.preventDefault();
                                            if (!confirm('Finalize and publish this offer to G2G?')) return;
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
                                                            {group.attribute_list?.map((attr: any) => {
                                                                // Handle nested attributes (Sub-Attributes)
                                                                if (attr.sub_attribute_list && attr.sub_attribute_list.length > 0) {
                                                                    return (
                                                                        <optgroup key={attr.attribute_id} label={attr.attribute_name}>
                                                                            {attr.sub_attribute_list.map((sub: any) => (
                                                                                <option key={sub.attribute_id} value={sub.attribute_id}>{sub.attribute_name}</option>
                                                                            ))}
                                                                        </optgroup>
                                                                    );
                                                                }
                                                                // Handle flat attributes
                                                                return <option key={attr.attribute_id} value={attr.attribute_id}>{attr.attribute_name}</option>;
                                                            })}
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
                            {/* Command Center */}
                            <div className="glass" style={{ padding: '2rem', borderRadius: '20px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(145deg, rgba(255,0,0,0.05), transparent)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#ff4d4d' }}>🔴 G2G Command Center</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}>
                                            <p style={{ color: '#888', fontSize: '0.8rem', margin: 0 }}>Sync listings & Maintain Presence.</p>
                                            <div style={{ width: '1px', height: '15px', background: '#444' }}></div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: settings.g2g_auto_online ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px', border: settings.g2g_auto_online ? '1px solid rgba(0,255,136,0.3)' : '1px solid rgba(255,255,255,0.1)' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.g2g_auto_online || false}
                                                    onChange={async (e) => {
                                                        const val = e.target.checked;
                                                        setSettings({ ...settings, g2g_auto_online: val });

                                                        // 1. Sync setting to DB
                                                        await fetch('/api/admin/settings', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ key: 'g2g_auto_online', value: val })
                                                        });

                                                        // 2. Dispatch to Extension (Zero CPU)
                                                        if (typeof window !== 'undefined') {
                                                            window.dispatchEvent(new CustomEvent('OFFICIALUM1_G2G_AUTO_ONLINE', { detail: val }));
                                                        }

                                                        if (val) alert("✅ Auto-Online Activated! Your Extension will keep you online (0% Server Load).");
                                                    }}
                                                    style={{ accentColor: '#00ff88' }}
                                                />
                                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: settings.g2g_auto_online ? '#00ff88' : '#888' }}>
                                                    {settings.g2g_auto_online ? '🟢 AUTO-ONLINE ACTIVE' : '⚪ Auto-Online Off'}
                                                </span>
                                            </label>

                                            <div style={{ width: '1px', height: '15px', background: '#444' }}></div>

                                            {/* Flash Reply Toggle */}
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: settings.g2g_auto_reply ? 'rgba(0,204,255,0.1)' : 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px', border: settings.g2g_auto_reply ? '1px solid rgba(0,204,255,0.3)' : '1px solid rgba(255,255,255,0.1)' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.g2g_auto_reply || false}
                                                    onChange={async (e) => {
                                                        const val = e.target.checked;
                                                        setSettings({ ...settings, g2g_auto_reply: val });
                                                        await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'g2g_auto_reply', value: val }) });
                                                        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('OFFICIALUM1_G2G_AUTO_REPLY_TOGGLE', { detail: val }));
                                                    }}
                                                    style={{ accentColor: '#00ccff' }}
                                                />
                                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: settings.g2g_auto_reply ? '#00ccff' : '#888' }}>
                                                    {settings.g2g_auto_reply ? '⚡ FLASH REPLY ON' : '⚪ Flash Reply Off'}
                                                </span>
                                            </label>
                                        </div>

                                        {/* Flash Reply Message Input (Visible if ON) */}
                                        {settings.g2g_auto_reply && (
                                            <div className="FadeIn" style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Enter Auto-Reply Message..."
                                                    value={settings.g2g_reply_message || ''}
                                                    onChange={(e) => setSettings({ ...settings, g2g_reply_message: e.target.value })}
                                                    style={{ background: '#111', border: '1px solid #333', color: '#fff', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', flex: 1 }}
                                                />
                                                <button
                                                    onClick={async () => {
                                                        const msg = settings.g2g_reply_message || "Hello! I am online. Wait 1 min.";
                                                        await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'g2g_reply_message', value: msg }) });
                                                        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('OFFICIALUM1_G2G_AUTO_REPLY_MSG', { detail: msg }));
                                                        alert("✅ Auto-Reply Message Saved & Synced!");
                                                    }}
                                                    style={{ background: '#00ccff', border: 'none', borderRadius: '4px', padding: '0 10px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', color: '#000' }}
                                                >
                                                    SAVE
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            className="btn"
                                            onClick={async () => {
                                                if (!confirm('Use API Sync? This requires valid API keys in .env')) return;
                                                setG2GLoading(true);
                                                try {
                                                    const res = await fetch('/api/admin/g2g', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ action: 'api_sync_g2g' })
                                                    });
                                                    const d = await res.json();
                                                    if (res.ok) {
                                                        const count = d.listingCount !== undefined ? d.listingCount : d.count;
                                                        const orders = d.orderCount || 0;
                                                        alert(`API Sync Success! ${count} listings updated, ${orders} orders synced.`);
                                                        fetchData();
                                                    }
                                                    else alert('API Sync Failed: ' + JSON.stringify(d));
                                                } catch (e) { alert('API Error'); }
                                                finally { setG2GLoading(false); }
                                            }}
                                            disabled={g2gLoading}
                                            style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #444', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
                                        >
                                            {g2gLoading ? 'Syncing...' : '☁️ API Force'}
                                        </button>
                                        <button
                                            className="btn"
                                            onClick={() => {
                                                // Trigger Extension Event
                                                const event = new CustomEvent('OFFICIALUM1_G2G_SYNC', { detail: { action: 'FULL_SYNC' } });
                                                window.dispatchEvent(event);
                                                alert('Extension Sync Initiated! Check browser logs.');
                                            }}
                                            style={{ background: '#ff4d4d', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            🚀 Extension Sync
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1rem', color: '#fff', margin: 0 }}>📋 Active Listings ({trackedG2GOffers.length})</h3>
                                    <button onClick={fetchData} className="btn" style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>Refresh View</button>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                        <thead>
                                            <tr style={{ background: 'rgba(255,255,255,0.02)', color: '#888', textAlign: 'left' }}>
                                                <th style={{ padding: '1rem', borderRadius: '10px 0 0 10px' }}>ID</th>
                                                <th style={{ padding: '1rem' }}>Title</th>
                                                <th style={{ padding: '1rem' }}>Price</th>
                                                <th style={{ padding: '1rem' }}>Stock</th>
                                                <th style={{ padding: '1rem' }}>Status</th>
                                                <th style={{ padding: '1rem', borderRadius: '0 10px 10px 0' }}>Link</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trackedG2GOffers.length > 0 ? trackedG2GOffers.map((item: any, i: number) => (
                                                <tr key={item.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '1rem', color: '#666' }}>{item.id}</td>
                                                    <td style={{ padding: '1rem', color: '#fff', fontWeight: 'bold' }}>{item.title}</td>
                                                    <td style={{ padding: '1rem', color: '#00ccff' }}>${item.price}</td>
                                                    <td style={{ padding: '1rem', color: item.stock > 0 ? '#00ff88' : '#ff4444' }}>{item.stock}</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{
                                                            padding: '4px 10px',
                                                            borderRadius: '12px',
                                                            background: item.status === 'Active' ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)',
                                                            color: item.status === 'Active' ? '#00ff88' : '#ff4444',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.7rem'
                                                        }}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <a href={item.url} target="_blank" rel="noreferrer" style={{ color: '#666', textDecoration: 'none' }}>🔗 View</a>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No listings found. Sync to populate.</td>
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
        </AdminShell>
    );
}
