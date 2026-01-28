"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useParams } from 'next/navigation';

export default function ArticlePage() {
    const params = useParams(); // { slug: string } - Note: File path should be [slug] not [id] if using slug
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.slug) {
            fetch(`/api/kb?slug=${params.slug}`)
                .then(res => res.json())
                .then(data => {
                    if (data.id) setArticle(data);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [params]);

    if (loading) return <div className="container" style={{ paddingTop: '150px' }}>Loading...</div>;
    if (!article) return <div className="container" style={{ paddingTop: '150px' }}>Article not found</div>;

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px', maxWidth: '800px' }}>
                <a href="/help" style={{ color: '#888', marginBottom: '1rem', display: 'inline-block' }}>← Back to Help Center</a>

                <div className="glass" style={{ padding: '3rem', borderRadius: '30px' }}>
                    <div style={{ color: '#00c3ff', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        {article.category}
                    </div>
                    <h1 style={{ fontSize: '3rem', marginBottom: '2rem', lineHeight: '1.2' }}>{article.title}</h1>

                    <div style={{ lineHeight: '1.8', color: '#ddd', fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
                        {article.content}
                    </div>

                    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', color: '#666', fontSize: '0.9rem', display: "flex", justifyContent: "space-between" }}>
                        <span>Last updated: {new Date(article.created_at).toLocaleDateString()}</span>
                        <span>{article.views} views</span>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
