"use client";

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
    return (
        <div className="FadeIn">
            <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ color: '#00ff88' }}>Website Buyers</h2>
                        <p style={{ color: '#666' }}>Manage your site customers ({users.filter((u: any) => (u.role === 'buyer' || u.role === 'user')).length} Total)</p>
                    </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                            <th style={{ padding: '1.5rem' }}>Buyer Info</th>
                            <th style={{ padding: '1.5rem' }}>Status / Tier</th>
                            <th style={{ padding: '1.5rem' }}>Spent / Points</th>
                            <th style={{ padding: '1.5rem' }}>Wallet Balance</th>
                            <th style={{ padding: '1.5rem' }}>Affiliate Earned</th>
                            <th style={{ padding: '1.5rem' }}>Joined</th>
                            <th style={{ padding: '1.5rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.filter((u: any) => (u.role === 'buyer' || u.role === 'user')).length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>No buyers found.</td></tr>
                        ) : users.filter((u: any) => (u.role === 'buyer' || u.role === 'user')).map((u: any) => (
                            <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1.5rem' }}>
                                    <div style={{ fontWeight: 'bold' }}>{u.email}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666', fontFamily: 'monospace' }}>ID: {u.id}</div>
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            background: u.is_verified ? 'rgba(0,180,100,0.1)' : 'rgba(255,100,0,0.1)',
                                            color: u.is_verified ? '#00ff88' : '#ff9900',
                                            border: u.is_verified ? '1px solid #00ff8833' : '1px solid #ff990033'
                                        }}>
                                            {u.is_guest ? 'GUEST' : (u.is_verified ? 'VERIFIED' : 'PENDING')}
                                        </span>
                                        {!u.is_guest && u.membership && u.membership !== 'none' && (
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                background: 'rgba(255,215,0,0.15)',
                                                color: '#ffd700',
                                                border: '1px solid #ffd70055',
                                                fontWeight: 'bold'
                                            }}>
                                                ★ {u.membership.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    <div style={{ color: '#00ff88', fontWeight: 'bold' }}>${Number(u.total_spent || 0).toFixed(2)}</div>
                                    <div style={{ fontSize: '0.82rem', color: '#888' }}>{u.points || 0} pts</div>
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    <div style={{ color: '#00ff88', fontWeight: 'bold' }}>${Number(u.wallet_balance || 0).toFixed(2)}</div>
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    <div style={{ color: '#ffd700' }}>${Number(u.affiliate_balance || 0).toFixed(2)}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#666' }}>{u.is_guest ? 'N/A' : `Ref: ${u.referral_code}`}</div>
                                </td>
                                <td style={{ padding: '1.5rem', color: '#666' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                                <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        {!u.is_guest && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(u);
                                                        setUserForm({ email: u.email, password: '', telegram: u.telegram || '', role: u.role });
                                                        setShowUserEdit(true);
                                                    }}
                                                    className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleResendUserEmail(u.id, u.email, 'resend_registration')}
                                                    className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem', color: '#ffd700', borderColor: '#ffd70033' }}
                                                >
                                                    Verify
                                                </button>
                                                <button
                                                    onClick={() => handleResendUserEmail(u.id, u.email, 'resend_forgot')}
                                                    className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem', color: '#00d1ff', borderColor: '#00d1ff33' }}
                                                >
                                                    Reset
                                                </button>
                                            </>
                                        )}
                                        {u.is_guest && <span style={{ fontSize: '0.75rem', color: '#666' }}>Guest Buyer</span>}
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
                                            className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem', color: '#00ff88', borderColor: '#00ff8833' }}
                                        >
                                            Wallet
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (confirm(`Delete buyer ${u.email}?`)) {
                                                    await fetch(`/api/admin/users?id=${u.id}`, { method: 'DELETE' });
                                                    fetchData();
                                                }
                                            }}
                                            style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
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

            {/* USER EDIT MODAL */}
            {showUserEdit && selectedUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ color: '#00ff88' }}>Edit User profile</h3>
                            <button onClick={() => setShowUserEdit(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
                        </div>
                        <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
                                <input className="input-field" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} style={{ width: '100%' }} required />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem', display: 'block' }}>New Password (Leave blank to keep current)</label>
                                <input className="input-field" type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem', display: 'block' }}>Telegram</label>
                                <input className="input-field" value={userForm.telegram} onChange={e => setUserForm({ ...userForm, telegram: e.target.value })} style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem', display: 'block' }}>User Role</label>
                                <select className="input-field" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} style={{ width: '100%', background: '#111', color: '#fff' }}>
                                    <option value="buyer">Buyer / Customer</option>
                                    <option value="seller">Seller / Partner</option>
                                    <option value="admin">System Admin</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem', display: 'block' }}>Membership Tier</label>
                                <select className="input-field" value={selectedUser.membership || 'none'} onChange={e => setSelectedUser({ ...selectedUser, membership: e.target.value })} style={{ width: '100%', background: '#111', color: '#fff' }}>
                                    <option value="none">None (Standard)</option>
                                    <option value="silver">Silver VIP</option>
                                    <option value="gold">Gold VIP</option>
                                    <option value="diamond">Diamond VIP</option>
                                </select>
                            </div>
                            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowUserEdit(false)} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
