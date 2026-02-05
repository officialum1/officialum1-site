"use client";

import { useState, useEffect } from "react";
import { modernAlert, modernConfirm } from "@/components/ModernUIOverlay";

export default function ReviewsTab({ catalog }: { catalog: any[] }) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewForm, setReviewForm] = useState({
        productId: "",
        rating: 5,
        comment: "",
        userId: ""
    });

    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        fetchReviews();
        fetchUsers();

        // 3 Second Ultra-Live Polling for Admin Feed
        const interval = setInterval(fetchReviews, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch('/api/admin/reviews');
            const data = await res.json();
            setReviews(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (e) { }
    };

    const handleAddReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewForm.productId || !reviewForm.comment) return modernAlert("Fill all fields");

        try {
            const res = await fetch('/api/admin/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewForm)
            });
            const data = await res.json();
            if (data.success) {
                modernAlert("Review added successfully!");
                setReviewForm({ productId: "", rating: 5, comment: "", userId: "" });
                fetchReviews();
            } else {
                modernAlert("Error: " + data.error);
            }
        } catch (e) { modernAlert("Failed to add review"); }
    };

    const handleDelete = async (id: number) => {
        if (!await modernConfirm("Are you sure you want to delete this review?")) return;
        try {
            await fetch('/api/admin/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', id })
            });
            fetchReviews();
        } catch (e) { }
    };

    const handleAssignRandomBuyer = () => {
        if (users.length === 0) return modernAlert("No users found to assign.");
        const randomUser = users[Math.floor(Math.random() * users.length)];
        setReviewForm(prev => ({ ...prev, userId: randomUser.id }));
    };

    const anonymize = (val: string) => {
        if (!val) return 'Verified Buyer';
        const name = val.includes('@') ? val.split('@')[0] : val;
        if (name.length <= 3) return name + "**";
        return name.substring(0, 3) + "**";
    };

    return (
        <div className="FadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>⭐ Manage Product Reviews</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={async () => {
                            if (!await modernConfirm("This will add 10 reviews to EVERY product in your store to look like a busy site. Proceed?")) return;
                            setLoading(true);
                            try {
                                const res = await fetch('/api/admin/mass-review-boost', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ reviewsPerProduct: 10 })
                                });
                                const data = await res.json();
                                if (data.success) {
                                    modernAlert(`✅ Store boosted! ${data.message}`);
                                    fetchReviews();
                                } else {
                                    modernAlert("Error: " + data.error);
                                }
                            } catch (e) {
                                modernAlert("Failed to boost store");
                            } finally {
                                setLoading(false);
                            }
                        }}
                        className="btn btn-outline"
                        style={{ color: '#00ff88', borderColor: 'rgba(0,255,136,0.3)', background: 'rgba(0,255,136,0.05)' }}
                        disabled={loading}
                    >
                        🚀 Mass AI Boost (All Prods)
                    </button>
                    <div style={{ background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.9rem' }}>
                        {reviews.length} Total Reviews
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                {/* LIST */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {loading ? <p>Loading reviews...</p> : (
                        reviews.map(r => (
                            <div key={r.id} className="glass" style={{ padding: '1.5rem', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <div style={{ color: '#ffd700' }}>{"★".repeat(r.rating)}</div>
                                        <div style={{ color: '#00ff88', fontSize: '0.8rem', fontWeight: 'bold' }}>{r.product_name || 'Unknown Product'}</div>
                                    </div>
                                    <p style={{ color: '#ccc', fontSize: '0.95rem', margin: '0.5rem 0', lineHeight: '1.5' }}>{r.comment}</p>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#666' }}>
                                        <span>👤 {anonymize(r.email || r.user_id)}</span>
                                        <span>📅 {new Date(r.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(r.id)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>🗑️</button>
                            </div>
                        ))
                    )}
                </div>

                {/* FORM */}
                <div className="glass" style={{ padding: '2rem', borderRadius: '24px', position: 'sticky', top: '20px', height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Add Manual Review</h3>
                    <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.5rem' }}>Select Product</label>
                            <select
                                className="input-field"
                                style={{ width: '100%', background: '#111', color: '#fff' }}
                                value={reviewForm.productId}
                                onChange={e => setReviewForm({ ...reviewForm, productId: e.target.value })}
                                required
                            >
                                <option value="" style={{ background: '#111', color: '#fff' }}>Choose a product...</option>
                                {catalog.map(p => (
                                    <option key={p.id} value={p.id} style={{ background: '#111', color: '#fff' }}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.5rem' }}>Rating</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {[1, 2, 3, 4, 5].map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setReviewForm({ ...reviewForm, rating: num })}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            borderRadius: '8px',
                                            background: reviewForm.rating >= num ? '#ffd700' : 'rgba(255,255,255,0.05)',
                                            color: reviewForm.rating >= num ? '#000' : '#888',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ fontSize: '0.8rem', color: '#888' }}>User ID (Optional)</label>
                                <button type="button" onClick={handleAssignRandomBuyer} style={{ fontSize: '0.7rem', color: '#00ff88', background: 'none', border: 'none', cursor: 'pointer' }}>🎲 Random Buyer</button>
                            </div>
                            <input
                                className="input-field"
                                style={{ width: '100%' }}
                                placeholder="Paste User ID or leave blank"
                                value={reviewForm.userId}
                                onChange={e => setReviewForm({ ...reviewForm, userId: e.target.value })}
                            />
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ fontSize: '0.8rem', color: '#888' }}>Review Comment</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const comments = [
                                            "Absolutely amazing! Exactly what I was looking for.",
                                            "Fast delivery and the quality is top-notch. Highly recommend.",
                                            "Best service ever. I've been a customer for months and never disappointed.",
                                            "Works perfectly. No issues at all.",
                                            "Surpassed my expectations. Great value for money.",
                                            "The support team was so helpful with my questions.",
                                            "Instant delivery and reliable accounts. 5 stars!",
                                            "OfficialUM1 is the only place I trust for these services.",
                                            "Very smooth transaction. Will definitely buy again.",
                                            "High quality and very affordable. Thank you!",
                                            "Everything was as described. Very happy with the purchase.",
                                            "Great communication and fast results.",
                                            "Legit and safe. Don't hesitate to buy.",
                                            "Saved me so much time and effort. Excellent!",
                                            "Simple, fast, and secure. Best in the business."
                                        ];
                                        setReviewForm(prev => ({ ...prev, comment: comments[Math.floor(Math.random() * comments.length)] }));
                                    }}
                                    style={{ fontSize: '0.7rem', color: '#00ff88', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    🎲 Random Comment
                                </button>
                            </div>
                            <textarea
                                className="input-field"
                                style={{ width: '100%', height: '100px' }}
                                placeholder="Write something nice..."
                                value={reviewForm.comment}
                                onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Add Review</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
