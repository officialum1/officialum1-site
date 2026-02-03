"use client";

import React, { useState } from 'react';

export default function SuccessRoadmap() {
    const [domain, setDomain] = useState('');
    const [showRoadmap, setShowRoadmap] = useState(false);

    const roadmapData = [
        { month: 'Month 1', task: 'Technical Audit & Link Foundation', stats: 'Indexing Spike: +40%', icon: '🏗️' },
        { month: 'Month 2', task: 'High-DA Guest Posting Surge', stats: 'DA Increase: +5-10 pts', icon: '🚀' },
        { month: 'Month 3', task: 'First Page Dominance', stats: 'Traffic Growth: 2x - 5x', icon: '🏆' },
    ];

    return (
        <section style={{ padding: '80px 0', background: 'radial-gradient(circle at bottom right, rgba(0, 255, 136, 0.05) 0%, transparent 50%)' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Your <span className="text-gradient">Success Roadmap</span></h2>
                    <p style={{ color: '#888', maxWidth: '600px', margin: '0 auto' }}>Enter your domain to see the projected growth path when you partner with OfficialUM1 for SEO and Guest Posting.</p>
                </div>

                <div className="glass" style={{ padding: '3rem', borderRadius: '30px', marginBottom: '4rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            placeholder="yourdomain.com"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            style={{ flex: 1, minWidth: '250px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem 1.5rem', borderRadius: '50px', color: '#fff' }}
                        />
                        <button
                            onClick={() => domain ? setShowRoadmap(true) : alert('Please enter a domain')}
                            className="btn btn-primary"
                            style={{ borderRadius: '50px', padding: '1rem 2.5rem' }}
                        >
                            Generate Roadmap
                        </button>
                    </div>

                    {showRoadmap && (
                        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', position: 'relative' }}>
                                {/* Connecting Line */}
                                <div style={{ position: 'absolute', top: '50px', left: '10%', right: '10%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.2), transparent)', zIndex: 0 }} className="desktop-only"></div>

                                {roadmapData.map((step, idx) => (
                                    <div key={idx} className="glass" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 1 }}>
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            background: 'rgba(0,255,136,0.1)',
                                            color: '#00ff88',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '2rem',
                                            margin: '0 auto 1.5rem',
                                            border: '2px dashed rgba(0,255,136,0.3)'
                                        }}>{step.icon}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#00ff88', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{step.month}</div>
                                        <h4 style={{ marginBottom: '1rem' }}>{step.task}</h4>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{step.stats}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '3rem', textAlign: 'center', padding: '2rem', background: 'rgba(0,255,136,0.05)', borderRadius: '20px', border: '1px solid rgba(0,255,136,0.1)' }}>
                                <p style={{ fontSize: '1.1rem', color: '#ccc' }}>Ready to skyrocket <b>{domain}</b>?</p>
                                <a href="/contact" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Get Started Today</a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @media (max-width: 960px) { .desktop-only { display: none; } }
            `}</style>
        </section>
    );
}
