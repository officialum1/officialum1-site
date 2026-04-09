"use client";

interface LeadsTabProps {
    leads: any[];
    fetchData: (user?: any) => Promise<void>;
}

export default function LeadsTab({ leads, fetchData }: LeadsTabProps) {
    return (
        <div className="FadeIn">
            {/* Discovery Header */}
            <div className="glass" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2.5rem', border: '1px solid rgba(0, 255, 136, 0.2)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(0, 255, 136, 0.05)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <span style={{ fontSize: '2.5rem' }}>🎯</span> Business Lead Discovery
                        </h2>
                        <p style={{ color: '#888', fontSize: '1rem' }}>Manage your CRM and discover high-value corporate clients automatically.</p>
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ background: 'linear-gradient(45deg, #00ff88, #00ccff)', padding: '1rem 2rem', fontWeight: 'bold', border: 'none', boxShadow: '0 10px 30px rgba(0,255,136,0.3)' }}
                        onClick={() => alert("AI Lead Search Engine is scanning the web for new targets...")}
                    >
                        🔍 DISCOVER NEW LEADS
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginTop: '2.5rem' }}>
                    {[
                        { label: 'Total Leads', val: leads.length, color: '#fff' },
                        { label: 'New Targets', val: leads.filter((l: any) => l.status === 'New').length, color: '#00ccff' },
                        { label: 'In Pipeline', val: leads.filter((l: any) => l.status === 'In Progress').length, color: '#ffd700' },
                        { label: 'Potential Revenue', val: `$${leads.reduce((sum: number, l: any) => sum + Number(l.budget || 0), 0).toLocaleString()}`, color: '#00ff88' }
                    ].map((s, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>{s.label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: s.color }}>{s.val}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Leads Table */}
                <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>Active Lead Database</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>📥 Export</button>
                            <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>📤 Import CSV</button>
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #222', background: 'rgba(255,255,255,0.02)' }}>
                                    <th style={{ padding: '1.2rem', color: '#666', fontSize: '0.85rem' }}>CLIENT / COMPANY</th>
                                    <th style={{ padding: '1.2rem', color: '#666', fontSize: '0.85rem' }}>PLATFORM / NICHE</th>
                                    <th style={{ padding: '1.2rem', color: '#666', fontSize: '0.85rem' }}>BUDGET</th>
                                    <th style={{ padding: '1.2rem', color: '#666', fontSize: '0.85rem' }}>STATUS</th>
                                    <th style={{ padding: '1.2rem', color: '#666', fontSize: '0.85rem' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead: any) => (
                                    <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '1.2rem' }}>
                                            <div style={{ fontWeight: 'bold', color: '#fff' }}>{lead.clientName}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '4px' }}>
                                                {lead.lighthouse_score ? (
                                                    <span style={{ color: Number(lead.lighthouse_score) > 80 ? '#00ff88' : '#ff4444' }}>
                                                        Lighthouse: {lead.lighthouse_score}%
                                                    </span>
                                                ) : 'No Audit'}
                                                {lead.buyerEmail && <div style={{ color: '#00ccff', fontSize: '0.7rem' }}>📧 {lead.buyerEmail}</div>}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <span style={{ fontSize: '0.9rem', color: '#aaa' }}>{lead.platform}</span>
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <span style={{ color: '#00ff88', fontWeight: 'bold' }}>${Number(lead.budget).toLocaleString()}</span>
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                background: lead.status === 'New' ? 'rgba(0,255,136,0.1)' : 'rgba(255,215,0,0.1)',
                                                color: lead.status === 'New' ? '#00ff88' : '#ffd700',
                                                border: `1px solid ${lead.status === 'New' ? 'rgba(0,255,136,0.2)' : 'rgba(255,215,0,0.2)'}`
                                            }}>
                                                {lead.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    title="Audit Website"
                                                    onClick={async () => {
                                                        const res = await fetch('/api/leads', { method: 'POST', body: JSON.stringify({ action: 'run_audit', id: lead.id }) });
                                                        if (res.ok) fetchData();
                                                    }}
                                                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer', padding: '5px', borderRadius: '5px' }}
                                                >🔍</button>
                                                <button
                                                    title="Generate AI Pitch"
                                                    onClick={async () => {
                                                        const res = await fetch('/api/leads', { method: 'POST', body: JSON.stringify({ action: 'generate_pitch', id: lead.id }) });
                                                        if (res.ok) {
                                                            const data = await res.json();
                                                            alert(`PERSONALIZED PITCH:\n\n${data.pitch}`);
                                                            fetchData();
                                                        }
                                                    }}
                                                    style={{ background: 'rgba(0,255,136,0.1)', border: 'none', color: '#00ff88', cursor: 'pointer', padding: '5px', borderRadius: '5px' }}
                                                >🤖</button>
                                                <button
                                                    title="Set Document Link"
                                                    onClick={async () => {
                                                        const link = prompt("Enter URL for formation documents:", lead.document_link || '');
                                                        if (link !== null) {
                                                            await fetch('/api/leads', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({
                                                                    action: 'update_status',
                                                                    id: lead.id,
                                                                    status: lead.status,
                                                                    notes: lead.notes,
                                                                    budget: lead.budget,
                                                                    document_link: link
                                                                })
                                                            });
                                                            fetchData();
                                                        }
                                                    }}
                                                    style={{ background: lead.document_link ? 'rgba(0,195,255,0.1)' : 'rgba(255,255,255,0.05)', border: 'none', color: lead.document_link ? '#00c3ff' : '#fff', cursor: 'pointer', padding: '5px', borderRadius: '5px' }}
                                                >📄</button>
                                                <button
                                                    onClick={async () => {
                                                        const n = prompt("Edit notes for this lead:", lead.notes);
                                                        if (n !== null) {
                                                            await fetch('/api/leads', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({
                                                                    action: 'update_status',
                                                                    id: lead.id,
                                                                    status: lead.status,
                                                                    notes: n,
                                                                    budget: lead.budget,
                                                                    document_link: lead.document_link
                                                                })
                                                            });
                                                            fetchData();
                                                        }
                                                    }}
                                                    style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '1.1rem' }}
                                                >⚙️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {leads.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: '#444' }}>
                                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                                            No leads in the database. Use Discovery to find some!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Discovery Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 style={{ marginBottom: '1rem', color: '#00ff88' }}>⚡ Fast Add Lead</h4>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const f = new FormData(e.target as HTMLFormElement);
                            const res = await fetch('/api/leads', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    action: 'add',
                                    clientName: f.get('name'),
                                    platform: f.get('niche'),
                                    budget: f.get('budget'),
                                    notes: f.get('notes')
                                })
                            });
                            if (res.ok) { (e.target as HTMLFormElement).reset(); fetchData(); }
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <input name="name" placeholder="Contact/Company Name" className="input-field" required style={{ width: '100%' }} />
                            <input name="niche" placeholder="Niche (e.g. Crypto/SaaS)" className="input-field" style={{ width: '100%' }} />
                            <input name="budget" type="number" placeholder="Estimated Budget ($)" className="input-field" style={{ width: '100%' }} />
                            <textarea name="notes" placeholder="Notes..." className="input-field" style={{ width: '100%', height: '80px' }} />
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>ADD LEAD</button>
                        </form>
                    </div>

                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', background: 'linear-gradient(180deg, rgba(0,255,136,0.05), transparent)' }}>
                        <h4 style={{ marginBottom: '1rem' }}>📈 Lead Generation Tips</h4>
                        <div style={{ fontSize: '0.85rem', color: '#888', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <span style={{ color: '#00ff88' }}>💡</span>
                                <span>Target <b>Monad Early Projects</b> for Next.js dev services. High budget and early stage.</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <span style={{ color: '#00ff88' }}>💡</span>
                                <span>Audit <b>Shopify stores</b> with &gt; 2s LCP and offer Speed Optimization.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
