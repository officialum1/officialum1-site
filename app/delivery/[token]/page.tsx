"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function DeliveryPage() {
    const params = useParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [revealed, setRevealed] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    // Review State
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    useEffect(() => {
        if (params?.token) fetchOrder(params.token as string);
    }, [params]);

    const fetchOrder = async (token: string) => {
        try {
            const res = await fetch(`/api/delivery/${token}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
            } else {
                setError('Link Expired or Invalid');
            }
        } catch (e) { setError('Failed to load order'); }
        finally { setLoading(false); }
    };

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleCopyAll = () => {
        if (!order?.details?.accounts) return;
        navigator.clipboard.writeText(order.details.accounts);
        alert('All Credentials Copied to Clipboard!');
    };

    const handleSubmitReview = async () => {
        if (rating === 0) return;
        try {
            await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: params?.token, rating, comment })
            });
            setReviewSubmitted(true);
        } catch (e) { console.error(e); }
    };

    if (loading) return <div className="loading-screen"><div className="loader"></div></div>;

    if (error) return (
        <main className="main-container">
            <Navbar />
            <div className="error-container">
                <h1>⚠️</h1>
                <h2>{error}</h2>
                <p>Please contact support if you believe this is an error.</p>
            </div>
            <style jsx>{`
                .main-container { min-height: 100vh; background: #050505; color: #fff; }
                .error-container { padding-top: 150px; text-align: center; }
                h1 { font-size: 4rem; margin-bottom: 1rem; }
                h2 { color: #ff4444; margin-bottom: 1rem; }
                p { color: #888; }
            `}</style>
        </main>
    );

    // Parsing Bulk Accounts if they exist
    let bulkAccounts: any[] = [];
    if (order.details?.accounts) {
        const lines = order.details.accounts.split('\n').filter((l: string) => l.trim());
        bulkAccounts = lines.map((line: string) => {
            let user = '', pass = '', email = '', extra = '';

            // SMART PARSING
            const separators = ['\t', ':', '|', ','];
            let parts: string[] = [line];
            for (const sep of separators) {
                if (line.includes(sep)) {
                    parts = line.split(sep);
                    break;
                }
            }

            if (parts.length >= 2) {
                // Heuristic: If one looks like an email, it's email.
                const emailIdx = parts.findIndex(p => p.includes('@'));
                if (emailIdx !== -1) {
                    email = parts[emailIdx].trim();
                    const others = parts.filter((_, idx) => idx !== emailIdx);
                    user = others[0]?.trim() || '';
                    pass = others[1]?.trim() || '';
                    extra = others.slice(2).join(' ').trim();
                } else {
                    user = parts[0].trim();
                    pass = parts[1].trim();
                    extra = parts.slice(2).join(' ').trim();
                }
            } else {
                return { raw: line.replace('(Bulk Imported)', '').trim() };
            }

            // Clean up: remove "Bulk Imported" tag from data
            user = user.replace('(Bulk Imported)', '').trim();
            pass = pass.replace('(Bulk Imported)', '').trim();
            extra = extra.replace('(Bulk Imported)', '').trim();
            email = email.replace('(Bulk Imported)', '').trim();

            // Filter out header rows
            const lowLine = line.toLowerCase();
            if ((lowLine.includes('user') && lowLine.includes('pass')) ||
                (lowLine.includes('login') && lowLine.includes('password')) ||
                (lowLine.includes('mail') && lowLine.includes('username'))) {
                return null;
            }

            return { user, pass, email, extra };
        }).filter(Boolean);
    }

    // Determine type: Single or Bulk
    const isBulk = bulkAccounts.length > 0;

    const downloadTxt = () => {
        const blob = new Blob([order.details.accounts], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `order_${order.orderId || 'delivery'}.txt`;
        a.click();
    };

    const downloadCsv = () => {
        const headers = ["Email", "Username", "Password", "Extra"];
        const rows = bulkAccounts.map(a => [a.email || '', a.user || '', a.pass || '', a.extra || '']);
        const content = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `order_${order.orderId || 'delivery'}.csv`;
        a.click();
    };

    return (
        <main style={{ minHeight: '100vh', background: '#050505', color: '#fff', fontFamily: "'Outfit', sans-serif" }}>
            <Navbar />
            <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px', maxWidth: '800px', margin: '0 auto', paddingLeft: '1rem', paddingRight: '1rem' }}>

                {/* Secure Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        width: '60px', height: '60px', background: 'rgba(0,255,136,0.1)', borderRadius: '50%',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 1.5rem auto',
                        border: '1px solid #00ff88', boxShadow: '0 0 20px rgba(0,255,136,0.2)'
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>🔒</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Secure Delivery
                    </h1>
                    <p style={{ color: '#666' }}>Order ID: <span style={{ fontFamily: 'monospace', color: '#fff' }}>#{order.orderId ? order.orderId.slice(-6).toUpperCase() : 'N/A'}</span></p>
                </div>

                {/* Main Card */}
                <div className="glass" style={{
                    borderRadius: '24px',
                    padding: '0',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: '#0a0a0a'
                }}>
                    {/* Abstract Top Banner */}
                    <div style={{ height: '8px', width: '100%', background: 'linear-gradient(90deg, #00ff88, #00c3ff)' }}></div>

                    <div style={{ padding: '3rem 2rem' }}>

                        {/* Product Info */}
                        <div style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h2 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#666', letterSpacing: '2px', marginBottom: '0.5rem' }}>Purchased Item</h2>
                                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{order.itemName}</h3>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <span className="badge">✅ Verified Purchase</span>
                                    <span className="badge">⚡ Instant Delivery</span>
                                </div>
                            </div>

                            {revealed && isBulk && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={downloadTxt} className="btn-secondary" style={{ fontSize: '0.8rem' }}>💾 .TXT</button>
                                    <button onClick={downloadCsv} className="btn-secondary" style={{ fontSize: '0.8rem' }}>📊 .CSV</button>
                                    <button onClick={handleCopyAll} className="btn-primary-small">📋 Copy All</button>
                                </div>
                            )}
                        </div>

                        {/* Credentials Reveal Section */}
                        <div style={{ position: 'relative' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#fff' }}>
                                Account Details
                            </h4>

                            {!revealed ? (
                                <div style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '16px',
                                    padding: '5rem 2rem',
                                    textAlign: 'center',
                                    border: '1px dashed #333',
                                    backdropFilter: 'blur(15px)'
                                }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👁️</div>
                                    <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.5rem' }}>Encrypted Content</h3>
                                    <p style={{ color: '#666', marginBottom: '2.5rem', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto 2.5rem auto' }}>
                                        To maintain privacy, details are hidden by default. Click reveal to view your credentials.
                                    </p>
                                    <button
                                        onClick={() => setRevealed(true)}
                                        className="btn-reveal"
                                    >
                                        Reveal Credentials
                                    </button>
                                </div>
                            ) : (
                                <div className="fade-in-up">
                                    {isBulk ? (
                                        // PROFESSIONAL TABLE VIEW
                                        <div className="table-container" style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                                                <thead>
                                                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                        <th style={{ padding: '1.2rem', color: '#888', fontWeight: '500' }}>#</th>
                                                        {(bulkAccounts[0]?.email || bulkAccounts[1]?.email) && <th style={{ padding: '1.2rem', color: '#888', fontWeight: '500' }}>Login / Email</th>}
                                                        <th style={{ padding: '1.2rem', color: '#888', fontWeight: '500' }}>Username</th>
                                                        <th style={{ padding: '1.2rem', color: '#888', fontWeight: '500' }}>Password</th>
                                                        <th style={{ padding: '1.2rem', color: '#888', fontWeight: '500' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {bulkAccounts.map((acc: any, i: number) => (
                                                        <tr key={i} className="table-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                            <td style={{ padding: '1rem 1.2rem', color: '#444' }}>{i + 1}</td>
                                                            {(acc.email || bulkAccounts[0]?.email || bulkAccounts[1]?.email) && (
                                                                <td style={{ padding: '1rem 1.2rem', fontFamily: 'monospace', color: '#00ff88' }}>{acc.email || ''}</td>
                                                            )}
                                                            <td style={{ padding: '1rem 1.2rem', fontFamily: 'monospace' }}>{acc.user || acc.raw}</td>
                                                            <td style={{ padding: '1rem 1.2rem', fontFamily: 'monospace', color: '#ccc' }}>{acc.pass || '---'}</td>
                                                            <td style={{ padding: '1rem 1.2rem' }}>
                                                                <button
                                                                    onClick={() => handleCopy(`${acc.user || acc.raw}:${acc.pass || ''}${acc.email ? `:${acc.email}` : ''}`, i)}
                                                                    className="btn-row-copy"
                                                                    style={{
                                                                        background: copiedIndex === i ? '#00ff88' : 'rgba(255,255,255,0.05)',
                                                                        color: copiedIndex === i ? '#000' : '#fff'
                                                                    }}
                                                                >
                                                                    {copiedIndex === i ? 'Copied' : 'Copy'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        // SINGLE ITEM VIEW
                                        <div style={{ background: '#0c0c0c', borderRadius: '16px', padding: '2.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            {order.details.username && (
                                                <div style={{ marginBottom: '2rem' }}>
                                                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#555', marginBottom: '0.8rem', letterSpacing: '1px', fontWeight: '600' }}>LOGIN IDENTIFIER</label>
                                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                                        <input readOnly value={order.details.username} style={{ flex: 1, background: '#030303', border: '1px solid #1a1a1a', color: '#00ff88', padding: '1.2rem', borderRadius: '12px', fontSize: '1.2rem', fontFamily: 'monospace' }} />
                                                        <button onClick={() => handleCopy(order.details.username, 99)} className="btn-copy">Copy</button>
                                                    </div>
                                                </div>
                                            )}

                                            {order.details.password && (
                                                <div style={{ marginBottom: '2rem' }}>
                                                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#555', marginBottom: '0.8rem', letterSpacing: '1px', fontWeight: '600' }}>SYSTEM PASSWORD</label>
                                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                                        <input readOnly value={order.details.password} style={{ flex: 1, background: '#030303', border: '1px solid #1a1a1a', color: '#fff', padding: '1.2rem', borderRadius: '12px', fontSize: '1.2rem', fontFamily: 'monospace' }} />
                                                        <button onClick={() => handleCopy(order.details.password, 100)} className="btn-copy">Copy</button>
                                                    </div>
                                                </div>
                                            )}

                                            {order.details.extraInfo && (
                                                <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', fontSize: '0.95rem', color: '#888', border: '1px solid rgba(255,255,255,0.03)', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                                    <div style={{ color: '#555', marginBottom: '0.5rem', fontSize: '0.7rem', fontWeight: 'bold' }}>ADDITIONAL NOTES</div>
                                                    {order.details.extraInfo}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Order Summary & Support */}
                        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>Need Help?</h4>
                                <p style={{ fontSize: '0.9rem', color: '#666' }}>Contact our support team if you have issues logging in.</p>
                                <a href="/support" style={{ color: '#00ff88', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem' }}>Contact Support →</a>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>Date</h4>
                                <p style={{ fontSize: '0.9rem', color: '#666' }}>{new Date(order.date || Date.now()).toLocaleDateString()}</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Review Section */}
                {revealed && !reviewSubmitted && (
                    <div className="glass" style={{ marginTop: '2rem', padding: '2rem', borderRadius: '16px', border: '1px solid #222', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Rate your experience</h3>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    style={{
                                        fontSize: '2rem',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: star <= rating ? '#ffc107' : '#333',
                                        transition: 'all 0.2s'
                                    }}
                                >★</button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <div className="fade-in-up">
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Leave a comment (optional)..."
                                    style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '1rem', color: '#fff', minHeight: '80px', marginBottom: '1rem', resize: 'none' }}
                                />
                                <button onClick={handleSubmitReview} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    Submit Feedback
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {reviewSubmitted && (
                    <div style={{ marginTop: '2rem', textAlign: 'center', color: '#00ff88', padding: '2rem', background: 'rgba(0,255,136,0.05)', borderRadius: '16px', border: '1px solid rgba(0,255,136,0.1)' }}>
                        <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🎉</span>
                        Feedback Received! Thank you.
                    </div>
                )}

            </div>
            <Footer />

            <style jsx>{`
                .glass { background: #0a0a0a; backdrop-filter: blur(10px); }
                .badge { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 0.4rem 0.8rem; borderRadius: 20px; fontSize: 0.75rem; color: #888; font-weight: 600; letter-spacing: 1px; }
                .btn-copy { background: #111; color: #fff; border: 1px solid #222; padding: 0 1.5rem; borderRadius: 12px; cursor: pointer; transition: all 0.2s; font-weight: 600; }
                .btn-copy:hover { background: #222; border-color: #333; }
                .btn-reveal { padding: 1.2rem 3rem; font-size: 1.1rem; border-radius: 50px; border: none; background: #fff; color: #000; font-weight: bold; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 30px rgba(255,255,255,0.2); }
                .btn-reveal:hover { transform: scale(1.05); box-shadow: 0 0 50px rgba(255,255,255,0.4); }
                .btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.6rem 1rem; borderRadius: 10px; cursor: pointer; transition: all 0.2s; font-weight: 500; }
                .btn-secondary:hover { background: rgba(255,255,255,0.1); }
                .btn-primary-small { background: #fff; color: #000; border: none; padding: 0.6rem 1.2rem; borderRadius: 10px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
                .btn-primary-small:hover { background: #00ff88; transform: translateY(-2px); }
                .btn-row-copy { border: none; borderRadius: 8px; padding: 0.4rem 0.8rem; cursor: pointer; transition: all 0.2s; font-size: 0.8rem; font-weight: 600; }
                .table-row:hover { background: rgba(255,255,255,0.01); }
                .fade-in-up { animation: fadeInUp 0.5s ease-out; }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </main>
    );
}
