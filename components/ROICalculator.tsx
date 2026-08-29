"use client";

import { useState } from 'react';

export default function ROICalculator() {
    const [traffic, setTraffic] = useState(1000);
    const [conversionRate, setConversionRate] = useState(2);
    const [orderValue, setOrderValue] = useState(100);

    const projectedTraffic = traffic * 2.5; // Conservative estimate for SEO growth
    const currentRevenue = (traffic * conversionRate / 100) * orderValue;
    const projectedRevenue = (projectedTraffic * conversionRate / 100) * orderValue;
    const increase = projectedRevenue - currentRevenue;

    return (
        <section className="section-padding">
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2>Calculate Your <span className="text-gradient">SEO Potential</span></h2>
                    <p className="subheading">See how much revenue you could be generating with top-tier rankings.</p>
                </div>

                <div className="grid-2" style={{ alignItems: 'start' }}>
                    <div style={{ padding: '2rem', borderRadius: '16px', background: '#fff', border: '1px solid var(--border-subtle)', boxShadow: '0 14px 34px rgba(24,32,38,0.08)' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Your Current Metrics</h3>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Monthly Traffic (Visits)</label>
                            <input
                                type="number"
                                value={traffic}
                                onChange={(e) => setTraffic(Number(e.target.value))}
                                className="input-field"
                                style={{ width: '100%', padding: '1rem', background: '#fff', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: '8px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Conversion Rate (%)</label>
                            <input
                                type="number"
                                value={conversionRate}
                                onChange={(e) => setConversionRate(Number(e.target.value))}
                                className="input-field"
                                style={{ width: '100%', padding: '1rem', background: '#fff', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: '8px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Average Order Value ($)</label>
                            <input
                                type="number"
                                value={orderValue}
                                onChange={(e) => setOrderValue(Number(e.target.value))}
                                className="input-field"
                                style={{ width: '100%', padding: '1rem', background: '#fff', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: '8px' }}
                            />
                        </div>
                    </div>

                    <div style={{ padding: '2rem', borderRadius: '16px', background: 'linear-gradient(135deg, #ffffff, #eef4f2)', border: '1px solid var(--border-subtle)', boxShadow: '0 14px 34px rgba(24,32,38,0.08)' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Projected Monthly Growth</h3>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Current Revenue:</span>
                            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>${currentRevenue.toLocaleString()}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>Potential Revenue:</span>
                            <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--accent-blue)' }}>${projectedRevenue.toLocaleString()}</span>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Additional Monthly Revenue</div>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                +${increase.toLocaleString()}
                            </div>
                        </div>

                        <a href="/contact" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', padding: '1rem' }}>
                            Unlock This Revenue
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
