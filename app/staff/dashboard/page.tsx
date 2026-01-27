"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function StaffDashboard() {
    const [staff, setStaff] = useState<any>(null);
    const [inventory, setInventory] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]); // Leads State
    const [posts, setPosts] = useState<any[]>([]); // Marketing State
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('inventory'); // inventory, leads, marketing

    // Quick Sale State
    const [showSaleForm, setShowSaleForm] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [deliveryInfo, setDeliveryInfo] = useState<any>(null);
    const [saleData, setSaleData] = useState({
        salePrice: '',
        platform: 'Z2U',
        description: ''
    });

    // CRM / Marketing Forms
    const [showAddLead, setShowAddLead] = useState(false);
    const [newLead, setNewLead] = useState({ name: '', contact: '', source: 'Z2U', value: '', notes: '' });
    const [showAddPost, setShowAddPost] = useState(false);
    const [newPost, setNewPost] = useState({ content: '', platform: 'Twitter' });

    useEffect(() => {
        // 1. Check Session
        const stored = localStorage.getItem('staff_user');
        if (!stored) {
            window.location.href = '/staff/login';
            return;
        }
        const parsedUser = JSON.parse(stored);
        setStaff(parsedUser);

        // 2. Fetch Latest Profile (Permissions sync)
        fetchProfile(parsedUser.email);

        // 3. Initial Fetch Data
        fetchInventory(parsedUser);
        fetchLeads(parsedUser);
        fetchPosts();
    }, []);

    const fetchProfile = async (email: string) => {
        try {
            const res = await fetch(`/api/staff/profile?email=${email}`);
            const data = await res.json();
            if (data.id) {
                setStaff(data);
                localStorage.setItem('staff_user', JSON.stringify(data));
            }
        } catch (e) {
            console.error('Failed to sync profile');
        }
    };

    const fetchInventory = async (userObj: any) => {
        try {
            const res = await fetch(`/api/admin/inventory?type=inventory&role=staff&email=${userObj.email}`);
            const data = await res.json();
            setInventory(data);
        } catch (error) {
            console.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const fetchLeads = async (userObj: any) => {
        try {
            const res = await fetch(`/api/leads?role=staff&email=${userObj.email}`);
            setLeads(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/social');
            setPosts(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleAddLead = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'create', ...newLead, staffName: staff.name })
        });
        setShowAddLead(false);
        setNewLead({ name: '', contact: '', source: 'Z2U', value: '', notes: '' });
        fetchLeads(staff);
    };

    const handleAddPost = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/social', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'create', ...newPost, staffName: staff.name })
        });
        setShowAddPost(false);
        setNewPost({ content: '', platform: 'Twitter' });
        fetchPosts();
    };

    const handleSaleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/admin/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'record_sale',
                    description: saleData.description || `Sold: ${selectedItem?.name || 'Item'}`,
                    platform: saleData.platform,
                    salePrice: saleData.salePrice,
                    staffName: staff.name,
                    inventoryId: selectedItem?.id
                })
            });
            const data = await res.json();

            if (data.success) {
                if (data.delivery) {
                    setDeliveryInfo(data.delivery);
                    // Don't close form, switch to "Success View" inside the form container
                } else {
                    alert('Sale recorded successfully. (No delivery details found for this item)');
                    setShowSaleForm(false);
                    setSaleData({ salePrice: '', platform: 'Z2U', description: '' });
                    setSelectedItem(null);
                }
                // Refresh inventory?
                fetchInventory(staff); // Re-fetch to update status
            } else {
                alert('Error recording sale');
            }
        } catch (error) {
            alert('Error recording sale');
        }
    };

    const openSaleFor = (item: any) => {
        setSelectedItem(item);
        setSaleData({ ...saleData, description: `Sold: ${item.name}`, platform: item.platform || 'Z2U' });
        setShowSaleForm(true);
    };

    const handleUpdateStaffProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const res = await fetch('/api/staff/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: staff.id, email, password })
            });

            if (res.ok) {
                alert('Profile Updated. Please re-login.');
                localStorage.removeItem('staff_user');
                window.location.href = '/staff/login';
            } else {
                alert('Update Failed');
            }
        } catch (e) { alert('Error updating profile'); }
    };

    if (loading) return <div style={{ background: '#050505', minHeight: '100vh', padding: '100px', color: '#fff' }}>Loading Staff Portal...</div>;

    return (
        <main style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />
            <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Staff Workspace</h1>
                        <p style={{ color: '#888' }}>Welcome, {staff?.name} ({staff?.position})</p>
                    </div>
                    <button onClick={() => { localStorage.removeItem('staff_user'); window.location.href = '/staff/login'; }} className="btn btn-outline" style={{ color: '#ff4444', borderColor: '#444' }}>
                        Logout
                    </button>
                </div>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                    {[
                        { id: 'inventory', label: 'Inventory', permission: 'inventory' },
                        { id: 'leads', label: 'Leads', permission: 'leads' },
                        { id: 'marketing', label: 'Marketing', permission: 'marketing' },
                        { id: 'settings', label: 'Settings', permission: 'any' }
                    ].filter(tab => tab.permission === 'any' || staff?.permissions?.includes(tab.permission)).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: activeTab === tab.id ? '#00ff88' : '#888',
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                padding: '0.5rem 1rem',
                                borderBottom: activeTab === tab.id ? '2px solid #00ff88' : 'none'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem' }}>

                    {/* INVENTORY TAB */}
                    {activeTab === 'inventory' && (
                        <>
                            <div>
                                <h2 style={{ marginBottom: '1.5rem', color: '#00ff88' }}>Available Inventory</h2>
                                <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                                <th style={{ padding: '1.5rem' }}>Item Name</th>
                                                <th style={{ padding: '1.5rem' }}>Platform</th>
                                                <th style={{ padding: '1.5rem' }}>Status</th>
                                                <th style={{ padding: '1.5rem' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {inventory.length === 0 ? (
                                                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No inventory items found.</td></tr>
                                            ) : (
                                                inventory.map((item: any) => (
                                                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <td style={{ padding: '1.5rem' }}>{item.name}</td>
                                                        <td style={{ padding: '1.5rem' }}><span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', fontSize: '0.8rem' }}>{item.platform}</span></td>
                                                        <td style={{ padding: '1.5rem' }}><span style={{ color: '#00ff88' }}>● {item.status}</span></td>
                                                        <td style={{ padding: '1.5rem' }}><button onClick={() => openSaleFor(item)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Sell This</button></td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div>
                                <div className="glass" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid rgba(0,255,136,0.3)', position: 'sticky', top: '120px' }}>
                                    <h3 style={{ marginBottom: '1.5rem', color: '#fff' }}>{deliveryInfo ? '✅ Handover Details' : showSaleForm ? '⚡ Record Sale' : 'Select an item to sell'}</h3>
                                    {deliveryInfo ? (
                                        <div style={{ animation: 'fadeIn 0.5s' }}>
                                            <p style={{ color: '#aaa', marginBottom: '1rem' }}>Please pass these details to the buyer:</p>
                                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                                                <div style={{ marginBottom: '0.8rem' }}><label style={{ display: 'block', color: '#888', fontSize: '0.8rem' }}>Login</label><div style={{ color: '#fff', fontSize: '1.1rem', userSelect: 'all' }}>{deliveryInfo.details.username}</div></div>
                                                <div style={{ marginBottom: '0.8rem' }}><label style={{ display: 'block', color: '#888', fontSize: '0.8rem' }}>Password</label><div style={{ color: '#fff', fontSize: '1.1rem', userSelect: 'all' }}>{deliveryInfo.details.password}</div></div>
                                                {deliveryInfo.details.email && <div style={{ marginBottom: '0.8rem' }}><label style={{ display: 'block', color: '#888', fontSize: '0.8rem' }}>Email</label><div style={{ color: '#fff', fontSize: '0.9rem', userSelect: 'all' }}>{deliveryInfo.details.email}</div></div>}
                                            </div>
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <label style={{ display: 'block', color: '#00ff88', marginBottom: '0.5rem', fontSize: '0.9rem' }}>OR Share Link:</label>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <input readOnly value={`${window.location.origin}/delivery/${deliveryInfo.token}`} className="input-field" style={{ flex: 1, fontSize: '0.85rem' }} />
                                                    <button className="btn btn-outline" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/delivery/${deliveryInfo.token}`); alert('Link Copied!'); }}>Copy</button>
                                                </div>
                                            </div>
                                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setDeliveryInfo(null); setShowSaleForm(false); setSaleData({ salePrice: '', platform: 'Z2U', description: '' }); setSelectedItem(null); }}>Done</button>
                                        </div>
                                    ) : showSaleForm ? (
                                        <form onSubmit={handleSaleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                            <input className="input-field" value={saleData.description} onChange={e => setSaleData({ ...saleData, description: e.target.value })} required />
                                            <select className="input-field" value={saleData.platform} onChange={e => setSaleData({ ...saleData, platform: e.target.value })}><option value="Z2U">Z2U</option><option value="PlayerUp">PlayerUp</option><option value="Direct">Direct</option></select>
                                            <input type="number" className="input-field" value={saleData.salePrice} onChange={e => setSaleData({ ...saleData, salePrice: e.target.value })} placeholder="Price ($)" required />
                                            <button type="submit" className="btn btn-primary">Confirm Sale</button>
                                            <button type="button" onClick={() => setShowSaleForm(false)} className="btn btn-outline">Cancel</button>
                                        </form>
                                    ) : (
                                        <p style={{ color: '#666' }}>Select an item to sell.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* LEADS TAB */}
                    {activeTab === 'leads' && (
                        <>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ color: '#00ff88' }}>CRM / Leads</h2>
                                    <button onClick={() => setShowAddLead(true)} className="btn btn-primary">+ New Lead</button>
                                </div>
                                <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead><tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}><th style={{ padding: '1rem' }}>Name</th><th style={{ padding: '1rem' }}>Status</th><th style={{ padding: '1rem' }}>Value</th></tr></thead>
                                        <tbody>
                                            {leads.map((lead: any) => (
                                                <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontWeight: 'bold' }}>{lead.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{lead.contact}</div>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}><span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(0,100,255,0.2)' }}>{lead.status}</span></td>
                                                    <td style={{ padding: '1rem' }}>${lead.value}</td>
                                                </tr>
                                            ))}
                                            {leads.length === 0 && <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No leads.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div>
                                {showAddLead ? (
                                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid rgba(0,255,136,0.3)' }}>
                                        <h3>Add New Lead</h3>
                                        <form onSubmit={handleAddLead} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                            <input placeholder="Name" className="input-field" value={newLead.name} onChange={e => setNewLead({ ...newLead, name: e.target.value })} required />
                                            <input placeholder="Contact (Discord/Email)" className="input-field" value={newLead.contact} onChange={e => setNewLead({ ...newLead, contact: e.target.value })} />
                                            <input placeholder="Est. Value ($)" type="number" className="input-field" value={newLead.value} onChange={e => setNewLead({ ...newLead, value: e.target.value })} />
                                            <textarea placeholder="Notes" className="input-field" value={newLead.notes} onChange={e => setNewLead({ ...newLead, notes: e.target.value })} />
                                            <button type="submit" className="btn btn-primary">Save Lead</button>
                                            <button type="button" onClick={() => setShowAddLead(false)} className="btn btn-outline">Cancel</button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderRadius: '16px' }}>
                                        <p style={{ color: '#888' }}>Select a lead to edit or add a new one.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* MARKETING TAB */}
                    {activeTab === 'marketing' && (
                        <>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ color: '#00ff88' }}>Social Media Hub</h2>
                                    <button onClick={() => setShowAddPost(true)} className="btn btn-primary">+ Draft Post</button>
                                </div>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {posts.map((post: any) => (
                                        <div key={post.id} className="glass" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#888' }}>{post.platform} • {new Date(post.createdAt).toLocaleDateString()}</span>
                                                <span style={{ fontSize: '0.8rem', color: '#00ff88' }}>{post.status}</span>
                                            </div>
                                            <p style={{ marginBottom: '1rem' }}>{post.content}</p>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {post.platform === 'All' || post.platform === 'Twitter' ? (
                                                    <a
                                                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.content)}`}
                                                        target="_blank"
                                                        className="btn btn-outline"
                                                        style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', borderColor: '#1DA1F2', color: '#1DA1F2' }}
                                                    >
                                                        🐦 Tweet
                                                    </a>
                                                ) : null}

                                                {post.platform === 'All' || post.platform === 'Facebook' || post.platform === 'LinkedIn' ? (
                                                    <button
                                                        className="btn btn-outline"
                                                        style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(post.content);
                                                            alert('Content copied! Ready to paste on Facebook/LinkedIn.');
                                                        }}
                                                    >
                                                        📋 Copy for FB/LinkedIn
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                    {posts.length === 0 && <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>No posts yet.</div>}
                                </div>
                            </div>
                            <div>
                                {showAddPost ? (
                                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid rgba(0,255,136,0.3)' }}>
                                        <h3>Draft Social Post</h3>
                                        <form onSubmit={handleAddPost} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                            <select className="input-field" value={newPost.platform} onChange={e => setNewPost({ ...newPost, platform: e.target.value })}>
                                                <option value="Twitter">Twitter / X</option>
                                                <option value="Facebook">Facebook</option>
                                                <option value="Instagram">Instagram</option>
                                                <option value="LinkedIn">LinkedIn</option>
                                                <option value="All">All Platforms (Broadcast)</option>
                                            </select>
                                            <textarea placeholder="Post Content (Description, Hashtags...)" className="input-field" style={{ height: '100px' }} value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} required />
                                            <button type="submit" className="btn btn-primary">Save Draft</button>
                                            <button type="button" onClick={() => setShowAddPost(false)} className="btn btn-outline">Cancel</button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderRadius: '16px' }}>
                                        <p style={{ color: '#888' }}>Draft your next viral post here.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <div className="glass" style={{ padding: '2rem', borderRadius: '16px', maxWidth: '600px' }}>
                            <h2 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>My Profile</h2>
                            <form onSubmit={handleUpdateStaffProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Update Email</label>
                                    <input name="email" type="email" defaultValue={staff?.email} required className="input-field" style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Change Password (Optional)</label>
                                    <input name="password" type="password" placeholder="New Password" className="input-field" style={{ width: '100%' }} />
                                </div>
                                <button type="submit" className="btn btn-primary">Save Changes & Logout</button>
                            </form>
                        </div>
                    )}

                </div>
            </div>
            <Footer />
        </main>
    );
}
