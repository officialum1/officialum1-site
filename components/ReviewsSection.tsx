"use client";

import { useState, useEffect } from "react";

export default function ReviewsSection({ productId }: { productId: string }) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [user, setUser] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('buyer_user');
        if (stored) setUser(JSON.parse(stored));
        fetchReviews(1);
    }, [productId]);

    const fetchReviews = async (p: number) => {
        try {
            const res = await fetch(`/api/reviews?productId=${productId}&page=${p}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                if (p === 1) setReviews(data);
                else setReviews(prev => [...prev, ...data]);
                if (data.length < 5) setHasMore(false);
            } else {
                console.warn("Reviews API Error:", data);
            }
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async () => {
        if (!user) return alert("Please login to review.");
        if (!comment) return alert("Write a comment.");

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, productId, rating, comment })
            });
            const data = await res.json();
            if (data.success) {
                alert("Review submitted! It will appear after approval.");
                setComment("");
                // Optionally optimistically add to list or wait for reload
            } else {
                alert("Error: " + data.error);
            }
        } catch (e) { alert("Failed to submit."); }
    };

    return (
        <div style={{ marginTop: '4rem' }}>
            <h3 style={{ fontSize: '2rem', marginBottom: '2rem', fontFamily: 'var(--font-outfit)' }}>Customer Reviews</h3>

            {/* Write Review */}
            <div className="glass" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>Write a Review</h4>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: star <= rating ? '#ffd700' : '#444' }}
                        >
                            ★
                        </button>
                    ))}
                </div>
                <textarea
                    className="input-field"
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', color: '#fff' }}
                />
                <button onClick={handleSubmit} className="btn btn-primary" style={{ marginTop: '1rem' }}>Submit Review</button>
            </div>

            {/* List */}
            {reviews.length === 0 ? (
                <p style={{ color: '#666' }}>No reviews yet. Be the first!</p>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {reviews.map(r => (
                        <div key={r.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <div style={{ fontWeight: 'bold' }}>{r.email?.split('@')[0]}***</div>
                                <div style={{ color: '#ffd700' }}>{"★".repeat(r.rating)}</div>
                            </div>
                            <p style={{ color: '#ccc', lineHeight: '1.5' }}>{r.comment}</p>
                            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>{new Date(r.created_at).toLocaleDateString()}</div>
                        </div>
                    ))}
                    {hasMore && (
                        <button onClick={() => { setPage(p => p + 1); fetchReviews(page + 1); }} className="btn btn-outline" style={{ marginTop: '1rem' }}>Load More</button>
                    )}
                </div>
            )}
        </div>
    );
}
