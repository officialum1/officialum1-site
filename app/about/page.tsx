"use client";

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LiveCount from '@/components/LiveCount';
import { PageHero } from '@/components/ui/PageHero';
import Script from 'next/script';

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
};

export default function AboutPage() {
    // Removed manual stats state/effect

    return (
        <main style={{ minHeight: '100vh', overflowX: 'hidden', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            <Navbar />

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
                                "name": "Who is Muhammad Umar Mumtaz?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Muhammad Umar Mumtaz is the founder and CEO of OfficialUM1. He is a digital entrepreneur specializing in high-performance web architecture, SEO strategy, and digital asset valuation. With over 5 years of experience in the digital marketing industry, he has helped hundreds of businesses scale their online presence."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "What is the vision behind OfficialUM1?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Umar founded OfficialUM1 to create a 'One-Stop' digital ecosystem where businesses could not only build their presence but actively grow it through verified assets and data-driven marketing. The goal is to provide transparency and results in an often opaque industry."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "What role does Umar play in daily operations?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "As the lead strategist, Umar personally oversees all major high-ticket projects and sets the technical direction for the development team. He is deeply involved in identifying new market trends and ensuring that the quality of assets delivered meets the 'OfficialUM1' standard."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "How did OfficialUM1 start?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "The agency started as a small SEO consultancy in Sahiwal. Recognizing the need for a more comprehensive approach to digital growth, Umar expanded the service list to include full-stack development and digital asset management, eventually leading to the global network that exists today."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "What is Umar's philosophy on digital growth?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Umar believes that 'Growth without Data is just Guesswork'. His approach focuses on building sustainable, secure digital systems that prioritize long-term performance over short-term hacks."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "How can I contact the founder directly?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "For strategic partnerships or high-level inquiries, you can reach out via the Contact page and request a consultation with the executive team. For general support, our 24/7 team is always available."
                                }
                            }
                        ]
                    })
                }}
            />

            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
                    label="About"
                    title="Elevating the digital standard"
                    description="OfficialUM1 builds high-performance systems and digital assets that drive real growth."
                />
            </div>

            {/* STATS SECTION */}
            <section style={{ padding: '50px 0' }}>
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '2rem',
                        background: '#fff',
                        padding: '4rem 2rem',
                        borderRadius: '32px',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: '0 18px 44px rgba(24,32,38,0.08)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        {/* Market Assets */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0 }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center' }}
                        >
                            <div style={{ fontSize: '3rem', fontWeight: '900', color: '#ff4444', marginBottom: '0.5rem' }}>
                                <LiveCount metric="marketAssets" short={true} />
                            </div>
                            <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: 0, fontWeight: '700' }}>Market Assets</div>
                        </motion.div>

                        {/* Active Users */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center' }}
                        >
                            <div style={{ fontSize: '3rem', fontWeight: '900', color: '#ff4444', marginBottom: '0.5rem' }}>
                                <LiveCount metric="activeUsers" short={true} />
                            </div>
                            <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: 0, fontWeight: '700' }}>Active Users</div>
                        </motion.div>

                        {/* Orders Fulfilled */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center' }}
                        >
                            <div style={{ fontSize: '3rem', fontWeight: '900', color: '#ff4444', marginBottom: '0.5rem' }}>
                                <LiveCount metric="orders" short={true} />
                            </div>
                            <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: 0, fontWeight: '700' }}>Orders Fulfilled</div>
                        </motion.div>

                        {/* Success Rate */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center' }}
                        >
                            <div style={{ fontSize: '3rem', fontWeight: '900', color: '#ff4444', marginBottom: '0.5rem' }}>99.9%</div>
                            <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: 0, fontWeight: '700' }}>Success Rate</div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CORE EXPERTISE */}
            <section style={{ padding: '100px 0' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '2rem' }}>We Build, <br /><span style={{ color: '#ff4444' }}>You Grow.</span></h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.8', fontWeight: 500 }}>
                                Our philosophy is simple: A digital presence shouldn't just exist—it should perform. Whether it's high-authority social assets, custom software, or rank-and-rent SEO, we handle the heavy lifting.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    'Data-Driven Decision Making',
                                    'High-Performance Next.js Architecture',
                                    'Secure Asset Escrow & Delivery',
                                    'Global Support Network'
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff4444' }}></div>
                                        </div>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="glass"
                            style={{
                                padding: '3rem',
                                borderRadius: '40px',
                                background: '#fff',
                                border: '1px solid var(--border-subtle)',
                                boxShadow: '0 18px 44px rgba(24,32,38,0.08)'
                            }}
                        >
                            <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Our Mission</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '2rem', fontWeight: 500 }}>
                                To revolutionize the digital landscape by providing transparent, scalable, and high-performance digital solutions. We believe in building long-term partnerships, not just one-off transactions.
                            </p>
                            <div style={{ padding: '2rem', background: 'var(--bg-section-alt)', borderRadius: '20px', borderLeft: '4px solid #ff4444', position: 'relative', border: '1px solid var(--border-subtle)' }}>
                                <p style={{ fontStyle: 'italic', color: 'var(--text-primary)', margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 600 }}>
                                    &quot;OfficialUM1 isn&apos;t just an agency; it&apos;s a commitment to excellence. We don&apos;t just reach goals; we redefine them.&quot;
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        border: '2px solid #ff4444'
                                    }}>
                                        <img src="/founder.jpg" alt="Muhammad Umar Mumtaz" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Muhammad Umar Mumtaz</div>
                                        <div style={{ fontSize: '0.8rem', color: '#ff4444' }}>Founder & CEO</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FOUNDER SECTION */}
            <section style={{ padding: '100px 0', background: 'var(--bg-section-alt)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <span style={{ color: 'var(--accent-violet)', textTransform: 'uppercase', letterSpacing: 0, fontSize: '0.9rem', fontWeight: '800' }}>The Visionary</span>
                        <h2 style={{ fontSize: '3rem', fontWeight: '900', marginTop: '1rem' }}>Meet the Founder</h2>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '4rem',
                        alignItems: 'center',
                        maxWidth: '1000px',
                        margin: '0 auto'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            style={{ position: 'relative' }}
                        >
                            <div style={{
                                padding: '40px',
                                background: '#fff',
                                borderRadius: '30px',
                                border: '1px solid var(--border-subtle)',
                                textAlign: 'center',
                                boxShadow: '0 18px 44px rgba(24,32,38,0.08)'
                            }}>
                                <div style={{
                                    width: '150px',
                                    height: '150px',
                                    borderRadius: '50%',
                                    margin: '0 auto 20px',
                                    overflow: 'hidden',
                                    border: '2px solid #ff4444',
                                    boxShadow: '0 10px 30px rgba(255, 68, 68, 0.2)'
                                }}>
                                    <img
                                        src="/founder.jpg"
                                        alt="Muhammad Umar Mumtaz"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Muhammad Umar Mumtaz</h3>
                                <p style={{ color: '#ff4444', marginBottom: '20px' }}>Founder & Lead Strategist</p>
                                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 500 }}>&quot;Innovation is the ability to see change as an opportunity, not a threat.&quot;</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>From Sahiwal to Global <span style={{ color: '#ff4444' }}>Influence</span></h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '1.5rem', fontWeight: 500 }}>
                                Muhammad Umar Mumtaz started OfficialUM1 with a singular vision: to bridge the gap between complex digital technologies and accessible business growth. What began in Sahiwal, Pakistan, has now expanded into a global network serving thousands of clients.
                            </p>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '2rem', fontWeight: 500 }}>
                                With deep expertise in SEO, full-stack development, and digital asset management, Umar leads the team with a focus on data-driven results and transparent functionality.
                            </p>
                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                {['Visionary Leadership', 'Tech Innovator', 'Global Strategist'].map((tag, i) => (
                                    <span key={i} style={{
                                        padding: '8px 16px',
                                        background: 'rgba(255, 68, 68, 0.1)',
                                        color: '#ff4444',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600'
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FOUNDER FAQ */}
            <section style={{ padding: '100px 0' }}>
                <div className="container" style={{ maxWidth: '900px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900' }}>Founder <span style={{ color: '#ff4444' }}>FAQ</span></h2>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Common questions about our leadership and vision.</p>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {[
                            {
                                q: "Who is Muhammad Umar Mumtaz?",
                                a: "Muhammad Umar Mumtaz is the founder and CEO of OfficialUM1. He is a digital entrepreneur specializing in high-performance web architecture, SEO strategy, and digital asset valuation. With over 5 years of experience in the digital marketing industry, he has helped hundreds of businesses scale their online presence."
                            },
                            {
                                q: "What is the vision behind OfficialUM1?",
                                a: "Umar founded OfficialUM1 to create a 'One-Stop' digital ecosystem where businesses could not only build their presence but actively grow it through verified assets and data-driven marketing. The goal is to provide transparency and results in an often opaque industry."
                            },
                            {
                                q: "What role does Umar play in daily operations?",
                                a: "As the lead strategist, Umar personally oversees all major high-ticket projects and sets the technical direction for the development team. He is deeply involved in identifying new market trends and ensuring that the quality of assets delivered meets the 'OfficialUM1' standard."
                            },
                            {
                                q: "How did OfficialUM1 start?",
                                a: "The agency started as a small SEO consultancy in Sahiwal. Recognizing the need for a more comprehensive approach to digital growth, Umar expanded the service list to include full-stack development and digital asset management, eventually leading to the global network that exists today."
                            },
                            {
                                q: "What is Umar's philosophy on digital growth?",
                                a: "Umar believes that 'Growth without Data is just Guesswork'. His approach focuses on building sustainable, secure digital systems that prioritize long-term performance over short-term hacks."
                            },
                            {
                                q: "How can I contact the founder directly?",
                                a: "For strategic partnerships or high-level inquiries, you can reach out via the Contact page and request a consultation with the executive team. For general support, our 24/7 team is always available."
                            }
                        ].map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass"
                                style={{ padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', background: '#fff', boxShadow: '0 14px 34px rgba(24,32,38,0.08)' }}
                            >
                                <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>{faq.q}</h4>
                                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontWeight: 500 }}>{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION */}
            <section style={{ padding: '100px 0 150px' }}>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{
                            padding: '6rem 2rem',
                            textAlign: 'center',
                            borderRadius: '40px',
                            background: '#fff',
                            border: '1px solid var(--border-subtle)',
                            boxShadow: '0 18px 44px rgba(24,32,38,0.08)'
                        }}
                    >
                        <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '1.5rem' }}>Ready to Scale?</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '3rem', fontWeight: 500 }}>Join thousands of businesses who trust OfficialUM1 with their digital growth.</p>
                        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a href="/shop" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '50px' }}>Explore Shop</a>
                            <a href="/contact" className="btn btn-outline" style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '50px' }}>Contact Specialist</a>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
            <style jsx>{`
                @media (max-width: 768px) {
                    .container { padding: 0 20px !important; }
                    section { padding: 80px 0 !important; }
                    h1 { font-size: 2.5rem !important; }
                    h2 { font-size: 2rem !important; }
                    .glass { padding: 1.5rem !important; }
                    div[style*="flex-wrap: wrap"] { gap: 1rem !important; }
                    h2 { font-size: 1.8rem !important; }
                    p { font-size: 1rem !important; }
                }
            `}</style>
        </main>
    );
}
