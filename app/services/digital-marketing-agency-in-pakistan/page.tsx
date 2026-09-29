import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Metadata } from 'next';
import { PageHero } from "@/components/ui/PageHero";
import Script from "next/script";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Best Digital Marketing Agency in Pakistan (2026) | OfficialUM1",
    description: "OfficialUM1 is Pakistan's premier data-driven digital marketing agency. We deliver enterprise SEO, Next.js web development, Google & Meta Ads, and digital PR across Lahore, Karachi, Islamabad, Sahiwal, and nationwide.",
    keywords: [
        "digital marketing agency in pakistan",
        "best digital marketing company pakistan",
        "top digital marketing agencies in pakistan",
        "seo agency pakistan",
        "performance marketing agency lahore karachi islamabad",
        "digital marketing services pakistan",
        "social media marketing agency pakistan",
        "web design and marketing pakistan"
    ],
    alternates: {
        canonical: "https://officialum1.com/services/digital-marketing-agency-in-pakistan",
    },
    openGraph: {
        title: "Best Digital Marketing Agency in Pakistan | OfficialUM1",
        description: "Scale your revenue with Pakistan's top-rated digital marketing, performance SEO, and Next.js engineering agency.",
        url: "https://officialum1.com/services/digital-marketing-agency-in-pakistan",
        siteName: "OfficialUM1",
        locale: "en_PK",
        type: "website"
    }
};

const CITY_HUBS = [
    { city: "Lahore", focus: "Tech Startups, D2C E-Commerce & Real Estate Dominance", tag: "Tech Hub" },
    { city: "Karachi", focus: "Corporate Finance, B2B Exporters & Large Retail Chains", tag: "Financial Hub" },
    { city: "Islamabad & Rawalpindi", focus: "B2B Enterprise, Consultancies & International Services", tag: "Capital Region" },
    { city: "Sahiwal & Okara", focus: "HQ Operations, Regional Retail & Agribusiness Scaling", tag: "Central HQ" },
    { city: "Faisalabad", focus: "Textile Giants, Industrial Manufacturing & Global Export", tag: "Industrial Hub" },
    { city: "Sialkot & Gujranwala", focus: "Surgical, Sports & Leather Goods Global SEO", tag: "Export Corridor" },
    { city: "Multan & South Punjab", focus: "Regional E-Commerce, Local Services & Brand Expansion", tag: "Growth Market" },
    { city: "Peshawar", focus: "Cross-Border Trade, Hospitality & Specialized Services", tag: "Emerging Tech" }
];

const SERVICE_PILLARS = [
    {
        icon: "📈",
        title: "Enterprise SEO & Keyword Dominance",
        desc: "Rank on Page 1 of Google for high-intent purchase searches. We build bulletproof topical authority, semantic entity mapping, and white-hat high-DA backlink profiles."
    },
    {
        icon: "⚡",
        title: "High-Speed Next.js Web Development",
        desc: "Slow WordPress sites kill conversions. We build ultra-fast, modern Next.js and React web applications with guaranteed 90+ PageSpeed and sub-500ms server response."
    },
    {
        icon: "🎯",
        title: "Meta & Google Ads Performance ROI",
        desc: "Stop burning ad spend. Our media buyers engineer precision audience funnels, high-converting copy, and automated pixel tracking across Meta, Google Search, and TikTok."
    },
    {
        icon: "📰",
        title: "Digital PR & High-DA Backlink Syndication",
        desc: "Get your brand published on top national and global publications. Direct editorial outreach on DA 50+ to 90+ news outlets to build unbreakable domain trust."
    },
    {
        icon: "🛒",
        title: "E-Commerce CRO & Funnel Optimization",
        desc: "Convert more visitors into paying customers. We analyze user heatmaps, eliminate checkout friction, and engineer psychological micro-interactions that 2x your revenue."
    },
    {
        icon: "📱",
        title: "Omnichannel Social Media Growth",
        desc: "Turn passive followers into loyal brand advocates on LinkedIn, Instagram, TikTok, and YouTube with professional visual storytelling and high-engagement content."
    }
];

