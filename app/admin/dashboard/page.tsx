"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

type PageKey = 'terms' | 'privacy' | 'about';
type TabKey = 'blogs' | 'pages' | 'services' | 'reviews' | 'projects' | 'messages' | 'rentals' | 'promocodes' | 'tickets' | 'orders';

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabKey | 'settings' | 'products' | 'inbox'>('inbox');

    // Orders State
    const [orders, setOrders] = useState<any[]>([]);
    const [deliveryNote, setDeliveryNote] = useState('');
    const [deliveringId, setDeliveringId] = useState<string | null>(null);

    const fetchOrders = async () => { try { const res = await fetch('/api/admin/orders'); if (res.ok) setOrders(await res.json()); } catch { } };

    const handleDeliverOrder = async () => {
        if (!deliveringId || !deliveryNote) return;
        try {
            await fetch('/api/admin/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: deliveringId, status: 'completed', deliveryInfo: deliveryNote })
            });
            alert('Order Delivered & Email Sent!');
            setDeliveringId(null);
            setDeliveryNote('');
            fetchOrders();
        } catch (e) { alert('Delivery Failed'); }
    };

    // ... (existing state) ...

    // Promo Codes State
    const [promoCodes, setPromoCodes] = useState<any[]>([]);
    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [promoDiscountInput, setPromoDiscountInput] = useState('');
    const [isPromoSaving, setIsPromoSaving] = useState(false);

    // Messages State
    const [messages, setMessages] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>({
        mozId: '', mozKey: '',
        smtpHost: '', smtpUser: '', smtpPass: '',
        stripePublic: '', stripeSecret: '',
        cryptomusId: '', cryptomusKey: '',
        binanceKey: '', binanceSecret: '',
        telegramToken: ''
    });

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalAction, setModalAction] = useState<() => void>(() => { });

    // Blog State
    const [posts, setPosts] = useState<any[]>([]);
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pages State
    const [pagesData, setPagesData] = useState<Record<string, string>>({});
    const [selectedPage, setSelectedPage] = useState<PageKey | ''>('');
    const [pageContent, setPageContent] = useState('');
    const [isPageSaving, setIsPageSaving] = useState(false);

    // Services State
    const [services, setServices] = useState<any[]>([]);
    const [srvName, setSrvName] = useState('');
    const [srvDesc, setSrvDesc] = useState('');
    const [srvIcon, setSrvIcon] = useState('');
    const [isSrvSaving, setIsSrvSaving] = useState(false);

    // Reviews State
    const [reviews, setReviews] = useState<any[]>([]);
    const [revName, setRevName] = useState('');
    const [revRole, setRevRole] = useState('');
    const [revText, setRevText] = useState('');
    const [revRating, setRevRating] = useState(5);
    const [isRevSaving, setIsRevSaving] = useState(false);

    // Projects State
    const [projects, setProjects] = useState<any[]>([]);
    const [projTitle, setProjTitle] = useState('');
    const [projCat, setProjCat] = useState('');
    const [projDesc, setProjDesc] = useState('');
    const [projImage, setProjImage] = useState('');
    const [isProjSaving, setIsProjSaving] = useState(false);

    // Rentals State
    const [rentals, setRentals] = useState<any[]>([]);
    const [rentDomain, setRentDomain] = useState('');
    const [rentNiche, setRentNiche] = useState('');
    const [rentPrice, setRentPrice] = useState('');
    const [rentTraffic, setRentTraffic] = useState('');
    const [rentStatus, setRentStatus] = useState('Available');
    const [rentImage, setRentImage] = useState('');
    const [isRentSaving, setIsRentSaving] = useState(false);

    // Products Shop State
    const [productsInventory, setProductsInventory] = useState<any[]>([]);
    const [prodName, setProdName] = useState('');
    const [prodPlatform, setProdPlatform] = useState('Reddit');
    const [customPlatform, setCustomPlatform] = useState('');
    const [prodType, setProdType] = useState('account'); // 'account' or 'service'
    const [prodPrice, setProdPrice] = useState('');
    const [prodDesc, setProdDesc] = useState('');
    const [prodCreds, setProdCreds] = useState(''); // Secret credentials
    const [prodImage, setProdImage] = useState('');
    const [isProdSaving, setIsProdSaving] = useState(false);

    // ...


    // Tickets State
    const [tickets, setTickets] = useState<any[]>([]);
    const [replyMsg, setReplyMsg] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    const fetchTickets = async () => { try { const res = await fetch('/api/tickets?isAdmin=true'); if (res.ok) setTickets(await res.json()); } catch { } };

    // ... (existing state) ...

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/admin/check');
                if (res.status !== 200) {
                    router.push('/admin/login');
                } else {
                    fetchPosts();
                    fetchPages();
                    fetchServices();
                    fetchReviews();
                    fetchProjects();
                    fetchMessages();
                    fetchRentals();
                    fetchSettings();
                    fetchProducts();
                    fetchPromoCodes();
                    fetchTickets();
                    fetchOrders();
                }
            } catch (err) {
                router.push('/admin/login');
            }
        };
        checkAuth();
    }, []);

    const handleTicketReply = async (ticketId: string) => {
        if (!replyMsg) return;
        try {
            await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reply', ticketId, message: replyMsg, sender: 'admin' })
            });
            setReplyMsg('');
            setReplyingTo(null);
            fetchTickets();
            alert('Reply Sent');
        } catch (e) {
            alert('Failed to send');
        }
    };

    const fetchPosts = async () => { const res = await fetch('/api/blogs'); const data = await res.json(); setPosts(data); };
    const fetchPages = async () => { const res = await fetch('/api/pages'); const data = await res.json(); setPagesData(data); };
    const fetchServices = async () => { const res = await fetch('/api/services'); const data = await res.json(); setServices(data); };
    const fetchReviews = async () => { const res = await fetch('/api/testimonials?all=true'); const data = await res.json(); setReviews(data); };
    const fetchProjects = async () => { const res = await fetch('/api/projects'); const data = await res.json(); setProjects(data); };
    const fetchMessages = async () => { const res = await fetch('/api/messages'); const data = await res.json(); setMessages(data); };
    const fetchRentals = async () => { const res = await fetch('/api/rentals'); const data = await res.json(); setRentals(data); };
    const fetchPromoCodes = async () => { try { const res = await fetch('/api/promocodes'); if (res.ok) setPromoCodes(await res.json()); } catch { } };

    // Settings Logic
    const fetchSettings = async () => { try { const res = await fetch('/api/settings'); if (res.ok) setSettings(await res.json()); } catch { } };
    const saveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try { await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) }); alert('Settings Saved!'); } catch { alert('Failed to save settings'); }
    };

    // Promo Code Handlers
    const handlePromoSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setIsPromoSaving(true);
        try {
            const res = await fetch('/api/promocodes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: promoCodeInput, discount: promoDiscountInput })
            });
            const data = await res.json();
            if (data.success) {
                setPromoCodeInput('');
                setPromoDiscountInput('');
                fetchPromoCodes();
                alert('Promo Code Created!');
            } else {
                alert(data.error);
            }
        } catch (e) {
            alert('Failed to create code');
        } finally {
            setIsPromoSaving(false);
        }
    };

    const handleDeletePromo = async (id: number) => {
        if (!confirm('Delete this code?')) return;
        try {
            await fetch('/api/promocodes', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            fetchPromoCodes();
        } catch (e) { alert('Failed to delete'); }
    };

    // Blog Handlers
    const handleBlogSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setIsSubmitting(true);
        try {
            await fetch('/api/blogs', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, excerpt, content, category, image: image || 'https://images.unsplash.com/photo-1557683316-973673baf926', readTime: '5 min read' }),
            });
            setTitle(''); setExcerpt(''); setContent(''); setCategory(''); setImage(''); fetchPosts(); alert('Blog post published!');
        } catch (err) { console.error(err); alert('Failed to publish'); } finally { setIsSubmitting(false); }
    };

    // Page Handlers
    const handlePageSelect = (page: PageKey) => { setSelectedPage(page); setPageContent(pagesData[page] || ''); };
    const handlePageSave = async () => {
        if (!selectedPage) return; setIsPageSaving(true);
        try {
            const res = await fetch('/api/pages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page: selectedPage, content: pageContent }), });
            if (res.ok) { setPagesData(prev => ({ ...prev, [selectedPage]: pageContent })); alert('Page updated successfully!'); } else { alert('Failed to update page.'); }
        } catch (err) { console.error(err); alert('Error updating page.'); } finally { setIsPageSaving(false); }
    };

    // Service Handlers
    const handleServiceSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setIsSrvSaving(true);
        try {
            await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: srvName, desc: srvDesc, icon: srvIcon || '🔧' }) });
            setSrvName(''); setSrvDesc(''); setSrvIcon(''); fetchServices(); alert('Service added!');
        } catch (err) { console.error(err); alert('Failed to add service'); } finally { setIsSrvSaving(false); }
    };
    const handleDeleteService = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try { await fetch('/api/services', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); fetchServices(); } catch (err) { console.error(err); alert('Failed to delete'); }
    };

    // Project Handlers
    const handleProjectSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setIsProjSaving(true);
        try {
            await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: projTitle, category: projCat, description: projDesc, image: projImage }) });
            setProjTitle(''); setProjCat(''); setProjDesc(''); setProjImage(''); fetchProjects(); alert('Project added!');
        } catch (err) { console.error(err); alert('Failed to add project'); } finally { setIsProjSaving(false); }
    };
    const handleDeleteProject = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try { await fetch('/api/projects', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); fetchProjects(); } catch (err) { console.error(err); alert('Failed to delete'); }
    };

    // Rental Handlers
    const handleRentalSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setIsRentSaving(true);
        try {
            await fetch('/api/rentals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ domain: rentDomain, niche: rentNiche, price: rentPrice, traffic: rentTraffic, status: rentStatus, image: rentImage }) });
            setRentDomain(''); setRentNiche(''); setRentPrice(''); setRentTraffic(''); setRentStatus('Available'); setRentImage(''); fetchRentals(); alert('Rental Asset Added!');
        } catch (err) { console.error(err); alert('Failed to add asset'); } finally { setIsRentSaving(false); }
    };
    const handleDeleteRental = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try { await fetch('/api/rentals', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); fetchRentals(); } catch (err) { console.error(err); alert('Failed to delete'); }
    };

    // Product Shop Handlers
    const fetchProducts = async () => { try { const res = await fetch('/api/products'); if (res.ok) setProductsInventory(await res.json()); } catch { } };
    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setIsProdSaving(true);
        try {
            const finalPlatform = prodPlatform === 'Other' ? customPlatform : prodPlatform;
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: prodName,
                    platform: finalPlatform,
                    type: prodType,
                    price: prodPrice,
                    desc: prodDesc,
                    creds: prodType === 'account' ? prodCreds : '',
                    image: prodImage || 'https://img.icons8.com/color/480/shop.png'
                })
            });

            if (res.ok) {
                setProdName(''); setProdPrice(''); setProdDesc(''); setProdCreds(''); setProdImage(''); setCustomPlatform(''); fetchProducts(); alert('Item Added Successfully!');
            } else {
                const data = await res.json();
                alert('Error: ' + (data.error || 'Failed to add item'));
            }
        } catch (err) {
            console.error(err);
            alert('Failed to add product');
        } finally {
            setIsProdSaving(false);
        }
    };
    const handleDeleteProduct = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try { await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id }) }); fetchProducts(); } catch (err) { console.error(err); alert('Failed to delete'); }
    };

    // Review Handlers
    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setIsRevSaving(true);
        try {
            await fetch('/api/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: revName, role: revRole, review: revText, rating: revRating, isAdmin: true }) });
            setRevName(''); setRevRole(''); setRevText(''); setRevRating(5); fetchReviews(); alert('Review added!');
        } catch (err) { console.error(err); alert('Failed to add review'); } finally { setIsRevSaving(false); }
    };
    const handleApproveReview = async (id: number) => {
        try {
            await fetch('/api/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'approve', id }) });
            fetchReviews();
        } catch (err) { console.error(err); alert('Failed to approve'); }
    };
    const handleDeleteReview = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try { await fetch('/api/testimonials', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); fetchReviews(); } catch (err) { console.error(err); alert('Failed to delete'); }
    };

    return (
        <div style={{ paddingBottom: '5rem' }}>
            <Navbar />
            <div className="container" style={{ paddingTop: '120px' }}>
                <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setActiveTab('blogs')} className={`btn ${activeTab === 'blogs' ? 'btn-primary' : 'btn-outline'}`}>Manage Blogs</button>
                    <button onClick={() => setActiveTab('pages')} className={`btn ${activeTab === 'pages' ? 'btn-primary' : 'btn-outline'}`}>Edit Pages</button>
                    <button onClick={() => setActiveTab('services')} className={`btn ${activeTab === 'services' ? 'btn-primary' : 'btn-outline'}`}>Edit Services</button>
                    <button onClick={() => setActiveTab('projects')} className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-outline'}`}>Manage Projects</button>
                    <button onClick={() => setActiveTab('reviews')} className={`btn ${activeTab === 'reviews' ? 'btn-primary' : 'btn-outline'}`}>Manage Reviews</button>
                    <button onClick={() => setActiveTab('rentals')} className={`btn ${activeTab === 'rentals' ? 'btn-primary' : 'btn-outline'}`}>Manage Assets</button>
                    <button onClick={() => setActiveTab('settings')} className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-outline'}`}>Settings</button>
                    <button onClick={() => setActiveTab('products')} className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-outline'}`}>Manage Shop</button>
                    <button onClick={() => setActiveTab('promocodes')} className={`btn ${activeTab === 'promocodes' ? 'btn-primary' : 'btn-outline'}`}>Promo Codes</button>
                    <button onClick={() => setActiveTab('tickets')} className={`btn ${activeTab === 'tickets' ? 'btn-primary' : 'btn-outline'}`}>Support Tickets</button>
                    <button onClick={() => setActiveTab('orders')} className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}>Manage Orders</button>
                    <button onClick={() => setActiveTab('inbox')} className={`btn ${activeTab === 'inbox' ? 'btn-primary' : 'btn-outline'}`}>Inbox</button>
                </div>

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2>Orders ({orders.length})</h2>
                            <button onClick={fetchOrders} className="btn btn-outline" style={{ fontSize: '0.9rem' }}>Refresh</button>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ccc' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem' }}>Order ID</th>
                                        <th style={{ padding: '1rem' }}>User / Email</th>
                                        <th style={{ padding: '1rem' }}>Product</th>
                                        <th style={{ padding: '1rem' }}>Qty</th>
                                        <th style={{ padding: '1rem' }}>Amount</th>
                                        <th style={{ padding: '1rem' }}>Status</th>
                                        <th style={{ padding: '1rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((o: any) => (
                                        <tr key={o.orderId} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace' }}>#{o.orderId.substring(6)}</td>
                                            <td style={{ padding: '1rem' }}>{o.guestEmail || o.userId}</td>
                                            <td style={{ padding: '1rem' }}>{o.productId}</td>
                                            <td style={{ padding: '1rem' }}>{o.quantity || 1}</td>
                                            <td style={{ padding: '1rem' }}>${o.amount}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                                    background: o.status === 'paid' ? 'green' : o.status === 'completed' ? 'blue' : 'orange',
                                                    color: 'white'
                                                }}>
                                                    {o.status}
                                                </span>
                                                {o.delivery_status === 'delivered' && <span style={{ marginLeft: '5px' }}>✅</span>}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {o.status !== 'completed' && (
                                                    <button
                                                        onClick={() => setDeliveringId(o.orderId)}
                                                        className="btn btn-primary"
                                                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                                                    >
                                                        Deliver
                                                    </button>
                                                )}
                                                {o.status === 'completed' && <span style={{ color: '#00ff88', fontSize: '0.8rem' }}>Sent</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Delivery Modal */}
                        {deliveringId && (
                            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                                <div className="glass" style={{ padding: '2rem', width: '500px', maxWidth: '90%', borderRadius: '16px', background: '#111' }}>
                                    <h3 style={{ marginBottom: '1rem' }}>Deliver Order #{deliveringId}</h3>
                                    <p style={{ marginBottom: '1rem', color: '#888' }}>Enter the credentials, file link, or message to send to the customer via email.</p>
                                    <textarea
                                        className="input-field"
                                        placeholder="Download Link: https://... &#10;User: ... &#10;Pass: ..."
                                        style={{ height: '200px', fontFamily: 'monospace', marginBottom: '1rem' }}
                                        value={deliveryNote}
                                        onChange={e => setDeliveryNote(e.target.value)}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                        <button onClick={() => { setDeliveringId(null); setDeliveryNote(''); }} className="btn btn-outline">Cancel</button>
                                        <button onClick={handleDeliverOrder} className="btn btn-primary">Send & Complete</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tickets Tab */}
                {activeTab === 'tickets' && (
                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Support Tickets ({tickets.filter((t: any) => t.status === 'open').length} Open)</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {tickets.length === 0 ? <p>No tickets available.</p> : tickets.map((t: any) => (
                                <div key={t.id} className="card" style={{ padding: '1.5rem', borderLeft: t.status === 'open' ? '4px solid #00ff88' : '4px solid #555' }}>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>{t.subject} <span style={{ fontSize: '0.8rem', color: '#888' }}>({t.id})</span></h3>
                                        <span style={{ fontSize: '0.9rem', color: '#aaa' }}>{t.email}</span>
                                    </div>

                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', color: '#ccc', marginBottom: '1rem' }}>
                                        {t.message}
                                    </div>

                                    {/* Replies */}
                                    {t.replies && t.replies.length > 0 && (
                                        <div style={{ marginLeft: '1rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {t.replies.map((r: any, i: number) => (
                                                <div key={i} style={{ fontSize: '0.9rem', color: r.sender === 'admin' ? '#06b6d4' : '#ccc' }}>
                                                    <strong>{r.sender === 'admin' ? 'Admin' : 'User'}:</strong> {r.message}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Reply Box */}
                                    {replyingTo === t.id ? (
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <input
                                                value={replyMsg}
                                                onChange={e => setReplyMsg(e.target.value)}
                                                placeholder="Type a reply..."
                                                className="input-field"
                                                style={{ flex: 1 }}
                                            />
                                            <button onClick={() => handleTicketReply(t.id)} className="btn btn-primary">Send</button>
                                            <button onClick={() => setReplyingTo(null)} className="btn btn-outline">Cancel</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setReplyingTo(t.id)} className="btn btn-outline" style={{ fontSize: '0.9rem' }}>Reply</button>
                                    )}

                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                        <div className="glass" style={{ flex: 1, padding: '2rem', borderRadius: '16px', minWidth: '300px' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Add Product / Service</h2>
                            <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <select value={prodType} onChange={e => setProdType(e.target.value)} className="input-field" style={{ flex: 1 }}>
                                        <option value="account">Type: Account (Instant Delivery)</option>
                                        <option value="service">Type: Boosting Service (Manual)</option>
                                    </select>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <select value={prodPlatform} onChange={e => setProdPlatform(e.target.value)} className="input-field" style={{ width: '100%' }}>
                                            <option value="Reddit">Reddit</option>
                                            <option value="Instagram">Instagram</option>
                                            <option value="Facebook">Facebook</option>
                                            <option value="Discord">Discord</option>
                                            <option value="Other">Other (Custom)</option>
                                        </select>
                                        {prodPlatform === 'Other' && (
                                            <input
                                                placeholder="Enter Platform Name (e.g. Snapchat)"
                                                value={customPlatform}
                                                onChange={e => setCustomPlatform(e.target.value)}
                                                className="input-field"
                                            />
                                        )}
                                    </div>
                                </div>
                                <input placeholder="Product Name (e.g. 1000 Discord Members)" value={prodName} onChange={e => setProdName(e.target.value)} className="input-field" required />
                                <input placeholder="Price (e.g. $45)" value={prodPrice} onChange={e => setProdPrice(e.target.value)} className="input-field" required />
                                <textarea placeholder="Description (Public)" value={prodDesc} onChange={e => setProdDesc(e.target.value)} className="input-field" style={{ height: '80px' }} required />

                                {prodType === 'account' && (
                                    <textarea
                                        placeholder="Login Details / Download Link (Optional)"
                                        value={prodCreds}
                                        onChange={e => setProdCreds(e.target.value)}
                                        className="input-field"
                                        style={{ height: '100px', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', borderColor: '#00ff88' }}
                                    />
                                )}

                                <input placeholder="Image URL (Optional Icon)" value={prodImage} onChange={e => setProdImage(e.target.value)} className="input-field" />
                                <button type="submit" disabled={isProdSaving} className="btn btn-primary">{isProdSaving ? 'Saving...' : 'Add Item'}</button>
                            </form>
                        </div>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Inventory</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {productsInventory.map((item: any) => (
                                    <div key={item.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}>{item.platform}</div>
                                            <h4>{item.name}</h4>
                                            <div style={{ color: '#00ff88' }}>{item.price}</div>
                                        </div>
                                        <button onClick={() => handleDeleteProduct(item.id)} style={{ background: 'red', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Promo Codes Tab */}
                {activeTab === 'promocodes' && (
                    <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                        <div className="glass" style={{ flex: 1, padding: '2rem', borderRadius: '16px', minWidth: '300px' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Create Promo Code</h2>
                            <form onSubmit={handlePromoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input
                                    placeholder="Code (e.g. SUMMER20)"
                                    value={promoCodeInput}
                                    onChange={e => setPromoCodeInput(e.target.value)}
                                    className="input-field"
                                    required
                                    style={{ textTransform: 'uppercase' }}
                                />
                                <input
                                    type="number"
                                    placeholder="Discount Percentage (e.g. 20)"
                                    value={promoDiscountInput}
                                    onChange={e => setPromoDiscountInput(e.target.value)}
                                    className="input-field"
                                    required
                                    min="1"
                                    max="100"
                                />
                                <button type="submit" disabled={isPromoSaving} className="btn btn-primary">{isPromoSaving ? 'Creating...' : 'Create Code'}</button>
                            </form>
                        </div>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Active Codes</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {promoCodes.length === 0 ? <p style={{ color: '#888' }}>No active codes.</p> : promoCodes.map((code: any) => (
                                    <div key={code.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ color: '#00ff88', fontSize: '1.2rem' }}>{code.code}</h4>
                                            <div style={{ fontSize: '0.9rem', color: '#ccc' }}>{code.discount}% Off</div>
                                        </div>
                                        <button onClick={() => handleDeletePromo(code.id)} style={{ background: 'red', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Tab Content */}
                {activeTab === 'settings' && (
                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                        <h2 className="text-xl font-bold mb-4">System Configuration</h2>
                        <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>

                            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Moz API (For Official Metrics)</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>Moz Access ID</label>
                                        <input
                                            type="text"
                                            value={settings.mozId || ''}
                                            onChange={e => setSettings({ ...settings, mozId: e.target.value })}
                                            placeholder="moz-..."
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', color: 'white' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>Moz Secret Key</label>
                                        <input
                                            type="password"
                                            value={settings.mozKey || ''}
                                            onChange={e => setSettings({ ...settings, mozKey: e.target.value })}
                                            placeholder="Enter Secret Key"
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', color: 'white' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Payment Gateways</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ gridColumn: 'span 2' }}><h4 style={{ color: '#00ff88', marginBottom: '0.5rem' }}>Stripe (Credit Card)</h4></div>
                                    <input placeholder="Stripe Public Key" value={settings.stripePublic || ''} onChange={e => setSettings({ ...settings, stripePublic: e.target.value })} className="input-field" />
                                    <input type="password" placeholder="Stripe Secret Key" value={settings.stripeSecret || ''} onChange={e => setSettings({ ...settings, stripeSecret: e.target.value })} className="input-field" />

                                    <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}><h4 style={{ color: '#ffaa00', marginBottom: '0.5rem' }}>Cryptomus (Crypto)</h4></div>
                                    <input placeholder="Merchant ID" value={settings.cryptomusId || ''} onChange={e => setSettings({ ...settings, cryptomusId: e.target.value })} className="input-field" />
                                    <input type="password" placeholder="Payment Key" value={settings.cryptomusKey || ''} onChange={e => setSettings({ ...settings, cryptomusKey: e.target.value })} className="input-field" />

                                    <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}><h4 style={{ color: '#f3ba2f', marginBottom: '0.5rem' }}>Binance Pay</h4></div>
                                    <input placeholder="API Key" value={settings.binanceKey || ''} onChange={e => setSettings({ ...settings, binanceKey: e.target.value })} className="input-field" />
                                    <input type="password" placeholder="Secret Key" value={settings.binanceSecret || ''} onChange={e => setSettings({ ...settings, binanceSecret: e.target.value })} className="input-field" />
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Delivery Automation</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>Telegram Bot Token (For Alerts)</label>
                                        <input
                                            type="password"
                                            value={settings.telegramToken || ''}
                                            onChange={e => setSettings({ ...settings, telegramToken: e.target.value })}
                                            placeholder="123456:ABC-..."
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', color: 'white' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>Telegram Chat ID (Your ID)</label>
                                        <input
                                            type="text"
                                            value={settings.telegramChatId || ''}
                                            onChange={e => setSettings({ ...settings, telegramChatId: e.target.value })}
                                            placeholder="e.g. 987654321"
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', color: 'white' }}
                                        />
                                        <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>Get your ID by messaging @userinfobot on Telegram.</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Email SMTP (For Auto-Reports)</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>SMTP Host</label>
                                        <input
                                            type="text"
                                            value={settings.smtpHost || ''}
                                            onChange={e => setSettings({ ...settings, smtpHost: e.target.value })}
                                            placeholder="smtp.gmail.com"
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', color: 'white' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>SMTP User (Email)</label>
                                        <input
                                            type="text"
                                            value={settings.smtpUser || ''}
                                            onChange={e => setSettings({ ...settings, smtpUser: e.target.value })}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', color: 'white' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>SMTP Password</label>
                                        <input
                                            type="password"
                                            value={settings.smtpPass || ''}
                                            onChange={e => setSettings({ ...settings, smtpPass: e.target.value })}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', color: 'white' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '1rem', fontWeight: 'bold' }}
                            >
                                Save System Configuration
                            </button>
                        </form>
                    </div>
                )}

                {/* Blogs Tab */}
                {activeTab === 'blogs' && (
                    <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                        <div className="glass" style={{ flex: 1, padding: '2rem', borderRadius: '16px', minWidth: '300px' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Create New Post</h2>
                            <form onSubmit={handleBlogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="input-field" required />
                                <input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} className="input-field" required />
                                <textarea placeholder="Excerpt" value={excerpt} onChange={e => setExcerpt(e.target.value)} className="input-field" style={{ height: '80px' }} required />
                                <textarea placeholder="Content (HTML supported)" value={content} onChange={e => setContent(e.target.value)} className="input-field" style={{ height: '200px' }} required />
                                <input placeholder="Image URL" value={image} onChange={e => setImage(e.target.value)} className="input-field" />
                                <button type="submit" disabled={isSubmitting} className="btn btn-primary">{isSubmitting ? 'Publishing...' : 'Publish Post'}</button>
                            </form>
                        </div>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Existing Posts</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {posts.map(post => (
                                    <div key={post.id} className="card" style={{ padding: '1rem' }}>
                                        <h4>{post.title}</h4>
                                        <p style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>{post.date} • {post.category}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Pages Tab */}
                {activeTab === 'pages' && (
                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            {['about', 'terms', 'privacy'].map(p => (<button key={p} onClick={() => handlePageSelect(p as PageKey)} className={`btn ${selectedPage === p ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: '0.9rem', padding: '0.5rem 1.5rem', textTransform: 'capitalize' }}>{p}</button>))}
                        </div>
                        {selectedPage && (
                            <div>
                                <h2 style={{ marginBottom: '1rem', textTransform: 'capitalize' }}>Edit {selectedPage}</h2>
                                <textarea value={pageContent} onChange={e => setPageContent(e.target.value)} className="input-field" style={{ height: '400px', fontFamily: 'monospace' }} />
                                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <a href={`/${selectedPage}`} target="_blank" className="btn btn-outline">Preview Page</a>
                                    <button onClick={handlePageSave} disabled={isPageSaving} className="btn btn-primary">{isPageSaving ? 'Saving...' : 'Save Changes'}</button>
                                </div>
                            </div>
                        )}
                        {!selectedPage && <p>Select a page above to edit.</p>}
                    </div>
                )}

                {/* Services Tab */}
                {activeTab === 'services' && (
                    <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                        <div className="glass" style={{ flex: 1, padding: '2rem', borderRadius: '16px', minWidth: '300px' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Add Service</h2>
                            <form onSubmit={handleServiceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input placeholder="Service Name" value={srvName} onChange={e => setSrvName(e.target.value)} className="input-field" required />
                                <input placeholder="Icon (Emoji)" value={srvIcon} onChange={e => setSrvIcon(e.target.value)} className="input-field" />
                                <textarea placeholder="Description" value={srvDesc} onChange={e => setSrvDesc(e.target.value)} className="input-field" style={{ height: '100px' }} required />
                                <button type="submit" disabled={isSrvSaving} className="btn btn-primary">{isSrvSaving ? 'Saving...' : 'Add Service'}</button>
                            </form>
                        </div>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Current Services</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {services.map((srv: any) => (
                                    <div key={srv.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div><div style={{ fontSize: '1.5rem' }}>{srv.icon}</div><h4>{srv.title}</h4></div>
                                        <button onClick={() => handleDeleteService(srv.id)} style={{ background: 'red', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Projects Tab */}
                {/* Projects Tab */}
                {/* Projects Tab */}
                {activeTab === 'projects' && (
                    <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                        <div className="glass" style={{ flex: 1, padding: '2rem', borderRadius: '16px', minWidth: '300px' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Add Featured Project (Case Study)</h2>
                            <p style={{ color: '#aaa', marginBottom: '1rem' }}>"Real results we've delivered for our clients."</p>
                            <form onSubmit={handleProjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input placeholder="Project Title" value={projTitle} onChange={e => setProjTitle(e.target.value)} className="input-field" required />
                                <input placeholder="Category (e.g. Web Dev)" value={projCat} onChange={e => setProjCat(e.target.value)} className="input-field" required />
                                <input placeholder="Image URL (Unsplash or Local)" value={projImage} onChange={e => setProjImage(e.target.value)} className="input-field" required />
                                <textarea placeholder="Description (e.g. Scaled Discord to 50k members...)" value={projDesc} onChange={e => setProjDesc(e.target.value)} className="input-field" style={{ height: '100px' }} required />
                                <button type="submit" disabled={isProjSaving} className="btn btn-primary">{isProjSaving ? 'Saving...' : 'Add Case Study'}</button>
                            </form>
                        </div>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Current Projects</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {projects.map((proj: any) => (
                                    <div key={proj.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div><h4>{proj.title}</h4><p style={{ fontSize: '0.8rem', color: '#888' }}>{proj.category}</p></div>
                                        <button onClick={() => handleDeleteProject(proj.id)} style={{ background: 'red', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Rentals Tab */}
                {activeTab === 'rentals' && (
                    <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                        <div className="glass" style={{ flex: 1, padding: '2rem', borderRadius: '16px', minWidth: '300px' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Add Rental Asset</h2>
                            <form onSubmit={handleRentalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input placeholder="Domain (e.g. SahiwalPlumbers.com)" value={rentDomain} onChange={e => setRentDomain(e.target.value)} className="input-field" required />
                                <input placeholder="Niche (e.g. Plumbing)" value={rentNiche} onChange={e => setRentNiche(e.target.value)} className="input-field" required />
                                <input placeholder="Price (e.g. $500)" value={rentPrice} onChange={e => setRentPrice(e.target.value)} className="input-field" required />
                                <input placeholder="Monthly Traffic (e.g. 1.2k)" value={rentTraffic} onChange={e => setRentTraffic(e.target.value)} className="input-field" required />
                                <select value={rentStatus} onChange={e => setRentStatus(e.target.value)} className="input-field">
                                    <option value="Available">Available</option>
                                    <option value="Rented">Rented</option>
                                </select>
                                <input placeholder="Image URL (optional)" value={rentImage} onChange={e => setRentImage(e.target.value)} className="input-field" />
                                <button type="submit" disabled={isRentSaving} className="btn btn-primary">{isRentSaving ? 'Saving...' : 'Add Asset'}</button>
                            </form>
                        </div>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Manage Assets</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {rentals.map((r: any) => (
                                    <div key={r.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4>{r.domain}</h4>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}>{r.price}/mo • <span style={{ color: r.status === 'Available' ? 'green' : 'red' }}>{r.status}</span></div>
                                        </div>
                                        <button onClick={() => handleDeleteRental(r.id)} style={{ background: 'red', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                        <div className="glass" style={{ flex: 1, padding: '2rem', borderRadius: '16px', minWidth: '300px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0 }}>Add Testimonial</h2>
                                <button
                                    onClick={async () => {
                                        if (!confirm("Generate 5 random 5-star reviews?")) return;
                                        try {
                                            await fetch('/api/admin/generate-reviews', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ count: 5 })
                                            });
                                            fetchReviews();
                                            alert("5 Reviews Added!");
                                        } catch (e) { alert("Failed"); }
                                    }}
                                    style={{ fontSize: '0.8rem', background: '#333', color: '#aaa', border: '1px solid #444', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    ⚡ Auto-Seed (5)
                                </button>
                            </div>
                            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input placeholder="Client Name" value={revName} onChange={e => setRevName(e.target.value)} className="input-field" required />
                                <input placeholder="Role (e.g. CEO)" value={revRole} onChange={e => setRevRole(e.target.value)} className="input-field" required />
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#888' }}>Rating: {revRating} Stars</label>
                                    <input type="range" min="1" max="5" value={revRating} onChange={e => setRevRating(parseInt(e.target.value))} style={{ width: '100%' }} />
                                </div>
                                <textarea placeholder="Review Text" value={revText} onChange={e => setRevText(e.target.value)} className="input-field" style={{ height: '100px' }} required />
                                <button type="submit" disabled={isRevSaving} className="btn btn-primary">{isRevSaving ? 'Saving...' : 'Add Review'}</button>
                            </form>
                        </div>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Manage Reviews</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {reviews.length === 0 ? <p style={{ color: '#666' }}>No reviews found.</p> : reviews.map((rev: any) => (
                                    <div key={rev.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: rev.approved ? '4px solid #00ff88' : '4px solid #ffaa00' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <h4 style={{ margin: 0 }}>{rev.name}</h4>
                                                <span style={{ fontSize: '0.7rem', background: rev.approved ? '#006400' : '#8b4513', padding: '2px 6px', borderRadius: '4px' }}>
                                                    {rev.approved ? 'LIVE' : 'PENDING'}
                                                </span>
                                            </div>
                                            <div style={{ color: '#ffaa00', fontSize: '0.8rem', margin: '0.2rem 0' }}>{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</div>
                                            <p style={{ fontSize: '0.8rem', color: '#ccc', margin: 0 }}>{rev.review.substring(0, 60)}...</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {!rev.approved && (
                                                <button onClick={() => handleApproveReview(rev.id)} style={{ background: '#00ff88', border: 'none', color: '#000', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Approve</button>
                                            )}
                                            <button onClick={() => handleDeleteReview(rev.id)} style={{ background: '#ff4444', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages Tab */}
                {activeTab === 'messages' && (
                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Inbox</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {messages.length === 0 ? <p>No messages yet.</p> : messages.map((msg: any) => (
                                <div key={msg.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '4px solid var(--accent)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#888' }}>
                                        <span>{msg.date}</span>
                                        <span style={{ color: 'white' }}>{msg.email}</span>
                                    </div>
                                    <h4 style={{ fontSize: '1.1rem' }}>{msg.name} <span style={{ fontWeight: 400, color: '#aaa', fontSize: '0.9rem' }}>- {msg.service}</span></h4>
                                    <p style={{ color: '#eee', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>{msg.message}</p>

                                    {msg.reportDetails && (
                                        <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                                            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                                <div>
                                                    <strong>Load Time:</strong> {msg.reportDetails.loadTime}ms
                                                </div>
                                                <div>
                                                    <strong>Words:</strong> {msg.reportDetails.wordCount}
                                                </div>
                                            </div>

                                            {msg.reportDetails.techStack && (
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <strong>Tech Stack:</strong>
                                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                                        {msg.reportDetails.techStack.map((t: string, i: number) => (
                                                            <span key={i} style={{ background: '#4f46e5', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{t}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {msg.reportDetails.topKeywords && (
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <strong>Keywords:</strong>
                                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                                        {msg.reportDetails.topKeywords.map((k: any, i: number) => (
                                                            <span key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{k.word} ({k.count})</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {msg.reportDetails.issues && msg.reportDetails.issues.length > 0 && (
                                                <div style={{ marginTop: '1rem' }}>
                                                    <strong style={{ color: '#ff4444' }}>Critical Issues to Fix:</strong>
                                                    <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', color: '#ff8888' }}>
                                                        {msg.reportDetails.issues.map((issue: string, i: number) => (
                                                            <li key={i}>{issue}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <style jsx>{`
        .input-field { width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); color: white; font-family: inherit; }
        .input-field:focus { outline: none; border-color: var(--primary); }
      `}</style>
        </div>
    );
}
