"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface BusinessTabProps {
    fetchData: (user?: any) => Promise<void>;
}

export default function BusinessTab({ fetchData }: BusinessTabProps) {
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/corptools?type=companies');
            const data = await res.json();
            if (data.success) {
                setCompanies(data.result || []);
            } else {
                toast.error(data.error || "Failed to fetch companies.");
            }
        } catch (error) {
            toast.error("Network error fetching companies.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    return (
        <div className="FadeIn">
            {/* Header */}
            <div className="glass" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2.5rem', border: '1px solid rgba(0, 255, 136, 0.2)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(0, 255, 136, 0.05)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <span style={{ fontSize: '2.5rem' }}>🏢</span> US Business Registry
                        </h2>
                        <p style={{ color: '#888', fontSize: '1rem' }}>Manage all business filings and registered agent status through OfficialUM1 Gateway.</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Total Formations</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00ff88' }}>{companies.length}</div>
                    </div>
                </div>
            </div>

            <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Formation Registry</h3>
                    <button
                        onClick={fetchCompanies}
                        disabled={loading}
                        className="btn btn-outline"
                        style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                    >
                        {loading ? 'Refreshing...' : '🔄 Refresh Data'}
                    </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #222', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '1.2rem', color: '#666', fontSize: '0.85rem' }}>COMPANY NAME</th>
                                <th style={{ padding: '1.2rem', color: '#666', fontSize: '0.85rem' }}>ENTITY TYPE</th>
                                <th style={{ padding: '1.2rem', color: '#666', fontSize: '0.85rem' }}>STATE</th>
                                <th style={{ padding: '1.2rem', color: '#666', fontSize: '0.85rem' }}>CREATED</th>
                                <th style={{ padding: '1.2rem', color: '#666', fontSize: '0.85rem' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map((company: any) => (
                                <tr key={company.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ fontWeight: 'bold', color: '#fff' }}>{company.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#444' }}>ID: {company.id}</div>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#aaa' }}>{company.entity_type}</span>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#aaa' }}>{company.home_state}</span>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#666' }}>{new Date(company.created_at).toLocaleDateString()}</span>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <button
                                            disabled
                                            className="btn btn-outline"
                                            style={{ fontSize: '0.75rem', padding: '4px 10px', opacity: 0.5, cursor: 'not-allowed' }}
                                        >
                                            In Processing →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {companies.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: '#444' }}>
                                        No formations found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
