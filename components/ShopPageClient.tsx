"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getPlatformIcon } from '@/lib/icons';
import { useCart } from '@/app/context/CartContext';
import { useWishlist } from '@/app/context/WishlistContext';
import { useCompare } from '@/app/context/CompareContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHero } from '@/components/ui/PageHero';
import { Bell, ShoppingCart, X } from 'lucide-react';
import { readJson } from '@/lib/read-json';

export default function ShopPageClient({ initialProducts }: { initialProducts: any[] }) {
    const [products, setProducts] = useState<any[]>(initialProducts ?? []);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(!(initialProducts && initialProducts.length > 0));
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
        const fetchProducts = () => {
            fetch('/api/products', { cache: 'no-store' })
                .then(res => readJson<any[]>(res))
                .then(data => {
                    setProducts(Array.isArray(data) ? data : []);
                    setLoading(false);
                })
                .catch(e => setLoading(false));
        };

        fetchProducts(); // Initial Fetch

        // Real-Time Polling (every 30s)
        const interval = setInterval(fetchProducts, 30000);

        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('buyer_user');
            if (stored) setUser(JSON.parse(stored));
        }

        return () => clearInterval(interval);
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
                alert("We'll notify you when this is back in stock!");
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
        <main style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <Navbar />
            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Shop' }]}
                    label="Shop"
                    title={<>Premium Digital <span style={{color: 'var(--accent-violet)'}}>Assets</span></>}
                    description="Buy high-quality digital products instantly. Filter by category, compare offers, and check out in minutes."
                />

                <div className="container" style={{ paddingTop: '3rem' }}>

                {/* PREMIUM PROMO BANNER - RETHEMED */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, var(--bg-section-alt) 100%)',
                        border: '1px solid var(--border-subtle)',
                        padding: '2.5rem 3rem',
                        borderRadius: '32px',
                        marginBottom: '3rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '2rem',
                        position: 'relative',
                        overflow: 'hidden',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 18px 44px rgba(24,32,38,0.08)'
                    }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at top left, rgba(196,71,45,0.12), transparent 50%)', pointerEvents: 'none' }} />
                    <div style={{ flex: '1', minWidth: '280px', position: 'relative', zIndex: 1 }}>
                        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: '900', marginBottom: '0.75rem' }}>Exclusive Bundle Offer</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6' }}>
                            Combine any 2+ assets and get an instant <span style={{color: 'var(--accent-violet)', fontWeight: 'bold'}}>15% discount</span> applied automatically at checkout.
                        </p>
                    </div>
                    <Link href="/bundles" style={{ 
                        padding: '1rem 2.5rem', 
                        fontSize: '1rem', 
                        fontWeight: '800', 
                        background: 'var(--gradient)', 
                        color: '#fff', 
                        borderRadius: '50px', 
                        textDecoration: 'none',
                        boxShadow: '0 12px 28px rgba(20,108,120,0.16)',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        Start Saving Now
                    </Link>
                </div>

                {/* Search & Sort Bar - RETHEMED */}
                <motion.div
                    className="shop-controls"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '2rem' }}
                >
                    <input
                        type="text"
                        placeholder="Search premium products..."
                        className="dark-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ maxWidth: '420px', width: '100%' }}
                    />
                    <select
                        className="dark-input"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ width: 'auto' }}
                    >
                        <option value="newest">Newest Items</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                    </select>
                </motion.div>

                {/* Filter Tabs - RETHEMED */}
                <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '0.75rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                    {platforms.map(p => (
                        <button
                            key={p}
                            onClick={() => setFilter(p)}
                            style={{ 
                                minWidth: '100px',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '12px',
                                border: filter === p ? '1px solid rgba(20,108,120,0.4)' : '1px solid var(--border-subtle)',
                                background: filter === p ? 'rgba(20,108,120,0.1)' : '#fff',
                                color: filter === p ? 'var(--accent-blue)' : 'var(--text-muted)',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div style={{ padding: '6rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Initializing inventory stream...
                    </div>
                ) : (
                    <>
                        <motion.div
                            layout
                            className="grid-3"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: { transition: { staggerChildren: 0.1 } },
                                hidden: { transition: { staggerChildren: 0.05 } }
                            }}
                        >
                            <AnimatePresence mode='popLayout'>
                                {filtered.map(item => {
                                    const isSale = item.sale_price && new Date(item.sale_ends_at) > new Date();

                                    // Base Price
                                    let currentPrice = parseFloat(isSale ? item.sale_price : item.price);
                                    let oldPrice = isSale ? item.price : null;
                                    let badgeLabel = isSale ? 'SALE' : null;

                                    // VIP Check
                                    const userPlan = (user?.membership || '').toLowerCase();
                                    let vipDiscount = 0;
                                    if (userPlan === 'silver') vipDiscount = 0.05;
                                    else if (userPlan === 'gold') vipDiscount = 0.10;
                                    else if (userPlan === 'diamond') vipDiscount = 0.15;

                                    if (vipDiscount > 0) {
                                        oldPrice = currentPrice.toFixed(2); // Previous "final" is now old
                                        currentPrice = currentPrice * (1 - vipDiscount);
                                        badgeLabel = isSale ? 'SALE + VIP' : `${(vipDiscount * 100).toFixed(0)}% OFF`;
                                    }

                                    const finalPrice = currentPrice.toFixed(2);
                                    const isBundle = !!item.bundle_items;
                                    const totalStock = Math.max(0, Number(item.stock || 0)) + Number(item.inventoryStock || 0);

                                    return (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            whileHover={{ y: -8 }}
                                            style={{ 
                                                borderRadius: '24px', 
                                                overflow: 'hidden', 
                                                display: 'flex', 
                                                flexDirection: 'column', 
                                                position: 'relative',
                                                background: '#fff',
                                                border: '1px solid var(--border-subtle)',
                                                transition: 'border-color 0.3s ease',
                                                boxShadow: '0 12px 34px rgba(24,32,38,0.08)'
                                            }}
                                            className="hover:border-red-900/30"
                                        >
                                            {/* Badges */}
                                            {isSale && (
                                                <div style={{ position: 'absolute', top: '15px', left: '15px', background: 'var(--gradient)', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '1px', zIndex: 10 }}>SALE</div>
                                            )}
                                            {isBundle && (
                                                <div style={{ position: 'absolute', top: '15px', left: isSale ? '75px' : '15px', background: '#fff', color: '#000', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '1px', zIndex: 10 }}>BUNDLE</div>
                                            )}
                                            {/* Conversion Badge */}
                                            {totalStock > 10 && (
                                                <div style={{ position: 'absolute', top: '15px', right: '15px', background: '#fff', backdropFilter: 'blur(10px)', border: '1px solid var(--border-subtle)', color: 'var(--accent-blue)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '800', zIndex: 10 }}>ACTIVE</div>
                                            )}

                                            <Link href={`/shop/${item.id}`} style={{ padding: '3rem 2rem', display: 'flex', justifyContent: 'center', background: 'var(--bg-section-alt)', cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)' }}>
                                                <img src={getPlatformIcon(item.platform, item.image)} alt={item.platform} style={{ width: '70px', height: '70px', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))' }} />
                                            </Link>
                                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '800' }}>
                                                    {item.platform}
                                                </div>
                                                <Link href={`/shop/${item.id}`} style={{ textDecoration: 'none' }}>
                                                    <h3 style={{ marginBottom: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '800' }}>{item.name}</h3>
                                                </Link>
                                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6' }}>{item.description?.substring(0, 80)}{item.description?.length > 80 ? '...' : ''}</p>

                                                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                                                    <div>
                                                        {oldPrice ? (
                                                            <>
                                                                <div style={{ fontSize: '0.85rem', textDecoration: 'line-through', color: 'var(--text-muted)', marginBottom: '2px' }}>${oldPrice}</div>
                                                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)' }}>${finalPrice}</div>
                                                            </>
                                                        ) : (
                                                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)' }}>${finalPrice}</div>
                                                        )}
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        {totalStock > 0 ? (
                                                            <span style={{ fontSize: '0.75rem', color: totalStock < 5 ? 'var(--accent-violet)' : 'var(--text-muted)', fontWeight: 'bold' }}>
                                                                {totalStock < 5 ? `${totalStock} LEFT` : 'IN STOCK'}
                                                            </span>
                                                        ) : (
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-violet)', fontWeight: 'bold' }}>SOLD OUT</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                    {totalStock > 0 ? (
                                                        <>
                                                            <Link
                                                                href={`/checkout?id=${item.id}`}
                                                                style={{ 
                                                                    flex: 1, 
                                                                    textAlign: 'center', 
                                                                    padding: '0.8rem', 
                                                                    borderRadius: '12px', 
                                                                    background: 'transparent', 
                                                                    border: '1px solid var(--border-subtle)', 
                                                                    color: 'var(--text-primary)', 
                                                                    textDecoration: 'none', 
                                                                    fontWeight: '700',
                                                                    fontSize: '0.9rem',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                className="hover:bg-white hover:text-black"
                                                            >
                                                                Unlock
                                                            </Link>
                                                            <button
                                                                onClick={() => addToCart(item)}
                                                                style={{ 
                                                                    width: '50px', 
                                                                    display: 'flex', 
                                                                    alignItems: 'center', 
                                                                    justifyContent: 'center', 
                                                                    borderRadius: '12px',
                                                                    background: 'var(--gradient)',
                                                                    border: 'none',
                                                                    color: '#fff',
                                                                    cursor: 'pointer',
                                                                    boxShadow: '0 8px 18px rgba(20,108,120,0.18)'
                                                                }}
                                                                title="Add to Cart"
                                                            >
                                                                <ShoppingCart size={18} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => { setNotifyProduct(item); setShowNotifyModal(true); }}
                                                            style={{ 
                                                                width: '100%', 
                                                                padding: '0.8rem', 
                                                                borderRadius: '12px', 
                                                                background: 'rgba(196,71,45,0.10)', 
                                                                border: '1px solid rgba(196,71,45,0.28)', 
                                                                color: 'var(--accent-violet)', 
                                                                fontWeight: 'bold',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '0.5rem'
                                                            }}
                                                        >
                                                            <Bell size={16} /> Alert Me
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </motion.div>
                    </>
                )}

                {filtered.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-muted)' }}>
                        <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No assets match the search</h3>
                        <p>Adjust filters to display full catalogue.</p>
                    </div>
                )}
            </div>

            {/* Notify Modal - RETHEMED */}
            {showNotifyModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(24,32,38,0.32)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(12px)', padding: '2rem' }}>
                    <div style={{ 
                        width: '100%', 
                        maxWidth: '450px', 
                        padding: '3rem 2.5rem', 
                        borderRadius: '32px', 
                        position: 'relative', 
                        background: '#fff',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: '0 25px 50px -12px rgba(24,32,38,0.16)'
                    }}>
                        <button onClick={() => setShowNotifyModal(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'var(--bg-section-alt)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }} aria-label="Close">
                            <X size={18} />
                        </button>

                        <div style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ padding: '1rem', background: 'rgba(20,108,120,0.10)', borderRadius: '20px', color: 'var(--accent-blue)' }}>
                                    <Bell size={32} />
                                </div>
                            </div>
                            <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: '800' }}>Restock Alert</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                                Drop your email. We will broadcast an instant transmission the moment <b>{notifyProduct?.name}</b> is unlocked again.
                            </p>

                            <form onSubmit={handleNotifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input
                                    type="email"
                                    required
                                    placeholder="name@email.com"
                                    className="dark-input"
                                    value={notifyEmail}
                                    onChange={e => setNotifyEmail(e.target.value)}
                                    style={{ width: '100%', padding: '1rem', textAlign: 'center' }}
                                />
                                <button type="submit" style={{ 
                                    width: '100%', 
                                    padding: '1.1rem', 
                                    borderRadius: '16px', 
                                    background: 'var(--gradient)', 
                                    color: '#fff', 
                                    border: 'none', 
                                    fontWeight: '800', 
                                    fontSize: '1rem', 
                                    cursor: 'pointer',
                                    boxShadow: '0 12px 24px rgba(20,108,120,0.16)'
                                }}>
                                    Initialize Subscription
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            </div>
            <Footer />
            <style jsx global>{`
                .dark-input {
                    background: #fff !important;
                    border: 1px solid var(--border-subtle) !important;
                    color: var(--text-primary) !important;
                    padding: 0.9rem 1.2rem !important;
                    border-radius: 12px !important;
                    transition: all 0.3s ease;
                    font-family: inherit;
                    outline: none;
                }
                .dark-input:focus {
                    border-color: var(--accent-blue) !important;
                    background: #fff !important;
                    box-shadow: 0 0 0 4px rgba(20,108,120,0.12) !important;
                }
                @media (max-width: 768px) {
                    .shop-controls { flex-direction: column; }
                    .shop-controls input, .shop-controls select { max-width: 100% !important; width: 100% !important; }
                }
            `}</style>
        </main>
    );
}
