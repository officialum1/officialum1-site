"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPlatformIcon } from "@/lib/icons";

interface RelatedProductsProps {
    currentProductId: number;
    platform: string;
}

export default function RelatedProducts({ currentProductId, platform }: RelatedProductsProps) {
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                // Filter: Same platform, exclude current product, limit to 4
                const related = data
                    .filter((p: any) => p.platform === platform && p.id !== currentProductId)
                    .slice(0, 4);
                setProducts(related);
            })
            .catch(() => { });
    }, [currentProductId, platform]);

    if (products.length === 0) return null;

    return (
        <div style={{ marginTop: '4rem', paddingBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid #00ff88', paddingLeft: '1rem' }}>
                You Might Also Like
            </h3>
            <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {products.map(p => (
                    <Link href={`/shop/${p.id}`} key={p.id} className="glass" style={{ display: 'block', padding: '1.5rem', borderRadius: '16px', textDecoration: 'none', transition: 'transform 0.2s' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <img src={getPlatformIcon(p.platform, p.image)} alt={p.name} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                        </div>
                        <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#00ff88', fontWeight: 'bold' }}>${p.price}</span>
                            <span style={{ fontSize: '0.7rem', color: '#888' }}>{p.platform}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
