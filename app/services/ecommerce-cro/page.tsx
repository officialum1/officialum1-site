import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CreditCard,
  MousePointerClick,
  Percent,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "E-Commerce Conversion Rate Optimization (CRO) | WooCommerce & Shopify | OfficialUM1",
  description:
    "Turn more website visitors into paying buyers. Advanced E-Commerce CRO, friction-free 1-click checkouts, mobile UX audit & average order value (AOV) boosters for WooCommerce and Shopify.",
  keywords: [
    "ecommerce cro services",
    "woocommerce conversion rate optimization",
    "shopify checkout optimization",
    "increase ecommerce sales",
    "reduce cart abandonment rate",
    "mobile checkout optimization",
  ],
  alternates: {
    canonical: "https://officialum1.com/services/ecommerce-cro",
  },
};

const croPillars = [
  {
    icon: MousePointerClick,
    title: "1-Click Accelerated Checkout & Mobile UX",
    text: "We streamline multi-step checkouts into high-converting 1-page flows with Apple Pay, Google Pay, and autofill address completion to eliminate checkout drop-offs.",
  },
  {
    icon: ShoppingBag,
    title: "Sticky Add-To-Cart & Cart Drawers",
    text: "Implement high-converting sticky purchase bars and slide-out cart drawers with instant cross-sells, free shipping progression bars, and trust badges.",
  },
  {
    icon: TrendingUp,
    title: "Average Order Value (AOV) Upsells",
    text: "Dynamic one-click post-purchase upsells, product bundle builders, and volume tiered discounts that increase revenue per visitor by 20% to 35%.",
  },
  {
    icon: Percent,
    title: "Automated Cart Recovery Funnels",
    text: "Smart browser push notifications, SMS recovery, and personalized 3-step email sequences that recapture abandoned shoppers automatically.",
  },
  {
    icon: Zap,
    title: "Instant Mobile Page & Filter Speed",
    text: "Turbocharge product archive filters, facet searches, and product image galleries to respond in under 300ms without full page reloads.",
  },
  {
    icon: ShieldCheck,
    title: "Conversion Trust & Social Proof Architecture",
    text: "Placement of verified buyer badges, live stock urgency counters, and authentic review highlights strategically where buyers make decisions.",
  },
];

const packages = [
  {
    name: "Store CRO Diagnostic & Quick Wins",
    price: "$499",
    detail: "For e-commerce stores doing $5k - $20k/mo needing immediate conversion lift.",
    items: [
      "Complete mobile UX & checkout friction audit",
      "Sticky add-to-cart & slide-out drawer setup",
      "Checkout form optimization & trust badge placement",
      "Cart abandonment email template setup",
      "Speed audit for top 5 product money pages",
      "14 days post-setup conversion tracking",
    ],
  },
  {
    name: "Full Growth & AOV Acceleration Engine",
    price: "$999",
    detail: "For scaling brands doing $20k+/mo wanting maximum revenue per visitor.",
    items: [
      "All Diagnostic & Quick Wins features",
      "Post-purchase 1-click upsell funnel setup",
      "Dynamic free shipping & bundle progress bars",
      "Exit-intent recovery popups with smart discounts",
      "A/B split testing setup for primary product pages",
      "30 days dedicated optimization engineer",
    ],
    featured: true,
  },
  {
    name: "Enterprise Custom CRO Retainer",
    price: "$1,899",
    detail: "For high-volume multi-brand stores or high-traffic international catalogs.",
    items: [
      "Continuous multivariate heatmap & scroll testing",
      "Custom product configurator / bundle architecture",
      "Multi-currency & localized payment optimization",
      "Dedicated bi-weekly revenue growth reviews",
      "Full design & developer implementation included",
      "60 days performance partnership",
    ],
  },
];

