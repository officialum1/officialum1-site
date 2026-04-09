"use client";

interface BundleTabProps {
    catalog: any[];
    bundleForm: any;
    setBundleForm: (form: any) => void;
    handleCreateBundle: (e: any) => Promise<void>;
}

export default function BundleTab({
    catalog,
    bundleForm,
    setBundleForm,
    handleCreateBundle
}: BundleTabProps) {
    return (
        <div className="FadeIn">
            <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px', border: '1px solid #ae68ff' }}>
                <h3 style={{ marginBottom: '1.5rem', color: '#ae68ff' }}>📦 Create Product Bundle</h3>
                <form onSubmit={handleCreateBundle} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Bundle Name</label>
                        <input className="input-field" value={bundleForm.name} onChange={e => setBundleForm({ ...bundleForm, name: e.target.value })} required style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Price ($)</label>
                        <input type="number" className="input-field" value={bundleForm.price} onChange={e => setBundleForm({ ...bundleForm, price: e.target.value })} required style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Platform / Category</label>
                        <select className="input-field" value={bundleForm.platform} onChange={e => setBundleForm({ ...bundleForm, platform: e.target.value })} style={{ width: '100%' }}>
                            <option value="Netflix">Netflix</option>
                            <option value="Spotify">Spotify</option>
                            <option value="VPN">VPN</option>
                            <option value="Gaming">Gaming</option>
                            <option value="Mixed">Mixed</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Image URL</label>
                        <input className="input-field" value={bundleForm.image} onChange={e => setBundleForm({ ...bundleForm, image: e.target.value })} style={{ width: '100%' }} />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Select Products to Include</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', maxHeight: '300px', overflowY: 'auto', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                            {catalog.filter(p => !p.bundle_items).map(p => (
                                <div key={p.id}
                                    onClick={() => {
                                        const current = bundleForm.items;
                                        if (current.includes(p.id)) setBundleForm({ ...bundleForm, items: current.filter((id: number) => id !== p.id) });
                                        else setBundleForm({ ...bundleForm, items: [...current, p.id] });
                                    }}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: bundleForm.items.includes(p.id) ? '1px solid #ae68ff' : '1px solid rgba(255,255,255,0.05)',
                                        background: bundleForm.items.includes(p.id) ? 'rgba(174, 104, 255, 0.1)' : 'transparent',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>{p.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#888' }}>${p.price}</div>
                                </div>
                            ))}
                        </div>
                        <p style={{ marginTop: '0.5rem', color: '#888', fontSize: '0.8rem' }}>Selected Value: ${catalog.filter(p => bundleForm.items.includes(p.id)).reduce((sum, p) => sum + Number(p.price), 0).toFixed(2)}</p>
                    </div>

                    <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
                        <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(45deg, #ae68ff, #7a00ff)', border: 'none' }}>Create Bundle</button>
                    </div>
                </form>
            </div>

            <h3 style={{ marginBottom: '1.5rem', marginTop: '3rem' }}>Existing Bundles</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {catalog.filter(p => p.bundle_items || p.type === 'bundle').map(b => (
                    <div key={b.id} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', borderTop: '4px solid #ae68ff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h4 style={{ margin: 0 }}>{b.name}</h4>
                            <span style={{ fontWeight: 'bold', color: '#ae68ff' }}>${b.price}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#ccc', marginBottom: '1rem' }}>
                            Contains: {(b.bundle_items ? JSON.parse(b.bundle_items) : []).length} items
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-outline" style={{ flex: 1, fontSize: '0.8rem' }}>Edit</button>
                            <button className="btn btn-outline" style={{ color: '#ff4444', borderColor: '#ff4444', fontSize: '0.8rem' }}>Delete</button>
                        </div>
                    </div>
                ))}
                {catalog.filter(p => p.bundle_items || p.type === 'bundle').length === 0 && <p style={{ color: '#666' }}>No bundles created yet.</p>}
            </div>
        </div>
    );
}
