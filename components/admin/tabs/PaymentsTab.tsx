"use client";

interface PaymentsTabProps {
    hasPermission: boolean;
    settings: any;
    setSettings: (settings: any) => void;
    fundForm: any;
    setFundForm: (form: any) => void;
    stats: any;
    handleSettingsSave: () => Promise<void>;
    balanceHistory: any[];
}

export default function PaymentsTab({
    hasPermission,
    settings,
    setSettings,
    fundForm,
    setFundForm,
    stats,
    handleSettingsSave,
    balanceHistory
}: PaymentsTabProps) {
    if (!hasPermission) return <p style={{ color: '#ff4444' }}>Unauthorized access.</p>;

    return (
        <div className="FadeIn">
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2.5rem' }}>
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {['gateways', 'wallets', 'payouts', 'history'].map(t => (
                        <button
                            key={t}
                            onClick={() => setSettings({ ...settings, activePaymentTab: t })}
                            style={{
                                padding: '1.2rem',
                                background: settings.activePaymentTab === t ? 'linear-gradient(90deg, #00ff88, #00c3ff)' : 'rgba(255,255,255,0.03)',
                                color: settings.activePaymentTab === t ? '#000' : '#888',
                                border: 'none',
                                borderRadius: '16px',
                                textAlign: 'left',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                transition: 'all 0.3s'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>
                                {t === 'gateways' ? '🔌' : t === 'wallets' ? '👛' : t === 'payouts' ? '💸' : '📜'}
                            </span>
                            {t}
                        </button>
                    ))}
                </aside>

                <main>
                    {settings.activePaymentTab === 'gateways' && (
                        <div className="glass" style={{ padding: '2.5rem', borderRadius: '32px' }}>
                            <h2 style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Payment Gateways
                                <button
                                    onClick={handleSettingsSave}
                                    style={{ background: '#00ff88', border: 'none', color: '#000', padding: '0.6rem 1.5rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}
                                >Save Configs</button>
                            </h2>

                            <div style={{ display: 'grid', gap: '2rem' }}>
                                {/* Binance Pay */}
                                <div style={{ background: 'rgba(255,215,0,0.05)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,215,0,0.1)' }}>
                                    <h3 style={{ color: '#f0b90b', display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                                        <div style={{ width: '40px', height: '40px', background: '#f0b90b', borderRadius: '10px' }} />
                                        Binance Pay Merchant
                                    </h3>
                                    <div style={{ display: 'grid', gap: '1.2rem' }}>
                                        <input
                                            className="input-field"
                                            placeholder="Binance API Key"
                                            value={settings.binanceKey}
                                            onChange={e => setSettings({ ...settings, binanceKey: e.target.value })}
                                            style={{ background: 'rgba(0,0,0,0.3)' }}
                                        />
                                        <input
                                            className="input-field"
                                            type="password"
                                            placeholder="Binance Secret"
                                            value={settings.binanceSecret}
                                            onChange={e => setSettings({ ...settings, binanceSecret: e.target.value })}
                                            style={{ background: 'rgba(0,0,0,0.3)' }}
                                        />
                                    </div>
                                </div>

                                {/* Stripe */}
                                <div style={{ background: 'rgba(99,102,241,0.05)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(99,102,241,0.1)' }}>
                                    <h3 style={{ color: '#6366f1', display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                                        <div style={{ width: '40px', height: '40px', background: '#6366f1', borderRadius: '10px' }} />
                                        Stripe Infrastructure
                                    </h3>
                                    <input
                                        className="input-field"
                                        placeholder="Stripe Secret Key (sk_live_...)"
                                        value={settings.stripeSecret}
                                        onChange={e => setSettings({ ...settings, stripeSecret: e.target.value })}
                                        style={{ background: 'rgba(0,0,0,0.3)' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {settings.activePaymentTab === 'wallets' && (
                        <div style={{ display: 'grid', gap: '2rem' }}>
                            <div className="glass" style={{ padding: '2.5rem', borderRadius: '32px' }}>
                                <h2 style={{ marginBottom: '2rem' }}>Platform Balances</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                                    {[
                                        { label: 'Z2U Wallet', val: `$ ${stats.wallets?.z2u?.toFixed(2) || '0.00'}` },
                                        { label: 'G2G Wallet', val: `$ ${stats.wallets?.g2g?.toFixed(2) || '0.00'}` },
                                        { label: 'Meezan Bank', val: `₨ ${stats.wallets?.meezan?.toLocaleString() || '0'}` },
                                        { label: 'UBL Bank', val: `₨ ${stats.wallets?.ubl?.toLocaleString() || '0'}` }
                                    ].map((w, i) => (
                                        <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '24px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>{w.label}</div>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{w.val}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass" style={{ padding: '2.5rem', borderRadius: '32px' }}>
                                <h2 style={{ marginBottom: '1rem' }}>Manual Re-capitalization</h2>
                                <p style={{ color: '#666', marginBottom: '2rem' }}>Move funds between platforms or inject new capital.</p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <select className="input-field" value={fundForm.platform} onChange={e => setFundForm({ ...fundForm, platform: e.target.value })}>
                                        <option value="Meezan">Meezan Bank</option>
                                        <option value="UBL">UBL Account</option>
                                        <option value="Z2U">Z2U Merchant</option>
                                        <option value="G2G">G2G Merchant</option>
                                    </select>
                                    <input className="input-field" placeholder="Amount" type="number" value={fundForm.amount} onChange={e => setFundForm({ ...fundForm, amount: e.target.value })} />
                                    <select className="input-field" value={fundForm.currency} onChange={e => setFundForm({ ...fundForm, currency: e.target.value })}>
                                        <option value="PKR">PKR</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                                <input className="input-field" placeholder="Funding Reason" value={fundForm.description} onChange={e => setFundForm({ ...fundForm, description: e.target.value })} style={{ marginBottom: '1.5rem' }} />
                                <button className="btn btn-primary" style={{ width: '100%' }}>Inject Capital</button>
                            </div>
                        </div>
                    )}

                    {settings.activePaymentTab === 'history' && (
                        <div className="glass" style={{ padding: '2.5rem', borderRadius: '32px' }}>
                            <h2 style={{ marginBottom: '2rem' }}>Financial Ledger</h2>
                            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 1 }}>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #222' }}>
                                            <th style={{ padding: '1.2rem', color: '#666', fontSize: '0.8rem' }}>DATE</th>
                                            <th style={{ padding: '1.2rem', color: '#666', fontSize: '0.8rem' }}>SOURCE</th>
                                            <th style={{ padding: '1.2rem', color: '#666', fontSize: '0.8rem' }}>DESCRIPTION</th>
                                            <th style={{ padding: '1.2rem', textAlign: 'right', color: '#666', fontSize: '0.8rem' }}>AMOUNT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {balanceHistory.map((h: any) => (
                                            <tr key={h.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                <td style={{ padding: '1.2rem', fontSize: '0.9rem' }}>{new Date(h.date).toLocaleDateString()}</td>
                                                <td style={{ padding: '1.2rem' }}><span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem' }}>{h.platform}</span></td>
                                                <td style={{ padding: '1.2rem', fontSize: '0.9rem' }}>{h.description}</td>
                                                <td style={{ padding: '1.2rem', textAlign: 'right', fontWeight: 'bold', color: Number(h.amount) > 0 ? '#00ff88' : '#ff4444' }}>
                                                    {h.currency === 'PKR' ? '₨ ' : '$ '}
                                                    {Math.abs(h.amount).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