export default function EcommerceCroPage() {
  return (
    <main className="inner-page">
      <Navbar />

      <div style={{ paddingTop: "80px" }}>
        <PageHero
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: "E-Commerce CRO" },
          ]}
          label="Revenue Engineering"
          title={
            <>
              Double Your Sales with <span style={{ color: "var(--accent-blue)" }}>E-Commerce CRO</span>
            </>
          }
          description="Stop wasting advertising budget on traffic that doesn’t buy. We re-engineer your product pages, carts, and checkouts to dramatically increase your conversion rates."
          right={
            <Link
              href="/contact?service=Ecommerce+CRO"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-4 text-sm font-black text-white"
              style={{ background: "var(--gradient)", boxShadow: "var(--glow-blue)" }}
            >
              Get Free CRO Audit
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        {/* Pillars */}
        <section className="py-20 sm:py-28" style={{ background: "var(--bg-base)" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent-blue)" }}>
                Data-Driven Sales Optimization
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-2" style={{ color: "var(--text-primary)" }}>
                How We Turn Browsers Into Buyers
              </h2>
              <p className="mt-3 text-base" style={{ color: "var(--text-muted)" }}>
                We eliminate psychological and technical friction at every stage of the customer buying journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {croPillars.map((pillar) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="rounded-2xl border p-8 transition-all duration-300 group hover:-translate-y-1"
                    style={{
                      background: "#ffffff",
                      borderColor: "var(--border-subtle)",
                      boxShadow: "0 12px 30px rgba(24,32,38,0.06)",
                    }}
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl mb-6 group-hover:scale-105 transition-all"
                      style={{ background: "rgba(20,108,120,0.10)", color: "var(--accent-blue)" }}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-black mb-3" style={{ color: "var(--text-primary)" }}>
                      {pillar.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {pillar.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Packages */}
        <section className="py-20 sm:py-28" style={{ background: "var(--bg-section)" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent-blue)" }}>
                Transparent CRO Pricing
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-2" style={{ color: "var(--text-primary)" }}>
                High-ROI Conversion Packages
              </h2>
              <p className="mt-3 text-base" style={{ color: "var(--text-muted)" }}>
                Designed to pay for themselves within days through increased sales and higher average order values.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.map((pkg) => (
                <div
                  key={pkg.name}
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
                    <h3 className="text-xl font-black mb-2" style={{ color: "var(--text-primary)" }}>
                      {pkg.name}
                    </h3>
                    <p className="text-xs mb-6 min-h-[36px]" style={{ color: "var(--text-muted)" }}>
                      {pkg.detail}
                    </p>
                    <div className="text-4xl font-black mb-6" style={{ color: "var(--text-primary)" }}>
                      {pkg.price}
                      <span className="text-xs font-medium text-gray-500 ml-2">/ package</span>
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
                    href={`/contact?service=Ecommerce+CRO&plan=${encodeURIComponent(pkg.name)}`}
                    className="w-full inline-flex items-center justify-center rounded-xl py-3.5 text-sm font-extrabold text-white transition-all shadow-md"
                    style={{
                      background: pkg.featured ? "var(--gradient)" : "var(--primary)",
                      boxShadow: pkg.featured ? "var(--glow-blue)" : "none",
                    }}
                  >
                    Select {pkg.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-20" style={{ background: "var(--bg-section-alt)" }}>
          <div className="container mx-auto px-4 max-w-5xl">
            <div
              className="rounded-3xl border p-10 sm:p-14 text-center relative overflow-hidden"
              style={{
                background: "#ffffff",
                borderColor: "var(--border-subtle)",
                boxShadow: "0 24px 60px rgba(24,32,38,0.08)",
              }}
            >
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>
                Ready to Scale Your Store’s Revenue?
              </h2>
              <p className="text-sm sm:text-base mb-8 max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
                Let our e-commerce optimization engineers audit your store and identify the biggest conversion leaks.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/contact?service=Ecommerce+CRO"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-sm font-bold text-white shadow-xl transition-all"
                  style={{ background: "var(--gradient)", boxShadow: "var(--glow-blue)" }}
                >
                  <TrendingUp className="h-4 w-4" /> Start CRO Optimization
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
