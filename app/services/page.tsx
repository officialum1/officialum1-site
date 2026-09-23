import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ROICalculator from "@/components/ROICalculator";
import SuccessRoadmap from "@/components/SuccessRoadmap";
import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { 
  Globe, 
  MapPin, 
  RefreshCw, 
  Rocket, 
  Search, 
  Share2, 
  ShieldCheck, 
  ShoppingBag, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Smartphone, 
  BarChart3, 
  Bot, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  Palmtree,
  Crown,
  Server,
  Mail
} from "lucide-react";

export const metadata: Metadata = {
  title: "Enterprise Digital Marketing & Web Engineering Services | OfficialUM1",
  description:
    "OfficialUM1 LLC provides full-stack Next.js web development, enterprise SEO, high-DA guest posting, performance ads, and conversion engineering for global brands across US, UK, and UAE.",
  keywords: [
    "digital marketing agency",
    "enterprise SEO services",
    "Next.js web development",
    "guest posting agency",
    "WordPress speed optimization",
    "e-commerce CRO",
    "Google Ads management",
  ],
  alternates: { canonical: "https://officialum1.com/services" },
};

const servicePillars = [
  {
    category: "1. Engineering: Next.js, WordPress & Custom HTML",
    badge: "Full-Stack Development",
    description: "From blazing-fast Next.js 15 web apps to bespoke WordPress/WooCommerce and pixel-perfect HTML5/CSS3 landing pages, we build platforms that convert.",
    items: [
      {
        icon: Rocket,
        title: "WordPress to Next.js 15 Migration",
        desc: "Migrate legacy WordPress sites to ultra-fast Next.js headless platforms with guaranteed sub-500ms speeds and 0% downtime.",
        href: "/services/wordpress-to-nextjs-migration",
        cta: "Migrate to Next.js",
      },
      {
        icon: Globe,
        title: "Custom WordPress & WooCommerce Builds",
        desc: "Custom theme & plugin development, Elementor Pro design, WooCommerce store setup, and advanced PHP/MySQL customization.",
        href: "/services/website-maintenance",
        cta: "Explore WordPress Dev",
      },
      {
        icon: Smartphone,
        title: "Pixel-Perfect HTML5, CSS3 & React Landing Pages",
        desc: "Figma/PSD to high-converting, mobile-responsive HTML5, Tailwind, Bootstrap, and React single-page applications.",
        href: "/services/outsource-web-development",
        cta: "Build HTML/React Page",
      },
      {
        icon: Zap,
        title: "WordPress Speed Optimization (90+ Score)",
        desc: "Deep MySQL database re-indexing, LiteSpeed edge caching, and critical CSS extraction to lock 90+ mobile PageSpeed.",
        href: "/services/wordpress-speed-optimization",
        cta: "Speed Up Website",
      },
      {
        icon: Palmtree,
        title: "Dubai Tourism & Direct Booking Engines",
        desc: "High-converting booking engines for Desert Safari, Luxury Yacht Rentals, and Tour Agencies with 0% OTA commissions.",
        href: "/services/tourism-seo-dubai",
        cta: "Explore Tourism Solutions",
      },
      {
        icon: ShieldCheck,
        title: "Malware Removal & Cloud Security",
        desc: "Emergency 24-hour WordPress disinfection, backdoor eradication, and Google 'Deceptive Site' blacklist clearance.",
        href: "/services/wordpress-malware-removal",
        cta: "Clean Malware Now",
      },
    ]
  },
  {
    category: "2. Organic Search & Local Dominance",
    badge: "Top 1 Rankings",
    description: "Data-engineered search engine optimization to capture purchase-ready organic buyer traffic across Google US, UK, and Dubai (Google.ae).",
    items: [
      {
        icon: Search,
        title: "Enterprise SEO Retainers (US, UK, UAE)",
        desc: "Full-scale technical auditing, programmatic schema markup, competitor gap analysis, and compounding organic keyword rankings.",
        href: "/services/seo-services-dubai",
        cta: "Explore SEO Retainers",
      },
      {
        icon: MapPin,
        title: "Google Maps 3-Pack & Local SEO",
        desc: "Dominate local map pack listings, neighborhood landing pages, and consistent inbound phone calls across prime metro locations.",
        href: "/services/local-seo",
        cta: "Rank in Local 3-Pack",
      },
      {
        icon: Layers,
        title: "White-Label Agency SEO Fulfillment",
        desc: "Scalable, transparent, and invisible SEO execution designed for marketing agencies in North America, UK, and Australia.",
        href: "/services/white-label-seo",
        cta: "Partner as Agency",
      },
      {
        icon: MapPin,
        title: "High-NAP Citation Building",
        desc: "100% manual business directory submissions with verified NAP consistency to boost local Google algorithm prominence.",
        href: "/services/local-citations",
        cta: "Build Local Citations",
      },
    ]
  },
  {
    category: "3. High-DA Link Building & Digital PR",
    badge: "5,000+ Publishers",
    description: "Acquire permanent, contextual DoFollow backlinks on real high-traffic publications with zero private blog networks (PBNs).",
    items: [
      {
        icon: Globe,
        title: "High DA Editorial Guest Posting",
        desc: "DoFollow contextual links on 5,000+ verified news and industry publications with real Google organic traffic (DA 50–90+).",
        href: "/services/guest-posting",
        cta: "View Publisher Inventory",
      },
      {
        icon: TrendingUp,
        title: "Curated Niche Edits (In-Content Links)",
        desc: "Fast-track link equity by placing contextual backlinks inside established, top-ranking Google articles with existing traffic.",
        href: "/services/niche-edits",
        cta: "Explore Niche Edits",
      },
      {
        icon: Share2,
        title: "Global Press Release Syndication",
        desc: "Guaranteed brand features on AP News, Yahoo Finance, MarketWatch, and 350+ tier-1 international media outlets.",
        href: "/services/press-release-distribution",
        cta: "Distribute Press Release",
      },
      {
        icon: Sparkles,
        title: "Crypto, Web3 & FinTech Backlinks",
        desc: "Specialized backlink outreach and digital PR across leading blockchain, DeFi, Bitcoin, and FinTech news magazines.",
        href: "/services/crypto-guest-posting",
        cta: "Explore Crypto Media",
      },
    ]
  },
  {
    category: "4. Conversion, Paid Scale & Automation",
    badge: "Maximizing ROI",
    description: "Turn incoming traffic into closed deals with psychological CRO checkout funnels, precision PPC ads, and automated workflows.",
    items: [
      {
        icon: ShoppingBag,
        title: "E-Commerce CRO & Checkout Funnels",
        desc: "Engineered 1-click slide-out carts, sticky mobile buy bars, and post-purchase upsells that double store conversion rates.",
        href: "/services/ecommerce-cro",
        cta: "Boost Store Sales",
      },
      {
        icon: BarChart3,
        title: "Performance Google & Meta Ads Management",
        desc: "High-ROI paid search and social ad campaigns targeting purchase-ready commercial search queries with positive ROAS.",
        href: "/contact?service=Paid+Ads",
        cta: "Scale Paid Acquisition",
      },
      {
        icon: Bot,
        title: "AI Business Workflows & CRM Automation",
        desc: "Automated instant lead response systems, AI chatbots, and CRM integrations that follow up with inbound prospects in seconds.",
        href: "/contact?service=AI+Automation",
        cta: "Automate Workflows",
      },
      {
        icon: RefreshCw,
        title: "Enterprise Website Care & Maintenance",
        desc: "24/7 uptime monitoring, daily automated cloud snapshots, security hardening, and dedicated monthly senior developer hours.",
        href: "/services/website-maintenance",
        cta: "View Care Plans",
      },
    ]
  },
  {
    category: "5. Turnkey 360° Full Brand Launch & Management",
    badge: "Done-For-You Brand Incubator",
    description: "Complete hands-off brand incubation: We handle domain purchase, high-speed cloud/VPS hosting, corporate emails, custom web development, and launch verified social media channels.",
    items: [
      {
        icon: Server,
        title: "Domain Acquisition, Cloud Hosting & SSL Setup",
        desc: "End-to-end premium domain registration, DNS clustering, high-speed NVMe VPS/Cloud hosting, and lifetime auto-renewing SSL certificates.",
        href: "/contact?service=Brand+Handling",
        cta: "Deploy Hosting & Domain",
      },
      {
        icon: Share2,
        title: "Official Social Media Creation & High-End Branding",
        desc: "Complete setup and visual identity creation across Instagram, Facebook, LinkedIn, X (Twitter), TikTok, and YouTube with consistent brand assets.",
        href: "/contact?service=Brand+Handling",
        cta: "Launch Social Profiles",
      },
      {
        icon: Mail,
        title: "Google Workspace & Custom Business Emails",
        desc: "Professional @yourdomain.com email infrastructure with configured SPF, DKIM, DMARC, and MX records for 100% inbox delivery.",
        href: "/contact?service=Brand+Handling",
        cta: "Setup Corporate Inboxes",
      },
      {
        icon: Crown,
        title: "Turnkey 360° Complete Brand Launch Package",
        desc: "Zero to fully operational company in 7 days: Domain + VPS Server + Custom Website + Inboxes + All Social Channels + Google Maps.",
        href: "/contact?service=Turnkey+Brand+Launch",
        cta: "Get Turnkey Brand Scope",
      },
    ]
  }
];

