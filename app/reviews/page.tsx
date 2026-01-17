"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [name, setName] = useState('');
    const [service, setService] = useState('Reddit Account');
    const [review, setReview] = useState('');
    const [rating, setRating] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchReviews = async () => {
        try {
            const res = await fetch('/api/testimonials');
            const data = await res.json();
            setReviews(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Failed to fetch reviews", e);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

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
                fetchReviews();
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
                    <p style={{ color: '#aaa', fontSize: '1.2rem' }}>Join <span style={{ color: '#00ff88', fontWeight: 'bold' }}>2,450+</span> happy clients who trusted us.</p>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                        <div className="glass" style={{ padding: '1rem 2rem', borderRadius: '12px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00ff88' }}>4.9/5</div>
                            <div style={{ fontSize: '0.9rem', color: '#aaa' }}>Average Rating</div>
                        </div>
                        <div className="glass" style={{ padding: '1rem 2rem', borderRadius: '12px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00ff88' }}>2.4k+</div>
                            <div style={{ fontSize: '0.9rem', color: '#aaa' }}>Orders Completed</div>
                        </div>
                    </div>
                </div>

                {/* Submit Review Form */}
                <div style={{ maxWidth: '600px', margin: '0 auto 4rem auto' }} className="glass p-8 rounded-xl shadow-2xl">
                    <h3 className="text-2xl font-bold mb-6 text-center">Share Your Experience</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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

                {reviews.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#666', padding: '4rem' }}>
                        No reviews yet. Be the first to share your experience!
                    </div>
                ) : (
                    <div className="grid-3">
                        {reviews.map((item, i) => (
                            <div key={i} className="glass card-hover" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ fontWeight: 'bold', color: '#fff' }}>{item.name}</div>
                                    <div style={{ color: '#00ff88' }}>
                                        {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                                    </div>
                                </div>
                                <p style={{ color: '#ccc', fontStyle: 'italic', marginBottom: '1.5rem', flex: 1 }}>"{item.review}"</p>
                                <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>
                                    {item.role}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}
