"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getPlatformIcon } from '@/lib/icons';
import { useCart } from '@/app/context/CartContext';
import ReviewsSection from '@/components/ReviewsSection';

export default function SingleProductPage() {
    const params = useParams();
    const id = params.id;
    const [product, setProduct] = useState<any>(null);
    const [bundleContents, setBundleContents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [isPurchasing, setIsPurchasing] = useState(false);

    // Notify & Cart Logic
    const { addToCart } = useCart();
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [notifyEmail, setNotifyEmail] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetch(`/api/user/wallet?userId=${parsedUser.id}`)
                .then(res => res.json())
                .then(data => setWalletBalance(data.balance))
                .catch(() => { });
        }

        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                const found = data.find((p: any) => p.id.toString() === id);
                setProduct(found);

                if (found && found.bundle_items) {
                    try {
                        const bundleIds = JSON.parse(found.bundle_items);
                        const items = data.filter((p: any) => bundleIds.includes(p.id));
                        setBundleContents(items);
                    } catch (e) { console.error("Bundle parse error", e); }
                }

                setLoading(false);
                if (found) {
                    document.title = `${found.name} - OfficialUM1 Shop`;
                }
            })
            .catch(() => setLoading(false));
    }, [id]);

    const handleCopyLink = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleNotifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!notifyEmail || !product) return;
        try {
            const res = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: notifyEmail, productId: product.id })
            });
            const data = await res.json();
            if (data.success) {
                alert("✅ We'll notify you when this is back in stock!");
                setShowNotifyModal(false);
                setNotifyEmail('');
            } else {
                alert(data.message || "Failed to subscribe.");
            }
        } catch (error) { alert("Error subscribing."); }
    };

    const handleWalletPurchase = async () => {
        if (!user || walletBalance < parseFloat(product.price)) {
            alert("Insufficient balance or not logged in.");
            return;
        }

        if (!confirm(`Confirm purchase of ${product.name} for $${product.price} using your wallet?`)) return;

        setIsPurchasing(true);
        try {
            const res = await fetch('/api/checkout/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    productId: product.id,
                    method: 'wallet',
                    finalPrice: product.price
                })
            });
            const data = await res.json();
            if (data.success) {
                window.location.href = `/order-success?orderId=${data.orderId}`;
            } else {
                alert(data.error || "Purchase failed");
            }
        } catch (e) {
            alert("Connection error");
        } finally {
            setIsPurchasing(false);
        }
    };

    if (loading) return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>
                <div className="loader" style={{ margin: '0 auto' }}></div>
            </div>
            <Footer />
        </main>
    );

    if (!product) return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>
                <h1>Product Not Found</h1>
                <Link href="/shop" className="btn btn-primary" style={{ marginTop: '2rem' }}>Back to Shop</Link>
            </div>
            <Footer />
        </main>
    );

    // Flash Sale Logic
    const isSale = product.sale_price && new Date(product.sale_ends_at) > new Date();
    const finalPrice = isSale ? product.sale_price : product.price;
    const totalStock = Math.max(0, Number(product.stock || 0)) + Number(product.inventoryStock || 0);

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px' }}>
                <div className="glass" style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem', borderRadius: '30px', display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'center' }}>

                    {/* SALE TIMER BANNER */}
                    {isSale && (
                        <div style={{ width: '100%', background: 'linear-gradient(45deg, #ff4d4d, #ff0000)', color: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', marginBottom: '1rem', boxShadow: '0 5px 15px rgba(255,0,0,0.3)' }}>
                            ⚡ FLASH SALE ACTIVE - LIMITED TIME!
                        </div>
                    )}

                    <div style={{ flex: '1', minWidth: '300px', textAlign: 'center' }}>
                        <div className="glass-morphism" style={{ padding: '3rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', display: 'inline-block' }}>
                            <img src={getPlatformIcon(product.platform, product.image)} alt={product.name} style={{ width: '180px', height: '180px', objectFit: 'contain' }} />
                        </div>
                    </div>

                    <div style={{ flex: '1.5', minWidth: '300px' }}>
                        <div style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>
                            {product.platform}
                        </div>
                        <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>{product.name}</h1>
                        <p style={{ color: '#aaa', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                            {product.description || "Premium quality social media account verified and ready for use. Instant delivery after purchase."}
                        </p>

                        {/* Bundle Contents Display */}
                        {bundleContents.length > 0 && (
                            <div style={{ marginBottom: '2.5rem', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0,195,255,0.2)' }}>
                                <h4 style={{ color: '#00c3ff', marginBottom: '1rem', fontSize: '1.1rem' }}>📦 BUNDLE INCLUDES:</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    {bundleContents.map(item => (
                                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                            <img src={getPlatformIcon(item.platform, item.image)} style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ color: '#fff', fontSize: '0.95rem' }}>{item.name}</div>
                                                <div style={{ color: '#888', fontSize: '0.8rem' }}>Individual Price: ${item.price}</div>
                                            </div>
                                            <div style={{ color: '#00ff88', fontSize: '1.2rem' }}>✓</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
                            <div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: isSale ? '#ff4d4d' : '#00ff88' }}>
                                    ${finalPrice}
                                </div>
                                {isSale && (
                                    <div style={{ textDecoration: 'line-through', color: '#888', fontSize: '1.2rem' }}>
                                        ${product.price}
                                    </div>
                                )}
                            </div>
                            {totalStock > 0 ? (
                                <div style={{
                                    padding: '0.5rem 1rem',
                                    background: totalStock < 5 ? 'rgba(255, 77, 77, 0.1)' : 'rgba(0,255,136,0.1)',
                                    color: totalStock < 5 ? '#ff4d4d' : '#00ff88',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold'
                                }}>
                                    {totalStock < 10 && '🔥 '} {totalStock} in Stock
                                </div>
                            ) : (
                                <div style={{ padding: '0.5rem 1rem', background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    Out of Stock
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {totalStock > 0 ? (
                                <>
                                    <Link href={`/checkout?id=${product.id}`} className="btn btn-primary" style={{ flex: 1, textAlign: 'center', padding: '1.2rem' }}>
                                        {isSale ? '🔥 Buy Sale Price' : 'Buy Now Instantly'}
                                    </Link>
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="btn btn-outline"
                                        style={{ flex: 1, border: '1px solid #00c3ff', color: '#00c3ff', background: 'rgba(0,195,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        🛒 Add to Cart
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setShowNotifyModal(true)} className="btn btn-outline" style={{ flex: 1, cursor: 'pointer', borderColor: '#ff4d4d', color: '#ff4d4d' }}>
                                    🔔 Notify Me
                                </button>
                            )}

                            {user && walletBalance >= parseFloat(product.price) && totalStock > 0 && (
                                <button
                                    onClick={handleWalletPurchase}
                                    className="btn btn-outline"
                                    disabled={isPurchasing}
                                    style={{ flex: 1, border: '1px solid #00ff88', color: '#00ff88', background: 'rgba(0,255,136,0.05)' }}
                                >
                                    {isPurchasing ? 'Processing...' : `⚡ Wallet ($${walletBalance})`}
                                </button>
                            )}

                            <button onClick={handleCopyLink} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {copied ? '✅' : '🔗'}
                            </button>
                        </div>

                        <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,255,136,0.05)', padding: '1.2rem', borderRadius: '16px', border: '1px solid rgba(0,255,136,0.1)' }}>
                                    <div style={{ fontSize: '1.5rem' }}>🛡️</div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: '#00ff88', fontSize: '0.9rem' }}>Verified Seller</div>
                                        <div style={{ fontSize: '0.75rem', color: '#888' }}>Trusted by 5000+ customers</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,195,255,0.05)', padding: '1.2rem', borderRadius: '16px', border: '1px solid rgba(0,195,255,0.1)' }}>
                                    <div style={{ fontSize: '1.5rem' }}>⚡</div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: '#00c3ff', fontSize: '0.9rem' }}>Fast Delivery</div>
                                        <div style={{ fontSize: '0.75rem', color: '#888' }}>Avg. delivery &lt; 2 mins</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
                                We'll send you an email as soon as <b>{product.name}</b> is back in stock.
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

            {/* REVIEWS SECTION */}
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '50px' }}>
                <ReviewsSection productId={product.id} />
            </div>

            <Footer />
        </main>
    );
}
