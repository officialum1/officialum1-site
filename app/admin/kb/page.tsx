"use client";

import { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import { AdminShell } from '@/components/admin/AdminShell';

export default function KnowledgeBaseAdmin() {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [form, setForm] = useState({
        title: '',
        slug: '',
        category: 'General',
        content: '',
        is_published: true
    });

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const res = await fetch('/api/kb?admin=true'); // admin=true to get all
            const data = await res.json();
            if (Array.isArray(data)) setArticles(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingId ? 'PUT' : 'POST';
        const body = { ...form, id: editingId };

        try {
            const res = await fetch('/api/kb', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                alert(editingId ? "Updated!" : "Created!");
                setShowModal(false);
                setForm({ title: '', slug: '', category: 'General', content: '', is_published: true });
                setEditingId(null);
                fetchArticles();
            } else {
                alert("Failed to save.");
            }
        } catch { alert("Error saving."); }
    };

    const handleEdit = (article: any) => {
        setForm({
            title: article.title,
            slug: article.slug,
            category: article.category,
            content: article.content,
            is_published: !!article.is_published
        });
        setEditingId(article.id);
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this article?")) return;
        try {
            const res = await fetch(`/api/kb?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchArticles();
        } catch { alert("Delete failed"); }
    };

    // Auto-generate slug from title if empty
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setForm(prev => ({
            ...prev,
            title,
            slug: !editingId && !prev.slug ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : prev.slug
        }));
    };

    if (loading) return <div className="container" style={{ paddingTop: '150px' }}>Loading...</div>;

    return (
        <AdminShell title="Knowledge Base" subtitle="Create and manage FAQ / KB articles.">
            <a href="/admin/dashboard" className="btn-ghost" style={{ marginBottom: '1rem', display: 'inline-flex' }}>← Back to Dashboard</a>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '2.2rem' }}>Knowledge Base</h1>
                <button onClick={() => { setShowModal(true); setEditingId(null); setForm({ title: '', slug: '', category: 'General', content: '', is_published: true }); }} className="btn-primary">
                    + New Article
                </button>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#888' }}>
                                <th style={{ padding: '1rem' }}>Title</th>
                                <th style={{ padding: '1rem' }}>Category</th>
                                <th style={{ padding: '1rem' }}>Views</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map(a => (
                                <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 'bold' }}>{a.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>/{a.slug}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{a.category}</td>
                                    <td style={{ padding: '1rem' }}>{a.views}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                            background: a.is_published ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.1)',
                                            color: a.is_published ? '#00ff88' : '#888'
                                        }}>
                                            {a.is_published ? 'PUBLISHED' : 'DRAFT'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button onClick={() => handleEdit(a)} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', marginRight: '0.5rem' }}>Edit</button>
                                        <button onClick={() => handleDelete(a.id)} className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', color: '#b91c1c' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)', padding: '2rem'
                }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '800px', padding: '2.5rem', borderRadius: '24px', position: 'relative', border: '1px solid #00c3ff', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                        <h2 style={{ marginBottom: '1.5rem' }}>{editingId ? 'Edit Article' : 'New Article'}</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-1 text-sm text-gray-400">Title</label>
                                <input className="input-field w-full" value={form.title} onChange={handleTitleChange} required placeholder="How to buy?" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-sm text-gray-400">Slug (URL)</label>
                                    <input className="input-field w-full" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required placeholder="how-to-buy" />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm text-gray-400">Category</label>
                                    <select className="input-field w-full" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        <option>General</option>
                                        <option>Payments</option>
                                        <option>Account Issues</option>
                                        <option>Netflix</option>
                                        <option>Spotify</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm text-gray-400">Content (HTML allowed)</label>
                                <textarea className="input-field w-full h-64 font-mono" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} />
                                    <span>Published</span>
                                </label>
                            </div>
                            <button type="submit" className="btn btn-primary w-full">{editingId ? 'Save Changes' : 'Create Article'}</button>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </AdminShell>
    );
}
