"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    return (
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingTop: '100px', paddingBottom: '100px' }}>
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
