"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  Rocket, 
  Search, 
  Globe2, 
  Zap, 
  Share2, 
  MapPin, 
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Code2,
  Layout,
  Sparkles,
  Smartphone
} from "lucide-react";

const ALL_SERVICES = [
  {
    id: "wordpress-dev",
    category: "webdev",
    badge: "WordPress & WooCommerce",
    icon: Layout,
    title: "Custom WordPress & WooCommerce Dev",
    desc: "Custom theme/plugin engineering, Elementor Pro design, WooCommerce store setup, bug fixes, and PHP/MySQL builds.",
    price: "From $199",
    href: "/services/website-maintenance",
    cta: "Explore WordPress Dev"
  },
  {
    id: "html-landing",
    category: "webdev",
    badge: "Pixel-Perfect UI",
    icon: Smartphone,
    title: "HTML5, CSS3, Tailwind & React Landing Pages",
    desc: "Figma/PSD to ultra-clean, mobile-responsive HTML5, Bootstrap, Tailwind, and React single-page conversion funnels.",
    price: "From $149",
    href: "/services/outsource-web-development",
    cta: "Build HTML / React Page"
  },
  {
    id: "nextjs-fullstack",
    category: "fullstack",
    badge: "Full-Stack Architecture",
    icon: Rocket,
    title: "Next.js 15 Full-Stack & SaaS Engineering",
    desc: "Ultra-fast headless React web applications, custom CRM portals, and database-backed platforms with sub-500ms speed.",
    price: "Custom Scope",
    href: "/services/wordpress-to-nextjs-migration",
    cta: "Explore Full-Stack"
  },
  {
    id: "speed-optimization",
    category: "webdev",
    badge: "90+ Score Guaranteed",
    icon: Zap,
    title: "WordPress Speed Optimization",
    desc: "Deep MySQL index tuning, LiteSpeed server cache, and critical CSS extraction to lock 90+ mobile Core Web Vitals.",
    price: "From $99",
    href: "/services/wordpress-speed-optimization",
    cta: "Speed Up Website"
  },
  {
    id: "uk-formation",
    category: "formation",
    badge: "Official Registry",
    icon: Building2,
    title: "UK Limited Company (LTD) Formation",
    desc: "24-48h direct Companies House filing, 1-Year London registered office, CRN, and Wise/Stripe banking pack.",
    price: "From $269",
    href: "/services/uk-company-formation",
    cta: "Form UK Company"
  },
  {
    id: "us-formation",
    category: "formation",
    badge: "US Secretary of State",
    icon: ShieldCheck,
    title: "US LLC Formation & EIN Tax ID",
    desc: "Wyoming, Delaware, Texas & New Mexico LLCs with Registered Agent, Articles of Organization, and IRS EIN.",
    price: "From $275",
    href: "/services/form-business",
    cta: "Form US LLC"
  },
  {
    id: "guest-posting",
    category: "seo",
    badge: "65,000+ Publishers",
    icon: Globe2,
    title: "High-DA Editorial Guest Posting",
    desc: "100% permanent DoFollow backlinks on real news and industry websites with verified organic search traffic.",
    price: "From $49",
    href: "/services/guest-posting",
    cta: "View DA Inventory"
  },
  {
    id: "local-seo",
    category: "seo",
    badge: "Top 3 Map Pack",
    icon: MapPin,
    title: "Local SEO & 3-Pack Citation Building",
    desc: "Dominate Google Maps and local proximity searches across 8 major countries with 100% manual NAP directory submissions.",
    price: "From $79",
    href: "/services/local-citations",
    cta: "Rank in Map Pack"
  }
];

const TABS = [
  { id: "all", label: "🌐 All Capabilities" },
  { id: "webdev", label: "🛠️ WordPress & HTML/CSS" },
  { id: "fullstack", label: "⚡ Full-Stack & Next.js" },
  { id: "seo", label: "📈 Organic SEO & Backlinks" },
  { id: "formation", label: "🏛️ US & UK Formations" },
];

export default function ServicesSection() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredServices = activeTab === "all" 
    ? ALL_SERVICES 
    : ALL_SERVICES.filter(s => s.category === activeTab);

  return (
    <section id="services" className="section-padding py-20 md:py-28" style={{ background: "var(--bg-base)" }}>
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div
              className="mb-3 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#146c78]/10 text-[#146c78]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Full-Service Digital Powerhouse
            </div>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-space-grotesk), sans-serif" }}
            >
              WordPress, Full-Stack Web &amp; <span style={{ color: "var(--accent-blue)" }}>Global Growth</span>
            </h2>
            <p className="mt-4 text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              From bespoke WordPress/WooCommerce and custom HTML5/CSS3 landing pages to high-scale Next.js full-stack architectures, SEO, and US/UK corporate entity filings.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-2 font-bold text-sm text-[#146c78] hover:text-[#0f545e] transition-colors whitespace-nowrap self-start md:self-end pb-2"
          >
            <span>View All 20+ Services Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Interactive Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                  isActive 
                    ? "bg-[#146c78] text-white shadow-md shadow-[#146c78]/20" 
                    : "bg-white text-gray-600 border border-gray-200 hover:border-[#146c78]/40 hover:text-[#146c78]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Services Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredServices.map((service) => {
            const Icon = service.icon;
            return (
              <article
                key={service.id}
                className="group flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl relative overflow-hidden"
                style={{
                  background: "#ffffff",
                  borderColor: "var(--border-subtle)",
                  boxShadow: "0 10px 28px rgba(24,32,38,0.05)",
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: "rgba(20, 108, 120, 0.1)",
                        color: "var(--accent-blue)",
                      }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                      {service.badge}
                    </span>
                  </div>

                  <h3
                    className="text-lg font-bold leading-snug mb-2 group-hover:text-[#146c78] transition-colors"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {service.title}
                  </h3>

                  <p className="text-xs sm:text-sm leading-relaxed text-gray-500 mb-6 line-clamp-3">
                    {service.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">{service.price}</span>
                  <Link
                    href={service.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#146c78] group-hover:translate-x-1 transition-transform"
                  >
                    <span>{service.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
