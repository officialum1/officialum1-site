"use client";

import { useEffect, useState } from "react";

export default function ReviewsSection({ productId }: { productId: string }) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [user, setUser] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("buyer_user");
            if (stored) setUser(JSON.parse(stored));
        } catch {
            localStorage.removeItem("buyer_user");
        }

        fetchReviews(1);
        const interval = setInterval(() => fetchReviews(1), 5000);
        return () => clearInterval(interval);
    }, [productId]);

    const fetchReviews = async (p: number) => {
        try {
            const res = await fetch(`/api/reviews?productId=${productId}&page=${p}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                if (p === 1) setReviews(data);
                else setReviews((prev) => [...prev, ...data]);
                setHasMore(data.length >= 5);
            } else {
                console.warn("Reviews API Error:", data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async () => {
        if (!user) return alert("Please login to review.");
        if (!comment.trim()) return alert("Write a comment.");

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, productId, rating, comment }),
            });
            const data = await res.json();
            if (data.success) {
                alert("Review submitted. It will appear after approval.");
                setComment("");
            } else {
                alert("Error: " + data.error);
            }
        } catch {
            alert("Failed to submit.");
        }
    };

    const anonymize = (val: string) => {
        if (!val) return "Verified Buyer";
        const name = val.includes("@") ? val.split("@")[0] : val;
        if (name.length <= 3) return `${name}**`;
        return `${name.substring(0, 3)}**`;
    };

    return (
        <section className="reviews-section" aria-label="Customer reviews">
            <div className="section-heading">
                <span>Product confidence</span>
                <h2>Customer Reviews</h2>
            </div>

            <div className="review-form">
                <h3>Write a Review</h3>
                <div className="rating-row" aria-label="Select rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={star <= rating ? "active" : ""}
                            aria-label={`${star} out of 5`}
                        >
                            {star}
                        </button>
                    ))}
                </div>
                <textarea
                    className="input-field"
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <button type="button" onClick={handleSubmit} className="review-submit">
                    Submit Review
                </button>
            </div>

            {reviews.length === 0 ? (
                <p className="empty-reviews">No reviews yet. Be the first!</p>
            ) : (
                <div className="review-list">
                    {reviews.map((r) => (
                        <article key={r.id} className="review-card">
                            <div className="review-top">
                                <div>
                                    <strong>{anonymize(r.email || r.user_id)}</strong>
                                    {r.has_purchased > 0 && <span>Verified Purchase</span>}
                                </div>
                                <b>Rating {r.rating}/5</b>
                            </div>
                            <p>{r.comment}</p>
                            <time>{new Date(r.created_at).toLocaleDateString()}</time>
                        </article>
                    ))}

                    {hasMore && (
                        <button
                            type="button"
                            onClick={() => {
                                const nextPage = page + 1;
                                setPage(nextPage);
                                fetchReviews(nextPage);
                            }}
                            className="load-more"
                        >
                            Load More
                        </button>
                    )}
                </div>
            )}

            <style jsx>{`
                .reviews-section {
                    margin-top: 3rem;
                }

                .section-heading {
                    margin-bottom: 1rem;
                }

                .section-heading span {
                    color: var(--accent-blue);
                    font-size: 0.8rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0;
                }

                .section-heading h2 {
                    margin: 0.25rem 0 0;
                    color: var(--text-primary);
                    font-size: 2rem;
                }

                .review-form,
                .review-card {
                    border: 1px solid var(--border-subtle);
                    border-radius: 18px;
                    background: #ffffff;
                    box-shadow: 0 12px 30px rgba(24, 32, 38, 0.06);
                }

                .review-form {
                    padding: 1.4rem;
                    margin-bottom: 1.3rem;
                }

                .review-form h3 {
                    margin: 0 0 0.85rem;
                    color: var(--text-primary);
                    font-size: 1.15rem;
                }

                .rating-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.45rem;
                    margin-bottom: 1rem;
                }

                .rating-row button {
                    width: 38px;
                    height: 38px;
                    border: 1px solid var(--border-subtle);
                    border-radius: 999px;
                    background: #ffffff;
                    color: var(--text-primary);
                    font-weight: 900;
                    cursor: pointer;
                }

                .rating-row button.active {
                    border-color: rgba(217, 145, 61, 0.5);
                    background: rgba(217, 145, 61, 0.13);
                    color: #9a5f18;
                }

                textarea {
                    min-height: 120px;
                    resize: vertical;
                    color: var(--text-primary) !important;
                    background: #ffffff !important;
                }

                .review-submit,
                .load-more {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 46px;
                    margin-top: 0.85rem;
                    padding: 0.75rem 1.15rem;
                    border: 0;
                    border-radius: 12px;
                    background: var(--gradient);
                    color: #ffffff;
                    font-weight: 850;
                    cursor: pointer;
                    box-shadow: 0 12px 28px rgba(20, 108, 120, 0.16);
                }

                .empty-reviews {
                    margin: 0;
                    color: var(--text-muted);
                }

                .review-list {
                    display: grid;
                    gap: 1rem;
                }

                .review-card {
                    padding: 1.25rem;
                }

                .review-top {
                    display: flex;
                    justify-content: space-between;
                    gap: 1rem;
                    margin-bottom: 0.65rem;
                }

                .review-top strong,
                .review-top b {
                    color: var(--text-primary);
                }

                .review-top span {
                    display: inline-flex;
                    margin-left: 0.5rem;
                    padding: 0.16rem 0.45rem;
                    border-radius: 999px;
                    background: rgba(20, 132, 95, 0.1);
                    color: var(--success);
                    font-size: 0.72rem;
                    font-weight: 850;
                }

                .review-card p {
                    margin: 0;
                    color: var(--text-muted);
                    line-height: 1.65;
                }

                .review-card time {
                    display: block;
                    margin-top: 0.65rem;
                    color: #7a8a92;
                    font-size: 0.82rem;
                }

                .load-more {
                    width: fit-content;
                    justify-self: center;
                    margin-top: 0.3rem;
                }

                @media (max-width: 640px) {
                    .section-heading h2 {
                        font-size: 1.6rem;
                    }

                    .review-top {
                        display: block;
                    }

                    .review-top b {
                        display: block;
                        margin-top: 0.45rem;
                    }

                    .review-top span {
                        margin: 0.45rem 0 0;
                    }
                }
            `}</style>
        </section>
    );
}
