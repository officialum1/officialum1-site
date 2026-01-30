"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function HelpCenter() {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/kb')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setArticles(data);
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

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        How can we help?
                    </h1>
                    <div className="glass" style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', padding: '0.5rem 1.5rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ fontSize: '1.2rem', marginRight: '1rem' }}>🔍</span>
                        <input
                            className="bg-transparent border-none text-white w-full focus:outline-none"
                            placeholder="Search for answers..."
                            style={{ fontSize: '1.1rem', height: '50px' }}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center">Loading...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {Object.keys(grouped).map(category => (
                            <div key={category} className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#00ff88', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                                    {category}
                                </h2>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {grouped[category].map((a: any) => (
                                        <li key={a.id} style={{ marginBottom: '1rem' }}>
                                            <Link href={`/help/${a.slug}`} className="hover:text-green-400 transition-colors" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>📄 {a.title}</span>
                                                <span className="text-gray-600">→</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {/* Contact Support CTA */}
                <div style={{ marginTop: '5rem', textAlign: 'center' }}>
                    <p style={{ color: '#888', marginBottom: '1rem' }}>Can't find what you're looking for?</p>
                    <Link href="/contact" className="btn btn-outline">Contact Support</Link>
                </div>
            </div>
            <Footer />
        </main>
    );
}
