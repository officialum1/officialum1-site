"use client";

import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSearchParams } from 'next/navigation';
import { PageHero } from '@/components/ui/PageHero';
import { Button } from '@/components/ui/Button';

function RegisterForm() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [telegram, setTelegram] = useState('');
    const [referralCode, setReferralCode] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) setReferralCode(ref);
    }, [searchParams]);

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
        <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Register' }]}
                    label="Account"
                    title={<>Create Your Account</>}
                    description="Join OfficialUM1 for faster checkout, order history, and member perks."
                />

                <section className="py-[120px] relative" style={{ background: 'var(--bg-alt)' }}>
                    <div aria-hidden className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(#4F46E5 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
                    <div className="container relative">
                        <div className="mx-auto max-w-md">
                            <div className="card overflow-hidden shadow-xl">
                                <div style={{ height: '10px', background: 'var(--gradient)' }} />
                                <div className="p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign up</h2>
                                    <p className="text-[13px] text-gray-500 mb-6">Create a buyer account to continue.</p>

                                    {errorMsg && (
                                        <div style={{ background: 'rgba(239, 68, 68, 0.08)', color: 'var(--error)', padding: '0.8rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                            {errorMsg}
                                        </div>
                                    )}

                                    <form onSubmit={handleRegister} className="space-y-4">
                                        <div>
                                            <label className="block text-[13px] font-semibold text-gray-700 mb-2">Email</label>
                                            <input type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="input" />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-semibold text-gray-700 mb-2">Password</label>
                                            <input type="password" placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)} required className="input" />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-semibold text-gray-700 mb-2">Telegram (optional)</label>
                                            <input type="text" placeholder="@username for delivery alerts" value={telegram} onChange={e => setTelegram(e.target.value)} className="input" />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-semibold text-gray-700 mb-2">Referral code (optional)</label>
                                            <input type="text" placeholder="Enter code if you have one" value={referralCode} onChange={e => setReferralCode(e.target.value)} className="input" />
                                        </div>

                                        <Button type="submit" disabled={isLoading} className="w-full">
                                            {isLoading ? 'Creating Account...' : 'Create Account'}
                                        </Button>

                                        <p className="text-[13px] text-gray-500">
                                            Already have an account? <a href="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</a>
                                        </p>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </main>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div style={{ background: '#050505', minHeight: '100vh' }}></div>}>
            <RegisterForm />
        </Suspense>
    );
}
