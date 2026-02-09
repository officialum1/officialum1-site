"use client";
import React, { useState } from 'react';
import { modernAlert, modernConfirm, modernPrompt } from '@/components/ModernUIOverlay';

interface SellersTabProps {
    users: any[];
    fetchData: () => void;
}

export default function SellersTab({ users, fetchData }: SellersTabProps) {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter for sellers
    const sellers = users.filter((u: any) => u.role === 'seller');

    // Filter for potential sellers (non-sellers) for the search/add
    const potentialSellers = users.filter((u: any) => u.role !== 'seller' && u.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const handlePromoteUser = async () => {
        const email = await modernPrompt("Enter the email of the user to promote to Seller:", "Promote User");
        if (!email) return;

        const userToPromote = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

        if (!userToPromote) {
            modernAlert("User not found!");
            return;
        }

        if (userToPromote.role === 'seller') {
            modernAlert("User is already a seller.");
            return;
        }

        if (await modernConfirm(`Are you sure you want to promote ${userToPromote.email} to Seller?`)) {
            try {
                const res = await fetch('/api/admin/users', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: userToPromote.id, role: 'seller' })
                });

                if (res.ok) {
                    modernAlert("User promoted successfully!");
                    fetchData();
                } else {
                    modernAlert("Failed to promote user.");
                }
            } catch (e) {
                console.error(e);
                modernAlert("An error occurred.");
            }
        }
    };

    const handleDemoteUser = async (user: any) => {
        if (await modernConfirm(`Are you sure you want to demote ${user.email} to Buyer?`)) {
            try {
                const res = await fetch('/api/admin/users', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: user.id, role: 'buyer' })
                });

                if (res.ok) {
                    modernAlert("User demoted successfully!");
                    fetchData();
                } else {
                    modernAlert("Failed to demote user.");
                }
            } catch (e) {
                console.error(e);
                modernAlert("An error occurred.");
            }
        }
    };

    return (
        <div className="FadeIn">
            <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem' }}>Seller Management</h2>
                        <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.3rem' }}>Active Sellers: {sellers.length}</p>
                    </div>
                    <div>
                        <button onClick={handlePromoteUser} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '12px' }}>
                            <span>➕</span> Add New Seller
                        </button>
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left', color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <th style={{ padding: '1.2rem 2rem' }}>Seller Profile</th>
                            <th style={{ padding: '1.2rem' }}>Detailed Earnings</th>
                            <th style={{ padding: '1.2rem' }}>Stock</th>
                            <th style={{ padding: '1.2rem' }}>Joined</th>
                            <th style={{ padding: '1.2rem', textAlign: 'right', paddingRight: '2rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sellers.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: '#555' }}>No sellers found.</td></tr>
                        ) : sellers.map((u: any, index: number) => (
                            <tr key={`${u.id}-${index}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                                <td style={{ padding: '1.2rem 2rem' }}>
                                    <div style={{ fontWeight: 'bold', color: '#fff' }}>{u.email}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#00ccff', fontFamily: 'monospace', marginTop: '2px' }}>ID: {u.id.slice(0, 8)}...</div>
                                </td>
                                <td style={{ padding: '1.2rem' }}>
                                    <div style={{ color: '#00ff88', fontWeight: 'bold' }}>${Number(u.wallet_balance || 0).toFixed(2)}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Wallet Balance</div>
                                </td>
                                <td style={{ padding: '1.2rem' }}>
                                    <div style={{ color: '#fff' }}>--</div>
                                    {/* Placeholder for item count if needed */}
                                </td>
                                <td style={{ padding: '1.2rem', color: '#888' }}>
                                    {new Date(u.created_at).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '1.2rem', textAlign: 'right', paddingRight: '2rem' }}>
                                    <button
                                        onClick={() => handleDemoteUser(u)}
                                        className="btn-icon"
                                        style={{ color: '#ff4444', background: 'rgba(255,68,68,0.1)', padding: '8px', borderRadius: '8px' }}
                                        title="Demote to Buyer"
                                    >
                                        Of
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
