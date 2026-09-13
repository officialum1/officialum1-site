import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ROICalculator from "@/components/ROICalculator";
import SuccessRoadmap from "@/components/SuccessRoadmap";
import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Globe, MapPin, RefreshCw, Rocket, Search, Share2, ShieldCheck, ShoppingBag, Sparkles, TrendingUp, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Services | Digital Marketing Agency in Sahiwal | OfficialUM1",
  description:
    "OfficialUM1 provides SEO, web development, guest posting, and digital marketing services in Sahiwal, Pakistan for local and global businesses.",
  keywords: [
    "digital marketing agency sahiwal",
    "digital marketing agency in sahiwal",
    "SEO Services Sahiwal",
    "Guest Posting Agency Sahiwal",
    "Web Development Sahiwal",
  ],
  alternates: { canonical: "https://officialum1.com/services" },
};

const services = [
  {
    icon: Zap,
    title: "WordPress Speed Optimization",
    desc: "Guaranteed 90+ Google PageSpeed score and sub-1.5s load times with zero downtime.",
    href: "/services/wordpress-speed-optimization",
    cta: "Speed Up Site",
  },
  {
    icon: Rocket,
    title: "WordPress to Next.js Migration",
    desc: "Migrate clunky WordPress sites to high-speed, ultra-secure Next.js 14 App Router platforms.",
    href: "/services/wordpress-to-nextjs-migration",
    cta: "Migrate to Next.js",
  },
  {
    icon: ShieldCheck,
    title: "Malware Removal & Security",
    desc: "Emergency 24-hour WordPress malware cleanup, backdoor removal & 60-day hack-free warranty.",
    href: "/services/wordpress-malware-removal",
    cta: "Clean Malware",
  },
  {
    icon: ShoppingBag,
    title: "E-Commerce CRO Optimization",
    desc: "Turn visitors into buyers with 1-click checkouts, sticky carts, and average order value upsells.",
    href: "/services/ecommerce-cro",
    cta: "Boost Conversions",
  },
  {
    icon: MapPin,
    title: "Local SEO & Google Maps 3-Pack",
    desc: "Dominate Google Maps local pack rankings, citations, and inbound calls for US/UK businesses.",
    href: "/services/local-seo",
    cta: "Rank Locally",
  },
  {
    icon: Globe,
    title: "High DA Guest Posting",
    desc: "100% DoFollow editorial guest posts on 65,000+ verified websites with real Google traffic (DA 40-75+).",
    href: "/services/guest-posting",
    cta: "View Guest Posts",
  },
  {
    icon: TrendingUp,
    title: "Curated Niche Edits (Link Insertions)",
    desc: "Fast-track ranking authority with in-content contextual links placed inside aged, indexed Google articles.",
    href: "/services/niche-edits",
    cta: "View Niche Edits",
  },
  {
    icon: Sparkles,
    title: "Crypto & Web3 Guest Posting",
    desc: "Targeted blockchain, DeFi, Bitcoin & Web3 backlink placements across premier crypto media portals.",
    href: "/services/crypto-guest-posting",
    cta: "Explore Crypto Links",
  },
  {
    icon: Share2,
    title: "Press Release Distribution",
    desc: "Guaranteed AP News, Yahoo Finance & Google News syndication across 350+ top global news portals.",
    href: "/services/press-release-distribution",
    cta: "Distribute PR",
  },
  {
    icon: MapPin,
    title: "Local SEO & Citation Building",
    desc: "100% manual local business directory citations with strict NAP consistency to dominate Google 3-Pack.",
    href: "/services/local-citations",
    cta: "Build Citations",
  },
  {
    icon: RefreshCw,
    title: "Website Care & Maintenance",
    desc: "Daily cloud backups, weekly safe updates, 24/7 uptime monitoring & dedicated developer hours.",
    href: "/services/website-maintenance",
    cta: "View Care Plans",
  },
  {
    icon: Search,
    title: "White Label Agency SEO",
    desc: "Invisible, ultra-profitable SEO fulfillment and technical execution for marketing agencies.",
    href: "/services/white-label-seo",
    cta: "Agency Partner",
  },
];

export default function ServicesPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Digital Marketing & Web Development",
    provider: {
      "@id": "https://officialum1.com/#organization",
    },
    areaServed: "Worldwide",
    description:
      "Premium SEO, web development, guest posting, and social growth services tailored for global brands.",
    url: "https://officialum1.com/services",
  };

  return (
    <main className="inner-page">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <div style={{ paddingTop: "80px" }}>
        <PageHero
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
          label="Services"
          title="What We Build For You"
          description="High-performance websites, SEO engines, guest posting, and growth systems designed to convert."
        />

        <section className="py-[96px]" style={{ background: "var(--bg-base)" }}>
          <div className="container">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <article
                  key={service.title}
                  className="group rounded-xl border p-7 transition duration-300 hover:-translate-y-1"
                  style={{
                    background: "#fff",
                    borderColor: "var(--border-subtle)",
                    boxShadow: "0 12px 30px rgba(24,32,38,0.06)",
                  }}
                >
                  <div
                    className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg"
                    style={{ background: "rgba(20,108,120,0.10)", color: "var(--accent-blue)" }}
                  >
                    <service.icon className="h-6 w-6" />
                  </div>
                  <h2 className="mb-3 text-2xl font-black" style={{ color: "var(--text-primary)" }}>
                    {service.title}
                  </h2>
                  <p className="mb-6 text-sm leading-7" style={{ color: "var(--text-muted)", fontWeight: 500 }}>
                    {service.desc}
                  </p>
                  <a
                    href={service.href}
                    className="inline-flex items-center text-sm font-bold"
                    style={{ color: "var(--accent-blue)", textDecoration: "none" }}
                  >
                    {service.cta} -&gt;
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-[88px]" style={{ background: "var(--bg-section)" }}>
          <div className="container">
            <div
              className="rounded-2xl border p-8 md:p-12"
              style={{
                background: "linear-gradient(135deg, #ffffff, #eef4f2)",
                borderColor: "var(--border-subtle)",
                boxShadow: "0 18px 44px rgba(24,32,38,0.08)",
              }}
            >
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <span
                    className="text-xs font-bold uppercase"
                    style={{ color: "var(--accent-blue)", letterSpacing: 0 }}
                  >
                    Instant Scale
                  </span>
                  <h2 className="mt-4 text-3xl font-black md:text-5xl">
                    Ready to scale faster?
                  </h2>
                  <p className="max-w-2xl text-base" style={{ color: "var(--text-muted)", fontWeight: 500 }}>
                    We will map your next 30 days: what to build, what to rank, and what to automate.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href="/work"
                    className="rounded-lg border px-6 py-3 text-center font-bold"
                    style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                  >
                    View Work
                  </a>
                  <a
                    href="/contact"
                    className="rounded-lg px-6 py-3 text-center font-bold text-white"
                    style={{ background: "var(--gradient)" }}
                  >
                    Talk to Expert
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-[96px]" style={{ background: "var(--bg-base)" }}>
          <div className="container">
            <SuccessRoadmap />
          </div>
        </section>

        <section className="py-[96px]" style={{ background: "var(--bg-section)" }}>
          <div className="container">
            <ROICalculator />
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
