"use client";

const tickerItems = [
    { label: "Next.js 15", category: "Tech" },
    { label: "Companies House UK", category: "Gov" },
    { label: "Yahoo Finance", category: "Media" },
    { label: "Stripe Payments", category: "FinTech" },
    { label: "MarketWatch", category: "Media" },
    { label: "Wise Business", category: "Banking" },
    { label: "AP News", category: "Media" },
    { label: "TypeScript", category: "Tech" },
    { label: "Google News", category: "Media" },
    { label: "WordPress 90+ Score", category: "Speed" },
    { label: "Payoneer UK", category: "Banking" },
    { label: "Bloomberg Feed", category: "Media" },
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
                        className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10"
                        style={{
                            background:
                                "linear-gradient(90deg, var(--bg-section) 0%, transparent 100%)",
                        }}
                    />
                    <div
                        className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10"
                        style={{
                            background:
                                "linear-gradient(270deg, var(--bg-section) 0%, transparent 100%)",
                        }}
                    />

                    <div className="ticker-track">
                        <div className="ticker-inner">
                            {loop.map((item, index) => (
                                <div key={`${item.label}-${index}`} className="ticker-pill flex items-center gap-2">
                                    <span className="ticker-dot" />
                                    <span className="font-semibold text-xs sm:text-sm text-[#182026] dark:text-gray-200">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
