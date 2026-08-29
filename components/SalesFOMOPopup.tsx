"use client";

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { readJson } from '@/lib/read-json';

// Helper: Generates realistic-looking "live" events
// e.g., "M**d just bought Netflix Premium in United States"
// This uses REAL product names from your shop if available, or fallbacks
const SAMPLE_NAMES = ["Ahmed", "Sarah", "Mike", "John", "David", "Fatima", "Ali", "Jessica", "Chris", "Emma"];
const SAMPLE_COUNTRIES = ["🇺🇸 USA", "🇬🇧 UK", "🇦🇪 UAE", "🇵🇰 PK", "🇨🇦 CA", "🇩🇪 DE", "🇫🇷 FR"];
const FALLBACK_PRODUCTS = ["Netflix 4K", "Spotify Premium", "YouTube Premium", "NordVPN", "ChatGPT Plus"];

export default function SalesFOMOPopup() {
    const [visible, setVisible] = useState(false);
    const [event, setEvent] = useState<any>(null);

    // --- REAL FOMO LOGIC ---
    useEffect(() => {
        let lastSeenId = '';

        const fetchRealOrders = async () => {
            try {
                const res = await fetch('/api/orders/recent');
                const orders = await readJson<any[]>(res);

                if (Array.isArray(orders) && orders.length > 0) {
                    const latest = orders[0];

                    // Only trigger if it's a NEW unseen order
                    if (latest.id !== lastSeenId) {
                        lastSeenId = latest.id;
                        setEvent({
                            user: 'Recent Customer', // Anonymous but real
                            country: 'Verified Purchase',
                            product: {
                                name: latest.productName,
                                image: latest.image,
                                link: `/shop` // No direct link to order to protect privacy
                            },
                            time: latest.timeAgo
                        });
                        setVisible(true);

                        // Hide after 6 seconds
                        setTimeout(() => setVisible(false), 6000);
                    }
                }
            } catch (e) { }
        };

        // Initial check
        fetchRealOrders();

        // POLL every 30 seconds for new sales
        // This is "Real Time" enough without WebSockets overhead
        const interval = setInterval(fetchRealOrders, 30000);

        return () => clearInterval(interval);
    }, []);

    if (!visible || !event) return null;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="fomoShell"
                    initial={{ opacity: 0, x: -100, scale: 0.9, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, x: -100, scale: 0.9, filter: 'blur(10px)' }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    style={{
                        position: 'fixed',
                        bottom: '30px',
                        left: '30px',
                        zIndex: 9999,
                        maxWidth: '380px',
                        pointerEvents: 'auto'
                    }}
                >
                    <Link href={event.product.link} style={{ textDecoration: 'none' }}>
                        <div className="modern-fomo-card">
                            <div className="glow-edge"></div>

                            <div className="product-icon-container">
                                {event.product.image ? (
                                    <img src={event.product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                                ) : (
                                    <span style={{ fontSize: '1.8rem' }}>💎</span>
                                )}
                                <div className="verified-badge">✓</div>
                            </div>

                            <div className="info-content">
                                <div className="top-badge">
                                    <span className="pulse-dot"></span>
                                    VERIFIED PURCHASE - {event.country}
                                </div>
                                <div className="user-text">
                                    <span style={{ color: '#fff', fontWeight: 'bold' }}>{event.user}</span> just bought
                                </div>
                                <div className="product-text">
                                    {event.product.name}
                                </div>
                                <div className="time-text">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    Just now
                                </div>
                            </div>

                            {/* Closing Progress Bar */}
                            <motion.div
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: 5, ease: "linear" }}
                                className="progress-bar-fomo"
                            />
                        </div>
                    </Link>

                    <style jsx>{`
                        @media (max-width: 640px) {
                            .fomoShell {
                                display: none;
                            }
                        }
                        .modern-fomo-card {
                            background: rgba(10, 10, 15, 0.85);
                            backdrop-filter: blur(20px) saturate(180%);
                            -webkit-backdrop-filter: blur(20px) saturate(180%);
                            border: 1px solid rgba(0, 255, 136, 0.2);
                            border-radius: 20px;
                            padding: 16px;
                            display: flex;
                            align-items: center;
                            gap: 16px;
                            box-shadow: 0 20px 50px rgba(0,0,0,0.6), 
                                        inset 0 0 20px rgba(0,255,136,0.03);
                            position: relative;
                            overflow: hidden;
                            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
                                        border-color 0.3s ease;
                        }

                        .modern-fomo-card:hover {
                            transform: translateY(-5px) scale(1.02);
                            border-color: rgba(0, 255, 136, 0.5);
                        }

                        .glow-edge {
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 2px;
                            background: linear-gradient(90deg, transparent, #00ff88, transparent);
                            opacity: 0.5;
                        }

                        .product-icon-container {
                            width: 60px;
                            height: 60px;
                            border-radius: 14px;
                            background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01));
                            border: 1px solid rgba(255,255,255,0.1);
                            display: flex;
                            alignItems: center;
                            justifyContent: center;
                            flex-shrink: 0;
                            position: relative;
                        }

                        .verified-badge {
                            position: absolute;
                            bottom: -5px;
                            right: -5px;
                            width: 18px;
                            height: 18px;
                            background: #00ff88;
                            color: #000;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 10px;
                            font-weight: bold;
                            border: 2px solid #000;
                            box-shadow: 0 0 10px rgba(0,255,136,0.5);
                        }

                        .info-content {
                            flex: 1;
                        }

                        .top-badge {
                            font-size: 9px;
                            font-weight: 900;
                            color: #00ff88;
                            text-transform: uppercase;
                            letter-spacing: 1.5px;
                            margin-bottom: 4px;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            opacity: 0.8;
                        }

                        .pulse-dot {
                            width: 6px;
                            height: 6px;
                            background: #00ff88;
                            border-radius: 50%;
                            animation: pulse-ring 2s infinite;
                        }

                        .user-text {
                            font-size: 0.85rem;
                            color: #ccc;
                            margin-bottom: 1px;
                        }

                        .product-text {
                            font-size: 1rem;
                            font-weight: 800;
                            color: #fff;
                            letter-spacing: -0.3px;
                            filter: drop-shadow(0 0 5px rgba(255,255,255,0.1));
                        }

                        .time-text {
                            font-size: 0.75rem;
                            color: #555;
                            margin-top: 4px;
                            display: flex;
                            align-items: center;
                        }

                        .progress-bar-fomo {
                            position: absolute;
                            bottom: 0;
                            left: 0;
                            height: 3px;
                            background: linear-gradient(90deg, #00ff88, #00c3ff);
                            box-shadow: 0 0 10px rgba(0,255,136,0.3);
                        }

                        @keyframes pulse-ring {
                            0% { transform: scale(0.8); opacity: 0.5; }
                            50% { transform: scale(1.2); opacity: 1; }
                            100% { transform: scale(0.8); opacity: 0.5; }
                        }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
