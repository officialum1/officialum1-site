"use client";

import { useState, useEffect } from "react";

export default function TestimonialsSection() {
    const [testimonials, setTestimonials] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/testimonials')
            .then(res => res.json())
            .then(data => setTestimonials(data))
            .catch(err => console.error("Failed to load testimonials", err));
    }, []);

    return (
        <section className="section-padding" style={{ background: 'linear-gradient(to bottom, var(--background), var(--card-bg))' }}>
            <div className="container">
                <div style={{ textAlign: "center", marginBottom: '4rem' }}>
                    <h2>Client <span className="text-gradient">Success Stories</span></h2>
                    <p className="subheading">Don't just take our word for it. Hear from our partners.</p>
                </div>

                <div className="grid-3">
                    {testimonials.map((t) => (
                        <div key={t.id} className="glass" style={{ padding: '2rem', borderRadius: '16px', position: 'relative' }}>
                            <div style={{ fontSize: '3rem', color: 'var(--primary)', position: 'absolute', top: -10, left: 20, opacity: 0.5 }}>"</div>
                            <p style={{ fontStyle: 'italic', marginBottom: '1.5rem', lineHeight: 1.6 }}>{t.review}</p>
                            <div>
                                <h4 style={{ marginBottom: '0.2rem' }}>{t.name}</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
