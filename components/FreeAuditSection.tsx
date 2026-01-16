"use client";

import { useState } from 'react';

export default function FreeAuditSection() {
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, website }),
            });
            const data = await res.json();
            if (data.success) {
                setReport(data.report);
            } else {
                alert(data.error || "Audit failed. Please try a valid URL.");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="section-padding" style={{ position: 'relative', overflow: 'hidden' }} id="audit">
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(79, 70, 229, 0.1), rgba(6, 182, 212, 0.1))', zIndex: -1 }}></div>
            <div className="container">
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '3rem',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(10,10,10,0.8)',
                    backdropFilter: 'blur(10px)',
                    maxWidth: '900px',
                    margin: '0 auto'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Get a <span className="text-gradient">Real-Time AI Audit</span></h2>
                        <p style={{ fontSize: '1.1rem', color: '#ccc', maxWidth: '600px', margin: '0 auto' }}>
                            Enter your website URL below. Our AI will scan your site for SEO, Performance, and Structure issues instantly.
                        </p>
                    </div>

                    {!report ? (
                        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input
                                    type="url"
                                    placeholder="Your Website URL (e.g. https://example.com)"
                                    required
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    className="input-field"
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1.5rem',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                />
                                <input
                                    type="email"
                                    placeholder="Your Business Email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field"
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1.5rem',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                    style={{ width: '100%', padding: '1rem', opacity: loading ? 0.7 : 1 }}
                                >
                                    {loading ? 'Scanning Website...' : 'Analyze Now'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div style={{ width: '100%', animation: 'fadeIn 0.5s ease' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>Audit Results for:</h3>
                                    <div style={{ color: 'var(--accent)' }}>{report.url}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#888' }}>Health Score</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: report.score > 70 ? '#00ff88' : report.score > 40 ? '#ffaa00' : '#ff4444' }}>
                                        {report.score}/100
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Load Time</div>
                                    <div style={{ fontWeight: 'bold' }}>{report.loadTime}ms</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Words</div>
                                    <div style={{ fontWeight: 'bold' }}>{report.wordCount}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Images</div>
                                    <div style={{ fontWeight: 'bold' }}>{report.imgCount}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Int. Links</div>
                                    <div style={{ fontWeight: 'bold' }}>{report.internalLinks}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Ext. Links</div>
                                    <div style={{ fontWeight: 'bold' }}>{report.externalLinks}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Scripts</div>
                                    <div style={{ fontWeight: 'bold' }}>{report.scripts}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Socials</div>
                                    <div style={{ fontWeight: 'bold' }}>{report.passed.find((p: string) => p.includes('Social Profiles')) ? 'Found' : 'Missing'}</div>
                                </div>
                            </div>

                            {report.topKeywords && report.topKeywords.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ color: '#ccc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Top Keywords Detected:</h4>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {report.topKeywords.map((kw: any, i: number) => (
                                            <span key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', color: '#fff' }}>
                                                {kw.word} ({kw.count})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {report.techStack && report.techStack.length > 0 && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <h4 style={{ color: '#ccc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Tech Stack Detected:</h4>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {report.techStack.map((tech: string, i: number) => (
                                            <span key={i} style={{
                                                background: 'linear-gradient(to right, #4f46e5, #06b6d4)',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                color: '#fff',
                                                fontWeight: 'bold'
                                            }}>
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid-2-mobile" style={{ gap: '2rem' }}>
                                <div>
                                    <h4 style={{ color: '#00ff88', marginBottom: '1rem' }}>✅ Passed Checks</h4>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {report.passed.length > 0 ? report.passed.map((item: string, i: number) => (
                                            <li key={i} style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                                <span>✓</span> {item}
                                            </li>
                                        )) : <li style={{ color: '#666' }}>No passed checks.</li>}
                                    </ul>
                                </div>
                                <div>
                                    <h4 style={{ color: '#ff4444', marginBottom: '1rem' }}>⚠️ Issues Found</h4>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {report.issues.length > 0 ? report.issues.map((item: string, i: number) => (
                                            <li key={i} style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                                <span>•</span> {item}
                                            </li>
                                        )) : <li style={{ color: '#666' }}>No critical issues found!</li>}
                                    </ul>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', textAlign: 'center' }}>
                                <p style={{ marginBottom: '1rem' }}>Want to fix these issues and reach 100/100?</p>
                                <a href="/contact?subject=Fix SEO Issues" className="btn btn-primary">
                                    Book a Fix Call
                                </a>
                                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>A full detailed copy has been sent to {email}</p>
                            </div>

                            <button onClick={() => setReport(null)} style={{ display: 'block', margin: '1rem auto 0', background: 'none', border: 'none', color: '#888', cursor: 'pointer', textDecoration: 'underline' }}>
                                Scan Another Site
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .grid-2-mobile {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                }
                @media (max-width: 768px) {
                    .grid-2-mobile { grid-template-columns: 1fr; }
                }
            `}</style>
        </section>
    );
}
