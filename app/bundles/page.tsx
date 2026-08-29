"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/app/context/CartContext';
import { getPlatformIcon } from '@/lib/icons';

export default function BundleBuilder() {
    const [products, setProducts] = useState<any[]>([]);
    const [selected, setSelected] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data.filter((p: any) => (p.stock > 0 || p.inventoryStock > 0)));
                setLoading(false);
            });
    }, []);

    const toggleSelect = (product: any) => {
        if (selected.find(s => s.id === product.id)) {
            setSelected(selected.filter(s => s.id !== product.id));
        } else {
            if (selected.length < 5) {
                setSelected([...selected, product]);
            } else {
                alert("Maximum 5 items in a bundle.");
            }
        }
    };

    const isBundleEligible = selected.length >= 3;
    const discount = isBundleEligible ? 0.15 : 0; // 15% off for 3+ items

    const calculateTotal = () => {
        const subtotal = selected.reduce((acc, p) => acc + parseFloat(p.price), 0);
        return (subtotal * (1 - discount)).toFixed(2);
    };

    const handleAddBundle = () => {
        selected.forEach(p => {
            const finalPrice = discount > 0 ? (parseFloat(p.price) * (1 - discount)).toFixed(2) : p.price;
            addToCart({ ...p, price: finalPrice });
        });
        setSelected([]);
        alert("🎉 Bundle added to cart with 15% discount!");
    };

    return (
        <main style={{ minHeight: '100vh', background: '#050505' }}>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: '3.5rem', fontFamily: 'var(--font-outfit)', marginBottom: '1rem' }}>
                        Dynamic <span style={{ color: '#00c3ff' }}>Bundle Builder</span>
                    </h1>
                    <p style={{ color: '#888', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                        Mix and match any accounts. Pick <span style={{ color: '#00ff88', fontWeight: 'bold' }}>3 or more</span> and get an instant <span style={{ color: '#00ff88', fontWeight: 'bold' }}>15% Discount</span>.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem' }}>

                    {/* Product Selection List */}
                    <div>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '5rem' }}>Loading Inventory...</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                {products.map(p => {
                                    const isSelected = selected.find(s => s.id === p.id);
                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => toggleSelect(p)}
                                            className="glass"
                                            style={{
                                                padding: '1.5rem',
                                                borderRadius: '20px',
                                                cursor: 'pointer',
                                                border: isSelected ? '2px solid #00ff88' : '1px solid rgba(255,255,255,0.05)',
                                                background: isSelected ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255,255,255,0.02)',
                                                transition: 'all 0.2s',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <img src={getPlatformIcon(p.platform, p.image)} style={{ width: '50px', height: '50px', marginBottom: '1rem', objectFit: 'contain' }} />
                                            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{p.name}</h4>
                                            <div style={{ fontWeight: 'bold', color: '#00ff88' }}>${p.price}</div>
                                            {isSelected && <div style={{ marginTop: '0.5rem', color: '#00ff88', fontSize: '0.8rem' }}>✓ Selected</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Summary Sidebar */}
                    <div style={{ position: 'sticky', top: '150px', height: 'fit-content' }}>
                        <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Bundle Summary</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                {selected.length === 0 ? (
                                    <p style={{ color: '#555', fontSize: '0.9rem', textAlign: 'center' }}>No items selected yet.</p>
                                ) : (
                                    selected.map(s => (
                                        <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span style={{ color: '#ccc' }}>{s.name}</span>
                                            <span>${s.price}</span>
                                        </div>
                                    ))
                                )}
                            </div>

                            {selected.length > 0 && (
                                <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#888' }}>
                                        <span>Subtotal</span>
                                        <span>${selected.reduce((acc, p) => acc + parseFloat(p.price), 0).toFixed(2)}</span>
                                    </div>
                                    {isBundleEligible ? (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#00ff88' }}>
                                            <span>Bundle Discount (15%)</span>
                                            <span>-${(selected.reduce((acc, p) => acc + parseFloat(p.price), 0) * 0.15).toFixed(2)}</span>
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '0.8rem', color: '#ffaa00', marginBottom: '1rem' }}>
                                            💡 Add {3 - selected.length} more to unlock 15% discount!
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                        <span>Total</span>
                                        <span style={{ color: isBundleEligible ? '#00ff88' : '#fff' }}>${calculateTotal()}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                disabled={selected.length === 0}
                                onClick={handleAddBundle}
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: '2rem', padding: '1rem', background: selected.length === 0 ? '#333' : 'linear-gradient(135deg, #00c3ff 0%, #00ff88 100%)', border: 'none', color: '#000', fontWeight: 'bold' }}
                            >
                                {isBundleEligible ? 'Add Bundle to Cart' : `Select ${Math.max(0, 3 - selected.length)} more`}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
            <Footer />
        </main>
    );
}
