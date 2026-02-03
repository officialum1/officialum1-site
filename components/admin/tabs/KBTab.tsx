"use client";

interface KBTabProps {
    showAddKb: boolean;
    setShowAddKb: (show: boolean) => void;
    kbForm: any;
    setKbForm: (form: any) => void;
    isGeneratingKb: boolean;
    setIsGeneratingKb: (gen: boolean) => void;
    handleKbSubmit: (e: any) => Promise<void>;
    kbArticles: any[];
    handleDeleteKb: (id: string) => Promise<void>;
}

export default function KBTab({
    showAddKb,
    setShowAddKb,
    kbForm,
    setKbForm,
    isGeneratingKb,
    setIsGeneratingKb,
    handleKbSubmit,
    kbArticles,
    handleDeleteKb
}: KBTabProps) {
    return (
        <div className="FadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: '#00ff88' }}>📚 Knowledge Base & FAQ</h2>
                <button onClick={() => setShowAddKb(!showAddKb)} className="btn btn-primary">{showAddKb ? 'Cancel' : '+ Add Article'}</button>
            </div>

            {showAddKb && (
                <div className="glass" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid rgba(0,255,136,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, color: '#00ff88' }}>Create New Article</h3>
                        <button
                            type="button"
                            disabled={isGeneratingKb}
                            onClick={async () => {
                                const topic = prompt("What is the Help Article about? (e.g. 'How to buy Netflix')");
                                if (!topic) return;
                                setIsGeneratingKb(true);
                                try {
                                    const res = await fetch('/api/admin/generate-kb', {
                                        method: 'POST', body: JSON.stringify({ topic })
                                    });
                                    const data = await res.json();
                                    if (data.success) {
                                        setKbForm((prev: any) => ({ ...prev, ...data.data, is_published: true }));
                                    } else {
                                        alert("AI Error: " + data.error);
                                    }
                                } catch (e) { alert("Generation failed"); }
                                setIsGeneratingKb(false);
                            }}
                            className="btn btn-outline"
                            style={{ borderColor: '#00c3ff', color: '#00c3ff', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                            {isGeneratingKb ? '✨ Writing...' : '✨ Auto-Write with AI'}
                        </button>
                    </div>
                    <form onSubmit={handleKbSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#888' }}>Article Title</label>
                            <input className="input-field" value={kbForm.title} onChange={e => setKbForm({ ...kbForm, title: e.target.value })} style={{ width: '100%' }} placeholder="e.g. How to Verify Your Identity" required />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#888' }}>Category</label>
                                <select className="input-field" value={kbForm.category} onChange={e => setKbForm({ ...kbForm, category: e.target.value })} style={{ width: '100%', background: '#111', color: '#fff' }}>
                                    <option value="General">General</option>
                                    <option value="Payments">Payments</option>
                                    <option value="Orders">Orders</option>
                                    <option value="Accounts">Accounts</option>
                                    <option value="Security">Security</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#888' }}>Visibility</label>
                                <select className="input-field" value={kbForm.is_published ? 'true' : 'false'} onChange={e => setKbForm({ ...kbForm, is_published: e.target.value === 'true' })} style={{ width: '100%', background: '#111', color: '#fff' }}>
                                    <option value="true">Published (Public)</option>
                                    <option value="false">Draft (Internal Only)</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#888' }}>Content (Markdown Supported)</label>
                            <textarea className="input-field" value={kbForm.content} onChange={e => setKbForm({ ...kbForm, content: e.target.value })} style={{ width: '100%', minHeight: '300px', fontFamily: 'monospace' }} placeholder="Step 1... Step 2..." required />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>Save Help Article</button>
                            <button type="button" onClick={() => setShowAddKb(false)} className="btn btn-outline" style={{ padding: '0.8rem 2rem' }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                            <th style={{ padding: '1.5rem' }}>Title & Category</th>
                            <th style={{ padding: '1.5rem' }}>Status</th>
                            <th style={{ padding: '1.5rem' }}>Views</th>
                            <th style={{ padding: '1.5rem' }}>Updated</th>
                            <th style={{ padding: '1.5rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kbArticles.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>No articles found.</td></tr>
                        ) : kbArticles.map((art: any) => (
                            <tr key={art.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1.5rem' }}>
                                    <div style={{ fontWeight: 'bold', color: '#fff' }}>{art.title}</div>
                                    <span style={{ fontSize: '0.75rem', color: '#00ff88', background: 'rgba(0,255,136,0.1)', padding: '2px 8px', borderRadius: '10px' }}>{art.category}</span>
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: art.is_published ? '#00ff88' : '#ff9900',
                                        background: art.is_published ? 'rgba(0,255,136,0.1)' : 'rgba(255,153,0,0.1)',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontWeight: 'bold'
                                    }}>
                                        {art.is_published ? 'PUBLISHED' : 'DRAFT'}
                                    </span>
                                </td>
                                <td style={{ padding: '1.5rem', color: '#888' }}>{art.views || 0}</td>
                                <td style={{ padding: '1.5rem', color: '#666' }}>{new Date(art.updated_at).toLocaleDateString()}</td>
                                <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button onClick={() => { setKbForm(art); setShowAddKb(true); }} className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '0.8rem' }}>Edit</button>
                                        <button onClick={() => handleDeleteKb(art.id)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
