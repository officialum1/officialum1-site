"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

export default function ReviewsManager() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        const res = await fetch("/api/admin/reviews");
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
        setLoading(false);
    };

    const handleAction = async (reviewId: number, action: string) => {
        if (!confirm(`Are you sure you want to ${action} this review?`)) return;

        try {
            await fetch("/api/admin/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reviewId, action }),
            });
            fetchReviews();
        } catch {
            alert("Action failed");
        }
    };

    const statusClass = (status: string) => {
        if (status === "approved") return "approved";
        if (status === "rejected") return "rejected";
        return "pending";
    };

    if (loading) {
        return <div className="container" style={{ paddingTop: "150px" }}>Loading Reviews...</div>;
    }

    return (
        <AdminShell title="Reviews" subtitle="Moderate customer reviews across products.">
            <a href="/admin/dashboard" className="admin-back-link">Back to Dashboard</a>

            <div className="admin-card" style={{ padding: "1.25rem" }}>
                <div className="admin-table-wrap">
                    <table className="admin-table" style={{ minWidth: "980px" }}>
                        <colgroup>
                            <col style={{ width: "30%" }} />
                            <col style={{ width: "16%" }} />
                            <col style={{ width: "10%" }} />
                            <col style={{ width: "27%" }} />
                            <col style={{ width: "9%" }} />
                            <col style={{ width: "8%" }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th style={{ padding: "0.95rem 1rem" }}>Product</th>
                                <th style={{ padding: "0.95rem 1rem" }}>User</th>
                                <th style={{ padding: "0.95rem 1rem" }}>Rating</th>
                                <th style={{ padding: "0.95rem 1rem" }}>Comment</th>
                                <th style={{ padding: "0.95rem 1rem" }}>Status</th>
                                <th style={{ padding: "0.95rem 1rem" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map((review) => (
                                <tr key={review.id}>
                                    <td style={{ padding: "1rem" }}>
                                        <div className="admin-text-strong">{review.product_name || `ID: ${review.product_id}`}</div>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <span className="admin-text-muted" style={{ overflowWrap: "anywhere" }}>
                                            {review.user_email || "Guest"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <span className="admin-stars" aria-label={`${review.rating} star review`}>
                                            {"\u2605".repeat(Number(review.rating || 0))}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ maxWidth: "360px", color: "var(--text-secondary)" }}>
                                            {review.comment}
                                        </div>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <span className={`admin-status ${statusClass(review.status)}`}>
                                            {String(review.status || "pending").toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <div className="admin-actions">
                                            {review.status !== "approved" && (
                                                <button onClick={() => handleAction(review.id, "approve")} className="admin-action approve">
                                                    Approve
                                                </button>
                                            )}
                                            {review.status !== "rejected" && (
                                                <button onClick={() => handleAction(review.id, "reject")} className="admin-action reject">
                                                    Reject
                                                </button>
                                            )}
                                            <button onClick={() => handleAction(review.id, "delete")} className="admin-action delete">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {reviews.length === 0 && (
                    <p className="admin-text-muted" style={{ textAlign: "center", marginTop: "2rem" }}>
                        No reviews found.
                    </p>
                )}
            </div>
        </AdminShell>
    );
}
