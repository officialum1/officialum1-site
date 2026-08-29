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
        <main style={{ background: '#030305', minHeight: '100vh' }}>
            <Navbar />
            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'My Orders' }]}
                    label="History"
                    title={<>Order <span style={{color: '#ff4444'}}>Vault</span></>}
                    description="View live delivery streams, decrypt assets, and access instantaneous support conduits."
                />

                <section className="py-[100px]" style={{ background: 'linear-gradient(to bottom, #030305, #08080a)' }}>
                    <div className="container" style={{ minHeight: '60vh' }}>

                {loading ? (
                    <div style={{ color: '#94a3b8', textAlign: 'center', padding: '4rem' }}>Accessing decrypted database...</div>
                ) : orders.length === 0 ? (
                    <div style={{ 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid rgba(255,255,255,0.05)', 
                        borderRadius: '24px', 
                        padding: '4rem', 
                        textAlign: 'center' 
                    }}>
                        <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>No transactional data</h3>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Your commercial history is currently empty. Initialize acquiring protocol.</p>
                        <a href="/shop" style={{ 
                            padding: '1rem 2.5rem', 
                            background: '#ff4444', 
                            color: '#fff', 
                            borderRadius: '50px', 
                            fontWeight: '800', 
                            textDecoration: 'none',
                            boxShadow: '0 10px 25px rgba(255,68,68,0.2)'
                        }}>Browse Arsenal</a>
                    </div>
                ) : (
                    <div style={{ 
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.2) 100%)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '32px',
                        padding: '2rem',
                        backdropFilter: 'blur(20px)'
                    }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left' }}>
                                        <th style={{ padding: '1.5rem 1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Hash ID</th>
                                        <th style={{ padding: '1.5rem 1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Component</th>
                                        <th style={{ padding: '1.5rem 1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Timestamp</th>
                                        <th style={{ padding: '1.5rem 1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Debit</th>
                                        <th style={{ padding: '1.5rem 1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Status</th>
                                        <th style={{ padding: '1.5rem 1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Terminal Output</th>
                                        <th style={{ padding: '1.5rem 1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Control</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.orderId} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} className="hover:bg-white/5">
                                            <td style={{ padding: '1.5rem 1rem', fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.85rem' }}>
                                                #{order.orderId.substring(6)}
                                            </td>
                                            <td style={{ padding: '1.5rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    {order.productImage && <img src={order.productImage} alt="" style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'contain', background: 'rgba(0,0,0,0.5)', padding: '4px' }} />}
                                                    <div>
                                                        <div style={{ fontWeight: '800', color: '#fff', fontSize: '0.95rem' }}>{order.productName || `Module ID: ${order.productId}`}</div>
                                                        {order.productPlatform && <div style={{ fontSize: '0.7rem', color: '#ff4444', fontWeight: 'bold', textTransform: 'uppercase' }}>{order.productPlatform}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem 1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                                                {new Date(order.date).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1.5rem 1rem', fontWeight: '800', color: '#fff' }}>${order.amount}</td>
                                            <td style={{ padding: '1.5rem 1rem' }}>
                                                <span style={{
                                                    padding: '0.4rem 0.8rem',
                                                    borderRadius: '6px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '900',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1px',
                                                    background: order.status === 'paid' ? 'rgba(0,255,136,0.1)' : order.status === 'completed' ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)',
                                                    color: order.status === 'paid' || order.status === 'completed' ? '#00ff88' : '#ff4444',
                                                    border: '1px solid currentColor'
                                                }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.5rem 1rem' }}>
                                                {order.delivery_info ? (
                                                    <div style={{ maxWidth: '300px', fontSize: '0.8rem', background: 'rgba(0,0,0,0.4)', padding: '0.8rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', fontFamily: 'monospace' }}>
                                                        {order.delivery_info}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>Synchronizing payload...</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1.5rem 1rem' }}>
                                                <button
                                                    onClick={() => handleReportIssue(order)}
                                                    style={{ 
                                                        fontSize: '0.75rem', 
                                                        padding: '0.5rem 1rem', 
                                                        border: '1px solid rgba(255,68,68,0.3)', 
                                                        color: '#ff4444',
                                                        background: 'transparent',
                                                        borderRadius: '8px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    className="hover:bg-red-500/10"
                                                >
                                                    Open Signal
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

            {/* Ticket Modal - REDESIGNED */}
            {showTicketModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(12px)', padding: '2rem' }}>
                    <div style={{ 
                        width: '100%', 
                        maxWidth: '500px', 
                        padding: '3rem 2.5rem', 
                        borderRadius: '32px', 
                        position: 'relative', 
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.8) 100%)',
                        border: '1px solid rgba(255,68,68,0.3)',
                        boxShadow: '0 25px 50px -12px rgba(255,68,68,0.25)'
                    }}>
                        <button onClick={() => setShowTicketModal(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

                        <h2 style={{ marginBottom: '0.75rem', color: '#fff', fontWeight: '900' }}>Broadcast Alert</h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>
                            Node Vector: <span style={{color: '#ff4444', fontFamily: 'monospace'}}>#{selectedOrder?.orderId}</span><br />
                            Critical Priority Response Sequence activated.
                        </p>

                        <form onSubmit={handleTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Threat Classification</label>
                                <select
                                    value={ticketIssue}
                                    onChange={e => setTicketIssue(e.target.value)}
                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', outline: 'none' }}
                                >
                                    <option style={{background: '#111'}}>Auth Interface Failure</option>
                                    <option style={{background: '#111'}}>Asset Deprecation (Suspended)</option>
                                    <option style={{background: '#111'}}>Latency / Delivery Halt</option>
                                    <option style={{background: '#111'}}>Other Logic Error</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Telemetry Data</label>
                                <textarea
                                    placeholder="Describe the anomaly in maximum available detail..."
                                    required
                                    value={ticketDesc}
                                    onChange={e => setTicketDesc(e.target.value)}
                                    style={{ width: '100%', height: '120px', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', resize: 'none', fontFamily: 'inherit', outline: 'none' }}
                                />
                            </div>
                            <button type="submit" style={{ 
                                width: '100%', 
                                padding: '1.2rem', 
                                borderRadius: '16px', 
                                background: '#ff4444', 
                                color: '#fff', 
                                border: 'none', 
                                fontWeight: '900', 
                                fontSize: '1rem', 
                                cursor: 'pointer',
                                boxShadow: '0 10px 25px rgba(255,68,68,0.3)'
                            }}>
                                Dispatch Agent
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </main>
    );
}
