import { query } from '@/lib/db';
export const dynamic = "force-dynamic";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
    params: Promise<{ slug: string }>;
}

// SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const rows: any = await query("SELECT title, content, meta_description, keywords FROM knowledge_base WHERE slug = ? AND is_published = 1", [slug]);
    if (rows.length === 0) return { title: 'Article Not Found' };

    const article = rows[0];
    const excerpt = article.content.substring(0, 160).replace(/<[^>]*>?/gm, ''); // Fallback

    return {
        title: `${article.title} - OfficialUM1 Help`,
        description: article.meta_description || excerpt,
        keywords: article.keywords ? article.keywords.split(',') : [],
        openGraph: {
            title: article.title,
            description: article.meta_description || excerpt,
            type: 'article',
        }
    };
}

export default async function ArticlePage({ params }: Props) {
    const { slug } = await params;
    const rows: any = await query("SELECT * FROM knowledge_base WHERE slug = ? AND is_published = 1", [slug]);

    if (rows.length === 0) {
        return notFound();
    }

    const article = rows[0];

    // Increment views (Non-blocking)
    await query("UPDATE knowledge_base SET views = views + 1 WHERE id = ?", [article.id]);

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px', maxWidth: '800px' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <Link href="/help" className="text-gray-500 hover:text-white transition-colors">← Back to Help Center</Link>
                </div>

                <article className="glass FadeIn" style={{ padding: '3rem', borderRadius: '30px' }}>
                    <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' }}>
                        <span style={{
                            background: 'rgba(0,195,255,0.1)', color: '#00c3ff',
                            padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold'
                        }}>
                            {article.category}
                        </span>
                        <h1 style={{ fontSize: '2.5rem', marginTop: '1rem', lineHeight: 1.2 }}>{article.title}</h1>
                        <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
                            Last updated: {new Date(article.created_at).toLocaleDateString()} • {article.views} views
                        </div>
                    </div>

                    <div
                        className="prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                        style={{ lineHeight: 1.8, fontSize: '1.1rem', color: '#ddd' }}
                    />
                </article>

                <div style={{ marginTop: '3rem', textAlign: 'center', color: '#666', padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ marginBottom: '1rem' }}>Was this article helpful?</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn btn-outline" style={{ borderColor: '#333' }}>👍 Yes</button>
                        <button className="btn btn-outline" style={{ borderColor: '#333' }}>👎 No</button>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
