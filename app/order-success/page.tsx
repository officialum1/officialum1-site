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
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingTop: '140px', paddingBottom: '100px', position: 'relative', background: 'var(--bg-base)' }}>
            <div
                className="rounded-3xl border p-10 sm:p-14 text-center max-w-xl w-full mx-4 shadow-xl"
                style={{
                    background: "#ffffff",
                    borderColor: "var(--border-subtle)",
                    boxShadow: "0 20px 50px rgba(24,32,38,0.08)"
                }}
            >
                <div style={{ fontSize: '4.5rem', marginBottom: '1.2rem', animation: 'bounce 1s infinite' }}>🎉</div>
                <h1 style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    Payment Successful!
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2rem' }}>
                    Thank you for your purchase. Your order <strong style={{ color: 'var(--text-primary)' }}>#{orderId}</strong> has been confirmed.
                </p>

                <div style={{ background: 'var(--bg-base)', padding: '1.8rem', borderRadius: '16px', marginBottom: '2.5rem', border: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                    <h3 style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        What's Next?
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        We have sent the confirmation receipt and order details to your email address.<br />
                        <span style={{ color: '#d97706', fontSize: '0.85rem', fontWeight: '500' }}>⚠️ Please check your Spam/Junk folder if you don't see it within 5 minutes.</span>
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link
                        href="/shop"
                        className="rounded-xl px-6 py-3.5 text-sm font-bold border transition-all"
                        style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", background: "transparent" }}
                    >
                        Continue Shopping
                    </Link>
                    <Link
                        href="/my-orders"
                        className="rounded-xl px-6 py-3.5 text-sm font-extrabold text-white shadow-md transition-all"
                        style={{ background: "var(--gradient)", boxShadow: "var(--glow-blue)" }}
                    >
                        View Order Dashboard
                    </Link>
                </div>
            </div>

            {/* ONE-TIME UPSELL MODAL */}
            {showUpsell && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)' }}>
                    <div
                        className="rounded-3xl border p-8 text-center max-w-md w-full mx-4 shadow-2xl relative"
                        style={{
                            background: "#ffffff",
                            borderColor: "var(--primary)"
                        }}
                    >
                        <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'var(--gradient)', color: '#fff', padding: '0.3rem 1.2rem', borderRadius: '50px', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '1px' }}>
                            ONE-TIME SPECIAL OFFER
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: '1.8rem', fontWeight: '800', marginTop: '0.5rem', marginBottom: '0.8rem', color: 'var(--text-primary)' }}>
                            Upgrade to Silver VIP 🥈
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                            Exclusive for new buyers! Get <strong>Silver VIP</strong> for a full month at <b>50% OFF</b>. Unlock priority support and automatic 5% store-wide discounts.
                        </p>

                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '1rem' }}>$9.99</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)' }}>$4.99</div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <Link
                                href="/checkout?membership=silver&promo=UPSELL50"
                                className="rounded-xl py-3.5 text-sm font-extrabold text-white shadow-md"
                                style={{ background: "var(--gradient)", boxShadow: "var(--glow-blue)" }}
                            >
                                Claim 50% Off VIP Pass
                            </Link>
                            <button
                                onClick={() => setShowUpsell(false)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
                            >
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
