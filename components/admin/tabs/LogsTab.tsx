"use client";

import React, { useState, useMemo } from "react";
import { CreditCard, ShieldCheck, Activity, Search, Sparkles, CheckCircle2, Clock, Globe } from "lucide-react";

interface LogsTabProps {
    logs: any[];
}

export default function LogsTab({ logs = [] }: LogsTabProps) {
    const [filter, setFilter] = useState<'all' | 'payments' | 'cryptomus' | 'stripe' | 'success' | 'security'>('all');
    const [search, setSearch] = useState('');

    const filteredLogs = useMemo(() => {
        if (!logs) return [];
        return logs.filter((log: any) => {
            const action = (log.action || '').toUpperCase();
            const details = (log.details || '').toLowerCase();
            const user = (log.user || '').toLowerCase();
            const searchLower = search.toLowerCase();

            const matchesSearch = !search || details.includes(searchLower) || user.includes(searchLower) || action.includes(searchLower);
            if (!matchesSearch) return false;

            if (filter === 'payments') {
                return action.includes('PAY_CLICK') || action.includes('DEPOSIT_CLICK') || action.includes('PAYMENT');
            }
            if (filter === 'cryptomus') {
                return action.includes('CRYPTOMUS') || details.includes('cryptomus');
            }
            if (filter === 'stripe') {
                return action.includes('STRIPE') || details.includes('stripe');
            }
            if (filter === 'success') {
                return action.includes('SUCCESS') || action.includes('RECEIVED');
            }
            if (filter === 'security') {
                return !action.includes('PAY') && !action.includes('DEPOSIT');
            }
            return true;
        });
    }, [logs, filter, search]);

    const stats = useMemo(() => {
        if (!logs) return { total: 0, payClicks: 0, cryptomusClicks: 0, stripeClicks: 0 };
        let payClicks = 0;
        let cryptomusClicks = 0;
        let stripeClicks = 0;

        logs.forEach((log: any) => {
            const a = (log.action || '').toUpperCase();
            if (a.includes('PAY_CLICK') || a.includes('DEPOSIT_CLICK')) payClicks++;
            if (a.includes('CRYPTOMUS')) cryptomusClicks++;
            if (a.includes('STRIPE')) stripeClicks++;
        });

        return {
            total: logs.length,
            payClicks,
            cryptomusClicks,
            stripeClicks
        };
    }, [logs]);

    const getBadgeStyle = (action: string) => {
        const a = (action || '').toUpperCase();
        if (a.includes('CRYPTOMUS')) {
            return { background: 'rgba(255, 123, 0, 0.15)', color: '#ff7b00', border: '1px solid rgba(255, 123, 0, 0.3)' };
        }
        if (a.includes('STRIPE')) {
            return { background: 'rgba(99, 91, 255, 0.15)', color: '#635BFF', border: '1px solid rgba(99, 91, 255, 0.3)' };
        }
        if (a.includes('BINANCE')) {
            return { background: 'rgba(243, 186, 47, 0.15)', color: '#F3BA2F', border: '1px solid rgba(243, 186, 47, 0.3)' };
        }
        if (a.includes('SUCCESS') || a.includes('RECEIVED')) {
            return { background: 'rgba(0, 255, 136, 0.15)', color: '#00ff88', border: '1px solid rgba(0, 255, 136, 0.3)' };
        }
        return { background: 'rgba(255, 255, 255, 0.08)', color: '#bbb', border: '1px solid rgba(255, 255, 255, 0.1)' };
    };

    return (
        <div className="FadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* TOP STATS CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={16} color="#00ff88" /> Total Activity Logs
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{stats.total}</div>
                </div>

                <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255, 123, 0, 0.3)', background: 'linear-gradient(135deg, rgba(255,123,0,0.08), transparent)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#ffaa66', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CreditCard size={16} color="#ff7b00" /> Pay Now / Intent Clicks
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ff7b00' }}>{stats.payClicks}</div>
                </div>

                <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255, 123, 0, 0.3)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#ff9933', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        💎 Cryptomus Crypto Clicks
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ff9933' }}>{stats.cryptomusClicks}</div>
                </div>

                <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(99, 91, 255, 0.3)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#8888ff', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        💳 Stripe & Card Clicks
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#635BFF' }}>{stats.stripeClicks}</div>
                </div>
            </div>

            {/* MAIN LOGS CONTAINER */}
            <div className="glass" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ color: '#00ff88', margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <ShieldCheck size={22} /> Real-Time Payment & Security Logs
                        </h2>
                        <p style={{ color: '#888', fontSize: '0.85rem', margin: '0.3rem 0 0 0' }}>
                            Tracks every client who clicks "Pay Now", chooses Cryptomus/Stripe, and completes transactions.
                        </p>
                    </div>

                    {/* SEARCH INPUT */}
                    <div style={{ position: 'relative', width: '280px' }}>
                        <Search size={16} color="#666" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Filter by Email, IP, Order..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field"
                            style={{ width: '100%', paddingLeft: '36px', height: '40px', borderRadius: '10px', fontSize: '0.85rem', background: 'rgba(0,0,0,0.4)' }}
                        />
                    </div>
                </div>

                {/* FILTER BUTTONS */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    {[
                        { id: 'all', label: 'All Activity' },
                        { id: 'payments', label: '💳 Pay Now Clicks' },
                        { id: 'cryptomus', label: '💎 Cryptomus' },
                        { id: 'stripe', label: '💳 Stripe Cards' },
                        { id: 'success', label: '✅ Verified Payments' },
                        { id: 'security', label: '🛡️ Admin & Security' },
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => setFilter(btn.id as any)}
                            className="btn"
                            style={{
                                padding: '0.45rem 1rem',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: filter === btn.id ? 700 : 500,
                                background: filter === btn.id ? '#00ff88' : 'rgba(255,255,255,0.04)',
                                color: filter === btn.id ? '#000' : '#ccc',
                                border: '1px solid rgba(255,255,255,0.08)'
                            }}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

                {/* TABLE */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#eee' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.04)', textAlign: 'left' }}>
                                <th style={{ padding: '0.9rem 1rem', fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase' }}>Timestamp</th>
                                <th style={{ padding: '0.9rem 1rem', fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase' }}>User / Client IP</th>
                                <th style={{ padding: '0.9rem 1rem', fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase' }}>Action Type</th>
                                <th style={{ padding: '0.9rem 1rem', fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase' }}>Payment & Session Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.length > 0 ? filteredLogs.map((log: any) => (
                                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1rem', color: '#888', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Clock size={13} color="#666" />
                                            {log.date ? new Date(log.date).toLocaleString() : 'N/A'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Globe size={13} color="#00ff88" />
                                            {log.user || 'Guest Visitor'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            display: 'inline-block',
                                            ...getBadgeStyle(log.action)
                                        }}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#ddd', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                        {log.details}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                                        No logs found for this filter.
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
