"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h3 style={{ color: '#00ff88', marginBottom: '1rem' }}>Message Sent!</h3>
                <p>We'll get back to you within 24 hours.</p>
                <button onClick={() => setStatus('idle')} className="btn btn-outline" style={{ marginTop: '2rem' }}>Send Another</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#ccc', fontWeight: 500, paddingLeft: '4px' }}>Your Name</label>
                <input
                    name="name"
                    className="input-field"
                    required
                    placeholder="John Doe"
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '12px'
                    }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#ccc', fontWeight: 500, paddingLeft: '4px' }}>Email Address</label>
                <input
                    name="email"
                    type="email"
                    className="input-field"
                    required
                    placeholder="john@example.com"
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '12px'
                    }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#ccc', fontWeight: 500, paddingLeft: '4px' }}>Service Interested In</label>
                <select
                    name="service"
                    className="input-field"
                    defaultValue={preService}
                    style={{
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '12px'
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#ccc', fontWeight: 500, paddingLeft: '4px' }}>Message Details</label>
                <textarea
                    name="message"
                    className="input-field"
                    style={{
                        height: '150px',
                        resize: 'vertical',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '12px',
                        fontFamily: 'inherit'
                    }}
                    required
                    placeholder="Tell us about your project or issue..."
                    defaultValue={preMessage}
                ></textarea>
            </div>

            <button type="submit" disabled={status === 'submitting'} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                {status === 'submitting' ? 'Sending...' : 'Send Message'}
            </button>
        </form>
    );
}

export default function ContactPage() {
    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Let's Build Something <br /><span className="text-gradient">Extraordinary</span></h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '3rem' }}>
                            Ready to start your next project? Fill out the form or reach out to us directly.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div>
                                <h4>Email Us</h4>
                                <a href="mailto:hello@officialum1.com" style={{ color: 'white', fontSize: '1.1rem' }}>hello@officialum1.com</a>
                            </div>
                            <div>
                                <h4>Call Us</h4>
                                <a href="tel:+923237102924" style={{ color: 'white', fontSize: '1.1rem' }}>+92 323 7102924</a>
                            </div>
                            <div>
                                <h4>Visit Us</h4>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Sahiwal, Punjab, Pakistan</p>
                                <a href="https://maps.app.goo.gl/vq49Dk3RSGwaizaBF" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', color: 'var(--accent)', textDecoration: 'underline' }}>
                                    View on Google Maps →
                                </a>
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <div className="glass" style={{ padding: '3rem', borderRadius: '24px' }}>
                            <Suspense fallback={<div>Loading form...</div>}>
                                <ContactForm />
                            </Suspense>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            <Footer />
        </main>
    );
}
