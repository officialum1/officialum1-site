"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getPlatformIcon } from '@/lib/icons';
import { useCart } from '@/app/context/CartContext';
import { trackEvent } from '@/lib/analytics';

function CheckoutContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const { cart, clearCart, cartTotal } = useCart();
    // Mode: Single Product vs Cart vs Membership
    const membership = searchParams.get('membership');
    const isCartMode = !id && !membership && cart.length > 0;
    const isMembershipMode = !!membership;

    const [product, setProduct] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [email, setEmail] = useState(''); // Guest Email
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Promo Code State
    const [promoCode, setPromoCode] = useState('');
    const [rating, setRating] = useState<number>(0);
    const [discount, setDiscount] = useState<number>(0);
    const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent');
    const [quantity, setQuantity] = useState<number>(1);
    const [promoStatus, setPromoStatus] = useState<'none' | 'success' | 'invalid'>('none');

    const [gateways, setGateways] = useState<any>({ stripe: true, crypto: true, binance: true, wallet: true });

    useEffect(() => {
        // 1. Get Product (Only if Single Mode)
        if (id) {
            fetch('/api/products').then(res => res.json()).then(data => {
                const p = data.find((item: any) => item.id.toString() === id);
                setProduct(p);
            });
        }

        // 2. Check Login (Access localStorage only on client)
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('buyer_user');
            if (stored) {
                const u = JSON.parse(stored);
                setUser(u);
                setEmail(u.email);
            }
        }
        // 3. Handle Membership Mode
        if (membership) {
            const PLANS: any = {
                silver: { name: 'Silver VIP Membership', price: '9.99', platform: 'VIP', id: 'm1' },
                gold: { name: 'Gold VIP Membership', price: '24.99', platform: 'VIP', id: 'm2' },
                diamond: { name: 'Diamond VIP Membership', price: '49.99', platform: 'VIP', id: 'm3' }
            };
            setProduct(PLANS[membership] || null);
        }

        // 4. Get Payment Settings
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                const updatedGateways: any = {
                    stripe: data.enable_stripe === 'true',
                    crypto: data.enable_cryptomus === 'true',
                    binance: data.enable_binance === 'true',
                    wallet: true
                };

                // Backward compatibility + Wallet override
                if (data.payment_gateways) {
                    try {
                        const pg = JSON.parse(data.payment_gateways);
                        if (pg.wallet !== undefined) updatedGateways.wallet = pg.wallet;
                        if (data.enable_stripe === undefined) updatedGateways.stripe = pg.stripe !== false;
                        if (data.enable_cryptomus === undefined) updatedGateways.crypto = pg.crypto !== false;
                        if (data.enable_binance === undefined) updatedGateways.binance = pg.binance !== false;
                    } catch { }
                }
                setGateways(updatedGateways);
            });

        // Track Begin Checkout
        if (product || cart.length > 0) {
            trackEvent('begin_checkout', {
                currency: 'USD',
                value: parseFloat(getFinalPrice()),
                items: isCartMode ? cart.map(item => ({
                    item_id: item.id,
                    item_name: item.name,
                    price: parseFloat(item.price)
                })) : [{
                    item_id: product?.id,
                    item_name: product?.name,
                    price: parseFloat(product?.price)
                }]
            });
        }
    }, [id, membership, product, cart.length]);

    // Lead Capture (Abandoned Cart)
    useEffect(() => {
        if (email && email.includes('@') && email.length > 5) {
            const timer = setTimeout(() => {
                fetch('/api/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'capture',
                        email,
                        productName: isCartMode ? 'Cart Checkout' : (product?.name || 'Unknown'),
                        productId: id || 'cart',
                        amount: getFinalPrice()
                    })
                }).catch(() => { });
            }, 2000); // 2 second delay to avoid spamming while typing
            return () => clearTimeout(timer);
        }
    }, [email, product]);

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        setPromoStatus('none');
        try {
            const baseAmount = isCartMode ? cartTotal : (isMembershipMode ? parseFloat(product?.price || '0') : parseFloat(product?.price?.toString().replace('$', '') || '0') * quantity);
            const res = await fetch(`/api/coupons?code=${promoCode}&amount=${baseAmount}`);
            const data = await res.json();
            if (data.success) {
                setDiscount(data.value);
                setDiscountType(data.type);
                setPromoStatus('success');
            } else {
                setDiscount(0);
                setPromoStatus('invalid');
                alert(data.error || "Invalid code");
            }
        } catch (e) {
            setPromoStatus('invalid');
        }
    };

    const getFinalPrice = () => {
        let baseTotal = 0;
        if (isCartMode) {
            baseTotal = cartTotal;
        } else if (isMembershipMode) {
            baseTotal = parseFloat(product?.price || '0');
        } else {
            if (!product) return "0.00";
            const original = parseFloat(product.price.toString().replace('$', ''));
            baseTotal = original * quantity;
        }

        if (discount > 0) {
            const d = discountType === 'percent' ? (baseTotal * (discount / 100)) : discount;
            return Math.max(0, baseTotal - d).toFixed(2);
        }
        return baseTotal.toFixed(2);
    };

    const handlePayment = async () => {
        if (!paymentMethod) return alert('Select a payment method');
        if (!email) return alert('Please enter your email for delivery');

        setIsProcessing(true);

        try {
            if (isCartMode) {
                // CART CHECKOUT (New Universal Bulk Support)
                const res = await fetch('/api/checkout/process', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user ? user.id : 'guest',
                        guestEmail: email,
                        cartItems: isCartMode ? cart : null,
                        membershipPlan: membership,
                        method: paymentMethod,
                        promoCode: discount > 0 ? promoCode : null,
                        finalPrice: getFinalPrice() // Total amount
                    })
                });
                const data = await res.json();

                if (data.success) {
                    clearCart();
                    if (data.paymentUrl) {
                        window.location.href = data.paymentUrl;
                    } else {
                        localStorage.setItem('last_order', JSON.stringify({
                            orderId: data.orderId,
                            amount: getFinalPrice(),
                            items: cart.map(item => ({ id: item.id, name: item.name, price: item.price }))
                        }));
                        window.location.href = `/order-success?orderId=${data.orderId}`;
                    }
                } else {
                    alert('Checkout Error: ' + data.error);
                }
            } else {
                // SINGLE PRODUCT CHECKOUT
                const res = await fetch('/api/checkout/process', {
                    method: 'POST',
                    body: JSON.stringify({
                        userId: user ? user.id : 'guest',
                        guestEmail: email,
                        productId: product.id,
                        quantity: quantity,
                        method: paymentMethod,
                        promoCode: discount > 0 ? promoCode : null,
                        finalPrice: getFinalPrice()
                    })
                });
                const data = await res.json();

                if (data.success) {
                    if (data.paymentUrl) {
                        window.location.href = data.paymentUrl; // Redirect to Gateway
                    } else {
                        localStorage.setItem('last_order', JSON.stringify({
                            orderId: data.orderId,
                            amount: getFinalPrice(),
                            items: [{ id: product.id, name: product.name, price: product.price, quantity }]
                        }));
                        window.location.href = `/order-success?orderId=${data.orderId}`; // Manual Success
                    }
                } else {
                    alert('Checkout Error: ' + data.error);
                }
            }
        } catch (e) {
            alert('Payment Failed');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!product && !isCartMode) return <div className="container text-center pt-20">Loading Checkout...</div>;

    return (
        <div className="min-h-screen" style={{ paddingTop: '140px', paddingBottom: '100px', maxWidth: '1400px', margin: '0 auto', paddingLeft: '2rem', paddingRight: '2rem' }}>

            {/* Header with Progress */}
            <div style={{ textAlign: 'center', marginBottom: '5rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '200px', background: 'radial-gradient(circle, rgba(20, 108, 120, 0.1) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(80px)', zIndex: -1 }}></div>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3.5rem', fontWeight: '800', lineHeight: 1, marginBottom: '1.5rem', color: 'var(--text-primary)', letterSpacing: '-2px' }}>
                    Secure Checkout
                </h1>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1.5rem', background: 'var(--bg-card)', padding: '0.6rem 2rem', borderRadius: '100px', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--success)', fontSize: '0.9rem', fontWeight: '600' }}><span style={{ fontSize: '1.2rem' }}>•</span> Cart Review</div>
                    <div style={{ width: '20px', height: '1px', background: 'var(--border-subtle)' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '600' }}><span style={{ fontSize: '1.2rem' }}>•</span> Payment Details</div>
                    <div style={{ width: '20px', height: '1px', background: 'var(--border-subtle)' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}><span>•</span> Confirmation</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', margin: '0 auto', maxWidth: '1200px' }}>

                {/* LEFT COLUMN: Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Contact Info Card */}
                    <div style={{ padding: '2.5rem', borderRadius: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <span style={{ background: 'rgba(20, 108, 120, 0.1)', color: 'var(--primary)', width: '30px', height: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>1</span>
                            Contact Information
                        </h3>
                        {!user ? (
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        style={{ width: '100%', padding: '1.2rem', paddingLeft: '3rem', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '14px', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none', transition: 'all 0.2s' }}
                                        onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 4px rgba(20, 108, 120, 0.1)'; }}
                                        onBlur={e => { e.target.style.borderColor = 'var(--border-subtle)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                    <span style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>✉️</span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.8rem', paddingLeft: '0.5rem' }}>We'll send your receipt and order details here.</p>
                            </div>
                        ) : (
                            <div style={{ padding: '1rem', background: 'var(--bg-base)', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#fff' }}>
                                    {user.email[0].toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-primary)' }}>{user.email}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>● Logged In</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Method Card */}
                    <div style={{ padding: '2.5rem', borderRadius: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <span style={{ background: 'rgba(20, 108, 120, 0.1)', color: 'var(--primary)', width: '30px', height: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>2</span>
                            Payment Method
                        </h3>

                        {isCartMode && (
                            <div style={{ marginBottom: '1.5rem', background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.2)', padding: '1rem', borderRadius: '12px', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                                <span style={{ color: '#d97706', fontSize: '0.9rem' }}>Bulk Checkout is currently available via <b>Wallet Balance</b> only.</span>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                            {gateways.binance === true && (
                                <button
                                    onClick={() => setPaymentMethod('binance')}
                                    disabled={isCartMode}
                                    style={{
                                        position: 'relative',
                                        padding: '1.5rem',
                                        borderRadius: '16px',
                                        border: paymentMethod === 'binance' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                                        background: paymentMethod === 'binance' ? 'rgba(20, 108, 120, 0.05)' : 'var(--bg-base)',
                                        color: 'var(--text-primary)',
                                        cursor: isCartMode ? 'not-allowed' : 'pointer',
                                        opacity: isCartMode ? 0.3 : 1,
                                        transition: 'all 0.2s',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>🔸</div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Binance Pay</div>
                                </button>
                            )}

                            {gateways.crypto === true && (
                                <button
                                    onClick={() => setPaymentMethod('cryptomus')}
                                    disabled={isCartMode}
                                    style={{
                                        position: 'relative',
                                        padding: '1.5rem',
                                        borderRadius: '16px',
                                        border: paymentMethod === 'cryptomus' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                                        background: paymentMethod === 'cryptomus' ? 'rgba(20, 108, 120, 0.05)' : 'var(--bg-base)',
                                        color: 'var(--text-primary)',
                                        cursor: isCartMode ? 'not-allowed' : 'pointer',
                                        opacity: isCartMode ? 0.3 : 1,
                                        transition: 'all 0.2s',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>₿</div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Crypto</div>
                                </button>
                            )}

                            {gateways.stripe === true && (
                                <button
                                    onClick={() => setPaymentMethod('stripe')}
                                    disabled={isCartMode}
                                    style={{
                                        position: 'relative',
                                        padding: '1.5rem',
                                        borderRadius: '16px',
                                        border: paymentMethod === 'stripe' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                                        background: paymentMethod === 'stripe' ? 'rgba(20, 108, 120, 0.05)' : 'var(--bg-base)',
                                        color: 'var(--text-primary)',
                                        cursor: isCartMode ? 'not-allowed' : 'pointer',
                                        opacity: isCartMode ? 0.3 : 1,
                                        transition: 'all 0.2s',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>💳</div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Credit Card</div>
                                </button>
                            )}

                            {gateways.wallet !== false && (
                                <button
                                    key={'wallet'}
                                    onClick={() => setPaymentMethod('wallet')}
                                    style={{
                                        position: 'relative',
                                        padding: '1.5rem',
                                        borderRadius: '16px',
                                        border: paymentMethod === 'wallet' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                                        background: paymentMethod === 'wallet' ? 'rgba(20, 108, 120, 0.05)' : 'var(--bg-base)',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>💼</div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Wallet</div>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Summary */}
                <div style={{ position: 'relative' }}>
                    <div style={{ position: 'sticky', top: '120px', padding: '2.5rem', borderRadius: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)' }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
                            ORDER SUMMARY
                            <span style={{ fontSize: '0.8rem', background: 'var(--bg-base)', padding: '2px 8px', borderRadius: '4px', color: 'var(--primary)', fontWeight: 'bold' }}>SECURE</span>
                        </h3>

                        {/* Items List */}
                        <div style={{ marginBottom: '2rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {isCartMode ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {cart.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <div style={{ width: '40px', height: '40px', background: 'var(--bg-base)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <img src={getPlatformIcon(item.platform, item.image)} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>{item.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.platform}</div>
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>${item.price}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        <img src={getPlatformIcon(product.platform, product.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '1.1rem', lineHeight: '1.4', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>{product.name}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#fff', background: 'var(--text-primary)', width: 'fit-content', padding: '4px 10px', borderRadius: '6px' }}>{product.platform}</div>
                                            {/* QTY Control */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-base)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                                                <button onClick={() => setQuantity((q: number) => Math.max(1, q - 1))} style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', width: '24px', height: '24px', cursor: 'pointer', fontSize: '1.2rem', lineHeight: '1' }}>-</button>
                                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem', minWidth: '20px', textAlign: 'center', color: 'var(--text-primary)' }}>{quantity}</span>
                                                <button onClick={() => setQuantity((q: number) => q + 1)} style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', width: '24px', height: '24px', cursor: 'pointer', fontSize: '1rem' }}>+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Promo Input */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ position: 'relative', display: 'flex', gap: '0.5rem' }}>
                                <input
                                    placeholder="Promo Code"
                                    value={promoCode}
                                    onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoStatus('none'); }}
                                    style={{ flex: 1, padding: '1rem', background: 'var(--bg-base)', border: promoStatus === 'invalid' ? '1px solid var(--error)' : (promoStatus === 'success' ? '1px solid var(--success)' : '1px solid var(--border-subtle)'), borderRadius: '12px', color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem', letterSpacing: '1px' }}
                                />
                                <button
                                    onClick={handleApplyPromo}
                                    style={{ background: 'var(--text-primary)', color: '#fff', border: 'none', padding: '0 1.5rem', borderRadius: '12px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s' }}
                                >
                                    APPLY
                                </button>
                            </div>
                            {promoStatus === 'success' && <div style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span>✓</span> Discount applied successfully!</div>}
                            {promoStatus === 'invalid' && <div style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span>✕</span> Invalid code entered</div>}
                        </div>

                        {/* Totals Div */}
                        <div style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                <span>Subtotal</span>
                                <span>${isCartMode ? cartTotal.toFixed(2) : `${(parseFloat(product.price.toString().replace('$', '')) * quantity).toFixed(2)}`}</span>
                            </div>
                            {discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', color: 'var(--success)', fontSize: '0.95rem' }}>
                                    <span>Discount</span>
                                    <span>-{discountType === 'percent' ? `${discount}%` : `$${discount}`}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', alignItems: 'flex-end' }}>
                                <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}>TOTAL CHECKOUT</span>
                                <span style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1, color: 'var(--text-primary)' }}>
                                    <span style={{ fontSize: '1.5rem', verticalAlign: 'top', marginRight: '2px', color: 'var(--text-muted)' }}>$</span>
                                    {getFinalPrice()}
                                </span>
                            </div>
                        </div>

                        {/* Pay Button */}
                        <button
                            onClick={handlePayment}
                            disabled={!paymentMethod || isProcessing || !email}
                            className="btn-glow"
                            style={{
                                width: '100%',
                                marginTop: '2.5rem',
                                padding: '1.2rem',
                                fontSize: '1.2rem',
                                fontWeight: '700',
                                background: (!paymentMethod || !email) ? 'var(--bg-base)' : 'var(--primary)',
                                color: (!paymentMethod || !email) ? 'var(--text-muted)' : '#fff',
                                border: (!paymentMethod || !email) ? '1px solid var(--border-subtle)' : 'none',
                                borderRadius: '16px',
                                cursor: (!paymentMethod || !email) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: (!paymentMethod || !email) ? 'none' : '0 10px 40px -10px rgba(20, 108, 120, 0.5)',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}
                        >
                            {isProcessing ? 'Processing Transaction...' : 'Complete Secure Payment'}
                        </button>
                        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <span>🔒</span> 256-Bit SSL Encrypted Payment
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <main>
            <Navbar />
            <Suspense fallback={<div>Loading...</div>}>
                <CheckoutContent />
            </Suspense>
            <Footer />
        </main>
    );
}
