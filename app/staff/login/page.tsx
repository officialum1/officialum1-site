"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function StaffLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/staff/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.success) {
                // Success
                localStorage.setItem('staff_user', JSON.stringify(data.user));
                window.location.href = '/staff/dashboard';
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error', error);
            alert('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px', display: 'flex', justifyContent: 'center' }}>
                <div className="glass" style={{ padding: '3rem', borderRadius: '24px', maxWidth: '400px', width: '100%', border: '1px solid rgba(0,255,136,0.2)' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', color: '#00ff88' }}>Staff Portal</h1>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Business Email</label>
                            <input
                                type="email"
                                required
                                className="input-field"
                                placeholder="name@officialum1.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Password</label>
                            <input
                                type="password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                            {loading ? 'Verifying...' : 'Access Dashboard'}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </main>
    );
}
