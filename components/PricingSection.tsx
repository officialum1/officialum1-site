"use client";

import { Check, Sparkles } from "lucide-react";

export default function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$499",
      summary: "For founders who need a sharp, trustworthy launch presence.",
      features: ["5-page custom website", "Basic SEO setup", "Mobile responsive build", "Contact form integration", "1 month support"],
      recommend: false,
    },
    {
      name: "Growth",
      price: "$999",
      summary: "For brands ready to turn traffic into leads and sales faster.",
      features: ["10-page custom website", "Advanced SEO and schema", "90+ speed optimization", "Blog and content setup", "3 months support"],
      recommend: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      summary: "For stores, platforms, and custom systems with more moving parts.",
      features: ["E-commerce or web app", "Custom backend flows", "API integrations", "Advanced security setup", "Priority support"],
      recommend: false,
    },
  ];

  return (
    <section className="section-padding pricing-shell">
      <div className="container">
        <div className="pricing-header">
          <span className="section-label">Pricing</span>
          <h2>Modern packages with clearer comparisons</h2>
          <p className="pricing-copy">
            We simplified the cards so people can understand the difference between plans quickly, especially on
            smaller screens.
          </p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan) => (
            <article key={plan.name} className={`pricing-card ${plan.recommend ? "pricing-card-featured" : ""}`}>
              {plan.recommend && (
                <div className="pricing-badge">
                  <Sparkles size={14} />
                  Most popular
                </div>
              )}

              <div className="pricing-top">
                <h3>{plan.name}</h3>
                <div className="pricing-price">{plan.price}</div>
                <p>{plan.summary}</p>
              </div>

              <ul className="pricing-features">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={16} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a href="/contact" className={`btn ${plan.recommend ? "btn-primary" : "btn-outline"} pricing-button`}>
                Get Started
              </a>
            </article>
          ))}
        </div>
      </div>

      <style jsx>{`
        .pricing-shell {
          background: linear-gradient(180deg, rgba(248, 250, 252, 0) 0%, rgba(239, 246, 255, 0.7) 100%);
        }

        .pricing-header {
          max-width: 760px;
          margin: 0 auto 32px;
          text-align: center;
        }

        .pricing-header h2 {
          margin-bottom: 12px;
        }

        .pricing-copy {
          margin: 0 auto;
          max-width: 620px;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
          align-items: stretch;
        }

        .pricing-card {
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 28px;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 18px 46px rgba(15, 23, 42, 0.08);
        }

        .pricing-card-featured {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(238, 242, 255, 0.96));
          border-color: rgba(79, 70, 229, 0.16);
          box-shadow: 0 24px 60px rgba(79, 70, 229, 0.14);
        }

        .pricing-badge {
          position: absolute;
          top: 18px;
          right: 18px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(79, 70, 229, 0.1);
          color: #4f46e5;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .pricing-top h3 {
          margin-bottom: 10px;
          color: #0f172a;
        }

        .pricing-price {
          font-size: 2.8rem;
          font-weight: 800;
          line-height: 1;
          color: #111827;
          margin-bottom: 14px;
        }

        .pricing-top p {
          margin: 0 0 22px;
        }

        .pricing-features {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 0 0 24px;
          padding: 0;
          flex: 1;
        }

        .pricing-features li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: #334155;
        }

        .pricing-features li :global(svg) {
          color: #10b981;
          margin-top: 3px;
          flex-shrink: 0;
        }

        .pricing-button {
          width: 100%;
        }

        @media (max-width: 980px) {
          .pricing-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .pricing-card {
            padding: 22px;
            border-radius: 22px;
          }

          .pricing-price {
            font-size: 2.3rem;
          }
        }
      `}</style>
    </section>
  );
}
