import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  Globe2,
  Headphones,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Website Maintenance & Care Plans | 24/7 Support & Backups | OfficialUM1",
  description:
    "Protect your digital investment with OfficialUM1 Website Care Plans. 24/7 uptime monitoring, daily cloud backups, weekly updates, security scans & dedicated developer hours.",
  keywords: [
    "website maintenance plans",
    "wordpress care plans",
    "monthly website management service",
    "website backup and security retainer",
    "ecommerce maintenance contract",
  ],
  alternates: {
    canonical: "https://officialum1.com/services/website-maintenance",
  },
};

const carePillars = [
  {
    icon: RefreshCw,
    title: "Safe Weekly Updates & Staging",
    text: "We test all core, theme, and plugin updates on isolated staging environments before deploying to prevent sudden broken features.",
  },
  {
    icon: Database,
    title: "Daily Automated Cloud Backups",
    text: "Encrypted daily snapshots stored across off-site Amazon S3 storage with 1-click instant disaster recovery.",
  },
  {
    icon: Clock,
    title: "24/7 Real-Time Uptime Monitoring",
    text: "Continuous 60-second ping monitors alert our engineering team instantly if your server experiences any latency or downtime.",
  },
  {
    icon: ShieldCheck,
    title: "Continuous Malware & Firewall Scans",
    text: "Automated daily security sweeps, brute force protection, and SSL verification keep hackers and vulnerabilities locked out.",
  },
  {
    icon: Headphones,
    title: "Dedicated Monthly Developer Hours",
    text: "Use your allocated developer hours each month for content changes, new banners, form fixes, or new feature additions.",
  },
  {
    icon: Zap,
    title: "Monthly Speed & Performance Audits",
    text: "Regular database defragmentation and cache optimization to keep your loading speed consistently under 1.5 seconds.",
  },
];

const packages = [
  {
    name: "Essential Care Plan",
    price: "$99",
    detail: "For small business websites and blogs needing peace of mind and security.",
    items: [
      "Daily off-site cloud backups",
      "Weekly safe plugin/core updates",
      "24/7 uptime & SSL monitoring",
      "Daily automated security scans",
      "1 hour dedicated monthly edits",
      "Monthly health & traffic report",
    ],
  },
  {
    name: "Business & WooCommerce Pro",
    price: "$199",
    detail: "For active e-commerce stores and revenue-critical business platforms.",
    items: [
      "Real-time hourly e-commerce backups",
      "WooCommerce checkout & gateway testing",
      "Priority 1-hour emergency response SLA",
      "Monthly speed & database optimization",
      "3 hours dedicated developer edits",
      "Staging environment testing",
    ],
    featured: true,
  },
  {
    name: "Agency Multi-Site Retainer",
    price: "$399",
    detail: "For agencies and high-traffic brands managing multiple production domains.",
    items: [
      "Up to 3 production websites covered",
      "Custom API & integration monitoring",
      "Dedicated senior engineer on Slack",
      "6 hours dedicated monthly development",
      "Custom white-label client reports",
      "Unlimited emergency triage fixes",
    ],
  },
];

export default function WebsiteMaintenancePage() {
  return (
    <main className="inner-page">
      <Navbar />

      <div style={{ paddingTop: "80px" }}>
        <PageHero
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: "Website Maintenance" },
          ]}
          label="Continuous Care & Growth"
          title={
            <>
              Worry-Free <span style={{ color: "var(--accent-blue)" }}>Website Maintenance</span> & Care Plans
            </>
          }
          description="Never worry about updates breaking your site, malware, or server downtime again. Our dedicated engineering team keeps your website secure, fast, and constantly backed up."
          right={
            <Link
              href="/contact?service=Website+Maintenance"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-4 text-sm font-black text-white"
              style={{ background: "var(--gradient)", boxShadow: "var(--glow-blue)" }}
            >
              Choose Care Plan
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        {/* Pillars */}
        <section className="py-20 sm:py-28" style={{ background: "var(--bg-base)" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent-blue)" }}>
                Proactive Website Management
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-2" style={{ color: "var(--text-primary)" }}>
                Everything Included in Your Monthly Care Plan
              </h2>
              <p className="mt-3 text-base" style={{ color: "var(--text-muted)" }}>
                Focus on running your business while our software engineers handle all technical maintenance, backups, and security.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {carePillars.map((pillar) => {
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

        {/* Pricing */}
        <section className="py-20 sm:py-28" style={{ background: "var(--bg-section)" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent-blue)" }}>
                Simple Monthly Retainers
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-2" style={{ color: "var(--text-primary)" }}>
                Choose the Perfect Level of Support
              </h2>
              <p className="mt-3 text-base" style={{ color: "var(--text-muted)" }}>
                No long-term contracts. Pause or cancel anytime with zero cancellation fees.
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
                    href={`/contact?service=Website+Maintenance&plan=${encodeURIComponent(pkg.name)}`}
                    className="w-full inline-flex items-center justify-center rounded-xl py-3.5 text-sm font-extrabold text-white transition-all shadow-md"
                    style={{
                      background: pkg.featured ? "var(--gradient)" : "var(--primary)",
                      boxShadow: pkg.featured ? "var(--glow-blue)" : "none",
                    }}
                  >
                    Enroll in {pkg.name}
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
                Get 24/7 Engineering Support for Your Website
              </h2>
              <p className="text-sm sm:text-base mb-8 max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
                Join hundreds of businesses that trust OfficialUM1 for reliable monthly website management.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/contact?service=Website+Maintenance"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-sm font-bold text-white shadow-xl transition-all"
                  style={{ background: "var(--gradient)", boxShadow: "var(--glow-blue)" }}
                >
                  <ShieldCheck className="h-4 w-4" /> Start Monthly Care Plan
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
