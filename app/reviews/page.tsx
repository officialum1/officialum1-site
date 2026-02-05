"use client";

import Link from 'next/link';
import LiveCount from '@/components/LiveCount';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalReviews: 2450, avgRating: 4.9, totalOrders: 2400 });
    const [name, setName] = useState('');
    const [service, setService] = useState('Reddit Account');
    const [review, setReview] = useState('');
    const [rating, setRating] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchGlobalData = async () => {
        try {
            const res = await fetch('/api/reviews/global');
            const data = await res.json();
            if (data.reviews) setReviews(data.reviews);
            if (data.stats) setStats(data.stats);
        } catch (e) {
            console.error("Failed to fetch live reviews", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGlobalData();
        // 2 Second Polling for Live Data
        const interval = setInterval(fetchGlobalData, 2000);
        return () => clearInterval(interval);
    }, []);

    const anonymize = (val: string) => {
        if (!val) return 'Verified Buyer';
        // Handle IDs like 'gen_xxx' or emails
        const namePart = val.includes('@') ? val.split('@')[0] : val.replace('gen_', '').replace('admin_gen_', '');
        if (namePart.length <= 3) return namePart + "**";
        return namePart.substring(0, 3) + "**";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/testimonials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    role: 'Buyer - ' + service,
                    review,
                    rating
                })
            });
            if (res.ok) {
                alert('Review Submitted! It will appear after moderation.');
                setName('');
                setReview('');
                setRating(5);
                fetchGlobalData();
            } else {
                alert('Failed to submit review');
            }
        } catch (e) {
            alert('Error submitting review');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 className="text-4xl font-bold mb-4">Customer <span className="text-gradient">Reviews</span></h1>
                    <p style={{ color: '#aaa', fontSize: '1.2rem' }}>Join <span style={{ color: '#00ff88', fontWeight: 'bold' }}>
                        <LiveCount metric="reviews" suffix="+" />
                    </span> happy clients who trusted us.</p>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                        <div className="glass" style={{ padding: '1.5rem 2.5rem', borderRadius: '20px', border: '1px solid rgba(0, 255, 136, 0.2)', boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00ff88' }}>
                                <LiveCount metric="satisfaction" suffix="/5" decimals={1} />
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>Average Rating</div>
                        </div>
                        <div className="glass" style={{ padding: '1.5rem 2.5rem', borderRadius: '20px', border: '1px solid rgba(0, 195, 255, 0.2)', boxShadow: '0 0 20px rgba(0, 195, 255, 0.1)' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00c3ff' }}>
                                <LiveCount metric="orders" suffix="+" short={true} />
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>Orders Completed</div>
                        </div>
                    </div>
                </div>

                {/* Submit Review Form */}
                <div style={{ maxWidth: '600px', margin: '0 auto 4rem auto' }} className="glass p-8 rounded-xl shadow-2xl">
                    <h3 className="text-2xl font-bold mb-6 text-center">Share Your Experience</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Form Fields ... */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Full Name</label>
                            <input
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid #333', color: 'white' }}
                                placeholder="Your name or alias"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Service Purchased</label>
                            <select
                                value={service}
                                onChange={e => setService(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid #333', color: 'white' }}
                            >
                                <option>Instagram Followers</option>
                                <option>Discord Members</option>
                                <option>Reddit Account</option>
                                <option>TikTok Growth</option>
                                <option>Twitter/X Verification</option>
                                <option>Web Design Project</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Rating</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        style={{
                                            fontSize: '1.5rem',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: star <= rating ? '#00ff88' : '#333',
                                            transition: 'transform 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Review Message</label>
                            <textarea
                                required
                                value={review}
                                onChange={e => setReview(e.target.value)}
                                rows={4}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid #333', color: 'white' }}
                                placeholder="Tell us how we did..."
                            ></textarea>
                        </div>
                        <button disabled={isSubmitting} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontWeight: 'bold' }}>
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <div className="loader" style={{ margin: '0 auto' }}></div>
                        <p style={{ marginTop: '1rem', color: '#888' }}>Fetching live experience feed...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#666', padding: '4rem' }}>
                        No live reviews found in the feed. Be the first!
                    </div>
                ) : (
                    <div className="grid-3">
                        {reviews.map((item, i) => {
                            const isNew = new Date(item.created_at).getTime() > Date.now() - 60000;
                            return (
                                <div key={i} className="glass card-hover" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', height: '100%', border: isNew ? '1px solid #00ff88' : '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                    {isNew && <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#00ff88', color: '#000', fontSize: '0.6rem', padding: '2px 8px', borderRadius: '20px', fontWeight: 'bold' }}>JUST NOW</div>}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                        <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.1rem' }}>{anonymize(item.name)}</div>
                                        <div style={{ color: '#ffd700', fontSize: '0.9rem' }}>
                                            {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                                        </div>
                                    </div>
                                    <p style={{ color: '#ccc', fontStyle: 'italic', marginBottom: '1.5rem', flex: 1, lineHeight: '1.6' }}>"{item.review}"</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#00ff88', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                                            ✓ {item.role || 'Verified Buyer'}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#555' }}>
                                            {isNew ? 'New Feed' : new Date(item.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}