const PRICING_PLANS = [
    {
        name: "Starter SMB Growth",
        pricePKR: "PKR 95,000",
        priceUSD: "$340 / mo",
        desc: "Ideal for growing local businesses wanting consistent Page 1 rankings and verified leads.",
        features: [
            "Complete Technical SEO & Audit",
            "15 Target High-Intent Keywords",
            "Monthly High-DA Guest Post & Niche Edits",
            "Google Business Profile (Maps) Optimization",
            "Meta & Social Media Content Calendar",
            "Monthly Transparent ROI Report"
        ],
        popular: false
    },
    {
        name: "Scale & Market Dominance",
        pricePKR: "PKR 220,000",
        priceUSD: "$790 / mo",
        desc: "For aggressive D2C brands, tech startups, and exporters ready to dominate their national niche.",
        features: [
            "Comprehensive Multi-Channel Growth Engine",
            "35+ National & International Keywords",
            "High-DA 60+ Backlink Placements",
            "Google Ads & Meta Performance Media Buying",
            "Speed Optimization (Sub-1s Load Time)",
            "Conversion Rate Optimization (CRO) Audits",
            "24/7 Dedicated Account Director & Slack"
        ],
        popular: true
    },
    {
        name: "Enterprise Market Leader",
        pricePKR: "PKR 480,000",
        priceUSD: "$1,720 / mo",
        desc: "Bespoke full-stack growth partnership for enterprise corporations, real estate, and export brands.",
        features: [
            "Full Omnichannel Revenue Architecture",
            "Custom Next.js Web Engineering & Replatforming",
            "Digital PR Syndication (National & Global News)",
            "Aggressive Multi-Country SEO (PK, US, UK, UAE)",
            "Automated CRM & Lead Qualification Pipelines",
            "Dedicated Development & Content Pod",
            "Executive Strategy Consultations with Umar Mumtaz"
        ],
        popular: false
    }
];

const FAQS = [
    {
        q: "Why is OfficialUM1 ranked as the best digital marketing agency in Pakistan?",
        a: "OfficialUM1 stands out because we combine deep technical software engineering (Next.js/React architecture) with performance search dominance and data-backed media buying. Unlike traditional marketing agencies that outsource development or rely solely on ad spend, we build sustainable digital systems that compound organic revenue over time."
    },
    {
        q: "What digital marketing services do you provide in Pakistan?",
        a: "Our core services include Search Engine Optimization (SEO), High-Speed Custom Web Development (Next.js), Google & Meta Performance Ads, High-DA Backlinks & Digital PR, E-Commerce Conversion Rate Optimization (CRO), Social Media Management, and US/UK Corporate Formations."
    },
    {
        q: "How much does a digital marketing agency cost in Pakistan?",
        a: "Our monthly retainers range from PKR 95,000 ($340) for local SMB growth packages to PKR 220,000 ($790) for scaling D2C brands, and PKR 480,000 ($1,720+) for full-scale enterprise national leadership. We maintain 100% transparent deliverables with zero hidden fees."
    },
    {
        q: "Which cities in Pakistan does OfficialUM1 serve?",
        a: "We actively serve clients across all major metropolitan and industrial cities in Pakistan, including Lahore, Karachi, Islamabad, Rawalpindi, Sahiwal, Faisalabad, Multan, Sialkot, Gujranwala, Peshawar, and Quetta, as well as Pakistani diaspora businesses in the US, UK, and UAE."
    },
    {
        q: "How quickly can we see Page 1 Google rankings and ROI?",
        a: "For Paid Search and Social Ads (Meta/Google), qualified traffic and leads start generating within 48 to 72 hours. For Technical SEO and Organic Rankings, high-intent keywords typically transition into Page 1 rankings within 60 to 90 days as topical authority and high-DA backlink signals mature."
    },
    {
        q: "How do we get started with OfficialUM1?",
        a: "You can schedule an executive strategy consultation directly through our Contact page or call our team at +92 323 7102924. We will perform a free technical audit of your website and present a custom growth roadmap tailored to your industry."
    }
];

