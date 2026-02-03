"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

import { trackEvent } from '@/lib/analytics';

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [showUpsell, setShowUpsell] = useState(false);

    useEffect(() => {
        const lastOrder = localStorage.getItem('last_order');
        if (lastOrder) {
            const data = JSON.parse(lastOrder);
            if (data.orderId === orderId) {
                // 1. Track Purchase
                trackEvent('purchase', {
                    transaction_id: data.orderId,
                    value: parseFloat(data.amount),
                    currency: 'USD',
                    items: data.items.map((it: any) => ({
                        item_id: it.id,
                        item_name: it.name,
                        price: parseFloat(it.price),
                        quantity: it.quantity || 1
                    }))
                });
                // 2. Clear last order
                localStorage.removeItem('last_order');
                // 3. Trigger Upsell after 2 seconds
                setTimeout(() => setShowUpsell(true), 2000);
            }
        }
    }, [orderId]);

    return (
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingTop: '100px', paddingBottom: '100px', position: 'relative' }}>
            <div className="glass" style={{ padding: '4rem', borderRadius: '32px', textAlign: 'center', maxWidth: '600px', width: '90%', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '5rem', marginBottom: '1.5rem', animation: 'bounce 1s infinite' }}>🎉</div>
                <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', background: 'linear-gradient(to right, #00ff88, #00b8ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Payment Successful!
                </h1>
                <p style={{ fontFamily: 'var(--font-inter)', color: '#ccc', fontSize: '1.1rem', marginBottom: '2rem' }}>
                    Thank you for your purchase. Your order <strong>#{orderId}</strong> has been confirmed.
                </p>

                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '16px', marginBottom: '2.5rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.2rem', marginBottom: '0.5rem', color: '#fff' }}>What's Next?</h3>
                    <p style={{ color: '#888', lineHeight: '1.6' }}>
                        We have sent the login credentials / download link to your email address.<br />
                        <span style={{ color: '#ffaa00', fontSize: '0.9rem' }}>⚠️ Please check your Spam/Junk folder if you don't see it.</span>
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/shop" className="btn btn-outline" style={{ padding: '1rem 2rem' }}>
                        Continue Shopping
                    </Link>
                    <Link href="/my-orders" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
                        View Order
                    </Link>
                </div>
            </div>

            {/* ONE-TIME UPSELL MODAL */}
            {showUpsell && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(15px)' }}>
                    <div className="glass" style={{ width: '450px', padding: '3rem', borderRadius: '32px', border: '2px solid #00ff88', textAlign: 'center', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', background: '#00ff88', color: '#000', padding: '0.5rem 1.5rem', borderRadius: '50px', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '1px' }}>
                            ONE-TIME OFFER
                        </div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fff' }}>Upgrade to Silver VIP 🥈</h2>
                        <p style={{ color: '#888', marginBottom: '2rem', lineHeight: '1.6' }}>
                            Exclusive for new buyers! Get <strong>Silver VIP</strong> for a full month at <b>50% OFF</b>. Unlock premium support and 5% store-wide discounts.
                        </p>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <div style={{ textDecoration: 'line-through', color: '#ff4d4d', fontSize: '1.2rem' }}>$9.99</div>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#00ff88' }}>$4.99</div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Link href="/checkout?membership=silver&promo=UPSELL50" className="btn btn-primary" style={{ padding: '1.2rem', fontSize: '1.1rem' }}>
                                Yes, Add to my Account!
                            </Link>
                            <button onClick={() => setShowUpsell(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.9rem' }}>
                                No thanks, I'll pass
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <main>
            <Navbar />
            <Suspense fallback={<div>Loading...</div>}>
                <OrderSuccessContent />
            </Suspense>
            <Footer />
        </main>
    );
}
