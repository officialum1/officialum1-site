"use client";

import { useState, useEffect } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';

export default function BlogManager() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [topic, setTopic] = useState('');

    useEffect(() => {
        // Auth Check
        const rawUser = localStorage.getItem('buyer_user');
        try {
            const user = rawUser ? JSON.parse(rawUser) : null;
            if (!user || (user.role !== 'admin' && user.role !== 'seller')) {
                window.location.href = '/admin/login';
                return;
            }
        } catch (e) {
            window.location.href = '/admin/login';
            return;
        }
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const res = await fetch('/api/blogs');
            const data = await res.json();
            if (Array.isArray(data)) setBlogs(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!topic) return alert("Please enter a topic");
        setGenerating(true);
        try {
            const res = await fetch('/api/admin/generate-blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Blog "${data.title}" generated successfully!`);
                setTopic('');
                fetchBlogs();
            } else {
                alert("Error: " + data.error);
            }
        } catch (e) {
            alert("Generation failed");
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this blog?")) return;
        // In a real app, implement DELETE /api/blogs endpoint.
        // For now, minimal.
        alert("Delete functionality to be implemented in API.");
    };

    if (loading) return <div className="container" style={{ paddingTop: '150px' }}>Loading...</div>;

    return (
        <AdminShell title="Blogs" subtitle="Generate and manage published articles.">

                {/* GENERATOR */}
                <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>AI Article Generator</h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            placeholder="Enter a topic (e.g. 'Benefits of Verified Accounts')"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            className="input"
                            style={{ flex: 1 }}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="btn-primary"
                        >
                            {generating ? 'Generating...' : 'Generate Article'}
                        </button>
                    </div>
                    <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#888' }}>
                        Powered by Google Gemini 2.5 Flash with OpenAI fallback. Generates SEO-optimized content automatically.
                    </p>
                </div>

                {/* LIST */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Published Articles</h3>
                    {blogs.length === 0 ? (
                        <p style={{ color: '#666' }}>No blogs found. Try generating one!</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {blogs.map(blog => (
                                <div key={blog.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{blog.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(blog.date || Date.now()).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <a href={`/blog/${blog.id}`} target="_blank" className="btn-secondary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>View</a>
                                        {/* <button onClick={() => handleDelete(blog.id)} className="btn btn-outline" style={{ padding: '0.5rem', borderColor: '#ff4d4d', color: '#ff4d4d' }}>Delete</button> */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
        </AdminShell>
    );
}
