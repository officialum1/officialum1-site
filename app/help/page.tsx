"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function HelpCenter() {
    const [articles, setArticles] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

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

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '3rem', marginBottom: '1rem' }}>How can we help? 👋</h1>
                    <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
                        <input
                            placeholder="Search help articles..."
                            className="input-field"
                            style={{ width: '100%', padding: '1.2rem', paddingLeft: '3rem', borderRadius: '50px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>🔍</span>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center">Loading...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {filtered.map(article => (
                            <div key={article.id} className="glass" style={{ padding: '2rem', borderRadius: '24px', cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => window.location.href = `/help/${article.slug}`}>
                                <div style={{ fontSize: '0.9rem', color: '#00c3ff', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                    {article.category}
                                </div>
                                <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>{article.title}</h3>
                                <p style={{ color: '#888', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {article.content.substring(0, 150)}...
                                </p>
                                <div style={{ marginTop: '1.5rem', color: '#00ff88', fontWeight: 'bold', fontSize: '0.9rem' }}>Read Article →</div>
                            </div>
                        ))}
                    </div>
                )}

                {filtered.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
                        No articles found. need personal help? <a href="/contact" style={{ color: '#00ff88' }}>Contact Support</a>
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}
