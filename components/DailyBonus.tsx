"use client";

import { useState, useEffect } from "react";

export default function DailyBonus() {
    const [claimed, setClaimed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lastClaim, setLastClaim] = useState<number>(0);
    const [user, setUser] = useState<any>(null);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('buyer_user');
        if (stored) {
            const u = JSON.parse(stored);
            setUser(u);
            checkStatus(u.id);
        }
    }, []);

    const checkStatus = async (userId: string) => {
        try {
            const res = await fetch(`/api/user/bonus?userId=${userId}`);
            const data = await res.json();
            if (data.lastClaim) {
                setLastClaim(new Date(data.lastClaim).getTime());
            }
        } catch { }
    };

    const handleClaim = async () => {
        setLoading(true);
        setSuccessMsg('');
        try {
            const res = await fetch('/api/user/bonus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            const data = await res.json();

            if (data.success) {
                setSuccessMsg('🎉 Successfully claimed $0.05 bonus!');
                setLastClaim(Date.now());
                // Optional: Refresh local state instead of full reload if possible
                setTimeout(() => window.location.reload(), 3000);
            } else {
                setSuccessMsg('❌ ' + data.error);
            }
        } catch { setSuccessMsg("❌ Error claiming bonus"); }
        finally { setLoading(false); }
    };

    // Check if 24h passed
    const canClaim = Date.now() - lastClaim > 86400000;

    if (!user) return null;

    return (
        <div className="glass fade-in" style={{
            padding: '2rem',
            borderRadius: '24px',
            textAlign: 'center',
            marginBottom: '2rem',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(0,0,0,0) 100%)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎁</div>
            <h3 style={{ color: '#ffd700', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '800' }}>Daily Login Bonus</h3>
            <p style={{ fontSize: '0.95rem', color: '#888', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                Your loyalty matters. Claim your free $0.05 reward every 24 hours.
            </p>

            {successMsg ? (
                <div style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    background: successMsg.startsWith('🎉') ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)',
                    color: successMsg.startsWith('🎉') ? '#00ff88' : '#ff4444',
                    fontWeight: 'bold',
                    border: successMsg.startsWith('🎉') ? '1px solid rgba(0,255,136,0.2)' : '1px solid rgba(255,68,68,0.2)'
                }}>
                    {successMsg}
                </div>
            ) : canClaim ? (
                <button
                    onClick={handleClaim}
                    disabled={loading}
                    className="btn"
                    style={{
                        background: 'linear-gradient(90deg, #ffd700, #ffaa00)',
                        color: 'black',
                        width: '100%',
                        fontWeight: '800',
                        padding: '1.2rem',
                        borderRadius: '12px',
                        transform: 'scale(1)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {loading ? 'Processing...' : 'Claim My Reward'}
                </button>
            ) : (
                <div style={{
                    padding: '1.2rem',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    color: '#666',
                    border: '1px solid rgba(255,255,255,0.05)',
                    fontSize: '0.9rem'
                }}>
                    ✨ Reward Claimed. Come back tomorrow!
                </div>
            )}
        </div>
    );
}
