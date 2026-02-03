"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';

export default function MyOrders() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [ticketIssue, setTicketIssue] = useState('Login Issue');
    const [ticketDesc, setTicketDesc] = useState('');

    useEffect(() => {
        // Check Auth
        const stored = localStorage.getItem('buyer_user');
        if (!stored) {
            router.push('/login');
            return;
        }
        const u = JSON.parse(stored);
        setUser(u);

        // Fetch Orders
        fetch(`/api/orders?userId=${u.id}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setOrders(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [router]);

    if (!user) return null;

    const handleReportIssue = (order: any) => {
        setSelectedOrder(order);
        setShowTicketModal(true);
    };

    const handleTicketSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/tickets/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    userEmail: user.email,
                    orderId: selectedOrder.orderId,
                    issue: ticketIssue,
                    description: ticketDesc
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("✅ Ticket created! We will contact you shortly.");
                setShowTicketModal(false);
                setTicketDesc('');
            } else {
                alert("Error: " + data.error);
            }
        } catch (e) { alert("Failed to create ticket."); }
    };

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px', minHeight: '80vh' }}>
                <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '3rem', marginBottom: '2rem' }}>My Orders</h1>

                {loading ? (
                    <div>Loading history...</div>
                ) : orders.length === 0 ? (
                    <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px' }}>
                        <h3>No orders found</h3>
                        <p style={{ color: '#888', margin: '1rem 0' }}>You haven't purchased anything yet.</p>
                        <a href="/" className="btn btn-primary">Browse Shop</a>
                    </div>
                ) : (
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem' }}>Order ID</th>
                                        <th style={{ padding: '1rem' }}>Product</th>
                                        <th style={{ padding: '1rem' }}>Date</th>
                                        <th style={{ padding: '1rem' }}>Amount</th>
                                        <th style={{ padding: '1rem' }}>Status</th>
                                        <th style={{ padding: '1rem' }}>Delivery</th>
                                        <th style={{ padding: '1rem' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.orderId} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#888' }}>
                                                #{order.orderId.substring(6)}
                                            </td>
                                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                    {order.productImage && <img src={order.productImage} alt="" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'contain' }} />}
                                                    <div>
                                                        <div>{order.productName || `Product #${order.productId}`}</div>
                                                        {order.productPlatform && <div style={{ fontSize: '0.7rem', color: '#666' }}>{order.productPlatform}</div>}
                                                    </div>
                                                </div>
                                                {order.quantity > 1 ? `(x${order.quantity})` : ''}
                                            </td>
                                            <td style={{ padding: '1rem', color: '#ccc' }}>
                                                {new Date(order.date).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem' }}>${order.amount}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                                    background: order.status === 'paid' ? 'green' : order.status === 'completed' ? 'blue' : 'orange',
                                                    color: 'white'
                                                }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {order.delivery_info ? (
                                                    <div style={{ maxWidth: '300px', fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px' }}>
                                                        {order.delivery_info}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#888', fontSize: '0.8rem' }}>Processing...</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <button
                                                    onClick={() => handleReportIssue(order)}
                                                    className="btn btn-outline"
                                                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderColor: '#ff4d4d', color: '#ff4d4d' }}
                                                >
                                                    Report Issue
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Ticket Modal */}
            {showTicketModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)', padding: '2rem' }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', borderRadius: '24px', position: 'relative', border: '1px solid #ff4d4d' }}>
                        <button onClick={() => setShowTicketModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>

                        <h2 style={{ marginBottom: '1.5rem', color: '#fff' }}>Report an Issue</h2>
                        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Order: #{selectedOrder?.orderId}<br />
                            We usually respond within 1 hour.
                        </p>

                        <form onSubmit={handleTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>Issue Type</label>
                                <select
                                    className="input-field"
                                    value={ticketIssue}
                                    onChange={e => setTicketIssue(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                    <option>Login Issue (Bad Pass/Email)</option>
                                    <option>Account Suspended/Banned</option>
                                    <option>Not Delivered Yet</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>Description</label>
                                <textarea
                                    className="input-field"
                                    placeholder="Please describe the problem in detail..."
                                    required
                                    value={ticketDesc}
                                    onChange={e => setTicketDesc(e.target.value)}
                                    style={{ width: '100%', height: '100px', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#ff4d4d', color: 'white', border: 'none' }}>
                                Submit Ticket
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </main>
    );
}
