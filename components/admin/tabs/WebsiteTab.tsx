"use client";

interface WebsiteTabProps {
    websiteTab: string;
    setWebsiteTab: (tab: string) => void;
    blogForm: any;
    setBlogForm: (form: any) => void;
    handleBlogSubmit: (e: any) => Promise<void>;
    manualBlogs: any[];
    handleDeleteBlog: (id: number) => Promise<void>;
    pageKey: string;
    setPageKey: (key: string) => void;
    pageContent: string;
    setPageContent: (content: string) => void;
    pages: any;
    handlePageSave: () => Promise<void>;
    serviceForm: any;
    setServiceForm: (form: any) => void;
    handleServiceSubmit: (e: any) => Promise<void>;
    services: any[];
    handleDeleteService: (id: number) => Promise<void>;
    projectForm: any;
    setProjectForm: (form: any) => void;
    handleProjectSubmit: (e: any) => Promise<void>;
    projects: any[];
    handleDeleteProject: (id: number) => Promise<void>;
    rentalForm: any;
    setRentalForm: (form: any) => void;
    handleRentalSubmit: (e: any) => Promise<void>;
    rentals: any[];
    handleDeleteRental: (id: number) => Promise<void>;
    reviewForm: any;
    setReviewForm: (form: any) => void;
    handleReviewSubmit: (e: any) => Promise<void>;
    reviews: any[];
    handleDeleteReview: (id: number) => Promise<void>;
    messages: any[];
}

