"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DynamicSalesPulse() {
    const [notification, setNotification] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [realSales, setRealSales] = useState<any[]>([]);
    const [shopItems, setShopItems] = useState<any[]>([]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // 1. Fetch Real Sales
                const salesRes = await fetch('/api/sales/recent');
                const salesData = await salesRes.json();
                if (Array.isArray(salesData)) setRealSales(salesData);

                // 2. Fetch Shop Items for simulation fallback
                const productsRes = await fetch('/api/products');
                const productsData = await productsRes.json();
                if (Array.isArray(productsData)) setShopItems(productsData);
            } catch (err) {
                console.error("Pulse Load Error:", err);
            }
        };

        loadInitialData();

        // Refresh data every 2 minutes
        const refreshInterval = setInterval(loadInitialData, 120000);
        return () => clearInterval(refreshInterval);
    }, []);

    useEffect(() => {
        const triggerNotification = () => {
            let selected: any = null;

            // STRATEGY: 100% REAL DATA ONLY
            // 1. Priority: Show a Real Sale from the last 24h
            if (realSales.length > 0) {
                const sale = realSales[Math.floor(Math.random() * realSales.length)];

                selected = {
                    title: `✅ Verified Purchase`,
                    message: `Someone from ${sale.location} just bought ${sale.product}`,
                    time: sale.timeAgo,
                    type: 'real',
                    icon: '🛒'
                };
            }
            // 2. Fallback: Show a Real "Trending" Item from Inventory (if no recent sales)
            else if (shopItems.length > 0) {
                // Pick a random real item from the shop
                const item = shopItems[Math.floor(Math.random() * shopItems.length)];

                selected = {
                    title: `🔥 Trending Now`,
                    message: `${item.name} is in high demand right now!`,
                    time: 'Live',
                    type: 'trending',
                    icon: '📈'
                };
            }

            if (selected) {
                setNotification(selected);
                setIsVisible(true);

                // Hide after 6 seconds
                setTimeout(() => setIsVisible(false), 6000);
            }
        };

        // Random intervals between 20 and 45 seconds
        const nextPulse = () => {
            const delay = Math.floor(Math.random() * (45000 - 20000 + 1)) + 20000;
            return setTimeout(() => {
                triggerNotification();
                pulseTimeout = nextPulse();
            }, delay);
        };

        let pulseTimeout = setTimeout(triggerNotification, 5000); // First one after 5 seconds

        return () => clearTimeout(pulseTimeout);
    }, [realSales, shopItems]);

    if (!notification) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ x: -100, opacity: 0, scale: 0.8 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ x: -100, opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    style={{
                        position: 'fixed',
                        bottom: '25px',
                        left: '25px',
                        zIndex: 99999,
                        minWidth: '320px',
                        pointerEvents: 'auto'
                    }}
                >
                    <div style={{
                        background: 'rgba(10, 10, 15, 0.85)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(0, 255, 136, 0.2)',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: '0 15px 40px rgba(0,0,0,0.4), 0 0 20px rgba(0,255,136,0.05)',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        {/* Status Light */}
                        <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#00ff88',
                            boxShadow: '0 0 8px #00ff88'
                        }} />

                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(0,255,136,0.1), rgba(0,195,255,0.1))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            flexShrink: 0,
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            {notification.icon}
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: '0.75rem',
                                color: '#00ff88',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                marginBottom: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                {notification.title}
                                {notification.type === 'real' && <span style={{ fontSize: '0.6rem', color: '#888', fontWeight: 'normal' }}>• Verified</span>}
                            </div>
                            <div style={{
                                fontSize: '0.9rem',
                                color: '#fff',
                                fontWeight: '500',
                                lineHeight: '1.3'
                            }}>
                                {notification.message}
                            </div>
                            <div style={{
                                fontSize: '0.7rem',
                                color: '#666',
                                marginTop: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <span>🕒 {notification.time}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsVisible(false)}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: 'none',
                                color: '#444',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#444'}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <motion.div
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: 6, ease: "linear" }}
                        style={{
                            height: '2px',
                            background: 'linear-gradient(90deg, #00ff88, #00c3ff)',
                            position: 'absolute',
                            bottom: '0',
                            left: '16px',
                            right: '16px',
                            borderRadius: '2px',
                            opacity: 0.6
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
