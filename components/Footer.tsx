"use client";

import { useState } from 'react';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setStatus('submitting');

        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (res.ok) {
                setStatus('success');
                setEmail('');
                setTimeout(() => setStatus('idle'), 4000);
            } else {
                setStatus('error');
                setTimeout(() => setStatus('idle'), 3000);
            }
        } catch (err) {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer
            className="siteFooter relative mt-32 pt-24 pb-12 overflow-hidden"
            style={{
                background: "linear-gradient(180deg, #ffffff 0%, var(--bg-section-alt) 100%)",
                color: "var(--text-primary)",
                borderTop: "1px solid var(--border-subtle)",
            }}
        >
            
            {/* Deep Grid and Glow Overlays */}
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                {/* Grid pattern */}
                <div 
                    className="absolute inset-0 opacity-[0.02]" 
                    style={{ 
                        backgroundImage: 'radial-gradient(var(--accent-blue) 1px, transparent 1px)', 
                        backgroundSize: '24px 24px' 
                    }} 
                />
                
                {/* Glow meshes */}
                <div 
                    className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[130px] opacity-20 animate-pulse" 
                    style={{ background: 'var(--accent-blue)', animationDuration: '8s' }} 
                />
                <div 
                    className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[160px] opacity-[0.15]" 
                    style={{ background: 'var(--accent-violet)' }} 
                />
                
                {/* Top border flare */}
                <div 
                    className="absolute top-0 inset-x-0 h-[1px]" 
                    style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 20%, rgba(79, 142, 247, 0.4) 50%, rgba(255,255,255,0.08) 80%, transparent 100%)' }} 
                />
            </div>

            <div className="container relative z-10">
                
                {/* Elevated Premium Newsletter Block */}
                <div 
                    className="relative p-8 md:p-12 rounded-[32px] border overflow-hidden mb-20 mx-4 md:mx-0"
                    style={{ 
                        background: '#fff',
                        borderColor: 'var(--border-subtle)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 18px 44px rgba(24,32,38,0.08)'
                    }}
                >
                    {/* Inner radial light shine */}
                    <div 
                        className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-[0.07] pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(20,108,120,0.12) 0%, transparent 70%)' }}
                    />

                    <div className="relative grid lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-7">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-[11px] font-bold tracking-widest uppercase text-indigo-400 mb-4">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                Digital Agency
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3 leading-tight">
                                Ready to grow your <br className="hidden md:block" />
                                <span style={{ background: 'linear-gradient(120deg, var(--accent-blue) 20%, var(--accent-violet) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    digital presence?
                                </span>
                            </h2>
                            <p className="text-gray-400 max-w-md text-sm leading-relaxed">
                                Get premium digital strategy updates, SEO tips, and agency news sent straight to your inbox.
                            </p>
                        </div>

                        <div className="lg:col-span-5">
                            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 relative group">
                                <div className="relative flex-1">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address..."
                                        aria-label="Email address for newsletter"
                                        required
                                        disabled={status === 'submitting' || status === 'success'}
                                        className="w-full rounded-2xl border border-white/10 bg-black/40 hover:bg-black/60 hover:border-white/20 px-5 py-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={status === 'submitting' || status === 'success'}
                                    className="whitespace-nowrap rounded-2xl px-7 py-4 text-sm font-bold text-white transition-all relative overflow-hidden group/btn"
                                    style={{
                                        background: "linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-violet) 100%)",
                                        boxShadow: "0 8px 30px rgba(79, 142, 247, 0.25)",
                                    }}
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        {status === 'idle' && 'Subscribe Now'}
                                        {status === 'submitting' && 'Sending...'}
                                        {status === 'success' && '✓ Subscribed!'}
                                        {status === 'error' && 'Error'}
                                        <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                    {/* Shimmer glow effect on hover */}
                                    <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                                </button>
                            </form>
                            {status === 'success' && <p className="text-emerald-400 text-xs mt-3 font-medium pl-2">Thank you! You have successfully subscribed to our newsletter.</p>}
                        </div>
                    </div>
                </div>

                {/* Primary Content Links Array */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-white/5 mx-4 md:mx-0">
                    
                    {/* Brand Matrix */}
                    <div className="col-span-2 md:col-span-3 lg:col-span-4 pr-0 lg:pr-12">
                        <div className="flex items-center gap-3 mb-6 group cursor-pointer">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500" />
                                <img src="/logo.jpg" alt="OfficialUM1 Logo" className="relative h-11 w-11 rounded-full object-cover border border-white/20 transition duration-500 group-hover:scale-105" />
                            </div>
                            <div>
                                <div className="text-xl font-black tracking-tight text-white font-sans">OfficialUM1 LLC</div>
                                <div className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    US Registered Agency
                                </div>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6 font-sans">
                            OfficialUM1 LLC is a US-registered digital marketing and software engineering agency delivering high-speed Next.js web applications, organic SEO scaling, and digital growth infrastructure worldwide.
                        </p>
                        
                        {/* Social Command Links */}
                        <div className="flex items-center gap-3">
                            {[
                                { href: "https://twitter.com/officialum1", name: "X (Twitter)", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                                { href: "https://instagram.com/officialum1", name: "Instagram", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
                                { href: "https://linkedin.com/company/officialum1", name: "LinkedIn", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> }
                            ].map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    aria-label={social.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 text-gray-400 bg-white/[0.02] hover:bg-indigo-500 hover:text-white hover:border-indigo-500 hover:-translate-y-0.5 shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Grid Cluster */}
                    <div className="col-span-2 md:col-span-1 lg:col-span-2 lg:ml-auto">
                        <h3 className="text-[11px] font-black tracking-[3px] text-white uppercase mb-6 font-sans border-l-2 border-indigo-500 pl-3">
                            Services
                        </h3>
                        <ul className="space-y-4 text-[13.5px]">
                            {[
                                { name: 'Web Development', href: '/services' },
                                { name: 'SEO Optimization', href: '/services' },
                                { name: 'Social Strategy', href: '/services' },
                                { name: 'Guest Posting', href: '/services/guest-posting' },
                                { name: 'Site Rentals', href: '/store' }
                            ].map((link, index) => (
                                <li key={index}>
                                    <a href={link.href} className="text-gray-400 hover:text-white hover:pl-1 flex items-center gap-2 group/link transition-all duration-300">
                                        <span className="w-1 h-1 rounded-full bg-indigo-500 opacity-0 group-hover/link:opacity-100 transition-all duration-300" />
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="col-span-2 md:col-span-1 lg:col-span-2 lg:ml-auto">
                        <h3 className="text-[11px] font-black tracking-[3px] text-white uppercase mb-6 font-sans border-l-2 border-indigo-500 pl-3">
                            Company
                        </h3>
                        <ul className="space-y-4 text-[13.5px]">
                            {[
                                { name: 'About Us', href: '/about' },
                                { name: 'Portfolio Hub', href: '/work' },
                                { name: 'Reviews', href: '/reviews' },
                                { name: 'Contact Us', href: '/contact' }
                            ].map((link, index) => (
                                <li key={index}>
                                    <a href={link.href} className="text-gray-400 hover:text-white hover:pl-1 flex items-center gap-2 group/link transition-all duration-300">
                                        <span className="w-1 h-1 rounded-full bg-indigo-500 opacity-0 group-hover/link:opacity-100 transition-all duration-300" />
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="col-span-2 md:col-span-1 lg:col-span-4 lg:ml-auto">
                        <h3 className="text-[11px] font-black tracking-[3px] text-white uppercase mb-6 font-sans border-l-2 border-indigo-500 pl-3">
                            Resources & Info
                        </h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-[13.5px]">
                            {[
                                { name: 'Help Center', href: '/help' },
                                { name: 'Password Gen', href: '/tools/password-generator' },
                                { name: 'Insight Blog', href: '/blog' },
                                { name: 'Backlink Scan', href: '/backlink-checker' },
                                { name: 'Terms of Service', href: '/terms' },
                                { name: 'Privacy Policy', href: '/privacy' }
                            ].map((link, index) => (
                                <a key={index} href={link.href} className="text-gray-400 hover:text-white hover:pl-1 flex items-center gap-2 group/link transition-all duration-300">
                                    <span className="w-1 h-1 rounded-full bg-indigo-500 opacity-0 group-hover/link:opacity-100 transition-all duration-300" />
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Master Bottom Bar / Diagnostics */}
                <div className="mt-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 text-[13px] text-gray-500 mx-4 md:mx-0">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                        <div className="font-medium text-gray-400 flex items-center gap-2">
                            <span>© {new Date().getFullYear()} OfficialUM1 LLC.</span>
                            <span className="text-gray-700 hidden md:inline">|</span>
                            <span className="text-emerald-700 font-semibold">US Registered Entity</span>
                            <span className="text-gray-700 hidden md:inline">|</span>
                            <span className="text-gray-500">All rights reserved.</span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/5">
                                    <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    1001 South Main Street, Suite 600, Kalispell, MT 59901, USA
                                </div>
                                <div className="flex items-center gap-2">
                                    <a href="mailto:hello@officialum1.com" className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 hover:text-gray-300 transition-all">
                                        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        hello@officialum1.com
                                    </a>
                                    <a href="tel:+923237102924" className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 hover:text-gray-300 transition-all">
                                        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        +92 323 7102924
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Link Bar & Return Path */}
                    <div className="flex items-center justify-between md:justify-start gap-6 border-t border-white/5 xl:border-0 pt-6 xl:pt-0">
                        <div className="flex gap-5">
                            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
                            <a href="/refund" className="hover:text-white transition-colors">Refund Policy</a>
                            <a href="/contact" className="hover:text-white transition-colors">Customer Support</a>
                        </div>

                        {/* Scroll back top mechanism */}
                        <button 
                            onClick={scrollToTop}
                            aria-label="Scroll to top"
                            className="flex items-center justify-center h-9 w-9 rounded-xl bg-white/[0.02] border border-white/5 text-gray-400 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all shadow-md hover:-translate-y-1 active:translate-y-0"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                        </button>
                    </div>
                </div>

            </div>
            <style jsx global>{`
                .siteFooter .text-white,
                .siteFooter h2,
                .siteFooter h3 {
                    color: var(--text-primary) !important;
                }

                .siteFooter .text-gray-300,
                .siteFooter .text-gray-400,
                .siteFooter .text-gray-500,
                .siteFooter .text-gray-700,
                .siteFooter p,
                .siteFooter a {
                    color: var(--text-muted) !important;
                }

                .siteFooter a:hover,
                .siteFooter button:hover {
                    color: var(--text-primary) !important;
                }

                .siteFooter input {
                    background: #fff !important;
                    border-color: var(--border-subtle) !important;
                    color: var(--text-primary) !important;
                }

                .siteFooter input::placeholder {
                    color: var(--text-muted) !important;
                }

                .siteFooter form button,
                .siteFooter form button * {
                    color: #fff !important;
                }

                .siteFooter [class*="border-white"],
                .siteFooter [class*="border-indigo"] {
                    border-color: var(--border-subtle) !important;
                }

                .siteFooter [class*="bg-white/"],
                .siteFooter [class*="bg-black/"] {
                    background: #fff !important;
                }

                .siteFooter [class*="text-cyan"],
                .siteFooter [class*="text-indigo"],
                .siteFooter [class*="text-emerald"] {
                    color: var(--accent-blue) !important;
                }

                .siteFooter svg {
                    color: currentColor;
                }
            `}</style>
        </footer>
    );
}
