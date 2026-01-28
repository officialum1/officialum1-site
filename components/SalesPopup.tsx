"use client";

import { useState, useEffect } from 'react';

export default function SalesPopup() {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState<any>(null);

    const fakes = [
        { name: "Discord Aged Account", country: "🇺🇸 USA", time: "2 mins ago" },
        { name: "Gmail PVA (Verified)", country: "🇬🇧 UK", time: "5 mins ago" },
        { name: "Instagram 10k Followers", country: "🇨🇦 Canada", time: "just now" },
        { name: "Twitter X Token", country: "🇩🇪 Germany", time: "10 mins ago" },
        { name: "Netflix Premium", country: "🇫🇷 France", time: "1 min ago" }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            const random = fakes[Math.floor(Math.random() * fakes.length)];
            setData(random);
            setVisible(true);

            setTimeout(() => {
                setVisible(false);
            }, 5000); // Show for 5s
        }, 15000); // Every 15s

        return () => clearInterval(interval);
    }, []);

    if (!visible || !data) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            background: 'var(--card-bg)', // Adapts to your theme
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '1rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            animation: 'slideIn 0.5s ease-out',
            maxWidth: '300px',
            backdropFilter: 'blur(10px)'
        }}>
            <div style={{ fontSize: '2rem' }}>🎉</div>
            <div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>Someone from {data.country} purchased</div>
                <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.9rem' }}>{data.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#00ff88', marginTop: '2px' }}>{data.time}</div>
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    from { transform: translateX(-100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
