"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
// We can assume Navbar/Footer imports if needed, but for a "Delivery Page" often clean is better.
// But let's keep branding.
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
        <main style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />
            <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px', display: 'flex', justifyContent: 'center' }}>
                <div className="glass" style={{ padding: '3rem', borderRadius: '24px', maxWidth: '600px', width: '100%', border: '1px solid #00ff88' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                        <h1 className="text-gradient" style={{ fontSize: '2rem' }}>Your Order Details</h1>
                        <p style={{ color: '#aaa' }}>{order.itemName}</p>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '16px' }}>
                        {(order.details.extraInfo && order.details.extraInfo.includes('\n')) ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {order.details.extraInfo.split('\n').map((line: string, i: number) => {
                                    const isValue = line.trim().startsWith(':');
                                    return (
                                        <div key={i} style={{
                                            padding: isValue ? '1rem' : '0.5rem 0',
                                            background: isValue ? '#000' : 'transparent',
                                            color: isValue ? '#00ff88' : '#888',
                                            borderRadius: '8px',
                                            fontWeight: isValue ? 'bold' : 'normal',
                                            fontSize: isValue ? '1.1rem' : '0.9rem',
                                            userSelect: 'all',
                                            marginTop: isValue ? '0' : '0.5rem'
                                        }}>
                                            {isValue ? line.replace(/^:\s*/, '') : line}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>Login / Username</label>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', userSelect: 'all', background: '#000', padding: '1rem', borderRadius: '8px' }}>
                                        {order.details.username}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>Password</label>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', userSelect: 'all', background: '#000', padding: '1rem', borderRadius: '8px', color: '#00ff88' }}>
                                        {order.details.password}
                                    </div>
                                </div>

                                {order.details.email && (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>Email Access</label>
                                        <div style={{ fontSize: '1rem', userSelect: 'all', background: '#000', padding: '1rem', borderRadius: '8px' }}>
                                            {order.details.email}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {order.details.extraInfo && (
                            <div>
                                <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>Additional Notes</label>
                                <div style={{ fontSize: '1rem', fontStyle: 'italic', color: '#ccc', background: '#000', padding: '1rem', borderRadius: '8px' }}>
                                    {order.details.extraInfo}
                                </div>
                            </div>
                        )}

                        {order.proofImage && (
                            <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1.5rem' }}>
                                <label style={{ display: 'block', color: '#00ff88', marginBottom: '0.8rem', fontWeight: 'bold' }}>📸 Proof of Delivery</label>
                                <img
                                    src={order.proofImage}
                                    alt="Delivery Proof"
                                    style={{ width: '100%', borderRadius: '8px', border: '1px solid #333' }}
                                />
                            </div>
                        )}
                    </div>

                    <p style={{ textAlign: 'center', marginTop: '2rem', color: '#666', fontSize: '0.8rem' }}>
                        Ensure you save these details. This link is secure.
                        <br />
                        <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>Link Viewed: {order.views || 0} times</span>
                    </p>

                    {/* Review Section */}
                    <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', textAlign: 'center' }}>
                        {!reviewSubmitted ? (
                            <>
                                <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Rate Your Experience</h3>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            style={{
                                                fontSize: '2rem',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: star <= rating ? '#ffd700' : '#333',
                                                transition: 'color 0.2s'
                                            }}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    placeholder="Leave a comment (optional)..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid #333',
                                        borderRadius: '8px',
                                        padding: '1rem',
                                        color: '#fff',
                                        marginBottom: '1rem',
                                        minHeight: '80px',
                                        resize: 'none'
                                    }}
                                />
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={rating === 0}
                                    className="btn btn-primary"
                                    style={{
                                        width: '100%',
                                        opacity: rating === 0 ? 0.5 : 1,
                                        cursor: rating === 0 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Submit Review
                                </button>
                            </>
                        ) : (
                            <div style={{ padding: '2rem', background: 'rgba(0,255,136,0.1)', borderRadius: '16px', border: '1px solid #00ff88' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                                <h3 style={{ color: '#00ff88' }}>Thank You!</h3>
                                <p style={{ color: '#ccc' }}>Your feedback helps us improve.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
