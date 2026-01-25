"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getPlatformIcon } from '@/lib/icons';

export default function SingleProductPage() {
    const params = useParams();
    const id = params.id;
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                const found = data.find((p: any) => p.id.toString() === id);
                setProduct(found);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const handleCopyLink = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>
                <div className="loader" style={{ margin: '0 auto' }}></div>
            </div>
            <Footer />
        </main>
    );

    if (!product) return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>
                <h1>Product Not Found</h1>
                <Link href="/shop" className="btn btn-primary" style={{ marginTop: '2rem' }}>Back to Shop</Link>
            </div>
            <Footer />
        </main>
    );

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px' }}>
                <div className="glass" style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem', borderRadius: '30px', display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: '1', minWidth: '300px', textAlign: 'center' }}>
                        <div className="glass-morphism" style={{ padding: '3rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', display: 'inline-block' }}>
                            <img src={getPlatformIcon(product.platform, product.image)} alt={product.name} style={{ width: '180px', height: '180px', objectFit: 'contain' }} />
                        </div>
                    </div>

                    <div style={{ flex: '1.5', minWidth: '300px' }}>
                        <div style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>
                            {product.platform}
                        </div>
                        <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>{product.name}</h1>
                        <p style={{ color: '#aaa', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                            {product.description || "Premium quality social media account verified and ready for use. Instant delivery after purchase."}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00ff88' }}>
                                ${product.price}
                            </div>
                            <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,255,136,0.1)', color: '#00ff88', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                In Stock
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <Link href={`/checkout?id=${product.id}`} className="btn btn-primary" style={{ flex: 1, textAlign: 'center', padding: '1.2rem' }}>
                                Buy Now Instantly
                            </Link>
                            <button onClick={handleCopyLink} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {copied ? '✅ Link Copied!' : '🔗 Share Product'}
                            </button>
                        </div>

                        <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#888', fontSize: '0.9rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>🛡️</span> Secure Transaction
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#888', fontSize: '0.9rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>⚡</span> Instant Delivery
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#888', fontSize: '0.9rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>🤝</span> 24h Warranty
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#888', fontSize: '0.9rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>⭐</span> Premium Support
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
