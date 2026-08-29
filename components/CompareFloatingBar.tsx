"use client";

import React from 'react';
import { useCompare } from '@/app/context/CompareContext';
import Link from 'next/link';

export default function CompareFloatingBar() {
    const { compareList, removeFromCompare, clearCompare } = useCompare();

    if (compareList.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            width: '90%',
            maxWidth: '600px',
            background: 'rgba(5, 5, 7, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--accent)',
            borderRadius: '100px',
            padding: '0.8rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 40px rgba(0, 195, 255, 0.3)',
            animation: 'compareBarSlideUp 0.3s ease-out'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'var(--accent)', color: '#000', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {compareList.length} Accounts
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {compareList.map(item => (
                        <div key={item.id} style={{ position: 'relative', width: '35px', height: '35px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                            <img src={item.image || '/logo.jpg'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            <button
                                onClick={() => removeFromCompare(item.id)}
                                style={{ position: 'absolute', top: 0, right: 0, background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '50%', width: '15px', height: '15px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >✕</button>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={clearCompare} style={{ background: 'none', border: 'none', color: '#888', fontSize: '0.85rem', cursor: 'pointer' }}>Clear</button>
                <Link href="/shop/compare" style={{ background: '#00ff88', color: '#000', textDecoration: 'none', padding: '0.5rem 1.5rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    Compare Now
                </Link>
            </div>

            <style jsx>{`
                @keyframes compareBarSlideUp {
                    from { transform: translate(-50%, 100px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
