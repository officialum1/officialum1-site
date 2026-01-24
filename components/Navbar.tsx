"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);

        // Check Auth
        const stored = localStorage.getItem('buyer_user');
        if (stored) {
            setUser(JSON.parse(stored));
        }

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('buyer_user');
        setUser(null);
        window.location.href = '/';
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

                {/* Navigation Links & Auth */}
                <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
                    <ul className="nav-links">
                        <li><Link href="/services" className="nav-link" onClick={() => setIsOpen(false)}>Services</Link></li>
                        <li><Link href="/shop" className="nav-link" style={{ color: '#00ff88' }} onClick={() => setIsOpen(false)}>Buy Accounts</Link></li>
                        <li><Link href="/reviews" className="nav-link" onClick={() => setIsOpen(false)}>Reviews</Link></li>
                        <li><Link href="/store" className="nav-link" onClick={() => setIsOpen(false)}>Rent Sites</Link></li>
                        <li><Link href="/work" className="nav-link" onClick={() => setIsOpen(false)}>Work</Link></li>
                        <li><Link href="/blog" className="nav-link" onClick={() => setIsOpen(false)}>Insights</Link></li>
                        <li><Link href="/about" className="nav-link" onClick={() => setIsOpen(false)}>About</Link></li>
                        {/* Admin/HR Links - Restricted */}
                        {user && user.email === 'admin@officialum1.com' ? (
                            <>
                                <li><Link href="/admin/inventory" className="nav-link" style={{ color: '#00ccff' }} onClick={() => setIsOpen(false)}>Admin</Link></li>
                            </>
                        ) : null}
                    </ul>

                    <div className="auth-buttons">
                        {user ? (
                            <div className="user-menu">
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
        </nav>
    );
}
