"use client";
import React, { useState } from 'react';

interface UsersTabProps {
    users: any[];
    selectedUser: any;
    setSelectedUser: (user: any) => void;
    userForm: any;
    setUserForm: (form: any) => void;
    showUserEdit: boolean;
    setShowUserEdit: (show: boolean) => void;
    handleUpdateUser: (e: any) => Promise<void>;
    handleResendUserEmail: (id: string, email: string, type: string) => Promise<void>;
    fetchData: () => void;
}

export default function UsersTab({
    users,
    selectedUser,
    setSelectedUser,
    userForm,
    setUserForm,
    showUserEdit,
    setShowUserEdit,
    handleUpdateUser,
    handleResendUserEmail,
    fetchData
}: UsersTabProps) {
    const [showImport, setShowImport] = useState(false);
    const [importText, setImportText] = useState('');
    const [showEmail, setShowEmail] = useState(false);
    const [emailForm, setEmailForm] = useState({ subject: '', content: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    const buyers = users.filter((u: any) => (u.role === 'buyer' || u.role === 'user'));
    const topSpenders = [...buyers].sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0)).slice(0, 3);

    return (
        <div className="FadeIn">
            {/* Top Spenders Highlight */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {topSpenders.map((user, index) => (
                    <div key={user.id} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: index === 0 ? 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, transparent 100%)' : 'rgba(255,255,255,0.02)', border: index === 0 ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: index === 0 ? '#ffd700' : '#333', color: index === 0 ? '#000' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {index + 1}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 'bold' }}>{user.email.split('@')[0]}</div>
                                <div style={{ color: '#00ff88', fontSize: '0.8rem' }}>${Number(user.total_spent || 0).toLocaleString()} Spent</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem' }}>User Directory</h2>
                        <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.3rem' }}>Total Members: {buyers.length}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => setShowImport(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '12px' }}>
                            <span>📥</span> Import Buyers
                        </button>
                        <button onClick={() => setShowEmail(true)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00ccff', borderColor: '#00ccff', padding: '0.6rem 1.2rem', borderRadius: '12px' }}>
                            <span>📢</span> Send Promo
                        </button>
                    </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left', color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <th style={{ padding: '1.2rem 2rem' }}>Buyer Profile</th>
                            <th style={{ padding: '1.2rem' }}>Membership</th>
                            <th style={{ padding: '1.2rem' }}>Total Spent</th>
                            <th style={{ padding: '1.2rem' }}>Wallet</th>
                            <th style={{ padding: '1.2rem' }}>Joined</th>
                            <th style={{ padding: '1.2rem', textAlign: 'right', paddingRight: '2rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {buyers.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: '#555' }}>No buyers found yet.</td></tr>
                        ) : buyers.map((u: any) => (
                            <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s', cursor: 'default' }} className="hover-row">
                                <td style={{ padding: '1.2rem 2rem' }}>
                                    <div style={{ fontWeight: 'bold', color: '#fff' }}>{u.email}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#555', fontFamily: 'monospace', marginTop: '2px' }}>ID: {u.id.slice(0, 8)}...</div>
                                </td>
                                <td style={{ padding: '1.2rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        {u.is_guest ? (
                                            <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', background: '#333', color: '#aaa' }}>GUEST</span>
                                        ) : (
                                            <>
                                                {u.is_verified && <span style={{ color: '#00ff88', fontSize: '1rem' }} title="Verified">✓</span>}
                                                {u.membership && u.membership !== 'none' && (
                                                    <span style={{
                                                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold',
                                                        backgroundImage: 'linear-gradient(45deg, #ffd700, #ffaa00)', color: '#000',
                                                        boxShadow: '0 2px 10px rgba(255, 215, 0, 0.2)'
                                                    }}>
                                                        {u.membership.toUpperCase()}
                                                    </span>
                                                )}
                                                {(!u.membership || u.membership === 'none') && <span style={{ color: '#666', fontSize: '0.8rem' }}>Standard</span>}
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '1.2rem' }}>
                                    <div style={{ color: Number(u.total_spent) > 100 ? '#00ff88' : '#ccc', fontWeight: Number(u.total_spent) > 100 ? 'bold' : 'normal' }}>
                                        ${Number(u.total_spent || 0).toFixed(2)}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#555' }}>{u.points || 0} pts</div>
                                </td>
                                <td style={{ padding: '1.2rem', fontWeight: '500' }}>
                                    ${Number(u.wallet_balance || 0).toFixed(2)}
                                </td>
                                <td style={{ padding: '1.2rem', color: '#666', fontSize: '0.85rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                                <td style={{ padding: '1.2rem', textAlign: 'right', paddingRight: '2rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        {!u.is_guest && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(u);
                                                        setUserForm({ email: u.email, password: '', telegram: u.telegram || '', role: u.role });
                                                        setShowUserEdit(true);
                                                    }}
                                                    className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleResendUserEmail(u.id, u.email, 'resend_registration')}
                                                    className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#ffd700', borderColor: 'rgba(255,215,0,0.2)' }}
                                                    title="Resend Verification Email"
                                                >
                                                    Verify
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={async () => {
                                                const amount = prompt(`Adjustment amount for ${u.email} (Positive to add, Negative to subtract):`);
                                                if (amount && !isNaN(parseFloat(amount))) {
                                                    const res = await fetch('/api/user/wallet', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ userId: u.id, amount: parseFloat(amount), source: 'Admin Adjustment' })
                                                    });
                                                    if (res.ok) {
                                                        alert('Wallet Updated');
                                                        fetchData();
                                                    } else {
                                                        alert('Failed to update wallet');
                                                    }
                                                }
                                            }}
                                            className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#00ff88', borderColor: 'rgba(0,255,136,0.2)' }}
                                        >
                                            $
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (confirm(`Delete buyer ${u.email}? This cannot be undone.`)) {
                                                    await fetch(`/api/admin/users?id=${u.id}`, { method: 'DELETE' });
                                                    fetchData();
                                                }
                                            }}
                                            style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', marginLeft: '0.5rem', opacity: 0.7 }}
                                            title="Delete User"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* IMPORT MODAL */}
            {showImport && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', backdropFilter: 'blur(5px)' }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '600px', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(0,255,136,0.3)' }}>
                        <h3 style={{ color: '#00ff88', margin: '0 0 1rem 0' }}>📥 Import Buyers</h3>
                        <p style={{ color: '#888', marginBottom: '1rem', fontSize: '0.9rem' }}>Paste email addresses (one per line). Accounts will be created with a default password.</p>
                        <textarea
                            className="input-field"
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                            style={{ width: '100%', height: '200px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem' }}
                            placeholder="user1@example.com&#10;user2@example.com&#10;..."
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                            <button onClick={() => setShowImport(false)} className="btn btn-outline">Cancel</button>
                            <button
                                onClick={async () => {
                                    setIsProcessing(true);
                                    try {
                                        const emails = importText.split('\n').map(e => e.trim()).filter(e => e.includes('@'));
                                        if (emails.length === 0) return alert('No valid emails found');
                                        const res = await fetch('/api/admin/users', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ action: 'bulk_import', emails })
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                            alert(`Successfully imported ${data.count} new users!`);
                                            setImportText('');
                                            setShowImport(false);
                                            fetchData();
                                        }
                                    } catch (e) { alert('Import failed'); }
                                    setIsProcessing(false);
                                }}
                                className="btn btn-primary"
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Importing...' : 'Import Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EMAIL MODAL */}
            {showEmail && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', backdropFilter: 'blur(5px)' }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '600px', padding: '2rem', borderRadius: '24px', border: '1px solid #00ccff' }}>
                        <h3 style={{ color: '#00ccff', margin: '0 0 1rem 0' }}>📢 Send Promotional Email</h3>
                        <p style={{ color: '#888', marginBottom: '1rem', fontSize: '0.9rem' }}>Send an email to <b>All Buyers ({buyers.length})</b>.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                className="input-field"
                                placeholder="Email Subject"
                                value={emailForm.subject}
                                onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })}
                                style={{ width: '100%', padding: '0.8rem' }}
                            />
                            <textarea
                                className="input-field"
                                placeholder="HTML Content or Plain Text..."
                                value={emailForm.content}
                                onChange={e => setEmailForm({ ...emailForm, content: e.target.value })}
                                style={{ width: '100%', height: '200px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem' }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                            <button onClick={() => setShowEmail(false)} className="btn btn-outline">Cancel</button>
                            <button
                                onClick={async () => {
                                    setIsProcessing(true);
                                    try {
                                        const res = await fetch('/api/admin/users', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                action: 'send_bulk_email',
                                                recipients: buyers.map((u: any) => u.email),
                                                subject: emailForm.subject,
                                                content: emailForm.content
                                            })
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                            alert(`Email sent to ${data.count} users!`);
                                            setEmailForm({ subject: '', content: '' });
                                            setShowEmail(false);
                                        }
                                    } catch (e) { alert('Sending failed'); }
                                    setIsProcessing(false);
                                }}
                                className="btn btn-primary"
                                disabled={isProcessing}
                                style={{ background: 'linear-gradient(45deg, #00ccff, #0088cc)' }}
                            >
                                {isProcessing ? 'Sending...' : 'Send Blast'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* USER EDIT MODAL */}
            {showUserEdit && selectedUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', backdropFilter: 'blur(5px)', animation: 'fadeIn 0.2s ease-out' }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(0,255,136,0.3)', animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h3 style={{ color: '#00ff88', margin: 0 }}>Edit User Profile</h3>
                            <button onClick={() => setShowUserEdit(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
                        </div>
                        <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
                                <input className="input-field" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} style={{ width: '100%', padding: '0.8rem' }} required />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem', display: 'block' }}>New Password (Optional)</label>
                                <input className="input-field" type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} style={{ width: '100%', padding: '0.8rem' }} placeholder="Leave blank to keep current" />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem', display: 'block' }}>Telegram / Discord</label>
                                <input className="input-field" value={userForm.telegram} onChange={e => setUserForm({ ...userForm, telegram: e.target.value })} style={{ width: '100%', padding: '0.8rem' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem', display: 'block' }}>Role</label>
                                    <select className="input-field" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: '#0a0a0a', color: '#fff' }}>
                                        <option value="buyer">Buyer</option>
                                        <option value="seller">Seller</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem', display: 'block' }}>VIP Tier</label>
                                    <select className="input-field" value={selectedUser.membership || 'none'} onChange={e => setSelectedUser({ ...selectedUser, membership: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: '#0a0a0a', color: '#fff' }}>
                                        <option value="none">Standard</option>
                                        <option value="silver">Silver</option>
                                        <option value="gold">Gold</option>
                                        <option value="diamond">Diamond</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowUserEdit(false)} className="btn btn-outline" style={{ padding: '0.8rem' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', fontWeight: 'bold' }}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <style jsx>{`
                .hover-row:hover { background: rgba(255,255,255,0.05) !important; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modalSlideUp { from { transform: translateY(40px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
}
