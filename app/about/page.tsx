"use client";

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LiveCount from '@/components/LiveCount';

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
};

export default function AboutPage() {
    // Removed manual stats state/effect

    return (
        <main style={{ background: '#030305', color: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>
            <Navbar />

            {/* HERO SECTION */}
            <section style={{
                padding: '200px 0 100px',
                position: 'relative',
                background: 'radial-gradient(circle at 50% 30%, rgba(255, 68, 68, 0.08) 0%, transparent 70%)'
            }}>
                <div className="container">
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={fadeIn}
                        style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}
                    >
                        <span style={{
                            color: '#ff4444',
                            textTransform: 'uppercase',
                            letterSpacing: '4px',
                            fontSize: '0.9rem',
                            fontWeight: '700',
                            display: 'block',
                            marginBottom: '1.5rem'
                        }}>Our Legacy</span>
                        <h1 style={{
                            fontSize: 'clamp(3rem, 8vw, 5rem)',
                            lineHeight: '1.1',
                            fontWeight: '900',
                            marginBottom: '2rem',
                            letterSpacing: '-2px'
                        }}>
                            Elevating the Digital <br />
                            <span style={{
                                background: 'linear-gradient(90deg, #ff4444, #ff8888)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>Standard.</span>
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: '#94a3b8', lineHeight: '1.8' }}>
                            Founded in Sahiwal, Pakistan, OfficialUM1 has evolved from a local startup into a powerhouse digital agency. We specialize in building high-performance systems and digital assets that drive real growth.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* STATS SECTION */}
            <section style={{ padding: '50px 0' }}>
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '2rem',
                        background: 'rgba(255,255,255,0.02)',
                        padding: '4rem 2rem',
                        borderRadius: '32px',
                        border: '1px solid rgba(255,255,255,0.05)',
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
                            <div style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px', fontWeight: '600' }}>Market Assets</div>
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
                            <div style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px', fontWeight: '600' }}>Active Users</div>
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
                            <div style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px', fontWeight: '600' }}>Orders Fulfilled</div>
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
                            <div style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px', fontWeight: '600' }}>Success Rate</div>
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
                            <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.8' }}>
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
                                        <span style={{ color: '#e2e8f0', fontWeight: '500' }}>{item}</span>
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
                                background: 'linear-gradient(135deg, rgba(255,68,68,0.05) 0%, rgba(255,68,68,0.01) 100%)',
                                border: '1px solid rgba(255,68,68,0.1)'
                            }}
                        >
                            <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Our Mission</h3>
                            <p style={{ color: '#94a3b8', lineHeight: '1.8', marginBottom: '2rem' }}>
                                To revolutionize the digital landscape by providing transparent, scalable, and high-performance digital solutions. We believe in building long-term partnerships, not just one-off transactions.
                            </p>
                            <div style={{ padding: '2rem', background: 'rgba(0,0,0,0.3)', borderRadius: '20px', borderLeft: '4px solid #ff4444' }}>
                                <p style={{ fontStyle: 'italic', color: '#e2e8f0', margin: 0 }}>
                                    "OfficialUM1 isn't just an agency; it's a commitment to excellence. We don't just reach goals; we redefine them."
                                </p>
                                <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>&mdash; Muhammad Umar Mumtaz</div>
                                <div style={{ fontSize: '0.8rem', color: '#ff4444' }}>Founder & CEO</div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FOUNDER SECTION */}
            <section style={{ padding: '100px 0', background: 'linear-gradient(to bottom, #030305, #08080a, #030305)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <span style={{ color: '#ff4444', textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.9rem', fontWeight: '700' }}>The Visionary</span>
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
                                background: 'linear-gradient(135deg, #111, #050505)',
                                borderRadius: '30px',
                                border: '1px solid #222',
                                textAlign: 'center'
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
                                <p style={{ color: '#888', fontStyle: 'italic' }}>"Innovation is the ability to see change as an opportunity - not a threat."</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>From Sahiwal to Global <span style={{ color: '#ff4444' }}>Influence</span></h3>
                            <p style={{ color: '#94a3b8', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                                Muhammad Umar Mumtaz started OfficialUM1 with a singular vision: to bridge the gap between complex digital technologies and accessible business growth. What began in Sahiwal, Pakistan, has now expanded into a global network serving thousands of clients.
                            </p>
                            <p style={{ color: '#94a3b8', lineHeight: '1.8', marginBottom: '2rem' }}>
                                With deep expertise in SEO, full-stack development, and digital asset management, Umar leads the team with a focus on data-driven results and transparent functionality.
                            </p>
                            <div style={{ display: 'flex', gap: '20px' }}>
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
                        <p style={{ color: '#888' }}>Common questions about our leadership and vision.</p>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {[
                            {
                                q: "Who is Muhammad Umar Mumtaz?",
                                a: "Muhammad Umar Mumtaz is the founder and CEO of OfficialUM1. He is a digital entrepreneur specializing in high-performance web architecture, SEO strategy, and digital asset valuation."
                            },
                            {
                                q: "What is the vision behind OfficialUM1?",
                                a: "Umar founded OfficialUM1 to create a 'One-Stop' digital ecosystem where businesses could not only build their presence but actively grow it through verified assets and data-driven marketing."
                            },
                            {
                                q: "How can I contact the founder directly?",
                                a: "For strategic partnerships or high-level inquiries, you can reach out via the Contact page and request a consultation with the executive team."
                            }
                        ].map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass"
                                style={{ padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}
                            >
                                <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>{faq.q}</h4>
                                <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>{faq.a}</p>
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
                            background: 'linear-gradient(180deg, #111 0%, #030305 100%)',
                            border: '1px solid #1f2937'
                        }}
                    >
                        <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '1.5rem' }}>Ready to Scale?</h2>
                        <p style={{ color: '#64748b', fontSize: '1.2rem', marginBottom: '3rem' }}>Join thousands of businesses who trust OfficialUM1 with their digital growth.</p>
                        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a href="/shop" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '50px' }}>Explore Shop</a>
                            <a href="/contact" className="btn btn-outline" style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '50px' }}>Contact Specialist</a>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
