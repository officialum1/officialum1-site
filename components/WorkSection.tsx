"use client";

import { useState, useEffect } from "react";

export default function WorkSection() {
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/projects')
            .then(res => res.json())
            .then(data => setProjects(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <section id="work" className="section-padding">
            <div className="container">
                <div style={{ textAlign: "center", marginBottom: '4rem' }}>
                    <h2>Featured <span className="text-gradient">Projects</span></h2>
                    <p className="subheading">Real results we've delivered for our clients.</p>
                </div>

                <div className="grid-3">
                    {projects.map((project) => (
                        <div key={project.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ height: '200px', background: '#222' }}>
                                <img
                                    src={project.image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                                    alt={project.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                    }}
                                />
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--accent)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {project.category}
                                </div>
                                <h3 style={{ marginBottom: '0.5rem' }}>{project.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{project.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
