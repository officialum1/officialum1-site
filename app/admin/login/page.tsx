"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (data.success) {
                // We still set localStorage for client-side UI state, but real protection is cookies
                localStorage.setItem('isAdmin', 'true');
                router.push('/admin/dashboard');
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
            <form onSubmit={handleLogin} className="glass" style={{ padding: '3rem', borderRadius: '16px', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Admin Login</h2>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            borderRadius: '8px',
                            border: '1px solid var(--glass-border)',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'white'
                        }}
                    />
                </div>
                {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
            </form>
        </div>
    );
}
