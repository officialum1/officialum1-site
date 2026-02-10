"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Verify credentials via Auth API
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.success) {
                // 2. Check for Admin or staff role
                if (data.user.role === 'admin' || data.user.role === 'seller') {
                    // Set Secure Cookie
                    document.cookie = "admin_session=true; path=/; max-age=86400; SameSite=Strict";

                    // Set Local Storage for Navbar and Dashboard
                    localStorage.setItem('buyer_user', JSON.stringify(data.user));

                    // SAVE ADMIN KEY for Extension & Dashboard Access
                    // (This assumes the user password = admin password, or at least grants access)
                    localStorage.setItem('admin_key', password);

                    // Redirect
                    window.location.href = '/admin/inventory';
                } else {
                    alert('Access Denied. You do not have staff/admin permissions.');
                    setLoading(false);
                }
            } else {
                alert('Login Failed: ' + data.error);
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
            setLoading(false);
        }
    };

    return (
        <main style={{ minHeight: '100vh', background: '#000', color: 'white', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '100px' }}>
                <div className="glass" style={{
                    padding: '3rem',
                    borderRadius: '24px',
                    border: '1px solid #333',
                    maxWidth: '400px',
                    width: '100%',
                    background: 'rgba(20,20,20,0.8)'
                }}>
                    <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem', color: '#ff00d4' }}>Admin Portal</h1>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Admin Email</label>
                            <input
                                type="email"
                                className="input-field"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Password</label>
                            <input
                                type="password"
                                className="input-field"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                style={{ width: '100%' }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn"
                            style={{
                                background: '#333',
                                color: '#fff',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid #444',
                                cursor: 'pointer',
                                marginTop: '1rem'
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : 'Enter Secure Area'}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
