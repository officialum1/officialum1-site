"use client";

const tickerItems = [
    "WordPress & WooCommerce",
    "Next.js 15 & React",
    "Pixel-Perfect HTML5/CSS3",
    "PHP & MySQL",
    "TypeScript & Node.js",
    "Elementor Pro & Theme Dev",
    "Google Maps 3-Pack SEO",
    "65,000+ Verified Backlinks",
    "Companies House UK",
    "US State LLC Filing",
    "Stripe & Wise Banking",
    "Yahoo Finance & AP News",
];

export default function TechTicker() {
    const loop = [...tickerItems, ...tickerItems, ...tickerItems];

    return (
        <section
            aria-label="Technology, WordPress and media authority ticker"
            className="relative border-y overflow-hidden"
            style={{ background: "var(--bg-section)", borderColor: "var(--border-subtle)" }}
        >
            <div className="container py-6">
                <p
                    className="mb-4 text-center text-[0.75rem] font-bold uppercase tracking-[0.25em]"
                    style={{ color: "var(--text-muted)" }}
                >
                    Full-Stack Stacks • WordPress Ecosystem • Global Media &amp; Corporate Networks
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

                    <div className="tech-ticker-track" style={{ whiteSpace: 'nowrap', overflow: 'hidden', width: '100%' }}>
                        <div className="tech-ticker-inner" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', whiteSpace: 'nowrap', width: 'max-content' }}>
                            {loop.map((item, index) => (
                                <div key={`${item}-${index}`} className="tech-ticker-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', flexShrink: 0, padding: '0.35rem 1.25rem' }}>
                                    <span className="tech-ticker-dot" style={{ width: '6px', height: '6px', borderRadius: '999px', background: '#146c78', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
