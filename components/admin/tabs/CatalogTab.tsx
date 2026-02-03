"use client";

import { getPlatformIcon } from '@/lib/icons';

interface CatalogTabProps {
    catalog: any[];
    selectedShopProducts: number[];
    setSelectedShopProducts: (ids: number[]) => void;
    handleBulkDeleteProducts: any;
    handleCleanupDescriptions: () => Promise<void>;
    setBulkUpdateText: (text: string) => void;
    setShowBulkUpdateModal: (show: boolean) => void;
    setShowAddCategory: (show: boolean) => void;
    setShowGenerator: (show: boolean) => void;
    setEditingProduct: (prod: any) => void;
    setShowAddProduct: (show: boolean) => void;
    showAddProduct: boolean;
    editingProduct: any;
    importMode: string;
    setImportMode: any;
    newProduct: any;
    setNewProduct: (prod: any) => void;
    categories: any[];
    handleAddProduct: (e: any) => Promise<void>;
    handleProductFileChange: (e: any) => void;
    handleBulkProductImport: (e: any) => Promise<void>;
    handleZ2UMagicSync: (text: string) => void;
    handlePlayerUpMagicSync: (text: string) => void;
    bulkProductData: string;
    setBulkProductData: (data: string) => void;
    handleDeleteProduct: (id: number) => Promise<void>;
}

