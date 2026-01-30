"use client";

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function RecentSalesPopup() {
    const [sales, setSales] = useState<any[]>([]);
    const [current, setCurrent] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Initial Fetch
        fetchSales();

        // Refresh sales data every 5 minutes
        const interval = setInterval(fetchSales, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Loop through sales to show popup
    useEffect(() => {
        if (sales.length === 0) return;

        const showRandom = () => {
            const randomSale = sales[Math.floor(Math.random() * sales.length)];
            setCurrent(randomSale);
            setIsVisible(true);

            // Hide after 5 seconds
            setTimeout(() => setIsVisible(false), 5000);
        };

        // Show popup every 20-40 seconds
        const loop = setInterval(() => {
            // Random delay between popups
            if (Math.random() > 0.3) showRandom();
        }, 30000);

        // Show first one after 5 seconds
        setTimeout(showRandom, 5000);

        return () => clearInterval(loop);
    }, [sales]);

    const fetchSales = async () => {
        try {
            const res = await fetch('/api/sales/recent');
            const data = await res.json();
            if (Array.isArray(data)) setSales(data);
        } catch { }
    };

    if (!current) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: -50 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        left: '20px',
                        zIndex: 9999,
                        background: 'rgba(5, 5, 5, 0.9)',
                        border: '1px solid rgba(0, 255, 136, 0.2)',
                        backdropFilter: 'blur(10px)',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        maxWidth: '300px'
                    }}
                >
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'rgba(0, 255, 136, 0.1)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem'
                    }}>
                        🛒
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: '#fff' }}>
                            Someone from <span style={{ fontWeight: 'bold' }}>{current.location}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>
                            purchased <span style={{ color: '#00ff88' }}>{current.product}</span>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#555', marginTop: '2px' }}>
                            {current.timeAgo}
                        </div>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        style={{
                            position: 'absolute', top: '5px', right: '5px',
                            background: 'none', border: 'none', color: '#444',
                            fontSize: '0.8rem', cursor: 'pointer'
                        }}
                    >
                        ✕
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
