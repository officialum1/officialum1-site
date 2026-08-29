"use client";

import Link from 'next/link';

interface ProductCardProps {
    id: string | number;
    name: string;
    price: string;
    platform: string;
    image?: string;
}

export default function BlogProductCard({ id, name, price, platform, image }: ProductCardProps) {
    return (
        <div style={{
            margin: '2rem 0',
            padding: '1.5rem',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            border: '1px solid var(--border-subtle)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f2f7f6 100%)',
            boxShadow: '0 16px 34px rgba(24,32,38,0.08)'
        }}>
            <div style={{ background: '#eef6f4', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
                <img
                    src={image || '/logo.jpg'}
                    alt={name}
                    style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--accent-blue)', fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase' }}>Recommended Service</div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>{name}</h4>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-secondary)' }}>Starting at ${price}</div>
            </div>
            <Link href={`/checkout?id=${id}`} className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', fontSize: '0.9rem' }}>
                Buy Now
            </Link>
        </div>
    );
}
