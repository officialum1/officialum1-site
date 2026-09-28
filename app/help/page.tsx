"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Search, HelpCircle, BookOpen, ShieldCheck, CreditCard, Layers, ArrowRight, MessageSquare } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';

const defaultArticles = [
  { id: 1, category: "Orders & Delivery", title: "How are digital assets and credentials delivered?", slug: "digital-delivery-methods", excerpt: "Details are delivered immediately to your dashboard and emailed to your receipt address." },
  { id: 2, category: "Orders & Delivery", title: "What is the turnaround time for custom SEO & Development?", slug: "custom-turnaround-times", excerpt: "Standard SEO packages take 3-5 days. Speed optimization takes 24-48 hours with full staging verification." },
  { id: 3, category: "Payments & Crypto", title: "Which payment gateways are supported?", slug: "supported-payment-methods", excerpt: "We support Binance Pay (zero fees), Cryptomus (USDT, BTC, LTC), Stripe (Credit/Debit cards), and Account Wallet." },
  { id: 4, category: "Payments & Crypto", title: "How does the 30-day money-back guarantee work?", slug: "refund-guarantee-policy", excerpt: "If we fail to achieve agreed performance or deliver verified assets, you are eligible for a 100% refund." },
  { id: 5, category: "Account & Security", title: "How do I add funds to my Account Wallet?", slug: "wallet-topup-guide", excerpt: "Navigate to your Buyer Dashboard -> Wallet -> Top Up and pay via any crypto or card gateway." },
  { id: 6, category: "Account & Security", title: "Is my payment and business information secure?", slug: "security-encryption-overview", excerpt: "We use 256-bit SSL encryption and never store raw payment card data on our servers." },
  { id: 7, category: "Services & Technical", title: "How do you achieve 90+ Google PageSpeed scores?", slug: "pagespeed-optimization-methodology", excerpt: "Through database query cleanup, critical CSS extraction, LiteSpeed/Cloudflare edge caching, and WebP conversion." },
  { id: 8, category: "Services & Technical", title: "Do local citation packages provide live login access?", slug: "local-citation-deliverables", excerpt: "Yes. Every citation campaign includes an unbranded white-label spreadsheet with live URLs and full logins." }
];

export default function HelpCenter() {
    const [articles, setArticles] = useState<any[]>(defaultArticles);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/kb')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    const merged = [...defaultArticles, ...data];
                    const unique = merged.filter((v, i, a) => a.findIndex(t => t.title === v.title) === i);
                    setArticles(unique);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filtered = articles.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.category.toLowerCase().includes(search.toLowerCase())
    );

    // Group by Category
    const grouped = filtered.reduce((acc: any, article: any) => {
        if (!acc[article.category]) acc[article.category] = [];
        acc[article.category].push(article);
        return acc;
    }, {});

    const getCategoryIcon = (cat: string) => {
        if (cat.includes("Order")) return <BookOpen className="h-5 w-5 text-primary" />;
        if (cat.includes("Payment")) return <CreditCard className="h-5 w-5 text-primary" />;
        if (cat.includes("Security")) return <ShieldCheck className="h-5 w-5 text-primary" />;
        return <Layers className="h-5 w-5 text-primary" />;
    };

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            <Navbar />
            
            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[
                        { label: "Home", href: "/" },
                        { label: "Help & Knowledge Base" }
                    ]}
                    label="Knowledge Base & Documentation"
                    title={<>How Can We <span style={{ color: "var(--accent-blue)" }}>Help You</span> Today?</>}
                    description="Find answers to common questions regarding our digital marketplace, development services, payment options, and delivery guarantees."
                    right={
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 rounded-xl px-6 py-4 text-sm font-black text-white"
                            style={{ background: "var(--gradient)", boxShadow: "var(--glow-blue)" }}
                        >
                            <MessageSquare className="h-4 w-4" /> Contact 24/7 Support
                        </Link>
                    }
                />

                {/* Search Bar Section */}
                <section className="py-12" style={{ background: "var(--bg-section)" }}>
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                className="w-full pl-14 pr-6 py-4 rounded-2xl border text-base font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                                style={{
                                    background: "#ffffff",
                                    borderColor: "var(--border-subtle)",
                                    color: "var(--text-primary)"
                                }}
                                placeholder="Search articles, guides, payment methods, delivery times..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                {/* Articles Directory */}
                <section className="py-16 sm:py-24" style={{ background: "var(--bg-base)" }}>
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {Object.keys(grouped).map(category => (
                                <div
                                    key={category}
                                    className="rounded-3xl border p-8 transition-all"
                                    style={{
                                        background: "#ffffff",
                                        borderColor: "var(--border-subtle)",
                                        boxShadow: "0 12px 30px rgba(24,32,38,0.04)"
                                    }}
                                >
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                        <div className="p-2.5 rounded-xl bg-primary/10">
                                            {getCategoryIcon(category)}
                                        </div>
                                        <h2 className="text-xl font-black text-gray-900">
                                            {category}
                                        </h2>
                                    </div>

                                    <ul className="space-y-4">
                                        {grouped[category].map((a: any) => (
                                            <li key={a.id}>
                                                <Link
                                                    href={a.slug ? `/help/${a.slug}` : `/faq`}
                                                    className="group flex flex-col p-3 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                                                >
                                                    <div className="flex items-center justify-between font-bold text-sm text-gray-900 group-hover:text-primary">
                                                        <span>{a.title}</span>
                                                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                    {a.excerpt && (
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                            {a.excerpt}
                                                        </p>
                                                    )}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Bottom Support CTA */}
                        <div
                            className="mt-16 rounded-3xl border p-10 text-center max-w-3xl mx-auto"
                            style={{
                                background: "#ffffff",
                                borderColor: "var(--border-subtle)",
                                boxShadow: "0 12px 30px rgba(24,32,38,0.06)"
                            }}
                        >
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Still Have Questions?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Our support team is active 24/7 across live chat and email to assist you with any questions.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-extrabold text-white shadow-md transition-all"
                                    style={{ background: "var(--gradient)" }}
                                >
                                    Get in Touch <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="/faq"
                                    className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-extrabold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                                >
                                    View Full FAQ
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </main>
    );
}

