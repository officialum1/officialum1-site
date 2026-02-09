"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import Link from 'next/link';

export default function VerificationPage() {
    const [user, setUser] = useState<any>(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [verifStatus, setVerifStatus] = useState<string>('none');

    // Document States
    const [docImage, setDocImage] = useState<string | null>(null);
    const [selfieImage, setSelfieImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('buyer_user');
        if (stored) {
            const parsed = JSON.parse(stored);
            setUser(parsed);
            checkVerifStatus(parsed.id);
        }
    }, []);

    const checkVerifStatus = async (userId: string) => {
        try {
            const res = await fetch(`/api/user/verify-identity?userId=${userId}`);
            const data = await res.json();
            if (data.status) {
                setVerifStatus(data.status);
                if (data.status === 'pending') setStep(3);
                if (data.status === 'approved') setStep(3);
                if (data.status === 'rejected') setStep(2); // Allow retry
            }
        } catch (e) { }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'doc' | 'selfie') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic client side validation
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size too large (Max 10MB)");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                if (type === 'doc') setDocImage(data.url);
                else setSelfieImage(data.url);
                toast.success(`${type === 'doc' ? 'ID Card' : 'Selfie'} uploaded successfully!`, {
                    style: { background: '#0d1117', color: '#00ff88', border: '1px solid #1f2937' }
                });
            } else {
                toast.error(data.error || "Upload failed");
            }
        } catch (error) {
            toast.error("Error uploading file");
        } finally {
            setUploading(false);
        }
    };

    const handleVerify = async () => {
        if (!docImage || !selfieImage) {
            toast.error("Please upload both ID and Selfie documents.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/user/verify-identity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    documentImage: docImage,
                    selfieImage: selfieImage
                })
            });
            const data = await res.json();
            if (data.success) {
                setStep(3);
                setVerifStatus('pending');
                toast.success("Identity documents submitted successfully!");
            } else {
                toast.error(data.error || "Submission failed");
            }
        } catch (e) {
            toast.error("Connection error");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return (
        <div style={{ background: '#05070a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
            <div className="FadeIn" style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ marginBottom: '20px' }}></div>
                <p>Authenticating session...</p>
            </div>
        </div>
    );

    return (
        <main style={{ minHeight: '100vh', background: '#05070a', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
            <Navbar />

            <div style={{ paddingTop: '140px', paddingBottom: '100px', maxWidth: '900px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>

                {/* Custom Header with Badge */}
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', padding: '6px 16px', borderRadius: '30px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem', border: '1px solid rgba(255, 68, 68, 0.2)' }}>
                        🛡️ Identity Verification
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-2px', marginBottom: '15px' }}>
                        Trusted <span className="text-gradient">Buyer Program</span>
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Verify your identity once and unlock instant access to our entire premium marketplace inventory.
                    </p>
                </div>

                <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)', gap: '40px' }}>

                    {/* Main Content Area */}
                    <div className="glass" style={{ padding: '40px', borderRadius: '32px', border: '1px solid #1f2937', background: 'linear-gradient(180deg, #0d1117 0%, rgba(13,17,23,0) 100%)', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}>

                        {/* Progress Stepper */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '50px', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '24px', left: '0', right: '0', height: '2px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }}></div>
                            <div style={{ position: 'absolute', top: '24px', left: '0', width: step === 1 ? '0%' : (step === 2 ? '50%' : '100%'), height: '2px', background: '#ff4444', zIndex: 0, transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 0 15px rgba(255,68,68,0.5)' }}></div>

                            {[
                                { s: 1, label: 'Email', icon: '📧' },
                                { s: 2, label: 'Documents', icon: '🪪' },
                                { s: 3, label: 'Success', icon: '✨' }
                            ].map(item => (
                                <div key={item.s} style={{ zIndex: 1, textAlign: 'center' }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '16px',
                                        background: step >= item.s ? '#ff4444' : '#111827',
                                        color: step >= item.s ? '#fff' : '#4b5563',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.2rem',
                                        margin: '0 auto 12px',
                                        transition: 'all 0.3s ease',
                                        border: step === item.s ? '2px solid rgba(255,255,255,0.2)' : '2px solid transparent',
                                        boxShadow: step >= item.s ? '0 10px 20px rgba(255,68,68,0.2)' : 'none'
                                    }}>{step > item.s ? '✓' : item.icon}</div>
                                    <div style={{ fontSize: '0.7rem', color: step >= item.s ? '#fff' : '#4b5563', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {item.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Step Views */}
                        <div className="FadeIn">
                            {step === 1 && (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎫</div>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem' }}>Confirm Ownership</h2>
                                    <p style={{ color: '#9ca3af', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                                        To protect our marketplace, we require email verification for all buyers. We've sent a secure link to: <br />
                                        <b style={{ color: '#fff', fontSize: '1.2rem' }}>{user.email}</b>
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <button onClick={() => setStep(2)} className="btn btn-primary" style={{ padding: '1.2rem', borderRadius: '16px', fontWeight: 'bold' }}>I've Confirmed my Email</button>
                                        <button onClick={() => toast.info("Email resent!")} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '0.9rem', cursor: 'pointer' }}>Didn't receive it? Resend now</button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '2rem', textAlign: 'center' }}>Identity Upload</h2>

                                    <div style={{ display: 'grid', gap: '20px', marginBottom: '30px' }}>

                                        {/* Document Upload */}
                                        <div style={{ position: 'relative' }}>
                                            <input type="file" id="id-upload" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'doc')} />
                                            <label htmlFor="id-upload" style={{
                                                display: 'block',
                                                padding: '24px',
                                                borderRadius: '20px',
                                                background: '#05070a',
                                                border: docImage ? '1px solid #00ff88' : '1px solid #1f2937',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }} className="hover-trigger">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: docImage ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                                        {docImage ? '✅' : '🪪'}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: docImage ? '#00ff88' : '#fff' }}>Official Identity Card</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>Passport, Driver's License or National ID</div>
                                                    </div>
                                                    <div style={{ color: docImage ? '#00ff88' : '#ff4444', fontWeight: 'bold' }}>{docImage ? 'Uploaded' : 'Set Tool'}</div>
                                                </div>
                                            </label>
                                            {docImage && (
                                                <div style={{ marginTop: '15px', position: 'relative', width: '200px' }}>
                                                    <img src={docImage} alt="ID Preview" style={{ width: '100%', borderRadius: '12px', border: '2px solid #1f2937' }} />
                                                    <button onClick={() => setDocImage(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Selfie Upload */}
                                        <div style={{ position: 'relative' }}>
                                            <input type="file" id="selfie-upload" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'selfie')} />
                                            <label htmlFor="selfie-upload" style={{
                                                display: 'block',
                                                padding: '24px',
                                                borderRadius: '20px',
                                                background: '#05070a',
                                                border: selfieImage ? '1px solid #00ff88' : '1px solid #1f2937',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }} className="hover-trigger">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: selfieImage ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                                        {selfieImage ? '✅' : '📸'}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: selfieImage ? '#00ff88' : '#fff' }}>Selfie Verification</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>Clear photo of your face for matching</div>
                                                    </div>
                                                    <div style={{ color: selfieImage ? '#00ff88' : '#ff4444', fontWeight: 'bold' }}>{selfieImage ? 'Uploaded' : 'Start'}</div>
                                                </div>
                                            </label>
                                            {selfieImage && (
                                                <div style={{ marginTop: '15px', position: 'relative', width: '200px' }}>
                                                    <img src={selfieImage} alt="Selfie Preview" style={{ width: '100%', borderRadius: '12px', border: '2px solid #1f2937' }} />
                                                    <button onClick={() => setSelfieImage(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                    <button
                                        onClick={handleVerify}
                                        disabled={loading || uploading || !docImage || !selfieImage}
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '1.4rem', borderRadius: '20px', fontSize: '1.1rem', fontWeight: 'bold', opacity: (loading || uploading || !docImage || !selfieImage) ? 0.5 : 1 }}
                                    >
                                        {loading ? 'Submitting Data...' : (uploading ? 'Processing Files...' : 'Complete Verification')}
                                    </button>

                                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: '#4b5563' }}>
                                        By clicking complete, you agree to our <a href="/terms" style={{ color: '#ff4444', textDecoration: 'none' }}>Privacy Policy</a> regarding document storage.
                                    </p>
                                </div>
                            )}

                            {step === 3 && (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ width: '100px', height: '100px', background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', margin: '0 auto 2rem', border: '2px solid #00ff88', boxShadow: '0 0 30px rgba(0, 255, 136, 0.2)' }}>
                                        {verifStatus === 'approved' ? '🎖️' : (verifStatus === 'rejected' ? '❌' : '⏳')}
                                    </div>
                                    <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>
                                        {verifStatus === 'approved' ? 'Verified Pro Active!' : (verifStatus === 'rejected' ? 'Verification Declined' : 'Under Review')}
                                    </h2>
                                    <p style={{ color: '#9ca3af', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '3rem', maxWidth: '500px', margin: '0 auto 3rem' }}>
                                        {verifStatus === 'approved'
                                            ? "Congratulations! Your identity has been verified. You now have unrestricted access to the marketplace."
                                            : (verifStatus === 'rejected'
                                                ? "Unfortunately your request was declined. Please check your email for details and try again with clearer photos."
                                                : "Our compliance team is currently reviewing your documents. You will receive an email notification as soon as your status is updated. Typically takes 2-6 hours.")}
                                    </p>
                                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                                        <Link href="/dashboard" className="btn btn-outline" style={{ padding: '1rem 2.5rem', borderRadius: '16px' }}>Back to Dashboard</Link>
                                        <Link href="/shop" className="btn btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '16px' }}>Go Shopping</Link>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Sidebar: Benefits & Security */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                        {/* Benefits Panel */}
                        <div className="glass" style={{ padding: '30px', borderRadius: '32px', border: '1px solid rgba(255, 68, 68, 0.1)' }}>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#ff4444' }}>💎</span> Member Perks
                            </h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '20px' }}>
                                {[
                                    { t: "Instant Fulfillment", d: "Zero wait time for account credentials." },
                                    { t: "Unrestricted Limits", d: "Purchase high-value accounts up to $10,000." },
                                    { t: "Priority Support", d: "Get moved to the front of the support queue." },
                                    { t: "Exclusive Deals", d: "Access to private 'Wholesale' category." }
                                ].map((item, i) => (
                                    <li key={i} style={{ display: 'flex', gap: '15px' }}>
                                        <div style={{ color: '#00ff88', fontWeight: 'bold' }}>✓</div>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.t}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>{item.d}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Security Panel */}
                        <div className="glass" style={{ padding: '30px', borderRadius: '32px', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                                <div style={{ fontSize: '2rem' }}>🔐</div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Secure Storage</div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>256-bit AES Encryption</div>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#4b5563', lineHeight: '1.6' }}>
                                We take privacy seriously. All documents are deleted from our servers immediately after our compliance team finishes the review.
                            </p>
                        </div>

                    </div>

                </div>

            </div>

            <Footer />

            <style jsx>{`
                .glass {
                    backdrop-filter: blur(20px);
                }
                .hover-trigger:hover {
                    border-color: #ff4444 !important;
                    transform: scale(1.02);
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(255,68,68,0.1);
                    border-top: 4px solid #ff4444;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes FadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .FadeIn { animation: FadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                
                @media (max-width: 768px) {
                    .grid-layout { grid-template-columns: 1fr !expensive; }
                    h1 { font-size: 2.5rem !important; }
                }
            `}</style>
        </main>
    );
}

