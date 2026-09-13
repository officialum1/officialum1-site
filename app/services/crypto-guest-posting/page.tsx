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
  Coins,
  Cpu
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GuestPostQuoteForm from "@/components/GuestPostQuoteForm";
import { PageHero } from "@/components/ui/PageHero";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Crypto & Web3 Guest Posting Service | High DA Blockchain Backlinks | OfficialUM1",
  description:
    "Buy niche-relevant Crypto, Bitcoin, Web3, DeFi, and Blockchain guest posts on high-authority crypto media websites (DA 50 to DA 80+). 100% DoFollow, real crypto investor traffic, and fast publishing.",
  keywords: [
    "crypto guest posting service",
    "buy crypto backlinks",
    "web3 guest post",
    "blockchain link building",
    "bitcoin backlinks",
    "defi guest posting",
    "crypto news backlinks",
  ],
  alternates: { canonical: "https://officialum1.com/services/crypto-guest-posting" },
};

const cryptoPacks = [
  {
    name: "Crypto Launch Booster",
    price: "$899",
    qty: "3x Tier-2 Crypto News Posts",
    metrics: "DA 45+ to DA 55+ Verified Crypto Media",
    turnaround: "5 to 7 Days",
    features: [
      "3x High-Authority Crypto & Web3 Websites",
      "Real Blockchain & Investor Organic Readership",
      "100% DoFollow Contextual In-Content Links",
      "3x 1,000+ Word Native Crypto Articles Included",
      "DeFi, Token, NFT, Trading & Web3 Friendly",
      "365-Day Free Link Replacement Warranty"
    ]
  },
  {
    name: "Web3 Authority Powerhouse",
    price: "$1,899",
    qty: "6x Tier-1 Crypto Media Posts",
    metrics: "DA 60+ to DA 75+ Major Crypto Portals",
    turnaround: "5 to 10 Days",
    featured: true,
    badge: "⭐ TOP CHOICE FOR CRYPTO PROJECTS",
    features: [
      "6x Major Crypto News & Tech Authority Outlets",
      "Massive Organic Search & Telegram/X Readership",
      "100% DoFollow In-Content Contextual Placement",
      "Tokenomics, Ecosystem & Whitepaper Anchor Links",
      "Native Technical Web3 Research Writing Included",
      "Guaranteed Fast Google & Yahoo Indexing",
      "Full White-Label Executive Report"
    ]
  },
  {
    name: "Blockchain Domination Stack",
    price: "$3,499",
    qty: "12x Elite Crypto & Media Posts",
    metrics: "DA 65+ to DA 80+ Top Tier Crypto News",
    turnaround: "10 to 14 Days",
    features: [
      "12x Premier Crypto Portals & Fintech Outlets",
      "Comprehensive Anchor Text Strategy for Token Launch",
      "Syndication to Google News Indexed Crypto Hubs",
      "Dedicated Senior Crypto Link Strategist",
      "Guaranteed Rankings Spike for High-Volume Terms",
      "365-Day Permanent Placement Warranty"
    ]
  }
];

export default function CryptoGuestPostingPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Crypto & Web3 Guest Posting Service",
    "serviceType": "Blockchain SEO & Link Building",
    "provider": {
      "@type": "Organization",
      "name": "OfficialUM1 LLC",
      "url": "https://officialum1.com"
    },
    "description": "High-authority contextual guest posting and backlink outreach for Crypto, Web3, DeFi, Bitcoin, and Blockchain brands on verified crypto media publishers.",
    "areaServed": ["US", "GB", "CA", "AE", "AU", "Worldwide"],
  };

  return (
    <main style={{ background: "var(--bg-base)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <Navbar />
      <Script id="crypto-service-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />

      <div style={{ paddingTop: '80px' }}>
        <PageHero
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Crypto Guest Posting" }]}
          label="Web3 & Blockchain SEO Engine"
          title={<>Crypto &amp; Web3 <span style={{ color: "var(--accent-blue)" }}>Guest Posting</span> Service</>}
          description="Build unstoppable domain authority for your Crypto, DeFi, Web3, or Blockchain token project. Get guaranteed 100% DoFollow backlinks on verified high-DA crypto news portals and tech publications."
          right={
            <a
              href="#order-form"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-extrabold text-sm transition-all shadow-xl shadow-blue-500/25"
              style={{ background: "linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-violet) 100%)" }}
            >
              <Coins size={16} /> Order Crypto Backlinks <ArrowRight size={16} />
            </a>
          }
        />

        {/* Value Prop */}
        <section className="py-16 bg-white border-b border-[var(--border-subtle)]">
          <div className="container max-w-5xl">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                  <Coins className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-[var(--text-primary)]">Crypto Niche Authority</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  General link farms don't work for Crypto. We secure placements exclusively on active Web3, Bitcoin, DeFi, and Blockchain news hubs.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[var(--accent-blue)] flex items-center justify-center mx-auto mb-3">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-[var(--text-primary)]">Native Web3 Copywriters</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  Our articles are written by native crypto researchers who understand smart contracts, tokenomics, Layer-1/2 ecosystems, and fintech terminology.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-[var(--text-primary)]">100% Safe &amp; Dofollow</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  Contextual in-content DoFollow links designed to withstand Google core algorithm updates and build permanent keyword visibility.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 md:py-28" style={{ background: "var(--bg-base)" }}>
          <div className="container max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent-blue)]">
                Blockchain &amp; DeFi Authority Packages
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] mt-2">
                Choose Your Crypto Link Package
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-2">
                All packages include verified organic crypto readership, 100% DoFollow in-content insertion, and our 365-day replacement warranty.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {cryptoPacks.map((pkg, i) => (
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
                      ⚡ Metrics: {pkg.metrics} &bull; {pkg.turnaround}
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
                    <Coins size={14} /> Order {pkg.name} <ArrowRight size={14} />
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
