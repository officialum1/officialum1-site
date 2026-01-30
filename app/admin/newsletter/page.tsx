"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NewsletterAdmin() {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm('Are you sure you want to send this email to ALL subscribers?')) return;

        setSending(true);
        try {
            const res = await fetch('/api/admin/newsletter/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, content })
            });
            const data = await res.json();
            if (data.success) {
                alert(`✅ Sent successfully to ${data.count} subscribers!`);
                setSubject('');
                setContent('');
            } else {
                alert('Failed: ' + data.error);
            }
        } catch (e) {
            alert('Error sending newsletter.');
        } finally {
            setSending(false);
        }
    };

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px' }}>
                <a href="/admin/dashboard" style={{ color: '#888', marginBottom: '1rem', display: 'inline-block' }}>← Back to Dashboard</a>
                <h1 style={{ marginBottom: '2rem' }}>Newsletter Broadcaster 📨</h1>

                <div className="glass" style={{ padding: '2rem', borderRadius: '24px', maxWidth: '800px', margin: '0 auto' }}>
                    <form onSubmit={handleSend} className="space-y-6">
                        <div>
                            <label className="block text-gray-400 mb-2">Email Subject</label>
                            <input
                                className="input-field w-full"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                placeholder="e.g. 🔥 Flash Sale: 50% Off Everything!"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-2">Email Content (HTML Supported)</label>
                            <textarea
                                className="input-field w-full"
                                style={{ minHeight: '300px', fontFamily: 'monospace' }}
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder="<h1>Big News!</h1><p>We are launching...</p>"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-2">Tip: Use simple HTML for formatting.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={sending}
                            className="btn btn-primary w-full"
                            style={{ padding: '1rem', fontSize: '1.2rem' }}
                        >
                            {sending ? 'Sending...' : '🚀 Broadcast to Subscribers'}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </main>
    );
}
