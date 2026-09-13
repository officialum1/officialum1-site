import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Gauge,
  Globe2,
  Layers,
  Lock,
  Rocket,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SpeedAuditQuoteForm from "@/components/SpeedAuditQuoteForm";
import { PageHero } from "@/components/ui/PageHero";
import Script from "next/script";

export const metadata: Metadata = {
  title: "WordPress Speed Optimization Services | Guaranteed 90+ PageSpeed Score | OfficialUM1",
  description:
    "Accelerate your WordPress & WooCommerce store to under 1.5s load time with guaranteed 90+ Google PageSpeed score. Zero downtime, database tuning, LiteSpeed/Cloudflare edge caching & Core Web Vitals fixes.",
  keywords: [
    "wordpress speed optimization service",
    "speed up woocommerce store",
    "fix core web vitals wordpress",
    "google pagespeed 90+ guarantee",
    "litespeed cache optimization",
    "reduce ttfb wordpress",
    "wordpress database optimization",
  ],
  alternates: {
    canonical: "https://officialum1.com/services/wordpress-speed-optimization",
  },
  openGraph: {
    title: "WordPress Speed Optimization Services | 90+ PageSpeed Guarantee",
    description:
      "Transform slow WordPress & WooCommerce stores into ultra-fast, high-converting platforms with guaranteed sub-1.5s load times.",
    url: "https://officialum1.com/services/wordpress-speed-optimization",
    siteName: "OfficialUM1 LLC",
    locale: "en_US",
    type: "website",
  },
};

const speedPillars = [
  {
    icon: Database,
    title: "Database Query & Transient Cleanup",
    text: "We optimize MySQL schema tables, purge orphaned post revisions, eliminate autoloaded bloat, and index heavy queries to eliminate server bottlenecks.",
  },
  {
    icon: Rocket,
    title: "LiteSpeed & Cloudflare Edge Caching",
    text: "Deploy enterprise full-page caching, micro-caching, and global Cloudflare CDN edge rules so dynamic content delivers in under 200ms TTFB worldwide.",
  },
  {
    icon: Cpu,
    title: "Render-Blocking JS & Critical CSS Delay",
    text: "Extract critical path CSS, defer non-essential JavaScript, and delay heavy third-party scripts (Pixel, Analytics, Chats) until user interaction.",
  },
  {
    icon: Layers,
    title: "Next-Gen WebP / AVIF Media Pipeline",
    text: "Compress and convert all JPEG/PNG media to next-gen WebP/AVIF formats with lossless compression, dynamic lazy loading, and responsive sizing.",
  },
  {
    icon: Zap,
    title: "WooCommerce Cart & Checkout Acceleration",
    text: "Eliminate cart fragmentation, disable unneeded cart-fragments AJAX script on non-shop pages, and turbocharge checkout completion rates.",
  },
  {
    icon: ShieldCheck,
    title: "100% Zero-Downtime & Safety Guarantee",
    text: "All optimizations are staged or tested meticulously with complete staging backups to ensure zero visual breakages or downtime.",
  },
];

const comparisonMetrics = [
  {
    metric: "Google PageSpeed Mobile Score",
    before: "34 / 100",
    after: "96+ / 100",
    improvement: "+182% Score",
  },
  {
    metric: "Largest Contentful Paint (LCP)",
    before: "5.4s (Critical Delay)",
    after: "0.85s (Instant)",
    improvement: "6.3x Faster",
  },
  {
    metric: "Server Response Time (TTFB)",
    before: "1.8s (Slow Server)",
    after: "160ms (Edge Cached)",
    improvement: "11x Reduction",
  },
  {
    metric: "Total Page Weight / Assets",
    before: "6.8 MB (Heavy)",
    after: "1.2 MB (Optimized)",
    improvement: "82% Saved",
  },
];

const packages = [
  {
    name: "Standard Speed Boost",
    price: "$149",
    detail: "Ideal for blogs, portfolio sites, and standard business WordPress websites.",
    items: [
      "Guaranteed 90+ Mobile & Desktop Score",
      "Sub-1.5s Total Load Time",
      "Full WebP image conversion",
      "Database & autoloaded bloat cleanup",
      "Render-blocking JS/CSS deferral",
      "Full backup & zero downtime guarantee",
      "24-48 hours turnaround",
    ],
  },
  {
    name: "WooCommerce & E-Commerce Pro",
    price: "$299",
    detail: "For active online stores losing sales to slow carts, product filters, and checkout lag.",
    items: [
      "Guaranteed 95+ PageSpeed on Store Pages",
      "WooCommerce Cart-Fragments & AJAX fix",
      "High-concurrency query optimization",
      "LiteSpeed / Redis Object Caching setup",
      "Cloudflare CDN edge cache integration",
      "Core Web Vitals (LCP, INP, CLS) green pass",
      "30 days performance monitoring",
    ],
    featured: true,
  },
  {
    name: "Enterprise Fleet & Multi-Site",
    price: "$599",
    detail: "For agencies, high-traffic portals, multisite networks, or complex custom architectures.",
    items: [
      "Complete multi-server/VPS performance audit",
      "Custom PHP-FPM & OPcache server tuning",
      "Redis memory caching configuration",
      "Third-party tag manager optimization",
      "Staging environment testing",
      "Dedicated performance engineer on Slack",
      "60 days priority guarantee",
    ],
  },
];

