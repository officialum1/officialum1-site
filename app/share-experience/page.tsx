"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ShareExperience() {
    const [formData, setFormData] = useState({ name: "", role: "", review: "", rating: 5 });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await fetch('/api/testimonials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            setSuccess(true);
            setFormData({ name: "", role: "", review: "", rating: 5 });
        } catch (err) {
            console.error(err);
            alert("Failed to submit review. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px', maxWidth: '600px' }}>
                <div className="glass" style={{ padding: '3rem', borderRadius: '24px' }}>
                    <h1 style={{ marginBottom: '1rem', textAlign: 'center' }}>Share Your Experience</h1>
                    <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-muted)' }}>
                        Your feedback helps us improve and helps others choose OfficialUM1.
                    </p>

                    {success ? (
                        <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(0,255,100,0.1)', borderRadius: '12px', border: '1px solid rgba(0,255,100,0.2)' }}>
                            <h3 style={{ color: '#00ff88', marginBottom: '1rem' }}>Thank You! 🎉</h3>
                            <p>Your review has been submitted and is pending moderation.</p>
                            <button onClick={() => setSuccess(false)} className="btn btn-outline" style={{ marginTop: '1.5rem' }}>Submit Another</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Your Name</label>
                                <input
                                    className="input-field"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Role / Company (Optional)</label>
                                <input
                                    className="input-field"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    placeholder="CEO at ExampleCorp"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Rating</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => setFormData({ ...formData, rating: star })}
                                            style={{
                                                background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer',
                                                filter: star <= formData.rating ? 'grayscale(0)' : 'grayscale(1)',
                                                opacity: star <= formData.rating ? 1 : 0.3
                                            }}
                                        >
                                            ⭐
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Your Review</label>
                                <textarea
                                    className="input-field"
                                    value={formData.review}
                                    onChange={e => setFormData({ ...formData, review: e.target.value })}
                                    required
                                    placeholder="Tell us about your experience..."
                                    style={{ height: '150px' }}
                                />
                            </div>

                            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ width: '100%' }}>
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
            <Footer />
            <style jsx>{`
            .input-field {
                width: 100%;
                padding: 1rem;
                border-radius: 12px;
                border: 1px solid var(--glass-border);
                background: rgba(255,255,255,0.03);
                color: white;
                font-family: inherit;
                transition: all 0.3s ease;
            }
            .input-field:focus {
                outline: none;
                border-color: var(--primary);
                background: rgba(255,255,255,0.05);
            }
        `}</style>
        </main>
    );
}
