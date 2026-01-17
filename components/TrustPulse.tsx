"use client";

import { useState, useEffect } from 'react';

export default function TrustPulse() {
    const [notification, setNotification] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    const [items, setItems] = useState<string[]>([]);

    useEffect(() => {
        // Fetch Real Products for "Live" Social Proof
        const f = async () => {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setItems(data.map((p: any) => p.name));
                }
            } catch { }
        };
        f();
    }, []);

    useEffect(() => {
        if (items.length === 0) return;

        const showNextReview = () => {
            const randomItem = items[Math.floor(Math.random() * items.length)];
            const locations = ["USA", "UK", "Canada", "Germany", "Australia", "France", "Dubai"];
            const loc = locations[Math.floor(Math.random() * locations.length)];
            const time = Math.floor(Math.random() * 59) + 1 + " mins ago";

            const activity = {
                name: `Someone from ${loc}`,
                action: `purchased ${randomItem}`,
                time: time
            };

            setNotification(activity);
            setIsVisible(true);

            setTimeout(() => {
                setIsVisible(false);
            }, 5000);
        };

        const initialDelay = setTimeout(showNextReview, 3000);
        const interval = setInterval(showNextReview, 20000 + Math.random() * 10000);

        return () => {
            clearTimeout(initialDelay);
            clearInterval(interval);
        };
    }, [items]);

    if (!notification) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 9999,
            transition: 'all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
            transform: isVisible ? 'translateX(0)' : 'translateX(-120%)',
            opacity: isVisible ? 1 : 0,
            pointerEvents: isVisible ? 'auto' : 'none'
        }}>
            <div className="glass" style={{
                padding: '12px 20px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minWidth: '280px',
                background: 'rgba(5, 5, 5, 0.9)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{
                    width: '10px',
                    height: '10px',
                    background: '#00ff88',
                    borderRadius: '50%',
                    boxShadow: '0 0 10px #00ff88',
                    animation: 'pulse 2s infinite'
                }}></div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 'bold' }}>
                        {notification.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#ccc' }}>
                        {notification.action}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '2px' }}>
                        {notification.time} • ✅ Verified by OfficialUM1
                    </div>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                    &times;
                </button>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(0, 255, 136, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
                }
            `}</style>
        </div>
    );
}
