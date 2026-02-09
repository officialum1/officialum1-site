"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

function ContactForm() {
    const searchParams = useSearchParams();
    const preService = searchParams.get('service') || 'Web Development';
    const preMessage = searchParams.get('subject') || searchParams.get('message') || '';

    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            await fetch('/api/contact', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            setStatus('success');
        } catch (error) {
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📬</div>
                <h2 style={{ color: '#fff', marginBottom: '1rem', fontWeight: '900' }}>Message Sent!</h2>
                <p style={{ color: '#94a3b8', lineHeight: '1.8', marginBottom: '2rem' }}>
                    Thank you for reaching out. A specialist will review your request and get back to you within 24 hours.
                </p>
                <button onClick={() => setStatus('idle')} className="btn btn-primary" style={{ padding: '0.8rem 2.5rem', borderRadius: '50px' }}>Send Another</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Full Name</label>
                    <input
                        name="name"
                        className="input-field"
                        required
                        placeholder="John Doe"
                        style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'white',
                            padding: '1.1rem',
                            borderRadius: '16px'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Email Address</label>
                    <input
                        name="email"
                        type="email"
                        className="input-field"
                        required
                        placeholder="john@example.com"
                        style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'white',
                            padding: '1.1rem',
                            borderRadius: '16px'
                        }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Service Inquiry</label>
                <select
                    name="service"
                    className="input-field"
                    defaultValue={preService}
                    style={{
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'white',
                        padding: '1.1rem',
                        borderRadius: '16px'
                    }}
                >
                    <option value="Web Development">Web Development</option>
                    <option value="SEO">SEO & Backlinks</option>
                    <option value="Social Media Marketing">Social Media Marketing</option>
                    <option value="Rent a Site">Rent a Pre-Ranked Site</option>
                    <option value="Support Ticket">Start a Support Ticket</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Message</label>
                <textarea
                    name="message"
                    className="input-field"
                    style={{
                        height: '160px',
                        resize: 'none',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'white',
                        padding: '1.1rem',
                        borderRadius: '16px',
                        fontFamily: 'inherit'
                    }}
                    required
                    placeholder="Briefly describe your goals..."
                    defaultValue={preMessage}
                ></textarea>
            </div>

            <button type="submit" disabled={status === 'submitting'} className="btn btn-primary" style={{ padding: '1.2rem', borderRadius: '16px', fontWeight: '900', fontSize: '1rem', background: '#ff4444' }}>
                {status === 'submitting' ? 'Processing...' : 'Submit Inquiry'}
            </button>
        </form>
    );
}

export default function ContactPage() {
    return (
        <main style={{ background: '#030305', minHeight: '100vh', color: '#fff' }}>
            <Navbar />
            <div className="container" style={{ paddingTop: '180px', paddingBottom: '150px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '6rem', alignItems: 'start' }}>

                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span style={{ color: '#ff4444', textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.9rem', fontWeight: '800' }}>Contact Us</span>
                        <h1 style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: '900', margin: '1.5rem 0 2rem', letterSpacing: '-2px', lineHeight: '1.1' }}>
                            Ready to <br />
                            <span style={{ color: '#ff4444' }}>Innovate?</span>
                        </h1>
                        <p style={{ fontSize: '1.2rem', color: '#94a3b8', lineHeight: '1.8', marginBottom: '4rem', maxWidth: '500px' }}>
                            Have a project in mind or just want to chat about digital scale? We're here to help you navigate the future of business.
                        </p>

                        <div style={{ display: 'grid', gap: '2.5rem' }}>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{ width: '60px', height: '60px', background: 'rgba(255,68,68,0.05)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📧</div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</h4>
                                    <a href="mailto:hello@officialum1.com" style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', textDecoration: 'none' }}>hello@officialum1.com</a>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{ width: '60px', height: '60px', background: 'rgba(255,68,68,0.05)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📱</div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>WhatsApp</h4>
                                    <a href="https://wa.me/923237102924" style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', textDecoration: 'none' }}>+92 323 7102924</a>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{ width: '60px', height: '60px', background: 'rgba(255,68,68,0.05)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📍</div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>HQ</h4>
                                    <p style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Sahiwal, Punjab, Pakistan</p>
                                    <a href="https://maps.app.goo.gl/vq49Dk3RSGwaizaBF" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#ff4444', textDecoration: 'none' }}>
                                        View Map Location →
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="glass"
                        style={{
                            padding: '3.5rem',
                            borderRadius: '40px',
                            background: 'rgba(255,255,255,0.01)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(40px)',
                            boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
                        }}
                    >
                        <Suspense fallback={<div style={{ color: '#666' }}>Initializing secure form...</div>}>
                            <ContactForm />
                        </Suspense>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
