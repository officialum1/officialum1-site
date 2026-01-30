"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Safety check for Cart Context (in case it's used outside provider during builds/tests)
    let cartContext;
    try { cartContext = useCart(); } catch (e) { }
    const { toggleCart, cartCount } = cartContext || { toggleCart: () => { }, cartCount: 0 };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);

        // Check Auth
        const stored = localStorage.getItem('buyer_user');
        if (stored) {
            const u = JSON.parse(stored);
            setUser(u);
            fetchNotifications(u.id);
        }

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const fetchNotifications = async (userId: string) => {
        try {
            const res = await fetch(`/api/notifications?userId=${userId}`);
            const data = await res.json();
            if (Array.isArray(data)) setNotifications(data);
        } catch { }
    };

    const markAllRead = async () => {
        if (unreadCount === 0) return;
        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, action: 'markAllRead' })
            });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        } catch { }
    };

    const handleLogout = () => {
        localStorage.removeItem('buyer_user');
        setUser(null);
        window.location.href = '/';
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const term = (e.target as HTMLInputElement).value;
            if (term.trim()) {
                window.location.href = `/shop?search=${encodeURIComponent(term)}`;
                setIsOpen(false);
            }
        }
    };

    return (
        <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
            <div className="container navbar-content" style={{ position: 'relative' }}>
                <Link href="/" className="logo text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 1001 }}>
                    <img src="/logo.jpg" alt="OfficialUM1 Logo" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    OfficialUM1
                </Link>

                {/* Hamburger Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle Menu"
                >
                    <span className={`bar ${isOpen ? 'open' : ''}`}></span>
                    <span className={`bar ${isOpen ? 'open' : ''}`}></span>
                    <span className={`bar ${isOpen ? 'open' : ''}`}></span>
                </button>

                {/* Global Search Bar (Desktop) */}
                <div className="hidden md:block" style={{ flex: 1, maxWidth: '300px', margin: '0 2rem' }}>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search..."
                            onKeyDown={handleSearch}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '8px 12px 8px 35px',
                                borderRadius: '20px',
                                color: 'white',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                {/* Navigation Links & Auth */}
                <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
                    <ul className="nav-links">
                        <li><Link href="/services" className="nav-link" onClick={() => setIsOpen(false)}>Services</Link></li>
                        <li><Link href="/shop" className="nav-link" style={{ color: '#00ff88' }} onClick={() => setIsOpen(false)}>Shop</Link></li>
                        <li><Link href="/reviews" className="nav-link" onClick={() => setIsOpen(false)}>Reviews</Link></li>
                        <li><Link href="/store" className="nav-link" onClick={() => setIsOpen(false)}>Rentals</Link></li>
                        <li><Link href="/blog" className="nav-link" onClick={() => setIsOpen(false)}>Blog</Link></li>
                        <li><Link href="/about" className="nav-link" onClick={() => setIsOpen(false)}>About</Link></li>
                        <li><Link href="/refer" className="nav-link" style={{ color: '#ffd700' }} onClick={() => setIsOpen(false)}>💸 Earn</Link></li>
                        {/* Admin/HR Links - Restricted */}
                        {user && (user.role === 'admin' || user.role === 'seller') ? (
                            <>
                                <li><Link href="/admin/inventory" className="nav-link" style={{ color: '#00ccff' }} onClick={() => setIsOpen(false)}>Admin</Link></li>
                            </>
                        ) : null}
                    </ul>

                    <div className="auth-buttons" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Notification Bell */}
                        {user && (
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) markAllRead(); }}
                                    style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}
                                >
                                    🔔
                                    {unreadCount > 0 && (
                                        <span style={{ position: 'absolute', top: '0', right: '0', background: '#00ff88', color: '#000', fontSize: '0.6rem', fontWeight: 'bold', width: '15px', height: '15px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Dropdown */}
                                {showNotifications && (
                                    <div className="glass" style={{
                                        position: 'absolute', top: '40px', right: '0', width: '280px', maxHeight: '400px',
                                        overflowY: 'auto', borderRadius: '12px', zIndex: 1002, padding: '10px',
                                        border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(10, 10, 10, 0.95)',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                    }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px', color: '#888', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Notifications</span>
                                            <span style={{ color: '#00ff88', cursor: 'pointer' }} onClick={() => setShowNotifications(false)}>Close</span>
                                        </div>
                                        {notifications.length === 0 && <div style={{ textAlign: 'center', color: '#555', padding: '20px 0', fontSize: '0.85rem' }}>No notifications yet.</div>}
                                        {notifications.map(n => (
                                            <div key={n.id} style={{
                                                padding: '10px', borderRadius: '8px', marginBottom: '5px',
                                                background: n.is_read ? 'transparent' : 'rgba(0,255,136,0.05)',
                                                border: '1px solid rgba(255,255,255,0.02)'
                                            }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: n.is_read ? '#ccc' : '#fff' }}>{n.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>{n.message}</div>
                                                <div style={{ fontSize: '0.6rem', color: '#444', marginTop: '5px' }}>{new Date(n.created_at).toLocaleString()}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cart Button */}
                        <button onClick={toggleCart} style={{ position: 'relative', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', marginRight: '0.5rem' }}>
                            🛒
                            {cartCount > 0 && (
                                <span style={{ position: 'absolute', top: '-5px', right: '-10px', background: '#ff4d4d', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 5px', borderRadius: '50%', minWidth: '18px', textAlign: 'center' }}>
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {user ? (
                            <div className="user-menu">
                                <Link href="/dashboard" className="nav-link" onClick={() => setIsOpen(false)} style={{ color: '#00ff88', fontWeight: 'bold' }}>Dashboard</Link>
                                <Link href="/my-orders" className="nav-link" onClick={() => setIsOpen(false)}>Orders</Link>
                                <Link href="/support" className="nav-link" onClick={() => setIsOpen(false)}>Support</Link>
                                <button onClick={handleLogout} className="logout-btn">Logout</button>
                            </div>
                        ) : (
                            <div className="guest-menu">
                                <Link href="/login" className="nav-link" onClick={() => setIsOpen(false)}>Login</Link>
                                <Link href="/register" className="btn btn-primary" onClick={() => setIsOpen(false)}>Sign Up</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav >
    );
}
