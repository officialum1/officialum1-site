"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PageHero } from '@/components/ui/PageHero';
import { Eye } from 'lucide-react';

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
            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Store' }]}
                    label="Store"
                    title="Pre-ranked digital assets"
                    description="Skip the wait. Rent a website that’s already ranking and visible."
                />
            </div>

            <section className="section-padding" style={{ paddingTop: '3rem' }}>
                <div className="container">
                    {loading ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>Loading assets…</div>
                    ) : rentals.length === 0 ? (
                        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                            <h3 style={{ fontWeight: 900, color: 'var(--fg)' }}>No assets currently available</h3>
                            <p style={{ margin: '0.75rem 0 1.5rem', color: 'var(--muted)' }}>
                                All our pre-ranked sites are currently rented. Contact us to be added to the waitlist.
                            </p>
                            <a href="/contact" className="btn-primary" style={{ display: 'inline-block' }}>Join waitlist</a>
                        </div>
                    ) : (
                        <div className="grid-3">
                            {rentals.map((item) => (
                                <div key={item.id} className="card" style={{ borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>
                                    <div style={{ height: '200px', background: 'linear-gradient(135deg, rgba(79,70,229,0.10), rgba(37,99,235,0.10))', position: 'relative' }}>
                                        {item.image && <img src={item.image} alt={item.domain} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                        <div style={{
                                            position: 'absolute', top: '10px', right: '10px',
                                            background: item.status === 'Available' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
                                            color: item.status === 'Available' ? '#065f46' : '#7f1d1d',
                                            border: '1px solid var(--border)',
                                            padding: '0.25rem 0.7rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 900
                                        }}>
                                            {item.status}
                                        </div>
                                    </div>
                                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div className="section-label" style={{ marginBottom: '0.5rem' }}>{item.niche}</div>
                                        <h3 style={{ marginBottom: '0.5rem', color: 'var(--fg)', fontWeight: 900 }}>{item.domain}</h3>
                                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', margin: '0.75rem 0', fontSize: '0.9rem', color: 'var(--muted)' }}>
                                            <Eye size={16} />
                                            <span>{item.traffic} visits/mo</span>
                                        </div>
                                        <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--fg)' }}>
                                                {item.price}
                                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)' }}>/mo</span>
                                            </div>
                                            <a href={`/contact?service=Rent a Site&subject=I am interested in renting ${item.domain}`} className="btn-secondary" style={{ fontSize: '0.9rem', padding: '0.55rem 1rem', whiteSpace: 'nowrap' }}>
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
