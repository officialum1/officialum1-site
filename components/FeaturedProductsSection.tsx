"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ShoppingBag } from "lucide-react";
import { getPlatformIcon } from "@/lib/icons";

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
      .then((res) => res.json())
      .then((data) => {
        const featured = Array.isArray(data) && data.length > 0 ? data.slice(0, 4) : SAMPLE_PRODUCTS;
        setProducts(featured);
      })
      .catch(() => setProducts(SAMPLE_PRODUCTS));
  }, []);

  return (
    <section className="section-padding featured-shell">
      <div className="container">
        <div className="featured-header">
          <div>
            <span className="section-label">Featured Products</span>
            <h2>Popular picks, presented in a cleaner storefront</h2>
            <p className="featured-copy">
              Instead of flooding the homepage, we surface a tight set of high-intent products that people can scan
              quickly on desktop or swipe through comfortably on mobile.
            </p>
          </div>

          <div className="featured-note">
            <BadgeCheck size={16} />
            <span>Fast access, clear pricing, fewer distractions</span>
          </div>
        </div>

        <div className="featured-grid">
          {products.map((product) => (
            <article key={product.id} className="featured-card">
              <div className="featured-card-top">
                <div className="featured-brand">
                  <img
                    src={getPlatformIcon(product.platform, product.image)}
                    alt={product.name}
                    className="featured-brand-image"
                  />
                </div>
                <span className="featured-platform">{product.platform}</span>
              </div>

              <Link href={`/shop/${product.id}`} className="featured-title">
                {product.name}
              </Link>

              <div className="featured-meta">
                <span>{product.stock} in stock</span>
                <span>Digital delivery</span>
              </div>

              <div className="featured-footer">
                <div>
                  <p className="featured-price-label">Starts at</p>
                  <div className="featured-price">${product.price}</div>
                </div>

                <Link href={`/shop/${product.id}`} className="featured-action">
                  <ShoppingBag size={16} />
                  Buy now
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="featured-cta">
          <Link href="/shop" className="btn btn-primary">
            View All Products
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <style jsx>{`
        .featured-shell {
          padding-top: 72px;
        }

        .featured-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 28px;
        }

        .featured-header h2 {
          margin-bottom: 12px;
          max-width: 12ch;
        }

        .featured-copy {
          max-width: 620px;
          margin: 0;
        }

        .featured-note {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(15, 23, 42, 0.08);
          color: #334155;
          font-size: 0.92rem;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
        }

        .featured-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .featured-card {
          padding: 22px;
          border-radius: 26px;
          background: linear-gradient(180deg, #ffffff, #f8fbff);
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .featured-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 60px rgba(79, 70, 229, 0.12);
          border-color: rgba(79, 70, 229, 0.18);
        }

        .featured-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .featured-brand {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(6, 182, 212, 0.12));
        }

        .featured-brand-image {
          width: 34px;
          height: 34px;
          object-fit: contain;
        }

        .featured-platform {
          padding: 7px 10px;
          border-radius: 999px;
          background: rgba(79, 70, 229, 0.08);
          color: #4f46e5;
          font-size: 0.78rem;
          font-weight: 700;
        }

        .featured-title {
          display: block;
          color: #0f172a;
          text-decoration: none;
          font-weight: 800;
          line-height: 1.35;
          min-height: 3.8em;
          margin-bottom: 14px;
        }

        .featured-meta {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .featured-meta span {
          font-size: 0.8rem;
          color: #64748b;
          padding: 6px 10px;
          background: rgba(148, 163, 184, 0.08);
          border-radius: 999px;
        }

        .featured-footer {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 12px;
        }

        .featured-price-label {
          margin: 0 0 4px;
          font-size: 0.78rem;
          color: #64748b;
        }

        .featured-price {
          font-size: 1.6rem;
          font-weight: 800;
          color: #0f172a;
        }

        .featured-action {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          border-radius: 14px;
          background: #0f172a;
          color: #ffffff;
          text-decoration: none;
          font-weight: 700;
          white-space: nowrap;
        }

        .featured-cta {
          margin-top: 28px;
          text-align: center;
        }

        @media (max-width: 1100px) {
          .featured-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .featured-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 640px) {
          .featured-grid {
            grid-template-columns: 1fr;
          }

          .featured-card {
            padding: 20px;
            border-radius: 22px;
          }

          .featured-footer {
            align-items: center;
            flex-direction: column;
            align-items: flex-start;
          }

          .featured-action {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}
