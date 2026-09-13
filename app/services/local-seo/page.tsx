import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Globe2,
  MapPin,
  MessageSquare,
  Navigation,
  PhoneCall,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Local SEO & Google Maps 3-Pack Ranking Services | OfficialUM1",
  description:
    "Dominate local Google search and Google Maps 3-Pack rankings. Comprehensive Local SEO, Google Business Profile (GBP) optimization, geo-citations & local review scaling for US, UK, and global businesses.",
  keywords: [
    "local seo services",
    "google maps 3 pack ranking",
    "google business profile optimization",
    "local citation building",
    "local search marketing agency",
    "rank higher on google maps",
  ],
  alternates: {
    canonical: "https://officialum1.com/services/local-seo",
  },
};

const localSeoPillars = [
  {
    icon: MapPin,
    title: "Google Business Profile (GBP) 3-Pack Mastery",
    text: "We optimize primary categories, business descriptions, geo-tagged photo uploads, product catalogs, and service menus to rank in the coveted top 3 Google Maps pack.",
  },
  {
    icon: Navigation,
    title: "High-Authority Geo-Targeted Local Citations",
    text: "Consistent Name, Address, Phone (NAP) syndication across 100+ top local directories (Yelp, YellowPages, Apple Maps, Bing Places, BBB, Chamber of Commerce).",
  },
  {
    icon: Search,
    title: "Localized Schema & Service Area Pages",
    text: "We implement advanced LocalBusiness JSON-LD schema markup, Google Maps embeds, and targeted city/neighborhood landing pages that rank for 'near me' keywords.",
  },
  {
    icon: Star,
    title: "Automated Review Scaling & Reputation",
    text: "Automated SMS/Email review request flows that help you generate 5-star Google reviews consistently while filtering negative feedback to private support.",
  },
  {
    icon: PhoneCall,
    title: "Direct Call & Inbound Lead Tracking",
    text: "Track every phone call, form submission, and direction request originating from Google Maps with detailed monthly conversion reporting.",
  },
  {
    icon: TrendingUp,
    title: "Hyper-Local Backlink Acquisition",
    text: "Secure local sponsorships, regional news features, and community backlinks that signal unmatched local authority to Google's ranking algorithms.",
  },
];

const packages = [
  {
    name: "Local Growth Kickstart",
    price: "$349",
    detail: "For single-location local service providers wanting immediate local visibility and calls.",
    items: [
      "Complete Google Business Profile audit & optimization",
      "50 high-authority local NAP citations",
      "Local schema markup implementation",
      "Targeting up to 10 localized keywords",
      "Google Maps 3-pack rank tracking dashboard",
      "Monthly local growth report",
    ],
  },
  {
    name: "Market Dominance Engine",
    price: "$649",
    detail: "For competitive local niches (Dentists, Lawyers, Roofing, Real Estate, Clinics).",
    items: [
      "All Kickstart features",
      "100+ premium geo-targeted citations",
      "3 custom localized city/service landing pages",
      "Automated 5-star review collection system",
      "Local press release & media distribution",
      "Targeting up to 25 local search keywords",
    ],
    featured: true,
  },
  {
    name: "Multi-Location Enterprise",
    price: "$1,199",
    detail: "For franchises, regional businesses, or multi-branch clinics with 3+ locations.",
    items: [
      "Up to 3 distinct Google Business Profiles managed",
      "Comprehensive multi-location citation sync",
      "Dedicated local citation cleanup & duplicate removal",
      "Hyper-local link building campaign",
      "Dedicated Local SEO Account Director",
      "Bi-weekly ranking & call volume reviews",
    ],
  },
];

export default function LocalSeoPage() {
  return (
    <main className="inner-page">
      <Navbar />

      <div style={{ paddingTop: "80px" }}>
        <PageHero
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: "Local SEO & Google Maps" },
          ]}
          label="Hyper-Local Growth"
          title={
            <>
              Dominate <span style={{ color: "var(--accent-blue)" }}>Google Maps 3-Pack</span> & Local Search
            </>
          }
          description="Get your business in front of ready-to-buy local customers. We optimize your Google Business Profile, build local authority, and drive consistent phone calls and foot traffic."
          right={
            <Link
              href="/contact?service=Local+SEO"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-4 text-sm font-black text-white"
              style={{ background: "var(--gradient)", boxShadow: "var(--glow-blue)" }}
            >
              Get Local SEO Audit
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        {/* Pillars */}
        <section className="py-20 sm:py-28" style={{ background: "var(--bg-base)" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent-blue)" }}>
                The Local Search Formula
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-2" style={{ color: "var(--text-primary)" }}>
                How We Rank Your Business #1 in Your City
              </h2>
              <p className="mt-3 text-base" style={{ color: "var(--text-muted)" }}>
                Google Maps accounts for over 44% of all local business clicks. Here is how we ensure you win those calls.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {localSeoPillars.map((pillar) => {
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
                Monthly Retainer Plans
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-2" style={{ color: "var(--text-primary)" }}>
                Predictable Local Growth Packages
              </h2>
              <p className="mt-3 text-base" style={{ color: "var(--text-muted)" }}>
                Everything required to rank on Google Maps and outshine local competitors.
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
                      <span className="text-xs font-medium text-gray-500 ml-2">/ month</span>
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
                    href={`/contact?service=Local+SEO&plan=${encodeURIComponent(pkg.name)}`}
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
                Ready to Get More Calls in Your Local Area?
              </h2>
              <p className="text-sm sm:text-base mb-8 max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
                Claim your free Google Business Profile audit and competitor ranking breakdown today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/contact?service=Local+SEO"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-sm font-bold text-white shadow-xl transition-all"
                  style={{ background: "var(--gradient)", boxShadow: "var(--glow-blue)" }}
                >
                  <MapPin className="h-4 w-4" /> Start Local SEO Campaign
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
