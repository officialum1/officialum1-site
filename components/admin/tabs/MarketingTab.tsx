"use client";

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
    return (
        <div className="FadeIn">
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: '#888' }}>CHANNELS</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {['all', 'Twitter', 'Facebook', 'Instagram', 'LinkedIn', 'Telegram'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setMarketingTab(t)}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        background: marketingTab === t ? 'rgba(0,255,136,0.1)' : 'transparent',
                                        color: marketingTab === t ? '#00ff88' : '#888',
                                        border: '1px solid',
                                        borderColor: marketingTab === t ? 'rgba(0,255,136,0.3)' : 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {t === 'all' ? 'All Channels' : t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setShowAddPost(true)}
                        className="btn btn-primary"
                        style={{ padding: '1.2rem', borderRadius: '16px', fontWeight: 'bold' }}
                    >
                        + Draft New Post
                    </button>
                </div>

                <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {(marketingTab === 'all' ? posts : posts.filter((p: any) => p.platform && p.platform.includes(marketingTab))).map((post: any) => (
                            <div key={post.id} className="glass" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                            👤
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: '#fff' }}>{post.author || 'System Admin'}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(post.createdAt).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}>
                                            {post.platform}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#666' }}>{post.status}</span>
                                    </div>
                                </div>

                                <p style={{ color: '#eee', lineHeight: '1.6', fontSize: '1.05rem', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                                    {post.content}
                                </p>

                                <div style={{ display: 'flex', gap: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.2rem' }}>
                                    {(post.platform && (post.platform.includes('All') || post.platform.includes('Twitter'))) && (
                                        <a
                                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.content)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline"
                                            style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem', borderColor: '#1DA1F2', color: '#1DA1F2' }}
                                        >
                                            🐦 Tweet This
                                        </a>
                                    )}

                                    <button
                                        className="btn btn-outline"
                                        style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem', borderColor: '#444' }}
                                        onClick={() => {
                                            navigator.clipboard.writeText(post.content);
                                            alert('Content copied to clipboard!');
                                        }}
                                    >
                                        📋 Copy Content
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (confirm('Delete this post draft?')) {
                                                await fetch(`/api/admin/marketing?id=${post.id}`, { method: 'DELETE' });
                                                window.location.reload();
                                            }
                                        }}
                                        style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '0.85rem' }}
                                    >
                                        Delete Draft
                                    </button>
                                </div>
                            </div>
                        ))}
                        {(marketingTab === 'all' ? posts : posts.filter((p: any) => p.platform && p.platform.includes(marketingTab))).length === 0 && (
                            <div className="glass" style={{ padding: '4rem', textAlign: 'center', opacity: 0.6 }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                                <p>No posts found for {marketingTab}.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showAddPost && (
                <div className="glass" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid rgba(0,255,136,0.3)', marginTop: '2rem' }}>
                    <h3>Draft Social Post</h3>
                    <form onSubmit={handleAddPost} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                                {['All', 'Twitter', 'Facebook', 'Instagram', 'LinkedIn', 'Telegram'].map(p => (
                                    <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', border: newPost.platforms.includes(p) ? '1px solid #00ff88' : '1px solid transparent' }}>
                                        <input
                                            type="checkbox"
                                            checked={newPost.platforms.includes(p)}
                                            onChange={e => {
                                                const current = newPost.platforms;
                                                if (e.target.checked) setNewPost({ ...newPost, platforms: [...current, p] });
                                                else setNewPost({ ...newPost, platforms: current.filter((x: string) => x !== p) });
                                            }}
                                        />
                                        <span style={{ color: newPost.platforms.includes(p) ? '#00ff88' : '#ccc', fontSize: '0.9rem' }}>
                                            {p === 'All' ? 'All (Broadcast)' : p}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <textarea placeholder="Post Content (Description, Hashtags...)" className="input-field" style={{ height: '100px' }} value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} required />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn btn-primary">Save Draft</button>
                            <button type="button" onClick={() => setShowAddPost(false)} className="btn btn-outline">Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
