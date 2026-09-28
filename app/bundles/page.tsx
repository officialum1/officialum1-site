"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/app/context/CartContext';
import { getPlatformIcon } from '@/lib/icons';
import Link from 'next/link';
import { Sparkles, CheckCircle2, ArrowRight, Package, ShieldCheck, Zap, Layers } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';

const curatedBundles = [
  {
    id: "bundle-agency-launch",
    name: "Startup & Agency Launch Stack",
    tag: "MOST POPULAR FOR STARTUPS",
    originalPrice: "$749",
    price: "$499",
    savings: "Save $250 (33% OFF)",
    description: "The complete digital foundation. Get high-converting landing pages, sub-1s speed, and global local citations in one package.",
    items: [
      "Custom WordPress / React Landing Page Architecture",
      "90+ PageSpeed & Core Web Vitals Optimization",
      "100 Local Citations & Google Maps 3-Pack Setup",
      "Domain DNS & SSL Configuration",
      "30 Days Dedicated Technical Support"
    ],
    link: "/contact?service=Startup+Launch+Bundle"
  },
  {
    id: "bundle-ecommerce-pro",
    name: "E-Commerce Scale & CRO Dominator",
    tag: "BEST ROI FOR STORE OWNERS",
    originalPrice: "$1,899",
    price: "$1,299",
    savings: "Save $600 (32% OFF)",
    description: "Designed to maximize conversions and eliminate checkout abandonment for Shopify, WooCommerce, and Next.js stores.",
    items: [
      "Full E-Commerce CRO & Checkout Friction Audit",
      "Instant Cart & AJAX Fragments Speed Fix",
      "Multi-Currency & Stripe/Crypto Payment Setup",
      "High-Converting Upsell & Order Bump Logic",
      "60 Days Performance Retainer"
    ],
    featured: true,
    link: "/contact?service=Ecommerce+Dominator+Bundle"
  },
  {
    id: "bundle-global-authority",
    name: "Global Authority & SEO Powerhouse",
    tag: "HIGH-DA BACKLINKS & PR",
    originalPrice: "$1,299",
    price: "$849",
    savings: "Save $450 (35% OFF)",
    description: "Skyrocket your domain authority and organic search traffic with guaranteed Tier-1 editorial placements and international citations.",
    items: [
      "1x Tier-1 Guaranteed Press Release (Google News / Yahoo)",
      "5x High-DA 50+ Niche Guest Posts with Dofollow Links",
      "150 Manual Multi-Country Local Citations (USA, UK, UAE)",
      "Keyword & Competitor Backlink Gap Analysis",
      "Full White-Label Excel Reporting"
    ],
    link: "/contact?service=Global+Authority+SEO+Bundle"
  }
];

const fallbackProducts = [
  { id: "b1", name: "Google Ads Verified Pro Account", platform: "Google", price: "49.00", image: "/icons/google.png" },
  { id: "b2", name: "Stripe Business Verified Gateway", platform: "Stripe", price: "99.00", image: "/icons/stripe.png" },
  { id: "b3", name: "AWS Cloud High-Limit Account", platform: "AWS", price: "79.00", image: "/icons/aws.png" },
  { id: "b4", name: "Wise Multi-Currency Business Profile", platform: "Wise", price: "89.00", image: "/icons/wise.png" },
  { id: "b5", name: "Facebook Business Manager 250 Limit", platform: "Meta", price: "59.00", image: "/icons/meta.png" },
  { id: "b6", name: "Telegram Aged Premium Account", platform: "Telegram", price: "29.00", image: "/icons/telegram.png" }
];

