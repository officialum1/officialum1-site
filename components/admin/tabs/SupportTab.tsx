"use client";

interface SupportTabProps {
    tickets: any[];
    activeTicketId: number | null;
    setActiveTicketId: (id: number | null) => void;
    replyMsg: string;
    setReplyMsg: (msg: string) => void;
    handleReplyTicket: (id: number) => Promise<void>;
}

export default function SupportTab({
    tickets,
    activeTicketId,
    setActiveTicketId,
    replyMsg,
    setReplyMsg,
    handleReplyTicket
}: SupportTabProps) {
    return (
        <div className="FadeIn">
            <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden', padding: '2rem' }}>
                <h2 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>Support Tickets</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {tickets.length === 0 && <p style={{ color: '#666' }}>No tickets found.</p>}
                    {tickets.map((t: any) => (
                        <div key={t.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', borderLeft: t.status === 'open' ? '4px solid #00ff88' : '4px solid #555' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', alignItems: 'center' }} onClick={() => setActiveTicketId(activeTicketId === t.id ? null : t.id)}>
                                <div>
                                    <h4 style={{ color: '#fff', marginBottom: '0.2rem' }}>{t.subject}</h4>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>User: {t.email} (ID: {t.user_id})</div>
                                </div>
                                <span style={{ padding: '4px 8px', borderRadius: '4px', background: t.status === 'open' ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.1)', color: t.status === 'open' ? '#00ff88' : '#aaa', fontSize: '0.8rem' }}>{t.status.toUpperCase()}</span>
                            </div>

                            {activeTicketId === t.id && (
                                <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                                    <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', color: '#ccc', marginBottom: '1rem' }}>
                                        {t.message}
                                    </div>
                                    {/* Replies */}
                                    <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {t.replies && t.replies.map((r: any, i: number) => (
                                            <div key={i} style={{ alignSelf: r.sender === 'admin' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '2px', textAlign: r.sender === 'admin' ? 'right' : 'left' }}>{r.sender === 'admin' ? 'You' : 'User'}</div>
                                                <div style={{ background: r.sender === 'admin' ? '#00ff88' : '#333', color: r.sender === 'admin' ? '#000' : '#fff', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                                                    {r.message}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <input placeholder="Type a reply..." value={replyMsg} onChange={e => setReplyMsg(e.target.value)} className="input-field" style={{ flex: 1 }} />
                                        <button onClick={() => handleReplyTicket(t.id)} className="btn btn-primary">Send Reply</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
