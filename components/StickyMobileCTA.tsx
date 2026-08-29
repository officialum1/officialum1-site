"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, MessageCircle, ShoppingBag } from "lucide-react";

export default function StickyMobileCTA() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.pageYOffset > 500);
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    if (pathname?.startsWith("/admin")) return null;
    if (pathname?.startsWith("/checkout")) return null;
    if (pathname?.startsWith("/shop/")) return null;
    if (!isVisible) return null;

    return (
        <div className="mobile-cta-bar">
            <a href="https://wa.me/923237102924" target="_blank" rel="noopener noreferrer" className="cta-item wa">
                <MessageCircle className="icon" /> Support
            </a>
            <Link href="/shop" className="cta-item shop">
                <ShoppingBag className="icon" /> Shop
            </Link>
            <Link href="/services" className="cta-item services">
                <BriefcaseBusiness className="icon" /> Hire Us
            </Link>

            <style jsx>{`
                .mobile-cta-bar {
                    position: fixed;
                    bottom: 1.5rem;
                    left: 50%;
                    transform: translateX(-50%);
                    width: min(92%, 450px);
                    background: rgba(255, 255, 255, 0.94);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--border-subtle);
                    border-radius: 50px;
                    display: none;
                    justify-content: space-around;
                    align-items: center;
                    padding: 0.6rem;
                    z-index: 900;
                    box-shadow: 0 14px 34px rgba(24, 32, 38, 0.14);
                    animation: mobileCtaSlideUp 0.4s ease forwards;
                }

                @keyframes mobileCtaSlideUp {
                    from { opacity: 0; transform: translate(-50%, 20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }

                .cta-item {
                    text-decoration: none;
                    color: var(--text-primary);
                    font-size: 0.75rem;
                    font-weight: 700;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 3px;
                    padding: 0.5rem 0.9rem;
                    border-radius: 40px;
                    transition: all 0.2s;
                    min-width: 0;
                }

                .icon {
                    width: 1.2rem;
                    height: 1.2rem;
                    flex: none;
                }

                .wa { color: #14845f; }
                .shop { color: var(--accent-blue); }
                .services { background: var(--gradient); color: #fff; }

                @media (max-width: 768px) {
                    .mobile-cta-bar { display: flex; }
                }
            `}</style>
        </div>
    );
}
