"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';

export default function SupportPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [tickets, setTickets] = useState<any[]>([]);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTicket, setActiveTicket] = useState<number | null>(null);
    const [replyMsg, setReplyMsg] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('buyer_user');
        if (!stored) { router.push('/login'); return; }
        const u = JSON.parse(stored);
        setUser(u);
        fetchTickets(u.id);
    }, []);

    const fetchTickets = async (userId: string) => {
        try {
            const res = await fetch(`/api/tickets?userId=${userId}`);
            if (res.ok) setTickets(await res.json());
        } catch { }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, email: user.email, subject, message })
            });
            setSubject(''); setMessage('');
            fetchTickets(user.id);
            alert('Ticket Created');
        } catch { alert('Failed to create ticket'); }
        setIsSubmitting(false);
    };

    const handleReply = async (ticketId: number) => {
        if (!replyMsg) return;
        try {
            await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reply', ticketId, message: replyMsg, sender: 'user' })
            });
            setReplyMsg('');
            fetchTickets(user.id);
        } catch { alert('Failed to send reply'); }
    };

    if (!user) return null;

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px', minHeight: '80vh' }}>
                <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '3rem', marginBottom: '1rem' }}>Support Center</h1>
                <p style={{ color: '#aaa', marginBottom: '3rem' }}>Need help? Create a ticket and we'll get back to you efficiently.</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>

                    {/* Create Ticket */}
                    <div>
                        <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Create New Ticket</h2>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} className="input-field" required />
                                <textarea placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} className="input-field" style={{ height: '150px' }} required />
                                <button type="submit" disabled={isSubmitting} className="btn btn-primary">{isSubmitting ? 'Sending...' : 'Submit Ticket'}</button>
                            </form>
                        </div>
                    </div>

                    {/* My Tickets */}
                    <div>
                        <h2 style={{ marginBottom: '1.5rem' }}>My Tickets</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {tickets.length === 0 && <p style={{ color: '#666' }}>No tickets yet.</p>}
                            {tickets.map(t => (
                                <div key={t.id} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: t.status === 'open' ? '4px solid #00ff88' : '4px solid #555' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', cursor: 'pointer' }} onClick={() => setActiveTicket(activeTicket === t.id ? null : t.id)}>
                                        <h4 style={{ color: '#fff' }}>{t.subject}</h4>
                                        <span style={{ fontSize: '0.8rem', color: t.status === 'open' ? '#00ff88' : '#888' }}>{t.status.toUpperCase()}</span>
                                    </div>

                                    {activeTicket === t.id && (
                                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', color: '#ccc', marginBottom: '1rem' }}>
                                                {t.message}
                                            </div>

                                            {/* Replies */}
                                            {t.replies && t.replies.map((r: any, i: number) => (
                                                <div key={i} style={{ marginBottom: '0.5rem', textAlign: r.sender === 'user' ? 'right' : 'left' }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#666' }}>{r.sender === 'user' ? 'You' : 'Admin'}</span>
                                                    <div style={{ background: r.sender === 'user' ? '#06b6d4' : '#333', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', display: 'inline-block', maxWidth: '80%' }}>
                                                        {r.message}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Reply Box */}
                                            {t.status === 'open' && (
                                                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                                    <input placeholder="Reply..." value={replyMsg} onChange={e => setReplyMsg(e.target.value)} className="input-field" style={{ flex: 1 }} />
                                                    <button onClick={() => handleReply(t.id)} className="btn btn-outline">Send</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
