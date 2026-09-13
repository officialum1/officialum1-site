import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Metadata } from 'next';
import { PageHero } from "@/components/ui/PageHero";
import Script from "next/script";
import Link from "next/link";
import { Newspaper, CalendarDays, ArrowRight, Download, Building, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
    title: "Press Room & Official News | OfficialUM1 LLC",
    description: "Official corporate news, press releases, media kits, and engineering announcements from OfficialUM1 LLC.",
    alternates: {
        canonical: "https://officialum1.com/press",
    },
};

const pressReleases = [
    {
        slug: "officialum1-launches-nextjs-speed-architecture-2026",
        title: "OfficialUM1 LLC Unveils Sub-500ms Next.js 15 Web Architecture & Guaranteed 90+ WordPress Speed Protocol",
        date: "September 13, 2026",
        dateline: "KALISPELL, Mont. & SAHIWAL",
        summary: "OfficialUM1 LLC, a leading US-registered digital marketing and software engineering agency, today announced the worldwide launch of its enterprise headless Next.js 15 React migration architecture and guaranteed 90+ Google Core Web Vitals optimization protocol for global e-commerce brands.",
        category: "Corporate Announcement",
        readTime: "4 min read"
    }
];

export default function PressRoomPage() {
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://officialum1.com" },
            { "@type": "ListItem", "position": 2, "name": "Press Room", "item": "https://officialum1.com/press" }
        ]
    };

    return (
        <main style={{ background: "var(--bg-base)", minHeight: "100vh", color: "var(--text-primary)" }}>
            <Navbar />
            <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: "Home", href: "/" }, { label: "Press Room" }]}
                    label="Media & Press Room"
                    title={<>Official Corporate <span style={{ color: "var(--accent-blue)" }}>Press Releases</span></>}
                    description="Official corporate statements, engineering announcements, product launches, and media resources from OfficialUM1 LLC."
                />

                <section style={{ padding: "80px 0 100px" }}>
                    <div className="container" style={{ maxWidth: "960px" }}>
                        {/* Media Contacts Top Card */}
                        <div style={{
                            background: "#ffffff",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "20px",
                            padding: "28px 36px",
                            marginBottom: "40px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "20px",
                            boxShadow: "0 14px 34px rgba(24, 32, 38, 0.05)"
                        }}>
                            <div>
                                <span style={{ fontSize: "12px", fontWeight: 900, textTransform: "uppercase", color: "var(--accent-blue)", letterSpacing: "1px" }}>
                                    Media Inquiries & Press Contact
                                </span>
                                <h3 style={{ fontSize: "19px", fontWeight: 900, margin: "6px 0 0", color: "var(--text-primary)" }}>
                                    OfficialUM1 Corporate Communications
                                </h3>
                                <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "14.5px" }}>
                                    Email: <a href="mailto:press@officialum1.com" style={{ color: "var(--accent-blue)", fontWeight: 800 }}>press@officialum1.com</a> / <a href="mailto:hello@officialum1.com" style={{ color: "var(--accent-blue)", fontWeight: 800 }}>hello@officialum1.com</a>
                                </p>
                            </div>
                            <a
                                href="/logo.jpg"
                                download="OfficialUM1_Brand_Logo.jpg"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "12px 22px",
                                    borderRadius: "999px",
                                    background: "var(--bg-base)",
                                    border: "1px solid var(--border-subtle)",
                                    color: "var(--text-primary)",
                                    fontSize: "14px",
                                    fontWeight: 800,
                                    textDecoration: "none"
                                }}
                            >
                                <Download size={16} /> Download Media Kit
                            </a>
                        </div>

                        {/* Press Releases List */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            {pressReleases.map((pr, idx) => (
                                <article key={idx} style={{
                                    background: "#ffffff",
                                    border: "1px solid var(--border-subtle)",
                                    borderRadius: "22px",
                                    padding: "36px",
                                    boxShadow: "0 18px 42px rgba(24, 32, 38, 0.06)",
                                    transition: "transform 0.2s ease, border-color 0.2s ease"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px", flexWrap: "wrap" }}>
                                        <span style={{
                                            padding: "6px 12px",
                                            borderRadius: "999px",
                                            background: "rgba(20, 108, 120, 0.1)",
                                            color: "var(--accent-blue)",
                                            fontSize: "12px",
                                            fontWeight: 900,
                                            textTransform: "uppercase"
                                        }}>
                                            {pr.category}
                                        </span>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "14px", fontWeight: 700 }}>
                                            <CalendarDays size={15} /> {pr.date}
                                        </span>
                                        <span style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: 700 }}>
                                            • {pr.readTime}
                                        </span>
                                    </div>

                                    <h2 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 900, margin: "0 0 14px", lineHeight: 1.25 }}>
                                        <Link href={`/press/${pr.slug}`} style={{ color: "var(--text-primary)", textDecoration: "none" }}>
                                            {pr.title}
                                        </Link>
                                    </h2>

                                    <p style={{ color: "var(--text-muted)", fontSize: "16px", lineHeight: 1.7, margin: "0 0 24px" }}>
                                        <strong>{pr.dateline}</strong> — {pr.summary}
                                    </p>

                                    <Link
                                        href={`/press/${pr.slug}`}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            color: "var(--accent-blue)",
                                            fontWeight: 900,
                                            fontSize: "15px",
                                            textDecoration: "none"
                                        }}
                                    >
                                        Read Full Press Release <ArrowRight size={17} />
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </main>
    );
}
