import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  Gauge,
  Globe2,
  Layers,
  Lock,
  Rocket,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "WordPress to Next.js Migration Services | Headless React Web Architecture | OfficialUM1",
  description:
    "Migrate bloated WordPress sites to high-speed Next.js 14 App Router architectures. Sub-500ms load times, unbreakable security, 100% SEO ranking preservation & headless CMS flexibility.",
  keywords: [
    "wordpress to nextjs migration",
    "headless wordpress development",
    "migrate wordpress to react",
    "next.js agency services",
    "custom nextjs fullstack architecture",
    "high speed web platform migration",
  ],
  alternates: {
    canonical: "https://officialum1.com/services/wordpress-to-nextjs-migration",
  },
};

const migrationPillars = [
  {
    icon: Rocket,
    title: "Sub-500ms Instant React Transitions",
    text: "Say goodbye to server lag and heavy PHP execution. Next.js static page generation (SSG) and server components (RSC) deliver instant page switching.",
  },
  {
    icon: Lock,
    title: "Unbreakable Headless Security",
    text: "By decoupling the frontend from the backend, your database and admin dashboard are invisible to the public internet, eliminating 99.9% of brute-force and plugin exploits.",
  },
  {
    icon: Globe2,
    title: "100% SEO & Backlink Preservation",
    text: "We map every existing URL, metadata tag, schema markup, and canonical structure with strict 301 redirection rules so you retain 100% of your organic search rankings.",
  },
  {
    icon: Layers,
    title: "Headless CMS Flexibility",
    text: "Keep editing your content easily using headless WordPress (GraphQL/REST API), Sanity, Strapi, or Contentful while users experience blazing-fast Next.js speed.",
  },
  {
    icon: Cpu,
    title: "Infinite Scalability & Zero Crashes",
    text: "Handle massive traffic surges without server slowdowns. Next.js deploys on global edge networks (Vercel / Cloudflare) with automated caching.",
  },
  {
    icon: Code2,
    title: "Custom Interactive UI / UX Components",
    text: "We replace heavy, clunky page builders (Elementor/Divi) with clean, modular TypeScript & Tailwind/CSS components built specifically for your brand.",
  },
];

const packages = [
  {
    name: "Starter Next.js Headless Build",
    price: "$1,499",
    detail: "For high-impact marketing websites, corporate blogs, and brand portfolios (up to 15 pages).",
    items: [
      "Custom Next.js 14 App Router build",
      "Headless WordPress / CMS sync",
      "100% SEO & URL redirection mapping",
      "Sub-1s guaranteed load time",
      "Global Edge CDN deployment",
      "30 days post-launch support",
    ],
  },
  {
    name: "Full-Stack Web App & E-Commerce",
    price: "$2,999",
    detail: "For high-scale e-commerce stores, custom SaaS directories, or media publishing platforms.",
    items: [
      "Next.js E-Commerce / Custom Portal",
      "Stripe / PayPal & Dynamic Cart API",
      "Custom authentication & user dashboards",
      "Algolia / Meilisearch instant search",
      "Database schema optimization",
      "60 days priority development support",
    ],
    featured: true,
  },
  {
    name: "Enterprise Architecture & Custom Platform",
    price: "$5,499+",
    detail: "For high-concurrency enterprise ecosystems, multi-tenant apps, or white-label agency platforms.",
    items: [
      "Full custom API microservices backend",
      "Multi-region database replication",
      "Custom automated CRM & lead pipelines",
      "Dedicated senior engineers on Slack",
      "Automated CI/CD DevOps setup",
      "90 days SLA & performance warranty",
    ],
  },
];

export default function WordPressToNextjsMigrationPage() {
  return (
    <main className="inner-page">
      <Navbar />

      <div style={{ paddingTop: "80px" }}>
        <PageHero
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: "WordPress to Next.js Migration" },
          ]}
          label="Next-Gen Web Architecture"
          title={
            <>
              Upgrade From WordPress to <span style={{ color: "var(--accent-blue)" }}>Next.js 14</span>
            </>
          }
          description="Transform your sluggish, plugin-heavy WordPress website into a lightning-fast, ultra-secure Next.js React platform with guaranteed sub-500ms speed and zero SEO loss."
          right={
            <Link
              href="/contact?service=Nextjs+Migration"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-4 text-sm font-black text-white"
              style={{ background: "var(--gradient)", boxShadow: "var(--glow-blue)" }}
            >
              Get Migration Roadmap
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        {/* Pillars */}
        <section className="py-20 sm:py-28" style={{ background: "var(--bg-base)" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent-blue)" }}>
                The Modern Web Standard
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-2" style={{ color: "var(--text-primary)" }}>
                Why Leading Brands Are Migrating to Next.js
              </h2>
              <p className="mt-3 text-base" style={{ color: "var(--text-muted)" }}>
                Escape plugin conflicts, security exploits, and sluggish load times with our clean, modular React architecture.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {migrationPillars.map((pillar) => {
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
                Migration Investment Tiers
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-2" style={{ color: "var(--text-primary)" }}>
                End-to-End Migration Packages
              </h2>
              <p className="mt-3 text-base" style={{ color: "var(--text-muted)" }}>
                Turnkey architectural transformation. Design, engineering, content sync, and DevOps deployment included.
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
                      <span className="text-xs font-medium text-gray-500 ml-2">/ one-time</span>
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
                    href={`/contact?service=Nextjs+Migration&plan=${encodeURIComponent(pkg.name)}`}
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
                Ready to Experience Next.js Speed?
              </h2>
              <p className="text-sm sm:text-base mb-8 max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
                Book a free consultation with our lead full-stack engineers to map your custom migration roadmap.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/contact?service=Nextjs+Migration"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-sm font-bold text-white shadow-xl transition-all"
                  style={{ background: "var(--gradient)", boxShadow: "var(--glow-blue)" }}
                >
                  <Rocket className="h-4 w-4" /> Start Next.js Migration
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
