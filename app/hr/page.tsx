"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function HRDashboard() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    // New Employee Form State
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

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/hr/employees');
            if (res.ok) {
                const data = await res.json();
                setEmployees(data);
            }
        } catch (error) {
            console.error('Failed to fetch employees', error);
        } finally {
            setLoading(false);
        }
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
                setShowAddForm(false);
                setNewEmp({ name: '', email: '', password: '', position: '', department: '', salary: '', commissionRate: '', compensationType: 'Fixed', allowedPlatforms: [] });
                fetchEmployees();
            } else {
                alert('Failed to add staff');
            }
        } catch (error) {
            console.error(error);
            alert('Error adding staff');
        }
    };

    return (
        <main style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />

            <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>HR Board</h1>
                        <p style={{ color: '#888' }}>Manage your staff and team members.</p>
                    </div>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="btn btn-primary"
                    >
                        {showAddForm ? 'Cancel' : '+ Add Staff'}
                    </button>
                </div>

                {/* Add Staff Form */}
                {showAddForm && (
                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid rgba(0,255,136,0.2)' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: '#00ff88' }}>Add New Staff Member</h3>
                        <form onSubmit={handleAddEmployee} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={newEmp.name}
                                    onChange={e => setNewEmp({ ...newEmp, name: e.target.value })}
                                    placeholder="e.g. John Doe"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="input-field"
                                    value={newEmp.email}
                                    onChange={e => setNewEmp({ ...newEmp, email: e.target.value })}
                                    placeholder="e.g. john@agency.com"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Password</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={newEmp.password}
                                    onChange={e => setNewEmp({ ...newEmp, password: e.target.value })}
                                    placeholder="Set temporary password"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Position</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={newEmp.position}
                                    onChange={e => setNewEmp({ ...newEmp, position: e.target.value })}
                                    placeholder="e.g. Developer"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Department</label>
                                <select
                                    className="input-field"
                                    value={newEmp.department}
                                    onChange={e => setNewEmp({ ...newEmp, department: e.target.value })}
                                    style={{ width: '100%' }}
                                >
                                    <option value="">Select Department</option>
                                    <option value="Development">Development</option>
                                    <option value="Design">Design</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Support">Support</option>
                                    <option value="Management">Management</option>
                                </select>
                            </div>

                            {/* Compensation Type Selector */}
                            <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Compensation Type</label>
                                    <select
                                        className="input-field"
                                        value={newEmp.compensationType}
                                        onChange={e => setNewEmp({ ...newEmp, compensationType: e.target.value })}
                                        style={{ width: '100%' }}
                                    >
                                        <option value="Fixed">Fixed Salary</option>
                                        <option value="Commission">Commission Based</option>
                                    </select>
                                </div>

                                <div>
                                    {newEmp.compensationType === 'Fixed' ? (
                                        <>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Monthly Salary ($)</label>
                                            <input
                                                type="number"
                                                required
                                                className="input-field"
                                                value={newEmp.salary}
                                                onChange={e => setNewEmp({ ...newEmp, salary: e.target.value })}
                                                placeholder="e.g. 5000"
                                                style={{ width: '100%' }}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Commission Rate (%)</label>
                                            <input
                                                type="number"
                                                required
                                                className="input-field"
                                                value={newEmp.commissionRate}
                                                onChange={e => setNewEmp({ ...newEmp, commissionRate: e.target.value })}
                                                placeholder="e.g. 10"
                                                style={{ width: '100%' }}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Platform Permissions */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '0.8rem', color: '#ccc' }}>Platform Access</label>
                                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                    {['Z2U', 'PlayerUp', 'G2G', 'Direct'].map(platform => (
                                        <label key={platform} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                                            <input
                                                type="checkbox"
                                                checked={newEmp.allowedPlatforms.includes(platform)}
                                                onChange={e => {
                                                    const current = newEmp.allowedPlatforms;
                                                    if (e.target.checked) setNewEmp({ ...newEmp, allowedPlatforms: [...current, platform] });
                                                    else setNewEmp({ ...newEmp, allowedPlatforms: current.filter(p => p !== platform) });
                                                }}
                                            />
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

                {/* Staff List */}
                <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#eee' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                    <th style={{ padding: '1.5rem' }}>Name / Email</th>
                                    <th style={{ padding: '1.5rem' }}>Role</th>
                                    <th style={{ padding: '1.5rem' }}>Department</th>
                                    <th style={{ padding: '1.5rem' }}>Joined</th>
                                    <th style={{ padding: '1.5rem' }}>Compensation</th>
                                    <th style={{ padding: '1.5rem' }}>Status</th>
                                    <th style={{ padding: '1.5rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center' }}>Loading staff...</td></tr>
                                ) : employees.length === 0 ? (
                                    <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No staff members found. Add one above!</td></tr>
                                ) : (
                                    employees.map((emp: any) => (
                                        <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div style={{ fontWeight: 'bold' }}>{emp.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#888' }}>{emp.email}</div>
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>{emp.position}</td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.8rem',
                                                    background: 'rgba(0,100,255,0.2)',
                                                    color: '#4dacff'
                                                }}>{emp.department}</span>
                                            </td>
                                            <td style={{ padding: '1.5rem', color: '#aaa' }}>{emp.joinDate}</td>
                                            <td style={{ padding: '1.5rem' }}>
                                                {emp.compensationType === 'Commission' ? (
                                                    <span style={{ color: '#ffd700' }}>{emp.commissionRate}% Commission</span>
                                                ) : (
                                                    <span>${Number(emp.salary).toLocaleString()} /mo</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <span style={{
                                                    color: emp.status === 'Active' ? '#00ff88' : '#ff4444'
                                                }}>• {emp.status}</span>
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <button className="btn-manage" style={{ background: 'transparent', border: '1px solid #444', color: '#ccc', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                    Manage
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
            <Footer />
        </main>
    );
}
