import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ROICalculator from "@/components/ROICalculator";
import SuccessRoadmap from "@/components/SuccessRoadmap";
import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Globe, Search, Share2, Sparkles, TrendingUp } from "lucide-react";

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
    icon: Globe,
    title: "Web Development",
    desc: "Modern, conversion-first websites and internal tools built for speed and scale.",
    href: "/contact",
    cta: "Build with Us",
  },
  {
    icon: Search,
    title: "SEO Optimization",
    desc: "Technical and content SEO that compounds traffic and ranks for profitable intent.",
    href: "/contact",
    cta: "Plan SEO",
  },
  {
    icon: TrendingUp,
    title: "Growth Systems",
    desc: "Funnels, landing pages, and analytics loops that turn visits into orders.",
    href: "/contact",
    cta: "Map Growth",
  },
  {
    icon: Share2,
    title: "Social Media Growth",
    desc: "High-quality account growth strategies and acquisition-ready audiences.",
    href: "/contact",
    cta: "Grow Social",
  },
  {
    icon: Sparkles,
    title: "Content Production",
    desc: "Blogs, knowledge base pages, and product pages that read well and rank higher.",
    href: "/contact",
    cta: "Create Content",
  },
  {
    icon: Globe,
    title: "Guest Posting",
    desc: "High-DA placements with clean outreach and real editorial relevance.",
    href: "/services/guest-posting",
    cta: "View Guest Posts",
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
