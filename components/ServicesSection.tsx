"use client";

import { useState, useEffect } from "react";

export default function ServicesSection() {
    const [services, setServices] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/services')
            .then(res => res.json())
            .then(data => setServices(data))
            .catch(err => console.error("Failed to load services", err));
    }, []);

    return (
        <section id="services" className="section-padding">
            <div className="container">
                <div style={{ textAlign: "center", marginBottom: '4rem' }}>
                    <h2>Our <span className="text-gradient">Expertise</span></h2>
                    <p className="subheading">Comprehensive digital solutions designed to scale your business.</p>
                </div>

                <div className="grid-3">
                    {services.map((service) => (
                        <div key={service.id} className="card">
                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{service.icon}</div>
                            <h3 style={{ marginBottom: '0.5rem' }}>{service.title}</h3>
                            <p>{service.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
