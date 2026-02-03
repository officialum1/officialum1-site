"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getPlatformIcon } from '@/lib/icons';
import { useCart } from '@/app/context/CartContext';
import { useWishlist } from '@/app/context/WishlistContext';
import { useCompare } from '@/app/context/CompareContext';

export default function ShopPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [shareId, setShareId] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    // New Features: Search, Sort, Notify
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price-asc', 'price-desc'
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [notifyEmail, setNotifyEmail] = useState('');
    const [notifyProduct, setNotifyProduct] = useState<any>(null);

    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { addToCompare, isInCompare } = useCompare();

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(e => setLoading(false));

        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('buyer_user');
            if (stored) setUser(JSON.parse(stored));
        }
    }, []);

    const handleNotifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!notifyEmail || !notifyProduct) return;
        try {
            const res = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: notifyEmail, productId: notifyProduct.id })
            });
            const data = await res.json();
            if (data.success) {
                alert("✅ We'll notify you when this is back in stock!");
                setShowNotifyModal(false);
                setNotifyEmail('');
            } else {
                alert(data.message || "Failed to subscribe. Try again.");
            }
        } catch (error) { alert("Error subscribing."); }
    };

    // Filter & Sort Logic
    let filtered = products.filter(p => {
        const matchesPlatform = filter === 'All' || p.platform === filter;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase());

        // VIP Filter: If product is VIP only, user MUST have a membership plan
        const isVipUser = user?.membership && ['silver', 'gold', 'diamond'].includes(user.membership.toLowerCase());
        const isProductGated = p.isVipOnly === 1;

        if (isProductGated && !isVipUser) return false;

        return matchesPlatform && matchesSearch;
    });

    if (sortBy === 'price-asc') {
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'price-desc') {
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else {
        // Assume default order (ID desc) is 'newest'
        filtered.sort((a, b) => b.id - a.id);
    }

    const platforms = ['All', ...Array.from(new Set(products.map((p: any) => p.platform)))];

    return (
        <main>
            <Navbar />
            <div className="container page-header" style={{ paddingTop: '150px' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 className="text-4xl font-bold mb-4">Premium <span className="text-gradient">Social Accounts</span></h1>
                    <p style={{ color: '#aaa', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Buy aged, verified, and high-quality accounts instantly.</p>
                    <Link href="/bundles" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#00ff88', borderColor: '#00ff88' }}>
                        🎁 Create a Bundle & Save 15%
                    </Link>
                </div>

                {/* Search & Sort Bar */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="🔍 Search accounts..."
                        className="input-field"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ maxWidth: '400px', width: '100%', padding: '0.8rem 1.5rem', borderRadius: '30px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                    <select
                        className="input-field"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ width: 'auto', padding: '0.8rem 1.5rem', borderRadius: '30px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    >
                        <option value="newest">🔥 Newest Arrivals</option>
                        <option value="price-asc">💰 Price: Low to High</option>
                        <option value="price-desc">💎 Price: High to Low</option>
                    </select>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                    {platforms.map(p => (
                        <button
                            key={p}
                            onClick={() => setFilter(p)}
                            className={`btn ${filter === p ? 'btn-primary' : 'btn-outline'}`}
                            style={{ minWidth: '100px' }}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <div className="loader" style={{ margin: '0 auto 1rem' }}></div>
                        <p style={{ color: '#888' }}>Loading products...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid-3">
                            {filtered.map(item => {
                                const isSale = item.sale_price && new Date(item.sale_ends_at) > new Date();
                                const finalPrice = isSale ? item.sale_price : item.price;
                                const isBundle = !!item.bundle_items;
                                const totalStock = Math.max(0, Number(item.stock || 0)) + Number(item.inventoryStock || 0);

                                return (
                                    <div key={item.id} className="glass" style={{ borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                        {/* Badges */}
                                        {isSale && (
                                            <div style={{ position: 'absolute', top: '15px', left: '15px', background: '#ff4d4d', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', zIndex: 10 }}>SALE</div>
                                        )}
                                        {isBundle && (
                                            <div style={{ position: 'absolute', top: '15px', left: isSale ? '60px' : '15px', background: '#00c3ff', color: '#000', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', zIndex: 10 }}>BUNDLE</div>
                                        )}

                                        {/* Share Button Overlay */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigator.clipboard.writeText(`${window.location.origin}/shop/${item.id}`);
                                                setShareId(item.id);
                                                setTimeout(() => setShareId(null), 2000);
                                            }}
                                            style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 10, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: shareId === item.id ? '#00ff88' : '#fff', cursor: 'pointer', fontSize: '0.9rem' }}
                                            title="Copy Product Link"
                                        >
                                            {shareId === item.id ? '✓' : '🔗'}
                                        </button>

                                        {/* Wishlist Button Overlay */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (isInWishlist(item.id)) {
                                                    removeFromWishlist(item.id);
                                                } else {
                                                    addToWishlist(item);
                                                }
                                            }}
                                            style={{ position: 'absolute', top: '15px', right: '60px', zIndex: 10, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isInWishlist(item.id) ? '#ff4d4d' : '#888', cursor: 'pointer', fontSize: '1.2rem', transition: 'all 0.3s ease' }}
                                            title={isInWishlist(item.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                                        >
                                            {isInWishlist(item.id) ? '❤️' : '🤍'}
                                        </button>

                                        {/* Compare Button Overlay */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                addToCompare(item);
                                            }}
                                            style={{ position: 'absolute', top: '15px', right: '105px', zIndex: 10, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isInCompare(item.id) ? 'var(--accent)' : '#888', cursor: 'pointer', fontSize: '1.2rem', transition: 'all 0.3s ease' }}
                                            title={isInCompare(item.id) ? "Remove from Compare" : "Add to Compare"}
                                        >
                                            {isInCompare(item.id) ? '⚖️' : '⚖️'}
                                        </button>

                                        <Link href={`/shop/${item.id}`} style={{ padding: '2rem', display: 'flex', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}>
                                            <img src={getPlatformIcon(item.platform, item.image)} alt={item.platform} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                                        </Link>
                                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--accent)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                {item.platform}
                                            </div>
                                            <Link href={`/shop/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <h3 style={{ marginBottom: '0.5rem', cursor: 'pointer' }}>{item.name}</h3>
                                            </Link>
                                            <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{item.description}</p>

                                            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    {isSale ? (
                                                        <div>
                                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff4d4d' }}>${finalPrice}</div>
                                                            <div style={{ fontSize: '0.85rem', textDecoration: 'line-through', color: '#666' }}>${item.price}</div>
                                                        </div>
                                                    ) : (
                                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00ff88' }}>${item.price}</div>
                                                    )}

                                                    {totalStock > 0 ? (
                                                        <div style={{ fontSize: '0.75rem', color: totalStock < 5 ? '#ff4d4d' : '#888', fontWeight: totalStock < 5 ? 'bold' : 'normal' }}>
                                                            {totalStock < 10 && '🔥 '} {totalStock} in stock
                                                        </div>
                                                    ) : (
                                                        <div style={{ fontSize: '0.75rem', color: '#ff4d4d' }}>Out of Stock</div>
                                                    )}
                                                </div>

                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    <div style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', color: '#888' }}>⚡ Instant</div>
                                                    <div style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', color: '#888' }}>🛡️ Warranty</div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    {totalStock > 0 ? (
                                                        <>
                                                            <Link
                                                                href={`/checkout?id=${item.id}`}
                                                                className="btn btn-outline"
                                                                style={{ fontSize: '0.8rem', flex: 1, textAlign: 'center', padding: '0.6rem' }}
                                                            >
                                                                Buy Now
                                                            </Link>
                                                            <button
                                                                onClick={() => addToCart(item)}
                                                                className="btn btn-primary"
                                                                style={{ fontSize: '0.8rem', width: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                title="Add to Cart"
                                                            >
                                                                🛒
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => { setNotifyProduct(item); setShowNotifyModal(true); }}
                                                            className="btn btn-outline"
                                                            style={{ fontSize: '0.8rem', width: '100%', borderColor: '#ff4d4d', color: '#ff4d4d' }}
                                                        >
                                                            🔔 Notify Me
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {filtered.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                                No accounts match your search.
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Notify Modal */}
            {showNotifyModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)', padding: '2rem' }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', borderRadius: '24px', position: 'relative', border: '1px solid #00c3ff' }}>
                        <button onClick={() => setShowNotifyModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>

                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
                            <h3 style={{ marginBottom: '0.5rem', color: '#fff' }}>Get Notified!</h3>
                            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '2rem' }}>
                                We'll send you an email as soon as <b>{notifyProduct?.name}</b> is back in stock.
                            </p>

                            <form onSubmit={handleNotifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter your email address"
                                    className="input-field"
                                    value={notifyEmail}
                                    onChange={e => setNotifyEmail(e.target.value)}
                                    style={{ width: '100%', padding: '1rem', textAlign: 'center' }}
                                />
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                    Subscribe to Alert
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </main>
    );
}
