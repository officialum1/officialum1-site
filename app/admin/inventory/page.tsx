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
    const [newPost, setNewPost] = useState({ content: '', platform: 'Twitter' });
    const [newSale, setNewSale] = useState({ description: '', platform: 'Z2U', salePrice: '', staffName: 'Admin', proofImage: '', inventoryId: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [invRes, balRes, leadsRes, postsRes, settingsRes, empRes] = await Promise.all([
                fetch('/api/admin/inventory?type=inventory'),
                fetch('/api/admin/inventory?type=balance'),
                fetch('/api/leads'),
                fetch('/api/social'),
                fetch('/api/admin/settings'),
                fetch('/api/hr/employees')
            ]);

            const invData = await invRes.json();
            const balData = await balRes.json();
            const leadsData = await leadsRes.json();
            const postsData = await postsRes.json();
            const settingsData = await settingsRes.json();
            const empData = await empRes.json();

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
        setNewPost({ content: '', platform: 'Twitter' });
        fetchData();
    };

    const handleAddInventory = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/admin/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'add_inventory', ...newItem })
        });
        alert('Item Added');
        setShowAddInv(false);
        fetchData();
    };

    const handleRecordSale = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/admin/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'record_sale', ...newSale })
        });
        alert('Sale Recorded');
        setShowRecordSale(false);
        fetchData();
    };

    if (loading) return <div style={{ background: '#050505', minHeight: '100vh', color: '#fff', padding: '100px' }}>Loading Admin Board...</div>;

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
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                    {['Inventory', 'Leads', 'Support', 'Marketing', 'HR', 'Settings'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: activeTab === tab.toLowerCase() ? '#00ff88' : '#888',
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                padding: '0.5rem 1rem',
                                borderBottom: activeTab === tab.toLowerCase() ? '2px solid #00ff88' : 'none'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* INVENTORY TAB */}
                {activeTab === 'inventory' && (
                    <>
                        {/* Balance Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(0,100,255,0.1)' }}>
                                <h3 style={{ color: '#888', fontSize: '0.9rem' }}>Z2U Balance</h3>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${stats.z2u.toFixed(2)}</div>
                            </div>
                            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(255,100,0,0.1)' }}>
                                <h3 style={{ color: '#888', fontSize: '0.9rem' }}>PlayerUp Balance</h3>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${stats.playerup.toFixed(2)}</div>
                            </div>
                            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(255,0,0,0.1)' }}>
                                <h3 style={{ color: '#888', fontSize: '0.9rem' }}>G2G Balance</h3>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${stats.g2g.toFixed(2)}</div>
                            </div>
                            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(0,255,136,0.1)' }}>
                                <h3 style={{ color: '#888', fontSize: '0.9rem' }}>Direct / Other</h3>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${stats.direct.toFixed(2)}</div>
                            </div>
                            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid #00ff88' }}>
                                <h3 style={{ color: '#00ff88', fontSize: '0.9rem' }}>TOTAL REVENUE</h3>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${stats.total.toFixed(2)}</div>
                            </div>
                            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid #ffd700' }}>
                                <h3 style={{ color: '#ffd700', fontSize: '0.9rem' }}>NET PROFIT</h3>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${stats.profit.toFixed(2)}</div>
                                <div style={{ fontSize: '0.8rem', color: stats.margin > 30 ? '#00ff88' : 'orange' }}>{stats.margin.toFixed(1)}% Margin</div>
                            </div>
                            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid #aaa' }}>
                                <h3 style={{ color: '#aaa', fontSize: '0.9rem' }}>ASSETS (STOCK)</h3>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${stats.stockValue.toFixed(2)}</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>Unsold Inventory</div>
                            </div>
                        </div>

                        {/* Department Performance */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#888', fontSize: '1rem' }}>Sales by Department (Commission Pool)</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                {Object.keys(stats.deptBreakdown || {}).length > 0 ? Object.keys(stats.deptBreakdown).map(dept => (
                                    <div key={dept} className="glass" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <h4 style={{ color: '#aaa', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{dept}</h4>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>${stats.deptBreakdown[dept].toFixed(2)}</div>
                                    </div>
                                )) : <div style={{ color: '#666' }}>No departmental sales data yet.</div>}
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <button onClick={() => setShowAddInv(true)} className="btn btn-outline">+ Add Inventory Item</button>
                            <button onClick={() => setShowRecordSale(true)} className="btn btn-primary">+ Record New Sale</button>
                            <button onClick={() => fetchData()} className="btn btn-outline" style={{ marginLeft: 'auto' }}>↻ Refresh</button>
                        </div>

                        {/* Forms Area */}
                        {showAddInv && (
                            <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Add Inventory Stock</h3>
                                <form onSubmit={handleAddInventory} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr', alignItems: 'end' }}>
                                    <div style={{ paddingRight: '1rem' }}>
                                        <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>Basic Info</label>
                                        <input placeholder="Item Name (e.g. Fortnite Acc)" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="input-field" required style={{ width: '100%', marginBottom: '1rem' }} />
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <select value={newItem.platform} onChange={e => setNewItem({ ...newItem, platform: e.target.value })} className="input-field" style={{ flex: 1 }}>
                                                <option value="Z2U">Z2U</option>
                                                <option value="PlayerUp">PlayerUp</option>
                                                <option value="G2G">G2G</option>
                                                <option value="Direct">Direct</option>
                                            </select>
                                            <input type="number" placeholder="Cost ($)" value={newItem.purchasePrice} onChange={e => setNewItem({ ...newItem, purchasePrice: e.target.value })} className="input-field" required style={{ flex: 1 }} />
                                        </div>
                                    </div>

                                    <div style={{ paddingLeft: '1rem', borderLeft: '1px solid #333' }}>
                                        <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>Account Credentials (Optional)</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <input placeholder="Username/Login" value={newItem.username || ''} onChange={e => setNewItem({ ...newItem, username: e.target.value })} className="input-field" />
                                            <input placeholder="Password" value={newItem.password || ''} onChange={e => setNewItem({ ...newItem, password: e.target.value })} className="input-field" />
                                        </div>
                                        <input placeholder="Email Access (e.g. mail:pass)" value={newItem.email || ''} onChange={e => setNewItem({ ...newItem, email: e.target.value })} className="input-field" style={{ width: '100%', marginBottom: '1rem' }} />
                                        <textarea placeholder="Extra Info / Notes" value={newItem.extraInfo || ''} onChange={e => setNewItem({ ...newItem, extraInfo: e.target.value })} className="input-field" style={{ width: '100%', height: '60px' }} />
                                    </div>

                                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                        <button type="submit" className="btn btn-primary">Save Item</button>
                                        <button type="button" onClick={() => setShowAddInv(false)} className="btn btn-outline">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {showRecordSale && (
                            <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px', border: '1px solid #00ff88' }}>
                                <h3 style={{ marginBottom: '1rem', color: '#00ff88' }}>Record a Sale & Deliver</h3>
                                <form onSubmit={handleRecordSale} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                                    {/* Inventory Selector */}
                                    <select
                                        className="input-field"
                                        value={newSale.inventoryId}
                                        onChange={e => {
                                            const id = e.target.value;
                                            const item = inventory.find(i => i.id === id);
                                            if (item) {
                                                setNewSale({ ...newSale, inventoryId: id, description: item.name, platform: item.platform });
                                            } else {
                                                setNewSale({ ...newSale, inventoryId: '' });
                                            }
                                        }}
                                        style={{ width: '100%', border: '1px solid #333', background: '#111', color: '#00ff88' }}
                                    >
                                        <option value="">-- Quick Select Inventory Item (Auto-Fill) --</option>
                                        {inventory.filter(i => i.status === 'In Stock').map(i => (
                                            <option key={i.id} value={i.id}>{i.platform} | {i.name}</option>
                                        ))}
                                    </select>

                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem' }}>
                                        <input placeholder="Description / Order ID" value={newSale.description} onChange={e => setNewSale({ ...newSale, description: e.target.value })} className="input-field" required />
                                        <select value={newSale.platform} onChange={e => setNewSale({ ...newSale, platform: e.target.value })} className="input-field">
                                            <option value="Z2U">Z2U</option>
                                            <option value="PlayerUp">PlayerUp</option>
                                            <option value="G2G">G2G</option>
                                            <option value="Direct">Direct</option>
                                        </select>
                                        <input type="number" placeholder="Sale Price ($)" value={newSale.salePrice} onChange={e => setNewSale({ ...newSale, salePrice: e.target.value })} className="input-field" required />
                                        <input placeholder="Sold By (Staff)" value={newSale.staffName} onChange={e => setNewSale({ ...newSale, staffName: e.target.value })} className="input-field" />
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#00ff88', fontSize: '0.9rem' }}>Upload Proof of Delivery (Optional)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setNewSale({ ...newSale, proofImage: reader.result as string });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                style={{ color: '#ccc', fontSize: '0.9rem' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>Record & Deliver</button>
                                            <button type="button" onClick={() => setShowRecordSale(false)} className="btn btn-outline">Cancel</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            {/* Inventory List */}
                            <div>
                                <h2 style={{ marginBottom: '1rem' }}>📦 Inventory Stock</h2>
                                <div className="glass" style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: '16px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <thead style={{ background: 'rgba(255,255,255,0.05)', position: 'sticky', top: 0 }}>
                                            <tr>
                                                <th style={{ padding: '1rem', textAlign: 'left' }}>Item</th>
                                                <th style={{ padding: '1rem', textAlign: 'left' }}>Platform</th>
                                                <th style={{ padding: '1rem', textAlign: 'left' }}>Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {inventory.map((item: any) => (
                                                <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '0.8rem 1rem' }}>{item.name}</td>
                                                    <td style={{ padding: '0.8rem 1rem' }}>{item.platform}</td>
                                                    <td style={{ padding: '0.8rem 1rem', color: '#ff4444' }}>-${item.purchasePrice}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Sales History */}
                            <div>
                                <h2 style={{ marginBottom: '1rem' }}>💰 Sales History</h2>
                                <div className="glass" style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: '16px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <thead style={{ background: 'rgba(255,255,255,0.05)', position: 'sticky', top: 0 }}>
                                            <tr>
                                                <th style={{ padding: '1rem', textAlign: 'left' }}>Desc</th>
                                                <th style={{ padding: '1rem', textAlign: 'left' }}>Platform</th>
                                                <th style={{ padding: '1rem', textAlign: 'left' }}>Sold By</th>
                                                <th style={{ padding: '1rem', textAlign: 'left' }}>Price</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {balanceHistory.slice().reverse().map((sale: any) => (
                                                <tr key={sale.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '0.8rem 1rem' }}>{sale.description}</td>
                                                    <td style={{ padding: '0.8rem 1rem' }}>
                                                        <span style={{
                                                            padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem',
                                                            background: sale.platform === 'Z2U' ? 'rgba(0,100,255,0.2)' : sale.platform === 'PlayerUp' ? 'rgba(255,100,0,0.2)' : 'rgba(0,255,0,0.1)',
                                                            color: '#fff'
                                                        }}>{sale.platform}</span>
                                                    </td>
                                                    <td style={{ padding: '0.8rem 1rem' }}>{sale.processedBy}</td>
                                                    <td style={{ padding: '0.8rem 1rem', color: '#00ff88' }}>+${sale.amount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
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
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <select className="input-field" value={newPost.platform} onChange={e => setNewPost({ ...newPost, platform: e.target.value })} style={{ flex: 1 }}>
                                            <option value="Twitter">Twitter / X</option>
                                            <option value="Facebook">Facebook</option>
                                            <option value="Instagram">Instagram</option>
                                            <option value="LinkedIn">LinkedIn</option>
                                            <option value="Telegram">Telegram Channel</option>
                                            <option value="All">All Platforms (Broadcast)</option>
                                        </select>
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
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}
