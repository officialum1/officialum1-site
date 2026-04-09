"use client";

import { useState } from 'react';

interface SupportTabProps {
    tickets: any[];
    activeTicketId: number | null;
    setActiveTicketId: (id: number | null) => void;
    replyMsg: string;
    setReplyMsg: (msg: string) => void;
    handleReplyTicket: (id: number) => Promise<void>;
    handleCloseTicket: (id: number) => Promise<void>;
}

export default function SupportTab({
    tickets,
    activeTicketId,
    setActiveTicketId,
    replyMsg,
    setReplyMsg,
    handleReplyTicket,
    handleCloseTicket
}: SupportTabProps) {
    const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

    const filteredTickets = tickets.filter(t => {
        if (filter === 'all') return true;
        if (filter === 'open') return t.status === 'open';
        return t.status !== 'open';
    });

    const activeTicket = tickets.find(t => t.id === activeTicketId);

    return (
        <div className="FadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>🎫 Support Desk</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setFilter('all')}
                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('open')}
                        className={`btn ${filter === 'open' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', borderColor: filter === 'open' ? undefined : 'rgba(0,255,136,0.3)', color: filter === 'open' ? undefined : '#00ff88' }}
                    >
                        In Progress
                    </button>
                    <button
                        onClick={() => setFilter('closed')}
                        className={`btn ${filter === 'closed' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', borderColor: filter === 'closed' ? undefined : '#444' }}
                    >
                        Closed
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {filteredTickets.map((t: any) => (
                    <div
                        key={t.id}
                        className="glass"
                        onClick={() => setActiveTicketId(t.id)}
                        style={{
                            borderRadius: '12px',
                            padding: '1.5rem',
                            borderLeft: t.status === 'open' ? '3px solid #00ff88' : '3px solid #555',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'transform 0.2s',
                            background: activeTicketId === t.id ? 'rgba(0,255,136,0.05)' : undefined
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                                {t.subject}
                            </div>
                            <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: t.status === 'open' ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.05)',
                                color: t.status === 'open' ? '#00ff88' : '#666',
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                            }}>
                                {t.status}
                            </span>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                👤
                            </div>
                            <div>
                                <div style={{ color: '#ccc' }}>{t.email}</div>
                                <div style={{ fontSize: '0.7rem', color: '#555' }}>ID: {t.user_id}</div>
                            </div>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: '#aaa', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {t.message}
                        </div>

                        <div style={{ marginTop: '1rem', fontSize: '0.7rem', color: '#555', textAlign: 'right' }}>
                            {new Date(t.created_at || Date.now()).toLocaleDateString()}
                        </div>
                    </div>
                ))}

                {filteredTickets.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#666' }}>
                        No tickets found in this filtered view.
                    </div>
                )}
            </div>

            {/* Ticket Modal */}
            {activeTicket && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)', padding: '2rem' }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '700px', height: '80vh', display: 'flex', flexDirection: 'column', borderRadius: '20px', border: '1px solid #333', overflow: 'hidden' }}>

                        {/* Header */}
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, color: '#fff' }}>{activeTicket.subject}</h3>
                                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.3rem' }}>Ticket #{activeTicket.id} • {activeTicket.email}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                {activeTicket.status === 'open' && (
                                    <button
                                        onClick={() => handleCloseTicket(activeTicket.id)}
                                        className="btn btn-outline"
                                        style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', color: '#ff4444', borderColor: '#ff444433' }}
                                    >
                                        Close Ticket
                                    </button>
                                )}
                                <button onClick={() => setActiveTicketId(null)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Original Message */}
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>👤</div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.3rem' }}>{activeTicket.email}</div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0 12px 12px 12px', color: '#ddd', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                        {activeTicket.message}
                                    </div>
                                </div>
                            </div>

                            {/* Replies */}
                            {activeTicket.replies && activeTicket.replies.map((r: any, i: number) => (
                                <div key={i} style={{ display: 'flex', gap: '1rem', justifyContent: r.sender === 'admin' ? 'flex-end' : 'flex-start' }}>
                                    {r.sender !== 'admin' && <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>👤</div>}

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: r.sender === 'admin' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.3rem' }}>{r.sender === 'admin' ? 'Support Agent' : 'User'}</div>
                                        <div style={{
                                            background: r.sender === 'admin' ? 'linear-gradient(135deg, #00ff88 0%, #00ccff 100%)' : 'rgba(255,255,255,0.05)',
                                            color: r.sender === 'admin' ? '#000' : '#ddd',
                                            padding: '1rem',
                                            borderRadius: r.sender === 'admin' ? '12px 0 12px 12px' : '0 12px 12px 12px',
                                            fontSize: '0.9rem',
                                            lineHeight: '1.5',
                                            fontWeight: r.sender === 'admin' ? '500' : 'normal'
                                        }}>
                                            {r.message}
                                        </div>
                                    </div>

                                    {r.sender === 'admin' && <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#00ccff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold', fontSize: '0.7rem', flexShrink: 0 }}>S</div>}
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    placeholder="Type your reply here..."
                                    className="input-field"
                                    value={replyMsg}
                                    onChange={e => setReplyMsg(e.target.value)}
                                    style={{ flex: 1, padding: '0.8rem 1rem' }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleReplyTicket(activeTicket.id);
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => handleReplyTicket(activeTicket.id)}
                                    className="btn btn-primary"
                                    disabled={!replyMsg.trim()}
                                    style={{ padding: '0 1.5rem' }}
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
