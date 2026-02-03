"use client";

interface FinanceTabProps {
    stats: any;
    balanceHistory: any[];
    showAddFunds: boolean;
    setShowAddFunds: (show: boolean) => void;
    fundForm: any;
    setFundForm: (form: any) => void;
    handleAddFunds: (e: any) => Promise<void>;
    copiedId: number | null;
    setCopiedId: (id: number | null) => void;
}

export default function FinanceTab({
    stats,
    balanceHistory,
    showAddFunds,
    setShowAddFunds,
    fundForm,
    setFundForm,
    handleAddFunds,
    copiedId,
    setCopiedId
}: FinanceTabProps) {
    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* ROI & Profitability */}
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,215,0,0.2)', background: 'linear-gradient(135deg, rgba(255,215,0,0.05) 0%, transparent 100%)' }}>
                    <h3 style={{ color: '#ffd700', marginBottom: '1rem' }}>📈 ROI & Profitability</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                        <span style={{ color: '#ccc' }}>Net Profit</span>
                        <span style={{ fontWeight: 'bold', color: '#00ff88', fontSize: '1.2rem' }}>$ {stats.profit.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                        <span style={{ color: '#ccc' }}>Profit Margin</span>
                        <span style={{ fontWeight: 'bold' }}>{stats.margin.toFixed(1)}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #333', paddingTop: '0.8rem' }}>
                        <span style={{ color: '#ccc' }}>Asset Value (In Stock)</span>
                        <span style={{ fontWeight: 'bold' }}>$ {stats.stockValue.toLocaleString()}</span>
                    </div>
                </div>

                {/* PKR Wallet */}
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0,255,136,0.2)' }}>
                    <h3 style={{ color: '#00ff88', marginBottom: '1rem' }}>🇵🇰 PKR Wallets</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                        <span style={{ color: '#ccc' }}>Meezan Bank</span>
                        <span style={{ fontWeight: 'bold' }}>₨ {balanceHistory.filter((t: any) => t.platform === 'Meezan').reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#ccc' }}>UBL / Other</span>
                        <span style={{ fontWeight: 'bold' }}>₨ {balanceHistory.filter((t: any) => t.platform === 'UBL').reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0).toLocaleString()}</span>
                    </div>
                </div>

                {/* USD Wallet */}
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0,100,255,0.2)' }}>
                    <h3 style={{ color: '#4dacff', marginBottom: '1rem' }}>🇺🇸 USD Accounts</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                        <span style={{ color: '#ccc' }}>Z2U</span>
                        <span style={{ fontWeight: 'bold' }}>$ {balanceHistory.filter((t: any) => t.platform === 'Z2U').reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#ccc' }}>PlayerUp / G2G</span>
                        <span style={{ fontWeight: 'bold' }}>$ {balanceHistory.filter((t: any) => ['PlayerUp', 'G2G'].includes(t.platform)).reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Monthly Profit Breakdown */}
                <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                    <h3 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>📅 Monthly Net Profit</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {Object.entries(stats.monthlyProfit).sort((a, b) => b[0].localeCompare(a[0])).map(([month, val]: [string, any]) => (
                            <div key={month} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                <span style={{ color: '#aaa', fontWeight: 'bold' }}>{new Date(month + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}</span>
                                <span style={{ color: val >= 0 ? '#00ff88' : '#ff4444', fontWeight: 'bold' }}>$ {Number(val).toLocaleString()}</span>
                            </div>
                        ))}
                        {Object.keys(stats.monthlyProfit).length === 0 && <p style={{ color: '#666' }}>No data yet.</p>}
                    </div>
                </div>

                {/* Top Performing Accounts */}
                <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                    <h3 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>💎 Profit per Product/Account</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {Object.entries(stats.productProfit).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5).map(([name, val]: [string, any]) => (
                            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                <span style={{ color: '#ddd', fontSize: '0.9rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                                <span style={{ color: '#00ff88', fontWeight: 'bold' }}>$ {Number(val).toLocaleString()}</span>
                            </div>
                        ))}
                        {Object.keys(stats.productProfit).length === 0 && <p style={{ color: '#666' }}>No data yet.</p>}
                    </div>
                </div>
            </div>

            <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ color: '#ffd700', margin: 0 }}>💰 Transaction History</h2>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => setShowAddFunds(true)} className="btn btn-primary" style={{ background: 'rgba(255,255,255,0.1)' }}>+ Add Funds</button>
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>Description</th>
                            <th style={{ padding: '1rem' }}>Source</th>
                            <th style={{ padding: '1rem' }}>By</th>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th style={{ padding: '1rem' }}>Amount</th>
                            <th style={{ padding: '1rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {balanceHistory && balanceHistory.length > 0 ? balanceHistory.map((sale: any) => (
                            <tr key={sale.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem' }}>{sale.description}</td>
                                <td style={{ padding: '1rem' }}>{sale.platform}</td>
                                <td style={{ padding: '1rem' }}>{sale.processedBy}</td>
                                <td style={{ padding: '1rem', color: '#888', fontSize: '0.85rem' }}>{sale.date ? new Date(sale.date).toLocaleDateString() : 'N/A'}</td>
                                <td style={{ padding: '1rem', color: Number(sale.amount) >= 0 ? '#00ff88' : '#ff4444', fontWeight: 'bold' }}>
                                    {sale.currency === 'PKR' ? '₨ ' : '$ '}
                                    {Number(sale.amount).toLocaleString()}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {sale.deliveryToken ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`${window.location.origin}/delivery/${sale.deliveryToken}`);
                                                    setCopiedId(sale.id);
                                                    setTimeout(() => setCopiedId(null), 2000);
                                                }}
                                                style={{
                                                    background: copiedId === sale.id ? 'rgba(0,255,136,0.3)' : 'rgba(0,255,136,0.1)',
                                                    border: '1px solid #00ff88',
                                                    color: '#00ff88',
                                                    borderRadius: '4px',
                                                    padding: '0.4rem 0.8rem',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    minWidth: '100px',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {copiedId === sale.id ? '✅ Copied' : '🔗 Copy Link'}
                                            </button>
                                            <span title={`Link Viewed ${sale.deliveryViews || 0} times`} style={{ fontSize: '0.8rem', color: '#aaa' }}>
                                                👁️ {sale.deliveryViews || 0}
                                            </span>
                                        </div>
                                    ) : (
                                        <span style={{ color: '#666', fontSize: '0.8rem' }}>{sale.type === 'manual_adjustment' ? 'Adjusted' : (sale.type === 'expense' ? 'Expense' : 'Funding')}</span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No financial activity yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modernized Add Funds Modal */}
            {showAddFunds && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    backdropFilter: 'blur(10px)',
                    padding: '20px'
                }}>
                    <div className="glass" style={{
                        padding: '2.5rem',
                        borderRadius: '24px',
                        border: '1px solid rgba(0,255,136,0.3)',
                        width: '100%',
                        maxWidth: '500px',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                        position: 'relative',
                        animation: 'modalSlideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#00ff88', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <span>💸</span> Finance Adjustment
                                </h2>
                                <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px' }}>Manually adjust account or bank balances.</p>
                            </div>
                            <button
                                onClick={() => setShowAddFunds(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: 'none',
                                    color: '#fff',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >×</button>
                        </div>

                        <form onSubmit={handleAddFunds} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.8rem', color: '#ccc', fontSize: '0.9rem', fontWeight: '500' }}>Platform / Bank Account</label>
                                <select className="input-field" value={fundForm.platform} onChange={e => {
                                    const p = e.target.value;
                                    const c = (p === 'Meezan' || p === 'UBL') ? 'PKR' : 'USD';
                                    setFundForm({ ...fundForm, platform: p, currency: c });
                                }} style={{ width: '100%', height: '54px', borderRadius: '14px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', padding: '0 1rem' }}>
                                    <option value="Meezan">Meezan Bank 🇵🇰</option>
                                    <option value="UBL">UBL (United Bank Limited) 🇵🇰</option>
                                    <option value="Z2U">Z2U Marketplace 🇺🇸</option>
                                    <option value="PlayerUp">PlayerUp 🇺🇸</option>
                                    <option value="G2G">G2G Marketplace 🇺🇸</option>
                                    <option value="RedotPay">RedotPay Card 💳</option>
                                    <option value="Direct">Cash / Manual Other 💰</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1.2rem' }}>
                                <div style={{ flex: 2 }}>
                                    <label style={{ display: 'block', marginBottom: '0.8rem', color: '#ccc', fontSize: '0.9rem', fontWeight: '500' }}>Amount</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="number"
                                            required
                                            className="input-field"
                                            value={fundForm.amount}
                                            onChange={e => setFundForm({ ...fundForm, amount: e.target.value })}
                                            placeholder="e.g. 5000 or -50"
                                            style={{ width: '100%', height: '54px', borderRadius: '14px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', padding: '0 1rem' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.8rem', color: '#ccc', fontSize: '0.9rem', fontWeight: '500' }}>Currency</label>
                                    <select className="input-field" value={fundForm.currency} onChange={e => setFundForm({ ...fundForm, currency: e.target.value })} style={{ width: '100%', height: '54px', borderRadius: '14px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', padding: '0 1rem' }}>
                                        <option value="USD">USD ($)</option>
                                        <option value="PKR">PKR (₨)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.8rem', color: '#ccc', fontSize: '0.9rem', fontWeight: '500' }}>Reason / Memo</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Briefly explain this adjustment..."
                                    value={fundForm.description}
                                    onChange={e => setFundForm({ ...fundForm, description: e.target.value })}
                                    style={{ width: '100%', height: '54px', borderRadius: '14px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', padding: '0 1rem' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowAddFunds(false)}
                                    style={{ flex: 1, height: '54px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', color: '#888', border: '1px solid #333', cursor: 'pointer', fontWeight: '600' }}
                                >Cancel</button>
                                <button
                                    type="submit"
                                    style={{ flex: 2, height: '54px', borderRadius: '14px', background: 'linear-gradient(90deg, #00ff88, #00c3ff)', color: '#000', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 0 20px rgba(0,255,136,0.3)' }}
                                >Save Transaction</button>
                            </div>
                        </form>
                    </div>

                    <style jsx>{`
                    @keyframes modalSlideUp {
                        from { transform: translateY(30px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                `}</style>
                </div>
            )}
        </>
    );
}
