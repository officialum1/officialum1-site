"use client";

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
};

export default function AboutPage() {
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
                        {[
                            { label: 'Market Assets', value: '10k+' },
                            { label: 'Active Users', value: '5,000+' },
                            { label: 'Orders Fulfilled', value: '25k+' },
                            { label: 'Success Rate', value: '99.9%' }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                style={{ textAlign: 'center' }}
                            >
                                <div style={{ fontSize: '3rem', fontWeight: '900', color: '#ff4444', marginBottom: '0.5rem' }}>{stat.value}</div>
                                <div style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px', fontWeight: '600' }}>{stat.label}</div>
                            </motion.div>
                        ))}
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
                                <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>— Founder, OfficialUM1</div>
                            </div>
                        </motion.div>
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
