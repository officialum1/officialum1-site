"use client";

import { useState } from 'react';

const faqs = [
    {
        question: "How long does it take to rank on Google?",
        answer: "SEO is a long-term strategy. Typically, you can expect to see significant improvements in 3-6 months. However, our 'Quick Wins' audit often identifies fixes that boost traffic in just a few weeks."
    },
    {
        question: "Do you offer custom web development?",
        answer: "Yes! We don't just use templates. We build custom, high-speed websites using Next.js and React that are tailored to your specific business needs and brand identity."
    },
    {
        question: "What is 'Rank and Rent'?",
        answer: "Rank and Rent is a digital real estate model where we build a website, rank it at the top of Google for specific local keywords, and then 'rent' the leads or the site itself to a local business owner."
    },
    {
        question: "How much do your services cost?",
        answer: "We offer tailored packages based on your goals. Whether you need a one-time website build or monthly SEO management, we have a solution that fits your budget. Contact us for a free quote."
    }
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="section-padding">
            <div className="container">
                <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Frequently Asked <span className="text-gradient">Questions</span></h2>
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {faqs.map((faq, index) => (
                        <div key={index}
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="glass"
                            style={{
                                borderRadius: '16px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                border: openIndex === index ? '1px solid var(--primary)' : '1px solid var(--glass-border)'
                            }}
                        >
                            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', color: openIndex === index ? 'var(--text-primary)' : 'var(--text-primary)' }}>{faq.question}</h4>
                                <span style={{
                                    transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s ease',
                                    color: 'var(--accent)',
                                    fontSize: '1.5rem'
                                }}>↓</span>
                            </div>
                            <div style={{
                                maxHeight: openIndex === index ? '200px' : '0',
                                overflow: 'hidden',
                                transition: 'max-height 0.3s ease',
                                padding: openIndex === index ? '0 1.5rem 1.5rem 1.5rem' : '0 1.5rem'
                            }}>
                                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
