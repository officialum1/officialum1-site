"use client";

interface OrdersTabProps {
    orders: any[];
    showFulfill: boolean;
    setShowFulfill: (show: boolean) => void;
    selectedOrder: any;
    setSelectedOrder: (order: any) => void;
    fulfillDetails: string;
    setFulfillDetails: (details: string) => void;
    handleFulfill: (e: any) => Promise<void>;
    fetchData: (user?: any) => Promise<void>;
}

export default function OrdersTab({
    orders,
    showFulfill,
    setShowFulfill,
    selectedOrder,
    setSelectedOrder,
    fulfillDetails,
    setFulfillDetails,
    handleFulfill,
    fetchData
}: OrdersTabProps) {
    return (
        <div className="FadeIn">
            <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-outfit)' }}>📦 Customer Orders</h2>

            <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Order ID</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Product</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Customer</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order: any) => (
                            <tr key={order.orderId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem' }}>{new Date(order.date).toLocaleDateString()}</td>
                                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>#{order.orderId ? order.orderId.slice(-6) : 'N/A'}</td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 'bold' }}>{order.product_name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{order.platform}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div>{order.guestEmail || order.user_email || 'Unknown'}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                                        background: order.status === 'completed' ? 'rgba(0,255,136,0.2)' : 'rgba(255,165,0,0.2)',
                                        color: order.status === 'completed' ? '#00ff88' : '#ffa500'
                                    }}>
                                        {order.status ? order.status.toUpperCase() : 'PENDING'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        {order.status !== 'completed' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowFulfill(true);
                                                }}
                                                className="btn btn-primary"
                                                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                                            >
                                                Fulfill
                                            </button>
                                        )}
                                        <button
                                            onClick={async () => {
                                                const prog = prompt(`Update progress % (0-100) for ${order.orderId}:`, order.progress_percent || '0');
                                                if (prog === null) return;
                                                const link = prompt(`Delivery Report / Progress Link (Optional):`, order.report_link || '');
                                                if (link === null) return;

                                                await fetch('/api/admin/orders', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        action: 'update_progress',
                                                        orderId: order.orderId,
                                                        progress: parseInt(prog),
                                                        report_link: link
                                                    })
                                                });
                                                fetchData();
                                            }}
                                            className="btn btn-outline"
                                            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                                        >
                                            Progress
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>No orders found yet.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Fulfill Modal */}
            {showFulfill && selectedOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px', width: '500px', maxWidth: '90%' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Fulfill Order #{selectedOrder.orderId.slice(-6)}</h3>
                        <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>Send delivery details for <b>{selectedOrder.product_name}</b> to <b>{selectedOrder.guestEmail}</b>.</p>

                        <form onSubmit={handleFulfill}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#00ff88' }}>Credentials / Delivery Info</label>
                            <textarea
                                className="input-field"
                                rows={6}
                                placeholder="Enter Email:Password or Download Link here..."
                                value={fulfillDetails}
                                onChange={e => setFulfillDetails(e.target.value)}
                                required
                                style={{ width: '100%', marginBottom: '1.5rem', fontFamily: 'monospace' }}
                            />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowFulfill(false)} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-primary">Complete & Send Email</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