export default function DigitalMarketingAgencyPakistanPage() {
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQS.map(faq => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
            }
        }))
    };

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://officialum1.com" },
            { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://officialum1.com/services" },
            { "@type": "ListItem", "position": 3, "name": "Digital Marketing Agency in Pakistan", "item": "https://officialum1.com/services/digital-marketing-agency-in-pakistan" }
        ]
    };

    const professionalServiceSchema = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "name": "OfficialUM1 - Digital Marketing Agency in Pakistan",
        "image": "https://officialum1.com/officialum1.png",
        "url": "https://officialum1.com/services/digital-marketing-agency-in-pakistan",
        "telephone": "+923237102924",
        "email": "hello@officialum1.com",
        "priceRange": "PKR 95,000 - PKR 480,000",
        "currenciesAccepted": "PKR, USD",
        "paymentAccepted": "Bank Transfer, Stripe, Credit Card, Payoneer",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Main Commercial Center",
            "addressLocality": "Sahiwal",
            "addressRegion": "Punjab",
            "postalCode": "57000",
            "addressCountry": "PK"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "30.6682",
            "longitude": "73.1114"
        },
        "areaServed": [
            { "@type": "Country", "name": "Pakistan" },
            { "@type": "City", "name": "Lahore" },
            { "@type": "City", "name": "Karachi" },
            { "@type": "City", "name": "Islamabad" },
            { "@type": "City", "name": "Rawalpindi" },
            { "@type": "City", "name": "Faisalabad" },
            { "@type": "City", "name": "Sahiwal" },
            { "@type": "City", "name": "Multan" },
            { "@type": "City", "name": "Sialkot" },
            { "@type": "City", "name": "Gujranwala" },
            { "@type": "City", "name": "Peshawar" }
        ],
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Digital Marketing Services in Pakistan",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Search Engine Optimization (SEO) Pakistan",
                        "description": "Enterprise Page 1 SEO rankings and organic traffic growth."
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "High-Speed Next.js Web Development",
                        "description": "Ultra-fast headless web platforms engineered for 90+ PageSpeed."
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Meta & Google Ads Performance Management",
                        "description": "ROI-focused PPC and social advertising campaigns."
                    }
                }
            ]
        }
    };

    return (
        <main style={{ minHeight: '100vh', overflowX: 'hidden', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            <Navbar />

            {/* Structured Data Scripts */}
            <Script id="pk-faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <Script id="pk-breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <Script id="pk-service-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceSchema) }} />

            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[
                        { label: "Home", href: "/" },
                        { label: "Services", href: "/services" },
                        { label: "Digital Marketing Agency in Pakistan" }
                    ]}
                    label="Pakistan's Premier Growth Agency"
                    title={<>#1 Digital Marketing Agency in Pakistan</>}
                    description="OfficialUM1 engineers high-performance SEO pipelines, ultra-fast Next.js web applications, and precision media buying that drives compound revenue across Pakistan and globally."
                />
            </div>

            {/* TRUST STATS TICKER */}
            <section style={{ padding: '30px 0 60px' }}>
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1.5rem',
                        background: '#fff',
                        padding: '2.5rem 2rem',
                        borderRadius: '24px',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: '0 14px 34px rgba(24,32,38,0.06)'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--accent-blue)', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>450+</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enterprise Campaigns Delivered</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--accent-violet)', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>Page #1</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Guaranteed Search Dominance</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--accent-blue)', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>99.9%</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client SLA &amp; Uptime</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#14845f', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>5.0 ★</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trustpilot &amp; Clutch Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* EDITORIAL OVERVIEW */}
            <section style={{ padding: '60px 0', background: 'var(--bg-section-alt)' }}>
                <div className="container" style={{ maxWidth: '1000px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
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
                            Revenue-First Marketing
                        </span>
                        <h2 style={{ fontSize: '2.75rem', fontWeight: '900', fontFamily: 'var(--font-space-grotesk), sans-serif', lineHeight: '1.2' }}>
                            Why Top Brands Choose OfficialUM1 as Their <br/><span style={{ color: 'var(--accent-blue)' }}>Digital Marketing Partner</span>
                        </h2>
                    </div>

                    <div style={{ background: '#fff', padding: '3.5rem 3rem', borderRadius: '32px', border: '1px solid var(--border-subtle)', boxShadow: '0 18px 44px rgba(24,32,38,0.06)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem', fontWeight: 500 }}>
                            In the competitive business landscape of Pakistan, vanity metrics like impressions and untargeted clicks no longer produce profitable customer acquisition. In 2026, market leaders require a <strong>full-stack digital marketing agency in Pakistan</strong> that bridges the gap between deep technical code architecture, organic search algorithms, and high-converting paid media funnels.
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem', fontWeight: 500 }}>
                            Headquartered in Sahiwal with international corporate infrastructure in Montana, USA, <strong>OfficialUM1</strong> is trusted by over 450+ businesses across Lahore, Karachi, Islamabad, and international markets. We eliminate the guesswork by engineering data-backed systems that consistently outperform competitors on Google Search and paid ad networks.
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginTop: '2.5rem' }}>
                            <div style={{ padding: '1.5rem', background: 'var(--bg-section-alt)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>⚡</div>
                                <div style={{ fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>Sub-Second Site Speed</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Guaranteed 90+ Core Web Vitals with custom Next.js engineering.</div>
                            </div>
                            <div style={{ padding: '1.5rem', background: 'var(--bg-section-alt)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🎯</div>
                                <div style={{ fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>Page #1 Google Authority</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Dominant organic visibility for high-ticket commercial keywords.</div>
                            </div>
                            <div style={{ padding: '1.5rem', background: 'var(--bg-section-alt)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🤝</div>
                                <div style={{ fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>Complete Accountability</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time dashboard tracking, weekly updates, and direct engineer access.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6 CORE MARKETING SERVICES */}
            <section style={{ padding: '100px 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem' }}>
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
                            Comprehensive Solutions
                        </span>
                        <h2 style={{ fontSize: '2.75rem', fontWeight: '900', fontFamily: 'var(--font-space-grotesk), sans-serif', marginBottom: '1rem' }}>
                            Our Full-Stack Growth Capabilities
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>
                            Everything your business needs to outrank, outperform, and outscale the competition in Pakistan.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                        {SERVICE_PILLARS.map((srv, idx) => (
                            <div
                                key={idx}
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
                                <div style={{ fontSize: '2.5rem', marginBottom: '1.25rem' }}>{srv.icon}</div>
                                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                                    {srv.title}
                                </h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', fontWeight: 500 }}>
                                    {srv.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* NATIONWIDE CITY HUBS GRID */}
            <section style={{ padding: '90px 0', background: 'var(--bg-section-alt)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem' }}>
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
                            Nationwide Geographic Coverage
                        </span>
                        <h2 style={{ fontSize: '2.75rem', fontWeight: '900', fontFamily: 'var(--font-space-grotesk), sans-serif', marginBottom: '1rem' }}>
                            Serving Market Leaders Across Pakistan
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>
                            Localized market intelligence tailored to the economic drivers of each major commercial corridor.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {CITY_HUBS.map((hub, idx) => (
                            <div 
                                key={idx}
                                style={{
                                    padding: '2rem 1.75rem',
                                    background: '#fff',
                                    borderRadius: '20px',
                                    border: '1px solid var(--border-subtle)',
                                    boxShadow: '0 10px 24px rgba(24,32,38,0.04)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                                        📍 {hub.city}
                                    </h4>
                                    <span style={{ 
                                        padding: '4px 10px', 
                                        background: 'var(--bg-section-alt)', 
                                        color: 'var(--accent-blue)', 
                                        borderRadius: '10px', 
                                        fontSize: '0.75rem', 
                                        fontWeight: '800' 
                                    }}>
                                        {hub.tag}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0, fontWeight: 500 }}>
                                    {hub.focus}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TRANSPARENT PRICING SECTION */}
            <section style={{ padding: '100px 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4.5rem' }}>
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
                            Transparent Investment
                        </span>
                        <h2 style={{ fontSize: '2.75rem', fontWeight: '900', fontFamily: 'var(--font-space-grotesk), sans-serif', marginBottom: '1rem' }}>
                            Digital Marketing Packages in Pakistan
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>
                            Clear pricing models in PKR and USD with guaranteed deliverables and monthly ROI tracking.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
                        {PRICING_PLANS.map((plan, idx) => (
                            <div
                                key={idx}
                                style={{
                                    background: '#fff',
                                    borderRadius: '28px',
                                    border: plan.popular ? '2px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                                    boxShadow: plan.popular ? '0 20px 48px rgba(20,108,120,0.15)' : '0 14px 34px rgba(24,32,38,0.06)',
                                    padding: '3rem 2.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative'
                                }}
                            >
                                {plan.popular && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-14px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
                                        color: '#fff',
                                        padding: '4px 16px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: '800',
                                        letterSpacing: '0.05em',
                                        textTransform: 'uppercase'
                                    }}>
                                        Most Popular Choice
                                    </div>
                                )}

                                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                                    {plan.name}
                                </h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', minHeight: '40px', fontWeight: 500 }}>
                                    {plan.desc}
                                </p>

                                <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                                    <div style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--accent-blue)', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                                        {plan.pricePKR}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700' }}>
                                        {plan.priceUSD}
                                    </div>
                                </div>

                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem 0', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {plan.features.map((feat, fIdx) => (
                                        <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                                            <span style={{ color: '#14845f', fontWeight: 'bold' }}>✓</span>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href="/contact"
                                    className={plan.popular ? "btn btn-primary" : "btn btn-outline"}
                                    style={{
                                        display: 'block',
                                        textAlign: 'center',
                                        padding: '1rem 2rem',
                                        borderRadius: '50px',
                                        fontWeight: '700',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    Get Started with {plan.name}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FREQUENTLY ASKED QUESTIONS */}
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
                            Frequently Asked Questions
                        </span>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                            Answers About Digital Marketing in Pakistan
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {FAQS.map((faq, i) => (
                            <div
                                key={i}
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
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FINAL CALL TO ACTION */}
            <section style={{ padding: '100px 0 140px' }}>
                <div className="container">
                    <div
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
                            Ready to Claim Page #1 on Google?
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', marginBottom: '2.5rem', fontWeight: 500, maxWidth: '650px', margin: '0 auto 2.5rem' }}>
                            Partner with Pakistan&apos;s leading performance marketing agency. Book a free 30-minute growth consultation with our executive strategy team today.
                        </p>
                        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link 
                                href="/contact" 
                                className="btn btn-primary" 
                                style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', borderRadius: '50px', fontWeight: '700' }}
                            >
                                Book Free Strategy Call
                            </Link>
                            <a 
                                href="tel:+923237102924" 
                                className="btn btn-outline" 
                                style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', borderRadius: '50px', fontWeight: '700' }}
                            >
                                Call Direct: +92 323 7102924
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