export default function BundleBuilder() {
    const [products, setProducts] = useState<any[]>(fallbackProducts);
    const [selected, setSelected] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    const available = data.filter((p: any) => (p.stock > 0 || p.inventoryStock > 0));
                    if (available.length > 0) setProducts(available);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const toggleSelect = (product: any) => {
        if (selected.find(s => s.id === product.id)) {
            setSelected(selected.filter(s => s.id !== product.id));
        } else {
            if (selected.length < 5) {
                setSelected([...selected, product]);
            } else {
                alert("Maximum 5 items in a custom bundle.");
            }
        }
    };

    const isBundleEligible = selected.length >= 3;
    const discount = isBundleEligible ? 0.15 : 0; // 15% off for 3+ items

    const calculateTotal = () => {
        const subtotal = selected.reduce((acc, p) => acc + parseFloat(p.price || 0), 0);
        return (subtotal * (1 - discount)).toFixed(2);
    };

    const handleAddBundle = () => {
        selected.forEach(p => {
            const finalPrice = discount > 0 ? (parseFloat(p.price) * (1 - discount)).toFixed(2) : p.price;
            addToCart({ ...p, price: finalPrice });
        });
        setSelected([]);
        alert("🎉 Custom bundle added to cart with 15% discount!");
    };

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            <Navbar />
            
            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[
                        { label: "Home", href: "/" },
                        { label: "Store", href: "/shop" },
                        { label: "Agency Bundles" }
                    ]}
                    label="All-In-One Strategic Packages"
                    title={<>High-Impact <span style={{ color: "var(--accent-blue)" }}>Agency Bundles</span> & Combo Packs</>}
                    description="Supercharge your growth while saving up to 35% with our curated digital agency bundles. Combine development, speed optimization, local SEO, and authority backlink packages."
                    right={
                        <a
                            href="#custom-builder"
                            className="inline-flex items-center gap-2 rounded-xl px-6 py-4 text-sm font-black text-white"
                            style={{ background: "var(--gradient)", boxShadow: "var(--glow-blue)" }}
                        >
                            <Package className="h-4 w-4" /> Build Custom Bundle
                        </a>
                    }
                />

                {/* Curated Agency Bundles */}
                <section className="py-20 sm:py-28" style={{ background: "var(--bg-base)" }}>
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent-blue)" }}>
                                Featured Combo Deals
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black mt-2" style={{ color: "var(--text-primary)" }}>
                                Pre-Engineered Growth Bundles
                            </h2>
                            <p className="mt-3 text-base" style={{ color: "var(--text-muted)" }}>
                                Turnkey solutions combining our top-tier services for maximum business impact and cost efficiency.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {curatedBundles.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    className="rounded-3xl border p-8 flex flex-col justify-between transition-all duration-300 relative"
                                    style={{
                                        background: "#ffffff",
                                        borderColor: pkg.featured ? "var(--primary)" : "var(--border-subtle)",
                                        boxShadow: pkg.featured
                                            ? "0 20px 48px rgba(20,108,120,0.14)"
                                            : "0 12px 30px rgba(24,32,38,0.06)",
                                    }}
                                >
                                    {pkg.featured && (
                                        <div
                                            className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-white shadow-md"
                                            style={{ background: "var(--gradient)" }}
                                        >
                                            Most Popular
                                        </div>
                                    )}

                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--accent-blue)" }}>
                                            {pkg.tag}
                                        </div>
                                        <h3 className="text-xl font-black mb-2" style={{ color: "var(--text-primary)" }}>
                                            {pkg.name}
                                        </h3>
                                        <p className="text-xs mb-6 min-h-[36px]" style={{ color: "var(--text-muted)" }}>
                                            {pkg.description}
                                        </p>

                                        <div className="mb-6 flex items-baseline gap-3">
                                            <span className="text-4xl font-black" style={{ color: "var(--text-primary)" }}>
                                                {pkg.price}
                                            </span>
                                            <span className="text-sm line-through text-gray-400">
                                                {pkg.originalPrice}
                                            </span>
                                            <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-50 text-emerald-700">
                                                {pkg.savings}
                                            </span>
                                        </div>

                                        <ul className="space-y-3.5 mb-8 border-t pt-6" style={{ borderColor: "var(--border-subtle)" }}>
                                            {pkg.items.map((item) => (
                                                <li key={item} className="flex items-start gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                                                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--accent-blue)" }} />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Link
                                        href={pkg.link}
                                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-extrabold text-white transition-all shadow-md"
                                        style={{
                                            background: pkg.featured ? "var(--gradient)" : "var(--primary)",
                                            boxShadow: pkg.featured ? "var(--glow-blue)" : "none",
                                        }}
                                    >
                                        Order {pkg.name} <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Custom Bundle Builder */}
                <section id="custom-builder" className="py-20 sm:py-28 border-t" style={{ background: "var(--bg-section)", borderColor: "var(--border-subtle)" }}>
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent-blue)" }}>
                                Mix & Match
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black mt-2" style={{ color: "var(--text-primary)" }}>
                                Dynamic Bundle Builder
                            </h2>
                            <p className="mt-3 text-base" style={{ color: "var(--text-muted)" }}>
                                Select <strong className="text-emerald-600">3 or more assets or services</strong> to automatically unlock an instant <strong className="text-emerald-600">15% Discount</strong> at checkout.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Products Grid */}
                            <div className="lg:col-span-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {products.map((p) => {
                                        const isSelected = !!selected.find(s => s.id === p.id);
                                        return (
                                            <div
                                                key={p.id}
                                                onClick={() => toggleSelect(p)}
                                                className="rounded-2xl border p-5 cursor-pointer transition-all duration-200 relative text-center flex flex-col items-center justify-between"
                                                style={{
                                                    background: "#ffffff",
                                                    borderColor: isSelected ? "var(--primary)" : "var(--border-subtle)",
                                                    boxShadow: isSelected ? "0 0 0 2px var(--primary)" : "0 4px 12px rgba(0,0,0,0.03)"
                                                }}
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                                                    <img src={getPlatformIcon(p.platform, p.image)} alt={p.name} className="w-8 h-8 object-contain" />
                                                </div>
                                                <h4 className="text-xs font-bold text-gray-900 mb-2 line-clamp-2">
                                                    {p.name}
                                                </h4>
                                                <div className="text-sm font-extrabold text-primary mb-3">
                                                    ${parseFloat(p.price || 0).toFixed(2)}
                                                </div>
                                                <div className={`text-xs px-3 py-1 rounded-full font-bold transition-all ${isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                                    {isSelected ? '✓ Selected' : '+ Select'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Summary Sidebar */}
                            <div className="lg:col-span-1">
                                <div
                                    className="rounded-3xl border p-6 sticky top-28"
                                    style={{
                                        background: "#ffffff",
                                        borderColor: "var(--border-subtle)",
                                        boxShadow: "0 12px 30px rgba(0,0,0,0.06)"
                                    }}
                                >
                                    <h3 className="text-lg font-black pb-4 border-b border-gray-100 mb-4 flex items-center justify-between">
                                        Custom Bundle
                                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                                            {selected.length} items
                                        </span>
                                    </h3>

                                    <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                                        {selected.length === 0 ? (
                                            <p className="text-xs text-gray-400 text-center py-6">
                                                Click items on the left to add them to your custom bundle.
                                            </p>
                                        ) : (
                                            selected.map(s => (
                                                <div key={s.id} className="flex justify-between items-center text-xs py-1 border-b border-gray-50">
                                                    <span className="font-medium text-gray-800 truncate max-w-[160px]">{s.name}</span>
                                                    <span className="font-bold text-gray-900">${parseFloat(s.price || 0).toFixed(2)}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {selected.length > 0 && (
                                        <div className="space-y-2 pt-4 border-t border-dashed border-gray-200 text-xs">
                                            <div className="flex justify-between text-gray-500">
                                                <span>Subtotal</span>
                                                <span>${selected.reduce((acc, p) => acc + parseFloat(p.price || 0), 0).toFixed(2)}</span>
                                            </div>
                                            {isBundleEligible ? (
                                                <div className="flex justify-between text-emerald-600 font-bold">
                                                    <span>Bundle Discount (15%)</span>
                                                    <span>-${(selected.reduce((acc, p) => acc + parseFloat(p.price || 0), 0) * 0.15).toFixed(2)}</span>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg font-medium">
                                                    Add {3 - selected.length} more item{3 - selected.length > 1 ? 's' : ''} to unlock 15% discount!
                                                </div>
                                            )}
                                            <div className="flex justify-between items-baseline pt-3 border-t border-gray-100 text-base font-black text-gray-900">
                                                <span>Total</span>
                                                <span className="text-2xl text-emerald-600">${calculateTotal()}</span>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        disabled={selected.length === 0}
                                        onClick={handleAddBundle}
                                        className="w-full mt-6 py-3.5 px-4 rounded-xl text-xs font-black text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                        style={{
                                            background: isBundleEligible ? "var(--gradient)" : "var(--primary)",
                                            boxShadow: isBundleEligible ? "var(--glow-blue)" : "none"
                                        }}
                                    >
                                        {isBundleEligible ? "Add Bundle to Cart (15% Off)" : `Select ${Math.max(0, 3 - selected.length)} more for Discount`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </main>
    );
}

