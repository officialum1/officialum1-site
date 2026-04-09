"use client";

import {
  ArrowRight,
  BadgeCheck,
  LineChart,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicesSection from "@/components/ServicesSection";
import WorkSection from "@/components/WorkSection";
import FreeAuditSection from "@/components/FreeAuditSection";
import PricingSection from "@/components/PricingSection";
import FeaturedProductsSection from "@/components/FeaturedProductsSection";
import BusinessSection from "@/components/BusinessSection";
import LiveCount from "@/components/LiveCount";

const offerCards = [
  {
    title: "Growth Services",
    text: "SEO, social media, and conversion-focused campaigns built to move revenue, not just vanity metrics.",
    href: "/services",
    cta: "Explore services",
    icon: LineChart,
  },
  {
    title: "Verified Digital Assets",
    text: "A cleaner shopping experience for accounts, tools, and digital products with faster path-to-purchase.",
    href: "/shop",
    cta: "Browse shop",
    icon: ShieldCheck,
  },
  {
    title: "US Business Setup",
    text: "A dedicated lane for founders who need LLC, EIN, and compliance support without hunting through the site.",
    href: "/services/business-formation",
    cta: "Start formation",
    icon: Sparkles,
  },
];

const trustPoints = [
  "Mobile-first checkout flow",
  "Transparent turnaround times",
  "Real support, not ghost tickets",
  "Clear pricing before contact",
];

const proofStats = [
  { value: <LiveCount metric="projects" suffix="+" />, label: "Projects delivered" },
  { value: <LiveCount metric="satisfaction" suffix="%" decimals={1} />, label: "Client satisfaction" },
  { value: <LiveCount metric="orders" short={true} />, label: "Orders processed" },
];

export default function Home() {
  return (
    <main>
      <Navbar />

      <section className="hero hero-shell">
        <div className="hero-bg" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="hero-badge">
              <Zap size={14} />
              Strategy, storefront, and support in one place
            </div>

            <h1>
              Digital growth that feels <span className="text-gradient">clear, fast, and trusted</span>
            </h1>

            <p className="subheading hero-subheading">
              We redesigned the front door around what customers actually need: a simple path to services,
              digital products, and business formation with less friction on mobile.
            </p>

            <div className="hero-actions">
              <a href="/shop" className="btn btn-primary hero-button">
                Browse Shop
                <ArrowRight size={18} />
              </a>
              <a href="/contact" className="btn btn-outline hero-button">
                Get Free Consultation
              </a>
            </div>

            <div className="hero-trust">
              {trustPoints.map((item) => (
                <div key={item} className="hero-trust-item">
                  <BadgeCheck size={16} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-highlight-card hero-highlight-primary">
              <p className="hero-panel-label">Why this layout works better</p>
              <h3>Three clear paths instead of one long wall of content</h3>
              <p>
                New visitors can self-select into shopping, growth services, or US business setup within the
                first screen, especially on phones.
              </p>
            </div>

            <div className="hero-mini-grid">
              <div className="hero-mini-card">
                <span className="hero-mini-number">01</span>
                <strong>Cleaner hero</strong>
                <p>Shorter message, stronger CTA hierarchy, less visual noise.</p>
              </div>
              <div className="hero-mini-card">
                <span className="hero-mini-number">02</span>
                <strong>Better mobile flow</strong>
                <p>Stacked actions, tighter spacing, and swipe-friendly sections lower drop-off.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section proof-strip">
        <div className="container proof-strip-grid">
          {proofStats.map((stat) => (
            <div key={stat.label} className="proof-card">
              <div className="proof-value">{stat.value}</div>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-label">Start Here</span>
            <h2>Choose the path that matches what you need today</h2>
            <p>
              The homepage now prioritizes quick decision-making. Each option is clearer, shorter, and easier to
              tap through on mobile.
            </p>
          </div>

          <div className="offer-grid">
            {offerCards.map((card) => {
              const Icon = card.icon;

              return (
                <a key={card.title} href={card.href} className="offer-card">
                  <div className="offer-icon">
                    <Icon size={22} />
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <span className="offer-link">
                    {card.cta}
                    <ArrowRight size={16} />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <FeaturedProductsSection />
      <BusinessSection />
      <ServicesSection />
      <PricingSection />
      <WorkSection />
      <FreeAuditSection />

      <section className="home-section final-cta-section">
        <div className="container">
          <div className="final-cta-card">
            <div>
              <span className="section-label">Next Step</span>
              <h2>Ready to turn attention into real conversions?</h2>
              <p>
                Use the shop for immediate purchases, request a growth plan, or talk to us about building the
                right setup for your brand.
              </p>
            </div>

            <div className="final-cta-actions">
              <a href="/contact" className="btn btn-primary hero-button">
                Talk to the Team
              </a>
              <a href="/services" className="btn btn-outline hero-button">
                View Services
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .hero-shell {
          min-height: auto;
          padding: 152px 0 88px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 0.96) 55%, rgba(239, 246, 255, 0.86) 100%);
        }

        .hero-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
          gap: 32px;
          align-items: center;
        }

        .hero-copy {
          max-width: 820px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          padding: 10px 14px;
          border: 1px solid rgba(79, 70, 229, 0.14);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.78);
          color: #4338ca;
          font-size: 0.86rem;
          font-weight: 700;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
          backdrop-filter: blur(10px);
        }

        .hero-copy h1 {
          font-size: clamp(2.6rem, 6vw, 4.9rem);
          margin-bottom: 20px;
          max-width: 13ch;
        }

        .hero-subheading {
          margin: 0 0 28px;
          max-width: 640px;
          opacity: 1;
          animation: none;
        }

        .hero-actions {
          display: flex;
          gap: 14px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .hero-button {
          min-height: 52px;
          padding: 0.95rem 1.4rem;
        }

        .hero-trust {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          max-width: 640px;
        }

        .hero-trust-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(15, 23, 42, 0.08);
          color: #0f172a;
          font-size: 0.95rem;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.05);
        }

        .hero-panel {
          display: grid;
          gap: 16px;
          align-self: stretch;
        }

        .hero-highlight-card,
        .hero-mini-card,
        .proof-card,
        .offer-card,
        .final-cta-card {
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
        }

        .hero-highlight-card {
          padding: 28px;
          border-radius: 28px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(239, 246, 255, 0.92));
        }

        .hero-highlight-primary h3 {
          font-size: 1.6rem;
          margin-bottom: 12px;
        }

        .hero-highlight-primary p {
          margin: 0;
        }

        .hero-panel-label {
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #4f46e5;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .hero-mini-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .hero-mini-card {
          padding: 22px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.82);
        }

        .hero-mini-card strong {
          display: block;
          margin-bottom: 8px;
          color: #111827;
        }

        .hero-mini-card p {
          margin: 0;
          font-size: 0.95rem;
        }

        .hero-mini-number {
          display: inline-block;
          margin-bottom: 12px;
          color: #06b6d4;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.14em;
        }

        .home-section {
          padding: 88px 0;
        }

        .proof-strip {
          padding-top: 0;
        }

        .proof-strip-grid,
        .offer-grid {
          display: grid;
          gap: 20px;
        }

        .proof-strip-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .proof-card {
          padding: 26px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.86);
          text-align: center;
        }

        .proof-value {
          font-size: 2.3rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .proof-card p {
          margin: 0;
          font-size: 0.95rem;
          color: #475569;
        }

        .section-heading {
          max-width: 760px;
          margin: 0 auto 32px;
          text-align: center;
        }

        .section-heading h2 {
          margin-bottom: 14px;
        }

        .offer-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .offer-card {
          display: block;
          padding: 28px;
          border-radius: 28px;
          text-decoration: none;
          background: linear-gradient(180deg, #ffffff, #f8fbff);
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }

        .offer-card:hover {
          transform: translateY(-4px);
          border-color: rgba(79, 70, 229, 0.18);
          box-shadow: 0 24px 60px rgba(79, 70, 229, 0.12);
        }

        .offer-card h3 {
          color: #0f172a;
          font-size: 1.35rem;
          margin-bottom: 12px;
        }

        .offer-card p {
          margin-bottom: 20px;
        }

        .offer-icon {
          width: 52px;
          height: 52px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          margin-bottom: 18px;
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(6, 182, 212, 0.16));
          color: #4338ca;
        }

        .offer-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #4f46e5;
          font-weight: 700;
        }

        .final-cta-section {
          padding-top: 56px;
        }

        .final-cta-card {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) auto;
          gap: 24px;
          align-items: center;
          padding: 36px;
          border-radius: 32px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(236, 253, 245, 0.96));
        }

        .final-cta-card h2 {
          margin-bottom: 12px;
        }

        .final-cta-card p {
          margin: 0;
          max-width: 620px;
        }

        .final-cta-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: flex-end;
        }

        @media (max-width: 1100px) {
          .hero-grid,
          .final-cta-card {
            grid-template-columns: 1fr;
          }

          .hero-panel {
            max-width: 720px;
          }

          .final-cta-actions {
            justify-content: flex-start;
          }
        }

        @media (max-width: 820px) {
          .hero-shell {
            padding: 132px 0 68px;
          }

          .home-section {
            padding: 64px 0;
          }

          .hero-trust,
          .proof-strip-grid,
          .offer-grid,
          .hero-mini-grid {
            grid-template-columns: 1fr;
          }

          .hero-actions,
          .final-cta-actions {
            flex-direction: column;
          }

          .hero-button {
            width: 100%;
          }
        }

        @media (max-width: 640px) {
          .hero-copy h1 {
            max-width: none;
          }

          .hero-badge,
          .hero-trust-item,
          .proof-card,
          .offer-card,
          .hero-highlight-card,
          .hero-mini-card,
          .final-cta-card {
            border-radius: 22px;
          }

          .hero-highlight-card,
          .hero-mini-card,
          .proof-card,
          .offer-card,
          .final-cta-card {
            padding: 22px;
          }
        }
      `}</style>
    </main>
  );
}
