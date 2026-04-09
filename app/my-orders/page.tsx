"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { PageHero } from '@/components/ui/PageHero';

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
            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'My Orders' }]}
                    label="Orders"
                    title={<>My Orders</>}
                    description="See your order history, delivery status, and report issues if something isn’t right."
                />

                <section className="py-[120px]" style={{ background: 'var(--bg-alt)' }}>
                    <div className="container" style={{ minHeight: '60vh' }}>

                {loading ? (
                    <div>Loading history...</div>
                ) : orders.length === 0 ? (
                    <div className="card p-10 text-center">
                        <h3>No orders found</h3>
                        <p style={{ margin: '1rem 0' }}>You haven't purchased anything yet.</p>
                        <a href="/shop" className="btn-primary">Browse Shop</a>
                    </div>
                ) : (
                    <div className="card p-8">
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#F9FAFB', textAlign: 'left' }}>
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
                                        <tr key={order.orderId} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#6B7280' }}>
                                                #{order.orderId.substring(6)}
                                            </td>
                                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                    {order.productImage && <img src={order.productImage} alt="" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'contain' }} />}
                                                    <div>
                                                        <div>{order.productName || `Product #${order.productId}`}</div>
                                                        {order.productPlatform && <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{order.productPlatform}</div>}
                                                    </div>
                                                </div>
                                                {order.quantity > 1 ? `(x${order.quantity})` : ''}
                                            </td>
                                            <td style={{ padding: '1rem', color: '#111827' }}>
                                                {new Date(order.date).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem' }}>${order.amount}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.35rem 0.7rem',
                                                    borderRadius: '999px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 'bold',
                                                    background: order.status === 'paid' ? 'rgba(16,185,129,0.12)' : order.status === 'completed' ? 'rgba(37,99,235,0.10)' : 'rgba(245,158,11,0.12)',
                                                    color: order.status === 'paid' ? '#10B981' : order.status === 'completed' ? '#2563EB' : '#F59E0B',
                                                    border: '1px solid #E5E7EB'
                                                }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {order.delivery_info ? (
                                                    <div style={{ maxWidth: '300px', fontSize: '0.85rem', background: '#F9FAFB', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E5E7EB', color: '#111827' }}>
                                                        {order.delivery_info}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#6B7280', fontSize: '0.85rem' }}>Processing...</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <button
                                                    onClick={() => handleReportIssue(order)}
                                                    className="btn-outline"
                                                    style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem', borderColor: 'rgba(239,68,68,0.35)', color: 'var(--error)' }}
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
                </section>
            </div>

            {/* Ticket Modal */}
            {showTicketModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)', padding: '2rem' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '560px', padding: '2.5rem', borderRadius: '24px', position: 'relative', border: '1px solid rgba(239,68,68,0.35)' }}>
                        <button onClick={() => setShowTicketModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>

                        <h2 style={{ marginBottom: '1.5rem', color: '#111827' }}>Report an Issue</h2>
                        <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Order: #{selectedOrder?.orderId}<br />
                            We usually respond within 1 hour.
                        </p>

                        <form onSubmit={handleTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6B7280', fontSize: '0.9rem' }}>Issue Type</label>
                                <select
                                    className="input-field"
                                    value={ticketIssue}
                                    onChange={e => setTicketIssue(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: '#fff', color: '#111827', border: '1px solid #E5E7EB' }}
                                >
                                    <option>Login Issue (Bad Pass/Email)</option>
                                    <option>Account Suspended/Banned</option>
                                    <option>Not Delivered Yet</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6B7280', fontSize: '0.9rem' }}>Description</label>
                                <textarea
                                    className="input-field"
                                    placeholder="Please describe the problem in detail..."
                                    required
                                    value={ticketDesc}
                                    onChange={e => setTicketDesc(e.target.value)}
                                    style={{ width: '100%', height: '110px', padding: '0.8rem', borderRadius: '12px', background: '#fff', color: '#111827', border: '1px solid #E5E7EB' }}
                                />
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%', background: 'var(--error)', color: 'white', border: 'none' }}>
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
