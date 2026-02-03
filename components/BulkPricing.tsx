"use client";

import React from 'react';

interface BulkPricingProps {
    basePrice: number;
    platform: string;
}

export default function BulkPricing({ basePrice, platform }: BulkPricingProps) {
    const tiers = [
        { qty: '5+', discount: 5, label: 'Starter Bundle' },
        { qty: '10+', discount: 10, label: 'Power User' },
        { qty: '25+', discount: 20, label: 'Bulk Reseller' },
        { qty: '50+', discount: 35, label: 'VIP Partner' },
    ];

    return (
        <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ color: '#fff', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>📈</span> Bulk Buy Discounts
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                {tiers.map((tier, idx) => {
                    const discountedPrice = (basePrice * (1 - tier.discount / 100)).toFixed(2);
                    return (
                        <div key={idx} className="glass" style={{ padding: '1rem', borderRadius: '12px', textAlign: 'center', transition: 'transform 0.2s', cursor: 'default' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{tier.label}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>{tier.qty} Items</div>
                            <div style={{ fontSize: '1.3rem', color: '#00ff88', margin: '0.4rem 0' }}>${discountedPrice}<span style={{ fontSize: '0.7rem', color: '#888' }}>/ea</span></div>
                            <div style={{ fontSize: '0.75rem', background: 'rgba(0,255,136,0.1)', color: '#00ff88', display: 'inline-block', padding: '2px 8px', borderRadius: '4px' }}>
                                Save {tier.discount}%
                            </div>
                        </div>
                    );
                })}
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#666', textAlign: 'center' }}>
                * Discounts automatically applied at checkout for bulk quantities.
            </p>
        </div>
    );
}
