"use client";

interface ToolsTabProps {
    handleBacklinkCheck: (e: any) => Promise<void>;
    toolUrl: string;
    setToolUrl: (url: string) => void;
    toolLoading: boolean;
    toolMetrics: any;
    handleGenerateBlog: (e: any) => Promise<void>;
    blogTopic: string;
    setBlogTopic: (topic: string) => void;
    blogLoading: boolean;
    isGuestPost: boolean;
    setIsGuestPost: (val: boolean) => void;
}

export default function ToolsTab({
    handleBacklinkCheck,
    toolUrl,
    setToolUrl,
    toolLoading,
    toolMetrics,
    handleGenerateBlog,
    blogTopic,
    setBlogTopic,
    blogLoading,
    isGuestPost,
    setIsGuestPost
}: ToolsTabProps) {
    return (
        <div className="FadeIn">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {/* Backlink Service */}
                <div className="glass" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid rgba(0,255,136,0.2)' }}>
                    <h2 style={{ color: '#00ff88', marginBottom: '1rem' }}>🔗 Backlink Authority Checker</h2>
                    <p style={{ color: '#888', marginBottom: '1.5rem' }}>Check DA/PA metrics for any domain using Moz API.</p>
                    <form onSubmit={handleBacklinkCheck} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <input placeholder="https://example.com" value={toolUrl} onChange={e => setToolUrl(e.target.value)} className="input-field" style={{ flex: 1 }} required />
                        <button type="submit" className="btn btn-primary" disabled={toolLoading}>{toolLoading ? 'Scanning...' : 'Check'}</button>
                    </form>
                    {toolMetrics && (
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginBottom: '1rem' }}>
                                <div><div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{toolMetrics.da}</div><div style={{ color: '#888', fontSize: '0.8rem' }}>Domain Auth</div></div>
                                <div><div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{toolMetrics.pa}</div><div style={{ color: '#888', fontSize: '0.8rem' }}>Page Auth</div></div>
                                <div><div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{toolMetrics.links}</div><div style={{ color: '#888', fontSize: '0.8rem' }}>Backlinks</div></div>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
                                <strong>Analysis:</strong>
                                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                                    {toolMetrics.details?.map((d: string, i: number) => <li key={i}>{d}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Writer */}
                <div className="glass" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid rgba(138, 56, 255, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <h2 style={{ color: '#ae68ff', margin: 0 }}>✨ AI Content Generator</h2>
                            <p style={{ color: '#888', marginTop: '0.5rem' }}>Generate SEO-optimized content instantly.</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(174, 104, 255, 0.1)', padding: '8px 12px', borderRadius: '12px', border: '1px solid rgba(174, 104, 255, 0.2)' }}>
                            <span style={{ fontSize: '0.75rem', color: isGuestPost ? '#ae68ff' : '#666', fontWeight: 'bold' }}>GUEST POST</span>
                            <button
                                onClick={() => setIsGuestPost(!isGuestPost)}
                                style={{
                                    background: isGuestPost ? '#ae68ff' : '#333',
                                    width: '34px',
                                    height: '18px',
                                    borderRadius: '20px',
                                    position: 'relative',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <div style={{
                                    width: '14px',
                                    height: '14px',
                                    background: '#fff',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    top: '2px',
                                    left: isGuestPost ? '18px' : '2px',
                                    transition: 'all 0.3s'
                                }}></div>
                            </button>
                        </div>
                    </div>

                    {isGuestPost && (
                        <div style={{ background: 'rgba(174, 104, 255, 0.05)', padding: '0.8rem', borderRadius: '10px', fontSize: '0.8rem', color: '#ae68ff', marginBottom: '1.5rem', border: '1px dashed rgba(174, 104, 255, 0.3)' }}>
                            🚀 <strong>Guest Post Mode:</strong> AI will automatically include a natural backlink to officialum1.com in the content.
                        </div>
                    )}

                    <form onSubmit={handleGenerateBlog} style={{ display: 'flex', gap: '1rem' }}>
                        <input placeholder="Topic (e.g. Best Game Accounts)" value={blogTopic} onChange={e => setBlogTopic(e.target.value)} className="input-field" style={{ flex: 1 }} required />
                        <button type="submit" className="btn btn-outline" style={{ color: '#ae68ff', borderColor: '#ae68ff' }} disabled={blogLoading}>{blogLoading ? 'Writing...' : 'Generate'}</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
