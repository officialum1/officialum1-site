"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CouponsManager() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ id: 0, code: '', type: 'percent', value: 0, min_amount: 0, expiry: '', status: 'active' });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        const res = await fetch('/api/admin/coupons');
        const data = await res.json();
        setCoupons(Array.isArray(data) ? data : []);
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch('/api/admin/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: isEditing ? 'update' : 'create', ...form })
            });
            setForm({ id: 0, code: '', type: 'percent', value: 0, min_amount: 0, expiry: '', status: 'active' });
            setIsEditing(false);
            fetchCoupons();
        } catch (e) { alert('Save failed'); }
    };

    const handleEdit = (c: any) => {
        setForm({ ...c, expiry: c.expiry ? new Date(c.expiry).toISOString().split('T')[0] : '' });
        setIsEditing(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this coupon?')) return;
        await fetch('/api/admin/coupons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id })
        });
        fetchCoupons();
    };

    if (loading) return <div className="container" style={{ paddingTop: '150px' }}>Loading Coupons...</div>;

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px' }}>
                <a href="/admin/dashboard" style={{ color: '#888', marginBottom: '1rem', display: 'inline-block' }}>← Back to Dashboard</a>
                <h1 style={{ marginBottom: '2rem' }}>Coupons & Promotions 🎟️</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="glass h-fit" style={{ padding: '2rem', borderRadius: '24px' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>{isEditing ? 'Edit Coupon' : 'Create New Coupon'}</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Code</label>
                                <input className="input-field w-full" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="e.g. SUMMER20" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Type</label>
                                    <select className="input-field w-full" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                        <option value="percent">Percentage (%)</option>
                                        <option value="flat">Flat Amount ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Value</label>
                                    <input type="number" step="0.01" className="input-field w-full" value={form.value} onChange={e => setForm({ ...form, value: parseFloat(e.target.value) })} required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Min. Order Amount ($)</label>
                                <input type="number" className="input-field w-full" value={form.min_amount} onChange={e => setForm({ ...form, min_amount: parseFloat(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Expiry Date (Optional)</label>
                                <input type="date" className="input-field w-full" value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Status</label>
                                <select className="input-field w-full" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button type="submit" className="btn btn-primary w-full">{isEditing ? 'Update Coupon' : 'Create Coupon'}</button>
                                {isEditing && <button type="button" onClick={() => { setIsEditing(false); setForm({ id: 0, code: '', type: 'percent', value: 0, min_amount: 0, expiry: '', status: 'active' }); }} className="btn bg-gray-700">Cancel</button>}
                            </div>
                        </form>
                    </div>

                    {/* List */}
                    <div className="lg:col-span-2 glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #333', color: '#888' }}>
                                    <th style={{ padding: '1rem' }}>Code</th>
                                    <th style={{ padding: '1rem' }}>Discount</th>
                                    <th style={{ padding: '1rem' }}>Min. Spend</th>
                                    <th style={{ padding: '1rem' }}>Expiry</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map(c => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 'bold', color: '#fff' }}>{c.code}</td>
                                        <td style={{ padding: '1rem', color: '#00ff88' }}>{c.type === 'percent' ? `${c.value}%` : `$${c.value}`}</td>
                                        <td style={{ padding: '1rem' }}>${c.min_amount}</td>
                                        <td style={{ padding: '1rem', color: '#888' }}>{c.expiry ? new Date(c.expiry).toLocaleDateString() : 'Never'}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ padding: '2px 8px', borderRadius: '4px', background: c.status === 'active' ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.05)', color: c.status === 'active' ? '#00ff88' : '#888' }}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleEdit(c)} className="text-blue-400 hover:text-blue-300">Edit</button>
                                            <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                                {coupons.length === 0 && <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No coupons found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
