"use client";

interface BulkPricingProps {
    basePrice: number;
    platform: string;
}

export default function BulkPricing({ basePrice, platform }: BulkPricingProps) {
    const tiers = [
        { qty: "5+", discount: 5, label: "Starter Bundle" },
        { qty: "10+", discount: 10, label: "Power User" },
        { qty: "25+", discount: 20, label: "Bulk Reseller" },
        { qty: "50+", discount: 35, label: "VIP Partner" },
    ];

    return (
        <section className="bulk-pricing" aria-label={`Bulk discounts for ${platform}`}>
            <div className="bulk-heading">
                <h3>Bulk Buy Discounts</h3>
                <p>Pricing improves automatically when you buy more.</p>
            </div>

            <div className="bulk-grid">
                {tiers.map((tier) => {
                    const discountedPrice = (basePrice * (1 - tier.discount / 100)).toFixed(2);
                    return (
                        <div key={tier.qty} className="bulk-tier">
                            <span>{tier.label}</span>
                            <strong>{tier.qty} Items</strong>
                            <b>${discountedPrice}<small>/ea</small></b>
                            <em>Save {tier.discount}%</em>
                        </div>
                    );
                })}
            </div>

            <p className="bulk-note">Discounts are applied at checkout for eligible bulk quantities.</p>

            <style jsx>{`
                .bulk-pricing {
                    margin-top: 1.35rem;
                    padding: 1.1rem;
                    border: 1px solid var(--border-subtle);
                    border-radius: 16px;
                    background: var(--bg-section-alt);
                }

                .bulk-heading {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                h3 {
                    margin: 0;
                    color: var(--text-primary);
                    font-size: 1rem;
                    line-height: 1.25;
                }

                p {
                    margin: 0;
                    color: var(--text-muted);
                    font-size: 0.82rem;
                    line-height: 1.45;
                }

                .bulk-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 0.75rem;
                }

                .bulk-tier {
                    padding: 0.9rem;
                    border: 1px solid rgba(20, 108, 120, 0.13);
                    border-radius: 12px;
                    background: #ffffff;
                    text-align: center;
                }

                .bulk-tier span,
                .bulk-tier strong,
                .bulk-tier b,
                .bulk-tier em,
                .bulk-tier small {
                    display: block;
                }

                .bulk-tier span {
                    color: var(--accent-blue);
                    font-size: 0.72rem;
                    font-weight: 850;
                    text-transform: uppercase;
                    letter-spacing: 0;
                }

                .bulk-tier strong {
                    margin-top: 0.2rem;
                    color: var(--text-primary);
                    font-size: 0.95rem;
                }

                .bulk-tier b {
                    margin-top: 0.35rem;
                    color: var(--success);
                    font-size: 1.1rem;
                }

                .bulk-tier small {
                    display: inline;
                    margin-left: 0.1rem;
                    color: var(--text-muted);
                    font-size: 0.72rem;
                    font-weight: 700;
                }

                .bulk-tier em {
                    width: fit-content;
                    margin: 0.45rem auto 0;
                    padding: 0.2rem 0.5rem;
                    border-radius: 999px;
                    background: rgba(20, 132, 95, 0.1);
                    color: var(--success);
                    font-size: 0.72rem;
                    font-style: normal;
                    font-weight: 850;
                }

                .bulk-note {
                    margin-top: 0.85rem;
                    text-align: center;
                }

                @media (max-width: 700px) {
                    .bulk-heading {
                        display: block;
                    }

                    .bulk-heading p {
                        margin-top: 0.3rem;
                    }

                    .bulk-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }
            `}</style>
        </section>
    );
}
