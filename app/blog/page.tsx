"use client";

import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from 'next/link';
import { motion } from 'framer-motion';

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
        <main style={{ background: '#030305', minHeight: '100vh', color: '#fff' }}>
            <Navbar />

            {/* HERO */}
            <section style={{
                padding: '180px 0 80px',
                background: 'radial-gradient(circle at 10% 20%, rgba(255, 68, 68, 0.05) 0%, transparent 50%)'
            }}>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ maxWidth: '800px' }}
                    >
                        <span style={{ color: '#ff4444', textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.8rem', fontWeight: '800' }}>Official Insights</span>
                        <h1 style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: '900', margin: '1rem 0', letterSpacing: '-2px' }}>
                            The Digital <span style={{ color: '#ff4444' }}>Pulse.</span>
                        </h1>
                        <p style={{ fontSize: '1.2rem', color: '#94a3b8', lineHeight: '1.8' }}>
                            Expert analysis on scaling businesses, mastering SEO, and leveraging digital assets for maximum ROI.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section style={{ paddingBottom: '150px' }}>
                <div className="container">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '100px 0', color: '#666' }}>Loading articles...</div>
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
                                    <Link href={`/blog/${featuredPost.id}`} style={{ textDecoration: 'none' }}>
                                        <div className="glass" style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                            gap: '0',
                                            borderRadius: '40px',
                                            overflow: 'hidden',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            background: 'rgba(255,255,255,0.01)'
                                        }}>
                                            <div style={{
                                                height: '450px',
                                                backgroundImage: `url(${featuredPost.image || 'https://officialum1.com/logo.jpg'})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                position: 'relative'
                                            }}>
                                                <div style={{ position: 'absolute', top: '2rem', left: '2rem', background: '#ff4444', color: '#fff', padding: '0.5rem 1.2rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '800' }}>
                                                    FEATURED
                                                </div>
                                            </div>
                                            <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                    {featuredPost.category} • {featuredPost.read_time || '5 min'} read
                                                </div>
                                                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', marginBottom: '1.5rem', lineHeight: '1.2' }}>{featuredPost.title}</h2>
                                                <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '2.5rem' }}>{featuredPost.excerpt}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#ff4444', fontWeight: '800' }}>
                                                    Read Massive Breakdown <span>→</span>
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
                                        <Link href={`/blog/${post.id}`} style={{ textDecoration: 'none', width: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <div className="glass card-hover" style={{
                                                flex: 1,
                                                borderRadius: '32px',
                                                overflow: 'hidden',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                background: 'rgba(255,255,255,0.02)',
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
                                                    <div style={{ fontSize: '0.75rem', color: '#ff4444', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>
                                                        {post.category}
                                                    </div>
                                                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', marginBottom: '1rem', lineHeight: '1.3' }}>{post.title}</h3>
                                                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem', flex: 1 }}>{post.excerpt}</p>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.2rem' }}>
                                                        <span style={{ fontSize: '0.8rem', color: '#4b5563' }}>{post.read_time || '5 min'} read</span>
                                                        <span style={{ color: '#ff4444', fontWeight: '800', fontSize: '0.85rem' }}>Read More →</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.article>
                                ))}
                            </div>

                            {posts.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '100px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '32px' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✍️</div>
                                    <h3 style={{ color: '#64748b' }}>Check back soon for new articles.</h3>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            <style jsx global>{`
                .card-hover:hover {
                    transform: translateY(-10px);
                    border-color: rgba(255, 68, 68, 0.3) !important;
                    background: rgba(255, 255, 255, 0.04) !important;
                }
            `}</style>
            <Footer />
        </main>
    );
}
