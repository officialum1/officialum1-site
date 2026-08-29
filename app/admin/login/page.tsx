"use client";

import { useState } from 'react';
import { KeyRound } from 'lucide-react';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            // 1. Verify credentials via Auth API
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.success) {
                // 2. Check for Admin or staff role
                if (data.user.role === 'admin' || data.user.role === 'seller') {
                    // Set Secure Cookie
                    document.cookie = "admin_session=true; path=/; max-age=86400; SameSite=Strict";

                    // Set Local Storage for Dashboard contexts
                    localStorage.setItem('buyer_user', JSON.stringify(data.user));

                    // Redirect to root catalog endpoint
                    window.location.href = '/admin/catalog';
                } else {
                    setErrorMsg('Access Denied. Insufficient privileges.');
                    setLoading(false);
                }
            } else {
                setErrorMsg(data.error || 'Authentication failed.');
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            setErrorMsg('An unexpected system error occurred.');
            setLoading(false);
        }
    };

    return (
        <main style={{ 
            minHeight: '100vh', 
            background: '#F8F9FA', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: '#FFFFFF',
                padding: '40px 32px',
                borderRadius: '8px',
                border: '1px solid #E9ECEF',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                maxWidth: '380px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header Icon & Branding */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '8px',
                        background: '#D8F3DC',
                        color: '#2D6A4F',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px'
                    }}>
                        <KeyRound size={20} />
                    </div>
                    <h1 style={{ 
                        textAlign: 'center', 
                        margin: '0 0 8px', 
                        fontSize: '20px', 
                        fontWeight: 700,
                        color: '#212529',
                        letterSpacing: '-0.5px'
                    }}>
                        Sign in to Admin
                    </h1>
                    <p style={{ 
                        textAlign: 'center', 
                        margin: 0, 
                        fontSize: '13px', 
                        color: '#6C757D' 
                    }}>
                        OfficialUM1 Management Portal
                    </p>
                </div>

                {errorMsg && (
                    <div style={{
                        background: '#FDECEA',
                        border: '1px solid #F5C2C7',
                        borderRadius: '6px',
                        padding: '10px 12px',
                        fontSize: '12px',
                        color: '#C0392B',
                        marginBottom: '20px',
                        fontWeight: 500
                    }}>
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '6px', 
                            color: '#212529', 
                            fontWeight: 600,
                            fontSize: '12px'
                        }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder="admin@officialum1.com"
                            style={{ 
                                width: '100%',
                                height: '36px',
                                background: '#FFFFFF',
                                border: '1px solid #E9ECEF',
                                borderRadius: '6px',
                                padding: '0 12px',
                                fontSize: '13px',
                                color: '#212529',
                                outline: 'none',
                                transition: 'all 0.15s'
                            }}
                            className="focus:border-[#212529] focus:shadow-sm"
                        />
                    </div>
                    
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ 
                                color: '#212529', 
                                fontWeight: 600,
                                fontSize: '12px'
                            }}>
                                Password
                            </label>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            style={{ 
                                width: '100%',
                                height: '36px',
                                background: '#FFFFFF',
                                border: '1px solid #E9ECEF',
                                borderRadius: '6px',
                                padding: '0 12px',
                                fontSize: '13px',
                                color: '#212529',
                                outline: 'none',
                                transition: 'all 0.15s'
                            }}
                            className="focus:border-[#212529] focus:shadow-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            background: '#2D6A4F',
                            color: '#FFFFFF',
                            padding: '0 16px',
                            height: '36px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 600,
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s'
                        }}
                        className="hover:bg-[#1B4332] disabled:opacity-60"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </main>
    );
}
