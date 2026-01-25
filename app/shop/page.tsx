"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getPlatformIcon } from '@/lib/icons';

export default function ShopPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [shareId, setShareId] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(e => setLoading(false));
    }, []);

    const filtered = filter === 'All' ? products : products.filter(p => p.platform === filter);
    const platforms = ['All', ...Array.from(new Set(products.map((p: any) => p.platform)))];

    return (
        <main>
            <Navbar />
            <div className="container page-header">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 className="text-4xl font-bold mb-4">Premium <span className="text-gradient">Social Accounts</span></h1>
                    <p style={{ color: '#aaa', fontSize: '1.2rem' }}>Buy aged, verified, and high-quality accounts instantly.</p>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                    {platforms.map(p => (
                        <button
                            key={p}
                            onClick={() => setFilter(p)}
                            className={`btn ${filter === p ? 'btn-primary' : 'btn-outline'}`}
                            style={{ minWidth: '100px' }}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <div className="loader" style={{ margin: '0 auto 1rem' }}></div>
                        <p style={{ color: '#888' }}>Loading products...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid-3">
                            {filtered.map(item => (
                                <div key={item.id} className="glass" style={{ borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                    {/* Share Button Overlay */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigator.clipboard.writeText(`${window.location.origin}/shop/${item.id}`);
                                            setShareId(item.id);
                                            setTimeout(() => setShareId(null), 2000);
                                        }}
                                        style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 10, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: shareId === item.id ? '#00ff88' : '#fff', cursor: 'pointer', fontSize: '0.9rem' }}
                                        title="Copy Product Link"
                                    >
                                        {shareId === item.id ? '✓' : '🔗'}
                                    </button>

                                    <Link href={`/shop/${item.id}`} style={{ padding: '2rem', display: 'flex', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}>
                                        <img src={getPlatformIcon(item.platform, item.image)} alt={item.platform} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                                    </Link>
                                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--accent)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            {item.platform}
                                        </div>
                                        <Link href={`/shop/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <h3 style={{ marginBottom: '0.5rem', cursor: 'pointer' }}>{item.name}</h3>
                                        </Link>
                                        <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{item.description}</p>

                                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00ff88' }}>{item.price}</div>
                                            <Link
                                                href={`/checkout?id=${item.id}`}
                                                className="btn btn-outline"
                                                style={{ fontSize: '0.9rem' }}
                                            >
                                                Buy Now
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filtered.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                                No accounts available in this category right now.
                            </div>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </main>
    );
}
