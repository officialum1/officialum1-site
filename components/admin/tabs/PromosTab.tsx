"use client";

interface PromosTabProps {
    promoForm: any;
    setPromoForm: (form: any) => void;
    handlePromoSubmit: (e: any) => Promise<void>;
    promoCodes: any[];
    handleDeletePromo: (id: number) => Promise<void>;
}

export default function PromosTab({
    promoForm,
    setPromoForm,
    handlePromoSubmit,
    promoCodes,
    handleDeletePromo
}: PromosTabProps) {
    return (
        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            <div className="glass" style={{ flex: 1, padding: '2rem', borderRadius: '16px', minWidth: '300px' }}>
                <h2 style={{ marginBottom: '1.5rem', color: '#00ff88' }}>Create Promo Code</h2>
                <form onSubmit={handlePromoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'bold' }}>CODE NAME</label>
                        <input placeholder="E.G. SUMMER20" value={promoForm.code} onChange={e => setPromoForm({ ...promoForm, code: e.target.value })} className="input-field" required style={{ textTransform: 'uppercase' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'bold' }}>DISCOUNT PERCENTAGE (%)</label>
                        <input type="number" placeholder="20" value={promoForm.discount} onChange={e => setPromoForm({ ...promoForm, discount: e.target.value })} className="input-field" required min="1" max="100" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'bold' }}>EXPIRATION DATE (OPTIONAL)</label>
                        <input type="datetime-local" value={promoForm.expiresAt} onChange={e => setPromoForm({ ...promoForm, expiresAt: e.target.value })} className="input-field" />
                        <span style={{ fontSize: '0.75rem', color: '#555' }}>Leave empty for no expiration</span>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '1rem', fontWeight: 'bold' }}>Create Code</button>
                </form>
            </div>
            <div style={{ flex: 1, minWidth: '350px' }}>
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Active Codes
                    <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>({promoCodes.length})</span>
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {promoCodes.length === 0 ? (
                        <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderStyle: 'dashed', borderColor: '#333' }}>
                            <p style={{ color: '#888' }}>No active codes found in your records.</p>
                        </div>
                    ) : Array.isArray(promoCodes) && promoCodes.map((code: any) => {
                        const isExpired = code.expiresAt && new Date(code.expiresAt) < new Date();
                        return (
                            <div key={code.id} className="glass" style={{
                                padding: '1.2rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                border: isExpired ? '1px solid rgba(255, 77, 77, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                                opacity: isExpired ? 0.7 : 1
                            }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.3rem' }}>
                                        <h4 style={{ color: isExpired ? '#ff4d4d' : '#00ff88', fontSize: '1.2rem', fontWeight: 'bold' }}>{code.code}</h4>
                                        <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>{code.discount}% OFF</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: isExpired ? '#ff4d4d' : '#888' }}>
                                        {isExpired ? (
                                            <span>⚠️ Expired on {new Date(code.expiresAt).toLocaleDateString()}</span>
                                        ) : (
                                            <span>
                                                {code.expiresAt ? `Expires: ${new Date(code.expiresAt).toLocaleString()}` : "♾️ Never Expires"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeletePromo(code.id)}
                                    className="btn btn-outline"
                                    style={{
                                        color: '#ff4d4d',
                                        borderColor: 'rgba(255,77,77,0.2)',
                                        padding: '0.4rem 0.8rem',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
