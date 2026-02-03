"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ReferPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('buyer_user');
        if (stored) {
            setUser(JSON.parse(stored));
        }
        setLoading(false);
    }, []);

    const steps = [
        { title: "1. Join", desc: "Sign up for free and get your unique referral link instantly.", icon: "📝" },
        { title: "2. Share", desc: "Share your link on social media, Discord, or with friends needing accounts.", icon: "📢" },
        { title: "3. Earn", desc: "Earn 5% commission on every purchase they make, forever!", icon: "💸" }
    ];

    return (
        <main style={{ minHeight: '100vh', background: '#050505' }}>
            <Navbar />

            {/* Hero */}
            <section style={{ paddingTop: '150px', paddingBottom: '80px', textAlign: 'center', background: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.1) 0%, rgba(0,0,0,0) 70%)' }}>
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-outfit)' }}>
                    Refer Friends, <span style={{ color: '#ffd700' }}>Earn Crypto 💰</span>
                </h1>
                <p style={{ color: '#ccc', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                    Join our Affiliate Program and earn lifetime commissions on every order your referrals make. Fast payouts, real-time tracking.
                </p>

                {user ? (
                    <div className="glass" style={{ display: 'inline-block', padding: '2rem', borderRadius: '20px', border: '1px solid #ffd700' }}>
                        <p style={{ marginBottom: '0.5rem', color: '#888' }}>Your Unique Referral Link</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.5)', padding: '10px 20px', borderRadius: '50px' }}>
                            <code style={{ color: '#ffd700', fontSize: '1.1rem' }}>
                                {typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${user.referral_code || 'YOURCODE'}` : '...'}
                            </code>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/register?ref=${user.referral_code}`);
                                    alert('Link Copied! 📋');
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                            >
                                📋
                            </button>
                        </div>
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <a href="/dashboard" className="btn btn-primary" style={{ background: '#ffd700', color: 'black' }}>
                                View Earnings
                            </a>
                        </div>

                        <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', textAlign: 'left' }}>
                            <h4 style={{ color: '#fff', marginBottom: '1rem' }}>📢 Copy & Paste Promotion</h4>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px' }}>
                                <p style={{ fontSize: '0.9rem', color: '#aaa', fontStyle: 'italic', marginBottom: '0.5rem' }}>"Best place to get Cheap Netflix & Spotify! 🎵🍿 Instant delivery & Warranty. Check it out: {typeof window !== 'undefined' ? window.location.origin : ''}/register?ref={user.referral_code}"</p>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`Best place to get Cheap Netflix & Spotify! 🎵🍿 Instant delivery & Warranty. Check it out: ${window.location.origin}/register?ref=${user.referral_code}`);
                                        alert('Text Copied!');
                                    }}
                                    style={{ fontSize: '0.8rem', color: '#00ff88', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Copy Text
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <a href="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>Join Program Now</a>
                        <a href="/login" className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>Login</a>
                    </div>
                )}
            </section>

            {/* Steps */}
            <div className="container" style={{ paddingBottom: '100px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                    {steps.map((s, i) => (
                        <div key={i} className="glass" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{s.icon}</div>
                            <h3 style={{ marginBottom: '1rem', color: '#fff' }}>{s.title}</h3>
                            <p style={{ color: '#888' }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ Preview */}
            <div className="container" style={{ paddingBottom: '100px', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '2rem' }}>Frequency Asked Questions</h2>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
                    <div className="glass" style={{ padding: '1.5rem', marginBottom: '1rem', borderRadius: '12px' }}>
                        <h4>⚡ When do I get paid?</h4>
                        <p style={{ color: '#888', marginTop: '0.5rem' }}>You can convert your earnings to your wallet balance instantly or request a crypto payout once you reach $50.</p>
                    </div>
                    <div className="glass" style={{ padding: '1.5rem', marginBottom: '1rem', borderRadius: '12px' }}>
                        <h4>🕒 How long do cookies last?</h4>
                        <p style={{ color: '#888', marginTop: '0.5rem' }}>Our tracking cookies last for 30 days. However, once a user registers with your link, they are locked to you forever!</p>
                    </div>
                </div>
                <div style={{ marginTop: '2rem' }}>
                    <a href="/help" className="btn btn-outline">Visit Knowledge Base</a>
                </div>
            </div>

            <Footer />
        </main>
    );
}
