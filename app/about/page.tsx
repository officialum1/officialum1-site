"use client";

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LiveCount from '@/components/LiveCount';
import { PageHero } from '@/components/ui/PageHero';
import Script from 'next/script';
import { getDomainUrls } from '@/lib/navigation-urls';
import Link from 'next/link';

const TEAM_MEMBERS = [
    {
        name: "Muhammad Umar Mumtaz",
        role: "Founder, CEO & Principal Architect",
        tag: "Executive Leadership",
        initials: "UM",
        image: "/founder.jpg",
        icon: "⚡",
        bio: "Digital entrepreneur and systems architect with 6+ years spearheading high-performance web engineering, technical SEO pipelines, and digital asset valuation for global enterprise clients.",
        specialties: ["Next.js Architecture", "Search Engine Algorithms", "Venture Growth", "Asset Escrow"],
        social: {
            linkedin: "https://www.linkedin.com/in/muhammad-umar-mumtaz/",
            email: "umar@officialum1.com"
        }
    },
    {
        name: "Marcus Vance",
        role: "VP of Engineering & Cloud Infrastructure",
        tag: "Core Engineering",
        initials: "MV",
        icon: "⚡",
        bio: "Cloud solutions architect leading the full-stack engineering team. Specializes in edge runtime delivery, headless CMS migrations, and sub-second rendering web applications.",
        specialties: ["Next.js 15 App Router", "Node.js Microservices", "Vercel / AWS DevOps", "TypeScript"],
        social: {
            linkedin: "#",
            email: "engineering@officialum1.com"
        }
    },
    {
        name: "Sophia Reynolds",
        role: "Head of Organic Growth & Technical SEO",
        tag: "SEO & Traffic Growth",
        initials: "SR",
        icon: "📈",
        bio: "SEO veteran with a proven record of ranking enterprise websites in competitive international markets across the US, UK, and UAE with white-hat link acquisition and semantic schema.",
        specialties: ["Entity SEO", "Crawl Budget Optimization", "Topical Authority", "Backlink Strategy"],
        social: {
            linkedin: "#",
            email: "seo@officialum1.com"
        }
    },
    {
        name: "David Sterling",
        role: "Head of Formations & Legal Compliance",
        tag: "Corporate Formations",
        initials: "DS",
        icon: "🏛️",
        bio: "Corporate specialist managing US LLC and UK LTD company incorporations, IRS EIN filings, FinCEN BOI compliance, and multi-currency global banking setups for international founders.",
        specialties: ["US LLC (MT/WY/DE/NM)", "UK Companies House Presenter", "IRS Form 1120/5472", "Banking KYC"],
        social: {
            linkedin: "#",
            email: "compliance@officialum1.com"
        }
    },
    {
        name: "Elena Cruz",
        role: "Director of Asset Security & Escrow",
        tag: "Security & Operations",
        initials: "EC",
        icon: "🛡️",
        bio: "Risk management and cyber verification specialist ensuring 100% secure escrow transactions, automated domain transfers, and authenticated digital asset verification.",
        specialties: ["Escrow Protocols", "Asset Ownership Audits", "Fraud Prevention", "Security Auditing"],
        social: {
            linkedin: "#",
            email: "security@officialum1.com"
        }
    },
    {
        name: "Lucas Meyer",
        role: "Director of Client Success & Global Solutions",
        tag: "Client Success",
        initials: "LM",
        icon: "🤝",
        bio: "Dedicated client partner ensuring seamless project delivery, rapid turnaround SLAs, and customized B2B growth consulting for enterprise and startup partners worldwide.",
        specialties: ["Client SLA Management", "Growth Consulting", "B2B Retainers", "Sprint Coordination"],
        social: {
            linkedin: "#",
            email: "support@officialum1.com"
        }
    }
];

