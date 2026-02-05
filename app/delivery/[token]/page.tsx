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
    if (order.details?.items && Array.isArray(order.details.items)) {
        bulkAccounts = order.details.items.map((it: any) => ({
            ...it,
            raw: `${it.email ? it.email + ':' : ''}${it.user}:${it.pass}${it.extra ? ':' + it.extra : ''}`
        }));
    } else if (order.details?.accounts) {
        const rawAccounts = order.details.accounts.replace(/\(Bulk Imported\)/g, '').trim();
        const lines = rawAccounts.split('\n').filter((l: string) => l.trim());
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
                return { raw: line.trim() };
            }

            // Clean up: ensure no whitespace
            user = user.trim();
            pass = pass.trim();
            extra = extra.trim();
            email = email.trim();

            // Filter out header rows
            const lowLine = line.toLowerCase();
            if ((lowLine.includes('user') && lowLine.includes('pass')) ||
                (lowLine.includes('login') && lowLine.includes('password')) ||
                (lowLine.includes('mail') && lowLine.includes('username'))) {
                return null;
            }

            return { user, pass, email, extra, raw: line.trim() };
        }).filter(Boolean);
    }

    // Determine type: Single or Bulk
    const isBulk = bulkAccounts.length > 0;

    const downloadTxt = () => {
        const cleaned = order.details.accounts.replace(/\(Bulk Imported\)/g, '').trim();
        const blob = new Blob([cleaned], { type: 'text/plain' });
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
        <main style={{ minHeight: '100vh', background: '#020202', color: '#fff', fontFamily: "'Outfit', sans-serif", backgroundImage: 'radial-gradient(circle at 50% -20%, #1a1a1a 0%, #020202 60%)' }}>
            <Navbar />

            <div className="container" style={{ paddingTop: '140px', paddingBottom: '120px', maxWidth: '900px', margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>

                {/* Secure Header */}
                <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="fade-in">
                    <div style={{
                        width: '80px', height: '80px', background: 'rgba(0,255,136,0.05)', borderRadius: '24px',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 2rem auto',
                        border: '1px solid rgba(0,255,136,0.2)', boxShadow: '0 20px 40px rgba(0,255,136,0.1)',
                        transform: 'rotate(-5deg)'
                    }}>
                        <span style={{ fontSize: '2rem' }}>💎</span>
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-1px', background: 'linear-gradient(to bottom, #fff 0%, #888 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Premium Delivery
                    </h1>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem' }}>
                        <span style={{ color: '#444', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '2px' }}>Authentication ID:</span>
                        <span style={{ fontFamily: 'monospace', color: '#00ff88', background: 'rgba(0,255,136,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                            {order.orderId ? order.orderId.slice(-8).toUpperCase() : 'SECURE_TRANS'}
                        </span>
                    </div>
                </div>

                {/* Main Premium Card */}
                <div className="premium-card" style={{
                    borderRadius: '32px',
                    padding: '0',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.05)',
                    background: 'rgba(10,10,10,0.4)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
                }}>
                    <div style={{ height: '4px', width: '100%', background: 'linear-gradient(90deg, #00ff88, #00c3ff, #00ff88)', backgroundSize: '200% 100%', animation: 'shimmer 3s linear infinite' }}></div>

                    <div style={{ padding: '4rem 3rem' }}>

                        {/* Product Info Reveal */}
                        <div style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                    <div style={{ width: '8px', height: '8px', background: '#00ff88', borderRadius: '50%', boxShadow: '0 0 10px #00ff88' }}></div>
                                    <h2 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#00ff88', letterSpacing: '3px', fontWeight: '700' }}>Order Confirmed</h2>
                                </div>
                                <h3 style={{ fontSize: '2.8rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px', marginBottom: '1.5rem' }}>{order.itemName}</h3>
                                <div style={{ display: 'flex', gap: '0.8rem' }}>
                                    <span className="premium-badge">🛡️ Encrypted Access</span>
                                    <span className="premium-badge">⚡ Lifetime Warranty</span>
                                </div>
                            </div>

                            {revealed && isBulk && (
                                <div className="fade-in" style={{ display: 'flex', gap: '0.8rem', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <button onClick={downloadTxt} className="action-btn">.TXT</button>
                                    <button onClick={downloadCsv} className="action-btn">.CSV</button>
                                    <button onClick={handleCopyAll} className="copy-all-btn">Copy All Items</button>
                                </div>
                            )}
                        </div>

                        {/* Credentials Reveal Section */}
                        <div style={{ position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', margin: 0 }}>
                                    Your Credentials
                                </h4>
                                {revealed && <span style={{ fontSize: '0.75rem', color: '#444' }}>SECURELY DECRYPTED</span>}
                            </div>

                            {!revealed ? (
                                <div style={{
                                    background: 'linear-gradient(145deg, rgba(255,255,255,0.01), rgba(0,0,0,0.2))',
                                    borderRadius: '24px',
                                    padding: '6rem 2rem',
                                    textAlign: 'center',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.01) 10px, rgba(255,255,255,0.01) 20px)' }}></div>
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.2))' }}>💠</div>
                                        <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.8rem', fontWeight: '700' }}>Locked Information</h3>
                                        <p style={{ color: '#666', marginBottom: '3rem', fontSize: '1rem', maxWidth: '450px', margin: '0 auto 3rem auto', lineHeight: '1.6' }}>
                                            The credentials for your purchase have been generated. Click below to initiate secure decryption.
                                        </p>
                                        <button
                                            onClick={() => setRevealed(true)}
                                            className="main-reveal-btn"
                                        >
                                            REVEAL DETAILS
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="fade-in-scale">
                                    {isBulk ? (
                                        <div className="premium-table-container">
                                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', textAlign: 'left' }}>
                                                <thead>
                                                    <tr style={{ fontSize: '0.7rem', color: '#444', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                                        <th style={{ padding: '0 1.5rem' }}>ID</th>
                                                        {bulkAccounts.some(a => a.email) && <th style={{ padding: '0 1.5rem' }}>Email Address</th>}
                                                        <th style={{ padding: '0 1.5rem' }}>Login Name</th>
                                                        <th style={{ padding: '0 1.5rem' }}>Security Password</th>
                                                        <th style={{ padding: '0 1.5rem', textAlign: 'right' }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {bulkAccounts.map((acc: any, i: number) => (
                                                        <tr key={i} className="row-item">
                                                            <td style={{ padding: '1.2rem 1.5rem', color: '#333', fontSize: '0.8rem' }}>{i + 1}</td>
                                                            {bulkAccounts.some(a => a.email) && (
                                                                <td style={{ padding: '1.2rem 1.5rem' }}>
                                                                    <div style={{ color: '#00ff88', fontFamily: 'monospace', fontWeight: '600' }}>{acc.email || '---'}</div>
                                                                </td>
                                                            )}
                                                            <td style={{ padding: '1.2rem 1.5rem' }}>
                                                                <div style={{ color: '#fff', fontFamily: 'monospace', fontSize: '1rem' }}>{acc.user || acc.raw}</div>
                                                            </td>
                                                            <td style={{ padding: '1.2rem 1.5rem' }}>
                                                                <div style={{ color: '#888', fontFamily: 'monospace' }}>••••••••</div>
                                                            </td>
                                                            <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                                                                <button
                                                                    onClick={() => handleCopy(acc.raw || `${acc.user}:${acc.pass}${acc.email ? `:${acc.email}` : ''}`, i)}
                                                                    className="mini-copy-btn"
                                                                    style={{
                                                                        background: copiedIndex === i ? '#00ff88' : 'rgba(255,255,255,0.05)',
                                                                        color: copiedIndex === i ? '#000' : '#fff'
                                                                    }}
                                                                >
                                                                    {copiedIndex === i ? 'Done' : 'Copy'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gap: '2rem' }}>
                                            {order.details.extraInfo ? (
                                                <div className="credential-field" style={{ animation: 'fadeIn 0.8s ease-out' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                                                        <label style={{ fontSize: '0.75rem', color: '#444', letterSpacing: '3px', fontWeight: '800', textTransform: 'uppercase' }}>Access Intelligence</label>
                                                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                                                            <span style={{ fontSize: '0.65rem', color: '#00ff88', background: 'rgba(0,255,136,0.05)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(0,255,136,0.1)' }}>PREMIUM DATA</span>
                                                            <button
                                                                onClick={() => handleCopy(order.details.extraInfo, 101)}
                                                                className="mini-copy-btn"
                                                                style={{
                                                                    background: copiedIndex === 101 ? '#00ff88' : 'rgba(255,255,255,0.05)',
                                                                    color: copiedIndex === 101 ? '#000' : '#fff',
                                                                    padding: '4px 15px',
                                                                    borderRadius: '20px'
                                                                }}
                                                            >
                                                                {copiedIndex === 101 ? 'Copied!' : 'Copy All Details'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(0,0,0,0.4))',
                                                        borderRadius: '28px',
                                                        padding: '2.5rem',
                                                        fontSize: '1.05rem',
                                                        color: '#00ff88',
                                                        border: '1px solid rgba(255,255,255,0.05)',
                                                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                                        lineHeight: '1.8',
                                                        whiteSpace: 'pre-wrap',
                                                        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)',
                                                        position: 'relative',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div style={{ position: 'absolute', top: 0, right: 0, padding: '10px', opacity: 0.05, fontSize: '4rem', pointerEvents: 'none' }}>🔐</div>
                                                        {order.details.extraInfo}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                                    {order.details.username && (
                                                        <div className="credential-field">
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                                <label style={{ fontSize: '0.7rem', color: '#444', letterSpacing: '2px', fontWeight: '700', textTransform: 'uppercase' }}>Account / Mail</label>
                                                                <span style={{ fontSize: '0.65rem', color: '#00ff88', background: 'rgba(0,255,136,0.05)', padding: '2px 8px', borderRadius: '4px' }}>VERIFIED USER</span>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                <div style={{ flex: 1, padding: '1rem', fontSize: '1.1rem', fontFamily: 'monospace', color: '#00ff88', letterSpacing: '0.5px' }}>
                                                                    {order.details.username}
                                                                </div>
                                                                <button onClick={() => handleCopy(order.details.username, 99)} className="premium-copy-btn">
                                                                    {copiedIndex === 99 ? 'Copied' : 'Copy'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {order.details.password && (
                                                        <div className="credential-field">
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                                <label style={{ fontSize: '0.7rem', color: '#444', letterSpacing: '2px', fontWeight: '700', textTransform: 'uppercase' }}>Security Key</label>
                                                                <span style={{ fontSize: '0.65rem', color: '#aaa' }}>ENCRYPTED PASS</span>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                <div style={{ flex: 1, padding: '1rem', fontSize: '1.1rem', fontFamily: 'monospace', color: '#fff', letterSpacing: '2px' }}>
                                                                    {order.details.password}
                                                                </div>
                                                                <button onClick={() => handleCopy(order.details.password, 100)} className="premium-copy-btn">
                                                                    {copiedIndex === 100 ? 'Copied' : 'Copy'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer Summary */}
                        <div className="summary-grid" style={{ marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                            <div>
                                <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: '700', marginBottom: '0.8rem' }}>Excellence Guaranteed</h4>
                                <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: '1.6' }}>Our systems ensure 24/7 uptime and instant delivery for all premium assets. If you encounter any technical difficulty, please reach out.</p>
                                <a href="/support" className="support-link">Initiate Support Protocol →</a>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: '700', marginBottom: '0.8rem' }}>Transaction Date</h4>
                                <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#888' }}>
                                    {new Date(order.date || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Review Section */}
                {revealed && !reviewSubmitted && (
                    <div className="premium-card fade-in" style={{ marginTop: '3rem', padding: '3rem', borderRadius: '32px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem', letterSpacing: '-0.5px' }}>Rate Experience</h3>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginBottom: '2.5rem' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    style={{
                                        fontSize: '2.5rem',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: star <= rating ? '#00ff88' : '#1a1a1a',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        transform: star === rating ? 'scale(1.2)' : 'scale(1)',
                                        filter: star <= rating ? 'drop-shadow(0 0 10px rgba(0,255,136,0.3))' : 'none'
                                    }}
                                >✦</button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <div className="fade-in">
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Leave a protocol note (optional)..."
                                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '1.5rem', color: '#fff', minHeight: '120px', marginBottom: '1.5rem', resize: 'none', fontSize: '1rem', fontFamily: 'inherit' }}
                                />
                                <button onClick={handleSubmitReview} className="submit-feedback-btn">
                                    TRANSMIT FEEDBACK
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {reviewSubmitted && (
                    <div style={{ marginTop: '3rem', textAlign: 'center', color: '#00ff88', padding: '3rem', background: 'rgba(0,255,136,0.03)', borderRadius: '32px', border: '1px solid rgba(0,255,136,0.1)' }} className="fade-in">
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🌑</span>
                        <div style={{ fontWeight: '800', fontSize: '1.5rem' }}>Transmission Successful</div>
                        <p style={{ color: '#444', marginTop: '0.5rem' }}>Your feedback has been integrated into our system.</p>
                    </div>
                )}

            </div>
            <Footer />

            <style jsx>{`
                .container { perspective: 1000px; }
                .premium-badge { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 0.6rem 1rem; borderRadius: 12px; fontSize: 0.75rem; color: #888; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
                .copy-all-btn { background: #fff; color: #000; border: none; padding: 0.8rem 1.5rem; borderRadius: 12px; cursor: pointer; font-weight: 800; fontSize: 0.8rem; transition: all 0.3s; text-transform: uppercase; letter-spacing: 1px; }
                .copy-all-btn:hover { background: #00ff88; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,255,136,0.2); }
                .action-btn { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #888; padding: 0.8rem 1.2rem; borderRadius: 12px; cursor: pointer; transition: all 0.3s; font-weight: 700; fontSize: 0.75rem; }
                .action-btn:hover { background: rgba(255,255,255,0.05); color: #fff; border-color: #fff; }
                .main-reveal-btn { padding: 1.5rem 4rem; font-size: 1.2rem; border-radius: 20px; border: none; background: #fff; color: #000; font-weight: 900; cursor: pointer; transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); box-shadow: 0 20px 40px rgba(255,255,255,0.15); letter-spacing: 2px; }
                .main-reveal-btn:hover { transform: translateY(-5px) scale(1.02); background: #00ff88; box-shadow: 0 30px 60px rgba(0,255,136,0.3); }
                .premium-copy-btn { background: #fff; color: #000; border: none; padding: 0 2rem; borderRadius: 16px; cursor: pointer; transition: all 0.3s; font-weight: 800; font-size: 0.85rem; text-transform: uppercase; }
                .premium-copy-btn:hover { background: #00ff88; transform: scale(1.05); }
                .mini-copy-btn { border: none; borderRadius: 10px; padding: 0.5rem 1rem; cursor: pointer; transition: all 0.2s; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
                .row-item { transition: all 0.3s; }
                .row-item:hover { background: rgba(255,255,255,0.02); }
                .support-link { color: #00ff88; font-size: 0.9rem; text-decoration: none; display: inline-block; margin-top: 1rem; font-weight: 700; transition: all 0.3s; }
                .support-link:hover { padding-left: 10px; color: #fff; }
                .submit-feedback-btn { width: 100%; padding: 1.5rem; font-size: 1rem; background: #fff; color: #000; border: none; borderRadius: 20px; font-weight: 900; cursor: pointer; transition: all 0.3s; letter-spacing: 2px; }
                .submit-feedback-btn:hover { background: #00ff88; transform: translateY(-3px); box-shadow: 0 15px 30px rgba(0,255,136,0.2); }
                
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                .fade-in { animation: fadeIn 0.8s ease-out; }
                .fade-in-scale { animation: fadeInScale 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                
                .premium-table-container { overflow-x: auto; width: 100%; -webkit-overflow-scrolling: touch; }
                .premium-table-container::-webkit-scrollbar { height: 4px; }
                .premium-table-container::-webkit-scrollbar-track { background: transparent; }
                .premium-table-container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

                @media (max-width: 768px) {
                    .container { padding-top: 100px !important; padding-bottom: 60px !important; }
                    h1 { font-size: 2.2rem !important; }
                    h3 { font-size: 2rem !important; }
                    .premium-card { border-radius: 20px !important; }
                    .premium-card > div:nth-child(2) { padding: 2.5rem 1.5rem !important; }
                    .main-reveal-btn { padding: 1.2rem 2.5rem !important; font-size: 1rem !important; width: 100%; }
                    .premium-table-container table { min-width: 600px; }
                    .submit-feedback-btn { padding: 1.2rem !important; font-size: 0.9rem !important; }
                    .credential-field div:nth-child(2) { padding: 1.5rem !important; font-size: 0.9rem !important; }
                    .premium-copy-btn { padding: 0 1.2rem !important; font-size: 0.75rem !important; }
                    .summary-grid { grid-template-columns: 1fr !important; gap: 2rem !important; text-align: left !important; }
                    .summary-grid div:nth-child(2) { text-align: left !important; }
                }

                @media (max-width: 480px) {
                    h1 { font-size: 1.8rem !important; }
                    h3 { font-size: 1.5rem !important; }
                    .premium-badge { padding: 0.4rem 0.8rem !important; font-size: 0.65rem !important; }
                }
            `}</style>
        </main>
    );
}
