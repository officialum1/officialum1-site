"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function StickyMobileCTA() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };
        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="mobile-cta-bar">
            <a href="https://wa.me/923237102924" target="_blank" className="cta-item wa">
                <span className="icon">💬</span> Support
            </a>
            <Link href="/shop" className="cta-item shop">
                <span className="icon">🛍️</span> Shop
            </Link>
            <Link href="/services" className="cta-item services">
                <span className="icon">🚀</span> Hire Us
            </Link>

            <style jsx>{`
                .mobile-cta-bar {
                    position: fixed;
                    bottom: 1.5rem;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 90%;
                    max-width: 450px;
                    background: rgba(8, 8, 12, 0.85);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 50px;
                    display: none;
                    justify-content: space-around;
                    align-items: center;
                    padding: 0.6rem;
                    z-index: 9999;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
                    animation: slideUp 0.4s ease forwards;
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translate(-50%, 20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }

                .cta-item {
                    text-decoration: none;
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 700;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 3px;
                    padding: 0.5rem 1rem;
                    border-radius: 40px;
                    transition: all 0.2s;
                }

                .icon { font-size: 1.2rem; }

                .wa { color: #00ff88; }
                .shop { color: #00c3ff; }
                .services { background: var(--primary); color: #000; }

                @media (max-width: 768px) {
                    .mobile-cta-bar { display: flex; }
                }
            `}</style>
        </div>
    );
}
