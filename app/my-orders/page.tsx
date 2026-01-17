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
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.orderId} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#888' }}>
                                                #{order.orderId.substring(6)}
                                            </td>
                                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                                {/* In a real app, join with products table to get Name */}
                                                Product #{order.productId} {order.quantity > 1 ? `(x${order.quantity})` : ''}
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
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}