export default function ServicesPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Full-Service Digital Marketing & Web Engineering",
    provider: {
      "@id": "https://officialum1.com/#organization",
    },
    areaServed: ["United States", "United Kingdom", "United Arab Emirates", "Worldwide"],
    description:
      "Enterprise Next.js web development, technical SEO, high-DA guest posting, and performance marketing tailored for global brands.",
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
          label="Full-Stack Digital Solutions"
          title="Engineered to Scale Revenue"
          description="Sub-500ms web architectures, dominant organic search engines, high-DA digital PR, and conversion systems built for high-growth global brands."
        />

        {/* 4 Pillars Section */}
        <section className="py-[80px]" style={{ background: "var(--bg-base)" }}>
          <div className="container">
            <div className="space-y-20">
              {servicePillars.map((pillar, pillarIdx) => (
                <div key={pillarIdx} className="space-y-8">
                  {/* Pillar Header */}
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2" style={{ background: "rgba(20,108,120,0.12)", color: "var(--accent-blue)" }}>
                        {pillar.badge}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black" style={{ color: "var(--text-primary)" }}>
                        {pillar.category}
                      </h2>
                      <p className="text-sm md:text-base text-gray-500 max-w-2xl mt-1 font-medium">
                        {pillar.description}
                      </p>
                    </div>
                  </div>

                  {/* Grid Cards */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {pillar.items.map((service, itemIdx) => (
                      <article
                        key={itemIdx}
                        className="group flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                        style={{
                          background: "#ffffff",
                          borderColor: "var(--border-subtle)",
                          boxShadow: "0 10px 28px rgba(24,32,38,0.05)",
                        }}
                      >
                        <div>
                          <div
                            className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
                            style={{ background: "rgba(20,108,120,0.10)", color: "var(--accent-blue)" }}
                          >
                            <service.icon className="h-6 w-6" />
                          </div>
                          <h3 className="mb-2.5 text-lg font-black leading-snug" style={{ color: "var(--text-primary)" }}>
                            {service.title}
                          </h3>
                          <p className="text-xs md:text-sm leading-relaxed text-gray-500 font-medium mb-6">
                            {service.desc}
                          </p>
                        </div>
                        
                        <a
                          href={service.href}
                          className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-colors hover:underline"
                          style={{ color: "var(--accent-blue)", textDecoration: "none" }}
                        >
                          <span>{service.cta}</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </a>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enterprise Call to Action Banner */}
        <section className="py-[80px]" style={{ background: "var(--bg-section)" }}>
          <div className="container">
            <div
              className="rounded-3xl border p-8 md:p-14"
              style={{
                background: "linear-gradient(135deg, #182026 0%, #0c1217 100%)",
                borderColor: "rgba(255,255,255,0.08)",
                boxShadow: "0 22px 50px rgba(24, 32, 38, 0.2)",
                color: "#ffffff"
              }}
            >
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <span
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
                    style={{ background: "rgba(20, 108, 120, 0.4)", color: "#5eead4" }}
                  >
                    Enterprise Growth Roadmap
                  </span>
                  <h2 className="text-3xl font-black md:text-5xl leading-tight">
                    Ready to scale your digital presence?
                  </h2>
                  <p className="max-w-2xl text-base text-gray-400 mt-2 font-medium">
                    Schedule a free 1-on-1 strategic consultation with our senior engineers. We’ll map out your technical architecture, search keywords, and revenue roadmap.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                  <a
                    href="/work"
                    className="rounded-xl border border-white/20 px-7 py-4 text-center font-bold text-white transition-all hover:bg-white/10"
                  >
                    View Portfolio & Case Studies
                  </a>
                  <a
                    href="/contact"
                    className="rounded-xl px-8 py-4 text-center font-black text-white transition-all hover:scale-105"
                    style={{ 
                      background: "linear-gradient(135deg, var(--accent-blue) 0%, #14808e 100%)",
                      boxShadow: "0 10px 25px rgba(20, 108, 120, 0.4)"
                    }}
                  >
                    Request Custom Scope →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap & ROI Calculator */}
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
