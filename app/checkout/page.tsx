"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getPlatformIcon } from '@/lib/icons';

function CheckoutContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [product, setProduct] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [email, setEmail] = useState(''); // Guest Email
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Promo Code State
    const [promoCode, setPromoCode] = useState('');
    const [rating, setRating] = useState<number>(0);
    const [discount, setDiscount] = useState<number>(0); // Percentage
    const [quantity, setQuantity] = useState<number>(1);
    const [promoStatus, setPromoStatus] = useState<'none' | 'success' | 'invalid'>('none');

    useEffect(() => {
        // 1. Get Product
        fetch('/api/products').then(res => res.json()).then(data => {
            const p = data.find((item: any) => item.id.toString() === id);
            setProduct(p);
        });

        // 2. Check Login (Access localStorage only on client)
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('buyer_user');
            if (stored) {
                const u = JSON.parse(stored);
                setUser(u);
                setEmail(u.email);
            }
        }
    }, [id]);

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        setPromoStatus('none');
        try {
            const res = await fetch(`/api/promocodes?code=${promoCode}`);
            const data = await res.json();
            if (data.success) {
                setDiscount(data.discount);
                setPromoStatus('success');
            } else {
                setDiscount(0);
                setPromoStatus('invalid');
            }
        } catch (e) {
            setPromoStatus('invalid');
        }
    };

    const getFinalPrice = () => {
        if (!product) return 0;
        const original = parseFloat(product.price.replace('$', ''));
        const baseTotal = original * quantity;
        if (discount > 0) {
            const d = baseTotal * (discount / 100);
            return (baseTotal - d).toFixed(2);
        }
        return baseTotal.toFixed(2);
    };

    const handlePayment = async () => {
        if (!paymentMethod) return alert('Select a payment method');
        if (!email) return alert('Please enter your email for delivery');
        setIsProcessing(true);

        try {
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
                    window.location.href = `/order-success?orderId=${data.orderId}`; // Manual Success
                }
            } else {
                alert('Checkout Error: ' + data.error);
            }
        } catch (e) {
            alert('Payment Failed');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!product) return <div className="container text-center pt-20">Loading Checkout...</div>;

    return (
        <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px', maxWidth: '1200px' }}>
            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '3rem', fontWeight: 'bold', background: 'linear-gradient(to right, #fff, #999)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Secure Checkout
                </h1>
                <p style={{ fontFamily: 'var(--font-inter)', color: '#888' }}>Complete your purchase securely</p>
            </div>

            <div className="checkout-grid">

                {/* LEFT COLUMN: Payment & Contact */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Contact Info */}
                    <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#06b6d4' }}>1.</span> Contact Information
                        </h3>

                        {!user ? (
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="input-field"
                                    required
                                    style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                                />
                                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                                    We'll send your order details to this email. No account required.
                                </p>
                            </div>
                        ) : (
                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#4f46e5', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                                    {user.email[0].toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{user.email}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Logged in</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#06b6d4' }}>2.</span> Payment Method
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                            {[
                                { id: 'stripe', name: 'Credit Card', icon: '💳' },
                                { id: 'cryptomus', name: 'Crypto', icon: '₿' },
                                { id: 'binance', name: 'Binance Pay', icon: '🔸' }
                            ].map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    style={{
                                        padding: '1.5rem',
                                        borderRadius: '16px',
                                        border: paymentMethod === method.id ? '2px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
                                        background: paymentMethod === method.id ? 'rgba(6, 182, 212, 0.1)' : 'rgba(0,0,0,0.2)',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{method.icon}</div>
                                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{method.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Trust Signals */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px' }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🛡️</div>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>Secure</h4>
                            <p style={{ fontSize: '0.75rem', color: '#888' }}>256-bit SSL</p>
                        </div>
                        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px' }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚡</div>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>Instant</h4>
                            <p style={{ fontSize: '0.75rem', color: '#888' }}>Auto-Delivery</p>
                        </div>
                        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px' }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🤝</div>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>Guaranteed</h4>
                            <p style={{ fontSize: '0.75rem', color: '#888' }}>24h Warranty</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Order Summary */}
                <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                        <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Order Summary</h3>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <img src={getPlatformIcon(product.platform, product.image)} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'contain' }} />
                            <div>
                                <h4 style={{ fontSize: '1rem', lineHeight: '1.4', marginBottom: '0.2rem' }}>{product.name}</h4>
                                <div style={{ fontSize: '0.8rem', color: '#888', background: 'rgba(255,255,255,0.1)', width: 'fit-content', padding: '2px 8px', borderRadius: '4px' }}>{product.platform}</div>
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '12px' }}>
                            <span style={{ fontSize: '0.9rem', color: '#ccc' }}>Quantity</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button onClick={() => setQuantity((q: number) => Math.max(1, q - 1))} style={{ background: '#333', color: 'white', border: 'none', width: '30px', height: '30px', borderRadius: '8px', cursor: 'pointer' }}>-</button>
                                <span style={{ fontWeight: 'bold' }}>{quantity}</span>
                                <button onClick={() => setQuantity((q: number) => q + 1)} style={{ background: '#4f46e5', color: 'white', border: 'none', width: '30px', height: '30px', borderRadius: '8px', cursor: 'pointer' }}>+</button>
                            </div>
                        </div>

                        {/* Promo Input */}
                        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                            <input
                                placeholder="Have a Promo Code?"
                                value={promoCode}
                                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                                style={{ width: '100%', padding: '0.8rem', paddingRight: '70px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none' }}
                            />
                            <button
                                onClick={handleApplyPromo}
                                style={{ position: 'absolute', right: '5px', top: '5px', background: '#333', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                                Apply
                            </button>
                            {promoStatus === 'success' && <div style={{ color: '#00ff88', fontSize: '0.8rem', marginTop: '0.5rem' }}>✓ {discount}% Discount Applied</div>}
                            {promoStatus === 'invalid' && <div style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>✕ Invalid Code</div>}
                        </div>

                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed rgba(255,255,255,0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#aaa' }}>
                                <span>Subtotal</span>
                                <span>${product.price} {quantity > 1 ? `x ${quantity}` : ''}</span>
                            </div>
                            {discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#00ff88' }}>
                                    <span>Discount</span>
                                    <span>-{discount}%</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                <span>Total</span>
                                <span>${getFinalPrice()}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={!paymentMethod || isProcessing || !email}
                            className="btn"
                            style={{
                                width: '100%',
                                marginTop: '2rem',
                                padding: '1rem',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                background: (!paymentMethod || !email) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #06b6d4 0%, #4f46e5 100%)',
                                color: (!paymentMethod || !email) ? '#666' : '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: (!paymentMethod || !email) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            {isProcessing ? 'Processing...' : `Pay $${getFinalPrice()}`}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: '#666' }}>
                            🔒 Secure SSL Encryption
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
