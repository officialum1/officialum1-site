"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function CookieBanner() {
    const [accepted, setAccepted] = useState(true);
    const [show, setShow] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Don't show on admin pages
        if (pathname?.startsWith('/admin')) {
            return;
        }

        const consent = localStorage.getItem("cookie_consent");
        if (!consent) {
            setAccepted(false);
            setShow(true);
        }
    }, [pathname]);

    const acceptCookies = () => {
        localStorage.setItem("cookie_consent", "true");
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="glass" style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            maxWidth: '350px',
            padding: '1.5rem',
            borderRadius: '16px',
            zIndex: 9999,
            border: '1px solid var(--glass-border)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
            <h4 style={{ marginBottom: '0.5rem' }}>We care about privacy 🍪</h4>
            <p style={{ fontSize: '0.85rem', color: '#ccc', marginBottom: '1rem' }}>
                We use cookies to enhance your browsing experience and analyze our traffic.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={acceptCookies} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    Accept All
                </button>
                <button onClick={() => setShow(false)} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    Decline
                </button>
            </div>
        </div>
    );
}
