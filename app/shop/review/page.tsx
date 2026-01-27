"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function ReviewForm() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/user/review', {
                method: 'POST',
                body: JSON.stringify({ orderId, rating, comment })
            });
            const data = await res.json();
            if (data.success) {
                setDone(true);
            } else {
                setError(data.error || 'Submission failed');
            }
        } catch (e) {
            setError('Connection error');
        } finally {
            setSubmitting(false);
        }
    };

    if (done) return (
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
            <h1 style={{ color: '#00ff88', fontSize: '3rem' }}>🌟 Thank You!</h1>
            <p style={{ color: '#888', fontSize: '1.2rem', marginTop: '1rem' }}>Your review has been submitted. Check your email for a special discount!</p>
            <button onClick={() => window.location.href = '/'} className="btn btn-primary" style={{ marginTop: '2rem' }}>Back to Shop</button>
        </div>
    );

    return (
        <div style={{ maxWidth: '600px', margin: '150px auto', padding: '2rem' }} className="glass">
            <h1 style={{ color: '#fff', marginBottom: '1rem' }}>Rate Your Experience</h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Order ID: {orderId}</p>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.8rem', color: '#ccc' }}>Rating</label>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '2rem' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <span
                                key={star}
                                onClick={() => setRating(star)}
                                style={{ cursor: 'pointer', color: rating >= star ? '#ffd700' : '#444' }}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Your Feedback</label>
                    <textarea
                        required
                        className="input-field"
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        style={{ width: '100%', height: '150px' }}
                        placeholder="What did you think of the product and service?"
                    />
                </div>

                {error && <p style={{ color: '#ff4444' }}>{error}</p>}

                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ height: '50px', fontSize: '1.1rem' }}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>
        </div>
    );
}

export default function ReviewPage() {
    return (
        <main style={{ minHeight: '100vh', background: '#050505' }}>
            <Navbar />
            <Suspense fallback={<div>Loading...</div>}>
                <ReviewForm />
            </Suspense>
            <Footer />
        </main>
    );
}
