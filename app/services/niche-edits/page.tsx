import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  Globe2,
  Link as LinkIcon,
  SearchCheck,
  ShieldCheck,
  Target,
  TrendingUp,
  Sparkles,
  Zap,
  Check,
  X
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GuestPostQuoteForm from "@/components/GuestPostQuoteForm";
import { PageHero } from "@/components/ui/PageHero";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Curated Niche Edits & In-Content Link Insertion Service | OfficialUM1",
  description:
    "Buy powerful curated niche edits (link insertions) placed inside aged, indexed articles ranking in Google. 100% DoFollow, instant link equity, real search traffic, and 48-72h turnaround.",
  keywords: [
    "niche edits service",
    "buy niche edits",
    "curated link insertions",
    "aged backlink insertion",
    "in-content link building",
    "contextual niche edits",
    "high da niche edits",
  ],
  alternates: { canonical: "https://officialum1.com/services/niche-edits" },
};

const nicheEditPacks = [
  {
    name: "Starter Niche Edits",
    price: "$599",
    qty: "5x Aged In-Content Placements",
    metrics: "DA 40+ to DA 50+ Aged Articles",
    turnaround: "48 to 72 Hours",
    features: [
      "5x Aged Articles Already Indexed by Google",
      "Real Google Traffic (1k-5k+ monthly visits)",
      "100% DoFollow & Natural Contextual Insertion",
      "Instant Link Equity & Faster Ranking Movement",
      "365-Day Free Link Replacement Warranty",
      "Live White-Label URL Dashboard"
    ]
  },
  {
    name: "Authority Niche Surge",
    price: "$1,199",
    qty: "10x High-Traffic Placements",
    metrics: "DA 55+ to DA 70+ Aged Power Pages",
    turnaround: "3 to 5 Business Days",
    featured: true,
    badge: "⭐ MOST POPULAR FOR RANKINGS",
    features: [
      "10x High-Authority Aged Articles",
      "Massive Organic Traffic (5k to 25k+ monthly visits)",
      "Zero PBNs / 100% Established Real Websites",
      "Targeted In-Content Contextual Relevance",
      "Exact-Match & Partial-Match Anchor Support",
      "Guaranteed Permanent Indexing & Equity",
      "365-Day Replacement Guarantee"
    ]
  },
  {
    name: "Enterprise Niche Domination",
    price: "$2,299",
    qty: "20x High-DA Placements",
    metrics: "DA 60+ Tier-1 Industry Pages",
    turnaround: "5 to 7 Business Days",
    features: [
      "20x High-DA 60+ Aged Indexed Articles",
      "High-Difficulty Competitive Niche Domination",
      "Custom Anchor Distribution Strategy",
      "Dedicated Senior SEO Strategist Oversight",
      "Rapid Ranking Boost for High-Ticket Money Pages",
      "Comprehensive White-Label Report"
    ]
  }
];

export default function NicheEditsPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Curated Niche Edits & In-Content Link Insertions",
    "serviceType": "SEO Link Building",
    "provider": {
      "@type": "Organization",
      "name": "OfficialUM1 LLC",
      "url": "https://officialum1.com"
    },
    "description": "Curated contextual link insertions placed inside aged, authoritative articles that are already indexed and ranking in Google search results.",
    "areaServed": ["US", "GB", "CA", "AE", "AU", "Worldwide"],
  };

  return (
    <main style={{ background: "var(--bg-base)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <Navbar />
      <Script id="niche-service-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />

      <div style={{ paddingTop: '80px' }}>
        <PageHero
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Niche Edits" }]}
          label="Fast-Track Authority Signals"
          title={<>Curated In-Content <span style={{ color: "var(--accent-blue)" }}>Niche Edits</span> (Link Insertions)</>}
          description="Get contextual DoFollow backlinks inserted into aged, indexed articles that already rank on Google and receive established organic traffic. Move your rankings faster without waiting for new articles to index."
          right={
            <a
              href="#order-form"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-extrabold text-sm transition-all shadow-xl shadow-blue-500/25"
              style={{ background: "linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-violet) 100%)" }}
            >
              <Zap size={16} /> Choose Niche Edit Pack <ArrowRight size={16} />
            </a>
          }
        />

        {/* Why Niche Edits Win */}
        <section className="py-16 bg-white border-b border-[var(--border-subtle)]">
          <div className="container max-w-5xl">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[var(--accent-blue)] flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-[var(--text-primary)]">Pre-Existing Authority</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  Aged pages already possess Google trust, backlinks, and authority. Placing your link inside immediately passes accumulated link juice.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[var(--accent-blue)] flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-[var(--text-primary)]">Rapid 48-72h Impact</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  Google re-crawls aged ranking articles constantly, triggering faster ranking improvements compared to fresh outreach posts.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[var(--accent-blue)] flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-[var(--text-primary)]">100% Contextual Flow</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  Links are seamlessly woven into relevant existing paragraphs with contextual editorial flow to appear 100% natural to search algorithms.
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
                Aged In-Content Placements
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] mt-2">
                Select Your Niche Edit Package
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-2">
                All packages include verified organic traffic validation, 100% DoFollow in-content insertion, and our 365-day replacement warranty.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {nicheEditPacks.map((pkg, i) => (
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
                    <Zap size={14} /> Order {pkg.name} <ArrowRight size={14} />
                  </a>
                </div>
              ))}
            </div>

            {/* Quote and Intake Form */}
            <GuestPostQuoteForm />
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
