"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/testimonials')
            .then(res => res.json())
            .then(data => setReviews(data));
    }, []);

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
                <div style={{ maxWidth: '600px', margin: '0 auto 4rem auto' }} className="glass p-8 rounded-xl">
                    <h3 className="text-2xl font-bold mb-4 text-center">Share Your Experience</h3>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const data = {
                            name: (form[0] as HTMLInputElement).value,
                            role: 'Buyer - ' + (form[1] as HTMLSelectElement).value,
                            review: (form[2] as HTMLTextAreaElement).value
                        };

                        await fetch('/api/testimonials', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        });
                        alert('Review Submitted! It will appear after moderation.');
                        form.reset();
                    }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Name</label>
                            <input required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid #333', color: 'white' }} placeholder="John D." />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Service Purchased</label>
                            <select style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid #333', color: 'white' }}>
                                <option>Instagram Followers</option>
                                <option>Discord Members</option>
                                <option>Reddit Account</option>
                                <option>TikTok Growth</option>
                                <option>Twitter/X Verification</option>
                                <option>Web Design Project</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Feedback</label>
                            <textarea required rows={3} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid #333', color: 'white' }} placeholder="Great service..."></textarea>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Submit Review</button>
                    </form>
                </div>

                <div className="grid-3">
                    {reviews.map((item, i) => (
                        <div key={i} className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                                <div style={{ color: '#00ff88' }}>★★★★★</div>
                            </div>
                            <p style={{ color: '#ccc', fontStyle: 'italic', marginBottom: '1rem' }}>"{item.review}"</p>
                            <div style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {item.role}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </main>
    );
}
