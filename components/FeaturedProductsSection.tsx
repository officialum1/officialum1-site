"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getPlatformIcon } from "@/lib/icons";
import { readJson } from "@/lib/read-json";

// Sample real product data to show when API fails or loads
const SAMPLE_PRODUCTS = [
    { id: 101, name: "Netflix Premium (4K UHD) - 1 Month", price: "4.99", platform: "Netflix", image: "", stock: 12 },
    { id: 102, name: "Spotify Individual - 3 Months", price: "9.99", platform: "Spotify", image: "", stock: 8 },
    { id: 103, name: "Disney+ Bundle - 1 Year", price: "19.99", platform: "Disney+", image: "", stock: 5 },
    { id: 104, name: "NordVPN - 2 Year Plan", price: "2.50", platform: "VPN", image: "", stock: 20 },
];

export default function FeaturedProductsSection() {
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/products")
            .then((res) => readJson<any[]>(res))
            .then((data) => {
                const featured = Array.isArray(data) && data.length > 0 ? data.slice(0, 4) : SAMPLE_PRODUCTS;
                setProducts(featured);
            })
            .catch(() => setProducts(SAMPLE_PRODUCTS));
    }, []);

    return (
        <section
            className="section-padding"
            style={{ background: "var(--bg-section)" }}
            aria-label="Top digital products"
        >
            <div className="container">
                <div className="mb-10 text-center md:mb-14">
                    <div
                        className="mx-auto mb-4 inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]"
                        style={{
                            borderColor: "var(--border-subtle)",
                            background: "var(--bg-card)",
                            color: "var(--accent-blue)",
                        }}
                    >
                        🔥 Trending Now
                    </div>
                    <h2
                        className="mb-3 text-[clamp(2rem,4vw,2.6rem)] font-extrabold leading-tight"
                        style={{ fontFamily: "var(--font-space-grotesk), sans-serif", color: "var(--text-primary)" }}
                    >
                        Our Top{" "}
                        <span
                            style={{
                                background: "linear-gradient(135deg, var(--accent-blue), var(--accent-violet))",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            Digital Products
                        </span>
                    </h2>
                    <p
                        className="mx-auto max-w-xl text-sm md:text-base"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Instant access to premium subscriptions and accounts, delivered securely and at lightning speed.
                    </p>
                </div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    variants={{
                        hidden: { opacity: 0, y: 24 },
                        visible: {
                            opacity: 1,
                            y: 0,
                            transition: { staggerChildren: 0.08, duration: 0.5 },
                        },
                    }}
                    className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
                >
                    {products.map((product) => (
                        <motion.article
                            key={product.id}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 },
                            }}
                            className="productCard group relative flex flex-col rounded-2xl p-5 glassCard"
                            style={{
                                WebkitBackdropFilter: "blur(24px)",
                            }}
                        >
                            <div
                                className="absolute right-4 top-4 rounded-full px-3 py-1 text-[0.7rem] font-medium uppercase tracking-wide"
                                style={{
                                    background: "rgba(20,108,120,0.08)",
                                    color: "var(--text-muted)",
                                    border: "1px solid var(--border-subtle)",
                                }}
                            >
                                {product.platform}
                            </div>

                            <div className="mb-4 flex justify-center">
                                <div
                                    className="flex h-20 w-20 items-center justify-center rounded-2xl"
                                    style={{
                                        background: "rgba(20,108,120,0.08)",
                                        border: "1px solid var(--border-subtle)",
                                    }}
                                >
                                    <img
                                        src={getPlatformIcon(product.platform, product.image)}
                                        alt={product.name}
                                        className="h-12 w-12 object-contain"
                                        loading="lazy"
                                    />
                                </div>
                            </div>

                            <Link
                                href={`/shop/${product.id}`}
                                style={{ textDecoration: "none", color: "inherit" }}
                                className="block"
                            >
                                <h3
                                    className="truncate text-[0.98rem] font-semibold"
                                    style={{ color: "var(--text-primary)" }}
                                >
                                    {product.name}
                                </h3>
                            </Link>

                            <div className="mt-4 flex items-end justify-between gap-3">
                                <div>
                                    <div
                                        className="text-xl font-extrabold"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, var(--accent-blue), var(--accent-violet))",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            backgroundClip: "text",
                                            fontFamily: "var(--font-space-grotesk), sans-serif",
                                        }}
                                    >
                                        ${product.price}
                                    </div>
                                    {typeof product.stock === "number" && (
                                        <p
                                            className="mt-1 text-[0.72rem]"
                                            style={{ color: "var(--text-muted)" }}
                                        >
                                            {product.stock} in stock
                                        </p>
                                    )}
                                </div>
                                <Link
                                    href={`/shop/${product.id}`}
                                    className="inline-flex flex-1 items-center justify-center rounded-full px-4 py-2 text-xs font-semibold text-white transition-transform duration-150 sm:flex-none"
                                    style={{
                                        background: "var(--gradient)",
                                        boxShadow: "var(--glow-blue)",
                                    }}
                                    aria-label={`View ${product.name}`}
                                >
                                    Add to Cart
                                </Link>
                            </div>
                        </motion.article>
                    ))}
                </motion.div>

                <div className="mt-10 text-center">
                    <Link
                        href="/shop"
                        className="inline-flex items-center justify-center rounded-full border px-6 py-2.5 text-sm font-semibold"
                        style={{
                            borderColor: "var(--border-subtle)",
                            color: "var(--text-primary)",
                            background: "transparent",
                        }}
                    >
                        View All Products →
                    </Link>
                </div>
            </div>
            <style jsx>{`
              .productCard {
                transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 220ms ease, border-color 220ms ease;
              }
              .productCard:hover {
                transform: translateY(-6px);
                border-color: rgba(20, 108, 120, 0.35);
                box-shadow: 0 20px 50px rgba(24, 32, 38, 0.12);
              }
            `}</style>
        </section>
    );
}
