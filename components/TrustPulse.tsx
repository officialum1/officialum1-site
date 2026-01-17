"use client";

import { useState, useEffect } from 'react';

export default function TrustPulse() {
    const [notification, setNotification] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    const activities = [
        { name: "Someone from USA", action: "purchased 500 Discord Members", time: "2 mins ago" },
        { name: "John from UK", action: "bought 5 Instagram Accounts", time: "10 mins ago" },
        { name: "A user from Canada", action: "rented a niche website", time: "1 hour ago" },
        { name: "OfficialUM1 Client", action: "left a 5-star review", time: "just now" },
        { name: "Someone from Germany", action: "purchased Reddit Upvotes", time: "15 mins ago" },
        { name: "M. Umar", action: "is working on a new project", time: "Live" },
        { name: "New Sale", action: "TikTok Account Sold", time: "5 mins ago" }
    ];

    useEffect(() => {
        const showNextReview = () => {
            const randomActivity = activities[Math.floor(Math.random() * activities.length)];
            setNotification(randomActivity);
            setIsVisible(true);

            // Hide after 5 seconds
            setTimeout(() => {
                setIsVisible(false);
            }, 5000);
        };

        // Initial delay
        const initialDelay = setTimeout(showNextReview, 3000);

        // Repeat every 20-30 seconds
        const interval = setInterval(() => {
            showNextReview();
        }, 25000);

        return () => {
            clearTimeout(initialDelay);
            clearInterval(interval);
        };
    }, []);

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
