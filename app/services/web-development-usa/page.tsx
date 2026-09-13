import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Metadata } from 'next';
import { PageHero } from "@/components/ui/PageHero";
import Script from "next/script";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { CheckCircle2, Zap, ArrowRight, ShieldCheck, Code, Globe2 } from "lucide-react";

export const metadata: Metadata = {
    title: "Custom Next.js & Web Development Services USA | OfficialUM1",
    description: "Enterprise custom web application and Next.js development for US businesses. High-speed headless React architecture, custom APIs, and scalable infrastructure.",
    alternates: {
        canonical: "https://officialum1.com/services/web-development-usa",
    },
};

export default function WebDevelopmentUsaPage() {
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Why choose OfficialUM1 for US web development?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "OfficialUM1 is a US-registered LLC delivering Silicon Valley-grade Next.js React web engineering at competitive global offshore efficiency, backed by milestone deliverables."
                }
            },
            {
                "@type": "Question",
                "name": "What tech stack do you deploy for American clients?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We specialize in Next.js 15 App Router, React, TypeScript, Tailwind CSS, PostgreSQL/MySQL, Node.js, and Edge CDN deployment on Vercel and AWS."
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
            { "@type": "ListItem", "position": 3, "name": "Web Development USA", "item": "https://officialum1.com/services/web-development-usa" }
        ]
    };

    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Custom Next.js & Web Development USA",
        "provider": { "@type": "Organization", "name": "OfficialUM1 LLC" },
        "description": "Enterprise Next.js web application engineering and headless CMS development for US enterprises and high-growth brands.",
        "url": "https://officialum1.com/services/web-development-usa"
    };

    return (
        <main style={{ background: "var(--bg-base)", minHeight: "100vh", color: "var(--text-primary)" }}>
            <Navbar />

            <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <Script id="service-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Web Development USA" }]}
                    label="US Registered Agency"
                    title={<>Enterprise <span style={{ color: "var(--accent-blue)" }}>Next.js Web Development</span> for US Brands</>}
                    description="Engineered for maximum velocity, sub-500ms load times, and conversion-focused architecture. We build high-scale web platforms that outperform the competition."
                />

                <section style={{ padding: "80px 0", background: "#ffffff", borderBottom: "1px solid var(--border-subtle)" }}>
                    <div className="container" style={{ maxWidth: "1000px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px", marginBottom: "60px" }}>
                            <div style={{ background: "var(--bg-base)", padding: "32px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                                <Code size={28} color="var(--accent-blue)" style={{ marginBottom: "16px" }} />
                                <h3 style={{ fontSize: "20px", fontWeight: 900, marginBottom: "12px" }}>Next.js 15 App Router Architecture</h3>
                                <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "15px", margin: 0 }}>
                                    Server Components, Static Generation, and Edge CDN deployment for sub-300ms page transitions across all 50 US states.
                                </p>
                            </div>

                            <div style={{ background: "var(--bg-base)", padding: "32px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                                <ShieldCheck size={28} color="var(--accent-blue)" style={{ marginBottom: "16px" }} />
                                <h3 style={{ fontSize: "20px", fontWeight: 900, marginBottom: "12px" }}>Unbreakable Decoupled Security</h3>
                                <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "15px", margin: 0 }}>
                                    Isolate databases and administrative logic behind headless microservices. Zero plugin vulnerabilities, zero injection risks.
                                </p>
                            </div>

                            <div style={{ background: "var(--bg-base)", padding: "32px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                                <Globe2 size={28} color="var(--accent-blue)" style={{ marginBottom: "16px" }} />
                                <h3 style={{ fontSize: "20px", fontWeight: 900, marginBottom: "12px" }}>US LLC Legal Protection</h3>
                                <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "15px", margin: 0 }}>
                                    OfficialUM1 LLC is registered in Kalispell, Montana. Standard US contracts, NDAs, and milestone payment schedules.
                                </p>
                            </div>
                        </div>

                        <div style={{ background: "var(--bg-base)", padding: "40px", borderRadius: "24px", border: "1px solid var(--border-subtle)" }}>
                            <h2 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "20px" }}>Why US Startups & Enterprises Choose OfficialUM1</h2>
                            <ul style={{ display: "grid", gap: "16px", padding: 0, listStyle: "none", margin: 0 }}>
                                {[
                                    "Silicon Valley quality standards with 40%-60% cost efficiency.",
                                    "Dedicated project lead matching US Eastern (EST) and Pacific (PST) business hours.",
                                    "100% Core Web Vitals pass guarantee on mobile and desktop.",
                                    "Comprehensive API integration (Stripe, HubSpot, Salesforce, Klaviyo, Supabase).",
                                    "Post-launch 60-day engineering warranty with full CI/CD deployment handover."
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
                            <Badge className="bg-white/10 text-teal-300 mb-4">Start Your US Project</Badge>
                            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, marginBottom: "16px" }}>
                                Ready to Architect a High-Growth Web Platform?
                            </h2>
                            <p style={{ color: "#94a3b8", fontSize: "17px", maxWidth: "600px", margin: "0 auto 32px", lineHeight: 1.6 }}>
                                Schedule a 20-minute architectural consultation. Receive a complete technical roadmap and transparent estimate in 24 hours.
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
                                Schedule Technical Call <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </main>
    );
}
