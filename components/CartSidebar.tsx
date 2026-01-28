"use client";

import { useCart } from "@/app/context/CartContext";
import { getPlatformIcon } from "@/lib/icons";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function CartSidebar() {
    const { cart, removeFromCart, clearCart, cartTotal, isCartOpen, toggleCart } = useCart();
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isCartOpen) {
                toggleCart();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isCartOpen, toggleCart]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            right: isCartOpen ? 0 : '-400px',
            width: '100%',
            maxWidth: '400px',
            height: '100vh',
            background: 'rgba(10,10,10,0.95)',
            borderLeft: '1px solid #333',
            backdropFilter: 'blur(20px)',
            transition: 'right 0.3s ease',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-5px 0 20px rgba(0,0,0,0.5)'
        }} ref={sidebarRef}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>🛒 Your Cart ({cart.length})</h2>
                <button onClick={toggleCart} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '3rem', color: '#666' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🕸️</div>
                        <p>Your cart is empty.</p>
                        <button onClick={toggleCart} className="btn btn-outline" style={{ marginTop: '1rem' }}>Browse Shop</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {cart.map((item, index) => (
                            <div key={item.uniqueId} style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ minWidth: '50px' }}>
                                    <img src={getPlatformIcon(item.platform, item.image)} alt={item.platform} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 'bold' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#00ff88', marginBottom: '0.5rem' }}>${item.price}</div>
                                    <button
                                        onClick={() => removeFromCart(item.uniqueId)}
                                        style={{ fontSize: '0.75rem', color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {cart.length > 0 && (
                <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>
                        <span>Total:</span>
                        <span style={{ color: '#00ff88' }}>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={clearCart} className="btn btn-outline" style={{ flex: 1, borderColor: '#ff4d4d', color: '#ff4d4d' }}>Clear</button>
                        <Link href="/checkout" onClick={toggleCart} className="btn btn-primary" style={{ flex: 2, textAlign: 'center' }}>
                            Checkout Now
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
