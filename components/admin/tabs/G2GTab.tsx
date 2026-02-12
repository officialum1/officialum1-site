"use client";

interface G2GTabProps {
    fetchData: () => Promise<void>;
    g2gStats: any;
    g2gTab: 'orders' | 'create_offer' | 'my_offers' | 'my_orders';
    setG2GTab: (tab: 'orders' | 'create_offer' | 'my_offers' | 'my_orders') => void;
    hasPermission: (perm: string) => boolean;
    trackedG2GOrders: any[];
    g2gOrderId: string;
    setG2GOrderId: (id: string) => void;
    g2gLoading: boolean;
    setG2GLoading: (loading: boolean) => void;
    g2gOrderData: any;
    setG2GOrderData: (data: any) => void;
    g2gDelivery: any;
    setG2GDelivery: (delivery: any) => void;
    offerForm: any;
    setOfferForm: (form: any) => void;
    trackedG2GOffers: any[];
}

export default function G2GTab({
    fetchData,
    g2gStats,
    g2gTab,
    setG2GTab,
    hasPermission,
    trackedG2GOrders,
    g2gOrderId,
    setG2GOrderId,
    g2gLoading,
    setG2GLoading,
    g2gOrderData,
    setG2GOrderData,
    g2gDelivery,
    setG2GDelivery,
    offerForm,
    setOfferForm,
    trackedG2GOffers
}: G2GTabProps) {
    return (
        <div className="FadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{ margin: 0, fontFamily: 'var(--font-outfit)' }}>🎮 G2G Fulfillment Hub</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ background: 'rgba(0,188,255,0.1)', color: '#00ccff', padding: '6px 15px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid rgba(0,204,255,0.2)' }}>
                        API CONNECTED ✅
                    </div>
                    <button onClick={fetchData} className="btn" style={{ padding: '6px 15px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#fff' }}>🔄 Sync</button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '2rem' }}>
                {[{ id: 'orders', label: '📦 Order Delivery' }, { id: 'create_offer', label: '➕ Create Offer' }, { id: 'my_offers', label: '📋 My Offers' }, { id: 'my_orders', label: '🛒 My Orders' }].map(tab => (
                    <button key={tab.id} onClick={() => setG2GTab(tab.id as any)} style={{ background: 'none', border: 'none', borderBottom: g2gTab === tab.id ? '2px solid #00ccff' : '2px solid transparent', color: g2gTab === tab.id ? '#00ccff' : '#666', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>{tab.label}</button>
                ))}
            </div>

            {g2gTab === 'orders' && (
                <>
                    {/* G2G Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ color: '#888', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Total Sales (G2G)</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff' }}>${Number(g2gStats.totalRevenue || 0).toLocaleString()}</div>
                        </div>
                        {hasPermission('finance') && (
                            <div className="glass" style={{ padding: '1.5rem', borderRadius: '15px', border: '1px solid rgba(0,255,136,0.3)', background: 'linear-gradient(135deg, rgba(0,255,136,0.05), transparent)' }}>
                                <div style={{ color: '#00ff88', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Net Profit 🛡️</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#00ff88' }}>${Number(g2gStats.totalProfit || 0).toLocaleString()}</div>
                            </div>
                        )}
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ color: '#888', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Lifetime Orders</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff' }}>{g2gStats.totalOrders || 0}</div>
                        </div>
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '15px', border: g2gStats.autoPilot ? '1px solid #00ff88' : '1px solid #444', position: 'relative', overflow: 'hidden' }}>
                            {g2gStats.autoPilot && <div className="pulse" style={{ position: 'absolute', top: '-10px', right: '-10px', width: '40px', height: '40px', background: 'rgba(0,255,136,0.1)', borderRadius: '50%' }}></div>}
                            <div style={{ color: '#888', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Auto-Pilot System</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: g2gStats.autoPilot ? '#00ff88' : '#888' }}>{g2gStats.autoPilot ? 'ACTIVE 🤖' : 'OFF'}</div>
                                <button
                                    onClick={async () => {
                                        const res = await fetch('/api/admin/g2g', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ action: 'toggle_auto_pilot', enabled: !g2gStats.autoPilot })
                                        });
                                        if (res.ok) fetchData();
                                    }}
                                    className="btn"
                                    style={{ padding: '5px 12px', fontSize: '0.7rem', background: g2gStats.autoPilot ? 'rgba(0,255,136,0.2)' : '#222', border: g2gStats.autoPilot ? '1px solid #00ff88' : '1px solid #444', color: g2gStats.autoPilot ? '#fff' : '#666' }}
                                >
                                    {g2gStats.autoPilot ? 'Stop' : 'Enable'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                        {/* Left Column: Events & Side Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Live Feed Card */}
                            <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '0.9rem', margin: 0, color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>📡 Recent Events</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,255,136,0.05)', padding: '4px 10px', borderRadius: '20px' }}>
                                        <div className="pulse" style={{ width: '6px', height: '6px', background: '#00ff88', borderRadius: '50%' }}></div>
                                        <span style={{ fontSize: '0.6rem', color: '#00ff88', fontWeight: 'bold' }}>LIVE</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                    {trackedG2GOrders.length > 0 ? trackedG2GOrders.map((o: any) => (
                                        <div
                                            key={o.id}
                                            onClick={async () => {
                                                setG2GOrderId(o.order_id);
                                                setG2GLoading(true);
                                                try {
                                                    const res = await fetch(`/api/admin/g2g?action=get_order&orderId=${o.order_id}`);
                                                    const data = await res.json();
                                                    if (res.ok) setG2GOrderData(data.payload || data);
                                                    else setG2GOrderData({ ...o.payload, message: 'Cached Webhook Data', code: 'WEBHOOK' });
                                                } catch { }
                                                finally { setG2GLoading(false); }
                                            }}
                                            style={{
                                                padding: '1rem',
                                                background: g2gOrderId === o.order_id ? 'rgba(0,204,255,0.1)' : 'rgba(255,255,255,0.02)',
                                                borderRadius: '12px',
                                                border: g2gOrderId === o.order_id ? '1px solid #00ccff' : '1px solid rgba(255,255,255,0.05)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                                <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#fff' }}>#{o.order_id}</span>
                                                <span style={{ fontSize: '0.65rem', color: '#666' }}>{new Date(o.updated_at).toLocaleTimeString()}</span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.product_name || 'G2G Product'}</div>
                                        </div>
                                    )) : (
                                        <div style={{ textAlign: 'center', color: '#444', fontSize: '0.8rem', padding: '2rem' }}>Waiting for orders...</div>
                                    )}
                                </div>
                            </div>

                            {/* Order Details Mini Card (If order selected) */}
                            {g2gOrderData && !g2gOrderData.message && (
                                <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(136,84,208,0.2)', borderLeft: '4px solid #8854d0' }}>
                                    <h3 style={{ fontSize: '0.9rem', color: '#a55eea', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📄 Summary</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#888' }}>Buyer:</span><span style={{ color: '#fff' }}>{g2gOrderData.buyer_name || 'N/A'}</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#888' }}>Item Qty:</span><span style={{ color: '#fff' }}>{g2gOrderData.quantity}</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#888' }}>Price:</span><span style={{ color: '#00ccff' }}>{g2gOrderData.unit_price || g2gOrderData.amount || g2gOrderData.total_price || 'N/A'} {g2gOrderData.currency}</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#888' }}>Status:</span><span style={{ color: '#00ff88', fontWeight: 'bold' }}>{(g2gOrderData.status || 'NEW').toUpperCase()}</span></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Main Fulfillment Hub */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Interaction Header */}
                            <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', display: 'flex', gap: '1rem', alignItems: 'center', border: '1px solid rgba(110,98,249,0.2)' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Active Order Search</label>
                                    <input
                                        className="input-field"
                                        placeholder="Enter Global Order ID..."
                                        value={g2gOrderId}
                                        onChange={(e) => setG2GOrderId(e.target.value.trim())}
                                        style={{ width: '100%', background: '#111', border: '1px solid #333' }}
                                    />
                                </div>
                                <button
                                    className="btn btn-primary"
                                    style={{ height: '45px', padding: '0 2rem', marginTop: '1.2rem', background: '#6e62f9', borderRadius: '10px' }}
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
                                        } catch { alert('Connection Error'); }
                                        finally { setG2GLoading(false); }
                                    }}
                                >
                                    FETCH ORDER
                                </button>
                            </div>

                            {/* The Main Delivery Hub Box */}
                            <div className="glass" style={{
                                padding: '2.5rem',
                                borderRadius: '24px',
                                minHeight: '400px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                background: 'linear-gradient(145deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.4) 100%)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                            }}>
                                {!g2gOrderData ? (
                                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0.3 }}>
                                        <div style={{ fontSize: '4rem' }}>🎮</div>
                                        <p>Load an order to start delivery</p>
                                    </div>
                                ) : g2gOrderData.message || g2gOrderData.error ? (
                                    <div className="FadeIn" style={{ color: '#ff4444' }}>
                                        <h2 style={{ color: '#ff4444', marginBottom: '1rem' }}>❌ G2G Retrieval Failure</h2>
                                        <p style={{ color: '#888' }}>Server returned {g2gOrderData.code || '404'}. Ensure this is a valid G2G Order ID for your region.</p>
                                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#000', borderRadius: '8px', border: '1px solid #442222', fontSize: '0.8rem' }}>
                                            {typeof g2gOrderData.error === 'string' && g2gOrderData.error.includes('<html')
                                                ? 'Endpoint Not Found (404 Path Error)'
                                                : (g2gOrderData.message || g2gOrderData.error || 'Unknown Error')}
                                        </div>
                                        <details style={{ marginTop: '1rem' }}>
                                            <summary style={{ cursor: 'pointer', color: '#666' }}>View Debug Payload</summary>
                                            <pre style={{ background: '#000', padding: '1rem', borderRadius: '12px', marginTop: '1rem', fontSize: '0.7rem', border: '1px solid #311', overflow: 'auto', maxHeight: '200px' }}>
                                                {JSON.stringify(g2gOrderData, null, 2)}
                                            </pre>
                                        </details>
                                    </div>
                                ) : (
                                    <div className="FadeIn">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', borderBottom: '1px solid #222', paddingBottom: '1.5rem' }}>
                                            <div>
                                                <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#fff' }}>Delivery Hub</h2>
                                                <div style={{ color: '#00ccff', fontSize: '0.9rem', fontWeight: 'bold' }}>ORDER #{g2gOrderData.order_id}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ display: 'block', fontSize: '0.7rem', color: '#666' }}>ESTIMATED PROFIT</span>
                                                <span style={{ fontSize: '1.4rem', color: '#00ff88', fontWeight: 'bold' }}>+${(Number(g2gOrderData.amount || g2gOrderData.total_price || g2gOrderData.total_amount || 0) * 0.95).toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                                            <div style={{ background: 'rgba(52,152,219,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(52,152,219,0.1)' }}>
                                                <label style={{ color: '#3498db', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem' }}>📦 Delivery Payload</label>
                                                <textarea
                                                    className="input-field"
                                                    value={g2gDelivery.account_details}
                                                    onChange={(e) => setG2GDelivery({ ...g2gDelivery, account_details: e.target.value })}
                                                    placeholder="Login:Password:Token..."
                                                    style={{ height: '120px', background: '#000', border: '1px solid #222', color: '#00ff88', fontFamily: 'monospace' }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div>
                                                    <label style={{ color: '#888', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Delivery Method</label>
                                                    <div style={{
                                                        background: 'rgba(52, 152, 219, 0.1)',
                                                        padding: '1rem',
                                                        borderRadius: '12px',
                                                        color: '#3498db',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.9rem',
                                                        border: '1px solid rgba(52, 152, 219, 0.2)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}>
                                                        <span>⚡</span> {(g2gOrderData.delivery_method_code || g2gOrderData.delivery_mode || 'Standard').toUpperCase()}
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
                                            style={{
                                                width: '100%',
                                                background: 'linear-gradient(90deg, #2ecc71, #27ae60)',
                                                color: '#fff',
                                                padding: '1.2rem',
                                                fontSize: '1.1rem',
                                                fontWeight: 'bold',
                                                borderRadius: '12px',
                                                boxShadow: '0 10px 20px rgba(46,204,113,0.2)'
                                            }}
                                            onClick={async () => {
                                                if (!g2gDelivery.account_details) return alert('Enter delivery details first!');
                                                setG2GLoading(true);
                                                try {
                                                    const res = await fetch('/api/admin/g2g', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            action: 'deliver_order',
                                                            orderId: g2gOrderData.order_id,
                                                            details: g2gDelivery.account_details
                                                        })
                                                    });
                                                    const d = await res.json();
                                                    if (res.ok) {
                                                        alert('Order Delivered Successfully on G2G!');
                                                        fetchData();
                                                    } else {
                                                        alert('Error: ' + d.message);
                                                    }
                                                } catch { alert('API Timeout or Error'); }
                                                finally { setG2GLoading(false); }
                                            }}
                                        >
                                            CONFIRM & SHIP ACCOUNT
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
