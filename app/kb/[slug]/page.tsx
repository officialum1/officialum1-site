import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const articles = await query("SELECT title, meta_description, keywords FROM knowledge_base WHERE slug = ?", [slug]) as any[];
    if (articles.length === 0) return { title: 'Article Not Found' };

    const art = articles[0];
    return {
        title: `${art.title} | OfficialUM1 Knowledge Base`,
        description: art.meta_description,
        keywords: art.keywords,
        openGraph: {
            title: art.title,
            description: art.meta_description,
            type: 'article',
            url: `https://officialum1.com/kb/${slug}`,
            images: ['https://officialum1.com/logo.jpg']
        },
        twitter: {
            card: 'summary_large_image',
            title: art.title,
            description: art.meta_description,
        }
    };
}

export default async function KBArticlePage({ params }: Props) {
    const { slug } = await params;
    const articles = await query("SELECT * FROM knowledge_base WHERE slug = ?", [slug]) as any[];
    if (articles.length === 0) notFound();

    const art = articles[0];

    // Related Articles
    const related = await query("SELECT title, slug FROM knowledge_base WHERE category = ? AND id != ? LIMIT 3", [art.category, art.id]) as any[];

    // Increment views
    await query("UPDATE knowledge_base SET views = views + 1 WHERE id = ?", [art.id]);

    // Article Schema
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": art.title,
        "description": art.meta_description,
        "author": {
            "@type": "Organization",
            "name": "OfficialUM1"
        },
        "publisher": {
            "@type": "Organization",
            "name": "OfficialUM1",
            "logo": {
                "@type": "ImageObject",
                "url": "https://officialum1.com/logo.jpg"
            }
        },
        "datePublished": art.created_at,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://officialum1.com/kb/${slug}`
        }
    };

    return (
        <main style={{ background: 'var(--background)', minHeight: '100vh', color: '#fff' }}>
            <Navbar />

            <Script
                id="kb-article-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />

            <div style={{ paddingTop: '150px', paddingBottom: '100px' }}>
                <div className="container" style={{ maxWidth: '800px' }}>

                    {/* BREADCRUMBS */}
                    <div style={{ marginBottom: '2rem', fontSize: '0.85rem', color: '#666' }}>
                        <Link href="/" style={{ color: '#666' }}>Home</Link> /
                        <Link href="/kb" style={{ color: '#666', margin: '0 5px' }}>Knowledge Base</Link> /
                        <span style={{ color: '#00ff88', marginLeft: '5px' }}>{art.title}</span>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <span style={{
                            color: '#00ff88',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            background: 'rgba(0, 255, 136, 0.1)',
                            padding: '4px 12px',
                            borderRadius: '10px'
                        }}>
                            {art.category}
                        </span>
                    </div>

                    <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.2', fontFamily: 'var(--font-outfit)' }}>
                        {art.title}
                    </h1>

                    <div style={{ display: 'flex', gap: '2rem', color: '#666', fontSize: '0.9rem', marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
                        <span>Published: {new Date(art.created_at || Date.now()).toLocaleDateString()}</span>
                        <span>Views: {(art.views || 0) + 1241}</span>
                    </div>

                    <div
                        className="kb-content"
                        style={{
                            color: '#ccc',
                            fontSize: '1.15rem',
                            lineHeight: '1.8',
                        }}
                        dangerouslySetInnerHTML={{ __html: art.content }}
                    />

                    {/* RELATED ARTICLES */}
                    {related.length > 0 && (
                        <div style={{ marginTop: '5rem', borderTop: '2px solid rgba(0,255,136,0.1)', paddingTop: '3rem' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>📖 More Useful Guides</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                {related.map(r => (
                                    <Link key={r.slug} href={`/kb/${r.slug}`} className="glass" style={{ padding: '1.5rem', borderRadius: '15px', color: '#eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.3s' }}>
                                        {r.title}
                                        <span style={{ color: '#00ff88' }}>→</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '4rem', padding: '2.5rem', background: 'rgba(0, 255, 136, 0.03)', borderRadius: '24px', border: '1px solid rgba(0, 255, 136, 0.1)', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>Need personalized help?</h3>
                        <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>If this guide didn't resolve your issue, our specialized 24/7 support agents are ready to assist you instantly.</p>
                        <a href="/contact" className="btn btn-primary" style={{ padding: '1rem 3rem' }}>Contact Official Support</a>
                    </div>
                </div>
            </div>

            <Footer />

            <style dangerouslySetInnerHTML={{
                __html: `
                .kb-content h2 { color: #fff; font-size: 2rem; margin-top: 3rem; margin-bottom: 1.5rem; font-weight: 700; border-left: 4px solid #00ff88; padding-left: 1rem; }
                .kb-content p { margin-bottom: 1.5rem; }
                .kb-content ul, .kb-content ol { margin-bottom: 2rem; padding-left: 2rem; }
                .kb-content li { margin-bottom: 1rem; }
                .kb-content strong { color: #00ff88; }
                .kb-content a { color: #00ff88 !important; text-decoration: underline; }
                .glass:hover { transform: translateX(10px); background: rgba(0,255,136,0.05); }
            `}} />
        </main>
    );
}
