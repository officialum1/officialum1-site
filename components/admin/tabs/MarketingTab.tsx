"use client";

import React, { useState, useEffect } from "react";
import { modernAlert, modernConfirm } from "@/components/ModernUIOverlay";

interface MarketingTabProps {
    marketingTab: string;
    setMarketingTab: (tab: string) => void;
    showAddPost: boolean;
    setShowAddPost: (show: boolean) => void;
    posts: any[];
    newPost: any;
    setNewPost: (post: any) => void;
    handleAddPost: (e: any) => Promise<void>;
    stats: any;
    userCount: number;
}

export default function MarketingTab({
    marketingTab,
    setMarketingTab,
    showAddPost,
    setShowAddPost,
    posts,
    newPost,
    setNewPost,
    handleAddPost,
    stats,
    userCount
}: MarketingTabProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiTopic, setAiTopic] = useState("");
    const [showNewsletter, setShowNewsletter] = useState(false);
    const [newsletterForm, setNewsletterForm] = useState({ subject: '', content: '' });
    const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);

    // Inventory Integration
    const [catalogItems, setCatalogItems] = useState<any[]>([]);
    const [loadingCatalog, setLoadingCatalog] = useState(false);

    // Fetch Products for Promotion
    useEffect(() => {
        const loadProducts = async () => {
            setLoadingCatalog(true);
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
                if (Array.isArray(data)) setCatalogItems(data);
            } catch (e) {
                console.error("Failed to load catalog for marketing", e);
            } finally {
                setLoadingCatalog(false);
            }
        };
        loadProducts();
    }, []);

    const handlePromoteItem = (item: any) => {
        const promoText = `🔥 MEGA DEAL ALERT! 🔥\n\n${item.name} is now available for just $${item.price}!\n\n${item.description ? item.description.substring(0, 100) + '...' : 'Instant Delivery. Best Price Guarantee.'}\n\n👉 Grab yours now at: https://officialum1.com/shop\n\n#OfficialUM1 #GamingDeals #${item.type || 'Gaming'} #Sale`;

        setNewPost({ ...newPost, content: promoText, platforms: ['All'] });
        setShowAddPost(true);
        modernAlert("Draft Created", `Ready to promote ${item.name}!`, "success");
    };

    const handleAIGenerate = async () => {
        if (!aiTopic) return modernAlert("Topic Required", "Please enter what you want to promote (e.g. Netflix Accounts Sale)", "error");
        setIsGenerating(true);
        try {
            const res = await fetch('/api/admin/generate-marketing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: aiTopic,
                    channel: newPost.platforms[0] || 'All',
                    tone: 'persuasive'
                })
            });
            const data = await res.json();
            if (data.content) {
                setNewPost({ ...newPost, content: data.content });
                setShowAddPost(true);
                modernAlert("AI Draft Ready", "The AI has generated a high-conversion draft for you.", "success");
            }
        } catch (e) {
            modernAlert("Generation Failed", "Could not connect to AI services. Check your settings.", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendNewsletter = async (e: React.FormEvent) => {
        e.preventDefault();
        const ok = await modernConfirm("Send Newsletter?", `This will broadcast to all subscribers. Continue?`);
        if (!ok) return;

        setIsSendingNewsletter(true);
        try {
            const res = await fetch('/api/admin/newsletter/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newsletterForm)
            });
            const data = await res.json();
            if (data.success) {
                modernAlert("Broadcast Sent", `Successfully sent to ${data.count} subscribers!`, "success");
                setShowNewsletter(false);
                setNewsletterForm({ subject: '', content: '' });
            } else {
                throw new Error(data.error);
            }
        } catch (e: any) {
            modernAlert("Blast Failed", e.message, "error");
        } finally {
            setIsSendingNewsletter(false);
        }
    };

    return (
        <div className="FadeIn">
            {/* TOP ANALYTICS STRIP */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass" style={{ padding: '1.5rem', borderLeft: '4px solid #00ff88' }}>
                    <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Users</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{userCount} <span style={{ fontSize: '0.9rem', color: '#00ff88' }}>Audience</span></div>
                </div>
                <div className="glass" style={{ padding: '1.5rem', borderLeft: '4px solid #1DA1F2' }}>
                    <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Campaigns</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{posts.length} <span style={{ fontSize: '0.9rem', color: '#00ff88' }}>Sent</span></div>
                </div>
                <div className="glass" style={{ padding: '1.5rem', borderLeft: '4px solid #24A1DE' }}>
                    <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Orders</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats?.total || 0} <span style={{ fontSize: '0.9rem', color: '#00ff88' }}>Conversions</span></div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px minmax(400px, 1fr) 300px', gap: '2rem' }}>

                {/* LEFT COLUMN: PRODUCT PROMOTER */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', height: '100%' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#00ff88', letterSpacing: '1px', fontWeight: 'bold' }}>🛒 PROMOTE INVENTORY</h3>
                        <input placeholder="Search products..." className="input-field" style={{ width: '100%', marginBottom: '1rem', padding: '0.6rem' }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '600px', overflowY: 'auto' }}>
                            {loadingCatalog ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Loading Catalog...</div>
                            ) : catalogItems.length > 0 ? (
                                catalogItems.map(item => (
                                    <div key={item.id} onClick={() => handlePromoteItem(item)} className="glass-hover" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: '0.2s' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.3rem', color: '#fff' }}>{item.name}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                            <span style={{ color: '#00ff88', fontWeight: 'bold' }}>${item.price}</span>
                                            <span style={{ color: '#888' }}>{item.stock} in stock</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No products found.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* MIDDLE COLUMN: CREATE & PREVIEW */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* AI CONTENT STUDIO */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(0,255,136,0.1)' }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '4rem', opacity: 0.05 }}>🤖</div>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#00ff88' }}>⚡</span> AI Gen
                        </h3>
                        <input
                            placeholder="Or describe promotion topic..."
                            className="input-field"
                            style={{ width: '100%', marginBottom: '1rem' }}
                            value={aiTopic}
                            onChange={(e) => setAiTopic(e.target.value)}
                        />
                        <button
                            disabled={isGenerating}
                            onClick={handleAIGenerate}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.8rem', fontWeight: '800' }}
                        >
                            {isGenerating ? 'BREWING...' : 'GENERATE'}
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button
                            onClick={() => { setShowAddPost(true); setNewsletterForm({ subject: '', content: '' }); setShowNewsletter(false); }}
                            className="btn btn-primary"
                            style={{ padding: '1.2rem', borderRadius: '16px', fontWeight: 'bold', fontSize: '0.9rem' }}
                        >
                            + Draft Post
                        </button>
                        <button
                            onClick={() => { setShowNewsletter(true); setShowAddPost(false); }}
                            className="btn btn-outline"
                            style={{ padding: '1.2rem', borderRadius: '16px', fontWeight: 'bold', fontSize: '0.9rem', borderColor: 'var(--secondary)', color: 'var(--secondary)' }}
                        >
                            📧 News Blast
                        </button>
                    </div>

                    {showAddPost && (
                        <div className="glass FadeIn" style={{ padding: '2rem', borderRadius: '24px', border: '2px solid rgba(0,255,136,0.3)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3>Draft New Asset</h3>
                                <button onClick={() => setShowAddPost(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                            </div>
                            <form onSubmit={handleAddPost} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>TARGET CHANNELS</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {['All', 'Twitter', 'Facebook', 'Instagram', 'LinkedIn', 'Telegram'].map(p => (
                                            <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: newPost.platforms.includes(p) ? '1px solid #00ff88' : '1px solid #222', transition: '0.2s' }}>
                                                <input
                                                    type="checkbox"
                                                    style={{ display: 'none' }}
                                                    checked={newPost.platforms.includes(p)}
                                                    onChange={e => {
                                                        const current = newPost.platforms;
                                                        if (e.target.checked) setNewPost({ ...newPost, platforms: [...current, p] });
                                                        else setNewPost({ ...newPost, platforms: current.filter((x: string) => x !== p) });
                                                    }}
                                                />
                                                <span style={{ color: newPost.platforms.includes(p) ? '#00ff88' : '#666', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                    {p}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <textarea
                                    placeholder="Paste viral content or click a product to auto-fill..."
                                    className="input-field"
                                    style={{ height: '150px', borderRadius: '16px', fontSize: '1rem', padding: '1rem' }}
                                    value={newPost.content}
                                    onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                                    required
                                />
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem', flex: 1 }}>Deploy Content</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: HISTORY STREAM */}
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', height: '100%', overflowY: 'auto' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#888', letterSpacing: '1px' }}>UNIFIED STREAM</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                        {['all', 'Twitter', 'Facebook', 'Telegram'].map(t => (
                            <button
                                key={t}
                                onClick={() => setMarketingTab(t)}
                                style={{
                                    padding: '0.6rem',
                                    borderRadius: '8px',
                                    background: marketingTab === t ? 'rgba(0,255,136,0.1)' : 'transparent',
                                    color: marketingTab === t ? '#00ff88' : '#666',
                                    border: 'none',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: marketingTab === t ? 'bold' : 'normal'
                                }}
                            >
                                {t === 'all' ? 'All Activity' : t}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {(marketingTab === 'all' ? posts : posts.filter((p: any) => p.platform && p.platform.includes(marketingTab))).map((post: any) => (
                            <div key={post.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#00ff88' }}>{post.platform}</span>
                                    <span style={{ fontSize: '0.7rem', color: '#666' }}>{new Date(post.date).toLocaleDateString()}</span>
                                </div>
                                <p style={{ color: '#ccc', fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '0.8rem', whiteSpace: 'pre-wrap' }}>
                                    {post.content.substring(0, 100)}{post.content.length > 100 && '...'}
                                </p>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button style={{ fontSize: '0.7rem', background: 'none', border: '1px solid #333', color: '#888', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(post.content)}>Copy</button>
                                    <button style={{ fontSize: '0.7rem', background: 'none', border: 'none', color: '#ff4444', padding: '0.2rem', cursor: 'pointer' }} onClick={async () => { if (await modernConfirm('Delete?')) { await fetch(`/api/social?id=${post.id}`, { method: 'DELETE' }); window.location.reload(); } }}>Delete</button>
                                </div>
                            </div>
                        ))}
                        {posts.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#666', fontSize: '0.9rem' }}>
                                Usage history will appear here.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
