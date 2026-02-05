import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Metadata } from "next";

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
        }
    };
}

export default async function KBArticlePage({ params }: Props) {
    const { slug } = await params;
    const articles = await query("SELECT * FROM knowledge_base WHERE slug = ?", [slug]) as any[];
    if (articles.length === 0) notFound();

    const art = articles[0];

    // Increment views
    await query("UPDATE knowledge_base SET views = views + 1 WHERE id = ?", [art.id]);

    return (
        <main style={{ background: '#030305', minHeight: '100vh', color: '#fff' }}>
            <Navbar />

            <div style={{ paddingTop: '150px', paddingBottom: '100px' }}>
                <div className="container" style={{ maxWidth: '800px' }}>
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

                    <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.2' }}>
                        {art.title}
                    </h1>

                    <div style={{ display: 'flex', gap: '2rem', color: '#666', fontSize: '0.9rem', marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
                        <span>Published: {new Date(art.created_at).toLocaleDateString()}</span>
                        <span>Views: {art.views + 1}</span>
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

                    <div style={{ marginTop: '5rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3>Need more help?</h3>
                        <p>If this article didn't answer your question, feel free to contact our professional support team.</p>
                        <a href="/contact" className="btn btn-primary" style={{ marginTop: '1rem' }}>Contact Support</a>
                    </div>
                </div>
            </div>

            <Footer />

            <style dangerouslySetInnerHTML={{
                __html: `
                .kb-content h2 { color: #fff; font-size: 1.8rem; margin-top: 2.5rem; margin-bottom: 1.2rem; }
                .kb-content p { margin-bottom: 1.5rem; }
                .kb-content ul, .kb-content ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
                .kb-content li { margin-bottom: 0.8rem; }
                .kb-content strong { color: #00ff88; }
            `}} />
        </main>
    );
}
