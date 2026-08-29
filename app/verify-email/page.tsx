"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch('/api/auth/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
                const data = await res.json();
                if (data.success) {
                    setStatus('success');
                    setTimeout(() => router.push('/dashboard'), 3000);
                } else {
                    setStatus('error');
                }
            } catch (e) {
                setStatus('error');
            }
        };

        verify();
    }, [token, router]);

    return (
        <div className="glass" style={{ padding: '3rem', borderRadius: '24px', textAlign: 'center', maxWidth: '500px', width: '100%', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h1 style={{ marginBottom: '1.5rem', background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.5rem' }}>
                Email Verification
            </h1>

            {status === 'verifying' && (
                <div>
                    <div style={{ width: '40px', height: '40px', border: '3px solid #4f46e5', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 1.5rem', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ color: '#aaa', fontSize: '1.1rem' }}>Verifying your token...</p>
                </div>
            )}

            {status === 'success' && (
                <div style={{ color: '#00ff88' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Verified!</h2>
                    <p style={{ color: '#ccc' }}>Your email has been successfully verified.</p>
                    <p style={{ color: '#888', marginTop: '1rem', fontSize: '0.9rem' }}>Redirecting to dashboard...</p>
                </div>
            )}

            {status === 'error' && (
                <div style={{ color: '#ff4444' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Verification Failed</h2>
                    <p style={{ color: '#ccc' }}>The token is invalid or has expired.</p>
                    <a href="/register" className="btn btn-outline" style={{ marginTop: '2rem', display: 'inline-block' }}>Try Again</a>
                </div>
            )}

            <style jsx>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <main style={{ minHeight: '100vh', background: '#050505', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                <Suspense fallback={<div style={{ color: 'white' }}>Loading...</div>}>
                    <VerifyContent />
                </Suspense>
            </div>
            <Footer />
        </main>
    );
}
