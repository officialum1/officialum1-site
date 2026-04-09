"use client";

import React from 'react';
import { useCompare } from '@/app/context/CompareContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getPlatformIcon } from '@/lib/icons';

export default function ComparePage() {
    const { compareList, removeFromCompare, clearCompare } = useCompare();

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 className="text-4xl font-bold mb-4">Account <span className="text-gradient">Comparison</span></h1>
                    <p style={{ color: '#aaa' }}>Detailed side-by-side analysis of your selected accounts.</p>
                </div>

                {compareList.length === 0 ? (
                    <div className="glass" style={{ textAlign: 'center', padding: '5rem', borderRadius: '30px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>⚖️</div>
                        <h2 style={{ marginBottom: '1rem' }}>Your comparison list is empty</h2>
                        <p style={{ color: '#888', marginBottom: '2rem' }}>Go back to the shop and select up to 4 accounts to compare side-by-side.</p>
                        <Link href="/shop" className="btn btn-primary">Back to Shop</Link>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '24px', overflow: 'hidden' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    <th style={{ padding: '2rem', textAlign: 'left', color: '#888', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Features</th>
                                    {compareList.map(item => (
                                        <th key={item.id} style={{ padding: '2rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', minWidth: '250px' }}>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <img src={getPlatformIcon(item.platform, item.image)} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                                            </div>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item.name}</div>
                                            <div style={{ color: '#00ff88', fontSize: '1.2rem', fontWeight: 'bold' }}>${item.price}</div>
                                            <button
                                                onClick={() => removeFromCompare(item.id)}
                                                style={{ marginTop: '1rem', background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', padding: '0.4rem 1rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.8rem' }}
                                            >Remove</button>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { label: 'Platform', key: 'platform' },
                                    { label: 'Instant Delivery', val: '⚡ Guaranteed' },
                                    { label: 'Verification', val: '✅ Phone/Email' },
                                    { label: 'Account Age', val: 'Aged (Varies)' },
                                    { label: 'Support', val: '24/7 Priority' },
                                    { label: 'Stock Status', render: (item: any) => (item.stock > 0 ? 'In Stock' : 'Limited') }
                                ].map((row, idx) => (
                                    <tr key={idx} style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                        <td style={{ padding: '1.5rem 2rem', color: '#888', fontWeight: 'bold' }}>{row.label}</td>
                                        {compareList.map(item => (
                                            <td key={item.id} style={{ padding: '1.5rem 2rem', textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.03)' }}>
                                                {row.key ? item[row.key] : (row.render ? row.render(item) : row.val)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                <tr>
                                    <td></td>
                                    {compareList.map(item => (
                                        <td key={item.id} style={{ padding: '3rem 2rem', textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.03)' }}>
                                            <Link href={`/shop/${item.id}`} className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>Buy Now</Link>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}
