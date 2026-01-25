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

    // Review State
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    const handleSubmitReview = async () => {
        if (rating === 0) return;
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: params?.token, rating, comment })
            });
            if (res.ok) {
                setReviewSubmitted(true);
            }
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (params?.token) {
            fetchOrder(params.token as string);
        }
    }, [params]);

    const fetchOrder = async (token: string) => {
        try {
            const res = await fetch(`/api/delivery/${token}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
            } else {
                setError('Invalid or Expired Link');
            }
        } catch (e) {
            setError('Failed to load order');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ background: '#050505', minHeight: '100vh', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;

    if (error) return (
        <main style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />
            <div style={{ paddingTop: '150px', textAlign: 'center' }}>
                <h1 style={{ color: '#ff4444' }}>{error}</h1>
            </div>
        </main>
    );

    return (
        <main style={{ minHeight: '100vh', background: '#050505', color: '#fff', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
            <Navbar />
            <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px', display: 'flex', justifyContent: 'center' }}>
                <div className="glass" style={{
                    padding: '0',
                    borderRadius: '12px',
                    maxWidth: '480px',
                    width: '100%',
                    border: '1px solid #222',
                    background: '#0a0a0a',
                    overflow: 'hidden'
                }}>
                    {/* Blue Top Border */}
                    <div style={{ height: '4px', width: '100%', background: '#3b82f6' }}></div>

                    <div style={{ padding: '2.5rem 2rem' }}>

                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <div style={{
                                width: '80px', height: '80px', background: '#3b82f6', borderRadius: '50%',
                                margin: '0 auto 1rem auto', display: 'flex', justifyContent: 'center', alignItems: 'center',
                                boxShadow: '0 4px 20px rgba(59,130,246,0.3)'
                            }}>
                                <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#09090b', fontFamily: 'sans-serif' }}>UM</span>
                            </div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.2rem', color: '#fff' }}>officialum1</h1>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>Secure Account Delivery</p>
                        </div>

                        {/* Item Details Card */}
                        <div style={{ background: '#111', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.3rem' }}>Item</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', lineHeight: '1.3' }}>{order.itemName}</div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.3rem' }}>Platform</div>
                                <div style={{ fontSize: '1rem', color: '#fff' }}>{order.details.platform || 'Direct'}</div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.3rem' }}>Delivered</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <span style={{ fontSize: '0.95rem' }}>{new Date(order.date || Date.now()).toLocaleDateString()}</span>
                                    <span style={{ background: '#222', color: '#ccc', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', border: '1px solid #333' }}>
                                        {Math.floor((Date.now() - new Date(order.date || Date.now()).getTime()) / (1000 * 60 * 60 * 24))} DAYS AGO
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Credentials Section */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Credentials</h3>

                            <div style={{
                                border: '1px dashed #333',
                                background: '#050505',
                                borderRadius: '8px',
                                padding: '1.5rem',
                                color: '#e5e5e5',
                                fontFamily: 'monospace',
                                fontSize: '0.95rem',
                                lineHeight: '1.8'
                            }}>
                                {(order.details.extraInfo && order.details.extraInfo.includes('\n')) ? (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        {/* Simple Monospace List Renderer */}
                                        {order.details.extraInfo.split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
                                            <div key={i} style={{ wordBreak: 'break-all' }}>{line}</div>
                                        ))}
                                    </div>
                                ) : (
                                    <div>
                                        {order.details.username && <div>Login Account: {order.details.username}</div>}
                                        {order.details.password && <div>Login Password: {order.details.password}</div>}
                                        {order.details.extraInfo && <div>{order.details.extraInfo}</div>}
                                    </div>
                                )}
                            </div>
                        </div>

                        <p style={{ color: '#444', fontSize: '0.8rem', textAlign: 'center' }}>
                            Please change the password immediately after logging in.
                        </p>

                        {/* Review Section */}
                        {!reviewSubmitted && (
                            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #222', textAlign: 'center' }}>
                                <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>How was your experience?</p>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button key={star} onClick={() => setRating(star)} style={{ fontSize: '1.8rem', background: 'none', border: 'none', cursor: 'pointer', color: star <= rating ? '#fff' : '#333' }}>★</button>
                                    ))}
                                </div>
                                {rating > 0 && (
                                    <>
                                        <textarea
                                            placeholder="Comment..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            style={{
                                                width: '100%',
                                                background: '#111',
                                                border: '1px solid #333',
                                                borderRadius: '8px',
                                                padding: '0.8rem',
                                                color: '#fff',
                                                marginBottom: '1rem',
                                                minHeight: '60px',
                                                resize: 'none',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                        <button onClick={handleSubmitReview} className="btn" style={{ width: '100%', background: '#fff', color: '#000', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                                            Submit Review
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                        {reviewSubmitted && (
                            <div style={{ marginTop: '3rem', textAlign: 'center', color: '#00ff88' }}>
                                ✓ Review Submitted
                            </div>
                        )}

                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
