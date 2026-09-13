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
  MapPin,
  Building2,
  Check
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GuestPostQuoteForm from "@/components/GuestPostQuoteForm";
import { PageHero } from "@/components/ui/PageHero";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Local SEO Citation Building Service | 100% NAP Consistency | OfficialUM1",
  description:
    "Dominate Google Maps and local 3-pack search results with 100% manual local business citation building (50 to 150+ directories). Exact NAP consistency, high DA local directories, and complete login reports.",
  keywords: [
    "local citation building service",
    "buy local citations",
    "google maps citation building",
    "local seo business directories",
    "nap consistency service",
    "local directory submissions usa",
    "local citations uk",
  ],
  alternates: { canonical: "https://officialum1.com/services/local-citations" },
};

const citationPacks = [
  {
    name: "Local Visibility Starter",
    price: "$149",
    qty: "50 High DA Local Citations",
    metrics: "Top 50 National & Regional Directories",
    turnaround: "3 to 5 Business Days",
    features: [
      "50x High-Authority Manual Directory Submissions",
      "100% Strict NAP (Name, Address, Phone) Consistency",
      "Yelp, YellowPages, BBB, Foursquare & Bing Maps",
      "No Automated Spiders / 100% Hand-Built Profiles",
      "Logo, Social Links & Business Bio Included",
      "Complete Spreadsheet with Live Links & Login Access"
    ]
  },
  {
    name: "Google 3-Pack Dominator",
    price: "$299",
    qty: "100 Verified Citations + Geo-Tagging",
    metrics: "Top 100 National & Niche Directories",
    turnaround: "5 to 7 Business Days",
    featured: true,
    badge: "⭐ BEST FOR GOOGLE MAPS RANKINGS",
    features: [
      "100x High-DA Local Business Citations",
      "Includes Industry-Specific Niche Directories",
      "Geo-Tagged Images & Enhanced Schema Information",
      "Duplicate Citation Audit & Suppression",
      "Guaranteed Fast Indexing Support",
      "Full White-Label Client Report with Passwords",
      "365-Day Citation Accuracy Guarantee"
    ]
  },
  {
    name: "Enterprise Multi-Location Pack",
    price: "$599",
    qty: "200 Citations + Tier-2 Geo Backlinks",
    metrics: "Top 200 Citations + 5 Local Geo-Links",
    turnaround: "7 to 10 Business Days",
    features: [
      "200x Premium Local Citations across Major Networks",
      "5x Local Niche Edit Backlinks for Google Maps Boost",
      "Comprehensive Citation Audit & NAP Cleanup",
      "Apple Maps, Waze, Here.com GPS Data Ingestion",
      "Dedicated Local SEO Account Manager",
      "Full Master Report with All Live Directory Logins"
    ]
  }
];

export default function LocalCitationsPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Local Citation Building & NAP Directory Submissions",
    "serviceType": "Local SEO & Google Maps Optimization",
    "provider": {
      "@type": "Organization",
      "name": "OfficialUM1 LLC",
      "url": "https://officialum1.com"
    },
    "description": "Manual high-authority local citation building and business directory submissions with 100% NAP consistency for top Google Maps 3-Pack rankings.",
    "areaServed": ["US", "GB", "CA", "AE", "AU", "Worldwide"],
  };

  return (
    <main style={{ background: "var(--bg-base)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <Navbar />
      <Script id="citations-service-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />

      <div style={{ paddingTop: '80px' }}>
        <PageHero
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Local Citations" }]}
          label="Google Maps & Local 3-Pack Rankings"
          title={<>Manual Local Business <span style={{ color: "var(--accent-blue)" }}>Citation Building</span></>}
          description="Power your Google Maps 3-pack rankings with 100% manual, high-authority local business citations across top US, UK, Canadian, and Australian directories. Zero automated bots, perfect NAP consistency, and full login credentials provided."
          right={
            <a
              href="#order-form"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-extrabold text-sm transition-all shadow-xl shadow-blue-500/25"
              style={{ background: "linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-violet) 100%)" }}
            >
              <MapPin size={16} /> Order Local Citations <ArrowRight size={16} />
            </a>
          }
        />

        {/* Directory Network Badges */}
        <section className="py-14 bg-white border-b border-[var(--border-subtle)]">
          <div className="container max-w-5xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent-blue)]">
              Manual Submissions on Top Tier Directories
            </span>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-6 text-sm font-black text-gray-700">
              <span className="px-4 py-2 rounded-xl bg-gray-50 border">Google Business Profile</span>
              <span className="px-4 py-2 rounded-xl bg-gray-50 border">Bing Places</span>
              <span className="px-4 py-2 rounded-xl bg-gray-50 border">Apple Maps</span>
              <span className="px-4 py-2 rounded-xl bg-gray-50 border">Yelp</span>
              <span className="px-4 py-2 rounded-xl bg-gray-50 border">Better Business Bureau (BBB)</span>
              <span className="px-4 py-2 rounded-xl bg-gray-50 border">YellowPages</span>
              <span className="px-4 py-2 rounded-xl bg-gray-50 border">Foursquare</span>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 md:py-28" style={{ background: "var(--bg-base)" }}>
          <div className="container max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent-blue)]">
                100% Hand-Built Local Directories
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] mt-2">
                Select Your Local Citation Package
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-2">
                All packages include 100% manual submissions, strict NAP verification, logo upload, business bio writing, and full login reports.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {citationPacks.map((pkg, i) => (
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
                      ⚡ Quality: {pkg.metrics} &bull; {pkg.turnaround}
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
                    <MapPin size={14} /> Order {pkg.name} <ArrowRight size={14} />
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
