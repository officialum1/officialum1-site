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
                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Your Current Metrics</h3>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Monthly Traffic (Visits)</label>
                            <input
                                type="number"
                                value={traffic}
                                onChange={(e) => setTraffic(Number(e.target.value))}
                                className="input-field"
                                style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Conversion Rate (%)</label>
                            <input
                                type="number"
                                value={conversionRate}
                                onChange={(e) => setConversionRate(Number(e.target.value))}
                                className="input-field"
                                style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Average Order Value ($)</label>
                            <input
                                type="number"
                                value={orderValue}
                                onChange={(e) => setOrderValue(Number(e.target.value))}
                                className="input-field"
                                style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                            />
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px', background: 'linear-gradient(145deg, rgba(79, 70, 229, 0.1), rgba(6, 182, 212, 0.1))', border: '1px solid var(--primary)' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'white' }}>Projected Monthly Growth</h3>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <span style={{ color: '#ccc' }}>Current Revenue:</span>
                            <span style={{ fontWeight: 'bold' }}>${currentRevenue.toLocaleString()}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <span style={{ color: '#00ff88' }}>Potential Revenue:</span>
                            <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#00ff88' }}>${projectedRevenue.toLocaleString()}</span>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '0.5rem' }}>Additional Monthly Revenue</div>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', background: 'linear-gradient(to right, #00ff88, #00b8ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
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
