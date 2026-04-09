"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function BlogSection() {
    const [posts, setPosts] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/blogs')
            .then(res => res.json())
            .then(data => setPosts(data))
            .catch(err => console.error("Failed to load posts", err));
    }, []);

    return (
        <section id="blog" className="section-padding">
            <div className="container">
                <div style={{ textAlign: "center", marginBottom: '4rem' }}>
                    <h2>Latest <span className="text-gradient">Insights</span></h2>
                    <p className="subheading">
                        Expert advice on digital marketing, SEO, and web development to keep you ahead of the curve.
                    </p>
                </div>

                <div className="grid-3">
                    {posts.slice(0, 3).map((post) => (
                        <article key={post.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: '200px', background: '#222', position: 'relative' }}>
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundImage: `url(${post.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}></div>
                                <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.7)', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', color: 'white' }}>
                                    {post.category}
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                    <span>{post.date}</span>
                                    <span>{post.readTime}</span>
                                </div>

                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                                    <Link href={`/blog/${post.id}`} style={{ transition: 'color 0.2s' }} className="hover:text-primary">
                                        {post.title}
                                    </Link>
                                </h3>

                                <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1 }}>
                                    {post.excerpt}
                                </p>

                                <Link href={`/blog/${post.id}`} className="text-gradient" style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Read Article <span>→</span>
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <Link href="/blog" className="btn btn-outline" style={{ borderRadius: '50px', padding: '0.8rem 2.5rem' }}>
                        View All Articles
                    </Link>
                </div>
            </div>
        </section>
    );
}
