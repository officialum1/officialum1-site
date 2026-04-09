"use client";
import React, { useState, useEffect } from 'react';
import { modernAlert } from '@/components/ModernUIOverlay';

export default function WhatsAppTab() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 10000); // Poll every 10 seconds for new messages
        return () => clearInterval(interval);
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/admin/whatsapp');
            const data = await res.json();
            if (Array.isArray(data)) setMessages(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', color: '#888' }}>Loading WhatsApp Inbox...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ color: '#25D366', fontWeight: 'bold' }}>📱 WhatsApp Business Inbox</h2>
            <div style={{ background: 'rgba(37, 211, 102, 0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(37, 211, 102, 0.3)', marginBottom: '2.5rem' }}>
                <p style={{ margin: 0, color: '#ddd', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    This is your live inbox connected to the Meta WhatsApp Cloud API. <br />
                    <strong>Webhook URL:</strong> <code style={{ color: '#00f', padding: '0.2rem 0.5rem', background: '#fff', borderRadius: '4px' }}>https://officialum1.com/api/whatsapp/webhook</code> <br />
                    <strong>Verify Token:</strong> <code style={{ color: '#00f', padding: '0.2rem 0.5rem', background: '#fff', borderRadius: '4px' }}>officialum1_whatsapp_webhook</code>
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {messages.length === 0 ? (
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '4rem', borderRadius: '12px', textAlign: 'center', color: '#888' }}>
                        No messages yet. When a customer sends a WhatsApp text to your connected number, it will sync and appear here automatically.
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} style={{
                            background: msg.direction === 'inbound' ? 'rgba(37, 211, 102, 0.05)' : 'rgba(0,100,255,0.05)',
                            borderLeft: msg.direction === 'inbound' ? '4px solid #25D366' : '4px solid #00c3ff',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{msg.sender_name} <span style={{ color: '#888', fontSize: '0.9rem', fontWeight: 'normal' }}>({msg.sender_phone})</span></strong>
                                <span style={{ color: '#666', fontSize: '0.85rem' }}>{new Date(msg.created_at).toLocaleString()}</span>
                            </div>
                            <p style={{ color: '#ddd', margin: 0, fontSize: '1rem', lineHeight: '1.5' }}>{msg.message_text}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