const COMPANY_PILLARS = [
    {
        title: "Engineering Excellence",
        description: "We build ultra-fast, modern Next.js web applications and digital infrastructure engineered for Core Web Vitals, 100 Lighthouse scores, and zero technical debt.",
        icon: "⚡"
    },
    {
        title: "Data-Driven SEO",
        description: "No guesswork. Our search strategies leverage granular keyword modeling, topical authority maps, and clean PR backlinks to build sustainable organic rank.",
        icon: "📈"
    },
    {
        title: "Global Entity Formation",
        description: "We empower international entrepreneurs with 100% compliant US LLCs and UK LTD entities as an authorized UK Companies House presenter, complete with IRS EIN, London registered office, and merchant readiness.",
        icon: "🏛️"
    },
    {
        title: "Verified Asset Escrow",
        description: "Every digital asset in our ecosystem undergoes multi-point ownership verification and is transferred through secure, encrypted escrow protocols.",
        icon: "🛡️"
    }
];

export default function AboutPage() {
    const urls = getDomainUrls();

    return (
        <main style={{ minHeight: '100vh', overflowX: 'hidden', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            <Navbar />

            {/* Structured Data for Organization & Executive Leadership */}
            <Script
                id="org-about-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "OfficialUM1 LLC",
                        "legalName": "OfficialUM1 LLC",
                        "url": "https://officialum1.com",
                        "logo": "https://officialum1.com/officialum1.png",
                        "founder": {
                            "@type": "Person",
                            "name": "Muhammad Umar Mumtaz",
                            "jobTitle": "Founder & CEO",
                            "image": "https://officialum1.com/founder.jpg"
                        },
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "30 N Gould St Ste R",
                            "addressLocality": "Kalispell",
                            "addressRegion": "MT",
                            "postalCode": "59901",
                            "addressCountry": "US"
                        },
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "telephone": "+1-800-OFFICIAL",
                            "contactType": "customer service",
                            "email": "support@officialum1.com",
                            "availableLanguage": ["English", "Urdu", "Arabic"]
                        },
                        "sameAs": [
                            "https://www.linkedin.com/company/officialum1",
                            "https://twitter.com/officialum1"
                        ]
                    })
                }}
            />

            {/* Structured Data for FAQ SEO Indexing */}
            <Script
                id="faq-about-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "What is OfficialUM1 LLC?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "OfficialUM1 LLC is a registered global digital engineering, SEO, and corporate services agency based in Montana, USA. We provide high-performance Next.js development, organic search growth, US & UK company formations, and verified digital marketplace assets."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Who is Muhammad Umar Mumtaz?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Muhammad Umar Mumtaz is the founder and CEO of OfficialUM1 LLC. He is a digital entrepreneur and systems architect specializing in Next.js web systems, search algorithms, and corporate venture scaling."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Is OfficialUM1 a registered legal entity?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Yes, OfficialUM1 is officially registered as OfficialUM1 LLC in the United States (Kalispell, Montana) with active filing compliance and international operational offices."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "What services does the OfficialUM1 team provide?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Our specialist team provides Custom Next.js Full-Stack Engineering, Enterprise SEO Retainers, US LLC & UK LTD Corporate Formations, EIN/ITIN Processing, Website Migrations, and Verified Digital Asset Escrow."
                                }
                            }
                        ]
                    })
                }}
            />

            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About Us' }]}
                    label="Official Corporate Profile"
                    title="Engineered for Scalable Digital Authority"
                    description="OfficialUM1 LLC delivers high-performance Next.js engineering, data-backed SEO architecture, and global corporate solutions for forward-thinking enterprises."
                />
            </div>

            {/* STATS SECTION */}
            <section style={{ padding: '40px 0 70px' }}>
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '2rem',
                        background: '#fff',
                        padding: '3.5rem 2rem',
                        borderRadius: '32px',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: '0 18px 44px rgba(24,32,38,0.06)',
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0 }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center' }}
                        >
                            <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--accent-blue)', marginBottom: '0.5rem', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                                <LiveCount metric="marketAssets" short={true} />
                            </div>
                            <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em', fontWeight: '800' }}>Active Digital Assets</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center' }}
                        >
                            <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--accent-violet)', marginBottom: '0.5rem', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                                <LiveCount metric="activeUsers" short={true} />
                            </div>
                            <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em', fontWeight: '800' }}>Global Clients Served</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center' }}
                        >
                            <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--accent-blue)', marginBottom: '0.5rem', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                                <LiveCount metric="orders" short={true} />
                            </div>
                            <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em', fontWeight: '800' }}>Orders & Formations</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center' }}
                        >
                            <div style={{ fontSize: '3rem', fontWeight: '900', color: '#14845f', marginBottom: '0.5rem', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>99.9%</div>
                            <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em', fontWeight: '800' }}>Uptime & SLA Guarantee</div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* COMPANY OVERVIEW & LEGAL ENTITY */}
            <section style={{ padding: '80px 0', background: 'var(--bg-section-alt)' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <span style={{ 
                                display: 'inline-block',
                                padding: '6px 14px', 
                                background: 'rgba(20, 108, 120, 0.1)', 
                                color: 'var(--accent-blue)', 
                                borderRadius: '20px', 
                                fontSize: '0.85rem', 
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '1rem'
                            }}>
                                Corporate Entity & Profile
                            </span>
                            <h2 style={{ fontSize: '2.75rem', fontWeight: '900', marginBottom: '1.5rem', lineHeight: '1.2', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                                A Fully Registered <br /><span style={{ color: 'var(--accent-blue)' }}>US Digital Powerhouse.</span>
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '1.5rem', lineHeight: '1.8', fontWeight: 500 }}>
                                <strong>OfficialUM1 LLC</strong> is an incorporated technology and digital consulting firm headquartered in Kalispell, Montana, USA, with dedicated development hubs and global operational presence across North America, Europe, and Asia.
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: '1.8', fontWeight: 500 }}>
                                We eliminate the fragmentation in modern digital growth. Instead of juggling multiple unreliable freelancers, businesses partner with OfficialUM1 to receive end-to-end solutions: from enterprise Next.js engineering and authority SEO campaigns to compliant corporate incorporation and verified digital marketplace assets.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div style={{ padding: '1.25rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                                    <div style={{ fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px', fontSize: '0.95rem' }}>🇺🇸 Registered Entity</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>OfficialUM1 LLC, Montana, USA</div>
                                </div>
                                <div style={{ padding: '1.25rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                                    <div style={{ fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px', fontSize: '0.95rem' }}>🔒 Escrow Protected</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>100% Secure Asset Delivery</div>
                                </div>
                                <div style={{ padding: '1.25rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                                    <div style={{ fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px', fontSize: '0.95rem' }}>⚡ Speed Optimized</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Edge Next.js Architecture</div>
                                </div>
                                <div style={{ padding: '1.25rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                                    <div style={{ fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px', fontSize: '0.95rem' }}>🌍 Global Coverage</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>US, UK, UAE & APAC Clients</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Corporate Mission Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            style={{
                                padding: '3.5rem 2.5rem',
                                borderRadius: '32px',
                                background: '#fff',
                                border: '1px solid var(--border-subtle)',
                                boxShadow: '0 20px 48px rgba(24,32,38,0.08)'
                            }}
                        >
                            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.25rem', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                                Our Corporate Mission
                            </h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '2rem', fontWeight: 500 }}>
                                To empower high-growth enterprises and international entrepreneurs with dependable digital infrastructure, transparent data-driven marketing, and seamless global business access without technical or regulatory roadblocks.
                            </p>

                            <div style={{ padding: '2rem', background: 'var(--bg-section-alt)', borderRadius: '20px', borderLeft: '4px solid var(--accent-blue)', border: '1px solid var(--border-subtle)' }}>
                                <p style={{ fontStyle: 'italic', color: 'var(--text-primary)', margin: '0 0 1.5rem 0', fontSize: '1.05rem', fontWeight: 600, lineHeight: '1.6' }}>
                                    &quot;OfficialUM1 isn&apos;t just another digital agency; it is a commitment to uncompromising engineering, transparent deliverables, and long-term value creation.&quot;
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '52px',
                                        height: '52px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        border: '2px solid var(--accent-blue)',
                                        flexShrink: 0
                                    }}>
                                        <img src="/founder.jpg" alt="Muhammad Umar Mumtaz" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Muhammad Umar Mumtaz</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: '700' }}>Founder & Chief Executive Officer</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CORE PILLARS SECTION */}
            <section style={{ padding: '100px 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 4rem' }}>
                        <span style={{ 
                            display: 'inline-block',
                            padding: '6px 14px', 
                            background: 'rgba(196, 71, 45, 0.1)', 
                            color: 'var(--accent-violet)', 
                            borderRadius: '20px', 
                            fontSize: '0.85rem', 
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '1rem'
                        }}>
                            Operational Pillars
                        </span>
                        <h2 style={{ fontSize: '2.75rem', fontWeight: '900', fontFamily: 'var(--font-space-grotesk), sans-serif', marginBottom: '1rem' }}>
                            What Sets OfficialUM1 Apart
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>
                            We combine deep technical engineering with commercial growth rigor across four synchronized divisions.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
                        {COMPANY_PILLARS.map((pillar, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                style={{
                                    padding: '2.5rem 2rem',
                                    borderRadius: '24px',
                                    background: '#fff',
                                    border: '1px solid var(--border-subtle)',
                                    boxShadow: '0 14px 34px rgba(24,32,38,0.06)',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <div style={{ fontSize: '2.5rem', marginBottom: '1.25rem' }}>{pillar.icon}</div>
                                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                                    {pillar.title}
                                </h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', fontWeight: 500 }}>
                                    {pillar.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* EXECUTIVE LEADERSHIP & CORE TEAM SECTION */}
            <section id="team" style={{ padding: '100px 0', background: 'var(--bg-section-alt)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4.5rem' }}>
                        <span style={{ 
                            display: 'inline-block',
                            padding: '6px 14px', 
                            background: 'rgba(20, 108, 120, 0.1)', 
                            color: 'var(--accent-blue)', 
                            borderRadius: '20px', 
                            fontSize: '0.85rem', 
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '1rem'
                        }}>
                            Executive Leadership & Team
                        </span>
                        <h2 style={{ fontSize: '2.75rem', fontWeight: '900', fontFamily: 'var(--font-space-grotesk), sans-serif', marginBottom: '1rem' }}>
                            The Minds Behind the Engine
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>
                            Meet our senior architects, search strategists, corporate formation directors, and security specialists.
                        </p>
                    </div>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                        gap: '2.5rem' 
                    }}>
                        {TEAM_MEMBERS.map((member, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                style={{
                                    background: '#fff',
                                    borderRadius: '28px',
                                    border: '1px solid var(--border-subtle)',
                                    boxShadow: '0 18px 44px rgba(24,32,38,0.06)',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                }}
                            >
                                <div style={{ padding: '2rem 2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                    {/* Monogram / Profile Badge (No stock images) */}
                                    {member.image ? (
                                        <div style={{
                                            width: '76px',
                                            height: '76px',
                                            borderRadius: '20px',
                                            overflow: 'hidden',
                                            flexShrink: 0,
                                            border: '2px solid var(--accent-blue)',
                                            boxShadow: '0 8px 20px rgba(20,108,120,0.15)'
                                        }}>
                                            <img 
                                                src={member.image} 
                                                alt={member.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{
                                            width: '76px',
                                            height: '76px',
                                            borderRadius: '20px',
                                            flexShrink: 0,
                                            background: 'linear-gradient(135deg, rgba(20,108,120,0.12) 0%, rgba(196,71,45,0.12) 100%)',
                                            border: '1.5px solid var(--border-subtle)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 8px 20px rgba(0,0,0,0.04)'
                                        }}>
                                            <span style={{ 
                                                fontSize: '1.4rem', 
                                                fontWeight: '900', 
                                                color: 'var(--accent-blue)',
                                                fontFamily: 'var(--font-space-grotesk), sans-serif',
                                                letterSpacing: '0.05em'
                                            }}>
                                                {member.initials}
                                            </span>
                                        </div>
                                    )}

                                    <div>
                                        <span style={{ 
                                            display: 'inline-block',
                                            padding: '4px 10px', 
                                            background: 'var(--bg-section-alt)', 
                                            color: 'var(--accent-blue)', 
                                            borderRadius: '12px', 
                                            fontSize: '0.75rem', 
                                            fontWeight: '700',
                                            marginBottom: '6px'
                                        }}>
                                            {member.tag}
                                        </span>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                                            {member.name}
                                        </h3>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--accent-violet)', fontWeight: '700', marginTop: '2px' }}>
                                            {member.role}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '0 2rem 1.5rem', flexGrow: 1 }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', fontWeight: 500, marginBottom: '1.25rem' }}>
                                        {member.bio}
                                    </p>
                                    
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {member.specialties.map((spec, sIdx) => (
                                            <span 
                                                key={sIdx}
                                                style={{
                                                    padding: '4px 10px',
                                                    background: 'var(--bg-section-alt)',
                                                    color: 'var(--text-primary)',
                                                    borderRadius: '8px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ 
                                    padding: '1rem 2rem', 
                                    borderTop: '1px solid var(--border-subtle)', 
                                    background: 'var(--bg-section-alt)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                        OfficialUM1 LLC Specialist
                                    </span>
                                    <a 
                                        href={`mailto:${member.social.email}`} 
                                        style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: '700', textDecoration: 'none' }}
                                    >
                                        Direct Contact →
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOUNDER SPOTLIGHT SECTION */}
            <section style={{ padding: '100px 0' }}>
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '4rem',
                        alignItems: 'center',
                        maxWidth: '1050px',
                        margin: '0 auto'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            style={{ position: 'relative' }}
                        >
                            <div style={{
                                padding: '40px 30px',
                                background: '#fff',
                                borderRadius: '32px',
                                border: '1px solid var(--border-subtle)',
                                textAlign: 'center',
                                boxShadow: '0 20px 48px rgba(24,32,38,0.08)'
                            }}>
                                <div style={{
                                    width: '160px',
                                    height: '160px',
                                    borderRadius: '50%',
                                    margin: '0 auto 20px',
                                    overflow: 'hidden',
                                    border: '3px solid var(--accent-blue)',
                                    boxShadow: '0 12px 32px rgba(20, 108, 120, 0.2)'
                                }}>
                                    <img
                                        src="/founder.jpg"
                                        alt="Muhammad Umar Mumtaz - Founder & CEO of OfficialUM1"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                                    Muhammad Umar Mumtaz
                                </h3>
                                <p style={{ color: 'var(--accent-blue)', fontWeight: '700', marginBottom: '16px' }}>
                                    Founder & Principal Systems Architect
                                </p>
                                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 500, fontSize: '0.95rem', lineHeight: '1.6' }}>
                                    &quot;Growth without measurable data and high-performance architecture is just guesswork. We build systems that win.&quot;
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <span style={{ 
                                display: 'inline-block',
                                padding: '6px 14px', 
                                background: 'rgba(196, 71, 45, 0.1)', 
                                color: 'var(--accent-violet)', 
                                borderRadius: '20px', 
                                fontSize: '0.85rem', 
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '1rem'
                            }}>
                                Founder&apos;s Journey
                            </span>
                            <h3 style={{ fontSize: '2.25rem', fontWeight: '900', marginBottom: '1.5rem', fontFamily: 'var(--font-space-grotesk), sans-serif', lineHeight: '1.3' }}>
                                From Technical Roots to a <span style={{ color: 'var(--accent-blue)' }}>Global Enterprise Footprint</span>
                            </h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '1.5rem', fontWeight: 500 }}>
                                Muhammad Umar Mumtaz founded OfficialUM1 with a core vision: bridging the gap between sophisticated web technologies and real, scalable business revenue. 
                            </p>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '2rem', fontWeight: 500 }}>
                                What began as an independent technical SEO and software consulting practice has evolved into **OfficialUM1 LLC**—an international digital powerhouse serving startups, venture-backed companies, and high-ticket clients across North America, the UK, the Middle East, and Asia.
                            </p>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {['Systems Architecture', 'Next.js 15 Specialist', 'Global Formations Lead', 'SEO Algorithmic Modeling'].map((tag, i) => (
                                    <span key={i} style={{
                                        padding: '8px 16px',
                                        background: 'rgba(20, 108, 120, 0.1)',
                                        color: 'var(--accent-blue)',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: '700'
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* COMPANY FAQ */}
            <section style={{ padding: '100px 0', background: 'var(--bg-section-alt)' }}>
                <div className="container" style={{ maxWidth: '900px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <span style={{ 
                            display: 'inline-block',
                            padding: '6px 14px', 
                            background: 'rgba(20, 108, 120, 0.1)', 
                            color: 'var(--accent-blue)', 
                            borderRadius: '20px', 
                            fontSize: '0.85rem', 
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '1rem'
                        }}>
                            Transparency & Trust
                        </span>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                            Frequently Asked Questions
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                            Clear answers about our entity, leadership, and operational protocols.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {[
                            {
                                q: "What is OfficialUM1 LLC?",
                                a: "OfficialUM1 LLC is a full-service digital engineering, organic search strategy, and corporate services firm registered in Montana, United States. We serve global clients with custom software development, Next.js migrations, SEO retainers, US/UK corporate formations, and verified digital marketplace assets."
                            },
                            {
                                q: "Is OfficialUM1 LLC an officially registered US company?",
                                a: "Yes. OfficialUM1 LLC is registered with the Montana Secretary of State (Kalispell, MT) and maintains full federal and state compliance, including active IRS EIN status, registered agent facilities, and FinCEN BOI filings."
                            },
                            {
                                q: "Who leads the development and strategy team at OfficialUM1?",
                                a: "Operations are personally led by Founder & CEO Muhammad Umar Mumtaz alongside specialist department leads in full-stack Next.js engineering, technical SEO auditing, corporate compliance, and digital asset security."
                            },
                            {
                                q: "How can enterprise clients start a project or retain services?",
                                a: "You can book an executive consultation directly through our Contact page or explore our packaged SEO packages, migration blueprints, and corporate formation tiers across the website."
                            },
                            {
                                q: "What security measures protect client transactions and data?",
                                a: "All transactions are secured with 256-bit SSL encryption, strict mutual non-disclosure agreements (NDAs), verified ownership escrow transfers, and 24/7 client SLA coverage."
                            }
                        ].map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                style={{ 
                                    padding: '2rem', 
                                    borderRadius: '20px', 
                                    border: '1px solid var(--border-subtle)', 
                                    background: '#fff', 
                                    boxShadow: '0 14px 34px rgba(24,32,38,0.05)' 
                                }}
                            >
                                <h4 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '10px', color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                                    {faq.q}
                                </h4>
                                <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontWeight: 500, margin: 0 }}>
                                    {faq.a}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION */}
            <section style={{ padding: '100px 0 140px' }}>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{
                            padding: '5.5rem 2.5rem',
                            textAlign: 'center',
                            borderRadius: '36px',
                            background: '#fff',
                            border: '1px solid var(--border-subtle)',
                            boxShadow: '0 20px 50px rgba(24,32,38,0.08)'
                        }}
                    >
                        <h2 style={{ fontSize: '3.25rem', fontWeight: '900', marginBottom: '1.25rem', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                            Ready to Build Your Digital Advantage?
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', marginBottom: '2.5rem', fontWeight: 500, maxWidth: '650px', margin: '0 auto 2.5rem' }}>
                            Partner with OfficialUM1 LLC for high-performance web engineering, data-backed SEO growth, and global corporate formations.
                        </p>
                        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link 
                                href={urls.mainUrl('/services')} 
                                className="btn btn-primary" 
                                style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', borderRadius: '50px', fontWeight: '700' }}
                            >
                                Explore Agency Services
                            </Link>
                            <Link 
                                href={urls.mainUrl('/contact')} 
                                className="btn btn-outline" 
                                style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', borderRadius: '50px', fontWeight: '700' }}
                            >
                                Schedule Consultation
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
            <style jsx>{`
                @media (max-width: 768px) {
                    .container { padding: 0 20px !important; }
                    section { padding: 60px 0 !important; }
                    h2 { font-size: 2rem !important; }
                }
            `}</style>
        </main>
    );
}
