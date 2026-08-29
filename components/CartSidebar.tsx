"use client";

import { useCart } from "@/app/context/CartContext";
import { getPlatformIcon } from "@/lib/icons";
import { ShoppingBag, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function CartSidebar() {
    const { cart, removeFromCart, clearCart, cartTotal, isCartOpen, toggleCart } = useCart();
    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isCartOpen) {
                toggleCart();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isCartOpen, toggleCart]);

    if (!isCartOpen) return null;

    return (
        <div
            ref={sidebarRef}
            style={{
                position: "fixed",
                top: 0,
                right: 0,
                width: "min(100vw, 400px)",
                height: "100vh",
                background: "rgba(255,255,255,0.98)",
                borderLeft: "1px solid var(--border-subtle)",
                backdropFilter: "blur(20px)",
                transition: "transform 0.3s ease",
                zIndex: 99999,
                display: "flex",
                flexDirection: "column",
                boxShadow: "-16px 0 40px rgba(24,32,38,0.14)",
            }}
        >
            <div
                style={{
                    padding: "1.5rem",
                    borderBottom: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h2
                    style={{
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}
                >
                    <ShoppingCart size={20} />
                    Your Cart ({cart.length})
                </h2>
                <button
                    onClick={toggleCart}
                    style={{
                        background: "#fff",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-muted)",
                        width: "36px",
                        height: "36px",
                        borderRadius: "999px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    aria-label="Close cart"
                >
                    <X size={18} />
                </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
                {cart.length === 0 ? (
                    <div style={{ textAlign: "center", marginTop: "3rem", color: "var(--text-muted)" }}>
                        <div
                            style={{
                                width: "68px",
                                height: "68px",
                                margin: "0 auto 1rem",
                                borderRadius: "20px",
                                background: "rgba(20,108,120,0.08)",
                                color: "var(--accent-blue)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <ShoppingBag size={30} />
                        </div>
                        <p style={{ color: "var(--text-muted)" }}>Your cart is empty.</p>
                        <button onClick={toggleCart} className="btn btn-outline" style={{ marginTop: "1rem" }}>
                            Browse Shop
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {cart.map((item) => (
                            <div
                                key={item.uniqueId}
                                style={{
                                    display: "flex",
                                    gap: "1rem",
                                    background: "var(--bg-base)",
                                    border: "1px solid var(--border-subtle)",
                                    padding: "1rem",
                                    borderRadius: "12px",
                                }}
                            >
                                <div style={{ minWidth: "50px" }}>
                                    <img
                                        src={getPlatformIcon(item.platform, item.image)}
                                        alt={item.platform}
                                        style={{ width: "50px", height: "50px", objectFit: "contain" }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: "bold" }}>
                                        {item.name}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "0.8rem",
                                            color: "var(--accent-blue)",
                                            marginBottom: "0.5rem",
                                            fontWeight: 700,
                                        }}
                                    >
                                        ${item.price}
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.uniqueId)}
                                        style={{
                                            fontSize: "0.75rem",
                                            color: "var(--accent-violet)",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            padding: 0,
                                        }}
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
                <div style={{ padding: "1.5rem", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-base)" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "1rem",
                            fontSize: "1.1rem",
                            fontWeight: "bold",
                            color: "var(--text-primary)",
                        }}
                    >
                        <span>Total:</span>
                        <span style={{ color: "var(--accent-blue)" }}>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button
                            onClick={clearCart}
                            className="btn btn-outline"
                            style={{ flex: 1, borderColor: "rgba(196,71,45,0.35)", color: "var(--accent-violet)" }}
                        >
                            Clear
                        </button>
                        <Link href="/checkout" onClick={toggleCart} className="btn btn-primary" style={{ flex: 2, textAlign: "center" }}>
                            Checkout Now
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
