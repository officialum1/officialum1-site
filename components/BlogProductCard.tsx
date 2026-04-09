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
        <div className="glass" style={{
            margin: '2rem 0',
            padding: '1.5rem',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0,0,0,0) 100%)'
        }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                <img
                    src={image || `https://api.dicebear.com/7.x/initials/svg?seed=${platform}&backgroundColor=00ff88`}
                    alt={name}
                    style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ color: '#00ff88', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Recommended Service</div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{name}</h4>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>Starting at ${price}</div>
            </div>
            <Link href={`/checkout?id=${id}`} className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', fontSize: '0.9rem' }}>
                Buy Now
            </Link>
        </div>
    );
}
