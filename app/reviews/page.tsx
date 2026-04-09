"use client";

import Link from 'next/link';
import LiveCount from '@/components/LiveCount';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PageHero } from '@/components/ui/PageHero';
import { Star } from 'lucide-react';

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalReviews: 2450, avgRating: 4.9, totalOrders: 2400 });
    const [name, setName] = useState('');
    const [service, setService] = useState('Reddit Account');
    const [review, setReview] = useState('');
    const [rating, setRating] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

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
        const stored = localStorage.getItem('buyer_user');
        if (stored) {
            const u = JSON.parse(stored);
            setUser(u);
            setName(u.email ? u.email.split('@')[0] : 'Member');
        }
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
                    name: name || 'Anonymous',
                    role: 'Buyer - ' + service,
                    review,
                    rating,
                    userId: user?.id
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
            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reviews' }]}
                    label="Reviews"
                    title={<>What Our Clients Say</>}
                    description={
                        <>Join <span style={{ color: 'var(--primary)', fontWeight: 800 }}><LiveCount metric="reviews" suffix="+" /></span> happy clients who trusted us.</>
                    }
                    right={
                        <div className="hidden md:flex items-center gap-3">
                            <span className="badge">250+ Projects</span>
                            <span className="badge">4.9★ Rating</span>
                            <span className="badge">3.6k Orders</span>
                        </div>
                    }
                />

                <section className="py-[120px]" style={{ background: 'var(--bg-alt)' }}>
                    <div className="container">

                {/* Submit Review Form */}
                <div className="card" style={{ maxWidth: '860px', margin: '0 auto' }}>
                    <div className="p-10">
                        <h2 style={{ fontSize: '2rem', marginBottom: '1.25rem', textAlign: 'center', color: '#111827' }}>Share Your Experience</h2>

                    {user ? (
                        <div style={{ background: 'rgba(79,70,229,0.06)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid rgba(79,70,229,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Posting as:</span>
                                <strong style={{ color: '#111827', marginLeft: '10px' }}>{anonymize(user.email)}</strong>
                            </div>
                            <span className="badge">Verified Member</span>
                        </div>
                    ) : (
                        <div style={{ background: 'rgba(79,70,229,0.06)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid rgba(79,70,229,0.12)', textAlign: 'center' }}>
                            <p style={{ color: '#4F46E5', fontSize: '0.9rem' }}>Login to receive a <strong>Verified Purchase</strong> badge on your review.</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6B7280' }}>Full Name</label>
                            <input
                                className="input"
                                value={name}
                                onChange={e => !user && setName(e.target.value)}
                                disabled={!!user}
                                placeholder="Your name or alias"
                                style={{ cursor: user ? 'not-allowed' : 'text' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6B7280', fontSize: '0.9rem' }}>Service Purchased</label>
                            <select
                                value={service}
                                onChange={e => setService(e.target.value)}
                                className="input"
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6B7280', fontSize: '0.9rem' }}>Rating</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <Star className={`h-6 w-6 ${star <= rating ? "text-indigo-600 fill-indigo-600" : "text-gray-300"}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6B7280', fontSize: '0.9rem' }}>Review Message</label>
                            <textarea
                                required
                                value={review}
                                onChange={e => setReview(e.target.value)}
                                rows={4}
                                className="input"
                                placeholder="Tell us how we did..."
                            ></textarea>
                        </div>
                        <button disabled={isSubmitting} className="btn-primary" style={{ width: '100%', padding: '1rem', fontWeight: 'bold' }}>
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                    </div>
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
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ fontSize: '0.7rem', color: '#00ff88', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                                                ✓ {item.role || 'Verified Buyer'}
                                            </div>
                                            {item.has_purchased > 0 && (
                                                <div style={{ fontSize: '0.6rem', color: '#00ff88', background: 'rgba(0,255,136,0.1)', padding: '2px 8px', borderRadius: '4px', width: 'fit-content' }}>
                                                    Verified Purchase
                                                </div>
                                            )}
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
                </section>
            </div>
            <Footer />
        </main>
    );
}
