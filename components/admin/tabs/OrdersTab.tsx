"use client";

import { useState } from 'react';
import { modernAlert, modernConfirm, modernPrompt } from '@/components/ModernUIOverlay';

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
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

    const filteredOrders = orders.filter(o => {
        if (filter === 'all') return true;
        if (filter === 'pending') return o.status !== 'completed';
        return o.status === 'completed';
    });

    const pendingCount = orders.filter(o => o.status !== 'completed').length;
    const completedCount = orders.filter(o => o.status === 'completed').length;

    return (
        <div className="FadeIn">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(255,165,0,0.1) 0%, transparent 100%)', border: '1px solid rgba(255,165,0,0.2)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Pending Fulfillment</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffa500' }}>{pendingCount}</div>
                </div>
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(0,255,136,0.1) 0%, transparent 100%)', border: '1px solid rgba(0,255,136,0.2)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Completed Orders</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00ff88' }}>{completedCount}</div>
                </div>
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Revenue</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>${orders.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0).toLocaleString()}</div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontFamily: 'var(--font-outfit)' }}>📦 Order Management</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setFilter('all')}
                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '0.4rem 1.2rem', fontSize: '0.8rem' }}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '0.4rem 1.2rem', fontSize: '0.8rem', borderColor: filter === 'pending' ? undefined : 'rgba(255,165,0,0.3)', color: filter === 'pending' ? undefined : '#ffa500' }}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '0.4rem 1.2rem', fontSize: '0.8rem', borderColor: filter === 'completed' ? undefined : 'rgba(0,255,136,0.3)', color: filter === 'completed' ? undefined : '#00ff88' }}
                    >
                        Completed
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredOrders.map((order: any) => (
                    <div key={order.orderId} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: order.status === 'completed' ? '4px solid #00ff88' : '4px solid #ffa500', transition: 'transform 0.2s' }}>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                            <div style={{
                                width: '50px', height: '50px',
                                background: order.status === 'completed' ? 'rgba(0,255,136,0.1)' : 'rgba(255,165,0,0.1)',
                                borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem'
                            }}>
                                {order.status === 'completed' ? '✅' : '📦'}
                            </div>

                            <div>
                                <h4 style={{ margin: '0 0 0.3rem 0', color: '#fff' }}>{order.product_name}</h4>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#888' }}>
                                    <span>#{order.orderId ? order.orderId.slice(-6) : 'N/A'}</span>
                                    <span>•</span>
                                    <span>{new Date(order.date).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span style={{ color: '#ccc' }}>{order.guestEmail || order.user_email || 'Unknown'}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.2rem' }}>STATUS</div>
                                <div style={{
                                    color: order.status === 'completed' ? '#00ff88' : (order.status === 'cancelled' ? '#ff4444' : (order.status === 'processing' ? '#ff4d4d' : '#ffa500')),
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    fontSize: '0.9rem'
                                }}>
                                    {order.status === 'processing' ? 'ACTION REQUIRED' : (order.status === 'completed' ? 'COMPLETED' : (order.status === 'cancelled' ? 'CANCELLED' : order.status || 'PENDING'))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {order.status !== 'completed' && (
                                    <button
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setShowFulfill(true);
                                        }}
                                        className="btn btn-primary"
                                        style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem', boxShadow: '0 4px 14px rgba(0,255,136,0.2)' }}
                                    >
                                        Fulfill Order
                                    </button>
                                )}
                                <button
                                    onClick={async () => {
                                        const prog = await modernPrompt(`Update progress % (0-100) for ${order.orderId}:`, order.progress_percent || '0');
                                        if (prog === null) return;
                                        const link = await modernPrompt(`Delivery Report / Progress Link (Optional):`, order.report_link || '');
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
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                >
                                    Update Progress
                                </button>
                                {order.status !== 'cancelled' && order.status !== 'completed' && (
                                    <button
                                        onClick={async () => {
                                            if (!(await modernConfirm('Are you sure you want to CANCEL this order? This cannot be undone.'))) return;
                                            await fetch('/api/admin/orders', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    action: 'cancel_order',
                                                    orderId: order.orderId
                                                })
                                            });
                                            fetchData();
                                        }}
                                        className="btn btn-outline"
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#ff4444', borderColor: '#ff444433' }}
                                    >
                                        Cancel Order
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {filteredOrders.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#666', border: '1px dashed #333', borderRadius: '16px' }}>
                        No orders found in this category.
                    </div>
                )}
            </div>

            {/* Fulfill Modal with Animation */}
            {showFulfill && selectedOrder && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1000, backdropFilter: 'blur(5px)',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div className="glass" style={{
                        padding: '2.5rem',
                        borderRadius: '20px',
                        width: '550px',
                        maxWidth: '90%',
                        border: '1px solid rgba(0,255,136,0.3)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.4rem' }}>Fulfill Order</h3>
                                <div style={{ color: '#00ff88', fontSize: '0.9rem', marginTop: '0.3rem' }}>#{selectedOrder.orderId.slice(-6)}</div>
                            </div>
                            <button onClick={() => setShowFulfill(false)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#ccc' }}>
                            Sending <b>{selectedOrder.product_name}</b> to <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedOrder.guestEmail}</span>
                        </div>

                        <form onSubmit={handleFulfill}>
                            <label style={{ display: 'block', marginBottom: '0.8rem', color: '#aaa', fontSize: '0.9rem' }}>Delivery Content / Credentials</label>
                            <textarea
                                className="input-field"
                                rows={6}
                                placeholder="Email:Password&#10;Recovery Code: ...&#10;Download Link: ..."
                                value={fulfillDetails}
                                onChange={e => setFulfillDetails(e.target.value)}
                                required
                                style={{ width: '100%', marginBottom: '2rem', fontFamily: 'monospace', fontSize: '0.95rem', lineHeight: '1.6', padding: '1rem' }}
                            />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowFulfill(false)} className="btn btn-outline" style={{ padding: '0.8rem 1.5rem' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontWeight: 'bold' }}>Complete & Send 🚀</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modalSlideUp { from { transform: translateY(40px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
}
