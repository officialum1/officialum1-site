"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.success) {
            // SECURITY: Prevent Admin Login from Public Portal
            if (data.user.email === 'admin@officialum1.com') {
                alert("Security Alert: Administrators must use the dedicated Admin Portal.");
                // Clear any potential session
                localStorage.removeItem('buyer_user');
                return;
            }

            localStorage.setItem('buyer_user', JSON.stringify(data.user));
            document.cookie = "admin_session=; path=/; max-age=0"; // Ensure no admin cookie

            window.location.href = '/shop'; // Redirect to Shop
        } else {
            alert('Login Failed: ' + data.error);
        }
    };

    return (
        <main style={{ minHeight: '100vh', background: '#050505', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                {/* Background Blobs */}
                <div style={{ position: 'absolute', top: '20%', left: '20%', width: '300px', height: '300px', background: '#4f46e5', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.2 }}></div>
                <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: '300px', height: '300px', background: '#06b6d4', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.2 }}></div>

                <div className="glass" style={{
                    position: 'relative',
                    padding: '3.5rem',
                    borderRadius: '24px',
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: '480px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 10
                }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Welcome Back
                        </h1>
                        <p style={{ fontFamily: 'var(--font-inter)', color: '#888', fontSize: '0.95rem' }}>
                            Access your client dashboard & orders
                        </p>
                    </div>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'left' }}>
                            <label style={{ fontFamily: 'var(--font-outfit)', fontSize: '0.85rem', fontWeight: 500, color: '#ccc', marginLeft: '0.2rem', marginBottom: '0.5rem', display: 'block' }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '1rem 1.2rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    fontFamily: 'var(--font-inter)',
                                    marginBottom: '0.5rem',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <label style={{ fontFamily: 'var(--font-outfit)', fontSize: '0.85rem', fontWeight: 500, color: '#ccc', marginLeft: '0.2rem', marginBottom: '0.5rem', display: 'block' }}>
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '1rem 1.2rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    fontFamily: 'var(--font-inter)',
                                    marginBottom: '0.5rem',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                fontSize: '1rem',
                                fontWeight: 600,
                                fontFamily: 'var(--font-outfit)',
                                background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'transform 0.1s',
                                boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            Sign In to Dashboard
                        </button>
                    </form>

                    <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontFamily: 'var(--font-inter)', color: '#666', fontSize: '0.9rem' }}>
                            Don't have an account? <a href="/register" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500, borderBottom: '1px dotted #666', paddingBottom: '2px' }}>Create one here</a>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
            <style jsx>{`
                @media (max-width: 768px) {
                    .glass { padding: 2rem !important; margin: 1rem !important; }
                    h1 { font-size: 2rem !important; }
                }
            `}</style>
        </main>
    );
}
