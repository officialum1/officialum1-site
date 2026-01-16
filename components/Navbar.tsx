"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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

                <Link href="/contact" className="btn btn-primary">
                    Book a Call
                </Link>
            </div>
        </nav>
    );
}
