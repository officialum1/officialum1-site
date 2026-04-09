"use client";


interface IntelTabProps {
    marketIntel: any[];
    intelForm: any;
    setIntelForm: (form: any) => void;
    fetchData: () => Promise<void>;
}

export default function IntelTab({
    marketIntel,
    intelForm,
    setIntelForm,
    fetchData
}: IntelTabProps) {
    return (
        <div className="FadeIn">

            <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px', marginBottom: '2.5rem' }}>
                <h2 style={{ color: '#00ff88', marginBottom: '1rem' }}>📉 Market Intelligence</h2>
                <p style={{ color: '#888' }}>Monitor competitor pricing on Z2U, G2G, and PlayerUp to stay competitive.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
                    {[
                        { label: 'Tracked Items', val: marketIntel.length },
                        { label: 'Competitive', val: marketIntel.filter(i => i.status === 'Competitive').length },
                        { label: 'Overpriced', val: marketIntel.filter(i => i.status === 'Overpriced').length },
                        { label: 'Underpriced', val: marketIntel.filter(i => i.status === 'Underpriced').length }
                    ].map((s, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '16px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>{s.label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{s.val}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2.5rem' }}>
                <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #222', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '1.2rem' }}>ITEM NAME</th>
                                <th style={{ padding: '1.2rem' }}>PLATFORM</th>
                                <th style={{ padding: '1.2rem' }}>COMP. PRICE</th>
                                <th style={{ padding: '1.2rem' }}>MY PRICE</th>
                                <th style={{ padding: '1.2rem' }}>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {marketIntel.map((item: any) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1.2rem' }}>{item.item_name}</td>
                                    <td style={{ padding: '1.2rem' }}>{item.platform}</td>
                                    <td style={{ padding: '1.2rem' }}>${item.competitor_price}</td>
                                    <td style={{ padding: '1.2rem' }}>${item.my_price}</td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <span style={{ color: item.status === 'Competitive' ? '#00ff88' : '#ff4444' }}>{item.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: '#00ff88' }}>➕ Add Item to Track</h3>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        await fetch('/api/market', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'track', ...intelForm })
                        });
                        setIntelForm({ item_name: '', platform: 'Z2U', competitor_price: '', my_price: '' });
                        fetchData();
                    }} style={{ display: 'grid', gap: '1rem' }}>
                        <input placeholder="Item Name" value={intelForm.item_name} onChange={e => setIntelForm({ ...intelForm, item_name: e.target.value })} className="input-field" required />
                        <select value={intelForm.platform} onChange={e => setIntelForm({ ...intelForm, platform: e.target.value })} className="input-field">
                            <option value="Z2U">Z2U</option>
                            <option value="G2G">G2G</option>
                            <option value="PlayerUp">PlayerUp</option>
                        </select>
                        <input placeholder="Competitor Price ($)" type="number" step="0.01" value={intelForm.competitor_price} onChange={e => setIntelForm({ ...intelForm, competitor_price: e.target.value })} className="input-field" required />
                        <input placeholder="My Price ($)" type="number" step="0.01" value={intelForm.my_price} onChange={e => setIntelForm({ ...intelForm, my_price: e.target.value })} className="input-field" required />
                        <button type="submit" className="btn btn-primary">START TRACKING</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
