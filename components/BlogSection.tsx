"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { readJson } from "@/lib/read-json";
import staticPosts from "@/data/posts.json";

export default function BlogSection() {
    const [posts, setPosts] = useState<any[]>(staticPosts || []);

    useEffect(() => {
        fetch('/api/blogs')
            .then(res => readJson<any[]>(res))
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setPosts(data);
                }
            })
            .catch(() => {});
    }, []);

    const displayPosts = (posts && posts.length > 0 ? posts : staticPosts).slice(0, 3);

    return (
        <section id="blog" className="section-padding" style={{ background: "var(--bg-section-alt, #fafbfc)" }}>
            <div className="container">
                <div style={{ textAlign: "center", marginBottom: '3.5rem' }}>
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.4rem 1rem",
                        borderRadius: "999px",
                        background: "rgba(20, 108, 120, 0.08)",
                        color: "var(--color-primary, #146c78)",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: "1rem"
                    }}>
                        Latest Insights & SEO Blueprints
                    </div>
                    <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)", fontWeight: 800, color: "var(--text-primary)" }}>
                        Master <span className="text-gradient">Performance & Growth</span>
                    </h2>
                    <p className="subheading" style={{ maxWidth: "650px", margin: "1rem auto 0", color: "var(--text-muted)" }}>
                        Engineering case studies, speed optimization protocols, and search dominance strategies from the OfficialUM1 team.
                    </p>
                </div>

                <div className="grid-3" style={{ gap: "2rem" }}>
                    {displayPosts.map((post: any) => {
                        const postLink = `/blog/${post.slug || post.id}`;
                        return (
                            <article
                                key={post.id || post.slug}
                                className="card"
                                style={{
                                    padding: 0,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: '16px',
                                    border: '1px solid var(--border-subtle, rgba(0,0,0,0.08))',
                                    background: '#ffffff',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                                    transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                                }}
                            >
                                <div style={{ height: '210px', background: '#182026', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundImage: `url(${post.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800'})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        transition: 'transform 0.4s ease'
                                    }}></div>
                                    <div style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        background: 'rgba(24, 32, 38, 0.85)',
                                        backdropFilter: 'blur(8px)',
                                        padding: '0.35rem 0.85rem',
                                        borderRadius: '50px',
                                        fontSize: '0.78rem',
                                        fontWeight: 600,
                                        color: '#ffffff'
                                    }}>
                                        {post.category || 'SEO & Engineering'}
                                    </div>
                                </div>

                                <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted, #718096)', marginBottom: '0.75rem' }}>
                                        <span>{post.date || 'Sep 2026'}</span>
                                        <span>{post.readTime || post.read_time || '7 min read'}</span>
                                    </div>

                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.85rem', lineHeight: 1.45, fontWeight: 700 }}>
                                        <Link href={postLink} style={{ color: 'var(--text-primary, #182026)', textDecoration: 'none' }} className="hover:text-primary">
                                            {post.title}
                                        </Link>
                                    </h3>

                                    <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-muted, #556987)', marginBottom: '1.5rem', flex: 1 }}>
                                        {post.excerpt}
                                    </p>

                                    <Link
                                        href={postLink}
                                        style={{
                                            fontWeight: 700,
                                            fontSize: '0.95rem',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            color: 'var(--color-primary, #146c78)',
                                            textDecoration: 'none',
                                            marginTop: 'auto'
                                        }}
                                    >
                                        Read Complete Guide <span style={{ transition: 'transform 0.2s ease' }}>→</span>
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </div>

                <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
                    <Link
                        href="/blog"
                        className="btn"
                        style={{
                            borderRadius: '999px',
                            padding: '0.85rem 2.75rem',
                            border: '1.5px solid var(--border-subtle, #e2e8f0)',
                            background: '#ffffff',
                            color: 'var(--text-primary, #182026)',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
                        }}
                    >
                        Browse All Articles & Tutorials →
                    </Link>
                </div>
            </div>
        </section>
    );
}
