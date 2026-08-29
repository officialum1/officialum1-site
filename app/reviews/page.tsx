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
        <main style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <Navbar />
            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reviews' }]}
                    label="Reviews"
                    title={<>What Our Clients <span style={{color: 'var(--accent-violet)'}}>Say</span></>}
                    description={
                        <>Join <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}><LiveCount metric="reviews" suffix="+" /></span> happy clients who trusted us.</>
                    }
                    right={
                        <div className="hidden md:flex items-center gap-3">
                            <span style={{ padding: '6px 14px', background: 'rgba(20,108,120,0.10)', border: '1px solid rgba(20,108,120,0.18)', color: 'var(--accent-blue)', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem' }}>250+ Projects</span>
                            <span style={{ padding: '6px 14px', background: 'rgba(217,145,61,0.12)', border: '1px solid rgba(217,145,61,0.24)', color: '#8a5515', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem' }}>4.9 Star Rating</span>
                        </div>
                    }
                />

                <section className="py-[100px]" style={{ background: 'linear-gradient(180deg, var(--bg-section-alt) 0%, var(--bg-base) 100%)' }}>
                    <div className="container">

                {/* Submit Review Form - REWORKED TO GLASS */}
                <div style={{ 
                    maxWidth: '800px', 
                    margin: '0 auto 80px',
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '32px',
                    padding: '3rem 2.5rem',
                    boxShadow: '0 18px 44px rgba(24,32,38,0.08)'
                }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center', color: 'var(--text-primary)', fontWeight: '800' }}>Share Your Experience</h2>

                    {user ? (
                        <div style={{ background: 'var(--bg-section-alt)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Posting as:</span>
                                <strong style={{ color: 'var(--text-primary)', marginLeft: '10px' }}>{anonymize(user.email)}</strong>
                            </div>
                            <span style={{ padding: '4px 12px', background: 'var(--gradient)', color: '#fff', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800' }}>Verified</span>
                        </div>
                    ) : (
                        <div style={{ background: 'var(--bg-section-alt)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Login to receive a <strong style={{color: 'var(--accent-violet)'}}>Verified Purchase</strong> badge on your review.</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Full Name</label>
                                <input
                                    className="dark-input"
                                    value={name}
                                    onChange={e => !user && setName(e.target.value)}
                                    disabled={!!user}
                                    placeholder="Name or alias"
                                    style={{ width: '100%', cursor: user ? 'not-allowed' : 'text' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Service Category</label>
                                <select
                                    value={service}
                                    onChange={e => setService(e.target.value)}
                                    className="dark-input"
                                    style={{ width: '100%' }}
                                >
                                    <option>Web Design Project</option>
                                    <option>SEO Strategy</option>
                                    <option>Social Media Growth</option>
                                    <option>Guest Posting / Backlinks</option>
                                    <option>Other Service</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Rating Value</label>
                            <div style={{ display: 'flex', gap: '0.75rem', background: 'var(--bg-section-alt)', padding: '0.8rem 1.2rem', borderRadius: '12px', width: 'fit-content', border: '1px solid var(--border-subtle)' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        <Star style={{ width: '24px', height: '24px', fill: star <= rating ? "var(--accent-warm)" : "transparent", color: star <= rating ? "var(--accent-warm)" : "var(--border-subtle)" }} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Detailed Feedback</label>
                            <textarea
                                required
                                value={review}
                                onChange={e => setReview(e.target.value)}
                                rows={4}
                                className="dark-input"
                                placeholder="How was your experience with OfficialUM1?"
                                style={{ width: '100%', resize: 'none' }}
                            ></textarea>
                        </div>
                        <button disabled={isSubmitting} style={{ 
                            width: '100%', 
                            padding: '1.2rem', 
                            fontWeight: '800', 
                            background: 'var(--gradient)', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '16px', 
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            boxShadow: '0 12px 28px rgba(20,108,120,0.16)'
                        }}>
                            {isSubmitting ? 'Transmitting...' : 'Deploy Review'}
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        Synchronizing with global feedback cluster...
                    </div>
                ) : reviews.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem' }}>
                        No recent feedback nodes detected. Initialize the feed.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                        {reviews.map((item, i) => {
                            const isNew = new Date(item.created_at).getTime() > Date.now() - 60000;
                            return (
                                <div key={i} style={{ 
                                    padding: '2rem', 
                                    borderRadius: '24px', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    height: '100%', 
                                    border: isNew ? '1px solid rgba(196,71,45,0.42)' : '1px solid var(--border-subtle)', 
                                    background: '#ffffff',
                                    position: 'relative',
                                    transition: 'transform 0.3s ease'
                                }} className="hover:-translate-y-1">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'center' }}>
                                        <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{anonymize(item.name)}</div>
                                        <div style={{ color: 'var(--accent-warm)', fontSize: '0.9rem', display: 'flex' }}>
                                            {'★'.repeat(item.rating)}
                                        </div>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1.5rem', flex: 1, lineHeight: '1.8' }}>"{item.review}"</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                                                {item.role || 'Verified Client'}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {new Date(item.created_at).toLocaleDateString()}
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
            <style jsx global>{`
                .dark-input {
                    background: #ffffff !important;
                    border: 1px solid var(--border-subtle) !important;
                    color: var(--text-primary) !important;
                    padding: 1rem 1.2rem !important;
                    border-radius: 12px !important;
                    transition: all 0.3s ease;
                    font-family: inherit;
                    outline: none;
                }
                .dark-input:focus {
                    border-color: var(--accent-blue) !important;
                    background: #ffffff !important;
                    box-shadow: 0 0 0 4px rgba(20,108,120,0.12) !important;
                }
            `}</style>
        </main>
    );
}
