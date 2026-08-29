"use client";

import { getPlatformIcon } from '@/lib/icons';
import { modernAlert } from '@/components/ModernUIOverlay';

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
    bulkProductData: string;
    setBulkProductData: (data: string) => void;
    handleDeleteProduct: (id: number) => Promise<void>;
    handleBulkGenerateReviews: (ids?: number[]) => Promise<void>;
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
    bulkProductData,
    setBulkProductData,
    handleDeleteProduct,
    handleBulkGenerateReviews
}: CatalogTabProps) {
    // Brand Color Helper to generate dynamic icon glow
    const getBrandColor = (platform: string) => {
        const p = platform.toLowerCase();
        if (p.includes('snapchat') || p.includes('snap')) return 'rgba(255, 252, 0, 0.4)';
        if (p.includes('reddit')) return 'rgba(255, 69, 0, 0.4)';
        if (p.includes('discord')) return 'rgba(88, 101, 242, 0.4)';
        if (p.includes('instagram') || p.includes(' ig ')) return 'rgba(225, 48, 108, 0.4)';
        if (p.includes('tiktok') || p.includes(' tt ')) return 'rgba(0, 242, 234, 0.4)';
        if (p.includes('youtube')) return 'rgba(255, 0, 0, 0.4)';
        if (p.includes('telegram')) return 'rgba(0, 136, 204, 0.4)';
        if (p.includes('twitter') || p.includes(' x ')) return 'rgba(255, 255, 255, 0.3)';
        return 'rgba(0, 255, 136, 0.3)'; // Default OfficialUM1 green
    };

    const seoTitle = (newProduct.seo_title || newProduct.name || '').trim();
    const seoDescription = (newProduct.seo_description || newProduct.description || '').trim();
    const productSeoChecks = [
        seoTitle.length >= 35 && seoTitle.length <= 65,
        seoDescription.length >= 120 && seoDescription.length <= 160,
        Boolean((newProduct.focus_keyword || '').trim()),
        Boolean((newProduct.image || '').trim()),
        (newProduct.robots || 'index,follow').includes('index'),
    ];
    const productSeoScore = Math.round((productSeoChecks.filter(Boolean).length / productSeoChecks.length) * 100);

    return (
        <div className="FadeIn">
            {/* 🔥 UPGRADED UNIFIED ACTION TOOLBAR */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 border-b border-slate-200 pb-6">
                <div>
                    <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900 tracking-tight">
                        🛍️ Shop Product Catalog
                        <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200 tracking-wider font-bold">{catalog.length} TOTAL</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Design listings, sync values, and dispatch review generators.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {catalog.length > 0 && (
                        <label className="flex items-center gap-2.5 bg-white border border-slate-200 hover:bg-slate-50 transition-all px-4 py-2.5 rounded-xl cursor-pointer select-none shadow-sm">
                            <input
                                type="checkbox"
                                checked={selectedShopProducts.length === catalog.length}
                                onChange={(e) => {
                                    if (e.target.checked) setSelectedShopProducts(catalog.map(p => p.id));
                                    else setSelectedShopProducts([]);
                                }}
                                className="w-4 h-4 accent-[#146C78] cursor-pointer"
                            />
                            <span className="text-xs font-bold text-slate-700">Select All</span>
                        </label>
                    )}

                    {/* Active Selection Controls Block */}
                    {selectedShopProducts.length > 0 && (
                        <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 p-1 rounded-xl animate-in zoom-in-95 duration-200">
                            <span className="text-[10px] font-black text-[#146C78] uppercase tracking-widest px-3">{selectedShopProducts.length} Selected</span>
                            <button onClick={handleBulkDeleteProducts} className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5">
                                🗑️ Delete
                            </button>
                            <button onClick={() => handleBulkGenerateReviews()} className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-500 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5">
                                ⭐ Gen Reviews
                            </button>
                        </div>
                    )}

                    {/* Utility Separator */}
                    <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1"></div>

                    {/* Utility Actions Grid */}
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleCleanupDescriptions} 
                            title="Format & Fix Descriptions"
                            className="bg-white text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                        >
                            🧹 Clean Up
                        </button>
                        <button 
                            onClick={() => {
                                const results = catalog.filter(p => selectedShopProducts.includes(p.id) || (selectedShopProducts.length === 0));
                                const bulkText = results.map(p => `${p.id},${p.price},${p.stock || 1},${p.platform}`).join('\n');
                                setBulkUpdateText(bulkText);
                                setShowBulkUpdateModal(true);
                            }} 
                            className="bg-white text-[#146C78] border border-slate-200 hover:bg-teal-50 hover:border-teal-300 px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-sm"
                        >
                            📝 Bulk Update
                        </button>
                        <button onClick={() => setShowAddCategory(true)} className="bg-white text-cyan-700 border border-slate-200 hover:bg-cyan-50 hover:border-cyan-300 px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-sm">
                            📁 Categories
                        </button>
                    </div>

                    {/* Core CTAs */}
                    <button 
                        onClick={() => setShowGenerator(true)} 
                        className="bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md hover:scale-[1.02] px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                    >
                        ⚡ Quick Gen
                    </button>
                    <button 
                        onClick={() => { setEditingProduct(null); setShowAddProduct(true); }} 
                        className="bg-[#146C78] hover:bg-[#0f545e] text-white shadow-md hover:scale-[1.02] px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                    >
                        ➕ Add Product
                    </button>
                </div>
            </div>

            {/* 🔥 PREMIUM OVERHAULED PRODUCT GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                {catalog.map((prod: any) => {
                    const isSelected = selectedShopProducts.includes(prod.id);
                    const brandGlow = getBrandColor(prod.platform);

                    return (
                        <div 
                            key={prod.id} 
                            className="group relative flex flex-col bg-white hover:bg-slate-50 rounded-2xl border transition-all duration-300 overflow-hidden hover:-translate-y-1 shadow-sm hover:shadow-md"
                            style={{ 
                                borderColor: isSelected ? '#146C78' : '#E2E8F0',
                                boxShadow: isSelected ? '0 10px 30px rgba(20,108,120,0.12)' : 'none'
                            }}
                        >
                            {/* Premium Checkbox Overlay */}
                            <div className="absolute top-4 left-4 z-20">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedShopProducts([...selectedShopProducts, prod.id]);
                                        else setSelectedShopProducts(selectedShopProducts.filter(id => id !== prod.id));
                                    }}
                                    className="w-5 h-5 accent-[#146C78] cursor-pointer rounded border-slate-300 bg-white transition-all active:scale-90"
                                />
                            </div>

                            {/* Dynamic Brand Glow Backing Wrapper */}
                            <div className="relative flex items-center justify-center h-44 overflow-hidden bg-slate-50 border-b border-slate-100 group-hover:bg-slate-100/60 transition-colors">
                                {/* Mesh Radial Glow */}
                                <div 
                                    className="absolute w-36 h-36 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none z-0"
                                    style={{ background: brandGlow }}
                                />
                                
                                {/* Floating Icon Box */}
                                <div className="relative z-10 w-20 h-20 flex items-center justify-center rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                    <img 
                                        src={getPlatformIcon(prod.platform, prod.image)} 
                                        alt={prod.name} 
                                        className="w-12 h-12 object-contain" 
                                    />
                                </div>

                                {/* Hover Dynamic Accent Bar */}
                                <div 
                                    className="absolute bottom-0 inset-x-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{ background: `linear-gradient(90deg, transparent, #146C78, transparent)` }}
                                />
                            </div>

                            {/* Info Module */}
                            <div className="flex-1 p-5 flex flex-col">
                                {/* Category Tag */}
                                <div className="flex items-center gap-1.5 mb-2">
                                    {prod.categoryIcon && (prod.categoryIcon.startsWith('/') || prod.categoryIcon.startsWith('http')) ? (
                                        <img src={prod.categoryIcon} alt="" className="w-3.5 h-3.5 object-contain opacity-70" />
                                    ) : (
                                        <span className="text-xs opacity-70">{prod.categoryIcon || '📁'}</span>
                                    )}
                                    <span className="text-[10px] font-black tracking-wider uppercase text-slate-500 truncate">{prod.categoryName || 'Uncategorized'}</span>
                                </div>

                                {/* Title */}
                                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#146C78] transition-colors mb-3 line-clamp-2 min-h-[40px] leading-snug">
                                    {prod.name}
                                </h3>

                                {/* Platform and Pricing Bar */}
                                <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3 pb-4">
                                    <span className="text-xs font-medium text-gray-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg uppercase tracking-wider text-[9px]">{prod.platform}</span>
                                    <div className="text-right">
                                        {(prod.categoryDiscount > 0 || prod.sale_price) ? (
                                            <div className="flex flex-col items-end leading-tight">
                                                <span className="text-[10px] line-through text-gray-600">${prod.price}</span>
                                                <span className="text-base font-black text-red-400">
                                                    ${Math.min(
                                                        prod.sale_price || 999999,
                                                        prod.categoryDiscount > 0 ? (prod.price * (1 - prod.categoryDiscount / 100)) : 999999
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-base font-black text-emerald-400">${prod.price}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Action Tray */}
                                <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-white/5">
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
                                                inventoryTag: prod.inventory_tag || '',
                                                seo_title: prod.seo_title || '',
                                                seo_description: prod.seo_description || '',
                                                focus_keyword: prod.focus_keyword || '',
                                                seo_keywords: prod.seo_keywords || '',
                                                canonical_url: prod.canonical_url || '',
                                                robots: prod.robots || 'index,follow',
                                                schema_type: prod.schema_type || 'Product'
                                            });
                                            setShowAddProduct(true);
                                            setImportMode('manual');
                                        }}
                                        title="Edit listing"
                                        className="h-8 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all text-xs font-bold"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/shop/${prod.id}`);
                                            modernAlert('Link Copied!');
                                        }}
                                        title="Copy Storefront Link"
                                        className="h-8 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-emerald-400 transition-all text-xs"
                                    >
                                        🔗
                                    </button>
                                    <button
                                        onClick={() => handleBulkGenerateReviews([prod.id])}
                                        title="Generate Trust Reviews"
                                        className="h-8 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-yellow-400 transition-all text-xs"
                                    >
                                        ⭐
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(prod.id)}
                                        title="Delete Product Listing"
                                        className="h-8 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all text-xs"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {catalog.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-[#0d0d11] rounded-3xl border border-white/5 border-dashed">
                        <div className="text-4xl mb-3">📦</div>
                        <h3 className="text-white font-bold text-lg mb-1">Catalog Empty</h3>
                        <p className="text-gray-500 text-sm">Launch your first offer by clicking "Add Product" above.</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Product Modal */}
            {showAddProduct && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)', padding: '2rem' }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '1080px', padding: '3rem', borderRadius: '30px', position: 'relative', border: '1px solid #00ff88', maxHeight: '90vh', overflowY: 'auto' }}>
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
                                        <label style={{ color: '#00ff88' }}>🔗 Inventory Tag (Optional)</label>
                                        <input
                                            className="input-field"
                                            value={newProduct.inventoryTag || ''}
                                            onChange={e => setNewProduct({ ...newProduct, inventoryTag: e.target.value })}
                                            placeholder="#netflix-4k"
                                            style={{ width: '100%', borderColor: '#00ff88' }}
                                        />
                                        <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.3rem' }}>Matches items with this tag in inventory. Overrides name matching.</p>
                                    </div>
                                    <div>
                                        <label style={{ color: '#ccc' }}>Category</label>
                                        <select className="input-field" value={newProduct.category_id} onChange={e => setNewProduct({ ...newProduct, category_id: e.target.value })} style={{ width: '100%' }}>
                                            <option value="">No Category</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                                        </select>
                                    </div>
                                    <div><label style={{ color: '#ccc' }}>Platform / Brand</label><input className="input-field" value={newProduct.platform} onChange={e => setNewProduct({ ...newProduct, platform: e.target.value })} placeholder="e.g. Discord, Snapchat" required style={{ width: '100%' }} /></div>
                                    <div><label style={{ color: '#ccc' }}>Price ($)</label><input type="number" className="input-field" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required style={{ width: '100%' }} /></div>

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
                                        <input type="number" className="input-field" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} style={{ width: '100%' }} placeholder="Auto-calculated if tag used" />
                                        <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.3rem' }}>Leave empty to count inventory automatically.</p>
                                    </div>
                                    <div><label style={{ color: '#ccc' }}>Image URL (Optional)</label><input className="input-field" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} style={{ width: '100%' }} placeholder="https://..." /></div>
                                    <div style={{ gridColumn: 'span 2' }}><label style={{ color: '#ccc' }}>Description</label><textarea className="input-field" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} style={{ width: '100%', height: '80px' }} /></div>

                                    <div style={{ gridColumn: 'span 2', background: 'rgba(20,108,120,0.10)', border: '1px solid rgba(20,108,120,0.28)', padding: '1.25rem', borderRadius: '14px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div>
                                                <label style={{ color: '#7ee7d1', display: 'block', fontWeight: 800 }}>Rank Math SEO Panel</label>
                                                <p style={{ color: '#9fb1b8', fontSize: '0.75rem', marginTop: '0.25rem' }}>Controls Google title, meta description, canonical, robots and schema.</p>
                                            </div>
                                            <div style={{ color: productSeoScore >= 80 ? '#00ff88' : productSeoScore >= 55 ? '#ffaa00' : '#ff6b6b', fontWeight: 900 }}>
                                                SEO {productSeoScore}%
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={{ color: '#ccc' }}>SEO Title</label>
                                                <input className="input-field" value={newProduct.seo_title || ''} onChange={e => setNewProduct({ ...newProduct, seo_title: e.target.value })} placeholder={newProduct.name || 'Product title for Google'} style={{ width: '100%' }} />
                                                <p style={{ color: '#7f9299', fontSize: '0.7rem', marginTop: '0.25rem' }}>{seoTitle.length}/60 recommended</p>
                                            </div>
                                            <div>
                                                <label style={{ color: '#ccc' }}>Focus Keyword</label>
                                                <input className="input-field" value={newProduct.focus_keyword || ''} onChange={e => setNewProduct({ ...newProduct, focus_keyword: e.target.value })} placeholder="e.g. buy aged reddit account" style={{ width: '100%' }} />
                                            </div>
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <label style={{ color: '#ccc' }}>Meta Description</label>
                                                <textarea className="input-field" value={newProduct.seo_description || ''} onChange={e => setNewProduct({ ...newProduct, seo_description: e.target.value })} placeholder="Short search snippet under 160 characters." style={{ width: '100%', height: '80px' }} />
                                                <p style={{ color: '#7f9299', fontSize: '0.7rem', marginTop: '0.25rem' }}>{seoDescription.length}/155 recommended</p>
                                            </div>
                                            <div>
                                                <label style={{ color: '#ccc' }}>Extra Keywords</label>
                                                <input className="input-field" value={newProduct.seo_keywords || ''} onChange={e => setNewProduct({ ...newProduct, seo_keywords: e.target.value })} placeholder="comma, separated, keywords" style={{ width: '100%' }} />
                                            </div>
                                            <div>
                                                <label style={{ color: '#ccc' }}>Canonical URL</label>
                                                <input className="input-field" value={newProduct.canonical_url || ''} onChange={e => setNewProduct({ ...newProduct, canonical_url: e.target.value })} placeholder="Leave blank for default product URL" style={{ width: '100%' }} />
                                            </div>
                                            <div>
                                                <label style={{ color: '#ccc' }}>Robots Meta</label>
                                                <select className="input-field" value={newProduct.robots || 'index,follow'} onChange={e => setNewProduct({ ...newProduct, robots: e.target.value })} style={{ width: '100%' }}>
                                                    <option value="index,follow">Index, Follow</option>
                                                    <option value="noindex,follow">Noindex, Follow</option>
                                                    <option value="index,nofollow">Index, Nofollow</option>
                                                    <option value="noindex,nofollow">Noindex, Nofollow</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ color: '#ccc' }}>Schema Type</label>
                                                <select className="input-field" value={newProduct.schema_type || 'Product'} onChange={e => setNewProduct({ ...newProduct, schema_type: e.target.value })} style={{ width: '100%' }}>
                                                    <option value="Product">Product</option>
                                                    <option value="Service">Service</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

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
                                        <button type="button" onClick={() => { setShowAddProduct(false); setEditingProduct(null); setNewProduct({ name: '', platform: 'OfficialUM1', price: '', description: '', image: '', salePrice: '', saleEndsAt: '', bundleItems: '', stock: '100', category_id: '', inventoryTag: '', seo_title: '', seo_description: '', focus_keyword: '', seo_keywords: '', canonical_url: '', robots: 'index,follow', schema_type: 'Product' }); }} className="btn btn-outline">Cancel</button>
                                        <button type="submit" className="btn btn-primary">{editingProduct ? 'Save Changes' : 'Create Product'}</button>
                                    </div>
                                </form>
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
