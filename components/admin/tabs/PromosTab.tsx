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
                <form onSubmit={handlePromoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input placeholder="Code (e.g. SUMMER20)" value={promoForm.code} onChange={e => setPromoForm({ ...promoForm, code: e.target.value })} className="input-field" required style={{ textTransform: 'uppercase' }} />
                    <input type="number" placeholder="Discount %" value={promoForm.discount} onChange={e => setPromoForm({ ...promoForm, discount: e.target.value })} className="input-field" required min="1" max="100" />
                    <button type="submit" className="btn btn-primary">Create Code</button>
                </form>
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Active Codes</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {promoCodes.length === 0 ? <p style={{ color: '#888' }}>No active codes.</p> : promoCodes.map((code: any) => (
                        <div key={code.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div><h4 style={{ color: '#00ff88', fontSize: '1.2rem' }}>{code.code}</h4><div style={{ fontSize: '0.9rem', color: '#ccc' }}>{code.discount}% Off</div></div>
                            <button onClick={() => handleDeletePromo(code.id)} style={{ background: 'red', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
