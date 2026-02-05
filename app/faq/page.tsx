"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

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
                if (Array.isArray(data)) setArticles(data);
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

    return (
        <main style={{ background: '#030305', minHeight: '100vh', color: '#fff' }}>
            <Navbar />

            {/* HER0 SECTION */}
            <div style={{
                position: 'relative',
                padding: '200px 0 100px',
                textAlign: 'center',
                background: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 60%)',
                overflow: 'hidden'
            }}>
                <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: '800',
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(to bottom right, #fff, #94a3b8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.02em'
                    }} className="animate-up">
                        Focus on your game. <br /> We've got the answers.
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '3rem' }} className="animate-up">
                        Search our knowledge base for instant answers to your questions.
                    </p>

                    <div className="glass animate-up" style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '1rem 2rem',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(20px)'
                    }}>
                        <span style={{ fontSize: '1.5rem', color: '#666', marginRight: '1rem' }}>Search</span>
                        <input
                            style={{
                                background: 'transparent',
                                border: 'none',
                                width: '100%',
                                color: '#fff',
                                fontSize: '1.2rem',
                                outline: 'none'
                            }}
                            placeholder="How to redeem..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* CATEGORY TABS */}
            <div className="container" style={{ marginBottom: '3rem', overflowX: 'auto', display: 'flex', gap: '1rem', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
                {categories.map(cat => (
                    <button
                        key={cat as string}
                        onClick={() => setActiveCategory(cat as string)}
                        style={{
                            padding: '0.8rem 1.5rem',
                            borderRadius: '50px',
                            background: activeCategory === cat ? '#fff' : 'rgba(255,255,255,0.05)',
                            color: activeCategory === cat ? '#000' : '#888',
                            border: 'none',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {cat as string}
                    </button>
                ))}
            </div>

            {/* FAQ CARDS */}
            <div className="container" style={{ paddingBottom: '100px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', color: '#666' }}>Loading...</div>
                ) : (
                    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gap: '1.5rem' }}>
                        {filtered.length > 0 ? filtered.map((item) => (
                            <div
                                key={item.id}
                                className="glass"
                                style={{
                                    padding: '0',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    background: 'rgba(255,255,255,0.02)'
                                }}
                            >
                                <button
                                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '1.5rem 2rem',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#fff',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div>
                                        <span style={{
                                            fontSize: '0.8rem',
                                            color: '#00ff88',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            marginBottom: '0.5rem',
                                            display: 'block'
                                        }}>
                                            {item.category}
                                        </span>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: '600', margin: 0 }}>{item.title}</h3>
                                    </div>
                                    <span style={{
                                        fontSize: '1.5rem',
                                        color: '#666',
                                        transform: expandedId === item.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: '0.3s'
                                    }}>
                                        ⌄
                                    </span>
                                </button>

                                {expandedId === item.id && (
                                    <div style={{
                                        padding: '0 2rem 2rem 2rem',
                                        color: '#ccc',
                                        lineHeight: '1.8',
                                        borderTop: '1px solid rgba(255,255,255,0.05)',
                                        marginTop: '0.5rem',
                                        paddingTop: '1.5rem'
                                    }}>
                                        <div dangerouslySetInnerHTML={{ __html: item.content }} />
                                        <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                                            <Link href={`/kb/${item.slug}`} style={{ color: '#00ff88', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                📖 View Full SEO Page →
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                                <p>No articles found matching "{search}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
