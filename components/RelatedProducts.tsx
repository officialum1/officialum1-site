"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPlatformIcon } from "@/lib/icons";
import { readJson } from "@/lib/read-json";

interface RelatedProductsProps {
    currentProductId: number | string;
    platform: string;
}

export default function RelatedProducts({ currentProductId, platform }: RelatedProductsProps) {
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/products")
            .then((res) => readJson<any[]>(res))
            .then((data) => {
                let related = data.filter((p: any) => p.platform === platform && String(p.id) !== String(currentProductId));
                if (related.length < 4) {
                    const fallback = data.filter((p: any) => String(p.id) !== String(currentProductId) && !related.some(r => r.id === p.id));
                    related = [...related, ...fallback].slice(0, 4);
                } else {
                    related = related.slice(0, 4);
                }
                setProducts(related);
            })
            .catch(() => {});
    }, [currentProductId, platform]);

    if (products.length === 0) return null;

    return (
        <section className="related-products" aria-label="Related products">
            <div className="related-heading">
                <span>More from {platform}</span>
                <h2>You Might Also Like</h2>
            </div>

            <div className="related-grid">
                {products.map((p) => (
                    <Link href={`/shop/${p.id}`} key={p.id} className="related-card">
                        <div className="related-image">
                            <img src={getPlatformIcon(p.platform, p.image)} alt={p.name} />
                        </div>
                        <h3>{p.name}</h3>
                        <div>
                            <strong>${p.price}</strong>
                            <span>{p.platform}</span>
                        </div>
                    </Link>
                ))}
            </div>

            <style jsx>{`
                .related-products {
                    margin-top: 3.5rem;
                    padding-bottom: 2rem;
                }

                .related-heading {
                    margin-bottom: 1rem;
                }

                .related-heading span {
                    color: var(--accent-blue);
                    font-size: 0.8rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0;
                }

                .related-heading h2 {
                    margin: 0.25rem 0 0;
                    color: var(--text-primary);
                    font-size: 1.8rem;
                }

                .related-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 1rem;
                }

                .related-card {
                    display: grid;
                    gap: 0.9rem;
                    padding: 1rem;
                    border: 1px solid var(--border-subtle);
                    border-radius: 16px;
                    background: #ffffff;
                    color: var(--text-primary);
                    text-decoration: none;
                    box-shadow: 0 12px 30px rgba(24, 32, 38, 0.06);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .related-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 16px 34px rgba(24, 32, 38, 0.1);
                }

                .related-image {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    aspect-ratio: 1.15;
                    border-radius: 12px;
                    background: var(--bg-section-alt);
                }

                .related-image img {
                    width: 70px;
                    height: 70px;
                    object-fit: contain;
                }

                h3 {
                    margin: 0;
                    color: var(--text-primary);
                    font-size: 1rem;
                    line-height: 1.35;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .related-card div:last-child {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 0.75rem;
                }

                strong {
                    color: var(--accent-blue);
                    font-size: 1rem;
                }

                .related-card span {
                    color: var(--text-muted);
                    font-size: 0.75rem;
                    white-space: nowrap;
                }

                @media (max-width: 900px) {
                    .related-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }

                @media (max-width: 560px) {
                    .related-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </section>
    );
}
