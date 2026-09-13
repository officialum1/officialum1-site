"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PageHero } from '@/components/ui/PageHero';
import { Zap, ShieldAlert, CheckCircle2, ArrowRight, Gauge, Globe, Server, HardDrive, RefreshCw } from 'lucide-react';
import Link from 'next/link';

type AuditResult = {
    url: string;
    score: number;
    responseTimeMs: number;
    pageSizeKb: number;
    stack: string;
    serverHeader: string;
    isHttps: boolean;
    hasCompression: boolean;
    issues: Array<{ title: string; desc: string; severity: 'high' | 'medium' | 'low' }>;
    passed: Array<{ title: string; desc: string }>;
    summary: string;
};

export default function SpeedAuditTool() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AuditResult | null>(null);
    const [error, setError] = useState('');

    const handleAudit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await fetch('/api/tools/speed-audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to scan website.');
            }
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Unable to complete scan. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 85) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            <Navbar />

            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: "Home", href: "/" }, { label: "Tools", href: "/tools" }, { label: "Speed & Performance Audit" }]}
                    label="Free Performance Diagnostic"
                    title={<>Live Website <span style={{ color: 'var(--accent-blue)' }}>Speed & SEO</span> Diagnostic</>}
                    description="Run an instant deep diagnostic on your website. Detect TTFB latency, server bottlenecks, and Core Web Vitals issues in under 5 seconds."
                />

                <div className="container" style={{ maxWidth: '900px', paddingBottom: '100px' }}>
                    {/* Scanner Input Card */}
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '24px',
                        padding: '36px',
                        boxShadow: '0 20px 48px rgba(24, 32, 38, 0.08)',
                        marginTop: '-40px',
                        position: 'relative',
                        zIndex: 10
                    }}>
                        <form onSubmit={handleAudit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <label style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                                Enter Your Website URL (e.g. yourwebsite.com)
                            </label>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://yourstore.com"
                                    required
                                    disabled={loading}
                                    style={{
                                        flex: '1 1 300px',
                                        padding: '16px 20px',
                                        borderRadius: '14px',
                                        border: '1px solid var(--border-subtle)',
                                        background: 'var(--bg-base)',
                                        color: 'var(--text-primary)',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '16px 32px',
                                        borderRadius: '14px',
                                        background: 'linear-gradient(135deg, var(--accent-blue), #105963)',
                                        color: '#ffffff',
                                        fontSize: '16px',
                                        fontWeight: 800,
                                        border: 'none',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        boxShadow: '0 10px 24px rgba(20, 108, 120, 0.25)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw size={18} className="animate-spin" />
                                            Scanning Live...
                                        </>
                                    ) : (
                                        <>
                                            <Zap size={18} />
                                            Run Free Audit
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {error && (
                            <div style={{
                                marginTop: '20px',
                                padding: '14px 18px',
                                background: '#fee2e2',
                                color: '#991b1b',
                                borderRadius: '12px',
                                fontSize: '14.5px',
                                fontWeight: 700
                            }}>
                                ⚠️ {error}
                            </div>
                        )}
                    </div>

                    {/* Results Section */}
                    {result && (
                        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                            {/* Score Banner Card */}
                            <div style={{
                                background: '#ffffff',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '24px',
                                padding: '36px',
                                display: 'grid',
                                gridTemplateColumns: 'auto 1fr',
                                gap: '32px',
                                alignItems: 'center',
                                boxShadow: '0 18px 40px rgba(24, 32, 38, 0.06)'
                            }}>
                                <div style={{
                                    width: '130px',
                                    height: '130px',
                                    borderRadius: '50%',
                                    border: `8px solid ${getScoreColor(result.score)}`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'var(--bg-base)'
                                }}>
                                    <span style={{ fontSize: '38px', fontWeight: 900, color: getScoreColor(result.score), lineHeight: 1 }}>
                                        {result.score}
                                    </span>
                                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                        Score
                                    </span>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <Globe size={18} color="var(--accent-blue)" />
                                        <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                                            {result.url}
                                        </span>
                                    </div>
                                    <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: '15.5px', lineHeight: 1.6 }}>
                                        {result.summary}
                                    </p>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        <span style={{ padding: '6px 14px', borderRadius: '999px', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', fontSize: '13px', fontWeight: 800 }}>
                                            ⏱️ TTFB: {result.responseTimeMs}ms
                                        </span>
                                        <span style={{ padding: '6px 14px', borderRadius: '999px', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', fontSize: '13px', fontWeight: 800 }}>
                                            📦 Size: {result.pageSizeKb} KB
                                        </span>
                                        <span style={{ padding: '6px 14px', borderRadius: '999px', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', fontSize: '13px', fontWeight: 800 }}>
                                            ⚙️ {result.stack}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Key Performance Metrics Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                                <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '18px', padding: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: 'var(--accent-blue)' }}>
                                        <Server size={20} />
                                        <span style={{ fontWeight: 800, fontSize: '15px' }}>Server Latency</span>
                                    </div>
                                    <div style={{ fontSize: '26px', fontWeight: 900, color: result.responseTimeMs < 500 ? '#10b981' : '#ef4444' }}>
                                        {result.responseTimeMs} ms
                                    </div>
                                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                                        Target: &lt;200ms for global users
                                    </p>
                                </div>

                                <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '18px', padding: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: 'var(--accent-blue)' }}>
                                        <HardDrive size={20} />
                                        <span style={{ fontWeight: 800, fontSize: '15px' }}>HTML Payload</span>
                                    </div>
                                    <div style={{ fontSize: '26px', fontWeight: 900, color: result.pageSizeKb < 500 ? '#10b981' : '#f59e0b' }}>
                                        {result.pageSizeKb} KB
                                    </div>
                                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                                        Initial DOM document weight
                                    </p>
                                </div>

                                <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '18px', padding: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: 'var(--accent-blue)' }}>
                                        <Gauge size={20} />
                                        <span style={{ fontWeight: 800, fontSize: '15px' }}>Compression</span>
                                    </div>
                                    <div style={{ fontSize: '26px', fontWeight: 900, color: result.hasCompression ? '#10b981' : '#ef4444' }}>
                                        {result.hasCompression ? 'Brotli/Gzip Active' : 'Missing'}
                                    </div>
                                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                                        Over-the-wire asset compression
                                    </p>
                                </div>
                            </div>

                            {/* Bottlenecks / Issues List */}
                            {result.issues.length > 0 && (
                                <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '30px' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626' }}>
                                        <ShieldAlert size={22} />
                                        Detected Bottlenecks ({result.issues.length})
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        {result.issues.map((issue, idx) => (
                                            <div key={idx} style={{
                                                padding: '16px',
                                                borderRadius: '14px',
                                                background: issue.severity === 'high' ? 'rgba(239, 68, 68, 0.06)' : 'rgba(245, 158, 11, 0.06)',
                                                border: `1px solid ${issue.severity === 'high' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                                            }}>
                                                <div style={{ fontWeight: 800, fontSize: '15px', color: issue.severity === 'high' ? '#b91c1c' : '#b45309', marginBottom: '4px' }}>
                                                    {issue.title}
                                                </div>
                                                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                                                    {issue.desc}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Passed Checks */}
                            {result.passed.length > 0 && (
                                <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '30px' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px', color: '#059669' }}>
                                        <CheckCircle2 size={22} />
                                        Optimized Factors ({result.passed.length})
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {result.passed.map((pass, idx) => (
                                            <div key={idx} style={{
                                                padding: '14px 18px',
                                                borderRadius: '12px',
                                                background: 'rgba(16, 185, 129, 0.05)',
                                                border: '1px solid rgba(16, 185, 129, 0.15)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <span style={{ fontWeight: 800, fontSize: '14.5px', color: 'var(--text-primary)' }}>{pass.title}</span>
                                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{pass.desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Direct Action Conversion Card */}
                            <div style={{
                                background: 'linear-gradient(135deg, #182026 0%, #0d1217 100%)',
                                borderRadius: '24px',
                                padding: '40px',
                                color: '#ffffff',
                                textAlign: 'center',
                                boxShadow: '0 20px 48px rgba(24, 32, 38, 0.2)'
                            }}>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '6px 14px',
                                    borderRadius: '999px',
                                    background: 'rgba(20, 108, 120, 0.3)',
                                    color: '#5eead4',
                                    fontSize: '12.5px',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    marginBottom: '14px'
                                }}>
                                    Guaranteed 90+ Score Solution
                                </span>
                                <h3 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, margin: '0 0 14px' }}>
                                    Want OfficialUM1 Engineers to Fix These Bottlenecks?
                                </h3>
                                <p style={{ maxWidth: '640px', margin: '0 auto 28px', color: '#94a3b8', fontSize: '16.5px', lineHeight: 1.6 }}>
                                    We guarantee a 90+ Google Mobile PageSpeed Score, sub-1.5s load times, and Core Web Vitals pass in under 24 hours with zero downtime.
                                </p>
                                <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <Link
                                        href="/services/wordpress-speed-optimization"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '16px 32px',
                                            borderRadius: '999px',
                                            background: 'linear-gradient(135deg, var(--accent-blue), #14808e)',
                                            color: '#ffffff',
                                            fontWeight: 900,
                                            fontSize: '16px',
                                            textDecoration: 'none',
                                            boxShadow: '0 10px 24px rgba(20, 108, 120, 0.4)'
                                        }}
                                    >
                                        Claim 90+ Speed Optimization <ArrowRight size={18} />
                                    </Link>
                                    <Link
                                        href="/contact"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            padding: '16px 28px',
                                            borderRadius: '999px',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            color: '#ffffff',
                                            fontWeight: 800,
                                            fontSize: '16px',
                                            textDecoration: 'none',
                                            border: '1px solid rgba(255, 255, 255, 0.2)'
                                        }}
                                    >
                                        Consult with Engineer
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
