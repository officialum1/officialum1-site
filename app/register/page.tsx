"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [telegram, setTelegram] = useState('');
    const [referralCode, setReferralCode] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password, telegram, referralCode })
            });
            const data = await res.json();

            if (data.success) {
                // Auto-Login: Save user to session (local storage)
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirect to Dashboard
                window.location.href = '/dashboard';
            } else {
                setErrorMsg(data.error || 'Registration failed');
                setIsLoading(false);
            }
        } catch (err) {
            setErrorMsg('Network Error. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <main style={{ minHeight: '100vh', background: '#050505', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                {/* Background Blobs */}
                <div style={{ position: 'absolute', top: '10%', right: '30%', width: '400px', height: '400px', background: '#4f46e5', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.15 }}></div>
                <div style={{ position: 'absolute', bottom: '10%', left: '20%', width: '300px', height: '300px', background: '#ec4899', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.15 }}></div>

                <div className="glass" style={{
                    position: 'relative',
                    padding: '3.5rem',
                    borderRadius: '24px',
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: '500px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 10
                }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Join OfficialUM1
                        </h1>
                        <p style={{ fontFamily: 'var(--font-inter)', color: '#888', fontSize: '0.95rem' }}>
                            Create a buyer account for faster checkout & history
                        </p>
                    </div>

                    {errorMsg && (
                        <div style={{ background: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid rgba(255, 68, 68, 0.2)' }}>
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div style={{ textAlign: 'left' }}>
                            <label style={{ fontFamily: 'var(--font-outfit)', fontSize: '0.85rem', fontWeight: 500, color: '#ccc', marginLeft: '0.2rem', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                className="input-field"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                style={{ width: '100%', padding: '1rem 1.2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'all 0.2s' }}
                                onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <label style={{ fontFamily: 'var(--font-outfit)', fontSize: '0.85rem', fontWeight: 500, color: '#ccc', marginLeft: '0.2rem', marginBottom: '0.5rem', display: 'block' }}>Password</label>
                            <input
                                type="password"
                                placeholder="Create a strong password"
                                className="input-field"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                style={{ width: '100%', padding: '1rem 1.2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'all 0.2s' }}
                                onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <label style={{ fontFamily: 'var(--font-outfit)', fontSize: '0.85rem', fontWeight: 500, color: '#ccc', marginLeft: '0.2rem', marginBottom: '0.5rem', display: 'block' }}>Telegram (Optional)</label>
                            <input
                                type="text"
                                placeholder="@username for delivery alerts"
                                className="input-field"
                                value={telegram}
                                onChange={e => setTelegram(e.target.value)}
                                style={{ width: '100%', padding: '1rem 1.2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'all 0.2s' }}
                                onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <label style={{ fontFamily: 'var(--font-outfit)', fontSize: '0.85rem', fontWeight: 500, color: '#ccc', marginLeft: '0.2rem', marginBottom: '0.5rem', display: 'block' }}>Referral Code (Optional)</label>
                            <input
                                type="text"
                                placeholder="Enter code if you have one"
                                className="input-field"
                                value={referralCode}
                                onChange={e => setReferralCode(e.target.value)}
                                style={{ width: '100%', padding: '1rem 1.2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'all 0.2s' }}
                                onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>

                        <button
                            className="btn"
                            type="submit"
                            disabled={isLoading}
                            style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                fontFamily: 'var(--font-outfit)',
                                background: isLoading ? '#333' : 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
                                color: isLoading ? '#888' : '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                boxShadow: isLoading ? 'none' : '0 4px 15px rgba(79, 70, 229, 0.4)',
                                transition: 'all 0.3s'
                            }}
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontFamily: 'var(--font-inter)', color: '#666', fontSize: '0.9rem' }}>
                            Already have an account? <a href="/login" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500, borderBottom: '1px dotted #666', paddingBottom: '2px' }}>Sign In</a>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
