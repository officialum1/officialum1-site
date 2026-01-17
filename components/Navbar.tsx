"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);

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
            <div className="container navbar-content">
                <Link href="/" className="logo text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img src="/logo.jpg" alt="OfficialUM1 Logo" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    OfficialUM1
                </Link>

                <ul className="nav-links">
                    <li><Link href="/services" className="nav-link">Services</Link></li>
                    <li><Link href="/shop" className="nav-link" style={{ color: '#00ff88' }}>Buy Accounts</Link></li>
                    <li><Link href="/reviews" className="nav-link">Reviews</Link></li>
                    <li><Link href="/store" className="nav-link">Rent Sites</Link></li>
                    <li><Link href="/work" className="nav-link">Work</Link></li>
                    <li><Link href="/blog" className="nav-link">Insights</Link></li>
                    <li><Link href="/about" className="nav-link">About</Link></li>
                </ul>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ position: 'relative', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <Link href="/my-orders" className="nav-link" style={{ fontSize: '0.9rem' }}>Orders</Link>
                                <Link href="/support" className="nav-link" style={{ fontSize: '0.9rem' }}>Support</Link>
                                <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #333', color: '#ccc', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link href="/login" className="nav-link" style={{ fontSize: '0.9rem' }}>Login</Link>
                            <Link href="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
