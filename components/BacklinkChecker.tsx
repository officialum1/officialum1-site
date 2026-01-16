"use client";

import { useState } from 'react';

export default function BacklinkChecker() {
    const [url, setUrl] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const checkAuthority = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/backlinks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, email })
            });
            const data = await res.json();
            setResult(data);
        } catch (error) {
            alert('Error running analysis. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section style={{ padding: '4rem 0', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.5))' }}>
            <div className="container">
                <div className="glass" style={{ padding: '3rem', borderRadius: '24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, #ff00cc, #333399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Free Domain Authority Checker
                    </h2>
                    <p style={{ color: '#ccc', marginBottom: '2rem' }}>
                        Get an instant "On-Page Authority" score and request a deep Backlink Profile analysis from our team.
                    </p>

                    {!result ? (
                        <form onSubmit={checkAuthority} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', margin: '0 auto' }}>
                            <input
                                type="url"
                                placeholder="Enter Website URL (e.g. https://example.com)"
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                required
                                style={{ padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
                            />
                            <input
                                type="email"
                                placeholder="Your Business Email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                style={{ padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ padding: '1rem', fontSize: '1.2rem' }}
                            >
                                {loading ? 'Analyzing Authority...' : 'Check Authority'}
                            </button>
                        </form>
                    ) : (
                        <div style={{ textAlign: 'left', animation: 'fadeIn 0.5s ease' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#888' }}>Domain Authority</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00ff88' }}>{result.da}</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#888' }}>Page Authority</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00ddff' }}>{result.pa}</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#888' }}>Backlinks</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{result.links > 0 ? result.links.toLocaleString() : 'Processing...'}</div>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Live Site Metrics</h3>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {result.details.map((item: string, i: number) => (
                                        <li key={i} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ color: '#00ff88' }}>✓</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{ background: 'rgba(0, 100, 255, 0.1)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#fff' }}>🚀 Report Emailed Successfully</h3>
                                <p style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '1rem' }}>
                                    We have sent a detailed breakdown of your authority score and improvement factors to <strong>{email}</strong>.
                                    Check your inbox (and spam folder) in a few minutes.
                                </p>
                                <button
                                    onClick={() => window.location.href = `/contact?service=SEO&message=I ran a backlink check for ${url} (DA: ${result.da}) and want to discuss how to improve it.`}
                                    className="btn btn-outline"
                                >
                                    Book a Strategy Call
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </section>
    );
}