export default function CatalogTab({
    catalog,
    selectedShopProducts,
    setSelectedShopProducts,
    handleBulkDeleteProducts,
    handleCleanupDescriptions,
    setBulkUpdateText,
    setShowBulkUpdateModal,
    setShowAddCategory,
    setShowGenerator,
    setEditingProduct,
    setShowAddProduct,
    showAddProduct,
    editingProduct,
    importMode,
    setImportMode,
    newProduct,
    setNewProduct,
    categories,
    handleAddProduct,
    handleProductFileChange,
    handleBulkProductImport,
    handleZ2UMagicSync,
    handlePlayerUpMagicSync,
    bulkProductData,
    setBulkProductData,
    handleDeleteProduct
}: CatalogTabProps) {
    return (
        <div className="FadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>🛍️ Shop Product Catalog</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {catalog.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginRight: '1rem' }}>
                            <input
                                type="checkbox"
                                checked={selectedShopProducts.length === catalog.length}
                                onChange={(e) => {
                                    if (e.target.checked) setSelectedShopProducts(catalog.map(p => p.id));
                                    else setSelectedShopProducts([]);
                                }}
                                style={{ width: '18px', height: '18px', accentColor: '#00ff88', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.9rem', color: '#888' }}>Select All</span>
                        </div>
                    )}
                    {selectedShopProducts.length > 0 && (
                        <button onClick={handleBulkDeleteProducts} className="btn btn-outline" style={{ color: '#ff4d4d', borderColor: 'rgba(255,77,77,0.3)', background: 'rgba(255,77,77,0.05)' }}>
                            🗑️ Delete ({selectedShopProducts.length})
                        </button>
                    )}
                    <button onClick={handleCleanupDescriptions} className="btn btn-outline" style={{ borderStyle: 'dashed', opacity: 0.7 }}>🧹 Clean Descriptions</button>
                    <button onClick={() => {
                        const results = catalog.filter(p => selectedShopProducts.includes(p.id) || (selectedShopProducts.length === 0));
                        const bulkText = results.map(p => `${p.id},${p.price},${p.stock || 1},${p.platform}`).join('\n');
                        setBulkUpdateText(bulkText);
                        setShowBulkUpdateModal(true);
                    }} className="btn btn-outline" style={{ color: '#00ff88', borderColor: '#00ff8833' }}>
                        📝 Bulk Stock/Price
                    </button>
                    <button onClick={() => setShowAddCategory(true)} className="btn btn-outline" style={{ color: '#00ccff', borderColor: '#00ccff33' }}>📁 Manage Categories</button>
                    <button onClick={() => setShowGenerator(true)} className="btn btn-primary" style={{ background: 'linear-gradient(45deg, #00ff88, #00ccff)', color: '#000', fontWeight: 'bold' }}>⚡ Quick Generator</button>
                    <button onClick={() => { setEditingProduct(null); setShowAddProduct(true); }} className="btn btn-primary">+ Add Shop Product</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                {catalog.map((prod: any) => (
                    <div key={prod.id} className="glass" style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${selectedShopProducts.includes(prod.id) ? '#00ff88' : 'rgba(255,255,255,0.05)'}`, position: 'relative' }}>
                        {/* Bulk Select Checkbox */}
                        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
                            <input
                                type="checkbox"
                                checked={selectedShopProducts.includes(prod.id)}
                                onChange={(e) => {
                                    if (e.target.checked) setSelectedShopProducts([...selectedShopProducts, prod.id]);
                                    else setSelectedShopProducts(selectedShopProducts.filter(id => id !== prod.id));
                                }}
                                style={{ width: '16px', height: '16px', accentColor: '#00ff88', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ width: '60px', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#222', borderRadius: '50%', fontSize: '1.5rem' }}>
                                <img src={getPlatformIcon(prod.platform, prod.image)} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
                            </div>
                        </div>
                        <div style={{ padding: '1rem' }}>
                            <h3 style={{ marginBottom: '0.2rem', color: '#fff', fontSize: '0.95rem' }}>{prod.name}</h3>
                            <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                {prod.categoryIcon} {prod.categoryName || 'Uncategorized'}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc', marginBottom: '0.8rem', fontSize: '0.8rem' }}>
                                <span>{prod.platform}</span>
                                <div style={{ textAlign: 'right' }}>
                                    {(prod.categoryDiscount > 0 || prod.sale_price) ? (
                                        <>
                                            <span style={{ textDecoration: 'line-through', color: '#666', fontSize: '0.7rem', marginRight: '0.3rem' }}>${prod.price}</span>
                                            <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>
                                                ${Math.min(
                                                    prod.sale_price || 999999,
                                                    prod.categoryDiscount > 0 ? (prod.price * (1 - prod.categoryDiscount / 100)) : 999999
                                                ).toFixed(2)}
                                            </span>
                                        </>
                                    ) : (
                                        <span style={{ color: '#00ff88', fontWeight: 'bold' }}>${prod.price}</span>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.3rem' }}>
                                <button
                                    onClick={() => {
                                        setEditingProduct(prod);
                                        setNewProduct({
                                            name: prod.name,
                                            platform: prod.platform,
                                            price: prod.price,
                                            description: prod.description || '',
                                            image: prod.image || '',
                                            salePrice: prod.sale_price || '',
                                            saleEndsAt: prod.sale_ends_at ? new Date(prod.sale_ends_at).toISOString().slice(0, 16) : '',
                                            bundleItems: prod.bundle_items || '',
                                            stock: prod.stock || '1',
                                            category_id: prod.category_id || '',
                                            g2g_listing_id: prod.g2g_listing_id || ''
                                        });
                                        setShowAddProduct(true);
                                        setImportMode('manual');
                                    }}
                                    className="btn btn-outline"
                                    style={{ flex: 1, fontSize: '0.7rem', padding: '0.3rem' }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/shop/${prod.id}`);
                                        alert('Link Copied!');
                                    }}
                                    className="btn btn-outline"
                                    style={{ flex: 1, fontSize: '0.7rem', color: '#00ff88', borderColor: 'rgba(0,255,136,0.3)', padding: '0.3rem' }}
                                >
                                    🔗 Link
                                </button>
                                <button
                                    onClick={() => handleDeleteProduct(prod.id)}
                                    className="btn btn-outline"
                                    style={{ flex: 0.5, fontSize: '0.7rem', color: '#ff4d4d', borderColor: 'rgba(255,77,77,0.3)', padding: '0.3rem' }}
                                    title="Delete Product"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {catalog.length === 0 && <p style={{ color: '#666' }}>No products in catalog. Add one to start selling.</p>}
            </div>

            {/* Add/Edit Product Modal */}
            {showAddProduct && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)', padding: '2rem' }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '900px', padding: '3rem', borderRadius: '30px', position: 'relative', border: '1px solid #00ff88', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button
                            onClick={() => { setShowAddProduct(false); setEditingProduct(null); }}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}
                        >✕</button>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <h3 style={{ margin: 0 }}>
                                {editingProduct ? '📝 Edit Shop Product' : (importMode === 'manual' ? 'Add New Product' : 'Bulk Product Import')}
                            </h3>
                            {!editingProduct && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => setImportMode('manual')} className={`btn ${importMode === 'manual' ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}>Single Entry</button>
                                    <button onClick={() => setImportMode('csv')} className={`btn ${importMode === 'csv' ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}>Bulk CSV</button>
                                    <button onClick={() => setImportMode('z2u')} className={`btn ${importMode === 'z2u' ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem', color: '#00ff88', borderColor: '#00ff88' }}>🪄 Z2U Sync</button>
                                    <button onClick={() => setImportMode('playerup')} className={`btn ${importMode === 'playerup' ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem', color: '#00c3ff', borderColor: '#00c3ff' }}>🛒 PlayerUp Importer</button>
                                </div>
                            )}
                        </div>

                        {importMode === 'manual' ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <img src={getPlatformIcon(newProduct.platform, newProduct.image)} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: '#888' }}>Icon Preview</p>
                                </div>
                                <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div><label style={{ color: '#ccc' }}>Product Name</label><input className="input-field" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required style={{ width: '100%' }} /></div>
                                    <div>
                                        <label style={{ color: '#ccc' }}>Category</label>
                                        <select className="input-field" value={newProduct.category_id} onChange={e => setNewProduct({ ...newProduct, category_id: e.target.value })} style={{ width: '100%' }}>
                                            <option value="">No Category</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                                        </select>
                                    </div>
                                    <div><label style={{ color: '#ccc' }}>Platform / Brand</label><input className="input-field" value={newProduct.platform} onChange={e => setNewProduct({ ...newProduct, platform: e.target.value })} placeholder="e.g. Discord, Snapchat" required style={{ width: '100%' }} /></div>
                                    <div><label style={{ color: '#ccc' }}>Price ($)</label><input type="number" className="input-field" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required style={{ width: '100%' }} /></div>
                                    <div><label style={{ color: '#00ccff' }}>🔗 G2G Listing ID</label><input className="input-field" value={newProduct.g2g_listing_id} onChange={e => setNewProduct({ ...newProduct, g2g_listing_id: e.target.value })} placeholder="e.g. 1234567" style={{ width: '100%', borderColor: '#00ccff33' }} /></div>

                                    {/* Flash Sale Fields */}
                                    <div>
                                        <label style={{ color: '#ff4d4d', display: 'block', marginBottom: '0.5rem' }}>🔥 Sale Price ($)</label>
                                        <input type="number" className="input-field" value={newProduct.salePrice || ''} onChange={e => setNewProduct({ ...newProduct, salePrice: e.target.value })} style={{ width: '100%', borderColor: '#ff4d4d' }} placeholder="Optional" />
                                    </div>
                                    <div>
                                        <label style={{ color: '#ff4d4d', display: 'block', marginBottom: '0.5rem' }}>Sale Ends At</label>
                                        <input type="datetime-local" className="input-field" value={newProduct.saleEndsAt || ''} onChange={e => setNewProduct({ ...newProduct, saleEndsAt: e.target.value })} style={{ width: '100%', borderColor: '#ff4d4d' }} />
                                    </div>
                                    <div>
                                        <label style={{ color: '#ccc' }}>Stock Level (Manual)</label>
                                        <input type="number" className="input-field" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} style={{ width: '100%' }} placeholder="Enter manual stock count" />
                                        <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.3rem' }}>Overrides inventory system if set.</p>
                                    </div>
                                    <div><label style={{ color: '#ccc' }}>Image URL (Optional)</label><input className="input-field" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} style={{ width: '100%' }} placeholder="https://..." /></div>
                                    <div style={{ gridColumn: 'span 2' }}><label style={{ color: '#ccc' }}>Description</label><textarea className="input-field" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} style={{ width: '100%', height: '80px' }} /></div>

                                    {/* Bundle Configuration */}
                                    <div style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                                        <label style={{ color: '#00c3ff', display: 'block', marginBottom: '0.5rem' }}>📦 Bundle Configuration (Optional)</label>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            {/* Helper to add IDs */}
                                            <div style={{ flex: 1, maxHeight: '150px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.5rem' }}>
                                                {catalog.map(p => (
                                                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={(newProduct.bundleItems ? JSON.parse(newProduct.bundleItems) : []).includes(p.id)}
                                                            onChange={(e) => {
                                                                const currentIds = newProduct.bundleItems ? JSON.parse(newProduct.bundleItems) : [];
                                                                let newIds;
                                                                if (e.target.checked) {
                                                                    newIds = [...currentIds, p.id];
                                                                } else {
                                                                    newIds = currentIds.filter((id: number) => id !== p.id);
                                                                }
                                                                setNewProduct({ ...newProduct, bundleItems: JSON.stringify(newIds) });
                                                            }}
                                                        />
                                                        <span style={{ fontSize: '0.8rem', color: '#ccc' }}>{p.name} (${p.price})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <input
                                            className="input-field"
                                            placeholder="Selected IDs (Auto-filled)"
                                            value={newProduct.bundleItems || ''}
                                            readOnly
                                            style={{ width: '100%', fontSize: '0.8rem', color: '#888' }}
                                        />
                                    </div>

                                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                        <button type="button" onClick={() => { setShowAddProduct(false); setEditingProduct(null); setNewProduct({ name: '', platform: 'Z2U', price: '', description: '', image: '', salePrice: '', saleEndsAt: '', bundleItems: '', stock: '100', category_id: '', g2g_listing_id: '' }); }} className="btn btn-outline">Cancel</button>
                                        <button type="submit" className="btn btn-primary">{editingProduct ? 'Save Changes' : 'Create Product'}</button>
                                    </div>
                                </form>
                            </div>
                        ) : importMode === 'z2u' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ background: 'linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(0,255,136,0.05) 100%)', padding: '2rem', borderRadius: '16px', border: '1px solid #00ff88', textAlign: 'center' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🪄</div>
                                    <h4 style={{ marginBottom: '1rem' }}>Express Z2U Sync</h4>
                                    <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                                        Z2U prevents automated tools from reading prices. To bypass this, simply:
                                        <br /><br />
                                        1. Go to your <a href="https://www.z2u.com/reddit/accounts-5-15132?seller=265820" target="_blank" style={{ color: '#00ff88' }}>Z2U Seller Page</a>
                                        <br />
                                        2. Press <b>Ctrl + A</b> (Select All) then <b>Ctrl + C</b> (Copy)
                                        <br />
                                        3. Paste everything in the box below
                                    </p>

                                    <textarea
                                        className="input-field"
                                        placeholder="Paste everything from Z2U page here..."
                                        style={{ width: '100%', height: '150px', background: 'rgba(0,0,0,0.5)', marginBottom: '1.5rem' }}
                                        onChange={(e) => handleZ2UMagicSync(e.target.value)}
                                    />

                                    <div style={{ color: '#888', fontSize: '0.8rem' }}>
                                        I will automatically extract all Product Titles and Prices for you.
                                    </div>
                                </div>
                            </div>
                        ) : importMode === 'playerup' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ background: 'linear-gradient(135deg, rgba(0,195,255,0.1) 0%, rgba(0,195,255,0.05) 100%)', padding: '2rem', borderRadius: '16px', border: '1px solid #00c3ff', textAlign: 'center' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
                                    <h4 style={{ marginBottom: '1rem' }}>PlayerUp Bulk Importer</h4>
                                    <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '2rem', maxWidth: '550px', margin: '0 auto 2rem' }}>
                                        Import all your PlayerUp listings instantly.
                                        <br /><br />
                                        1. Open your <a href="https://www.playerup.com/search/28909027/?q=officialum1&o=date&c[node]=1075" target="_blank" style={{ color: '#00c3ff', fontWeight: 'bold' }}>PlayerUp Listing Page</a>
                                        <br />
                                        2. Select All (<b>Ctrl+A</b>) and Copy (<b>Ctrl+C</b>)
                                        <br />
                                        3. Paste everything in the box below
                                    </p>

                                    <textarea
                                        className="input-field"
                                        placeholder="Paste PlayerUp page content here..."
                                        style={{ width: '100%', height: '150px', background: 'rgba(0,0,0,0.5)', marginBottom: '1.5rem', border: '1px solid rgba(0,195,255,0.3)' }}
                                        onChange={(e) => handlePlayerUpMagicSync(e.target.value)}
                                    />

                                    <div style={{ color: '#888', fontSize: '0.8rem' }}>
                                        I will scan the text and find every listing title and price for your catalog.
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => setImportMode('manual')} className="btn btn-outline">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleBulkProductImport} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ background: 'rgba(0,255,136,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(0,255,136,0.1)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <p style={{ color: '#00ff88', fontSize: '1rem', margin: 0, fontWeight: 'bold' }}>1. Get Template File</p>
                                        <a href="/catalog_template.csv" download className="btn btn-outline" style={{ color: '#00ff88', borderColor: '#00ff88', padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                                            📥 Download Excel Template
                                        </a>
                                    </div>
                                    <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                        Download the template, fill it in Excel, save it, and then upload it below.
                                    </p>

                                    <p style={{ color: '#00ff88', fontSize: '1rem', margin: '0 0 1rem 0', fontWeight: 'bold' }}>2. Upload your Sheet</p>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleProductFileChange}
                                        style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            padding: '1.5rem',
                                            borderRadius: '10px',
                                            border: '2px dashed rgba(0,255,136,0.3)',
                                            width: '100%',
                                            color: '#aaa',
                                            cursor: 'pointer'
                                        }}
                                    />
                                </div>

                                <div style={{ opacity: bulkProductData ? 1 : 0.5 }}>
                                    <label style={{ color: '#ccc', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Preview / Manual Data (Optional)</label>
                                    <textarea
                                        className="input-field"
                                        placeholder="Data from your file will appear here automatically..."
                                        value={bulkProductData}
                                        onChange={e => setBulkProductData(e.target.value)}
                                        style={{ width: '100%', height: '150px', fontFamily: 'monospace', fontSize: '0.8rem' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button type="button" onClick={() => { setShowAddProduct(false); setBulkProductData(''); }} className="btn btn-outline">Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={!bulkProductData} style={{ padding: '0.8rem 2rem' }}>
                                        ✅ Start Upload Process
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
