import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Metadata } from 'next';
import { PageHero } from "@/components/ui/PageHero";
import Script from "next/script";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { CheckCircle2, TrendingUp, ArrowRight, Target, MapPin, Building2 } from "lucide-react";

export const metadata: Metadata = {
    title: "Enterprise SEO Services in Dubai & UAE | OfficialUM1",
    description: "Dominate Google search rankings in Dubai, Abu Dhabi, and the GCC. High-ROI technical SEO, Google Maps 3-Pack rankings, and digital PR for UAE businesses.",
    alternates: {
        canonical: "https://officialum1.com/services/seo-services-dubai",
    },
};

export default function SeoServicesDubaiPage() {
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How do you rank businesses in Dubai & UAE Google search?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We implement bilingual English & Arabic technical SEO architectures, high-authority UAE local citations, Google Business Profile 3-Pack dominance, and digital PR outreach."
                }
            },
            {
                "@type": "Question",
                "name": "What industries in the UAE do you specialize in?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We serve real estate brokers, luxury car rentals, e-commerce stores, legal & financial firms, B2B SaaS, and healthcare clinics across Dubai and Abu Dhabi."
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
            { "@type": "ListItem", "position": 3, "name": "SEO Services Dubai", "item": "https://officialum1.com/services/seo-services-dubai" }
        ]
    };

    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Enterprise SEO Services in Dubai & UAE",
        "provider": { "@type": "Organization", "name": "OfficialUM1 LLC" },
        "description": "High-impact enterprise search engine optimization and Google Maps 3-Pack ranking services for UAE companies.",
        "url": "https://officialum1.com/services/seo-services-dubai"
    };

    return (
        <main style={{ background: "var(--bg-base)", minHeight: "100vh", color: "var(--text-primary)" }}>
            <Navbar />

            <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <Script id="service-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "SEO Dubai" }]}
                    label="UAE & GCC Markets"
                    title={<>Enterprise <span style={{ color: "var(--accent-blue)" }}>SEO Services in Dubai</span> & UAE</>}
                    description="Capture high-net-worth commercial search intent across Dubai, Abu Dhabi, and the GCC with data-engineered organic search visibility."
                />

                <section style={{ padding: "80px 0", background: "#ffffff", borderBottom: "1px solid var(--border-subtle)" }}>
                    <div className="container" style={{ maxWidth: "1000px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px", marginBottom: "60px" }}>
                            <div style={{ background: "var(--bg-base)", padding: "32px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                                <MapPin size={28} color="var(--accent-blue)" style={{ marginBottom: "16px" }} />
                                <h3 style={{ fontSize: "20px", fontWeight: 900, marginBottom: "12px" }}>Google Maps 3-Pack Dominance</h3>
                                <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "15px", margin: 0 }}>
                                    Rank your business in the top 3 Google Maps listings for competitive local searches in Downtown Dubai, Marina, and Business Bay.
                                </p>
                            </div>

                            <div style={{ background: "var(--bg-base)", padding: "32px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                                <TrendingUp size={28} color="var(--accent-blue)" style={{ marginBottom: "16px" }} />
                                <h3 style={{ fontSize: "20px", fontWeight: 900, marginBottom: "12px" }}>High-Value Commercial Intent</h3>
                                <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "15px", margin: 0 }}>
                                    Target purchase-ready buyers searching for premium services, luxury real estate, and B2B solutions in the Emirates.
                                </p>
                            </div>

                            <div style={{ background: "var(--bg-base)", padding: "32px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                                <Building2 size={28} color="var(--accent-blue)" style={{ marginBottom: "16px" }} />
                                <h3 style={{ fontSize: "20px", fontWeight: 900, marginBottom: "12px" }}>High-Authority UAE Digital PR</h3>
                                <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "15px", margin: 0 }}>
                                    Acquire authoritative editorial backlinks and mentions from leading Middle Eastern media and business portals.
                                </p>
                            </div>
                        </div>

                        <div style={{ background: "var(--bg-base)", padding: "40px", borderRadius: "24px", border: "1px solid var(--border-subtle)" }}>
                            <h2 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "20px" }}>Our Proven UAE Ranking Blueprint</h2>
                            <ul style={{ display: "grid", gap: "16px", padding: 0, listStyle: "none", margin: 0 }}>
                                {[
                                    "Deep competitor keyword gap analysis across UAE and GCC search volume.",
                                    "Technical site audit with sub-200ms Core Web Vitals performance tuning.",
                                    "Comprehensive LocalBusiness Schema markup and localized citation syndication.",
                                    "High-converting landing page optimization targeting buyer search terms.",
                                    "Weekly transparent analytics reporting with live keyword rank tracking."
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
                            <Badge className="bg-white/10 text-teal-300 mb-4">Grow in Dubai & UAE</Badge>
                            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, marginBottom: "16px" }}>
                                Ready to Dominate Search in the Emirates?
                            </h2>
                            <p style={{ color: "#94a3b8", fontSize: "17px", maxWidth: "600px", margin: "0 auto 32px", lineHeight: 1.6 }}>
                                Request your free customized UAE search competitive audit and keyword strategy map today.
                            </p>
                            <Link
                                href="/contact"
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
                                Request Free UAE SEO Audit <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </main>
    );
}
