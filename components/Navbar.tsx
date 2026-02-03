"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const unreadCount = notifications.filter(n => !n.is_read).length;

    const { toggleCart, cartCount } = useCart() as any;
    const { wishlist } = useWishlist();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);

        // Check Auth
        const stored = localStorage.getItem('buyer_user');
        if (stored) {
            try {
                const u = JSON.parse(stored);
                setUser(u);
                fetchNotifications(u.id);
            } catch (e) { }
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
            <div className="navbar-content">
                <Link href="/" className="logo text-gradient">
                    <img src="/logo.jpg" alt="OfficialUM1 Logo" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    OfficialUM1
                </Link>

                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle Menu"
                >
                    <span className={`bar ${isOpen ? 'open' : ''}`}></span>
                    <span className={`bar ${isOpen ? 'open' : ''}`}></span>
                    <span className={`bar ${isOpen ? 'open' : ''}`}></span>
                </button>

                <div className="nav-search-wrapper">
                    <input
                        type="text"
                        placeholder="Search products..."
                        onKeyDown={handleSearch}
                        className="input-field nav-search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>

                <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
                    <ul className="nav-links">
                        <li><Link href="/services" className="nav-link" onClick={() => setIsOpen(false)}>Services</Link></li>
                        <li><Link href="/shop" className="nav-link highlight" onClick={() => setIsOpen(false)}>Shop</Link></li>
                        <li><Link href="/my-orders" className="nav-link" onClick={() => setIsOpen(false)}>Track Order</Link></li>
                        <li><Link href="/shop?filter=Netflix" className="nav-link" onClick={() => setIsOpen(false)}>Netflix</Link></li>
                        <li><Link href="/reviews" className="nav-link" onClick={() => setIsOpen(false)}>Reviews</Link></li>
                        <li><Link href="/store" className="nav-link" onClick={() => setIsOpen(false)}>Rentals</Link></li>
                        <li><Link href="/blog" className="nav-link" onClick={() => setIsOpen(false)}>Blog</Link></li>
                        <li><Link href="/about" className="nav-link" onClick={() => setIsOpen(false)}>About</Link></li>
                        <li><Link href="/refer" className="nav-link" style={{ color: '#ffd700' }} onClick={() => setIsOpen(false)}>💸 Earn</Link></li>
                        {user && (user.role === 'admin' || user.role === 'seller') && (
                            <li><Link href="/admin/inventory" className="nav-link" style={{ color: 'var(--accent)' }} onClick={() => setIsOpen(false)}>Admin</Link></li>
                        )}
                    </ul>

                    <div className="auth-buttons">
                        {user && (
                            <div className="nav-icon-wrapper">
                                <button
                                    onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) markAllRead(); }}
                                    className="nav-icon-btn"
                                >
                                    🔔
                                    {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
                                </button>
                            </div>
                        )}

                        <Link href="/wishlist" className="nav-icon-wrapper" title="Wishlist">
                            <span style={{ fontSize: '1.2rem', filter: 'drop-shadow(0 0 5px rgba(255,0,0,0.3))' }}>❤️</span>
                            {wishlist.length > 0 && <span className="nav-badge badge-red">{wishlist.length}</span>}
                        </Link>

                        <button onClick={toggleCart} className="nav-icon-wrapper nav-icon-btn" title="Cart">
                            <span style={{ fontSize: '1.2rem', filter: 'drop-shadow(0 0 5px rgba(0,255,136,0.3))' }}>🛒</span>
                            {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
                        </button>

                        <div className="auth-divider" style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }}></div>

                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                                <Link href="/dashboard" className="nav-link" onClick={() => setIsOpen(false)}>Dashboard</Link>
                                <button onClick={handleLogout} className="btn-logout" style={{
                                    background: 'rgba(255,77,77,0.1)',
                                    color: '#ff4d4d',
                                    border: '1px solid rgba(255,77,77,0.2)',
                                    padding: '0.4rem 1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}>Logout</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                                <Link href="/login" className="nav-link" onClick={() => setIsOpen(false)}>Login</Link>
                                <Link href="/register" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }} onClick={() => setIsOpen(false)}>Sign Up</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
