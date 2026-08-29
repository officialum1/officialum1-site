"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { readJson } from "@/lib/read-json";

export default function WorkSection() {
    const pathname = usePathname();
    const isWorkPage = pathname === "/work";
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/projects')
            .then(res => readJson<any[]>(res))
            .then(data => setProjects(Array.isArray(data) ? data : []))
            .catch(() => setProjects([]));
    }, []);

    return (
        <section id="work" className="section-padding" style={{ background: "var(--bg-section)" }}>
            <div className="container">
                <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                    <h2
                        style={{
                            fontFamily: "var(--font-space-grotesk), sans-serif",
                            fontWeight: 800,
                            fontSize: "clamp(2rem,4vw,2.6rem)",
                            color: "var(--text-primary)",
                            marginBottom: "0.75rem",
                        }}
                    >
                        Featured{" "}
                        <span
                            style={{
                                background: "linear-gradient(135deg, var(--accent-blue), var(--accent-violet))",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            Projects
                        </span>
                    </h2>
                    <p
                        className="subheading"
                        style={{
                            maxWidth: "540px",
                            margin: "0 auto",
                            fontSize: "0.95rem",
                            color: "var(--text-muted)",
                        }}
                    >
                        Real results we’ve delivered for brands across SaaS, e‑commerce, and services.
                    </p>
                </div>

                <div
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                    {projects.map((project) => (
                        <article
                            key={project.id}
                            className="workCard group flex flex-col overflow-hidden rounded-2xl"
                            style={{
                                background: "var(--bg-card)",
                                border: "1px solid var(--border-subtle)",
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                            }}
                        >
                            <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
                                <img
                                    src={
                                        project.image ||
                                        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                    }
                                    alt={project.title}
                                    loading="lazy"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        transform: "scale(1)",
                                        transition: "transform 0.35s ease",
                                    }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
                                    }}
                                />
                            </div>
                            <div style={{ padding: "1.5rem" }}>
                                <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        padding: "0.25rem 0.7rem",
                                        borderRadius: "999px",
                                        marginBottom: "0.75rem",
                                        fontSize: "0.7rem",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.16em",
                                        background:
                                            "linear-gradient(135deg, rgba(79,142,247,0.2), rgba(151,71,255,0.25))",
                                        color: "var(--text-primary)",
                                    }}
                                >
                                    {project.category || "Case Study"}
                                </div>
                                <h3
                                    style={{
                                        marginBottom: "0.4rem",
                                        fontSize: "1.05rem",
                                        fontWeight: 700,
                                        color: "var(--text-primary)",
                                        fontFamily: "var(--font-space-grotesk), sans-serif",
                                    }}
                                >
                                    {project.title}
                                </h3>
                                <p
                                    style={{
                                        fontSize: "0.9rem",
                                        color: "var(--text-muted)",
                                        marginBottom: project.url ? "1rem" : "0",
                                    }}
                                >
                                    {project.description}
                                </p>
                                {project.url && (
                                    <a
                                        href={project.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-500 hover:text-indigo-400 transition-colors"
                                    >
                                        Visit Live Project
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </article>
                    ))}
                </div>

                <div style={{ textAlign: "center", marginTop: "3rem" }}>
                    {isWorkPage ? (
                        <a
                            href="/contact"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem",
                                padding: "0.85rem 2.2rem",
                                borderRadius: "999px",
                                background: "linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-violet) 100%)",
                                fontSize: "0.95rem",
                                fontWeight: 700,
                                color: "#fff",
                                textDecoration: "none",
                                boxShadow: "0 10px 30px rgba(79, 142, 247, 0.25)",
                            }}
                            className="hover:scale-105 transition-transform"
                        >
                            Start Your Project With Us →
                        </a>
                    ) : (
                        <a
                            href="/work"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "0.65rem 1.75rem",
                                borderRadius: "999px",
                                border: "1px solid var(--border-subtle)",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                color: "var(--text-primary)",
                                textDecoration: "none",
                            }}
                        >
                            View All Work →
                        </a>
                    )}
                </div>
            </div>
            <style jsx>{`
              .workCard:hover {
                transform: translateY(-6px);
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35), 0 0 70px rgba(79, 142, 247, 0.12);
              }
              .workCard:hover img {
                transform: scale(1.05);
              }
            `}</style>
        </section>
    );
}
