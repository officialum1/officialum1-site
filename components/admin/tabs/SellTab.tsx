"use client";

interface SellTabProps {
    handleRecordSale: (e: any) => Promise<void>;
    sellMode: 'single' | 'bulk';
    setSellMode: (mode: 'single' | 'bulk') => void;
    newSale: any;
    setNewSale: (sale: any) => void;
    inventory: any[];
    hasPermission: (perm: string) => boolean;
    balanceHistory: any[];
    currentUser: any;
    copiedId: string | null;
    setCopiedId: (id: string | null) => void;
    handleReplaceSale: (id: string) => Promise<void>;
    isReplacing: boolean;
    setDeleteId: (id: string) => void;
    setShowDeleteModal: (show: boolean) => void;
}

export default function SellTab({
    handleRecordSale,
    sellMode,
    setSellMode,
    newSale,
    setNewSale,
    inventory,
    hasPermission,
    balanceHistory,
    currentUser,
    copiedId,
    setCopiedId,
    handleReplaceSale,
    isReplacing,
    setDeleteId,
    setShowDeleteModal
}: SellTabProps) {
    return (
        <div className="FadeIn">
            <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px', border: '1px solid #00ff88' }}>
                <h3 style={{ marginBottom: '1.5rem', color: '#00ff88', fontSize: '1.5rem' }}>💸 Create New Sale</h3>
                <p style={{ color: '#888', marginBottom: '1.5rem' }}>Select an item from inventory to generate a secure delivery link instantly.</p>

                <form onSubmit={handleRecordSale} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Sell Mode Toggle */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <button type="button" onClick={() => setSellMode('single')} className="btn" style={{ flex: 1, background: sellMode === 'single' ? '#00ff88' : 'rgba(255,255,255,0.05)', color: sellMode === 'single' ? '#000' : '#888', border: '1px solid #333' }}>Single Item</button>
                        <button type="button" onClick={() => setSellMode('bulk')} className="btn" style={{ flex: 1, background: sellMode === 'bulk' ? '#00ff88' : 'rgba(255,255,255,0.05)', color: sellMode === 'bulk' ? '#000' : '#888', border: '1px solid #333' }}>Bulk Quantity</button>
                    </div>

                    {/* SINGLE MODE */}
                    {sellMode === 'single' && (
                        <>
                            <label style={{ color: '#ccc', marginBottom: '-1rem' }}>Select Product from Stock</label>
                            <select
                                className="input-field"
                                value={newSale.inventoryId}
                                onChange={e => {
                                    const id = e.target.value;
                                    const item = inventory.find(i => i.id === id);
                                    if (item) {
                                        setNewSale({ ...newSale, inventoryId: id, description: item.name, platform: item.platform, salePrice: item.purchasePrice ? String(item.purchasePrice) : '' });
                                    } else {
                                        setNewSale({ ...newSale, inventoryId: '' });
                                    }
                                }}
                                style={{ width: '100%', border: '1px solid #333', background: '#111', color: '#00ff88', padding: '1rem', fontSize: '1.1rem' }}
                                required={sellMode === 'single'}
                            >
                                <option value="">-- Click to Choose Product --</option>
                                {inventory.filter(i => i.status === 'In Stock')
                                    .filter(i => inventory.filter(other => other.name === i.name && other.status === 'In Stock').length === 1) // Only unique items
                                    .map(i => (
                                        <option key={i.id} value={i.id}>
                                            {i.platform} | {i.name} {hasPermission('finance') && i.purchasePrice ? `(Cost: $${i.purchasePrice})` : ''}
                                        </option>
                                    ))}
                            </select>
                        </>
                    )}

                    {/* BULK MODE */}
                    {sellMode === 'bulk' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>Select Product Type</label>
                                <select
                                    className="input-field"
                                    value={newSale.productName}
                                    onChange={e => {
                                        const name = e.target.value;
                                        const item = inventory.find(i => i.name === name);
                                        setNewSale({ ...newSale, productName: name, description: `Bulk: ${newSale.quantity}x ${name}`, platform: item ? item.platform : 'Z2U' });
                                    }}
                                    style={{ width: '100%', background: '#111', color: '#fff' }}
                                    required={sellMode === 'bulk'}
                                >
                                    <option value="">-- Choose Type --</option>
                                    {Array.from(new Set(inventory.filter(i => i.status === 'In Stock').map(i => i.name)))
                                        .filter(name => inventory.filter(i => i.name === name && i.status === 'In Stock').length > 1) // Only show items with >1 stock
                                        .map(name => {
                                            const count = inventory.filter(i => i.name === name && i.status === 'In Stock').length;
                                            return <option key={name} value={name}>{name} (Stock: {count})</option>;
                                        })}
                                </select>
                            </div>
                            <div>
                                <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>Quantity</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    min="1"
                                    value={newSale.quantity}
                                    onChange={e => {
                                        const q = e.target.value;
                                        setNewSale({ ...newSale, quantity: q, description: `Bulk: ${q}x ${newSale.productName}` });
                                    }}
                                    required={sellMode === 'bulk'}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                        <div><label style={{ color: '#888', display: 'block', marginBottom: '0.5rem' }}>Sale Description / Order ID</label><input placeholder="Description" value={newSale.description} onChange={e => setNewSale({ ...newSale, description: e.target.value })} className="input-field" required style={{ width: '100%' }} /></div>
                        <div>
                            <label style={{ color: '#888', display: 'block', marginBottom: '0.5rem' }}>Platform</label>
                            <select
                                value={newSale.platform}
                                onChange={e => setNewSale({ ...newSale, platform: e.target.value })}
                                className="input-field"
                                style={{ width: '100%' }}
                            >
                                <option value="Z2U">Z2U</option>
                                <option value="PlayerUp">PlayerUp</option>
                                <option value="G2G">G2G</option>
                                <option value="Direct">Direct</option>
                                <option value="Binance">Binance</option>
                                <option value="RedotPay">RedotPay</option>
                                <option value="Skrill">Skrill</option>
                            </select>
                        </div>
                        {newSale.platform === 'Direct' && (
                            <div>
                                <label style={{ color: '#00ff88', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>💰 Payment Received To</label>
                                <select
                                    value={newSale.paymentReceived}
                                    onChange={e => setNewSale({ ...newSale, paymentReceived: e.target.value })}
                                    className="input-field"
                                    style={{ width: '100%', borderColor: '#00ff88' }}
                                    required={newSale.platform === 'Direct'}
                                >
                                    <option value="">-- Select Bank/Wallet --</option>
                                    <option value="Meezan">Meezan Bank 🇵🇰 (PKR)</option>
                                    <option value="UBL">UBL Bank 🇵🇰 (PKR)</option>
                                    <option value="EasyPaisa">EasyPaisa 📱 (PKR)</option>
                                    <option value="JazzCash">JazzCash 📱 (PKR)</option>
                                    <option value="RedotPay">RedotPay 💳 (USD)</option>
                                    <option value="Binance">Binance 💎 (USD/USDT)</option>
                                    <option value="Skrill">Skrill 🟣 (USD)</option>
                                    <option value="Cash">Cash / Other 💵</option>
                                </select>
                            </div>
                        )}
                        <div><label style={{ color: '#888', display: 'block', marginBottom: '0.5rem' }}>Sale Price ($)</label><input type="number" placeholder="0.00" value={newSale.salePrice} onChange={e => setNewSale({ ...newSale, salePrice: e.target.value })} className="input-field" required style={{ width: '100%' }} /></div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>Generate Link & Record Sale</button>
                    </div>
                </form>
            </div>

            {/* Recent Sales List */}
            <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Recent Manual Sales</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>Item</th>
                            <th style={{ padding: '1rem' }}>Date</th>
                            {hasPermission('all') && <th style={{ padding: '1rem' }}>Staff</th>}
                            <th style={{ padding: '1rem' }}>Amount</th>
                            <th style={{ padding: '1rem' }}>Link / Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {balanceHistory && balanceHistory.filter((s: any) => {
                            if (!s.deliveryToken) return false;
                            if (hasPermission('all')) return true;
                            return s.processedBy === (currentUser?.name || currentUser?.email || 'Admin');
                        }).length > 0 ? balanceHistory.filter((s: any) => {
                            if (!s.deliveryToken) return false;
                            if (hasPermission('all')) return true;
                            return s.processedBy === (currentUser?.name || currentUser?.email || 'Admin');
                        }).slice(0, 50).map((sale: any) => (
                            <tr key={sale.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem' }}>{sale.description}</td>
                                <td style={{ padding: '1rem', color: '#888' }}>{sale.date ? new Date(sale.date).toLocaleDateString() : 'N/A'}</td>
                                {hasPermission('all') && <td style={{ padding: '1rem', color: '#888' }}>{sale.processedBy || 'Admin'}</td>}
                                <td style={{ padding: '1rem', color: '#00ff88', fontWeight: 'bold' }}>${Number(sale.amount).toLocaleString()}</td>
                                <td style={{ padding: '1rem' }}>
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
                                            }}
                                        >
                                            {copiedId === sale.id ? '✅ Copied' : '🔗 Copy Link'}
                                        </button>
                                        <span style={{ fontSize: '0.8rem', color: '#666' }}>Views: {sale.deliveryViews || 0}</span>
                                        {(currentUser?.role === 'admin' || currentUser?.role === 'owner') && (
                                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleReplaceSale(sale.id)}
                                                    disabled={isReplacing}
                                                    title="Replace with fresh stock"
                                                    style={{
                                                        background: 'rgba(255,170,0,0.1)',
                                                        border: '1px solid #ffaa00',
                                                        color: '#ffaa00',
                                                        borderRadius: '4px',
                                                        padding: '0.4rem 0.8rem',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem',
                                                    }}
                                                >
                                                    🔄 Replace
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setDeleteId(sale.id);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    style={{
                                                        background: 'rgba(255,68,68,0.1)',
                                                        border: '1px solid #ff4444',
                                                        color: '#ff4444',
                                                        borderRadius: '4px',
                                                        padding: '0.4rem 0.8rem',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem',
                                                    }}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No manual sales recorded yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
