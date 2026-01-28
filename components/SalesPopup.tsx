"use client";

import { useState, useEffect } from 'react';

export default function SalesPopup() {
    const [sale, setSale] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [queue, setQueue] = useState<any[]>([]);

    useEffect(() => {
        // Initial Fetch
        fetchSales();

        // Poll every 30 seconds to get new sales
        const interval = setInterval(fetchSales, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchSales = async () => {
        try {
            const res = await fetch('/api/sales/recent');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setQueue(data);
                }
            }
        } catch (e) { console.error("Sales popup error", e); }
    };

    // Cycle through queue
    useEffect(() => {
        if (queue.length === 0) return;

        const showNext = () => {
            const nextSale = queue[Math.floor(Math.random() * queue.length)]; // Pick random or sequential
            setSale(nextSale);
            setIsVisible(true);

            // Hide after 5 seconds
            setTimeout(() => {
                setIsVisible(false);
            }, 5000);
        };

        // Show a popup every 15 seconds
        const cycle = setInterval(showNext, 15000);

        // Show immediate first one
        if (!sale) showNext();

        return () => clearInterval(cycle);
    }, [queue]);

    if (!sale) return null;

    return (
        <div
            className={`sales-popup ${isVisible ? 'visible' : ''}`}
            style={{
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                background: 'rgba(20, 20, 20, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '15px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                zIndex: 9999,
                transform: isVisible ? 'translateY(0)' : 'translateY(100px)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                maxWidth: '350px'
            }}
        >
            <div style={{ fontSize: '2rem' }}>🎉</div>
            <div>
                <div style={{ fontSize: '0.85rem', color: '#ccc', marginBottom: '2px' }}>
                    Someone from <span style={{ color: '#fff', fontWeight: 'bold' }}>{sale.location}</span> purchased
                </div>
                <div style={{ color: '#00ff88', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '2px' }}>
                    {sale.product}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>
                    {sale.timeAgo}
                </div>
            </div>

            <button
                onClick={() => setIsVisible(false)}
                style={{
                    position: 'absolute',
                    top: '5px',
                    right: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: '1rem'
                }}
            >
                ×
            </button>
        </div>
    );
}
