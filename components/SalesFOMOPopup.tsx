"use client";

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

// Helper: Generates realistic-looking "live" events
// e.g., "M**d just bought Netflix Premium in United States"
// This uses REAL product names from your shop if available, or fallbacks
const SAMPLE_NAMES = ["Ahmed", "Sarah", "Mike", "John", "David", "Fatima", "Ali", "Jessica", "Chris", "Emma"];
const SAMPLE_COUNTRIES = ["🇺🇸 USA", "🇬🇧 UK", "🇦🇪 UAE", "🇵🇰 PK", "🇨🇦 CA", "🇩🇪 DE", "🇫🇷 FR"];
const FALLBACK_PRODUCTS = ["Netflix 4K", "Spotify Premium", "YouTube Premium", "NordVPN", "ChatGPT Plus"];

export default function SalesFOMOPopup() {
    const [visible, setVisible] = useState(false);
    const [event, setEvent] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);

    // 1. Fetch real products to make notifications authentic
    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) setProducts(data);
            })
            .catch(() => { });
    }, []);

    // 2. Randomly trigger notifications (every 10-30 seconds)
    useEffect(() => {
        const triggerNotification = () => {
            if (Math.random() > 0.7) return; // 30% chance to skip (don't be too annoying)

            const name = SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)];
            // Mask name: "Ahmed" -> "Ahm*d"
            const maskedName = name.substring(0, 3) + "**";
            const country = SAMPLE_COUNTRIES[Math.floor(Math.random() * SAMPLE_COUNTRIES.length)];

            // Pick a product
            let product;
            if (products.length > 0) {
                const p = products[Math.floor(Math.random() * products.length)];
                product = { name: p.name, image: p.image, link: `/shop/${p.id}` };
            } else {
                const text = FALLBACK_PRODUCTS[Math.floor(Math.random() * FALLBACK_PRODUCTS.length)];
                product = { name: text, image: null, link: '/shop' };
            }

            setEvent({
                user: maskedName,
                country,
                product
            });
            setVisible(true);

            // Hide after 5 seconds
            setTimeout(() => setVisible(false), 5000);
        };

        // Initial delay
        const timeout = setTimeout(triggerNotification, 5000);

        // Recurring interval
        const interval = setInterval(triggerNotification, 15000);

        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, [products]);

    // Don't render on server/initial load to avoid hydration mismatch
    if (!event) return null;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, x: -50, y: 50 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: -50, y: 50 }}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        left: '20px',
                        zIndex: 9999,
                        maxWidth: '350px'
                    }}
                >
                    <Link href={event.product.link} className="glass" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        borderRadius: '16px',
                        textDecoration: 'none',
                        color: 'inherit',
                        border: '1px solid rgba(0,255,136,0.3)',
                        background: 'rgba(0,0,0,0.85)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '12px',
                            background: 'rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem'
                        }}>
                            🛒
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '2px' }}>
                                {event.user} from {event.country} bought
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#00ff88', lineHeight: '1.2' }}>
                                {event.product.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '2px' }}>
                                Just now
                            </div>
                        </div>
                    </Link>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
