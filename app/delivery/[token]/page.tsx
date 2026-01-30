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
        bulkAccounts = order.details.accounts.split('\n').filter((l: string) => l.trim()).map((line: string) => {
            // Try to parse User:Pass format
            if (line.includes(':')) {
                const parts = line.split(':');
                return { user: parts[0], pass: parts[1], extra: parts.slice(2).join(':') };
            }
            return { raw: line };
        });
    }

    // Determine type: Single or Bulk
    const isBulk = bulkAccounts.length > 0;

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
                        <div style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1rem', textTransform: 'uppercase', color: '#666', letterSpacing: '1px', marginBottom: '0.5rem' }}>Purchased Item</h2>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' }}>{order.itemName}</h3>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <span className="badge">✅ Verified Purchase</span>
                                <span className="badge">⚡ Instant Delivery</span>
                            </div>
                        </div>

                        {/* Credentials Reveal Section */}
                        <div style={{ position: 'relative' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Credentials</span>
                                {revealed && isBulk && (
                                    <button onClick={handleCopyAll} style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>
                                        📋 Copy All
                                    </button>
                                )}
                            </h2>

                            {!revealed ? (
                                <div style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '16px',
                                    padding: '4rem 2rem',
                                    textAlign: 'center',
                                    border: '1px dashed #333',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    <h3 style={{ marginBottom: '1rem', color: '#ccc' }}>Hidden for Security</h3>
                                    <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.9rem' }}>Click below to reveal your purchase details securely.</p>
                                    <button
                                        onClick={() => setRevealed(true)}
                                        className="btn-primary-glow"
                                        style={{
                                            padding: '1rem 3rem',
                                            fontSize: '1.1rem',
                                            borderRadius: '50px',
                                            border: 'none',
                                            background: '#fff',
                                            color: '#000',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            boxShadow: '0 0 20px rgba(255,255,255,0.3)'
                                        }}
                                    >
                                        Reveal Data
                                    </button>
                                </div>
                            ) : (
                                <div className="fade-in-up">
                                    {isBulk ? (
                                        // BULK VIEW
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                            {bulkAccounts.map((acc: any, i: number) => (
                                                <div key={i} style={{
                                                    background: 'rgba(0,0,0,0.5)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    padding: '1rem',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <div style={{ fontFamily: 'monospace', fontSize: '1rem', color: '#00ff88', overflowX: 'auto' }}>
                                                        {acc.user ? (
                                                            <span>
                                                                <span style={{ color: '#fff' }}>{acc.user}</span>
                                                                <span style={{ color: '#666' }}>:</span>
                                                                <span style={{ color: '#ccc' }}>{acc.pass}</span>
                                                                {acc.extra && <span style={{ color: '#888' }}> | {acc.extra}</span>}
                                                            </span>
                                                        ) : (
                                                            <span>{acc.raw}</span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleCopy(acc.user ? `${acc.user}:${acc.pass}` : acc.raw, i)}
                                                        style={{
                                                            background: copiedIndex === i ? '#00ff88' : 'rgba(255,255,255,0.1)',
                                                            color: copiedIndex === i ? '#000' : '#fff',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            padding: '0.5rem 0.8rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {copiedIndex === i ? 'Copied!' : 'Copy'}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        // SINGLE ITEM VIEW
                                        <div style={{ background: '#111', borderRadius: '16px', padding: '2rem', border: '1px solid #333' }}>
                                            {order.details.username && (
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>USERNAME / EMAIL</label>
                                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                                        <input readOnly value={order.details.username} style={{ flex: 1, background: '#000', border: '1px solid #333', color: '#fff', padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', fontFamily: 'monospace' }} />
                                                        <button onClick={() => handleCopy(order.details.username, 99)} className="btn-copy">Copy</button>
                                                    </div>
                                                </div>
                                            )}

                                            {order.details.password && (
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>PASSWORD</label>
                                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                                        <input readOnly value={order.details.password} style={{ flex: 1, background: '#000', border: '1px solid #333', color: '#fff', padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', fontFamily: 'monospace' }} />
                                                        <button onClick={() => handleCopy(order.details.password, 100)} className="btn-copy">Copy</button>
                                                    </div>
                                                </div>
                                            )}

                                            {order.details.extraInfo && (
                                                <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.9rem', color: '#ccc', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
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
                                <a href="/contact" style={{ color: '#00ff88', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem' }}>Contact Support →</a>
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
                .badge { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 0.4rem 0.8rem; borderRadius: 20px; fontSize: 0.8rem; color: #ccc; }
                .btn-copy { background: #222; color: #fff; border: 1px solid #333; padding: 0 1.5rem; borderRadius: 8px; cursor: pointer; transition: all 0.2s; }
                .btn-copy:hover { background: #333; border-color: #444; }
                .fade-in-up { animation: fadeInUp 0.5s ease-out; }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </main>
    );
}
