"use client";

import { useEffect, useState } from 'react';

export default function LiveTrafficDashboard() {
    const [activeUsers, setActiveUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLiveTraffic = async () => {
        try {
            const res = await fetch('/api/admin/live-traffic');
            if (res.ok) {
                const data = await res.json();
                setActiveUsers(data.activeUsers || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLiveTraffic();
        const interval = setInterval(fetchLiveTraffic, 5000); // 5 sec live map update
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Connecting to Live Map...</div>;

    return (
        <div className="glass fade-in" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '3rem', border: '1px solid #00ff88', position: 'relative', overflow: 'hidden' }}>
            {/* Background pulse effect */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0,255,136,0.1) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none', animation: 'pulse 3s infinite' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '15px', height: '15px', background: '#00ff88', borderRadius: '50%' }}></div>
                        <div style={{ position: 'absolute', top: '-5px', left: '-5px', width: '25px', height: '25px', border: '2px solid #00ff88', borderRadius: '50%', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, letterSpacing: '-1px' }}>Live View</h2>
                </div>
                <div style={{ background: 'rgba(0,255,136,0.1)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88', fontWeight: 'bold' }}>
                    {activeUsers.length} Active {activeUsers.length === 1 ? 'Shopper' : 'Shoppers'}
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#888' }}>
                            <th style={{ padding: '1rem', width: '25%' }}>Current Page</th>
                            <th style={{ padding: '1rem', width: '20%' }}>Location / IP</th>
                            <th style={{ padding: '1rem', width: '35%' }}>Browser / Device</th>
                            <th style={{ padding: '1rem', width: '20%' }}>Time on Site (Idle)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeUsers.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                                    No active visitors currently. Waiting for traffic...
                                </td>
                            </tr>
                        ) : (
                            activeUsers.map((user: any, index: number) => (
                                <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: user.seconds_idle < 60 ? 'rgba(0, 255, 136, 0.05)' : 'transparent' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '1.2rem' }}>{user.current_page === '/' ? '🏠' : user.current_page.includes('shop') ? '🛒' : user.current_page.includes('checkout') ? '💳' : user.current_page.includes('delivery') ? '🔓' : '📄'}</span>
                                            <span style={{ fontFamily: 'monospace', color: '#00c3ff', fontWeight: '600' }}>{user.current_page}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#ccc' }}>
                                        {user.location}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#888', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }} title={user.user_agent}>
                                        {user.user_agent}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {user.seconds_idle < 60 ? (
                                            <span style={{ color: '#00ff88', fontWeight: 'bold' }}>Active Now</span>
                                        ) : (
                                            <span style={{ color: '#aaa' }}>{Math.floor(user.seconds_idle / 60)} min {user.seconds_idle % 60}s idle</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                @keyframes ping {
                    75%, 100% {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
}
