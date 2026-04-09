"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PageHero } from '@/components/ui/PageHero';
import { Button } from '@/components/ui/Button';

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
        <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Login' }]}
                    label="Account"
                    title={<>Welcome Back</>}
                    description="Log in to access your dashboard, orders, and member-only perks."
                />

                <section className="py-[120px] relative" style={{ background: 'var(--bg-alt)' }}>
                    <div aria-hidden className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(#4F46E5 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
                    <div className="container relative">
                        <div className="mx-auto max-w-md">
                            <div className="card overflow-hidden shadow-xl">
                                <div style={{ height: '10px', background: 'var(--gradient)' }} />
                                <div className="p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in</h2>
                                    <p className="text-[13px] text-gray-500 mb-6">Use your email and password to continue.</p>

                                    <form onSubmit={handleLogin} className="space-y-4">
                                        <div>
                                            <label className="block text-[13px] font-semibold text-gray-700 mb-2">Email</label>
                                            <input
                                                type="email"
                                                placeholder="name@example.com"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                required
                                                className="input"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-semibold text-gray-700 mb-2">Password</label>
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                required
                                                className="input"
                                            />
                                        </div>

                                        <Button type="submit" className="w-full">Sign In</Button>

                                        <div className="flex items-center justify-between text-[13px]">
                                            <a href="/forgot-password" className="text-indigo-600 font-semibold hover:underline">Forgot password?</a>
                                            <a href="/register" className="text-gray-600 hover:text-indigo-600 font-semibold">Create account</a>
                                        </div>
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