export default function WebsiteTab({
    websiteTab,
    setWebsiteTab,
    blogForm,
    setBlogForm,
    handleBlogSubmit,
    manualBlogs,
    handleDeleteBlog,
    pageKey,
    setPageKey,
    pageContent,
    setPageContent,
    pages,
    handlePageSave,
    serviceForm,
    setServiceForm,
    handleServiceSubmit,
    services,
    handleDeleteService,
    projectForm,
    setProjectForm,
    handleProjectSubmit,
    projects,
    handleDeleteProject,
    rentalForm,
    setRentalForm,
    handleRentalSubmit,
    rentals,
    handleDeleteRental,
    reviewForm,
    setReviewForm,
    handleReviewSubmit,
    reviews,
    handleDeleteReview,
    messages
}: WebsiteTabProps) {
    return (
        <div style={{ display: 'grid', gap: '2rem' }}>
            {/* Website Sub-Navigation */}
            {/* Website Sub-Navigation */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                background: 'rgba(0,0,0,0.2)',
                padding: '1rem 1.5rem',
                borderRadius: '20px',
                overflowX: 'auto',
                marginBottom: '2rem',
                border: '1px solid rgba(255,255,255,0.05)',
                alignItems: 'center'
            }}>
                {['blogs', 'pages', 'services', 'projects', 'rentals', 'reviews', 'messages'].map(t => (
                    <button
                        key={t}
                        onClick={() => setWebsiteTab(t)}
                        style={{
                            padding: '0.8rem 1.5rem',
                            background: websiteTab === t ? '#00ff88' : 'transparent',
                            color: websiteTab === t ? '#000' : '#888',
                            borderRadius: '12px',
                            border: websiteTab === t ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s'
                        }}
                    >
                        {t === 'blogs' ? '📝 Blogs' :
                            t === 'pages' ? '📄 Pages' :
                                t === 'services' ? '🛠️ Services' :
                                    t === 'projects' ? '🚀 Projects' :
                                        t === 'rentals' ? '🏘️ Rentals' :
                                            t === 'reviews' ? '⭐ Reviews' :
                                                '📬 Messages'}
                    </button>
                ))}
            </div>

            {/* 1. BLOGS */}
            {websiteTab === 'blogs' && (
                <div style={{ display: 'grid', gap: '2rem' }}>
                    <div className="glass" style={{ padding: '2.5rem', borderRadius: '20px', border: '1px solid rgba(0,255,136,0.1)' }}>
                        <h2 style={{ color: '#00ff88', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>📝</span> Publish New Blog Post</div>
                            <button
                                onClick={async () => {
                                    if (!confirm('Auto-generate a new blog post using AI template?')) return;
                                    try {
                                        const res = await fetch('/api/admin/generate-blog');
                                        const data = await res.json();
                                        if (data.success) {
                                            alert(`Generated: ${data.title}\nRefresh the page to see it.`);
                                        } else {
                                            alert(data.message || 'Error generating');
                                        }
                                    } catch (e) { alert('Failed to generate'); }
                                }}
                                style={{
                                    fontSize: '0.85rem',
                                    background: 'linear-gradient(45deg, #00c3ff, #00ff88)',
                                    color: '#000',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(0,255,136,0.3)'
                                }}
                            >
                                🤖 AI Auto-Write
                            </button>
                        </h2>
                        <form onSubmit={handleBlogSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.8rem', display: 'block', fontWeight: '500' }}>Blog Title</label>
                                <input placeholder="Enter catchy title..." value={blogForm.title} onChange={e => setBlogForm({ ...blogForm, title: e.target.value })} className="input-field" style={{ width: '100%', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} required />
                            </div>
                            <div>
                                <label style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.8rem', display: 'block', fontWeight: '500' }}>Category</label>
                                <input placeholder="e.g. Technology, Lifestyle" value={blogForm.category} onChange={e => setBlogForm({ ...blogForm, category: e.target.value })} className="input-field" style={{ width: '100%', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} />
                            </div>
                            <div>
                                <label style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.8rem', display: 'block', fontWeight: '500' }}>Feature Image URL</label>
                                <input placeholder="https://..." value={blogForm.image} onChange={e => setBlogForm({ ...blogForm, image: e.target.value })} className="input-field" style={{ width: '100%', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.8rem', display: 'block', fontWeight: '500' }}>Short Excerpt</label>
                                <textarea placeholder="Brief summary of the post..." value={blogForm.excerpt} onChange={e => setBlogForm({ ...blogForm, excerpt: e.target.value })} className="input-field" style={{ width: '100%', height: '100px', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff', resize: 'vertical' }} />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.8rem', display: 'block', fontWeight: '500' }}>Full Content (Markdown)</label>
                                <textarea placeholder="Write your post content here..." value={blogForm.content} onChange={e => setBlogForm({ ...blogForm, content: e.target.value })} className="input-field" style={{ width: '100%', height: '300px', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff', fontFamily: 'monospace' }} required />
                            </div>
                            <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2.5rem', borderRadius: '12px', fontWeight: 'bold' }}>Publish Post</button>
                            </div>
                        </form>
                    </div>
                    <div className="glass" style={{ padding: '2rem', borderRadius: '20px' }}>
                        <h3 style={{ marginBottom: '1rem', opacity: 0.8 }}>Existing Posts ({manualBlogs.length})</h3>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            {manualBlogs.map((b: any) => (
                                <div key={b.id} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ color: '#fff' }}>{b.title}</h4>
                                        <span style={{ fontSize: '0.8rem', color: '#00ff88' }}>{b.category || 'Uncategorized'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button onClick={() => handleDeleteBlog(b.id)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>Delete</button>
                                    </div>
                                </div>
                            ))}
                            {manualBlogs.length === 0 && <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No blog posts found.</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* 2. PAGES */}
            {websiteTab === 'pages' && (
                <div className="glass" style={{ padding: '2.5rem', borderRadius: '20px' }}>
                    <h2 style={{ color: '#00ff88', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📄</span> Content Management System
                    </h2>
                    <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem' }}>
                        {['terms', 'privacy', 'about'].map(p => (
                            <button
                                key={p}
                                onClick={() => { setPageKey(p); setPageContent(pages[p] || ''); }}
                                style={{
                                    padding: '0.8rem 1.5rem',
                                    borderRadius: '10px',
                                    border: '1px solid #333',
                                    background: pageKey === p ? '#00ff88' : 'transparent',
                                    color: pageKey === p ? '#000' : '#888',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    flex: 1
                                }}
                            >
                                {p.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <div style={{ position: 'relative' }}>
                        <label style={{ position: 'absolute', top: '-10px', left: '15px', background: '#000', padding: '0 5px', fontSize: '0.7rem', color: '#00ff88' }}>Content Editor</label>
                        <textarea
                            value={pageContent}
                            onChange={e => setPageContent(e.target.value)}
                            className="input-field"
                            style={{ width: '100%', height: '500px', fontFamily: 'monospace', padding: '1.5rem', lineHeight: '1.6' }}
                            placeholder={`Start writing content for ${pageKey} page...`}
                        />
                    </div>
                    <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                        <button onClick={handlePageSave} className="btn btn-primary" style={{ padding: '0.8rem 3rem' }}>Update {pageKey} Page</button>
                    </div>
                </div>
            )}

            {/* 3. SERVICES */}
            {websiteTab === 'services' && (
                <div style={{ display: 'grid', gap: '2rem' }}>
                    <div className="glass" style={{ padding: '2.5rem', borderRadius: '20px' }}>
                        <h2 style={{ color: '#00ff88', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🛠️</span> Add New Service
                        </h2>
                        <form onSubmit={handleServiceSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.8rem', display: 'block', fontWeight: '500' }}>Service Name</label>
                                    <input placeholder="e.g. Modern Web Design" value={serviceForm.title} onChange={e => setServiceForm({ ...serviceForm, title: e.target.value })} className="input-field" style={{ width: '100%', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} required />
                                </div>
                                <div>
                                    <label style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.8rem', display: 'block', fontWeight: '500' }}>Icon</label>
                                    <input placeholder="emoji" value={serviceForm.icon} onChange={e => setServiceForm({ ...serviceForm, icon: e.target.value })} className="input-field" maxLength={2} style={{ width: '100%', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff', textAlign: 'center' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.8rem', display: 'block', fontWeight: '500' }}>Short Description</label>
                                <textarea placeholder="Tell clients what this service covers..." value={serviceForm.desc} onChange={e => setServiceForm({ ...serviceForm, desc: e.target.value })} className="input-field" style={{ width: '100%', height: '100px', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2.5rem', borderRadius: '12px', fontWeight: 'bold' }}>Add Service</button>
                            </div>
                        </form>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {services.map((s: any) => (
                            <div key={s.id} className="card" style={{ padding: '1.5rem', position: 'relative', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '15px' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{s.icon || '🛠️'}</div>
                                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#fff' }}>{s.title}</h4>
                                <p style={{ fontSize: '0.9rem', color: '#888', lineHeight: '1.5' }}>{s.desc}</p>
                                <button onClick={() => handleDeleteService(s.id)} style={{ position: 'absolute', top: '15px', right: '15px', color: '#ff4444', background: 'rgba(255,0,0,0.1)', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. PROJECTS */}
            {websiteTab === 'projects' && (
                <div style={{ display: 'grid', gap: '2rem' }}>
                    <div className="glass" style={{ padding: '2.5rem', borderRadius: '20px' }}>
                        <h2 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>🚀 Add Portfolio Project</h2>
                        <form onSubmit={handleProjectSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                            <div>
                                <label style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.8rem', display: 'block', fontWeight: '500' }}>Project Name</label>
                                <input placeholder="Project Name" value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} className="input-field" style={{ width: '100%', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} required />
                            </div>
                            <div>
                                <label style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.8rem', display: 'block', fontWeight: '500' }}>Description / URL</label>
                                <textarea placeholder="Give some context or a live link..." value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} className="input-field" style={{ width: '100%', height: '100px', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2.5rem', borderRadius: '12px', fontWeight: 'bold' }}>Add Project</button>
                            </div>
                        </form>
                    </div>
                    <div className="glass" style={{ padding: '1rem', borderRadius: '15px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: '#00ff88', borderBottom: '1px solid #333' }}>
                                    <th style={{ padding: '1rem' }}>Project</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((p: any) => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 'bold' }}>{p.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{p.description}</div>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button onClick={() => handleDeleteProject(p.id)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 5. RENTALS */}
            {websiteTab === 'rentals' && (
                <div style={{ display: 'grid', gap: '2rem' }}>
                    <div className="glass" style={{ padding: '2.5rem', borderRadius: '20px' }}>
                        <h2 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>🏘️ Add Rental Asset</h2>
                        <form onSubmit={handleRentalSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.8rem', display: 'block', fontWeight: '500' }}>Domain / Name</label>
                                <input placeholder="example.com" value={rentalForm.domain} onChange={e => setRentalForm({ ...rentalForm, domain: e.target.value })} className="input-field" style={{ width: '100%', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} required />
                            </div>
                            <div>
                                <label style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.8rem', display: 'block', fontWeight: '500' }}>Monthly Rent Price</label>
                                <input placeholder="$99/mo" value={rentalForm.price} onChange={e => setRentalForm({ ...rentalForm, price: e.target.value })} className="input-field" style={{ width: '100%', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} />
                            </div>
                            <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2.5rem', borderRadius: '12px', fontWeight: 'bold' }}>Add Asset</button>
                            </div>
                        </form>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {rentals.map((r: any) => (
                            <div key={r.id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#fff' }}>{r.domain}</div>
                                    <div style={{ color: '#00ff88', fontSize: '0.9rem' }}>{r.price}</div>
                                </div>
                                <button onClick={() => handleDeleteRental(r.id)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 6. REVIEWS */}
            {websiteTab === 'reviews' && (
                <div style={{ display: 'grid', gap: '2rem' }}>
                    <div className="glass" style={{ padding: '2.5rem', borderRadius: '20px' }}>
                        <h2 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>⭐ Add Client Feedback</h2>
                        <form onSubmit={handleReviewSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.8rem', display: 'block', fontWeight: '500' }}>Client Name</label>
                                    <input placeholder="e.g. John Doe" value={reviewForm.name} onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })} className="input-field" style={{ width: '100%', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} required />
                                </div>
                                <div>
                                    <label style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.8rem', display: 'block', fontWeight: '500' }}>Rating</label>
                                    <select
                                        value={reviewForm.rating}
                                        onChange={e => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                                        className="input-field"
                                        style={{ width: '100%', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#00ff88', fontWeight: 'bold' }}
                                    >
                                        {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{num} Stars</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.8rem', display: 'block', fontWeight: '500' }}>Review Content</label>
                                <textarea placeholder="What did they say about your work?" value={reviewForm.review} onChange={e => setReviewForm({ ...reviewForm, review: e.target.value })} className="input-field" style={{ width: '100%', height: '100px', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} required />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2.5rem', borderRadius: '12px', fontWeight: 'bold' }}>Add Review</button>
                            </div>
                        </form>
                    </div>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {reviews.map((r: any) => (
                            <div key={r.id} className="glass" style={{ padding: '1.5rem', borderRadius: '15px', position: 'relative' }}>
                                <div style={{ color: '#ffcc00', marginBottom: '0.5rem', fontSize: '1.2rem' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                                <p style={{ fontStyle: 'italic', color: '#eee', marginBottom: '1rem', lineHeight: '1.5' }}>"{r.review}"</p>
                                <div style={{ fontWeight: 'bold' }}>- {r.name}</div>
                                <button onClick={() => handleDeleteReview(r.id)} style={{ position: 'absolute', top: '20px', right: '20px', color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 7. MESSAGES */}
            {websiteTab === 'messages' && (
                <div className="glass" style={{ padding: '2.5rem', borderRadius: '20px' }}>
                    <h2 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>📬 Website Inquiries</h2>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {messages.length === 0 ? <p style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>Your inbox is clean. No messages!</p> : messages.map((m: any) => (
                            <div key={m.id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                    <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{m.name}</strong>
                                    <span style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(m.createdAt).toLocaleString()}</span>
                                </div>
                                <div style={{ color: '#00ff88', fontSize: '0.9rem', marginBottom: '1rem' }}>{m.email}</div>
                                <div style={{ color: '#ccc', lineHeight: '1.6', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>{m.message}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
