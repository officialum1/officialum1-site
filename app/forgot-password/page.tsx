"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                setStatus('success');
            } else {
                const data = await res.json();
                setErrorMsg(data.error || 'Failed to send reset email');
                setStatus('error');
            }
        } catch (e) {
            setErrorMsg('Network Error');
            setStatus('error');
        }
    };

    return (
        <main style={{ minHeight: '100vh', background: '#050505', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '20%', left: '40%', width: '300px', height: '300px', background: '#4f46e5', borderRadius: '50%', filter: 'blur(150px)', opacity: 0.2 }}></div>

                <div className="glass" style={{
                    padding: '3rem',
                    borderRadius: '24px',
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: '450px',
                    border: '1px solid rgba(255,255,255,0.08)'
                }}>
                    <h1 style={{ marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2rem' }}>Forgot Password?</h1>

                    {status === 'success' ? (
                        <div style={{ background: 'rgba(0, 255, 136, 0.1)', padding: '1rem', borderRadius: '8px', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}>
                            <p style={{ fontWeight: 'bold' }}>Email Sent!</p>
                            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Please check your inbox (and spam) for a temporary reset code.</p>
                            <a href="/login" className="btn btn-outline" style={{ display: 'inline-block', marginTop: '1rem' }}>Back to Login</a>
                        </div>
                    ) : (
                        <>
                            <p style={{ color: '#888', marginBottom: '2rem' }}>Enter your email address and we'll send you a recovery code.</p>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="input-field"
                                    required
                                    style={{ width: '100%' }}
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={status === 'loading'}
                                    style={{ width: '100%', padding: '1rem' }}
                                >
                                    {status === 'loading' ? 'Sending...' : 'Send Recovery Code'}
                                </button>
                            </form>
                            {status === 'error' && <p style={{ color: '#ff4444', marginTop: '1rem' }}>{errorMsg}</p>}
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
}
