"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPlatformIcon } from "@/lib/icons";
import { useCart } from "@/app/context/CartContext";
import ReviewsSection from "@/components/ReviewsSection";
import RelatedProducts from "@/components/RelatedProducts";
import BulkPricing from "@/components/BulkPricing";
import { trackEvent } from "@/lib/analytics";

interface ProductClientProps {
    product: any;
    bundleContents: any[];
}

function toNumber(value: unknown) {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
        const parsed = parseFloat(value.replace(/[^0-9.]/g, ""));
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}

function formatPrice(value: unknown) {
    return `$${toNumber(value).toFixed(2)}`;
}

export default function ProductClient({ product, bundleContents }: ProductClientProps) {
    const [copied, setCopied] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [gateways, setGateways] = useState<any>({ stripe: true, crypto: true, binance: true, wallet: true });
    const [isPurchasing, setIsPurchasing] = useState(false);
    const { addToCart } = useCart();
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [notifyEmail, setNotifyEmail] = useState("");

    useEffect(() => {
        let cancelled = false;

        try {
            const storedUser = localStorage.getItem("buyer_user");
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                fetch(`/api/user/wallet?userId=${parsedUser.id}`)
                    .then((res) => res.json())
                    .then((data) => {
                        if (!cancelled) setWalletBalance(Number(data.balance || 0));
                    })
                    .catch(() => {});
            }
        } catch {
            localStorage.removeItem("buyer_user");
        }

        fetch("/api/admin/settings")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!data?.payment_gateways || cancelled) return;
                try {
                    setGateways(JSON.parse(data.payment_gateways));
                } catch {}
            })
            .catch(() => {});

        if (product) {
            trackEvent("view_item", {
                currency: "USD",
                value: toNumber(product.price),
                items: [
                    {
                        item_id: product.id,
                        item_name: product.name,
                        item_brand: product.platform,
                        price: toNumber(product.price),
                    },
                ],
            });
        }

        return () => {
            cancelled = true;
        };
    }, [product]);

    if (!product) {
        return (
            <div className="container" style={{ paddingTop: "150px", textAlign: "center" }}>
                <h1>Product Not Found</h1>
                <Link href="/shop" className="btn btn-primary" style={{ marginTop: "2rem" }}>
                    Back to Shop
                </Link>
            </div>
        );
    }

    const saleEndsAt = product.sale_ends_at ? new Date(product.sale_ends_at) : null;
    const isSale = Boolean(product.sale_price && saleEndsAt && saleEndsAt > new Date());
    const finalPrice = isSale ? product.sale_price : product.price;
    const finalPriceNumber = toNumber(finalPrice);
    const regularPriceNumber = toNumber(product.price);
    const totalStock = Math.max(0, Number(product.stock || 0)) + Number(product.inventoryStock || 0);
    const platform = product.platform || "Digital Product";
    const productImage = getPlatformIcon(product.platform, product.image);
    const productDescription =
        product.description ||
        "Premium quality digital asset verified and ready for use. Instant delivery after purchase.";

    const handleCopyLink = () => {
        if (typeof window === "undefined") return;
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleNotifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!notifyEmail || !product) return;

        try {
            const res = await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: notifyEmail, productId: product.id }),
            });
            const data = await res.json();

            if (data.success) {
                alert("We will notify you when this product is back in stock.");
                setShowNotifyModal(false);
                setNotifyEmail("");
            } else {
                alert(data.message || "Failed to subscribe.");
            }
        } catch {
            alert("Error subscribing.");
        }
    };

    const handleWalletPurchase = async () => {
        if (!user || walletBalance < finalPriceNumber) {
            alert("Insufficient balance or not logged in.");
            return;
        }

        if (!confirm(`Confirm purchase of ${product.name} for ${formatPrice(finalPrice)} using your wallet?`)) return;

        setIsPurchasing(true);
        try {
            const res = await fetch("/api/checkout/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    productId: product.id,
                    method: "wallet",
                    finalPrice,
                }),
            });
            const data = await res.json();
            if (data.success) {
                window.location.href = `/order-success?orderId=${data.orderId}`;
            } else {
                alert(data.error || "Purchase failed");
            }
        } catch {
            alert("Connection error");
        } finally {
            setIsPurchasing(false);
        }
    };

    const addProductToCart = () => {
        addToCart(product);
        trackEvent("add_to_cart", {
            currency: "USD",
            value: finalPriceNumber,
            items: [
                {
                    item_id: product.id,
                    item_name: product.name,
                    price: finalPriceNumber,
                },
            ],
        });
    };

    return (
        <div className="product-page-shell">
            <div className="container product-detail-container">
                <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
                    <span>/</span>
                    <Link href="/shop" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Shop</Link>
                    <span>/</span>
                    <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>{product.name}</span>
                </div>

                <section className="product-hero-card" aria-label={`${product.name} product details`}>
                    {isSale && (
                        <div className="sale-banner">
                            Flash sale active. Limited-time price available now.
                        </div>
                    )}

                    <div className="product-media">
                        <div className="product-image-card">
                            <img className="product-image" src={productImage} alt={product.name} />
                        </div>
                        <div className="product-media-note">Verified digital product with instant delivery.</div>
                    </div>

                    <div className="product-info">
                        <div className="product-kicker">{platform}</div>
                        <h1 className="product-title">{product.name}</h1>
                        <p className="product-desc">{productDescription}</p>

                        <div className="purchase-panel">
                            <div className="price-stock">
                                <div>
                                    <div className={isSale ? "product-price sale" : "product-price"}>
                                        {formatPrice(finalPrice)}
                                    </div>
                                    {isSale && regularPriceNumber > finalPriceNumber && (
                                        <div className="regular-price">{formatPrice(product.price)}</div>
                                    )}
                                </div>

                                {totalStock > 0 ? (
                                    <div className={totalStock < 5 ? "stock-badge low" : "stock-badge"}>
                                        {totalStock} in Stock
                                    </div>
                                ) : (
                                    <div className="stock-badge out">Out of Stock</div>
                                )}
                            </div>

                            <div className="product-actions">
                                {totalStock > 0 ? (
                                    <>
                                        <Link href={`/checkout?id=${product.id}`} className="product-primary-action">
                                            {isSale ? "Buy Sale Price" : "Buy Now Instantly"}
                                        </Link>
                                        <button type="button" onClick={addProductToCart} className="product-secondary-action">
                                            Add to Cart
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowNotifyModal(true)}
                                        className="product-secondary-action danger"
                                    >
                                        Notify Me
                                    </button>
                                )}

                                {user && gateways.wallet !== false && walletBalance >= finalPriceNumber && totalStock > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleWalletPurchase}
                                        className="product-secondary-action"
                                        disabled={isPurchasing}
                                    >
                                        {isPurchasing ? "Processing..." : `Wallet (${formatPrice(walletBalance)})`}
                                    </button>
                                )}

                                <button type="button" onClick={handleCopyLink} className="product-icon-action" aria-label="Copy product link">
                                    {copied ? "Copied" : "Share"}
                                </button>
                            </div>

                            <BulkPricing basePrice={finalPriceNumber} platform={platform} />
                        </div>

                        <div className="product-proof-grid" aria-label="Product benefits">
                            <div>
                                <span>Instant Delivery</span>
                                <p>Credentials are delivered automatically after payment confirmation.</p>
                            </div>
                            <div>
                                <span>Warranty Included</span>
                                <p>Replacement support is available if the product stops working.</p>
                            </div>
                            <div>
                                <span>24/7 Support</span>
                                <p>Our team can help through live chat or email whenever needed.</p>
                            </div>
                        </div>

                        {bundleContents.length > 0 && (
                            <div className="bundle-panel">
                                <h2>Bundle Includes</h2>
                                <div className="bundle-list">
                                    {bundleContents.map((item) => (
                                        <div key={item.id} className="bundle-item">
                                            <img src={getPlatformIcon(item.platform, item.image)} alt="" />
                                            <div>
                                                <strong>{item.name}</strong>
                                                <span>Individual Price: {formatPrice(item.price)}</span>
                                            </div>
                                            <b>Included</b>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="trust-row">
                            <div>
                                <strong>Verified Seller</strong>
                                <span>Trusted by 5000+ customers</span>
                            </div>
                            <div>
                                <strong>Fast Delivery</strong>
                                <span>Average delivery under 2 minutes</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="product-support-section">
                    <ReviewsSection productId={String(product.id)} />
                    <RelatedProducts currentProductId={product.id} platform={platform} />
                </section>
            </div>

            {showNotifyModal && (
                <div className="product-modal-backdrop" role="dialog" aria-modal="true" aria-label="Back in stock notification">
                    <div className="product-modal">
                        <button
                            type="button"
                            onClick={() => setShowNotifyModal(false)}
                            className="modal-close"
                            aria-label="Close notification modal"
                        >
                            x
                        </button>
                        <h2>Get Notified</h2>
                        <p>
                            We will send you an email as soon as <strong>{product.name}</strong> is back in stock.
                        </p>
                        <form onSubmit={handleNotifySubmit}>
                            <input
                                type="email"
                                required
                                placeholder="Enter your email address"
                                className="input-field"
                                value={notifyEmail}
                                onChange={(e) => setNotifyEmail(e.target.value)}
                            />
                            <button type="submit" className="product-primary-action">
                                Subscribe to Alert
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="product-sticky-bar">
                <div>
                    <strong>{formatPrice(finalPrice)}</strong>
                    <span>{product.name.length > 24 ? `${product.name.substring(0, 24)}...` : product.name}</span>
                </div>
                {totalStock > 0 ? (
                    <Link href={`/checkout?id=${product.id}`} className="product-primary-action">
                        Buy Now
                    </Link>
                ) : (
                    <button type="button" onClick={() => setShowNotifyModal(true)} className="product-secondary-action danger">
                        Notify Me
                    </button>
                )}
            </div>

            <style jsx>{`
                .product-page-shell {
                    position: relative;
                    min-height: 100vh;
                    padding: 128px 0 110px;
                    overflow: hidden;
                    background: linear-gradient(180deg, #f8faf7 0%, #eef4f2 44%, var(--bg-base) 100%);
                    color: var(--text-primary);
                }

                .product-page-shell::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    background-image:
                        linear-gradient(rgba(20,108,120,0.06) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(20,108,120,0.06) 1px, transparent 1px);
                    background-size: 34px 34px;
                    mask-image: linear-gradient(to bottom, black, transparent 62%);
                }

                .product-detail-container {
                    position: relative;
                    z-index: 1;
                    max-width: 1180px !important;
                }

                .product-hero-card {
                    display: grid;
                    grid-template-columns: minmax(0, 1.08fr) minmax(280px, 0.92fr);
                    gap: 3rem;
                    align-items: start;
                    padding: 0;
                    border: 0;
                    border-radius: 0;
                    background: transparent;
                    box-shadow: none;
                }

                .sale-banner {
                    grid-column: 1 / -1;
                    padding: 0.9rem 1rem;
                    border-radius: 12px;
                    background: rgba(196, 71, 45, 0.1);
                    color: #9f321e;
                    font-weight: 800;
                    text-align: center;
                    border: 1px solid rgba(196, 71, 45, 0.22);
                }

                .product-media {
                    order: 2;
                    position: sticky;
                    top: 124px;
                    text-align: center;
                }

                .product-image-card {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    aspect-ratio: 1;
                    max-width: 330px;
                    margin: 0 auto;
                    padding: 2rem;
                    border: 1px solid rgba(20, 108, 120, 0.12);
                    border-radius: 20px;
                    background: linear-gradient(135deg, #ffffff, #edf6f4);
                    box-shadow: 0 18px 44px rgba(24, 32, 38, 0.08);
                }

                .product-image {
                    width: 210px;
                    height: 210px;
                    object-fit: contain;
                }

                .product-media-note {
                    margin: 1rem auto 0;
                    max-width: 320px;
                    color: var(--text-muted);
                    font-size: 0.92rem;
                    line-height: 1.5;
                }

                .product-info {
                    order: 1;
                    min-width: 0;
                }

                .product-kicker {
                    margin-bottom: 0.7rem;
                    color: var(--accent-blue);
                    font-size: 0.85rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0;
                }

                .product-title {
                    margin: 0 0 1rem;
                    color: var(--text-primary);
                    font-size: clamp(2.4rem, 5vw, 4.6rem);
                    line-height: 1.05;
                    font-family: var(--font-space-grotesk), sans-serif;
                    font-weight: 900;
                    letter-spacing: 0;
                }

                .product-desc {
                    margin: 0 0 1.6rem;
                    color: var(--text-muted);
                    max-width: 680px;
                    font-size: 1.08rem;
                    line-height: 1.65;
                }

                .product-proof-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 0.9rem;
                    margin-top: 1rem;
                    margin-bottom: 1.5rem;
                }

                .product-proof-grid > div,
                .trust-row > div,
                .bundle-panel,
                .purchase-panel {
                    border: 1px solid var(--border-subtle);
                    background: #ffffff;
                    box-shadow: 0 14px 34px rgba(24, 32, 38, 0.07);
                }

                .product-proof-grid > div {
                    min-height: 140px;
                    padding: 1rem;
                    border-radius: 14px;
                }

                .product-proof-grid span,
                .trust-row strong,
                .bundle-item strong {
                    display: block;
                    color: var(--text-primary);
                    font-weight: 850;
                    line-height: 1.25;
                }

                .product-proof-grid p {
                    margin: 0.45rem 0 0;
                    color: var(--text-muted);
                    font-size: 0.86rem;
                    line-height: 1.5;
                }

                .bundle-panel {
                    margin-bottom: 1.5rem;
                    padding: 1.2rem;
                    border-radius: 16px;
                }

                .bundle-panel h2 {
                    margin: 0 0 1rem;
                    font-size: 1.1rem;
                }

                .bundle-list {
                    display: grid;
                    gap: 0.75rem;
                }

                .bundle-item {
                    display: grid;
                    grid-template-columns: 38px minmax(0, 1fr) auto;
                    gap: 0.8rem;
                    align-items: center;
                    padding: 0.85rem;
                    border-radius: 12px;
                    background: var(--bg-section-alt);
                }

                .bundle-item img {
                    width: 34px;
                    height: 34px;
                    object-fit: contain;
                }

                .bundle-item span,
                .bundle-item b {
                    color: var(--text-muted);
                    font-size: 0.82rem;
                }

                .purchase-panel {
                    margin-bottom: 1rem;
                    padding: 1.3rem;
                    border-radius: 18px;
                }

                .price-stock {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                    margin-bottom: 1.25rem;
                }

                .product-price {
                    color: var(--accent-blue);
                    font-size: 2.35rem;
                    font-weight: 900;
                    line-height: 1;
                }

                .product-price.sale {
                    color: var(--primary-2);
                }

                .regular-price {
                    margin-top: 0.35rem;
                    color: var(--text-muted);
                    font-size: 1rem;
                    text-decoration: line-through;
                }

                .stock-badge {
                    padding: 0.55rem 0.85rem;
                    border-radius: 999px;
                    background: #ffffff;
                    border: 1px solid rgba(20, 132, 95, 0.24);
                    color: #0f6d51;
                    font-size: 0.84rem;
                    font-weight: 850;
                    white-space: nowrap;
                }

                .stock-badge.low,
                .stock-badge.out,
                .product-secondary-action.danger {
                    color: var(--primary-2);
                }

                .stock-badge.low,
                .stock-badge.out {
                    background: #ffffff;
                    border-color: rgba(196, 71, 45, 0.28);
                }

                .product-actions {
                    display: grid;
                    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) auto;
                    gap: 0.8rem;
                    margin-top: 1.2rem;
                }

                .product-primary-action,
                .product-secondary-action,
                .product-icon-action,
                :global(.product-primary-action),
                :global(.product-secondary-action),
                :global(.product-icon-action) {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 52px;
                    padding: 0.85rem 1rem;
                    border-radius: 12px;
                    font-weight: 850;
                    text-decoration: none;
                    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
                    cursor: pointer;
                }

                .product-primary-action,
                :global(.product-primary-action) {
                    border: 0;
                    background: var(--gradient);
                    color: #ffffff;
                    box-shadow: 0 14px 28px rgba(20, 108, 120, 0.18);
                }

                .product-secondary-action,
                .product-icon-action,
                :global(.product-secondary-action),
                :global(.product-icon-action) {
                    border: 1px solid var(--border-subtle);
                    background: #ffffff;
                    color: var(--text-primary);
                }

                .product-primary-action:hover,
                .product-secondary-action:hover,
                .product-icon-action:hover,
                :global(.product-primary-action:hover),
                :global(.product-secondary-action:hover),
                :global(.product-icon-action:hover) {
                    transform: translateY(-1px);
                    box-shadow: 0 12px 28px rgba(24, 32, 38, 0.1);
                }

                .product-secondary-action:disabled,
                :global(.product-secondary-action:disabled) {
                    cursor: not-allowed;
                    opacity: 0.65;
                    transform: none;
                }

                .trust-row {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 0.9rem;
                    margin-top: 1rem;
                }

                .trust-row > div {
                    padding: 1rem;
                    border-radius: 14px;
                }

                .trust-row span {
                    display: block;
                    margin-top: 0.25rem;
                    color: var(--text-muted);
                    font-size: 0.82rem;
                }

                .product-support-section {
                    max-width: 940px;
                    margin: 1rem auto 0;
                }

                .product-modal-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.25rem;
                    background: rgba(24, 32, 38, 0.5);
                    backdrop-filter: blur(12px);
                }

                .product-modal {
                    position: relative;
                    width: min(100%, 440px);
                    padding: 2rem;
                    border: 1px solid var(--border-subtle);
                    border-radius: 18px;
                    background: #ffffff;
                    box-shadow: 0 24px 70px rgba(24, 32, 38, 0.22);
                }

                .product-modal h2 {
                    margin: 0 2rem 0.55rem 0;
                    font-size: 1.5rem;
                }

                .product-modal p {
                    margin: 0 0 1.2rem;
                    color: var(--text-muted);
                }

                .product-modal form {
                    display: grid;
                    gap: 0.85rem;
                }

                .modal-close {
                    position: absolute;
                    top: 14px;
                    right: 14px;
                    width: 36px;
                    height: 36px;
                    border: 1px solid var(--border-subtle);
                    border-radius: 999px;
                    background: #ffffff;
                    color: var(--text-primary);
                    cursor: pointer;
                }

                .product-sticky-bar {
                    display: none;
                }

                @media (max-width: 980px) {
                    .product-hero-card {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }

                    .product-media {
                        position: static;
                    }

                    .product-proof-grid,
                    .product-actions {
                        grid-template-columns: 1fr;
                    }

                    .product-icon-action {
                        width: 100%;
                    }
                }

                @media (max-width: 768px) {
                    .product-page-shell {
                        padding: 104px 0 190px;
                    }

                    .product-hero-card {
                        padding: 0;
                        border-radius: 18px;
                        gap: 1.2rem;
                    }

                    .product-info {
                        order: 1;
                    }

                    .product-media {
                        order: 2;
                    }

                    .product-image-card {
                        max-width: 220px;
                        padding: 1.25rem;
                    }

                    .product-image {
                        width: 135px;
                        height: 135px;
                    }

                    .product-media-note {
                        display: none;
                    }

                    .product-title {
                        font-size: 2.1rem;
                        line-height: 1.1;
                    }

                    .product-desc {
                        font-size: 0.96rem;
                    }

                    .price-stock,
                    .trust-row {
                        grid-template-columns: 1fr;
                    }

                    .price-stock {
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .product-sticky-bar {
                        position: fixed;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        z-index: 1000;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 0.85rem;
                        padding: 0.85rem 1rem calc(0.85rem + env(safe-area-inset-bottom));
                        border-top: 1px solid var(--border-subtle);
                        background: rgba(255, 255, 255, 0.96);
                        box-shadow: 0 -12px 28px rgba(24, 32, 38, 0.12);
                        backdrop-filter: blur(18px);
                    }

                    .product-sticky-bar > div {
                        min-width: 0;
                    }

                    .product-sticky-bar strong,
                    .product-sticky-bar span {
                        display: block;
                    }

                    .product-sticky-bar strong {
                        color: var(--accent-blue);
                        font-size: 1.05rem;
                    }

                    .product-sticky-bar span {
                        color: var(--text-muted);
                        font-size: 0.75rem;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 48vw;
                    }

                    .product-sticky-bar .product-primary-action,
                    .product-sticky-bar .product-secondary-action,
                    .product-sticky-bar :global(.product-primary-action),
                    .product-sticky-bar :global(.product-secondary-action) {
                        min-height: 42px;
                        padding: 0.65rem 1rem;
                        white-space: nowrap;
                    }
                }
            `}</style>
        </div>
    );
}
