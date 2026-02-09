"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function TermsPage() {
    const [content, setContent] = useState('');

    useEffect(() => {
        fetch('/api/pages?page=terms')
            .then(res => res.json())
            .then(data => setContent(data.content || ''))
            .catch(() => setContent('Error loading terms.'));
    }, []);

    return (
        <main style={{ background: '#030305', minHeight: '100vh', color: '#fff' }}>
            <Navbar />

            {/* HERO */}
            <section style={{
                padding: '180px 0 60px',
                background: 'linear-gradient(180deg, rgba(255, 68, 68, 0.05) 0%, transparent 100%)',
                textAlign: 'center'
            }}>
                <div className="container">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '900', letterSpacing: '-2px' }}
                    >
                        Terms and <span style={{ color: '#ff4444' }}>Conditions</span>
                    </motion.h1>
                    <p style={{ color: '#94a3b8', marginTop: '1rem', fontSize: '1.1rem' }}>Last Updated: January 2026</p>
                </div>
            </section>

            {/* CONTENT */}
            <section style={{ paddingBottom: '150px' }}>
                <div className="container" style={{ maxWidth: '850px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass"
                        style={{
                            padding: '4rem',
                            borderRadius: '40px',
                            background: 'rgba(255,255,255,0.01)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            lineHeight: '1.9',
                            color: '#e2e8f0',
                            fontSize: '1.1rem'
                        }}
                    >
                        <div
                            className="legal-content"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </motion.div>
                </div>
            </section>

            <style jsx global>{`
                .legal-content h1, .legal-content h2, .legal-content h3 {
                    color: #fff;
                    margin-top: 2.5rem;
                    margin-bottom: 1rem;
                    font-weight: 800;
                    letter-spacing: -1px;
                }
                .legal-content h1 { font-size: 2.5rem; text-align: center; margin-bottom: 3rem; }
                .legal-content h2 { font-size: 1.8rem; border-bottom: 1px solid rgba(255,68,68,0.2); padding-bottom: 0.5rem; display: inline-block; }
                .legal-content p { margin-bottom: 1.5rem; }
                .legal-content ul, .legal-content ol { margin-bottom: 2rem; padding-left: 1.5rem; }
                .legal-content li { margin-bottom: 0.8rem; position: relative; list-style-type: none; }
                .legal-content li::before { 
                    content: '•'; 
                    color: #ff4444; 
                    position: absolute; 
                    left: -1.5rem; 
                    font-weight: bold; 
                }
                .legal-content strong { color: #fff; font-weight: 700; }
            `}</style>

            <Footer />
        </main>
    );
}
