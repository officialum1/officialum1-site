"use client";
import { useState } from 'react';

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
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    handleReplaceItem?: (id: string) => Promise<void>;
    fetchData?: () => Promise<void>;
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
    handleBulkImport,
    searchQuery,
    setSearchQuery,
    handleReplaceItem,
    fetchData
}: StockTabProps) {
    const [editingItem, setEditingItem] = useState<any>(null);
    const [showEditItem, setShowEditItem] = useState(false);

    const filteredInventory = inventory.filter(i => {
        const q = searchQuery.toLowerCase();
        return (
            i.name?.toLowerCase().includes(q) ||
            i.account_email?.toLowerCase().includes(q) ||
            i.account_username?.toLowerCase().includes(q) ||
            i.platform?.toLowerCase().includes(q)
        );
    });

    const handleEditClick = (item: any) => {
        let credentials = '';
        if (item.accountDetails) {
            try {
                const details = typeof item.accountDetails === 'string' ? JSON.parse(item.accountDetails) : item.accountDetails;
                // Format: user:pass:email:extra
                credentials = `${details.username || ''}:${details.password || ''}:${details.email || ''}`;
                if (details.extraInfo) credentials += `:${details.extraInfo}`;
            } catch (e) {
                credentials = 'Error parsing details';
            }
        }

        setEditingItem({
            id: item.id,
            name: item.name,
            platform: item.platform,
            purchasePrice: item.purchasePrice,
            credentials,
            tag: item.tag || '',
            image: item.image || ''
        });
        setShowEditItem(true);
    };

    const handleUpdateInventory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        try {
            const res = await fetch('/api/admin/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update_item',
                    itemId: editingItem.id,
                    name: editingItem.name,
                    platform: editingItem.platform,
                    purchasePrice: editingItem.purchasePrice,
                    credentials: editingItem.credentials,
                    tag: editingItem.tag,
                    image: editingItem.image
                })
            });

            const data = await res.json();
            if (data.success) {
                alert('✅ Item Updated Successfully!');
                setShowEditItem(false);
                setEditingItem(null);
                if (fetchData) fetchData();
            } else {
                alert('❌ Update Failed: ' + (data.error || 'Unknown Error'));
            }
        } catch (e) {
            alert('❌ Network Error');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            if (isEdit) {
                setEditingItem((prev: any) => ({ ...prev, image: base64String }));
            } else {
                setNewItem({ ...newItem, image: base64String });
            }
        };
        reader.readAsDataURL(file);
    };

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

                {/* SEARCH BAR */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <input
                            type="text"
                            placeholder="Search by Email, Username, or Product Name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field"
                            style={{ width: '100%', paddingLeft: '2.5rem' }}
                        />
                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                    </div>
                </div>

                {/* STOCK VIEW TOGGLE & STATUS FILTER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['In Stock', 'Sold', 'Defective'].map(status => (
                            <button
                                key={status}
                                onClick={() => setSearchQuery(status === 'In Stock' ? '' : status)}
                                className="btn"
                                style={{
                                    padding: '6px 15px',
                                    fontSize: '0.8rem',
                                    background: searchQuery === status ? '#00ff88' : 'rgba(255,255,255,0.05)',
                                    color: searchQuery === status ? '#000' : '#888',
                                    border: '1px solid #333'
                                }}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
                        <button onClick={() => setViewMode('summary')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: viewMode === 'summary' ? '#00ff88' : 'transparent', color: viewMode === 'summary' ? '#000' : '#888', cursor: 'pointer', fontWeight: 'bold' }}>Cards</button>
                        <button onClick={() => setViewMode('list')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: viewMode === 'list' ? '#00ff88' : 'transparent', color: viewMode === 'list' ? '#000' : '#888', cursor: 'pointer', fontWeight: 'bold' }}>List</button>
                    </div>
                </div>

                {/* Stock Display */}
                {viewMode === 'summary' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {Array.from(new Set(filteredInventory.filter(i => i.status === 'In Stock').map(i => i.name))).map(name => {
                            const items = filteredInventory.filter(i => i.name === name);
                            const activeItems = items.filter(i => i.status === 'In Stock');
                            const inStock = activeItems.length;
                            const platform = activeItems[0]?.platform || 'Unknown';

                            if (inStock === 0) return null;

                            return (
                                <div
                                    key={name}
                                    onClick={() => {
                                        setSearchQuery(name);
                                        setViewMode('list');
                                    }}
                                    className="glass stock-card"
                                    style={{
                                        padding: '1.5rem',
                                        borderRadius: '16px',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        cursor: 'pointer',
                                        transition: '0.3s'
                                    }}
                                >
                                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 10px', background: '#00ff88', color: '#000', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                        ACTIVE
                                    </div>
                                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', color: '#fff' }}>{name}</h3>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        {activeItems[0]?.image ? (
                                            <img src={activeItems[0].image} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>📦</div>
                                        )}
                                        <div style={{ fontSize: '0.85rem', color: '#888' }}>Platform: <span style={{ color: '#ccc' }}>{platform}</span></div>
                                    </div>

                                    <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#00ff88', lineHeight: '1' }}>{inStock}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '5px' }}>Check stock items</div>
                                    </div>

                                    <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#444' }}>
                                        Click to divide & edit individual items
                                    </div>
                                </div>
                            );
                        })}
                        {filteredInventory.filter(i => i.status === 'In Stock').length === 0 && <div style={{ color: '#666', gridColumn: 'span 3', textAlign: 'center', padding: '4rem' }}>No active stock found.</div>}
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
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInventory.map((item: any) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                                {item.image ? (
                                                    <img src={item.image} alt="" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>📦</div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: '500' }}>{item.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{item.account_email || item.account_username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{item.platform}</td>
                                        <td style={{ padding: '1rem', color: '#ccc' }}>{item.purchasePrice ? `$${item.purchasePrice}` : '***'}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                color: item.status === 'In Stock' ? '#00ff88' : (item.status === 'Sold' ? '#ffa500' : '#ff4444'),
                                                fontSize: '0.8rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            {item.status === 'Sold' ? (
                                                <button
                                                    onClick={() => handleReplaceItem && handleReplaceItem(item.id)}
                                                    className="btn"
                                                    style={{
                                                        padding: '4px 10px',
                                                        fontSize: '0.75rem',
                                                        background: 'rgba(255,165,0,0.1)',
                                                        border: '1px solid #ffa500',
                                                        color: '#ffa500'
                                                    }}
                                                >
                                                    🔄 Replace
                                                </button>
                                            ) : item.status === 'In Stock' ? (
                                                <button
                                                    onClick={() => handleEditClick(item)}
                                                    className="btn"
                                                    style={{
                                                        padding: '4px 10px',
                                                        fontSize: '0.75rem',
                                                        background: 'rgba(0,180,255,0.1)',
                                                        border: '1px solid #00b4ff',
                                                        color: '#00b4ff'
                                                    }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                            ) : null}
                                        </td>
                                    </tr>
                                ))}
                                {filteredInventory.length === 0 && <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No items found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Add Item Modal */}
                {showAddInv && (
                    <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', marginTop: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Add Inventory Stock</h3>
                        <form onSubmit={handleAddInventory} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div><label>Platform</label><select className="input-field" value={newItem.platform} onChange={e => setNewItem({ ...newItem, platform: e.target.value })} style={{ width: '100%', background: '#111', color: '#fff' }}>                                    <option value="Z2U">Z2U</option>
                                <option value="PlayerUp">PlayerUp</option>
                                <option value="G2G">G2G</option>
                                <option value="Direct">Direct Sale</option>
                                <option value="Binance">Binance</option>
                                <option value="RedotPay">RedotPay</option>
                                <option value="Skrill">Skrill</option></select></div>
                            <div><label>Item Name</label><input type="text" className="input-field" required value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="Product Title" style={{ width: '100%' }} /></div>
                            <div><label>Inventory Tag</label><input type="text" className="input-field" value={newItem.tag || ''} onChange={e => setNewItem({ ...newItem, tag: e.target.value })} placeholder="#tag" style={{ width: '100%' }} /></div>
                            <div><label>Purchase Price</label><input type="number" required className="input-field" value={newItem.purchasePrice} onChange={e => setNewItem({ ...newItem, purchasePrice: e.target.value })} style={{ width: '100%' }} /></div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label>Account Credentials</label>
                                <textarea className="input-field" value={newItem.credentials || ''} onChange={e => setNewItem({ ...newItem, credentials: e.target.value })} style={{ width: '100%', height: '100px' }} placeholder="user:pass:email" />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label>Product Image (Optional)</label>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, false)}
                                        className="input-field"
                                        style={{ flex: 1 }}
                                    />
                                    {newItem.image && (
                                        <div style={{ position: 'relative' }}>
                                            <img src={newItem.image} alt="Preview" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #333' }} />
                                            <button
                                                type="button"
                                                onClick={() => setNewItem({ ...newItem, image: '' })}
                                                style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', border: 'none', width: '15px', height: '15px', fontSize: '10px', cursor: 'pointer' }}
                                            >✕</button>
                                        </div>
                                    )}
                                </div>
                                <input className="input-field" value={newItem.image || ''} onChange={e => setNewItem({ ...newItem, image: e.target.value })} style={{ width: '100%', marginTop: '0.5rem' }} placeholder="Or paste image URL..." />
                            </div>
                            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowAddInv(false)} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Item</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Edit Item Modal */}
                {showEditItem && editingItem && (
                    <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px', border: '1px solid #00b4ff', marginTop: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: '#00b4ff' }}>✏️ Edit Inventory Item</h3>
                        <form onSubmit={handleUpdateInventory} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label>Platform</label>
                                <select
                                    className="input-field"
                                    value={editingItem.platform}
                                    onChange={e => setEditingItem({ ...editingItem, platform: e.target.value })}
                                    style={{ width: '100%', background: '#111', color: '#fff' }}
                                >
                                    <option value="Z2U">Z2U</option>
                                    <option value="PlayerUp">PlayerUp</option>
                                    <option value="G2G">G2G</option>
                                    <option value="Direct">Direct Sale</option>
                                    <option value="Binance">Binance</option>
                                    <option value="RedotPay">RedotPay</option>
                                    <option value="Skrill">Skrill</option>
                                </select>
                            </div>
                            <div>
                                <label>Item Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    required
                                    value={editingItem.name}
                                    onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label>Inventory Tag</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={editingItem.tag || ''}
                                    onChange={e => setEditingItem({ ...editingItem, tag: e.target.value })}
                                    placeholder="#tag"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label>Purchase Price</label>
                                <input
                                    type="number"
                                    required
                                    className="input-field"
                                    value={editingItem.purchasePrice}
                                    onChange={e => setEditingItem({ ...editingItem, purchasePrice: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label>Account Credentials (User:Pass:Email)</label>
                                <textarea
                                    className="input-field"
                                    value={editingItem.credentials || ''}
                                    onChange={e => setEditingItem({ ...editingItem, credentials: e.target.value })}
                                    style={{ width: '100%', height: '100px', fontFamily: 'monospace' }}
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label>Product Image (Optional)</label>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, true)}
                                        className="input-field"
                                        style={{ flex: 1 }}
                                    />
                                    {editingItem.image && (
                                        <div style={{ position: 'relative' }}>
                                            <img src={editingItem.image} alt="Preview" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #333' }} />
                                            <button
                                                type="button"
                                                onClick={() => setEditingItem({ ...editingItem, image: '' })}
                                                style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', border: 'none', width: '15px', height: '15px', fontSize: '10px', cursor: 'pointer' }}
                                            >✕</button>
                                        </div>
                                    )}
                                </div>
                                <input
                                    className="input-field"
                                    value={editingItem.image || ''}
                                    onChange={e => setEditingItem({ ...editingItem, image: e.target.value })}
                                    style={{ width: '100%', marginTop: '0.5rem' }}
                                    placeholder="Or paste image URL..."
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowEditItem(false)} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ background: '#00b4ff', borderColor: '#00b4ff' }}>Update Changes</button>
                            </div>
                        </form>
                    </div>
                )}

                {showBulk && (
                    <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px', border: '1px solid #06b6d4', marginTop: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Bulk Import Inventory</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.5rem' }}>Platform</label>
                                <select className="input-field" value={newItem.platform} onChange={e => setNewItem({ ...newItem, platform: e.target.value })} style={{ width: '100%', background: '#111', color: '#fff' }}>
                                    <option value="Z2U">Z2U</option>
                                    <option value="PlayerUp">PlayerUp</option>
                                    <option value="G2G">G2G</option>
                                    <option value="Direct">Direct Sale</option>
                                    <option value="Binance">Binance</option>
                                    <option value="RedotPay">RedotPay</option>
                                    <option value="Skrill">Skrill</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.5rem' }}>Item Name Prefix</label>
                                <input type="text" className="input-field" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="e.g. Netflix Premium" style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.5rem' }}>Purchase Price (Each)</label>
                                <input type="number" className="input-field" value={newItem.purchasePrice} onChange={e => setNewItem({ ...newItem, purchasePrice: e.target.value })} placeholder="0.00" style={{ width: '100%' }} />
                            </div>
                        </div>

                        <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.5rem' }}>Account Data (One per line)</label>
                        <textarea
                            placeholder="Paste directly from Excel (User\tPass\tEmail\tTag) or use User:Pass:Email"
                            value={bulkData}
                            onChange={e => setBulkData(e.target.value)}
                            className="input-field"
                            style={{ width: '100%', height: '200px', marginBottom: '1rem' }}
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
