"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

export default function VerificationPage() {
    const [user, setUser] = useState<any>(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('buyer_user');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const handleVerify = () => {
        setLoading(true);
        // Simulate Verification Process
        setTimeout(() => {
            setLoading(false);
            setStep(3);
            toast.success("Identity documents submitted successfully!");
        }, 2000);
    };

    if (!user) return <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>Please login...</div>;

    return (
        <main style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px', maxWidth: '800px' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 className="text-4xl font-bold mb-4">Trust & <span className="text-gradient">Verification</span></h1>
                    <p style={{ color: '#aaa' }}>Complete your verification to unlock higher purchase limits and instant delivery for all products.</p>
                </div>

                <div className="glass" style={{ padding: '3rem', borderRadius: '30px', position: 'relative' }}>

                    {/* Progress Steps */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4rem', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '20px', left: '0', right: '0', height: '2px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }}></div>
                        <div style={{ position: 'absolute', top: '20px', left: '0', width: step === 1 ? '0%' : (step === 2 ? '50%' : '100%'), height: '2px', background: '#00ff88', zIndex: 0, transition: 'width 0.5s ease' }}></div>

                        {[1, 2, 3].map(s => (
                            <div key={s} style={{ zIndex: 1, textAlign: 'center' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: step >= s ? '#00ff88' : '#1a1b20',
                                    color: step >= s ? '#000' : '#888',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    margin: '0 auto 0.5rem'
                                }}>{step > s ? '✓' : s}</div>
                                <div style={{ fontSize: '0.75rem', color: step >= s ? '#fff' : '#444', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {s === 1 ? 'Email' : (s === 2 ? 'Identity' : 'Finish')}
                                </div>
                            </div>
                        ))}
                    </div>

                    {step === 1 && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📧</div>
                            <h2 style={{ marginBottom: '1rem' }}>Verify your Email Address</h2>
                            <p style={{ color: '#888', marginBottom: '2rem' }}>We've sent a verification code to <b>{user.email}</b>. Click the button below if you've already verified.</p>
                            <button onClick={() => setStep(2)} className="btn btn-primary" style={{ padding: '1rem 3rem' }}>Email is Verified</button>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Identity Documents</h2>
                            <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ fontSize: '1.5rem' }}>🪪</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'bold' }}>Government ID / Passport</div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Securely upload an image of your valid identity card.</div>
                                        </div>
                                        <div style={{ color: 'var(--accent)' }}>Upload</div>
                                    </div>
                                </div>
                                <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ fontSize: '1.5rem' }}>📸</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'bold' }}>Selfie Verification</div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>A quick photo to match your ID documents.</div>
                                        </div>
                                        <div style={{ color: 'var(--accent)' }}>Verify</div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleVerify}
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '1.2rem' }}
                            >
                                {loading ? 'Submitting Documents...' : 'Submit for Review'}
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎉</div>
                            <h2 style={{ marginBottom: '1rem' }}>Verification Submitted!</h2>
                            <p style={{ color: '#888', marginBottom: '2.5rem' }}>Your documents are being reviewed by our compliance team. This usually takes 2-6 hours. You'll receive a notification once your "Verified Pro" status is active.</p>
                            <a href="/dashboard" className="btn btn-outline">Return to Dashboard</a>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#00ff88', fontSize: '1.5rem', marginBottom: '0.5rem' }}>256-bit</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>AES Encryption</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#00ff88', fontSize: '1.5rem', marginBottom: '0.5rem' }}>100% Secure</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Data Privacy Guaranteed</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#00ff88', fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Storage</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>IDs deleted after review</div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
