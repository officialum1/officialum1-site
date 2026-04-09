import { query } from "@/lib/db";
export const dynamic = "force-dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "OfficialUM1 Knowledge Base | Help & Tutorials",
    description: "Learn how to use OfficialUM1, secure your accounts, and maximize your earnings with our comprehensive guides.",
    keywords: "OfficialUM1 help, account security, cheap account guide, instant delivery faq",
};

export default async function KBIndexPage() {
    // "Get Mixed" - Randomize public list order for SEO freshness and dynamic feel
    let articles: any[] = [];
    try {
        articles = await query("SELECT * FROM knowledge_base WHERE is_published = 1 ORDER BY RAND()") as any[];
    } catch (error) {
        console.error("Failed to load knowledge base index:", error);
    }

    // Group by category
    const categories: { [key: string]: any[] } = {};
    articles.forEach(art => {
        const cat = art.category || 'General';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(art);
    });

    return (
        <main style={{ background: 'var(--background)', minHeight: '100vh', color: '#fff' }}>
            <Navbar />

            <div style={{ paddingTop: '150px', paddingBottom: '100px' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem' }}>Knowledge <span className="text-gradient">Base</span></h1>
                        <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>Everything you need to know about our products and services.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {Object.entries(categories).map(([cat, arts]) => (
                            <div key={cat} className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h2 style={{ fontSize: '1.5rem', color: '#00ff88', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    📁 {cat}
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {arts.map(art => (
                                        <Link
                                            key={art.id}
                                            href={`/kb/${art.slug}`}
                                            style={{ color: '#eee', textDecoration: 'none', fontSize: '1rem', transition: '0.2s' }}
                                            className="kb-link"
                                        >
                                            → {art.title}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />

            <style dangerouslySetInnerHTML={{
                __html: `
                .kb-link:hover { color: #00ff88 !important; transform: translateX(5px); }
                .kb-link { display: inline-block; }
            ` }} />
        </main>
    );
}
