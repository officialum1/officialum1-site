"use client";

import React, { useState } from "react";

export default function SuccessRoadmap() {
    const [domain, setDomain] = useState("");
    const [showRoadmap, setShowRoadmap] = useState(false);

    const roadmapData = [
        { month: "Month 1", task: "Technical Audit & Link Foundation", stats: "Indexing Spike: +40%", icon: "1" },
        { month: "Month 2", task: "High-DA Guest Posting Surge", stats: "DA Increase: +5-10 pts", icon: "2" },
        { month: "Month 3", task: "First Page Dominance", stats: "Traffic Growth: 2x - 5x", icon: "3" },
    ];

    return (
        <section style={{ padding: "80px 0", background: "var(--bg-base)" }}>
            <div className="container" style={{ maxWidth: "1000px" }}>
                <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                    <h2 style={{ fontSize: "2.5rem", marginBottom: "1.5rem" }}>
                        Your <span className="text-gradient">Success Roadmap</span>
                    </h2>
                    <p style={{ color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto", fontWeight: 500, lineHeight: 1.7 }}>
                        Enter your domain to see the projected growth path when you partner with OfficialUM1 for SEO and Guest Posting.
                    </p>
                </div>

                <div style={{ padding: "3rem", borderRadius: "24px", marginBottom: "4rem", background: "#fff", border: "1px solid var(--border-subtle)", boxShadow: "0 18px 44px rgba(24,32,38,0.08)" }}>
                    <div style={{ display: "flex", gap: "1rem", marginBottom: "3rem", flexWrap: "wrap" }}>
                        <input
                            type="text"
                            placeholder="yourdomain.com"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            style={{ flex: 1, minWidth: "250px", background: "#fff", border: "1px solid var(--border-subtle)", padding: "1rem 1.5rem", borderRadius: "50px", color: "var(--text-primary)", boxShadow: "0 4px 14px rgba(24,32,38,0.06)" }}
                        />
                        <button
                            onClick={() => domain ? setShowRoadmap(true) : alert("Please enter a domain")}
                            className="btn btn-primary"
                            style={{ borderRadius: "50px", padding: "1rem 2.5rem" }}
                        >
                            Generate Roadmap
                        </button>
                    </div>

                    {showRoadmap && (
                        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", position: "relative" }}>
                                <div style={{ position: "absolute", top: "50px", left: "10%", right: "10%", height: "2px", background: "linear-gradient(90deg, transparent, rgba(20,108,120,0.22), transparent)", zIndex: 0 }} className="desktop-only" />

                                {roadmapData.map((step, idx) => (
                                    <div key={idx} style={{ padding: "2rem", borderRadius: "20px", textAlign: "center", background: "#fff", border: "1px solid var(--border-subtle)", position: "relative", zIndex: 1, boxShadow: "0 14px 34px rgba(24,32,38,0.08)" }}>
                                        <div style={{
                                            width: "80px",
                                            height: "80px",
                                            borderRadius: "50%",
                                            background: "rgba(20,108,120,0.10)",
                                            color: "var(--accent-blue)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "2rem",
                                            fontWeight: 800,
                                            margin: "0 auto 1.5rem",
                                            border: "2px dashed rgba(20,108,120,0.24)"
                                        }}>
                                            {step.icon}
                                        </div>
                                        <div style={{ fontSize: "0.8rem", color: "var(--accent-blue)", fontWeight: "bold", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                                            {step.month}
                                        </div>
                                        <h4 style={{ marginBottom: "1rem" }}>{step.task}</h4>
                                        <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--text-primary)" }}>{step.stats}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: "3rem", textAlign: "center", padding: "2rem", background: "var(--bg-section-alt)", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                                <p style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: 600 }}>
                                    Ready to skyrocket <b>{domain}</b>?
                                </p>
                                <a href="/contact" className="btn btn-primary" style={{ marginTop: "1rem", display: "inline-block" }}>Get Started Today</a>
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
