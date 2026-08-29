"use client";

interface HRTabProps {
    showAddStaff: boolean;
    setShowAddStaff: (show: boolean) => void;
    editingEmp: any;
    setEditingEmp: (emp: any) => void;
    newEmp: any;
    setNewEmp: (emp: any) => void;
    handleAddEmployee: (e: any) => Promise<void>;
    employees: any[];
    handleDeleteEmployee: (id: string) => Promise<void>;
    users: any[];
    setSelectedUser: (user: any) => void;
    setUserForm: (form: any) => void;
    setShowUserEdit: (show: boolean) => void;
}

export default function HRTab({
    showAddStaff,
    setShowAddStaff,
    editingEmp,
    setEditingEmp,
    newEmp,
    setNewEmp,
    handleAddEmployee,
    employees,
    handleDeleteEmployee,
    users,
    setSelectedUser,
    setUserForm,
    setShowUserEdit
}: HRTabProps) {
    return (
        <div className="FadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: '#00ff88' }}>Administrative Staff & Admins</h2>
                <button onClick={() => { setShowAddStaff(!showAddStaff); if (!showAddStaff) setEditingEmp(null); }} className="btn btn-primary">{showAddStaff ? 'Cancel' : '+ Add Staff'}</button>
            </div>

            {showAddStaff && (
                <div className="glass" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid rgba(0,255,136,0.2)' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: '#00ff88' }}>{editingEmp ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
                    <form onSubmit={handleAddEmployee} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div><label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Full Name</label><input type="text" required className="input-field" value={newEmp.name} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} style={{ width: '100%' }} /></div>
                        <div><label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Username (Optional)</label><input type="text" className="input-field" value={newEmp.username || ''} onChange={e => setNewEmp({ ...newEmp, username: e.target.value })} style={{ width: '100%' }} placeholder="For login" /></div>
                        <div><label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Email Address</label><input type="email" required disabled={!!editingEmp} className="input-field" value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} style={{ width: '100%', opacity: editingEmp ? 0.6 : 1 }} /></div>
                        <div><label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Password {editingEmp && '(Leave empty to keep current)'}</label><input type="text" required={!editingEmp} className="input-field" value={newEmp.password} onChange={e => setNewEmp({ ...newEmp, password: e.target.value })} style={{ width: '100%' }} /></div>
                        <div><label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Position</label><input type="text" required className="input-field" value={newEmp.position} onChange={e => setNewEmp({ ...newEmp, position: e.target.value })} style={{ width: '100%' }} /></div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Department</label>
                            <select className="input-field" value={newEmp.department} onChange={e => setNewEmp({ ...newEmp, department: e.target.value })} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333' }}>
                                <option value="">Select Department</option>
                                <option value="Development">Development</option>
                                <option value="Design">Design</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Sales">Sales</option>
                                <option value="Support">Support</option>
                                <option value="Management">Management</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>System Role</label>
                            <select className="input-field" value={newEmp.role || 'seller'} onChange={e => setNewEmp({ ...newEmp, role: e.target.value })} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333' }}>
                                <option value="seller">Staff (Seller)</option>
                                <option value="admin">Admin</option>
                                <option value="buyer">Buyer</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Compensation Type</label>
                            <select className="input-field" value={newEmp.compensationType} onChange={e => setNewEmp({ ...newEmp, compensationType: e.target.value })} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333' }}>
                                <option value="Fixed">Fixed Salary</option>
                                <option value="Commission">Commission Based</option>
                            </select>
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '1rem', color: '#00ff88', fontWeight: 'bold' }}>Access Permissions</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222' }}>
                                {[
                                    { id: 'orders', label: '📦 Orders' },
                                    { id: 'inventory', label: '📊 Stock' },
                                    { id: 'website', label: '🌐 Website' },
                                    { id: 'sales', label: '💸 Sales' },
                                    { id: 'finance', label: '💰 Finance' },
                                    { id: 'leads', label: '👥 Leads' },
                                    { id: 'users', label: '👤 Buyers' },
                                    { id: 'support', label: '🎫 Support' },

                                    { id: 'marketing', label: '📢 Marketing' },
                                    { id: 'tools', label: '🛠️ Tools' },
                                    { id: 'hr', label: '👔 HR/Staff' },
                                    { id: 'settings', label: '⚙️ Settings' },
                                    { id: 'all', label: '💎 Super Admin' }
                                ].map(p => (
                                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', border: '1px solid transparent', transition: 'all 0.2s' }}>
                                        <input
                                            type="checkbox"
                                            checked={newEmp.permissions.includes(p.id)}
                                            onChange={e => {
                                                const current = newEmp.permissions;
                                                if (e.target.checked) setNewEmp({ ...newEmp, permissions: [...current, p.id] });
                                                else setNewEmp({ ...newEmp, permissions: current.filter((x: string) => x !== p.id) });
                                            }}
                                        />
                                        <span style={{ fontSize: '0.9rem', color: newEmp.permissions.includes(p.id) ? '#fff' : '#666' }}>{p.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2.5rem' }}>{editingEmp ? 'Update Profile' : 'Register Staff'}</button>
                            <button type="button" onClick={() => setShowAddStaff(false)} className="btn btn-outline" style={{ padding: '0.8rem 2rem' }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left', color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
                            <th style={{ padding: '1.5rem' }}>Team Member</th>
                            <th style={{ padding: '1.5rem' }}>Department</th>
                            <th style={{ padding: '1.5rem' }}>Access Level</th>
                            <th style={{ padding: '1.5rem' }}>Status</th>
                            <th style={{ padding: '1.5rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Internal Admins from Users Table */}
                        {users.filter((u: any) => u.role === 'admin').map((u: any) => (
                            <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,255,136,0.02)' }}>
                                <td style={{ padding: '1.5rem' }}><div style={{ fontWeight: 'bold' }}>{u.username || 'System Admin'}</div><div style={{ fontSize: '0.8rem', color: '#666' }}>ID: {u.id.slice(0, 6)}</div></td>
                                <td style={{ padding: '1.5rem' }}>Management / Owner</td>
                                <td style={{ padding: '1.5rem' }}><span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', background: 'rgba(0,180,100,0.1)', color: '#00ff88' }}>Core Admin</span></td>
                                <td style={{ padding: '1.5rem' }}><span style={{ color: '#00ff88' }}>• ACTIVE</span></td>
                                <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                    <button
                                        onClick={() => {
                                            setSelectedUser(u);
                                            setUserForm({ email: u.email, password: '', telegram: u.telegram || '', role: u.role });
                                            setShowUserEdit(true);
                                        }}
                                        className="btn btn-outline"
                                        style={{ fontSize: '0.8rem', borderColor: '#4dacff', color: '#4dacff' }}
                                    >
                                        Edit Admin
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {/* Staff from Employees Table */}
                        {employees.map((emp: any) => (
                            <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                                <td style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(45deg, #00ff8822, #00ccff22)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00ff88', fontWeight: 'bold' }}>
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: '#fff' }}>{emp.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#00ff88' }}>@{emp.username || emp.email.split('@')[0]}</div>
                                            <div style={{ fontSize: '0.82rem', color: '#666' }}>{emp.position || 'Staff'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    <span style={{ fontSize: '0.9rem', color: '#ccc' }}>{emp.department || 'N/A'}</span>
                                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{emp.position || 'Staff'}</div>
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '300px' }}>
                                        {emp.permissions.includes('all') ? (
                                            <span style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>FULL ACCESS</span>
                                        ) : emp.permissions.slice(0, 3).map((p: string) => (
                                            <span key={p} style={{ background: 'rgba(255,255,255,0.05)', color: '#888', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>{p.toUpperCase()}</span>
                                        ))}
                                        {emp.permissions.length > 3 && !emp.permissions.includes('all') && (
                                            <span style={{ color: '#666', fontSize: '0.7rem' }}>+{emp.permissions.length - 3} more</span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,255,136,0.1)', color: '#00ff88', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88' }} /> ACTIVE
                                    </span>
                                </td>
                                <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                        <button onClick={() => {
                                            setEditingEmp(emp);
                                            setNewEmp({
                                                name: emp.name,
                                                username: emp.username,
                                                email: emp.email,
                                                position: emp.position,
                                                department: emp.department,
                                                permissions: emp.permissions,
                                                password: '',
                                                compensationType: emp.compensationType || 'Fixed',
                                                role: emp.role || 'seller'
                                            });
                                            setShowAddStaff(true);
                                        }} className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '0.8rem' }}>Edit</button>
                                        <button onClick={() => handleDeleteEmployee(emp.id)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
