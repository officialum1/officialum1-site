import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Metadata } from 'next';
import { PageHero } from "@/components/ui/PageHero";
import Script from "next/script";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { CheckCircle2, Zap, ArrowRight, Gauge, ShieldCheck, Award } from "lucide-react";

export const metadata: Metadata = {
    title: "WordPress Speed Optimization Services UK | 90+ PageSpeed Guarantee | OfficialUM1",
    description: "Guaranteed 90+ Google Mobile PageSpeed for UK WordPress & WooCommerce stores. Sub-1.5s load times, Core Web Vitals pass, zero downtime.",
    alternates: {
        canonical: "https://officialum1.com/services/wordpress-speed-optimization-uk",
    },
};

export default function WordPressSpeedUkPage() {
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Do you guarantee 90+ Google PageSpeed score for UK websites?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. We guarantee a 90+ mobile & desktop Google PageSpeed score and a 100% pass on Core Web Vitals (LCP, INP, CLS) or a full refund."
                }
            },
            {
                "@type": "Question",
                "name": "Will our live WooCommerce UK store experience any downtime during optimization?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Never. All optimizations are performed on a dedicated staging clone before pushing live to ensure 100% zero downtime."
                }
            }
        ]
    };

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://officialum1.com" },
            { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://officialum1.com/services" },
            { "@type": "ListItem", "position": 3, "name": "WordPress Speed UK", "item": "https://officialum1.com/services/wordpress-speed-optimization-uk" }
        ]
    };

    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "WordPress Speed Optimization Services UK",
        "provider": { "@type": "Organization", "name": "OfficialUM1 LLC" },
        "description": "Specialized WordPress & WooCommerce performance engineering for UK businesses. Guaranteed 90+ mobile Core Web Vitals score.",
        "url": "https://officialum1.com/services/wordpress-speed-optimization-uk"
    };

    return (
        <main style={{ background: "var(--bg-base)", minHeight: "100vh", color: "var(--text-primary)" }}>
            <Navbar />

            <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <Script id="service-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "WordPress Speed UK" }]}
                    label="UK Performance Engineering"
                    title={<>Guaranteed <span style={{ color: "var(--accent-blue)" }}>90+ WordPress Speed</span> for UK Brands</>}
                    description="Slash mobile load times below 1.5 seconds, pass Google Core Web Vitals, and stop losing UK buyers to slow checkout friction."
                />

                <section style={{ padding: "80px 0", background: "#ffffff", borderBottom: "1px solid var(--border-subtle)" }}>
                    <div className="container" style={{ maxWidth: "1000px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px", marginBottom: "60px" }}>
                            <div style={{ background: "var(--bg-base)", padding: "32px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                                <Gauge size={28} color="var(--accent-blue)" style={{ marginBottom: "16px" }} />
                                <h3 style={{ fontSize: "20px", fontWeight: 900, marginBottom: "12px" }}>Sub-180ms TTFB in London & UK</h3>
                                <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "15px", margin: 0 }}>
                                    Deploy edge caching at Cloudflare & LiteSpeed London POPs for lightning-fast HTML delivery across Great Britain.
                                </p>
                            </div>

                            <div style={{ background: "var(--bg-base)", padding: "32px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                                <Zap size={28} color="var(--accent-blue)" style={{ marginBottom: "16px" }} />
                                <h3 style={{ fontSize: "20px", fontWeight: 900, marginBottom: "12px" }}>WooCommerce Cart Acceleration</h3>
                                <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "15px", margin: 0 }}>
                                    Disable heavy AJAX cart-fragments bloat, defer non-critical pixels, and speed up checkout completion by up to 40%.
                                </p>
                            </div>

                            <div style={{ background: "var(--bg-base)", padding: "32px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                                <Award size={28} color="var(--accent-blue)" style={{ marginBottom: "16px" }} />
                                <h3 style={{ fontSize: "20px", fontWeight: 900, marginBottom: "12px" }}>100% Core Web Vitals Guarantee</h3>
                                <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "15px", margin: 0 }}>
                                    Guaranteed green 90+ metrics for Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS).
                                </p>
                            </div>
                        </div>

                        <div style={{ background: "var(--bg-base)", padding: "40px", borderRadius: "24px", border: "1px solid var(--border-subtle)" }}>
                            <h2 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "20px" }}>What Our 24-Hour UK Speed Protocol Includes</h2>
                            <ul style={{ display: "grid", gap: "16px", padding: 0, listStyle: "none", margin: 0 }}>
                                {[
                                    "Complete MySQL database indexing and wp_options autoload bloat removal.",
                                    "Critical Path CSS generation and JavaScript execution delay for smooth mobile interaction.",
                                    "Next-gen WebP & AVIF automatic media conversion with lossless compression.",
                                    "LiteSpeed Enterprise & Cloudflare Edge Page Cache configuration.",
                                    "Before & after Google PageSpeed Insights audit report with 60-day performance retention warranty."
                                ].map((item, idx) => (
                                    <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "16px", color: "var(--text-primary)", fontWeight: 700 }}>
                                        <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: "2px" }} />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <section style={{ padding: "80px 0", background: "var(--bg-base)" }}>
                    <div className="container" style={{ maxWidth: "860px" }}>
                        <div style={{
                            background: "linear-gradient(135deg, #182026 0%, #0c1217 100%)",
                            borderRadius: "28px",
                            padding: "48px 36px",
                            color: "#ffffff",
                            textAlign: "center",
                            boxShadow: "0 22px 50px rgba(24, 32, 38, 0.15)"
                        }}>
                            <Badge className="bg-white/10 text-teal-300 mb-4">Fast 24-Hour Turnaround</Badge>
                            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, marginBottom: "16px" }}>
                                Lock Your 90+ Score in Under 24 Hours
                            </h2>
                            <p style={{ color: "#94a3b8", fontSize: "17px", maxWidth: "600px", margin: "0 auto 32px", lineHeight: 1.6 }}>
                                Claim your guaranteed speed optimization package starting at £199 with 100% zero downtime.
                            </p>
                            <Link
                                href="/services/wordpress-speed-optimization"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "16px 36px",
                                    borderRadius: "999px",
                                    background: "linear-gradient(135deg, var(--accent-blue), #14808e)",
                                    color: "#ffffff",
                                    fontWeight: 900,
                                    fontSize: "16px",
                                    textDecoration: "none",
                                    boxShadow: "0 10px 26px rgba(20, 108, 120, 0.4)"
                                }}
                            >
                                Optimize My WordPress Site <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </main>
    );
}
