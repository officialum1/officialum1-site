"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function CookieBanner() {
    const [show, setShow] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        if (pathname?.startsWith("/admin")) return;

        const consent = localStorage.getItem("cookie_consent");
        if (!consent) setShow(true);
    }, [pathname]);

    const acceptCookies = () => {
        localStorage.setItem("cookie_consent", "true");
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="cookieBanner">
            <div>
                <h4>Privacy preferences</h4>
                <p>We use cookies for site analytics and preferences.</p>
            </div>
            <div className="cookieActions">
                <button onClick={acceptCookies} className="btn btn-primary">
                    Accept
                </button>
                <button onClick={() => setShow(false)} className="btn btn-outline">
                    Decline
                </button>
            </div>

            <style jsx>{`
                .cookieBanner {
                    position: fixed;
                    right: 20px;
                    bottom: 20px;
                    z-index: 1200;
                    display: grid;
                    gap: 0.75rem;
                    width: min(320px, calc(100vw - 32px));
                    padding: 0.85rem;
                    border: 1px solid var(--border-subtle);
                    border-radius: 14px;
                    background: rgba(255, 255, 255, 0.96);
                    box-shadow: 0 18px 42px rgba(24, 32, 38, 0.16);
                    backdrop-filter: blur(18px);
                    color: var(--text-primary);
                    box-sizing: border-box;
                    overflow: hidden;
                }

                h4 {
                    margin: 0 0 0.25rem;
                    font-size: 0.92rem;
                    line-height: 1.25;
                }

                p {
                    margin: 0;
                    color: var(--text-muted);
                    font-size: 0.8rem;
                    line-height: 1.45;
                    max-width: 100%;
                    overflow-wrap: anywhere;
                }

                .cookieActions {
                    display: flex;
                    gap: 0.6rem;
                }

                .cookieActions :global(.btn) {
                    min-height: 38px;
                    flex: 1;
                    padding: 0.5rem 0.8rem !important;
                    border-radius: 10px !important;
                    font-size: 0.82rem !important;
                }

                @media (max-width: 640px) {
                    .cookieBanner {
                        left: 50%;
                        right: auto;
                        bottom: 10px;
                        width: min(330px, calc(100vw - 28px));
                        padding: 0.78rem;
                        gap: 0.55rem;
                        transform: translateX(-50%);
                        border-radius: 13px;
                    }

                    h4 {
                        font-size: 0.86rem;
                    }

                    p {
                        font-size: 0.76rem;
                        line-height: 1.35;
                    }

                    .cookieActions {
                        gap: 0.5rem;
                    }

                    .cookieActions :global(.btn) {
                        min-height: 36px;
                        padding: 0.45rem 0.65rem !important;
                        font-size: 0.78rem !important;
                    }
                }
            `}</style>
        </div>
    );
}
