"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWishlist } from "@/app/context/WishlistContext";
import { useCart } from "@/app/context/CartContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getPlatformIcon } from "@/lib/icons";
import { motion, AnimatePresence } from "framer-motion";

export default function WishlistPage() {
    const { wishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />

            <div className="container" style={{ paddingTop: '8rem', paddingBottom: '5rem', maxWidth: '1200px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 className="text-4xl font-bold mb-4">You <span className="text-gradient">Wishlist</span></h1>
                    <p style={{ color: '#aaa', fontSize: '1.2rem' }}>Save your favorite items provided here.</p>
                </div>

                {wishlist.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💔</div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your wishlist is empty</h2>
                        <a href="/shop" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>Browse Shop</a>
                    </div>
                ) : (
                    <motion.div
                        className="grid-3"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: { transition: { staggerChildren: 0.1 } },
                            hidden: { transition: { staggerChildren: 0.05 } }
                        }}
                    >
                        <AnimatePresence mode="popLayout">
                            {wishlist.map((item) => {
                                const isSale = item.sale_price && new Date(item.sale_ends_at) > new Date();
                                const finalPrice = isSale ? item.sale_price : item.price;
                                const isBundle = !!item.bundle_items;

                                return (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                        className="glass"
                                        style={{ borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}
                                    >
                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeFromWishlist(item.id)}
                                            style={{
                                                position: 'absolute', top: '15px', right: '15px', zIndex: 10,
                                                background: 'rgba(255, 77, 77, 0.2)', color: '#ff4d4d', border: '1px solid #ff4d4d',
                                                borderRadius: '50%', width: '30px', height: '30px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                fontSize: '1rem'
                                            }}
                                            title="Remove from Wishlist"
                                        >
                                            ✕
                                        </button>

                                        {isSale && (
                                            <div style={{ position: 'absolute', top: '15px', left: '15px', background: '#ff4d4d', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', zIndex: 10 }}>SALE</div>
                                        )}

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
                                            <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>

                                            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                    {isSale ? (
                                                        <div>
                                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff4d4d' }}>${finalPrice}</div>
                                                            <div style={{ fontSize: '0.85rem', textDecoration: 'line-through', color: '#666' }}>${item.price}</div>
                                                        </div>
                                                    ) : (
                                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00ff88' }}>${item.price}</div>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => addToCart(item)}
                                                    className="btn btn-primary"
                                                    style={{ width: '100%', padding: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                                                >
                                                    🛒 Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
            <Footer />
        </div>
    );
}
