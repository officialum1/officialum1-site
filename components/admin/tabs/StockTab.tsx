"use client";

interface StockTabProps {
    inventory: any[];
    showAddInv: boolean;
    setShowAddInv: (show: boolean) => void;
    showBulk: boolean;
    setShowBulk: (show: boolean) => void;
    viewMode: string;
    setViewMode: any;
    newItem: any;
    setNewItem: (item: any) => void;
    bulkData: string;
    setBulkData: (data: string) => void;
    handleAddInventory: (e?: any) => Promise<void>;
    handleBulkImport: (e?: any) => Promise<void>;
}

export default function StockTab({
    inventory,
    showAddInv,
    setShowAddInv,
    showBulk,
    setShowBulk,
    viewMode,
    setViewMode,
    newItem,
    setNewItem,
    bulkData,
    setBulkData,
    handleAddInventory,
    handleBulkImport
}: StockTabProps) {
    return (
        <div className="FadeIn">
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.4rem', margin: 0 }}>📦 Stock Inventory</h2>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>Manage bulk accounts and manual links.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => setShowAddInv(true)} className="btn btn-outline">+ Add Item</button>
                        <button onClick={() => setShowBulk(true)} className="btn btn-outline">Bulk</button>
                    </div>
                </div>

                {/* STOCK VIEW TOGGLE */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
                        <button onClick={() => setViewMode('summary')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: viewMode === 'summary' ? '#00ff88' : 'transparent', color: viewMode === 'summary' ? '#000' : '#888', cursor: 'pointer', fontWeight: 'bold' }}>Cards</button>
                        <button onClick={() => setViewMode('list')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: viewMode === 'list' ? '#00ff88' : 'transparent', color: viewMode === 'list' ? '#000' : '#888', cursor: 'pointer', fontWeight: 'bold' }}>List</button>
                    </div>
                </div>

                {/* Stock Display */}
                {viewMode === 'summary' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {Array.from(new Set(inventory.filter(i => i.status === 'In Stock').map(i => i.name))).map(name => {
                            const items = inventory.filter(i => i.name === name);
                            const activeItems = items.filter(i => i.status === 'In Stock');
                            const inStock = activeItems.length;
                            const platform = activeItems[0]?.platform || 'Unknown';

                            if (inStock === 0) return null;

                            return (
                                <div key={name} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 8px', background: '#00ff88', color: '#000', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                        ACTIVE
                                    </div>
                                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', color: '#fff' }}>{name}</h3>
                                    <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1.5rem' }}>Platform: <span style={{ color: '#ccc' }}>{platform}</span></div>

                                    <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00ff88' }}>{inStock}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>Available Stock</div>
                                    </div>
                                </div>
                            );
                        })}
                        {inventory.filter(i => i.status === 'In Stock').length === 0 && <div style={{ color: '#666' }}>No active stock found.</div>}
                    </div>
                ) : (
                    <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Item Name</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Platform</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Asset Value</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.filter(i => i.status === 'In Stock').map((item: any) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem' }}>{item.name}</td>
                                        <td style={{ padding: '1rem' }}>{item.platform}</td>
                                        <td style={{ padding: '1rem', color: '#ccc' }}>{item.purchasePrice ? `$${item.purchasePrice}` : '***'}</td>
                                        <td style={{ padding: '1rem' }}><span style={{ color: '#00ff88' }}>In Stock</span></td>
                                    </tr>
                                ))}
                                {inventory.filter(i => i.status === 'In Stock').length === 0 && <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No items in inventory.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Forms for RESTORED Features */}
                {showAddInv && (
                    <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', marginTop: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Add Inventory Stock</h3>
                        </div>

                        <form onSubmit={handleAddInventory} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div><label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Platform</label><select className="input-field" value={newItem.platform} onChange={e => setNewItem({ ...newItem, platform: e.target.value })} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333' }}><option value="Z2U">Z2U</option><option value="PlayerUp">PlayerUp</option><option value="G2G">G2G</option><option value="Direct">Direct Sale</option></select></div>
                            <div><label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Item Name</label><input type="text" className="input-field" required value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="Product Title" style={{ width: '100%' }} /></div>
                            <div><label style={{ display: 'block', marginBottom: '0.5rem', color: '#00ff88' }}>Inventory Tag (Optional)</label><input type="text" className="input-field" value={newItem.tag || ''} onChange={e => setNewItem({ ...newItem, tag: e.target.value })} placeholder="#tag" style={{ width: '100%', borderColor: '#00ff88' }} /></div>
                            <div style={{ gridColumn: 'span 2' }}><label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Purchase Price ($)</label><input type="number" required className="input-field" value={newItem.purchasePrice} onChange={e => setNewItem({ ...newItem, purchasePrice: e.target.value })} style={{ width: '100%' }} /></div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#00ff88' }}>Account Credentials (Paste Full)</label>
                                <textarea
                                    className="input-field"
                                    value={newItem.credentials || ''}
                                    onChange={e => setNewItem({ ...newItem, credentials: e.target.value })}
                                    style={{ width: '100%', height: '100px', fontFamily: 'monospace' }}
                                    placeholder="Paste detail here (e.g. user:pass:email or just user:pass)"
                                />
                            </div>

                            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowAddInv(false)} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Item</button>
                            </div>
                        </form>
                    </div>
                )}

                {showBulk && (
                    <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px', border: '1px solid #06b6d4', marginTop: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Bulk Import Inventory</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Platform</label>
                                <select className="input-field" value={newItem.platform} onChange={e => setNewItem({ ...newItem, platform: e.target.value })} style={{ width: '100%', background: '#111', color: '#fff' }}>
                                    <option value="Z2U">Z2U</option>
                                    <option value="PlayerUp">PlayerUp</option>
                                    <option value="G2G">G2G</option>
                                    <option value="Direct">Direct Sale</option>
                                    <option value="Reddit">Reddit</option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="Discord">Discord</option>
                                    <option value="TikTok">TikTok</option>
                                    <option value="Twitter">Twitter/X</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Product Name</label>
                                <input type="text" className="input-field" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} style={{ width: '100%' }} placeholder="e.g. 1 Year Old Account" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Cost Per Item ($)</label>
                                <input type="number" className="input-field" value={newItem.purchasePrice} onChange={e => setNewItem({ ...newItem, purchasePrice: e.target.value })} style={{ width: '100%' }} placeholder="0.00" />
                            </div>
                        </div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Paste from Excel/Sheets (Columns: User | Pass | Email | Tag)</label>
                        <textarea
                            placeholder={`Paste directly from Excel (Cells A, B, C, D...)\n\nExample:\nuser1\tpass1\temail1\t#netflix-4k\nuser2\tpass2\temail2\t#spotify-prem`}
                            value={bulkData}
                            onChange={e => setBulkData(e.target.value)}
                            className="input-field"
                            style={{ width: '100%', height: '200px', fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: '1rem', whiteSpace: 'pre' }}
                        />
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={handleBulkImport} className="btn btn-primary">Process Import</button>
                            <button onClick={() => setShowBulk(false)} className="btn btn-outline">Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
