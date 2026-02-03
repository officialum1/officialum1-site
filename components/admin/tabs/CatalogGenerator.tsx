"use client";
import React, { useState } from 'react';

interface CatalogGeneratorProps {
    showGenerator: boolean;
    setShowGenerator: (show: boolean) => void;
    fetchData: () => Promise<void>;
    categories: any[];
}

export default function CatalogGenerator({
    showGenerator,
    setShowGenerator,
    fetchData,
    categories
}: CatalogGeneratorProps) {
    const [genConfig, setGenConfig] = useState({
        platform: 'Reddit',
        serviceType: 'Accounts',
        category_id: '',
        count: 5,
        basePrice: '10',
        reddit: { minPostKarma: 100, maxPostKarma: 500, minCommentKarma: 0, maxCommentKarma: 50, minAge: 1, maxAge: 12 },
        snapchat: { minScore: 1000, maxScore: 5000, minAge: 1, maxAge: 24 },
        instagram: { minFollowers: 100, maxFollowers: 1000, minLikes: 100, maxLikes: 1000, minViews: 500, maxViews: 5000, accountAge: 6 },
        tiktok: { minFollowers: 100, maxFollowers: 1000, minLikes: 500, maxLikes: 2000, age: 3 },
        telegram: { minMembers: 100, maxMembers: 1000, minViews: 1000, maxViews: 10000 },
        facebook: { minFollowers: 100, maxFollowers: 5000 },
        discord: { minMembers: 100, maxMembers: 2000 }
    });

    const handleGenerateCatalog = async () => {
        const productsCount = parseInt(genConfig.count.toString());
        const created: any[] = [];

        for (let i = 0; i < productsCount; i++) {
            const platform = genConfig.platform;
            const sType = genConfig.serviceType;
            let name = `${platform} - ${sType}`;
            let desc = `High quality ${platform} ${sType.toLowerCase()} service. Fast delivery and secure processing.`;

            const pLower = platform.toLowerCase();

            // 1. REDDIT
            if (pLower.includes('reddit')) {
                if (sType === 'Accounts') {
                    const karma = Math.floor(Math.random() * (genConfig.reddit.maxPostKarma - genConfig.reddit.minPostKarma + 1)) + genConfig.reddit.minPostKarma;
                    const cKarma = Math.floor(Math.random() * (genConfig.reddit.maxCommentKarma - genConfig.reddit.minCommentKarma + 1)) + genConfig.reddit.minCommentKarma;
                    const age = Math.floor(Math.random() * (genConfig.reddit.maxAge - genConfig.reddit.minAge + 1)) + genConfig.reddit.minAge;
                    name = `Reddit Account - ${karma} Karma (${age}mo Old)`;
                    desc = `Verified Reddit account with ${karma} Post Karma and ${cKarma} Comment Karma. Age: ${age} months. Clean history.`;
                } else if (sType === 'Subreddit Members') {
                    const count = Math.floor(Math.random() * 500) + 100;
                    name = `${count}+ Reddit Subreddit Members`;
                    desc = `Boost your community with ${count} real-looking Reddit subreddit members. Safe and permanent.`;
                } else if (sType === 'Subreddit') {
                    name = `Premium Reddit Subreddit (r/Name)`;
                    desc = `Custom created/transferred Reddit subreddit. Clean name, no bans, ready for growth.`;
                }
            }
            // 2. SNAPCHAT
            else if (pLower.includes('snapchat')) {
                const score = Math.floor(Math.random() * (genConfig.snapchat.maxScore - genConfig.snapchat.minScore + 1)) + genConfig.snapchat.minScore;
                const age = Math.floor(Math.random() * (genConfig.snapchat.maxAge - genConfig.snapchat.minAge + 1)) + genConfig.snapchat.minAge;
                name = `Snapchat Account - ${score.toLocaleString()} Score (${age}mo)`;
                desc = `High score Snapchat account. Snapscore: ${score.toLocaleString()}. Account age: ${age} months. Private and secure.`;
            }
            // 3. INSTAGRAM
            else if (pLower.includes('instagram')) {
                if (sType === 'Followers') {
                    const followers = Math.floor(Math.random() * (genConfig.instagram.maxFollowers - genConfig.instagram.minFollowers + 1)) + genConfig.instagram.minFollowers;
                    name = `${followers.toLocaleString()} Instagram Followers`;
                    desc = `High-quality Instagram followers for your profile. ${followers.toLocaleString()} real-looking accounts. Fast start.`;
                } else if (sType === 'Likes') {
                    const likes = Math.floor(Math.random() * (genConfig.instagram.maxLikes - genConfig.instagram.minLikes + 1)) + genConfig.instagram.minLikes;
                    name = `${likes.toLocaleString()} Instagram Likes`;
                    desc = `Boost your post with ${likes.toLocaleString()} Instagram likes. Safe and organic-looking delivery.`;
                } else if (sType === 'Views') {
                    const views = Math.floor(Math.random() * (genConfig.instagram.maxViews - genConfig.instagram.minViews + 1)) + genConfig.instagram.minViews;
                    name = `${views.toLocaleString()} Instagram Video Views`;
                    desc = `Increase your reel or video visibility with ${views.toLocaleString()} views. Safe for your account.`;
                }
            }
            // 4. TELEGRAM
            else if (pLower.includes('telegram')) {
                if (sType === 'Members') {
                    const members = Math.floor(Math.random() * (genConfig.telegram.maxMembers - genConfig.telegram.minMembers + 1)) + genConfig.telegram.minMembers;
                    name = `${members.toLocaleString()} Telegram Channel Members`;
                    desc = `Grow your Telegram community with ${members.toLocaleString()} members. Safe and fast delivery.`;
                } else if (sType === 'Views') {
                    const views = Math.floor(Math.random() * (genConfig.telegram.maxViews - genConfig.telegram.minViews + 1)) + genConfig.telegram.minViews;
                    name = `${views.toLocaleString()} Telegram Post Views`;
                    desc = `Get ${views.toLocaleString()} views on your Telegram posts. Improve your channel metrics instantly.`;
                }
            }
            // 5. FACEBOOK
            else if (pLower.includes('facebook')) {
                const followers = Math.floor(Math.random() * (genConfig.facebook.maxFollowers - genConfig.facebook.minFollowers + 1)) + genConfig.facebook.minFollowers;
                name = `${followers.toLocaleString()} Facebook Page Followers`;
                desc = `Professional Facebook page growth. ${followers.toLocaleString()} followers delivered securely to your page.`;
            }
            // 6. DISCORD
            else if (pLower.includes('discord')) {
                if (sType === 'Accounts') {
                    name = `Discord Account - Aged & Verified`;
                    desc = `Fully verified aged Discord account. Phone and email verified. Ready for server joining.`;
                } else if (sType === 'Online Members') {
                    const m = Math.floor(Math.random() * (genConfig.discord.maxMembers - genConfig.discord.minMembers + 1)) + genConfig.discord.minMembers;
                    name = `${m.toLocaleString()} Discord Online Members (Real)`;
                    desc = `Boost your server with ${m.toLocaleString()} online members. Includes custom status and avatars.`;
                } else if (sType === 'Offline Members') {
                    const m = Math.floor(Math.random() * (genConfig.discord.maxMembers - genConfig.discord.minMembers + 1)) + genConfig.discord.minMembers;
                    name = `${m.toLocaleString()} Discord Offline Members`;
                    desc = `Standard server boost. ${m.toLocaleString()} offline members added to your server list.`;
                }
            }
            // 7. TIKTOK
            else if (pLower.includes('tiktok')) {
                const followers = Math.floor(Math.random() * (genConfig.tiktok.maxFollowers - genConfig.tiktok.minFollowers + 1)) + genConfig.tiktok.minFollowers;
                const likes = Math.floor(Math.random() * (genConfig.tiktok.maxLikes - genConfig.tiktok.minLikes + 1)) + genConfig.tiktok.minLikes;
                name = `TikTok - ${followers.toLocaleString()} Follows / ${likes.toLocaleString()} Likes`;
                desc = `Established TikTok account. Followers: ${followers.toLocaleString()}, Total Likes: ${likes.toLocaleString()}. Age: ${genConfig.tiktok.age} months.`;
            }

            created.push({
                name,
                platform,
                price: genConfig.basePrice,
                description: desc,
                category_id: genConfig.category_id || null,
                stock: 100
            });
        }

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'bulk_import',
                    products: created,
                    category_id: genConfig.category_id
                })
            });
            if (res.ok) {
                setShowGenerator(false);
                await fetchData();
                alert(`✅ Successfully Generated ${productsCount} Products!`);
            } else {
                const err = await res.json();
                alert(`Error: ${err.error || 'Failed to import products'}`);
            }
        } catch { alert('Generation failed'); }
    };

    if (!showGenerator) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)', padding: '2rem' }}>
            <div className="glass" style={{ width: '100%', maxWidth: '800px', padding: '2.5rem', borderRadius: '30px', border: '1px solid #00ff88', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0, color: '#00ff88' }}>⚡ Quick Catalog Generator</h2>
                    <button onClick={() => setShowGenerator(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '2rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '20px' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Select Platform</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                {categories.length > 0 ? (
                                    categories.map(cat => (
                                        <button
                                            key={`plat-${cat.id}`}
                                            onClick={() => setGenConfig({ ...genConfig, platform: cat.name, category_id: String(cat.id) })}
                                            style={{
                                                padding: '0.8rem',
                                                borderRadius: '12px',
                                                border: '1px solid',
                                                borderColor: genConfig.category_id === String(cat.id) ? '#00ff88' : 'rgba(255,255,255,0.1)',
                                                background: genConfig.category_id === String(cat.id) ? 'rgba(0,255,136,0.1)' : 'transparent',
                                                color: genConfig.category_id === String(cat.id) ? '#00ff88' : '#888',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {cat.icon} {cat.name}
                                        </button>
                                    ))
                                ) : (
                                    ['Reddit', 'Snapchat', 'Instagram', 'TikTok'].map(plat => (
                                        <button
                                            key={plat}
                                            onClick={() => setGenConfig({ ...genConfig, platform: plat })}
                                            style={{
                                                padding: '0.8rem',
                                                borderRadius: '12px',
                                                border: '1px solid',
                                                borderColor: genConfig.platform === plat ? '#00ff88' : 'rgba(255,255,255,0.1)',
                                                background: genConfig.platform === plat ? 'rgba(0,255,136,0.1)' : 'transparent',
                                                color: genConfig.platform === plat ? '#00ff88' : '#888',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {plat}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Assign Category</label>
                            <select className="input-field" value={genConfig.category_id} onChange={e => setGenConfig({ ...genConfig, category_id: e.target.value })} style={{ width: '100%' }}>
                                <option value="">No Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Select Service</label>
                            <select
                                className="input-field"
                                value={genConfig.serviceType}
                                onChange={e => setGenConfig({ ...genConfig, serviceType: e.target.value })}
                                style={{ width: '100%' }}
                            >
                                {genConfig.platform.toLowerCase().includes('reddit') && (
                                    <>
                                        <option value="Accounts">Reddit Accounts</option>
                                        <option value="Subreddit Members">Subreddit Members</option>
                                        <option value="Subreddit">Subreddit (r/)</option>
                                    </>
                                )}
                                {genConfig.platform.toLowerCase().includes('instagram') && (
                                    <>
                                        <option value="Followers">Followers</option>
                                        <option value="Likes">Likes</option>
                                        <option value="Views">Views</option>
                                    </>
                                )}
                                {genConfig.platform.toLowerCase().includes('telegram') && (
                                    <>
                                        <option value="Members">Channel Members</option>
                                        <option value="Views">Post Views</option>
                                    </>
                                )}
                                {genConfig.platform.toLowerCase().includes('discord') && (
                                    <>
                                        <option value="Accounts">Discord Accounts</option>
                                        <option value="Server Members">Server Members (Mixed)</option>
                                        <option value="Online Members">Online Members</option>
                                        <option value="Offline Members">Offline Members</option>
                                    </>
                                )}
                                {genConfig.platform.toLowerCase().includes('facebook') && (
                                    <option value="Followers">Page Followers</option>
                                )}
                                {genConfig.platform.toLowerCase().includes('snapchat') && (
                                    <option value="Accounts">Snapchat Accounts</option>
                                )}
                                {genConfig.platform.toLowerCase().includes('tiktok') && (
                                    <option value="Accounts">TikTok Accounts</option>
                                )}
                                {!['reddit', 'instagram', 'telegram', 'discord', 'facebook', 'snapchat', 'tiktok'].some(p => genConfig.platform.toLowerCase().includes(p)) && (
                                    <option value="Service">Generic Service</option>
                                )}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Count</label>
                                <input type="number" className="input-field" value={genConfig.count} onChange={e => setGenConfig({ ...genConfig, count: parseInt(e.target.value) })} style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Price ($)</label>
                                <input type="number" className="input-field" value={genConfig.basePrice} onChange={e => setGenConfig({ ...genConfig, basePrice: e.target.value })} style={{ width: '100%' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>{genConfig.platform} - {genConfig.serviceType}</h4>

                        {genConfig.platform.toLowerCase().includes('reddit') && genConfig.serviceType === 'Accounts' && (
                            <div style={{ display: 'grid', gap: '1.2rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#888' }}>Post Karma Range</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                                        <input className="input-field" type="number" value={genConfig.reddit.minPostKarma} onChange={e => setGenConfig({ ...genConfig, reddit: { ...genConfig.reddit, minPostKarma: parseInt(e.target.value) } })} style={{ flex: 1 }} />
                                        <input className="input-field" type="number" value={genConfig.reddit.maxPostKarma} onChange={e => setGenConfig({ ...genConfig, reddit: { ...genConfig.reddit, maxPostKarma: parseInt(e.target.value) } })} style={{ flex: 1 }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#888' }}>Age Range (Months)</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                                        <input className="input-field" type="number" value={genConfig.reddit.minAge} onChange={e => setGenConfig({ ...genConfig, reddit: { ...genConfig.reddit, minAge: parseInt(e.target.value) } })} style={{ flex: 1 }} />
                                        <input className="input-field" type="number" value={genConfig.reddit.maxAge} onChange={e => setGenConfig({ ...genConfig, reddit: { ...genConfig.reddit, maxAge: parseInt(e.target.value) } })} style={{ flex: 1 }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {genConfig.platform.toLowerCase().includes('snapchat') && (
                            <div style={{ display: 'grid', gap: '1.2rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#888' }}>Snapscore Range</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                                        <input className="input-field" type="number" value={genConfig.snapchat.minScore} onChange={e => setGenConfig({ ...genConfig, snapchat: { ...genConfig.snapchat, minScore: parseInt(e.target.value) } })} style={{ flex: 1 }} />
                                        <input className="input-field" type="number" value={genConfig.snapchat.maxScore} onChange={e => setGenConfig({ ...genConfig, snapchat: { ...genConfig.snapchat, maxScore: parseInt(e.target.value) } })} style={{ flex: 1 }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#888' }}>Age Range (Months)</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                                        <input className="input-field" type="number" value={genConfig.snapchat.minAge} onChange={e => setGenConfig({ ...genConfig, snapchat: { ...genConfig.snapchat, minAge: parseInt(e.target.value) } })} style={{ flex: 1 }} />
                                        <input className="input-field" type="number" value={genConfig.snapchat.maxAge} onChange={e => setGenConfig({ ...genConfig, snapchat: { ...genConfig.snapchat, maxAge: parseInt(e.target.value) } })} style={{ flex: 1 }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {genConfig.platform.toLowerCase().includes('instagram') && (
                            <div style={{ display: 'grid', gap: '1.2rem' }}>
                                {genConfig.serviceType === 'Followers' && (
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: '#888' }}>Followers Range</label>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                                            <input className="input-field" type="number" value={genConfig.instagram.minFollowers} onChange={e => setGenConfig({ ...genConfig, instagram: { ...genConfig.instagram, minFollowers: parseInt(e.target.value) } })} style={{ flex: 1 }} />
                                            <input className="input-field" type="number" value={genConfig.instagram.maxFollowers} onChange={e => setGenConfig({ ...genConfig, instagram: { ...genConfig.instagram, maxFollowers: parseInt(e.target.value) } })} style={{ flex: 1 }} />
                                        </div>
                                    </div>
                                )}
                                {genConfig.serviceType === 'Likes' && (
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: '#888' }}>Likes Range</label>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                                            <input className="input-field" type="number" value={genConfig.instagram.minLikes} onChange={e => setGenConfig({ ...genConfig, instagram: { ...genConfig.instagram, minLikes: parseInt(e.target.value) } })} style={{ flex: 1 }} />
                                            <input className="input-field" type="number" value={genConfig.instagram.maxLikes} onChange={e => setGenConfig({ ...genConfig, instagram: { ...genConfig.instagram, maxLikes: parseInt(e.target.value) } })} style={{ flex: 1 }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {genConfig.platform.toLowerCase().includes('telegram') && (
                            <div style={{ display: 'grid', gap: '1.2rem' }}>
                                {genConfig.serviceType === 'Members' ? (
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: '#888' }}>Members Range</label>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                                            <input className="input-field" type="number" value={genConfig.telegram.minMembers} onChange={e => setGenConfig({ ...genConfig, telegram: { ...genConfig.telegram, minMembers: parseInt(e.target.value) } })} style={{ flex: 1 }} />
                                            <input className="input-field" type="number" value={genConfig.telegram.maxMembers} onChange={e => setGenConfig({ ...genConfig, telegram: { ...genConfig.telegram, maxMembers: parseInt(e.target.value) } })} style={{ flex: 1 }} />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: '#888' }}>Views Range</label>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                                            <input className="input-field" type="number" value={genConfig.telegram.minViews} onChange={e => setGenConfig({ ...genConfig, telegram: { ...genConfig.telegram, minViews: parseInt(e.target.value) } })} style={{ flex: 1 }} />
                                            <input className="input-field" type="number" value={genConfig.telegram.maxViews} onChange={e => setGenConfig({ ...genConfig, telegram: { ...genConfig.telegram, maxViews: parseInt(e.target.value) } })} style={{ flex: 1 }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {genConfig.platform.toLowerCase().includes('discord') && (
                            <div style={{ display: 'grid', gap: '1.2rem' }}>
                                {(genConfig.serviceType === 'Online Members' || genConfig.serviceType === 'Offline Members' || genConfig.serviceType === 'Server Members') && (
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: '#888' }}>Members Range</label>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                                            <input className="input-field" type="number" value={genConfig.discord.minMembers} onChange={e => setGenConfig({ ...genConfig, discord: { ...genConfig.discord, minMembers: parseInt(e.target.value) } })} style={{ flex: 1 }} />
                                            <input className="input-field" type="number" value={genConfig.discord.maxMembers} onChange={e => setGenConfig({ ...genConfig, discord: { ...genConfig.discord, maxMembers: parseInt(e.target.value) } })} style={{ flex: 1 }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {genConfig.platform.toLowerCase().includes('facebook') && (
                            <div style={{ display: 'grid', gap: '1.2rem' }}>
                                <label style={{ fontSize: '0.8rem', color: '#888' }}>Followers Range</label>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                                    <input className="input-field" type="number" value={genConfig.facebook.minFollowers} onChange={e => setGenConfig({ ...genConfig, facebook: { ...genConfig.facebook, minFollowers: parseInt(e.target.value) } })} style={{ flex: 1 }} />
                                    <input className="input-field" type="number" value={genConfig.facebook.maxFollowers} onChange={e => setGenConfig({ ...genConfig, facebook: { ...genConfig.facebook, maxFollowers: parseInt(e.target.value) } })} style={{ flex: 1 }} />
                                </div>
                            </div>
                        )}

                        {(!['reddit', 'snapchat', 'instagram', 'telegram', 'discord', 'facebook'].some(p => genConfig.platform.toLowerCase().includes(p)) || (genConfig.platform.toLowerCase().includes('reddit') && genConfig.serviceType === 'Subreddit Members') || (genConfig.platform.toLowerCase().includes('tiktok'))) && (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📦</div>
                                <p style={{ color: '#888', fontSize: '0.9rem' }}>
                                    Standard configuration for <b>{genConfig.platform} {genConfig.serviceType}</b>.<br />
                                    Products will be generated with professional metrics.
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleGenerateCatalog}
                            style={{
                                width: '100%',
                                padding: '1.2rem',
                                borderRadius: '16px',
                                marginTop: '1.5rem',
                                background: 'linear-gradient(45deg, #00ff88, #00ccff)',
                                border: 'none',
                                color: '#000',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 10px 30px rgba(0,255,136,0.3)'
                            }}
                        >
                            🚀 Generate {genConfig.count} Listings Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
