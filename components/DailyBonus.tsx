"use client";

import { useState, useEffect } from "react";

export default function DailyBonus() {
    const [claimed, setClaimed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lastClaim, setLastClaim] = useState<number>(0);
    const [user, setUser] = useState<any>(null);

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
        try {
            const res = await fetch('/api/user/bonus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            const data = await res.json();

            if (data.success) {
                alert("🎉 You claimed $0.05!");
                setLastClaim(Date.now());
                window.location.reload(); // Refresh balance
            } else {
                alert(data.error);
            }
        } catch { alert("Error claiming bonus"); }
        finally { setLoading(false); }
    };

    // Check if 24h passed
    const canClaim = Date.now() - lastClaim > 86400000;

    if (!user) return null;

    return (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', textAlign: 'center', marginBottom: '2rem', border: '1px solid #ffd700', background: 'rgba(255, 215, 0, 0.05)' }}>
            <h3 style={{ color: '#ffd700', marginBottom: '0.5rem' }}>🎁 Daily Login Bonus</h3>
            <p style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '1rem' }}>Claim free balance every 24 hours!</p>

            {canClaim ? (
                <button
                    onClick={handleClaim}
                    disabled={loading}
                    className="btn"
                    style={{ background: '#ffd700', color: 'black', width: '100%', fontWeight: 'bold' }}
                >
                    {loading ? 'Claiming...' : 'Claim $0.05 Now'}
                </button>
            ) : (
                <button disabled className="btn btn-outline" style={{ width: '100%', cursor: 'not-allowed', color: '#888', borderColor: '#444' }}>
                    ✅ Claimed (Come back tomorrow)
                </button>
            )}
        </div>
    );
}
