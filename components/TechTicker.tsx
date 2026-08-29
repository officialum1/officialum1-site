"use client";

const techItems = [
    "Next.js",
    "React",
    "TypeScript",
    "Node.js",
    "Tailwind CSS",
    "Framer Motion",
    "Figma",
    "WordPress",
    "Google Ads",
    "Canva",
];

export default function TechTicker() {
    const loop = [...techItems, ...techItems, ...techItems];

    return (
        <section
            aria-label="Technology stack ticker"
            className="relative border-y"
            style={{ background: "var(--bg-section)", borderColor: "var(--border-subtle)" }}
        >
            <div className="container py-6">
                <p
                    className="mb-4 text-center text-[0.75rem] font-semibold uppercase tracking-[0.3em]"
                    style={{ color: "var(--text-muted)" }}
                >
                    Powered by modern platforms & tools
                </p>

                <div className="relative overflow-hidden">
                    {/* Edge fades */}
                    <div
                        className="pointer-events-none absolute inset-y-0 left-0 w-16"
                        style={{
                            background:
                                "linear-gradient(90deg, var(--bg-section) 0%, rgba(17,17,24,0.4) 60%, transparent 100%)",
                        }}
                    />
                    <div
                        className="pointer-events-none absolute inset-y-0 right-0 w-16"
                        style={{
                            background:
                                "linear-gradient(270deg, var(--bg-section) 0%, rgba(17,17,24,0.4) 60%, transparent 100%)",
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
                }
                .ticker-inner {
                    display: inline-flex;
                    align-items: center;
                    animation: ticker-scroll 32s linear infinite;
                }
                .ticker-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    padding: 0.35rem 1.5rem;
                }
                .ticker-pill span {
                    white-space: nowrap;
                }
                .ticker-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 999px;
                    background: linear-gradient(135deg, var(--accent-blue), var(--accent-violet));
                    box-shadow: 0 0 14px rgba(79, 142, 247, 0.7);
                    flex-shrink: 0;
                }
                @keyframes ticker-scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
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
