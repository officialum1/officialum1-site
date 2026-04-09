"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getPlatformIcon } from '@/lib/icons';

const PLANS = [
    {
        name: 'Silver',
        price: '9.99',
        perks: ['5% Cashback on all orders', 'Priority Support', 'Bronze Profile Badge'],
        color: '#C0C0C0',
        id: 'silver'
    },
    {
        name: 'Gold',
        price: '24.99',
        perks: ['10% Cashback on all orders', 'Early Access to Stock', 'Gold Profile Badge', 'Exclusive "Gold Only" Products'],
        color: '#FFD700',
        featured: true,
        id: 'gold'
    },
    {
        name: 'Diamond',
        price: '49.99',
        perks: ['15% Cashback on all orders', 'Personal Account Manager', 'Diamond Profile Badge', 'Zero-Fee Wallet Deposits'],
        color: '#b9f2ff',
        id: 'diamond'
    }
];

export default function MembershipPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('buyer_user');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const handleUpgrade = async (planId: string) => {
        if (!user) return alert("Please login to upgrade!");
        alert(`Redirecting to payment for ${planId} plan...`);
        // In a real scenario, this would go to /checkout?membership=planId
        window.location.href = `/checkout?membership=${planId}`;
    };

    return (
        <main style={{ background: '#050505', minHeight: '100vh', color: '#fff' }}>
            <Navbar />

            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3.5rem', fontFamily: 'var(--font-outfit)', marginBottom: '1rem', background: 'linear-gradient(to right, #00ff88, #00c3ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Join the Elite
                </h1>
                <p style={{ color: '#888', maxWidth: '600px', margin: '0 auto 4rem', fontSize: '1.2rem' }}>
                    Unlock exclusive perks, earn points, and get massive discounts with OfficialUM1 VIP Memberships.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                    {PLANS.map((plan) => (
                        <div
                            key={plan.name}
                            className="glass"
                            style={{
                                padding: '3rem 2rem',
                                borderRadius: '30px',
                                border: plan.featured ? `2px solid ${plan.color}` : '1px solid rgba(255,255,255,0.05)',
                                position: 'relative',
                                background: plan.featured ? 'rgba(255,255,255,0.02)' : 'transparent',
                                transform: plan.featured ? 'scale(1.05)' : 'none',
                                zIndex: plan.featured ? 10 : 1
                            }}
                        >
                            {plan.featured && (
                                <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: plan.color, color: '#000', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    MOST POPULAR
                                </div>
                            )}
                            <h2 style={{ color: plan.color, marginBottom: '1rem', fontSize: '2rem' }}>{plan.name}</h2>
                            <div style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
                                ${plan.price}<span style={{ fontSize: '1rem', color: '#666' }}>/mo</span>
                            </div>

                            <div style={{ textAlign: 'left', marginBottom: '3rem' }}>
                                {plan.perks.map(perk => (
                                    <div key={perk} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                                        <div style={{ color: plan.color }}>✓</div>
                                        <div style={{ color: '#ccc', fontSize: '0.95rem' }}>{perk}</div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleUpgrade(plan.id)}
                                className="btn"
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    background: plan.color,
                                    color: '#000',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    border: 'none',
                                    transition: 'all 0.3s'
                                }}
                            >
                                Get Started
                            </button>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '6rem', maxWidth: '800px', margin: '6rem auto 0' }}>
                    <h2 style={{ marginBottom: '2rem' }}>Frequently Asked Questions</h2>
                    <div style={{ textAlign: 'left', display: 'grid', gap: '1.5rem' }}>
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                            <h4 style={{ color: '#00ff88', marginBottom: '0.5rem' }}>How does the cashback work?</h4>
                            <p style={{ color: '#888', fontSize: '0.9rem' }}>Cashback is automatically added to your internal wallet as soon as your order is completed. You can use it to buy more products instantly.</p>
                        </div>
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                            <h4 style={{ color: '#00ff88', marginBottom: '0.5rem' }}>Can I cancel anytime?</h4>
                            <p style={{ color: '#888', fontSize: '0.9rem' }}>Yes, memberships are recurring but can be cancelled at any time from your dashboard with no hidden fees.</p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
