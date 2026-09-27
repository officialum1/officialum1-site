"use client";

const tickerItems = [
    "Next.js 15",
    "Companies House UK",
    "Yahoo Finance",
    "Stripe Payments",
    "MarketWatch",
    "Wise Business",
    "AP News",
    "TypeScript",
    "Google News",
    "WordPress 90+ Score",
    "Payoneer UK",
    "Bloomberg Feed",
];

export default function TechTicker() {
    const loop = [...tickerItems, ...tickerItems, ...tickerItems];

    return (
        <section
            aria-label="Technology and media authority ticker"
            className="relative border-y overflow-hidden"
            style={{ background: "var(--bg-section)", borderColor: "var(--border-subtle)" }}
        >
            <div className="container py-6">
                <p
                    className="mb-4 text-center text-[0.75rem] font-bold uppercase tracking-[0.25em]"
                    style={{ color: "var(--text-muted)" }}
                >
                    Enterprise Infrastructure &amp; Verified Media Network
                </p>

                <div className="relative overflow-hidden">
                    {/* Edge fades */}
                    <div
                        className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10"
                        style={{
                            background:
                                "linear-gradient(90deg, var(--bg-section) 0%, transparent 100%)",
                        }}
                    />
                    <div
                        className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10"
                        style={{
                            background:
                                "linear-gradient(270deg, var(--bg-section) 0%, transparent 100%)",
                        }}
                    />

                    <div className="ticker-track">
                        <div className="ticker-inner">
                            {loop.map((item, index) => (
                                <div key={`${item}-${index}`} className="ticker-pill">
                                    <span className="ticker-dot" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .ticker-track {
                    white-space: nowrap;
                    overflow: hidden;
                    width: 100%;
                }
                .ticker-inner {
                    display: inline-flex;
                    align-items: center;
                    animation: ticker-scroll 32s linear infinite;
                    will-change: transform;
                }
                .ticker-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-primary);
                    font-size: 0.85rem;
                    font-weight: 600;
                    padding: 0.35rem 1.25rem;
                    white-space: nowrap;
                }
                .ticker-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 999px;
                    background: #146c78;
                    box-shadow: 0 0 10px rgba(20, 108, 120, 0.6);
                    flex-shrink: 0;
                }
                @keyframes ticker-scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-33.333%);
                    }
                }
                @media (prefers-reduced-motion: reduce) {
                    .ticker-inner {
                        animation-duration: 0s;
                    }
                }
            `}</style>
        </section>
    );
}
