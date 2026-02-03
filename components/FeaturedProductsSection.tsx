"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPlatformIcon } from '@/lib/icons';

// Sample real product data to show when API fails or loads
const SAMPLE_PRODUCTS = [
    { id: 101, name: 'Netflix Premium (4K UHD) - 1 Month', price: '4.99', platform: 'Netflix', image: '', stock: 12 },
    { id: 102, name: 'Spotify Individual - 3 Months', price: '9.99', platform: 'Spotify', image: '', stock: 8 },
    { id: 103, name: 'Disney+ Bundle - 1 Year', price: '19.99', platform: 'Disney+', image: '', stock: 5 },
    { id: 104, name: 'NordVPN - 2 Year Plan', price: '2.50', platform: 'VPN', image: '', stock: 20 },
];

export default function FeaturedProductsSection() {
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                // Get 4 random or newest products
                const featured = data.length > 0 ? data.slice(0, 4) : SAMPLE_PRODUCTS;
                setProducts(featured);
            })
            .catch(() => setProducts(SAMPLE_PRODUCTS));
    }, []);

    return (
        <section className="section-padding">
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div className="glass" style={{ display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '50px', marginBottom: '1rem', color: '#00ff88', border: '1px solid rgba(0,255,136,0.3)', fontSize: '0.85rem' }}>
                        🔥 Trending Now
                    </div>
                    <h2>Our Top <span className="text-gradient">Digital Products</span></h2>
                    <p className="subheading">Instant access to premium subscriptions and accounts.</p>
                </div>

                <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                    {products.map((product) => (
                        <div key={product.id} className="glass" style={{ padding: '1.5rem', borderRadius: '20px', position: 'relative', transition: 'transform 0.3s' }}>
                            <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', color: '#888' }}>
                                {product.platform}
                            </div>

                            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                                <img src={getPlatformIcon(product.platform, product.image)} alt={product.name} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                            </div>

                            <Link href={`/shop/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h4>
                            </Link>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#00ff88' }}>
                                    ${product.price}
                                </div>
                                <Link href={`/shop/${product.id}`} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                                    Buy Now
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <Link href="/shop" className="btn btn-primary" style={{ padding: '1rem 3rem' }}>
                        View All Products
                    </Link>
                </div>
            </div>
        </section>
    );
}
