"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<'orders' | 'support'>('orders');
    const [user, setUser] = useState<any>(null);

    // Orders State
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    // Tickets State
    const [tickets, setTickets] = useState<any[]>([]);
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [showCreateTicket, setShowCreateTicket] = useState(false);

    // New Ticket Form
    const [newSubject, setNewSubject] = useState('');
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        // Check Login
        const stored = localStorage.getItem('buyer_user');
        if (!stored) {
            window.location.href = '/login';
            return;
        }
        const u = JSON.parse(stored);
        setUser(u);

        // Fetch Orders
        fetch(`/api/orders?userId=${u.id}&email=${u.email}`)
            .then(res => res.json())
            .then(data => { setOrders(data); setLoadingOrders(false); });

        // Fetch Tickets
        fetch(`/api/tickets?email=${u.email}`)
            .then(res => res.json())
            .then(data => { setTickets(data); });

    }, []);

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        await fetch('/api/tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: user.id,
                email: user.email,
                subject: newSubject,
                message: newMessage
            })
        });

        // Refresh
        const res = await fetch(`/api/tickets?email=${user.email}`);
        setTickets(await res.json());
        setShowCreateTicket(false);
        setNewSubject('');
        setNewMessage('');
        alert('Ticket Created!');
    };

    return (
        <main style={{ minHeight: '100vh', background: '#050505', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px', flex: 1 }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '3rem', fontWeight: 'bold', background: 'linear-gradient(to right, #fff, #999)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Dashboard
                        </h1>
                        <p style={{ fontFamily: 'var(--font-inter)', color: '#888' }}>
                            Welcome, <span style={{ color: '#fff' }}>{user?.email}</span>
                        </p>
                    </div>
                    <button
                        onClick={() => { localStorage.removeItem('buyer_user'); window.location.href = '/login'; }}
                        className="btn btn-outline"
                        style={{ fontSize: '0.9rem' }}
                    >
                        Sign Out
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1px' }}>
                    <button
                        onClick={() => setActiveTab('orders')}
                        style={{
                            padding: '1rem 2rem',
                            background: 'transparent',
                            color: activeTab === 'orders' ? '#00ff88' : '#888',
                            borderBottom: activeTab === 'orders' ? '2px solid #00ff88' : 'none',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        My Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('support')}
                        style={{
                            padding: '1rem 2rem',
                            background: 'transparent',
                            color: activeTab === 'support' ? '#06b6d4' : '#888',
                            borderBottom: activeTab === 'support' ? '2px solid #06b6d4' : 'none',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Support Tickets
                    </button>
                </div>

                {/* CONTENT: ORDERS */}
                {activeTab === 'orders' && (
                    <>
                        {loadingOrders ? (
                            <div style={{ textAlign: 'center', color: '#888', padding: '4rem' }}>Loading...</div>
                        ) : orders.length === 0 ? (
                            <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '24px' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
                                <h3>No Orders Yet</h3>
                                <Link href="/shop" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Shop Now</Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {orders.map(order => (
                                    <div key={order.orderId} className="glass" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ color: '#666', fontSize: '0.8rem' }}>Order #{order.orderId}</div>
                                                <h3 style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>{order.productId}</h3>
                                                <div style={{ color: order.status === 'paid' ? '#00ff88' : '#ffaa00' }}>{order.status.toUpperCase()}</div>
                                            </div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${order.amount}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* CONTENT: SUPPORT */}
                {activeTab === 'support' && (
                    <>
                        <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                            <button onClick={() => setShowCreateTicket(!showCreateTicket)} className="btn btn-primary">
                                {showCreateTicket ? 'Cancel' : '+ New Ticket'}
                            </button>
                        </div>

                        {showCreateTicket && (
                            <div className="glass" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid rgba(6,182,212,0.3)' }}>
                                <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-outfit)' }}>Open a New Ticket</h3>
                                <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <input
                                        placeholder="Subject (e.g. Order #123 Issue)"
                                        className="input-field"
                                        value={newSubject}
                                        onChange={e => setNewSubject(e.target.value)}
                                        required
                                    />
                                    <textarea
                                        placeholder="Describe your issue..."
                                        className="input-field"
                                        style={{ height: '100px' }}
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        required
                                    ></textarea>
                                    <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>Submit Ticket</button>
                                </form>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {tickets.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No tickets found. Need help? Open a ticket.</div>
                            ) : (
                                tickets.map(ticket => (
                                    <div key={ticket.id} className="glass" style={{ padding: '2rem', borderRadius: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>{ticket.subject}</h3>
                                            <span style={{
                                                background: ticket.status === 'open' ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.1)',
                                                color: ticket.status === 'open' ? '#00ff88' : '#888',
                                                padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem'
                                            }}>
                                                {ticket.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', color: '#ccc' }}>
                                            {ticket.message}
                                        </div>

                                        {/* Replies */}
                                        {ticket.replies && ticket.replies.length > 0 && (
                                            <div style={{ marginLeft: '1rem', borderLeft: '2px solid #333', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {ticket.replies.map((r: any, i: number) => (
                                                    <div key={i} style={{ background: r.sender === 'admin' ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '8px' }}>
                                                        <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.3rem' }}>
                                                            {r.sender === 'admin' ? 'Support Team' : 'You'} • {new Date(r.date).toLocaleDateString()}
                                                        </div>
                                                        <div style={{ color: '#ddd' }}>{r.message}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
            <Footer />
        </main>
    );
}
