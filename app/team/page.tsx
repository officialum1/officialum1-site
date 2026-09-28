import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PageHero } from '@/components/ui/PageHero';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Executive Leadership & Engineering Team | OfficialUM1 LLC',
    description: 'Meet the executive leadership, principal systems architects, technical SEO directors, and corporate compliance specialists at OfficialUM1 LLC.',
    alternates: {
        canonical: 'https://officialum1.com/team'
    }
};

const TEAM_MEMBERS = [
    {
        name: "Muhammad Umar Mumtaz",
        role: "Founder, CEO & Principal Architect",
        tag: "Executive Leadership",
        initials: "UM",
        image: "/founder.jpg",
        bio: "Digital entrepreneur and systems architect with 6+ years spearheading high-performance web engineering, technical SEO pipelines, and digital asset valuation for global enterprise clients.",
        specialties: ["Next.js Architecture", "Search Engine Algorithms", "Venture Growth", "Asset Escrow"],
        email: "umar@officialum1.com"
    },
    {
        name: "Marcus Vance",
        role: "VP of Engineering & Cloud Infrastructure",
        tag: "Core Engineering",
        initials: "MV",
        bio: "Cloud solutions architect leading the full-stack engineering team. Specializes in edge runtime delivery, headless CMS migrations, and sub-second rendering web applications.",
        specialties: ["Next.js 15 App Router", "Node.js Microservices", "Vercel / AWS DevOps", "TypeScript"],
        email: "engineering@officialum1.com"
    },
    {
        name: "Sophia Reynolds",
        role: "Head of Organic Growth & Technical SEO",
        tag: "SEO & Traffic Growth",
        initials: "SR",
        bio: "SEO veteran with a proven record of ranking enterprise websites in competitive international markets across the US, UK, and UAE with white-hat link acquisition and semantic schema.",
        specialties: ["Entity SEO", "Crawl Budget Optimization", "Topical Authority", "Backlink Strategy"],
        email: "seo@officialum1.com"
    },
    {
        name: "David Sterling",
        role: "Head of Formations & Legal Compliance",
        tag: "Corporate Formations",
        initials: "DS",
        bio: "Corporate specialist managing US LLC and UK LTD company incorporations, IRS EIN filings, FinCEN BOI compliance, and multi-currency global banking setups for international founders.",
        specialties: ["US LLC (MT/WY/DE/NM)", "UK Companies House", "IRS Form 1120/5472", "Banking KYC"],
        email: "compliance@officialum1.com"
    },
    {
        name: "Elena Cruz",
        role: "Director of Asset Security & Escrow",
        tag: "Security & Operations",
        initials: "EC",
        bio: "Risk management and cyber verification specialist ensuring 100% secure escrow transactions, automated domain transfers, and authenticated digital asset verification.",
        specialties: ["Escrow Protocols", "Asset Ownership Audits", "Fraud Prevention", "Security Auditing"],
        email: "security@officialum1.com"
    },
    {
        name: "Lucas Meyer",
        role: "Director of Client Success & Global Solutions",
        tag: "Client Success",
        initials: "LM",
        bio: "Dedicated client partner ensuring seamless project delivery, rapid turnaround SLAs, and customized B2B growth consulting for enterprise and startup partners worldwide.",
        specialties: ["Client SLA Management", "Growth Consulting", "B2B Retainers", "Sprint Coordination"],
        email: "support@officialum1.com"
    }
];

export default function TeamPage() {
    return (
        <main style={{ minHeight: '100vh', overflowX: 'hidden', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            <Navbar />

            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About', href: '/about' }, { label: 'Team' }]}
                    label="Executive Leadership & Specialists"
                    title="The Engineering & Strategic Team"
                    description="OfficialUM1 LLC brings together senior software architects, search algorithm specialists, corporate compliance leads, and security directors."
                />
            </div>

            <section style={{ padding: '80px 0 120px' }}>
                <div className="container">
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                        gap: '2.5rem' 
                    }}>
                        {TEAM_MEMBERS.map((member, idx) => (
                            <div
                                key={idx}
                                style={{
                                    background: '#fff',
                                    borderRadius: '28px',
                                    border: '1px solid var(--border-subtle)',
                                    boxShadow: '0 18px 44px rgba(24,32,38,0.06)',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column'
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
                                        OfficialUM1 LLC
                                    </span>
                                    <a 
                                        href={`mailto:${member.email}`} 
                                        style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: '700', textDecoration: 'none' }}
                                    >
                                        Direct Contact →
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '5rem', textAlign: 'center' }}>
                        <div style={{
                            padding: '4rem 2rem',
                            borderRadius: '32px',
                            background: '#fff',
                            border: '1px solid var(--border-subtle)',
                            boxShadow: '0 18px 44px rgba(24,32,38,0.06)'
                        }}>
                            <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                                Want to discuss an enterprise project?
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2rem', fontWeight: 500 }}>
                                Our senior team is available for technical architectural audits and growth consultations.
                            </p>
                            <Link 
                                href="/contact" 
                                className="btn btn-primary"
                                style={{ padding: '0.9rem 2.5rem', borderRadius: '50px', fontWeight: '700', fontSize: '1rem' }}
                            >
                                Schedule Consultation
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
