"use client";

import { useState } from "react";
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
}

export default function MarketingTab({
    marketingTab,
    setMarketingTab,
    showAddPost,
    setShowAddPost,
    posts,
    newPost,
    setNewPost,
    handleAddPost
}: MarketingTabProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiTopic, setAiTopic] = useState("");
    const [showNewsletter, setShowNewsletter] = useState(false);
    const [newsletterForm, setNewsletterForm] = useState({ subject: '', content: '' });
    const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);

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
            {/* TOP ANALYTICS STRIP (SIMULATED CONVERSION PULSE) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="glass" style={{ padding: '1.5rem', borderLeft: '4px solid #00ff88' }}>
                    <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Direct Traffic</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>42.5% <span style={{ fontSize: '0.9rem', color: '#00ff88' }}>↑ 12%</span></div>
                </div>
                <div className="glass" style={{ padding: '1.5rem', borderLeft: '4px solid #1DA1F2' }}>
                    <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Twitter (X) Reach</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>12.8k <span style={{ fontSize: '0.9rem', color: '#00ff88' }}>↑ 5%</span></div>
                </div>
                <div className="glass" style={{ padding: '1.5rem', borderLeft: '4px solid #24A1DE' }}>
                    <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Telegram Channel</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>8.4k <span style={{ fontSize: '0.9rem', color: '#00ff88' }}>↑ 22%</span></div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* AI CONTENT STUDIO */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(0,255,136,0.1)' }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '4rem', opacity: 0.05 }}>🤖</div>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#00ff88' }}>⚡</span> AI Content Engine
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.2rem' }}>Generate high-conversion social copy in seconds.</p>
                        <input
                            placeholder="What are we promoting?"
                            className="input-field"
                            style={{ width: '100%', marginBottom: '1rem' }}
                            value={aiTopic}
                            onChange={(e) => setAiTopic(e.target.value)}
                        />
                        <button
                            disabled={isGenerating}
                            onClick={handleAIGenerate}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', fontWeight: '800' }}
                        >
                            {isGenerating ? 'GENIE BREWING...' : 'GENERATE VIRAL COPY'}
                        </button>
                    </div>

                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#888', letterSpacing: '1px' }}>MARKETING HUB</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {['all', 'Twitter', 'Facebook', 'Instagram', 'LinkedIn', 'Telegram'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setMarketingTab(t)}
                                    style={{
                                        padding: '1rem 1.2rem',
                                        borderRadius: '12px',
                                        background: marketingTab === t ? 'rgba(0,255,136,0.1)' : 'transparent',
                                        color: marketingTab === t ? '#00ff88' : '#888',
                                        border: '1px solid',
                                        borderColor: marketingTab === t ? 'rgba(0,255,136,0.3)' : 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: '0.2s',
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    {t === 'all' ? 'Unified Stream' : t}
                                    {marketingTab === t && <span>●</span>}
                                </button>
                            ))}
                        </div>
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
                </div>

                <div>
                    {!showAddPost && !showNewsletter && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {(marketingTab === 'all' ? posts : posts.filter((p: any) => p.platform && p.platform.includes(marketingTab))).map((post: any) => (
                                <div key={post.id} className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', transition: '0.3s' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, #111, #222)', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                                👤
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 'bold', color: '#fff' }}>{post.author || 'System Admin'}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(post.date).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: '900', padding: '4px 12px', borderRadius: '20px', background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                {post.platform}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: '#444', fontWeight: 'bold' }}>{post.status}</span>
                                        </div>
                                    </div>

                                    <p style={{ color: '#bbb', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '2rem', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)' }}>
                                        {post.content}
                                    </p>

                                    <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                                        {(post.platform && (post.platform.includes('All') || post.platform.includes('Twitter'))) && (
                                            <a
                                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.content)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline"
                                                style={{ fontSize: '0.85rem', padding: '0.6rem 1.5rem', borderColor: '#1DA1F2', color: '#1DA1F2', borderRadius: '10px' }}
                                            >
                                                🐦 Tweet Now
                                            </a>
                                        )}

                                        <button
                                            className="btn btn-outline"
                                            style={{ fontSize: '0.85rem', padding: '0.6rem 1.5rem', borderColor: '#333', borderRadius: '10px' }}
                                            onClick={() => {
                                                navigator.clipboard.writeText(post.content);
                                                modernAlert("Copied", "Content copied to clipboard!", "success");
                                            }}
                                        >
                                            📋 Copy Asset
                                        </button>

                                        <button
                                            onClick={async () => {
                                                const ok = await modernConfirm("Delete Draft?", "This will permanently remove this marketing post.");
                                                if (ok) {
                                                    await fetch(`/api/social?id=${post.id}`, { method: 'DELETE' });
                                                    window.location.reload();
                                                }
                                            }}
                                            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                                        >
                                            Remove Draft
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {(marketingTab === 'all' ? posts : posts.filter((p: any) => p.platform && p.platform.includes(marketingTab))).length === 0 && (
                                <div className="glass" style={{ padding: '6rem 2rem', textAlign: 'center', opacity: 0.5, borderStyle: 'dashed', borderColor: '#333' }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📢</div>
                                    <h2 style={{ color: '#666' }}>No active campaigns found.</h2>
                                    <p style={{ color: '#444' }}>Use the AI Genie to spark a new marketing wave.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {showAddPost && (
                        <div className="glass FadeIn" style={{ padding: '3rem', borderRadius: '32px', border: '2px solid rgba(0,255,136,0.3)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h3>Draft New Asset</h3>
                                <button onClick={() => setShowAddPost(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                            </div>
                            <form onSubmit={handleAddPost} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'bold', marginBottom: '1rem', display: 'block' }}>TARGET CHANNELS</label>
                                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                                        {['All', 'Twitter', 'Facebook', 'Instagram', 'LinkedIn', 'Telegram'].map(p => (
                                            <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 1.2rem', borderRadius: '12px', border: newPost.platforms.includes(p) ? '1px solid #00ff88' : '1px solid #222', transition: '0.2s' }}>
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
                                                <span style={{ color: newPost.platforms.includes(p) ? '#00ff88' : '#666', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                                    {p}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <textarea
                                    placeholder="Paste viral content or use AI Genie..."
                                    className="input-field"
                                    style={{ height: '220px', borderRadius: '20px', fontSize: '1.1rem', padding: '1.5rem' }}
                                    value={newPost.content}
                                    onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                                    required
                                />
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ padding: '1.2rem 3rem' }}>Deploy Content</button>
                                    <button type="button" onClick={() => setShowAddPost(false)} className="btn btn-outline" style={{ padding: '1.2rem 2rem' }}>Discard</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {showNewsletter && (
                        <div className="glass FadeIn" style={{ padding: '3rem', borderRadius: '32px', border: '2px solid var(--secondary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h3 style={{ color: 'var(--secondary)' }}>Global News Blast</h3>
                                <button onClick={() => setShowNewsletter(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                            </div>
                            <form onSubmit={handleSendNewsletter} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'bold', marginBottom: '0.8rem', display: 'block' }}>EMAIL SUBJECT</label>
                                    <input
                                        placeholder="E.g. Summer Flash Sale: 40% OFF All Netflix Accounts"
                                        className="input-field"
                                        style={{ width: '100%', borderRadius: '12px' }}
                                        value={newsletterForm.subject}
                                        onChange={(e) => setNewsletterForm({ ...newsletterForm, subject: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'bold', marginBottom: '0.8rem', display: 'block' }}>BODY CONTENT (HTML SUPPORTED)</label>
                                    <textarea
                                        placeholder="Write your email announcement here..."
                                        className="input-field"
                                        style={{ height: '300px', borderRadius: '20px', fontSize: '1.05rem', padding: '1.5rem' }}
                                        value={newsletterForm.content}
                                        onChange={(e) => setNewsletterForm({ ...newsletterForm, content: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        type="submit"
                                        disabled={isSendingNewsletter}
                                        className="btn btn-primary"
                                        style={{ background: 'var(--secondary)', padding: '1.2rem 3rem' }}
                                    >
                                        {isSendingNewsletter ? 'BLASTING EMAILS...' : 'START BROADCAST'}
                                    </button>
                                    <button type="button" onClick={() => setShowNewsletter(false)} className="btn btn-outline" style={{ padding: '1.2rem 2rem' }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
