"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { PageHero } from '@/components/ui/PageHero';
import { Mail, MapPin, MessageCircle, Send } from 'lucide-react';

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
            <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem', color: 'var(--indigo)' }}>
                    <Send size={44} />
                </div>
                <h2 style={{ color: 'var(--fg)', marginBottom: '0.75rem', fontWeight: '900' }}>Message sent</h2>
                <p style={{ color: 'var(--muted)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                    Thank you for reaching out. A specialist will review your request and get back to you within 24 hours.
                </p>
                <button onClick={() => setStatus('idle')} className="btn-primary" style={{ padding: '0.8rem 2.5rem', borderRadius: '999px' }}>
                    Send another
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Full Name</label>
                    <input
                        name="name"
                        className="input"
                        required
                        placeholder="John Doe"
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Email Address</label>
                    <input
                        name="email"
                        type="email"
                        className="input"
                        required
                        placeholder="john@example.com"
                    />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Service Inquiry</label>
                <select
                    name="service"
                    className="input"
                    defaultValue={preService}
                    style={{
                        cursor: 'pointer',
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
                    className="input"
                    style={{
                        height: '160px',
                        resize: 'none',
                        fontFamily: 'inherit'
                    }}
                    required
                    placeholder="Briefly describe your goals..."
                    defaultValue={preMessage}
                ></textarea>
            </div>

            <button type="submit" disabled={status === 'submitting'} className="btn-primary" style={{ padding: '1.05rem', borderRadius: '16px', fontWeight: '900', fontSize: '1rem' }}>
                {status === 'submitting' ? 'Sending…' : 'Submit inquiry'}
            </button>
        </form>
    );
}

export default function ContactPage() {
    return (
        <main style={{ minHeight: '100vh' }}>
            <Navbar />
            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
                    label="Contact"
                    title="Let’s build something that wins"
                    description="Tell us what you’re trying to achieve. We’ll reply fast with a clear plan and next steps."
                />
            </div>

            <div className="container" style={{ paddingTop: '3rem', paddingBottom: '96px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem', alignItems: 'start' }}>

                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div style={{ display: 'grid', gap: '2.5rem' }}>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', background: 'rgba(79,70,229,0.06)', border: '1px solid var(--border)', color: 'var(--indigo)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</h4>
                                    <a href="mailto:hello@officialum1.com" style={{ color: 'var(--fg)', fontSize: '1.05rem', fontWeight: '800', textDecoration: 'none' }}>hello@officialum1.com</a>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', background: 'rgba(79,70,229,0.06)', border: '1px solid var(--border)', color: 'var(--indigo)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MessageCircle size={18} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>WhatsApp</h4>
                                    <a href="https://wa.me/923237102924" style={{ color: 'var(--fg)', fontSize: '1.05rem', fontWeight: '800', textDecoration: 'none' }}>+92 323 7102924</a>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', background: 'rgba(79,70,229,0.06)', border: '1px solid var(--border)', color: 'var(--indigo)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>HQ</h4>
                                    <p style={{ color: 'var(--fg)', fontSize: '1.0rem', fontWeight: '800', margin: 0 }}>Sahiwal, Punjab, Pakistan</p>
                                    <a href="https://maps.app.goo.gl/vq49Dk3RSGwaizaBF" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--indigo)', textDecoration: 'none' }}>
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
                        className="card"
                        style={{
                            padding: '2rem',
                            borderRadius: '24px'
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
