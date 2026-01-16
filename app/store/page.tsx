"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function StorePage() {
    const [rentals, setRentals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/rentals')
            .then(res => res.json())
            .then(data => {
                setRentals(data);
                setLoading(false);
            });
    }, []);

    return (
        <main>
            <Navbar />
            <section className="section-padding" style={{ paddingTop: '150px' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h1>Pre-Ranked <span className="text-gradient">Digital Assets</span></h1>
                        <p className="subheading">Skip the wait. Rent a website that is already ranking and visible.</p>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', color: '#888' }}>Loading assets...</div>
                    ) : rentals.length === 0 ? (
                        <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px' }}>
                            <h3>No Assets Currently Available</h3>
                            <p style={{ margin: '1rem 0', color: '#aaa' }}>All our pre-ranked sites are currently rented. <br />Contact us to be added to the waitlist.</p>
                            <a href="/contact" className="btn btn-primary">Join Waitlist</a>
                        </div>
                    ) : (
                        <div className="grid-3">
                            {rentals.map((item) => (
                                <div key={item.id} className="glass" style={{ borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ height: '200px', background: '#111', position: 'relative' }}>
                                        {item.image && <img src={item.image} alt={item.domain} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                        <div style={{
                                            position: 'absolute', top: '10px', right: '10px',
                                            background: item.status === 'Available' ? '#00ff88' : '#ff4444',
                                            color: 'black', padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold'
                                        }}>
                                            {item.status}
                                        </div>
                                    </div>
                                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>{item.niche}</div>
                                        <h3 style={{ marginBottom: '0.5rem' }}>{item.domain}</h3>
                                        <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0', fontSize: '0.9rem', color: '#ccc' }}>
                                            <span>👁 {item.traffic} Visits/mo</span>
                                        </div>
                                        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{item.price}<span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>/mo</span></div>
                                            <a href={`/contact?service=Rent a Site&subject=I am interested in renting ${item.domain}`} className="btn btn-outline" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                                                Rent Now
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </main>
    );
}