const faqs = [
  {
    q: "Will speed optimization break my WordPress layout or styling?",
    a: "No. We never blindly minify or bundle scripts. We carefully map critical CSS, test layout stability, and ensure all dynamic functionalities (sliders, checkout, forms) operate perfectly before pushing optimizations live.",
  },
  {
    q: "What is your 90+ Google PageSpeed Guarantee?",
    a: "We guarantee that your core pages will achieve a 90+ score on Google PageSpeed Insights and load under 1.5s. If we fail to hit this benchmark due to infrastructure limits, you receive a 100% full refund.",
  },
  {
    q: "Do I need to change my hosting provider?",
    a: "In 95% of cases, no. Our advanced server caching, asset deferrals, and database tuning will dramatically speed up your site on your existing host (Hostinger, SiteGround, Bluehost, GoDaddy, Cloudways). If your server hardware is genuinely bottlenecked, we will provide transparent advice.",
  },
  {
    q: "How fast is the turnaround time?",
    a: "Standard sites are fully optimized within 24 to 48 hours. WooCommerce stores take 2 to 3 days to allow thorough cart and checkout flow verification.",
  },
  {
    q: "How do we get started?",
    a: "Simply submit your domain in the audit form on this page or email hello@officialum1.com. We will run a diagnostic and provide your custom optimization roadmap.",
  },
];

export default function WordPressSpeedOptimizationPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://officialum1.com" },
      { "@type": "ListItem", position: 2, name: "Services", item: "https://officialum1.com/services" },
      {
        "@type": "ListItem",
        position: 3,
        name: "WordPress Speed Optimization",
        item: "https://officialum1.com/services/wordpress-speed-optimization",
      },
    ],
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "WordPress Speed Optimization & Core Web Vitals Acceleration",
    provider: {
      "@type": "Organization",
      name: "OfficialUM1 LLC",
      url: "https://officialum1.com",
    },
    description:
      "Enterprise-grade speed optimization for WordPress and WooCommerce websites. Sub-1.5s load times, 90+ Google PageSpeed score guarantee, and zero downtime.",
    serviceType: "Web Performance Optimization",
    areaServed: "Global",
    url: "https://officialum1.com/services/wordpress-speed-optimization",
  };

  return (
    <main className="min-h-screen bg-[#05070a] text-white">
      <Navbar />

      {/* Structured SEO Schemas */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id="service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <div style={{ paddingTop: "80px" }}>
        {/* Page Hero */}
        <PageHero
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: "WordPress Speed Optimization" },
          ]}
          label="Performance Engineering"
          title={
            <>
              Guaranteed <span className="text-red-500">90+ PageSpeed</span> & Sub-1.5s Load Time for WordPress
            </>
          }
          description="Stop losing 30-40% of your conversions to slow load times. We transform sluggish WordPress & WooCommerce websites into lightning-fast platforms with zero downtime."
        />

        {/* Live Speed Score Comparison Section */}
        <section className="py-16 sm:py-24 border-b border-gray-900 bg-gradient-to-b from-[#05070a] via-gray-950 to-[#05070a]">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1 text-xs font-semibold text-red-400 mb-4">
                <Gauge className="h-4 w-4" /> Real Client Diagnostic Metrics
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Before vs. After OfficialUM1 Optimization
              </h2>
              <p className="mt-3 text-gray-400 text-base sm:text-lg">
                See the measurable impact our performance engineers deliver across Core Web Vitals, server latency, and mobile score.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {comparisonMetrics.map((item) => (
                <div
                  key={item.metric}
                  className="rounded-3xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl relative overflow-hidden backdrop-blur-md"
                >
                  <div className="absolute top-0 right-0 rounded-bl-xl bg-emerald-500/10 border-b border-l border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                    {item.improvement}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 pr-12">
                    {item.metric}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                      <span className="text-xs text-red-400 font-medium">Before:</span>
                      <span className="text-sm font-bold text-gray-400 line-through">{item.before}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-400 font-bold">After:</span>
                      <span className="text-lg font-extrabold text-white text-emerald-400">{item.after}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6 Technical Pillars */}
        <section className="py-20 sm:py-28 bg-[#05070a]">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-red-400">
                Full-Stack Performance Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
                How We Turbocharge Your WordPress Infrastructure
              </h2>
              <p className="mt-3 text-gray-400 text-base">
                We don’t just install basic caching plugins. We execute deep code-level, database-level, and CDN-level optimizations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {speedPillars.map((pillar) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/40 to-gray-950/80 p-8 shadow-lg hover:border-red-500/40 transition-all duration-300 group"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 mb-6 group-hover:scale-110 group-hover:bg-red-500/20 transition-all">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{pillar.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{pillar.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Interactive Speed Audit Intake Form */}
        <section id="audit-form" className="py-16 sm:py-24 border-y border-gray-900 bg-gradient-to-b from-gray-950 via-[#0a0d14] to-gray-950">
          <div className="container mx-auto px-4 max-w-4xl">
            <SpeedAuditQuoteForm />
          </div>
        </section>

        {/* Transparent Pricing Packages */}
        <section className="py-20 sm:py-28 bg-[#05070a]">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-red-400">
                Transparent & Risk-Free
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
                Simple, Flat-Rate Performance Packages
              </h2>
              <p className="mt-3 text-gray-400 text-base">
                One-time investment. Pay only after you verify the live 90+ PageSpeed benchmark.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.map((pkg) => (
                <div
                  key={pkg.name}
                  className={`rounded-3xl border p-8 flex flex-col justify-between transition-all duration-300 relative ${
                    pkg.featured
                      ? "border-red-500 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950 shadow-2xl shadow-red-500/10 ring-1 ring-red-500"
                      : "border-gray-800 bg-gray-900/40 hover:border-gray-700"
                  }`}
                >
                  {pkg.featured && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-red-600 px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                    <p className="text-xs text-gray-400 mb-6 min-h-[36px]">{pkg.detail}</p>
                    <div className="text-4xl font-black text-white mb-6">
                      {pkg.price}
                      <span className="text-xs font-medium text-gray-400 ml-2">/ one-time</span>
                    </div>

                    <ul className="space-y-3.5 mb-8 border-t border-gray-800 pt-6">
                      {pkg.items.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-xs text-gray-300">
                          <CheckCircle2 className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href="#audit-form"
                    className={`w-full inline-flex items-center justify-center rounded-xl py-3.5 text-sm font-bold transition-all ${
                      pkg.featured
                        ? "bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/20"
                        : "bg-gray-800 text-white hover:bg-gray-700"
                    }`}
                  >
                    Select {pkg.name}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Verified Live Projects / Client Showcase */}
        <section className="py-16 sm:py-24 border-y border-gray-900 bg-gray-950/60">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
              Proven Across High-Scale Production Platforms
            </h3>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto mb-8">
              Explore live client platforms engineered, accelerated, and maintained by OfficialUM1 LLC:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {[
                { name: "adsokay.com", desc: "AdTech & Web Platform" },
                { name: "thematelstrip.com", desc: "Industrial & E-Commerce" },
                { name: "sahiwaldivision.com", desc: "High-Traffic News Portal" },
                { name: "famemake.com", desc: "Media & Growth Platform" },
                { name: "meetfaced.com", desc: "Community Architecture" },
              ].map((site) => (
                <a
                  key={site.name}
                  href={`https://${site.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-gray-800 bg-gray-900/60 px-5 py-3 text-left hover:border-red-500/50 hover:bg-gray-850 transition"
                >
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {site.name} <ArrowRight className="h-3 w-3 text-red-400" />
                  </div>
                  <div className="text-[11px] text-gray-500">{site.desc}</div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Deep FAQ Section */}
        <section className="py-20 sm:py-28 bg-[#05070a]">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-red-400">
                Frequently Asked Questions
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
                Everything You Need to Know
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6 sm:p-8 hover:border-gray-700 transition"
                >
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2 flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                    {faq.q}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed pl-8">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Conversion CTA Banner */}
        <section className="py-20 bg-gray-950 border-t border-gray-900">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="rounded-3xl border border-red-500/20 bg-gradient-to-r from-red-950/40 via-gray-900 to-red-950/40 p-10 sm:p-14 text-center relative overflow-hidden shadow-2xl">
              <div className="relative z-10 max-w-2xl mx-auto">
                <span className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-1 text-xs font-bold text-red-400 mb-4 border border-red-500/30">
                  <Clock className="h-3.5 w-3.5" /> 24-Hour Express Delivery
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                  Ready to Turn Your WordPress Site Into a Speed Machine?
                </h2>
                <p className="text-gray-300 text-sm sm:text-base mb-8">
                  Get your free diagnostic report today. Guaranteed 90+ PageSpeed or you pay nothing.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="#audit-form"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-red-600/30 hover:bg-red-500 transition-all duration-300"
                  >
                    <Gauge className="h-4 w-4" /> Request Speed Audit Now
                  </a>
                  <a
                    href="mailto:hello@officialum1.com"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-8 py-4 text-sm font-bold text-gray-200 hover:bg-gray-800 transition"
                  >
                    Email: hello@officialum1.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
