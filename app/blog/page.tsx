"use client";

import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PageHero } from '@/components/ui/PageHero';
import { PenLine } from 'lucide-react';

export default function BlogPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/blogs')
            .then(res => res.json())
            .then(data => {
                setPosts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load posts", err);
                setLoading(false);
            });
    }, []);

    const featuredPost = posts[0];
    const otherPosts = posts.slice(1);

    return (
        <main>
            <Navbar />

            {/* HERO */}
            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Blog' }]}
                    label="Blog"
                    title="Official Insights"
                    description="Expert analysis on scaling businesses, mastering SEO, and leveraging digital assets for maximum ROI."
                />

                <section style={{ paddingBottom: '96px' }}>
                    <div className="container">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--muted)' }}>Loading articles...</div>
                    ) : (
                        <>
                            {/* FEATURED POST */}
                            {featuredPost && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6 }}
                                    style={{ marginBottom: '5rem' }}
                                >
                                    <Link href={`/blog/${featuredPost.slug || featuredPost.id}`} style={{ textDecoration: 'none' }}>
                                        <div className="card" style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                            gap: '0',
                                            borderRadius: '40px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                height: '450px',
                                                backgroundImage: `url(${featuredPost.image || 'https://officialum1.com/logo.jpg'})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                position: 'relative'
                                            }}>
                                                <div className="badge" style={{ position: 'absolute', top: '2rem', left: '2rem' }}>
                                                    FEATURED
                                                </div>
                                            </div>
                                            <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                    {featuredPost.category} • {featuredPost.read_time || '5 min'} read
                                                </div>
                                                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--fg)', marginBottom: '1.5rem', lineHeight: '1.2' }}>{featuredPost.title}</h2>
                                                <p style={{ color: 'var(--muted)', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '2.5rem' }}>{featuredPost.excerpt}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--indigo)', fontWeight: '800' }}>
                                                    Read the breakdown <span aria-hidden>→</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            )}

                            {/* OTHER POSTS GRID */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2.5rem' }}>
                                {otherPosts.map((post, i) => (
                                    <motion.article
                                        key={post.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        viewport={{ once: true }}
                                        style={{ display: 'flex' }}
                                    >
                                        <Link href={`/blog/${post.slug || post.id}`} style={{ textDecoration: 'none', width: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <div className="card card-hover" style={{
                                                flex: 1,
                                                borderRadius: '32px',
                                                overflow: 'hidden',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                transition: '0.4s'
                                            }}>
                                                <div style={{
                                                    height: '220px',
                                                    backgroundImage: `url(${post.image || 'https://officialum1.com/logo.jpg'})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center'
                                                }}></div>
                                                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--indigo)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>
                                                        {post.category}
                                                    </div>
                                                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--fg)', marginBottom: '1rem', lineHeight: '1.3' }}>{post.title}</h3>
                                                    <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem', flex: 1 }}>{post.excerpt}</p>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.2rem' }}>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{post.read_time || '5 min'} read</span>
                                                        <span style={{ color: 'var(--indigo)', fontWeight: '800', fontSize: '0.85rem' }}>Read More →</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.article>
                                ))}
                            </div>

                            {posts.length === 0 && (
                                <div className="card" style={{ textAlign: 'center', padding: '72px 0', borderStyle: 'dashed' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--muted)' }}>
                                        <PenLine size={40} />
                                    </div>
                                    <h3 style={{ color: 'var(--muted)' }}>Check back soon for new articles.</h3>
                                </div>
                            )}
                        </>
                    )}
                    </div>
                </section>
            </div>

            <style jsx global>{`
                .card-hover:hover {
                    transform: translateY(-10px);
                    border-color: rgba(79, 70, 229, 0.25) !important;
                }
                @media (max-width: 768px) {
                    section { padding: 80px 0 40px !important; }
                    .container { padding: 0 20px !important; }
                    h1 { font-size: 2.5rem !important; }
                    .card { padding: 2rem !important; border-radius: 20px !important; }
                    .card > div:first-child { height: 250px !important; }
                    h2 { font-size: 1.8rem !important; }
                    p { font-size: 0.95rem !important; }
                }
            `}</style>
            <Footer />
        </main>
    );
}
