"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { MessageSquare, Send, HelpCircle, CheckCircle2, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';

export default function SupportPage() {
    const [user, setUser] = useState<any>(null);
    const [tickets, setTickets] = useState<any[]>([]);
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTicket, setActiveTicket] = useState<number | null>(null);
    const [replyMsg, setReplyMsg] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('buyer_user');
        if (stored) {
            try {
                const u = JSON.parse(stored);
                setUser(u);
                setEmail(u.email || '');
                fetchTickets(u.id);
            } catch { }
        }
    }, []);

    const fetchTickets = async (userId: string) => {
        try {
            const res = await fetch(`/api/tickets?userId=${userId}`);
            if (res.ok) setTickets(await res.json());
        } catch { }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user ? user.id : 'guest',
                    email: user ? user.email : email,
                    subject,
                    message,
                    attachment
                })
            });
            setSubject('');
            setMessage('');
            setAttachment('');
            if (user) fetchTickets(user.id);
            alert('Your support ticket has been submitted successfully. We will reply via email shortly.');
        } catch {
            alert('Failed to create ticket. Please contact hello@officialum1.com');
        }
        setIsSubmitting(false);
    };

    const handleReply = async (ticketId: number) => {
        if (!replyMsg) return;
        try {
            await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reply', ticketId, message: replyMsg, sender: 'user' })
            });
            setReplyMsg('');
            if (user) fetchTickets(user.id);
        } catch {
            alert('Failed to send reply');
        }
    };

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            <Navbar />
            
            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[
                        { label: "Home", href: "/" },
                        { label: "Support Desk" }
                    ]}
                    label="24/7 Client Assistance"
                    title={<>OfficialUM1 <span style={{ color: "var(--accent-blue)" }}>Priority Support</span> Center</>}
                    description="Submit technical tickets, inquire about delivery updates, or request assistance with payment and custom development services."
                    right={
                        <Link
                            href="/faq"
                            className="inline-flex items-center gap-2 rounded-xl px-6 py-4 text-sm font-black text-white"
                            style={{ background: "var(--gradient)", boxShadow: "var(--glow-blue)" }}
                        >
                            <HelpCircle className="h-4 w-4" /> Browse FAQ
                        </Link>
                    }
                />

                <section className="py-20 sm:py-28" style={{ background: "var(--bg-base)" }}>
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                            {/* Create Ticket */}
                            <div
                                className="rounded-3xl border p-8 sm:p-10"
                                style={{
                                    background: "#ffffff",
                                    borderColor: "var(--border-subtle)",
                                    boxShadow: "0 12px 30px rgba(24,32,38,0.06)"
                                }}
                            >
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                        Create New Support Ticket
                                    </h2>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {!user && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Your Email Address</label>
                                            <input
                                                type="email"
                                                placeholder="name@company.com"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                style={{ borderColor: "var(--border-subtle)", background: "var(--bg-base)" }}
                                                required
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Subject</label>
                                        <input
                                            placeholder="Order inquiry, technical fix, or general question..."
                                            value={subject}
                                            onChange={e => setSubject(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            style={{ borderColor: "var(--border-subtle)", background: "var(--bg-base)" }}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Detailed Message</label>
                                        <textarea
                                            placeholder="Please provide details regarding your query or order ID..."
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                            rows={5}
                                            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            style={{ borderColor: "var(--border-subtle)", background: "var(--bg-base)" }}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Attachment URL (Optional)</label>
                                        <input
                                            placeholder="https://imgur.com/... or Google Drive link"
                                            value={attachment}
                                            onChange={e => setAttachment(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            style={{ borderColor: "var(--border-subtle)", background: "var(--bg-base)" }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 rounded-xl text-sm font-extrabold text-white shadow-md transition-all flex items-center justify-center gap-2"
                                        style={{ background: "var(--gradient)", boxShadow: "var(--glow-blue)" }}
                                    >
                                        <Send className="h-4 w-4" /> {isSubmitting ? 'Submitting Ticket...' : 'Submit Priority Ticket'}
                                    </button>
                                </form>
                            </div>

                            {/* Ticket History / Contact Options */}
                            <div className="space-y-6">
                                {user && (
                                    <div
                                        className="rounded-3xl border p-8"
                                        style={{
                                            background: "#ffffff",
                                            borderColor: "var(--border-subtle)",
                                            boxShadow: "0 12px 30px rgba(24,32,38,0.06)"
                                        }}
                                    >
                                        <h2 className="text-xl font-black text-gray-900 mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                            My Active Tickets
                                        </h2>

                                        <div className="space-y-3 max-h-80 overflow-y-auto">
                                            {tickets.length === 0 && (
                                                <p className="text-xs text-gray-400 py-4 text-center">No active tickets found.</p>
                                            )}
                                            {tickets.map(t => (
                                                <div
                                                    key={t.id}
                                                    className="p-4 rounded-2xl border transition-all cursor-pointer"
                                                    style={{
                                                        background: "var(--bg-base)",
                                                        borderColor: t.status === 'open' ? "var(--primary)" : "var(--border-subtle)"
                                                    }}
                                                    onClick={() => setActiveTicket(activeTicket === t.id ? null : t.id)}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="text-sm font-bold text-gray-900">{t.subject}</h4>
                                                        <span className={`text-xs px-2 py-0.5 rounded font-extrabold ${t.status === 'open' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-200 text-gray-700'}`}>
                                                            {t.status.toUpperCase()}
                                                        </span>
                                                    </div>

                                                    {activeTicket === t.id && (
                                                        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                                                            <p className="mb-2">{t.message}</p>
                                                            {t.attachment && (
                                                                <a href={t.attachment} target="_blank" rel="noopener noreferrer" className="text-primary font-bold underline">
                                                                    📎 View Attachment
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Direct Contact Card */}
                                <div
                                    className="rounded-3xl border p-8"
                                    style={{
                                        background: "#ffffff",
                                        borderColor: "var(--border-subtle)",
                                        boxShadow: "0 12px 30px rgba(24,32,38,0.06)"
                                    }}
                                >
                                    <h3 className="text-lg font-black text-gray-900 mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                        Direct Communication Channels
                                    </h3>
                                    <div className="space-y-4 text-xs text-gray-600">
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                                            <Mail className="h-5 w-5 text-primary" />
                                            <div>
                                                <div className="font-bold text-gray-900">Email Desk</div>
                                                <div>hello@officialum1.com</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                                            <ShieldCheck className="h-5 w-5 text-primary" />
                                            <div>
                                                <div className="font-bold text-gray-900">Guaranteed Response SLA</div>
                                                <div>Under 2 Hours for Active Clients</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </main>
    );
}

