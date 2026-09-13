import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  Globe2,
  SearchCheck,
  ShieldCheck,
  Target,
  TrendingUp,
  Sparkles,
  Zap,
  Newspaper,
  Radio,
  Send,
  Check
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GuestPostQuoteForm from "@/components/GuestPostQuoteForm";
import { PageHero } from "@/components/ui/PageHero";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Press Release Distribution Service | AP Wire & 350+ News Outlets | OfficialUM1",
  description:
    "Distribute corporate press releases to 350+ major news outlets, Yahoo Finance, AP News, Bloomberg, MarketWatch, and Google News. Instant guaranteed syndication and live media report.",
  keywords: [
    "press release distribution service",
    "ap news wire press release",
    "guaranteed pr syndication",
    "google news press release",
    "yahoo finance press release distribution",
    "media outreach agency",
    "crypto press release distribution",
  ],
  alternates: { canonical: "https://officialum1.com/services/press-release-distribution" },
};

const prPacks = [
  {
    name: "National Wire Distribution",
    price: "$399",
    qty: "250+ Major News & Media Sites",
    metrics: "Google News, Fox, CBS, NBC, ABC Affiliates",
    turnaround: "24 to 48 Hours",
    features: [
      "Guaranteed Syndication to 250+ Verified News Outlets",
      "Full Inclusion in Google News Search Stream",
      "DoFollow & High-Trust Brand Citation Backlinks",
      "Full AP-Style Press Release Drafting Included",
      "Embed Images, Logo, and Video Links",
      "Comprehensive Live Placement PDF Report"
    ]
  },
  {
    name: "Global Authority Wire",
    price: "$799",
    qty: "400+ Tier-1 News Outlets",
    metrics: "Yahoo Finance, Bloomberg, MarketWatch, AP News",
    turnaround: "48 to 72 Hours",
    featured: true,
    badge: "⭐ MOST POPULAR FOR BRAND AUTHORITY",
    features: [
      "Syndication to 400+ High-Authority Portals",
      "Guaranteed Yahoo News & Financial Wire Coverage",
      "AP News Wire Editorial Distribution",
      "High Domain Authority (DA 70+ to DA 90+ Outlets)",
      "Instant Brand Verification & Wikipedia Authority Signal",
      "Executive C-Suite Quote Formatting Included",
      "Permanent Media Archives & Live URL Dashboard"
    ]
  },
  {
    name: "Enterprise Financial & Crypto PR",
    price: "$1,499",
    qty: "500+ Financial & Tech Outlets",
    metrics: "Yahoo Finance, Benzinga, StreetInsider, Cointelegraph",
    turnaround: "2 to 3 Business Days",
    features: [
      "Premier Tier Financial & Tech Outlets",
      "Full Syndication across Stock & Crypto Terminal Feeds",
      "High-Impact Anchor Backlinks for Money Keywords",
      "Priority Editorial Review & Expedited Publishing",
      "Senior PR Director Copywriting & Fact-Checking",
      "Comprehensive Investor & Media PDF Dossier"
    ]
  }
];

export default function PressReleaseDistributionPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Corporate Press Release Distribution Service",
    "serviceType": "Public Relations & Media Syndication",
    "provider": {
      "@type": "Organization",
      "name": "OfficialUM1 LLC",
      "url": "https://officialum1.com"
    },
    "description": "Guaranteed corporate press release syndication across 350+ top-tier global news outlets, AP News, Yahoo Finance, and Google News.",
    "areaServed": ["US", "GB", "CA", "AE", "AU", "Worldwide"],
  };

  return (
    <main style={{ background: "var(--bg-base)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <Navbar />
      <Script id="pr-service-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />

      <div style={{ paddingTop: '80px' }}>
        <PageHero
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Press Release Distribution" }]}
          label="Global PR & Media Syndication"
          title={<>Guaranteed Press Release <span style={{ color: "var(--accent-blue)" }}>Distribution</span> (350+ News Portals)</>}
          description="Broadcast your company announcements, product launches, and funding news across 350+ major news outlets, Yahoo Finance, AP News, and Google News. Establish immediate institutional authority and high-trust citations."
          right={
            <a
              href="#order-form"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-extrabold text-sm transition-all shadow-xl shadow-blue-500/25"
              style={{ background: "linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-violet) 100%)" }}
            >
              <Newspaper size={16} /> Launch Press Release <ArrowRight size={16} />
            </a>
          }
        />

        {/* Media Network Ribbon */}
        <section className="py-14 bg-white border-b border-[var(--border-subtle)]">
          <div className="container max-w-5xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent-blue)]">
              Guaranteed Syndication Networks
            </span>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 mt-6 text-sm font-black text-gray-700">
              <span className="px-4 py-2 rounded-xl bg-gray-50 border">Google News</span>
              <span className="px-4 py-2 rounded-xl bg-gray-50 border">Yahoo Finance</span>
              <span className="px-4 py-2 rounded-xl bg-gray-50 border">AP News Wire</span>
              <span className="px-4 py-2 rounded-xl bg-gray-50 border">MarketWatch</span>
              <span className="px-4 py-2 rounded-xl bg-gray-50 border">Benzinga</span>
              <span className="px-4 py-2 rounded-xl bg-gray-50 border">NBC / CBS / FOX Affiliates</span>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 md:py-28" style={{ background: "var(--bg-base)" }}>
          <div className="container max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent-blue)]">
                Guaranteed Media Coverage
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] mt-2">
                Select Your PR Distribution Package
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-2">
                All packages include complete professional AP-style writing, multimedia embedding, guaranteed indexing, and live placement reporting.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {prPacks.map((pkg, i) => (
                <div
                  key={i}
                  className={`rounded-3xl border p-8 bg-white flex flex-col justify-between transition-all shadow-lg ${
                    pkg.featured
                      ? "border-[var(--accent-blue)] ring-2 ring-[var(--accent-blue)]/20 shadow-2xl relative"
                      : "border-[var(--border-subtle)] hover:border-gray-300"
                  }`}
                >
                  {pkg.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-[var(--accent-blue)] text-white text-[11px] font-black px-4 py-1 rounded-full shadow-md">
                        {pkg.badge}
                      </span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-extrabold text-[var(--text-primary)]">{pkg.name}</h3>
                    <div className="flex items-baseline gap-2 my-4">
                      <span className="text-4xl font-black text-[var(--text-primary)]">{pkg.price}</span>
                      <span className="text-xs font-semibold text-[var(--text-muted)]">/ {pkg.qty}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs font-bold text-[var(--accent-blue)] mb-6">
                      ⚡ Outlets: {pkg.metrics} &bull; {pkg.turnaround}
                    </div>

                    <div className="space-y-3 mb-8">
                      {pkg.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs font-medium text-[var(--text-primary)]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <a
                    href="#order-form"
                    className={`w-full py-4 rounded-2xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
                      pkg.featured
                        ? "bg-[var(--accent-blue)] text-white shadow-lg shadow-blue-500/25 hover:opacity-95"
                        : "bg-gray-900 hover:bg-black text-white"
                    }`}
                  >
                    <Newspaper size={14} /> Order {pkg.name} <ArrowRight size={14} />
                  </a>
                </div>
              ))}
            </div>

            {/* Order Intake Form */}
            <GuestPostQuoteForm />
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
