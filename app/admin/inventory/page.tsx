"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdminDashboard() {
    const [inventory, setInventory] = useState<any[]>([]);
    const [balanceHistory, setBalanceHistory] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'leads', 'marketing'
    const [showAddInv, setShowAddInv] = useState(false);
    const [showRecordSale, setShowRecordSale] = useState(false);

    // Filter Stats
    const [stats, setStats] = useState({
        z2u: 0,
        playerup: 0,
        direct: 0,
        g2g: 0,
        total: 0,
        profit: 0,
        margin: 0,
        stockValue: 0,
        deptBreakdown: {} as any
    });
    const [settings, setSettings] = useState<any>({}); // API Keys
    const [employees, setEmployees] = useState<any[]>([]);
    const [showAddStaff, setShowAddStaff] = useState(false);
    const [newEmp, setNewEmp] = useState({
        name: '',
        password: '',
        email: '',
        position: '',
        department: '',
        salary: '',
        commissionRate: '',
        compensationType: 'Fixed', // 'Fixed' or 'Commission'
        allowedPlatforms: [] as string[]
    });
    const [tickets, setTickets] = useState<any[]>([]);
    const [activeTicketId, setActiveTicketId] = useState<number | null>(null);
    const [replyMsg, setReplyMsg] = useState('');

    // Forms
    const [newItem, setNewItem] = useState<{
        name: string;
        platform: string;
        purchasePrice: string;
        username?: string;
        password?: string;
        email?: string;
        extraInfo?: string;
    }>({ name: '', platform: 'Z2U', purchasePrice: '' });
    const [showAddPost, setShowAddPost] = useState(false);
    const [newPost, setNewPost] = useState<{ content: string; platforms: string[] }>({ content: '', platforms: ['All'] });
    const [newSale, setNewSale] = useState({ description: '', platform: 'Z2U', salePrice: '', staffName: 'Admin', proofImage: '', inventoryId: '' });
    const [deliveryLink, setDeliveryLink] = useState('');
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showAddFunds, setShowAddFunds] = useState(false);
    const [fundForm, setFundForm] = useState({ platform: 'Meezan', amount: '', currency: 'PKR', description: '' });

    // Bulk Import State
    const [isBulk, setIsBulk] = useState(false);
    const [bulkData, setBulkData] = useState('');
    const [logs, setLogs] = useState<any[]>([]);

    // View Mode for Inventory
    const [viewMode, setViewMode] = useState<'summary' | 'list'>('summary');
    const [catalog, setCatalog] = useState<any[]>([]);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', platform: 'Z2U', price: '', description: '', image: '' });
    const [orders, setOrders] = useState<any[]>([]);

    // Fulfillment
    const [showFulfill, setShowFulfill] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [fulfillDetails, setFulfillDetails] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [invRes, balRes, leadsRes, postsRes, settingsRes, empRes, logsRes, catRes, ordersRes] = await Promise.all([
                fetch('/api/admin/inventory?type=inventory'),
                fetch('/api/admin/inventory?type=balance'),
                fetch('/api/leads'),
                fetch('/api/social'),
                fetch('/api/admin/settings'),
                fetch('/api/hr/employees'),
                fetch('/api/admin/logs'),
                fetch('/api/products'),
                fetch('/api/admin/orders')
            ]);

            const invData = await invRes.json();
            const balData = await balRes.json();
            const leadsData = await leadsRes.json();
            const postsData = await postsRes.json();
            const settingsData = await settingsRes.json();
            const empData = await empRes.json();
            const logsData = await logsRes.json();
            const catData = await catRes.json();
            const ordersData = await ordersRes.json();

            // Fail-safe Ticket Fetch (Don't crash if DB is down)
            let ticketData = [];
            try {
                const tRes = await fetch('/api/tickets');
                if (tRes.ok) ticketData = await tRes.json();
            } catch (e) { console.warn("Tickets fetch failed"); }

            setInventory(invData);
            setBalanceHistory(balData);
            setLeads(leadsData);
            setPosts(postsData);
            setSettings(settingsData);
            setEmployees(empData);
            setLogs(logsData);
            setCatalog(catData);
            setOrders(ordersData);
            setTickets(ticketData);
            calculateStats(balData, empData, invData);
        } catch (e) {
            console.error("Failed to load admin data", e);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (history: any[], staffList: any[], inventoryList: any[]) => {
        const newStats = { z2u: 0, playerup: 0, direct: 0, g2g: 0, total: 0, profit: 0, margin: 0, stockValue: 0, deptBreakdown: {} as any };

        // Calculate Stock Assets
        if (inventoryList) {
            inventoryList.forEach(item => {
                if (item.status === 'In Stock') {
                    newStats.stockValue += Number(item.purchasePrice || 0);
                }
            });
        }

        history.forEach(t => {
            const amount = Number(t.amount);

            // Platform Stats
            if (t.platform === 'Z2U') newStats.z2u += amount;
            else if (t.platform === 'PlayerUp') newStats.playerup += amount;
            else if (t.platform === 'Direct') newStats.direct += amount;
            else if (t.platform === 'G2G') newStats.g2g += amount;
            newStats.total += amount;

            // Profit Calculation
            let cost = 0;
            if (t.inventoryId) {
                const item = inventoryList.find(i => i.id === t.inventoryId);
                if (item) cost = Number(item.purchasePrice || 0);
            }
            newStats.profit += (amount - cost);

            // Department Stats
            // Find staff
            const staff = staffList.find(e => e.name === t.processedBy);
            const dept = staff ? staff.department : (t.processedBy === 'Admin' ? 'Admin' : 'Unknown');

            if (!newStats.deptBreakdown[dept]) newStats.deptBreakdown[dept] = 0;
            newStats.deptBreakdown[dept] += amount;
        });

        if (newStats.total > 0) newStats.margin = (newStats.profit / newStats.total) * 100;
        setStats(newStats);
    };

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...newEmp,
                salary: newEmp.compensationType === 'Fixed' ? Number(newEmp.salary) : 0,
                commissionRate: newEmp.compensationType === 'Commission' ? Number(newEmp.commissionRate) : 0
            };

            const res = await fetch('/api/hr/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Staff Added Successfully');
                setShowAddStaff(false);
                setNewEmp({ name: '', email: '', password: '', position: '', department: '', salary: '', commissionRate: '', compensationType: 'Fixed', allowedPlatforms: [] });
                fetchData();
            } else {
                alert('Failed to add staff');
            }
        } catch (error) {
            console.error(error);
            alert('Error adding staff');
        }
    };

    const handleReplyTicket = async (ticketId: number) => {
        if (!replyMsg) return;
        try {
            await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reply', ticketId, message: replyMsg, sender: 'admin' })
            });
            setReplyMsg('');
            alert('Reply Sent');
            fetchData();
        } catch { alert('Failed to send reply'); }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/admin/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        alert('API Keys Saved Securely!');
    };

    const handleAddPost = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/social', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'create', ...newPost, staffName: 'Admin' })
        });
        setShowAddPost(false);
        setNewPost({ content: '', platforms: ['All'] });
        fetchData();
    };

    const handleFulfill = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder || !fulfillDetails) return;

        try {
            const res = await fetch('/api/admin/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: selectedOrder.orderId, credentials: fulfillDetails })
            });
            const data = await res.json();
            if (data.success) {
                alert('Order Fulfilled Successfully! Email sent to customer.');
                setShowFulfill(false);
                setFulfillDetails('');
                fetchData();
            } else {
                alert('Fulfillment Error: ' + data.error);
            }
        } catch (e) { alert('Network Error'); }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newProduct, action: 'create' })
        });
        setShowAddProduct(false);
        setNewProduct({ name: '', platform: 'Z2U', price: '', description: '', image: '' });
        fetchData();
    };

    const handleAddInventory = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/admin/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'add_inventory', ...newItem })
        });
        setShowAddInv(false);
        setNewItem({ name: '', platform: 'Z2U', purchasePrice: '' });
        fetchData();
    };

    const handleBulkImport = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/admin/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'bulk_import',
                bulkData,
                platform: newItem.platform,
                purchasePrice: newItem.purchasePrice,
                namePrefix: newItem.name
            })
        });
        setShowAddInv(false);
        setBulkData('');
        fetchData();
    };

    const handleRecordSale = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/admin/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'record_sale', ...newSale })
        });
        setShowRecordSale(false);
        setNewSale({ description: '', platform: 'Z2U', salePrice: '', staffName: 'Admin', proofImage: '', inventoryId: '' });
        fetchData();
    };

    const handleAddFunds = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/finance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'add_funds', ...fundForm, staffName: 'Admin' })
        });
        setShowAddFunds(false);
        setFundForm({ platform: 'Meezan', amount: '', currency: 'PKR', description: '' });
        fetchData();
    };

    if (loading) return (
        <div style={{
            background: '#050505',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: '1.5rem'
        }}>
            <div className="loader" style={{ width: '60px', height: '60px', borderTopColor: '#00ff88', borderRightColor: 'rgba(0, 255, 136, 0.2)', borderBottomColor: 'rgba(0, 255, 136, 0.2)', borderLeftColor: 'rgba(0, 255, 136, 0.2)' }}></div>
            <h2 style={{
                color: '#fff',
                fontSize: '1.5rem',
                background: 'linear-gradient(90deg, #fff, #444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
                letterSpacing: '1px'
            }}>
                LOADING WORKSPACE
            </h2>
        </div>
    );

    return (
        <main style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />
            <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Admin Workspace</h1>
                    <button onClick={() => { localStorage.removeItem('admin_user'); window.location.href = '/admin/login'; }} className="btn btn-outline" style={{ color: '#ff4444', borderColor: '#444' }}>
                        Logout
                    </button>
                </div>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem', overflowX: 'auto' }}>
                    {[
                        { id: 'inventory', label: '📦 Orders' },
                        { id: 'catalog', label: '🛍️ Catalog' },
                        { id: 'sales', label: '💰 Finance' },
                        { id: 'leads', label: '👥 Leads' },
                        { id: 'support', label: '🎫 Support' },
                        { id: 'marketing', label: '📢 Marketing' },
                        { id: 'hr', label: '👔 HR' },
                        { id: 'logs', label: '📜 Logs' },
                        { id: 'settings', label: '⚙️ Settings' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                background: activeTab === tab.id ? 'rgba(0,255,136,0.1)' : 'transparent',
                                border: 'none',
                                color: activeTab === tab.id ? '#00ff88' : '#888',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                padding: '0.6rem 1.2rem',
                                borderRadius: '8px',
                                transition: 'all 0.2s',
                                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* INVENTORY TAB */}
                {/* ORDERS TAB (Formerly Inventory) */}
                {activeTab === 'inventory' && (
                    <div className="FadeIn">
                        <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-outfit)' }}>📦 Customer Orders</h2>

                        <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <tr>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Order ID</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Product</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Customer</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order: any) => (
                                        <tr key={order.orderId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem' }}>{new Date(order.date).toLocaleDateString()}</td>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace' }}>#{order.orderId ? order.orderId.slice(-6) : 'N/A'}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: 'bold' }}>{order.product_name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>{order.platform}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div>{order.guestEmail || 'Registered User'}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                                                    background: order.status === 'completed' ? 'rgba(0,255,136,0.2)' : 'rgba(255,165,0,0.2)',
                                                    color: order.status === 'completed' ? '#00ff88' : '#ffa500'
                                                }}>
                                                    {order.status ? order.status.toUpperCase() : 'PENDING'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {order.status !== 'completed' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setShowFulfill(true);
                                                        }}
                                                        className="btn btn-primary"
                                                        style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                                                    >
                                                        Fulfill
                                                    </button>
                                                )}
                                                {order.status === 'completed' && <span style={{ color: '#666', fontSize: '0.8rem' }}>Delivered</span>}
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>No orders found yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>

                        {/* Fulfill Modal */}
                        {showFulfill && selectedOrder && (
                            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                                <div className="glass" style={{ padding: '2rem', borderRadius: '16px', width: '500px', maxWidth: '90%' }}>
                                    <h3 style={{ marginBottom: '1rem' }}>Fulfill Order #{selectedOrder.orderId.slice(-6)}</h3>
                                    <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>Send delivery details for <b>{selectedOrder.product_name}</b> to <b>{selectedOrder.guestEmail}</b>.</p>

                                    <form onSubmit={handleFulfill}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#00ff88' }}>Credentials / Delivery Info</label>
                                        <textarea
                                            className="input-field"
                                            rows={6}
                                            placeholder="Enter Email:Password or Download Link here..."
                                            value={fulfillDetails}
                                            onChange={e => setFulfillDetails(e.target.value)}
                                            required
                                            style={{ width: '100%', marginBottom: '1.5rem', fontFamily: 'monospace' }}
                                        />

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                            <button type="button" onClick={() => setShowFulfill(false)} className="btn btn-outline">Cancel</button>
                                            <button type="submit" className="btn btn-primary">Complete & Send Email</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* CATALOG TAB */}
                {activeTab === 'catalog' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>🛍️ Shop Product Catalog</h2>
                            <button onClick={() => setShowAddProduct(true)} className="btn btn-primary">+ Add Shop Product</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {catalog.map((prod: any) => (
                                <div key={prod.id} className="glass" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                        <div style={{ width: '80px', height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#222', borderRadius: '50%', fontSize: '2rem' }}>
                                            {prod.image && prod.image.length > 10 ? <img src={prod.image} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : '📦'}
                                        </div>
                                    </div>
                                    <div style={{ padding: '1.5rem' }}>
                                        <h3 style={{ marginBottom: '0.5rem', color: '#fff' }}>{prod.name}</h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                            <span>{prod.platform}</span>
                                            <span style={{ color: '#00ff88', fontWeight: 'bold' }}>${prod.price}</span>
                                        </div>
                                        <button className="btn btn-outline" style={{ width: '100%', fontSize: '0.8rem' }}>Edit Details</button>
                                    </div>
                                </div>
                            ))}
                            {catalog.length === 0 && <p style={{ color: '#666' }}>No products in catalog. Add one to start selling.</p>}
                        </div>

                        {showAddProduct && (
                            <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px', border: '1px solid #00ff88', marginTop: '2rem' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Add New Product to Shop</h3>
                                <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div><label style={{ color: '#ccc' }}>Product Name</label><input className="input-field" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required style={{ width: '100%' }} /></div>
                                    <div><label style={{ color: '#ccc' }}>Category / Platform</label><input className="input-field" value={newProduct.platform} onChange={e => setNewProduct({ ...newProduct, platform: e.target.value })} placeholder="e.g. Discord, Snapchat" required style={{ width: '100%' }} /></div>
                                    <div><label style={{ color: '#ccc' }}>Price ($)</label><input type="number" className="input-field" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required style={{ width: '100%' }} /></div>
                                    <div><label style={{ color: '#ccc' }}>Image URL (Optional)</label><input className="input-field" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} style={{ width: '100%' }} placeholder="https://..." /></div>
                                    <div style={{ gridColumn: 'span 2' }}><label style={{ color: '#ccc' }}>Description</label><textarea className="input-field" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} style={{ width: '100%', height: '80px' }} /></div>
                                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                        <button type="button" onClick={() => setShowAddProduct(false)} className="btn btn-outline">Cancel</button>
                                        <button type="submit" className="btn btn-primary">Create Product</button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                )}

                {/* SALES TAB */}
                {activeTab === 'sales' && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            {/* PKR Wallet */}
                            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0,255,136,0.2)' }}>
                                <h3 style={{ color: '#00ff88', marginBottom: '1rem' }}>🇵🇰 PKR Wallets</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                                    <span style={{ color: '#ccc' }}>Meezan Bank</span>
                                    <span style={{ fontWeight: 'bold' }}>₨ {balanceHistory.filter((t: any) => t.platform === 'Meezan').reduce((sum: number, t: any) => sum + Number(t.amount), 0).toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#ccc' }}>UBL / Other</span>
                                    <span style={{ fontWeight: 'bold' }}>₨ {balanceHistory.filter((t: any) => t.platform === 'UBL').reduce((sum: number, t: any) => sum + Number(t.amount), 0).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* USD Wallet */}
                            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0,100,255,0.2)' }}>
                                <h3 style={{ color: '#4dacff', marginBottom: '1rem' }}>🇺🇸 USD Accounts</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                                    <span style={{ color: '#ccc' }}>Z2U</span>
                                    <span style={{ fontWeight: 'bold' }}>$ {balanceHistory.filter((t: any) => t.platform === 'Z2U').reduce((sum: number, t: any) => sum + Number(t.amount), 0).toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                                    <span style={{ color: '#ccc' }}>PlayerUp / G2G</span>
                                    <span style={{ fontWeight: 'bold' }}>$ {balanceHistory.filter((t: any) => ['PlayerUp', 'G2G'].includes(t.platform)).reduce((sum: number, t: any) => sum + Number(t.amount), 0).toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#ccc' }}>RedotPay</span>
                                    <span style={{ fontWeight: 'bold' }}>$ {balanceHistory.filter((t: any) => t.platform === 'RedotPay').reduce((sum: number, t: any) => sum + Number(t.amount), 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ color: '#ffd700', margin: 0 }}>💰 Transaction History</h2>
                                <button onClick={() => setShowAddFunds(true)} className="btn btn-primary" style={{ background: 'rgba(255,255,255,0.1)' }}>+ Add Funds / Adjustment</button>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                    <tr>
                                        <th style={{ padding: '1rem' }}>Description</th>
                                        <th style={{ padding: '1rem' }}>Source</th>
                                        <th style={{ padding: '1rem' }}>By</th>
                                        <th style={{ padding: '1rem' }}>Date</th>
                                        <th style={{ padding: '1rem' }}>Amount</th>
                                        <th style={{ padding: '1rem' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {balanceHistory && balanceHistory.length > 0 ? balanceHistory.map((sale: any) => (
                                        <tr key={sale.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem' }}>{sale.description}</td>
                                            <td style={{ padding: '1rem' }}>{sale.platform}</td>
                                            <td style={{ padding: '1rem' }}>{sale.processedBy}</td>
                                            <td style={{ padding: '1rem', color: '#888', fontSize: '0.85rem' }}>{sale.date ? new Date(sale.date).toLocaleDateString() : 'N/A'}</td>
                                            <td style={{ padding: '1rem', color: Number(sale.amount) >= 0 ? '#00ff88' : '#ff4444', fontWeight: 'bold' }}>
                                                {sale.currency === 'PKR' ? '₨ ' : '$ '}
                                                {Number(sale.amount).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {sale.deliveryToken ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(`${window.location.origin}/delivery/${sale.deliveryToken}`);
                                                                setCopiedId(sale.id);
                                                                setTimeout(() => setCopiedId(null), 2000);
                                                            }}
                                                            style={{
                                                                background: copiedId === sale.id ? 'rgba(0,255,136,0.3)' : 'rgba(0,255,136,0.1)',
                                                                border: '1px solid #00ff88',
                                                                color: '#00ff88',
                                                                borderRadius: '4px',
                                                                padding: '0.4rem 0.8rem',
                                                                cursor: 'pointer',
                                                                fontSize: '0.8rem',
                                                                minWidth: '100px',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            {copiedId === sale.id ? '✅ Copied' : '🔗 Copy Link'}
                                                        </button>
                                                        <span title={`Link Viewed ${sale.deliveryViews || 0} times`} style={{ fontSize: '0.8rem', color: '#aaa' }}>
                                                            👁️ {sale.deliveryViews || 0}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#666', fontSize: '0.8rem' }}>{sale.type === 'manual_adjustment' ? 'Adjusted' : 'Direct Sale'}</span>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No financial activity yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Add Funds Modal */}
                        {showAddFunds && (
                            <div className="glass" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid rgba(0,255,136,0.3)', marginTop: '2rem' }}>
                                <h3 style={{ marginBottom: '1.5rem' }}>Add / Subtract Funds</h3>
                                <form onSubmit={handleAddFunds} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Platform / Bank</label>
                                        <select className="input-field" value={fundForm.platform} onChange={e => {
                                            const p = e.target.value;
                                            const c = (p === 'Meezan' || p === 'UBL') ? 'PKR' : 'USD';
                                            setFundForm({ ...fundForm, platform: p, currency: c });
                                        }} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333' }}>
                                            <option value="Meezan">Meezan Bank</option>
                                            <option value="UBL">UBL</option>
                                            <option value="Z2U">Z2U</option>
                                            <option value="PlayerUp">PlayerUp</option>
                                            <option value="G2G">G2G</option>
                                            <option value="RedotPay">RedotPay</option>
                                            <option value="Direct">Cash / Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Amount ({fundForm.currency})</label>
                                        <input type="number" required className="input-field" value={fundForm.amount} onChange={e => setFundForm({ ...fundForm, amount: e.target.value })} placeholder="e.g. 5000 or -50" style={{ width: '100%' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Currency</label>
                                        <select className="input-field" value={fundForm.currency} onChange={e => setFundForm({ ...fundForm, currency: e.target.value })} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333' }}>
                                            <option value="USD">USD ($)</option>
                                            <option value="PKR">PKR (₨)</option>
                                        </select>
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Description</label>
                                        <input type="text" className="input-field" placeholder="Reason for adjustment..." value={fundForm.description} onChange={e => setFundForm({ ...fundForm, description: e.target.value })} style={{ width: '100%' }} />
                                    </div>
                                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                        <button type="button" onClick={() => setShowAddFunds(false)} className="btn btn-outline">Cancel</button>
                                        <button type="submit" className="btn btn-primary">Save Transaction</button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </>
                )}

                {/* LEADS TAB */}
                {activeTab === 'leads' && (
                    <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                        <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <h2 style={{ color: '#00ff88' }}>All Company Leads</h2>
                            <p style={{ color: '#666' }}>Full CRM Database</p>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                    <th style={{ padding: '1.5rem' }}>Lead Name</th>
                                    <th style={{ padding: '1.5rem' }}>Contact</th>
                                    <th style={{ padding: '1.5rem' }}>Value</th>
                                    <th style={{ padding: '1.5rem' }}>Status</th>
                                    <th style={{ padding: '1.5rem' }}>Owner</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead: any) => (
                                    <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1.5rem', fontWeight: 'bold' }}>{lead.name}</td>
                                        <td style={{ padding: '1.5rem', color: '#888' }}>{lead.contact}</td>
                                        <td style={{ padding: '1.5rem' }}>${lead.value}</td>
                                        <td style={{ padding: '1.5rem' }}><span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(0,100,255,0.2)' }}>{lead.status}</span></td>
                                        <td style={{ padding: '1.5rem', color: '#aaa' }}>{lead.createdBy}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* SUPPORT TAB */}
                {activeTab === 'support' && (
                    <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden', padding: '2rem' }}>
                        <h2 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>Support Tickets</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {tickets.length === 0 && <p style={{ color: '#666' }}>No tickets found.</p>}
                            {tickets.map(t => (
                                <div key={t.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', borderLeft: t.status === 'open' ? '4px solid #00ff88' : '4px solid #555' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', alignItems: 'center' }} onClick={() => setActiveTicketId(activeTicketId === t.id ? null : t.id)}>
                                        <div>
                                            <h4 style={{ color: '#fff', marginBottom: '0.2rem' }}>{t.subject}</h4>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}>User: {t.email} (ID: {t.user_id})</div>
                                        </div>
                                        <span style={{ padding: '4px 8px', borderRadius: '4px', background: t.status === 'open' ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.1)', color: t.status === 'open' ? '#00ff88' : '#aaa', fontSize: '0.8rem' }}>{t.status.toUpperCase()}</span>
                                    </div>

                                    {activeTicketId === t.id && (
                                        <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                                            <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', color: '#ccc', marginBottom: '1rem' }}>
                                                {t.message}
                                            </div>
                                            {/* Replies */}
                                            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {t.replies && t.replies.map((r: any, i: number) => (
                                                    <div key={i} style={{ alignSelf: r.sender === 'admin' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                                        <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '2px', textAlign: r.sender === 'admin' ? 'right' : 'left' }}>{r.sender === 'admin' ? 'You' : 'User'}</div>
                                                        <div style={{ background: r.sender === 'admin' ? '#00ff88' : '#333', color: r.sender === 'admin' ? '#000' : '#fff', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                                                            {r.message}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <input placeholder="Type a reply..." value={replyMsg} onChange={e => setReplyMsg(e.target.value)} className="input-field" style={{ flex: 1 }} />
                                                <button onClick={() => handleReplyTicket(t.id)} className="btn btn-primary">Send Reply</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
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
                                            <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 'bold' }}>{post.author || 'Staff'} <span style={{ color: '#888', fontWeight: 'normal' }}>on {post.platform}</span></span>
                                            <span style={{ fontSize: '0.8rem', color: '#00ff88' }}>{post.status}</span>
                                        </div>
                                        <p style={{ marginBottom: '1rem', color: '#eee' }}>{post.content}</p>

                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                            {(post.platform && (post.platform.includes('All') || post.platform.includes('Twitter'))) ? (
                                                <a
                                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.content)}`}
                                                    target="_blank"
                                                    className="btn btn-outline"
                                                    style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', borderColor: '#1DA1F2', color: '#1DA1F2' }}
                                                >
                                                    🐦 Tweet
                                                </a>
                                            ) : null}

                                            {(post.platform && (post.platform.includes('All') || post.platform.includes('Facebook') || post.platform.includes('LinkedIn'))) ? (
                                                <button
                                                    className="btn btn-outline"
                                                    style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(post.content);
                                                    }}
                                                    title="Click to Copy"
                                                >
                                                    📋 Copy for FB/LinkedIn
                                                </button>
                                            ) : null}
                                        </div>

                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(post.createdAt).toLocaleString()}</div>
                                    </div>
                                ))}
                                {posts.length === 0 && <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>No posts yet.</div>}
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
                                                            else setNewPost({ ...newPost, platforms: current.filter(x => x !== p) });
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
                    </>
                )}
                {/* HR TAB */}
                {activeTab === 'hr' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ color: '#00ff88' }}>Staff Management</h2>
                            <button onClick={() => setShowAddStaff(!showAddStaff)} className="btn btn-primary">{showAddStaff ? 'Cancel' : '+ Add Staff'}</button>
                        </div>

                        {showAddStaff && (
                            <div className="glass" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid rgba(0,255,136,0.2)' }}>
                                <h3 style={{ marginBottom: '1.5rem', color: '#00ff88' }}>Add New Staff Member</h3>
                                <form onSubmit={handleAddEmployee} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div><label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Full Name</label><input type="text" required className="input-field" value={newEmp.name} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} style={{ width: '100%' }} /></div>
                                    <div><label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Email Address</label><input type="email" required className="input-field" value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} style={{ width: '100%' }} /></div>
                                    <div><label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Password</label><input type="text" required className="input-field" value={newEmp.password} onChange={e => setNewEmp({ ...newEmp, password: e.target.value })} style={{ width: '100%' }} /></div>
                                    <div><label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Position</label><input type="text" required className="input-field" value={newEmp.position} onChange={e => setNewEmp({ ...newEmp, position: e.target.value })} style={{ width: '100%' }} /></div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Department</label>
                                        <select className="input-field" value={newEmp.department} onChange={e => setNewEmp({ ...newEmp, department: e.target.value })} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333' }}>
                                            <option value="" style={{ background: '#111' }}>Select Department</option>
                                            <option value="Development" style={{ background: '#111' }}>Development</option>
                                            <option value="Design" style={{ background: '#111' }}>Design</option>
                                            <option value="Marketing" style={{ background: '#111' }}>Marketing</option>
                                            <option value="Support" style={{ background: '#111' }}>Support</option>
                                            <option value="Management" style={{ background: '#111' }}>Management</option>
                                        </select>
                                    </div>

                                    <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Compensation Type</label>
                                            <select className="input-field" value={newEmp.compensationType} onChange={e => setNewEmp({ ...newEmp, compensationType: e.target.value })} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333' }}>
                                                <option value="Fixed" style={{ background: '#111' }}>Fixed Salary</option>
                                                <option value="Commission" style={{ background: '#111' }}>Commission Based</option>
                                            </select>
                                        </div>
                                        <div>
                                            {newEmp.compensationType === 'Fixed' ? (
                                                <>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Monthly Salary ($)</label>
                                                    <input type="number" required className="input-field" value={newEmp.salary} onChange={e => setNewEmp({ ...newEmp, salary: e.target.value })} style={{ width: '100%' }} />
                                                </>
                                            ) : (
                                                <>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Commission Rate (%)</label>
                                                    <input type="number" required className="input-field" value={newEmp.commissionRate} onChange={e => setNewEmp({ ...newEmp, commissionRate: e.target.value })} style={{ width: '100%' }} />
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', marginBottom: '0.8rem', color: '#ccc' }}>Platform Access</label>
                                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                            {['Z2U', 'PlayerUp', 'G2G', 'Direct'].map(platform => (
                                                <label key={platform} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                                                    <input type="checkbox" checked={newEmp.allowedPlatforms.includes(platform)} onChange={e => { const current = newEmp.allowedPlatforms; if (e.target.checked) setNewEmp({ ...newEmp, allowedPlatforms: [...current, platform] }); else setNewEmp({ ...newEmp, allowedPlatforms: current.filter(p => p !== platform) }); }} />
                                                    {platform}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button type="submit" className="btn btn-primary" style={{ width: '200px' }}>Create Staff Account</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#eee' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                        <th style={{ padding: '1.5rem' }}>Name / Email</th><th style={{ padding: '1.5rem' }}>Role</th><th style={{ padding: '1.5rem' }}>Department</th><th style={{ padding: '1.5rem' }}>Joined</th><th style={{ padding: '1.5rem' }}>Compensation</th><th style={{ padding: '1.5rem' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((emp: any) => (
                                        <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1.5rem' }}><div style={{ fontWeight: 'bold' }}>{emp.name}</div><div style={{ fontSize: '0.85rem', color: '#888' }}>{emp.email}</div></td>
                                            <td style={{ padding: '1.5rem' }}>{emp.position}</td>
                                            <td style={{ padding: '1.5rem' }}><span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', background: 'rgba(0,100,255,0.2)', color: '#4dacff' }}>{emp.department}</span></td>
                                            <td style={{ padding: '1.5rem', color: '#aaa' }}>{emp.joinDate}</td>
                                            <td style={{ padding: '1.5rem' }}>{emp.compensationType === 'Commission' ? <span style={{ color: '#ffd700' }}>{emp.commissionRate}% Commission</span> : <span>${Number(emp.salary).toLocaleString()} /mo</span>}</td>
                                            <td style={{ padding: '1.5rem' }}><span style={{ color: emp.status === 'Active' ? '#00ff88' : '#ff4444' }}>• {emp.status}</span></td>
                                        </tr>
                                    ))}
                                    {employees.length === 0 && <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No staff members found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* LOGS TAB */}
                {activeTab === 'logs' && (
                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                        <h2 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>Security & Activity Logs</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#eee' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>Time</th>
                                    <th style={{ padding: '1rem' }}>User</th>
                                    <th style={{ padding: '1rem' }}>Action</th>
                                    <th style={{ padding: '1rem' }}>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs && logs.length > 0 ? logs.map((log: any) => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem', color: '#888', fontSize: '0.85rem' }}>{log.date ? new Date(log.date).toLocaleString() : 'N/A'}</td>
                                        <td style={{ padding: '1rem' }}>{log.user}</td>
                                        <td style={{ padding: '1rem' }}><span style={{ color: '#00ff88', background: 'rgba(0,255,136,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{log.action}</span></td>
                                        <td style={{ padding: '1rem', color: '#ccc' }}>{log.details}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No logs recorded yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                        <h2 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>API Integrations</h2>
                        <p style={{ color: '#888', marginBottom: '2rem' }}>Connect your social accounts to enable auto-posting. API Keys are stored securely.</p>

                        <form onSubmit={handleSaveSettings} style={{ display: 'grid', gap: '2rem' }}>
                            {/* Twitter */}
                            <div style={{ padding: '1.5rem', background: 'rgba(29, 161, 242, 0.1)', borderRadius: '12px' }}>
                                <h3 style={{ color: '#1DA1F2', marginBottom: '1rem' }}>Twitter / X</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>API Key</label><input type="password" value={settings.twitter_api_key || ''} onChange={e => setSettings({ ...settings, twitter_api_key: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                    <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>API Secret</label><input type="password" value={settings.twitter_api_secret || ''} onChange={e => setSettings({ ...settings, twitter_api_secret: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                    <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Access Token</label><input type="password" value={settings.twitter_access_token || ''} onChange={e => setSettings({ ...settings, twitter_access_token: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                    <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Access Secret</label><input type="password" value={settings.twitter_access_secret || ''} onChange={e => setSettings({ ...settings, twitter_access_secret: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                </div>
                            </div>

                            {/* Facebook */}
                            <div style={{ padding: '1.5rem', background: 'rgba(24, 119, 242, 0.1)', borderRadius: '12px' }}>
                                <h3 style={{ color: '#1877F2', marginBottom: '1rem' }}>Facebook Page</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Page ID</label><input type="text" value={settings.facebook_page_id || ''} onChange={e => setSettings({ ...settings, facebook_page_id: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                    <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Page Access Token</label><input type="password" value={settings.facebook_page_token || ''} onChange={e => setSettings({ ...settings, facebook_page_token: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                </div>
                            </div>

                            {/* LinkedIn */}
                            <div style={{ padding: '1.5rem', background: 'rgba(0, 119, 181, 0.1)', borderRadius: '12px' }}>
                                <h3 style={{ color: '#0077b5', marginBottom: '1rem' }}>LinkedIn</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Person URN</label><input type="text" value={settings.linkedin_person_urn || ''} onChange={e => setSettings({ ...settings, linkedin_person_urn: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                    <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Access Token</label><input type="password" value={settings.linkedin_access_token || ''} onChange={e => setSettings({ ...settings, linkedin_access_token: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                </div>
                            </div>

                            {/* Telegram */}
                            <div style={{ padding: '1.5rem', background: 'rgba(0, 136, 204, 0.1)', borderRadius: '12px' }}>
                                <h3 style={{ color: '#0088cc', marginBottom: '1rem' }}>Telegram Channel</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Bot Token</label><input type="password" value={settings.telegram_bot_token || ''} onChange={e => setSettings({ ...settings, telegram_bot_token: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                    <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Chat ID (e.g. @channelname)</label><input type="text" value={settings.telegram_chat_id || ''} onChange={e => setSettings({ ...settings, telegram_chat_id: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                </div>
                            </div>

                            {/* Instagram */}
                            <div style={{ padding: '1.5rem', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', borderRadius: '12px' }}>
                                <h3 style={{ color: '#fff', marginBottom: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Instagram Business</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                    <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#eee' }}>IG User ID (Linked to FB Page)</label><input type="text" value={settings.instagram_user_id || ''} onChange={e => setSettings({ ...settings, instagram_user_id: e.target.value })} className="input-field" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', color: '#fff' }} /></div>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }}>💾 Save Configuration</button>
                        </form>

                        {/* DANGER ZONE */}
                        <div style={{ marginTop: '3rem', padding: '2rem', border: '1px solid #ff4444', borderRadius: '16px', background: 'rgba(255, 68, 68, 0.05)' }}>
                            <h3 style={{ color: '#ff4444', marginBottom: '1rem' }}>Danger Zone</h3>
                            <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>This action will wipe all inventory, sales history, and social posts. It cannot be undone.</p>
                            <button
                                type="button"
                                onClick={async () => {
                                    if (confirm('⚠️ ARE YOU SURE? This will DELETE ALL DATA forever.')) {
                                        if (confirm('Really? Click OK to confirm wiping your entire database.')) {
                                            await fetch('/api/admin/reset', { method: 'POST' });
                                            alert('System Reset Complete.');
                                            window.location.reload();
                                        }
                                    }
                                }}
                                className="btn"
                                style={{ background: '#ff4444', color: '#fff', border: 'none', padding: '1rem 2rem', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                🗑️ RESET SYSTEM / CLEAR ALL DATA
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}
