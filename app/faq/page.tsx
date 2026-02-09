"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQPage() {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        fetch('/api/kb')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Inject system FAQs if DB is empty or as additional items
                    const systemFaqs = [
                        { id: 999, category: 'General', title: 'How long does delivery take?', content: 'Digital account details are delivered instantly to your dashboard and email. Custom services typically take 24-48 hours depending on complexity.' },
                        { id: 998, category: 'Payments', title: 'What payment methods do you accept?', content: 'We accept Credit/Debit Cards (Stripe), Binance Pay, and various Cryptocurrencies through Cryptomus for secure, global transactions.' },
                        { id: 997, category: 'Security', title: 'What is the "Verified Pro" program?', content: 'Our verification program ensures a safe marketplace. Once you verify your identity with a valid ID and selfie, you gain access to premium high-value assets.' },
                        { id: 996, category: 'Warranty', title: 'Do you offer replacements?', content: 'Yes, we provide a 24-hour warranty on all digital assets. If the credentials are invalid upon arrival, we replace them instantly.' }
                    ];
                    // Merge system FAQs with DB articles
                    const merged = [...systemFaqs, ...data];
                    // Remove duplicates by title
                    const unique = merged.filter((v, i, a) => a.findIndex(t => (t.title === v.title)) === i);
                    setArticles(unique);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const categories = ['All', ...Array.from(new Set(articles.map(a => a.category))).filter(c => c)];

    const filtered = articles.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    // Generate JSON-LD for SEO
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": filtered.slice(0, 10).map(item => ({
            "@type": "Question",
            "name": item.title,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.content.replace(/<[^>]*>?/gm, '')
            }
        }))
    };

    return (
        <main style={{ background: '#030305', minHeight: '100vh', color: '#fff', overflowX: 'hidden' }}>
            <Navbar />

            {/* Structured Data for Google Indexing */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            {/* HERO SECTION */}
            <section style={{
                position: 'relative',
                padding: '180px 0 100px',
                textAlign: 'center',
                background: 'radial-gradient(circle at 50% 20%, rgba(255, 68, 68, 0.1) 0%, transparent 60%)',
            }}>
                <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                            fontWeight: '900',
                            marginBottom: '1.5rem',
                            letterSpacing: '-2px'
                        }}
                    >
                        How can we <span style={{ color: '#ff4444' }}>help?</span>
                    </motion.h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '3rem' }}>
                        Search our knowledge base for instant answers or explore categories.
                    </p>

                    <div style={{
                        position: 'relative',
                        maxWidth: '600px',
                        margin: '0 auto',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '4px',
                        backdropFilter: 'blur(20px)'
                    }}>
                        <input
                            style={{
                                background: 'transparent',
                                border: 'none',
                                width: '100%',
                                color: '#fff',
                                padding: '1.2rem 1.5rem',
                                fontSize: '1.1rem',
                                outline: 'none'
                            }}
                            placeholder="Ask a question..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <div style={{
                            position: 'absolute',
                            right: '8px',
                            top: '8px',
                            bottom: '8px',
                            background: '#ff4444',
                            borderRadius: '18px',
                            width: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}>
                            🔍
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTENT SECTION */}
            <section style={{ paddingBottom: '150px' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '4rem' }}>

                    {/* SIDEBAR CATEGORIES */}
                    <aside style={{ position: 'sticky', top: '120px', height: 'fit-content' }}>
                        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#4b5563', letterSpacing: '2px', marginBottom: '1.5rem', fontWeight: '800' }}>Categories</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {categories.map(cat => (
                                <button
                                    key={cat as string}
                                    onClick={() => setActiveCategory(cat as string)}
                                    style={{
                                        textAlign: 'left',
                                        padding: '0.8rem 1.2rem',
                                        borderRadius: '12px',
                                        background: activeCategory === cat ? 'rgba(255,68,68,0.1)' : 'transparent',
                                        color: activeCategory === cat ? '#ff4444' : '#64748b',
                                        border: activeCategory === cat ? '1px solid rgba(255,68,68,0.2)' : '1px solid transparent',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: '0.3s'
                                    }}
                                >
                                    {cat as string}
                                </button>
                            ))}
                        </div>

                        <div style={{ marginTop: '4rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h5 style={{ marginBottom: '0.5rem' }}>Still need help?</h5>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Our team is available 24/7 to assist you.</p>
                            <Link href="/contact" style={{ display: 'block', textAlign: 'center', background: '#fff', color: '#000', padding: '0.8rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '800', textDecoration: 'none' }}> Contact Support </Link>
                        </div>
                    </aside>

                    {/* FAQ ITEMS */}
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', color: '#666', padding: '4rem' }}>Optimizing answers...</div>
                        ) : filtered.length > 0 ? (
                            filtered.map((item) => (
                                <div
                                    key={item.id}
                                    style={{
                                        borderRadius: '24px',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        background: expandedId === item.id ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                                        transition: '0.3s'
                                    }}
                                >
                                    <button
                                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '1.8rem 2.2rem',
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#fff',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                            <div style={{
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                background: expandedId === item.id ? '#ff4444' : 'rgba(255,255,255,0.1)'
                                            }}></div>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', margin: 0 }}>{item.title}</h3>
                                        </div>
                                        <span style={{
                                            fontSize: '1.2rem',
                                            color: '#4b5563',
                                            transform: expandedId === item.id ? 'rotate(45deg)' : 'rotate(0deg)',
                                            transition: '0.3s'
                                        }}>
                                            +
                                        </span>
                                    </button>

                                    <AnimatePresence>
                                        {expandedId === item.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div style={{
                                                    padding: '0 2.22rem 2.2rem 4.5rem',
                                                    color: '#94a3b8',
                                                    lineHeight: '1.8',
                                                    fontSize: '1.05rem'
                                                }}>
                                                    <div dangerouslySetInnerHTML={{ __html: item.content }} />

                                                    {item.slug && (
                                                        <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                                                            <Link href={`/kb/${item.slug}`} style={{ color: '#ff4444', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                Read Full Documentation <span>→</span>
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '100px 0', background: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔦</div>
                                <h3 style={{ color: '#fff' }}>No matches found</h3>
                                <p style={{ color: '#64748b' }}>Try different keywords or contact us for help.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
