import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Star,
  Users
} from "lucide-react";

const proofPoints = [
  "US & UK Registered Entity",
  "Sub-Second Next.js Stacks",
  "Data-Backed Organic SEO",
  "65,000+ Verified Backlinks",
];

export default function HomeHero() {
  return (
    <section
      className="homeHero relative overflow-hidden px-0 pt-28 pb-20 sm:pt-32 sm:pb-24 md:pt-40 md:pb-32"
      aria-labelledby="home-hero-title"
      style={{
        background: "linear-gradient(180deg, #f8faf7 0%, #eef4f2 100%)",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(20,108,120,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(20,108,120,0.06) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          maskImage: "linear-gradient(to bottom, black, transparent 78%)",
        }}
      />

      <div className="container relative z-10">
        <div className="max-w-4xl">
          {/* Live System Indicator Badge */}
          <div className="mb-6 flex flex-wrap items-center gap-2.5">
            <div
              className="inline-flex max-w-full items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider"
              style={{
                borderColor: "rgba(20,108,120,0.22)",
                background: "rgba(255,255,255,0.92)",
                color: "var(--accent-blue)",
                boxShadow: "0 2px 10px rgba(20,108,120,0.06)",
              }}
            >
              <ShieldCheck
                aria-hidden="true"
                className="h-4 w-4 flex-none text-emerald-600"
              />
              <span>OfficialUM1 LLC • US &amp; UK Corporate Engineering Agency</span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>24–48h Incorporation Active</span>
            </div>
          </div>

          <h1
            id="home-hero-title"
            className="mb-6 max-w-4xl text-[clamp(2.35rem,7vw,4.625rem)] font-black leading-[1.05] tracking-tight"
            style={{
              fontFamily:
                "var(--font-space-grotesk), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              color: "var(--text-primary)",
            }}
          >
            Architecting high-speed{" "}
            <span style={{ color: "var(--accent-blue)" }}>
              web systems &amp; exponential revenue.
            </span>
          </h1>

          <p
            className="mb-8 max-w-3xl text-base leading-7 md:text-lg md:leading-8"
            style={{ color: "var(--text-muted)" }}
          >
            <strong>OfficialUM1 LLC</strong> is a US-registered digital marketing, corporate formation, and software engineering agency. We build hyper-speed Next.js web platforms, dominant SEO ranking systems, authoritative PR outreach, and official US LLC / UK LTD formation infrastructure for global founders.
          </p>

          <ul className="mb-9 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {proofPoints.map((point) => (
              <li
                key={point}
                className="flex min-h-12 items-center gap-2 rounded-lg border bg-white px-3 py-3 text-sm font-semibold shadow-sm transition-transform duration-150 hover:-translate-y-0.5"
                style={{
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="h-4 w-4 flex-none"
                  style={{ color: "var(--accent-blue)" }}
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="flex w-full flex-col gap-3 sm:max-w-xl sm:flex-row">
            <Link
              href="#audit"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg px-6 py-4 text-center text-base font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
              style={{
                background: "var(--gradient)",
                boxShadow: "var(--glow-blue)",
              }}
            >
              <Sparkles aria-hidden="true" className="h-5 w-5 flex-none" />
              <span>Get Free SEO &amp; Speed Audit</span>
              <ArrowRight aria-hidden="true" className="h-5 w-5 flex-none" />
            </Link>

            <Link
              href="/services"
              className="inline-flex min-h-14 items-center justify-center rounded-lg border bg-white px-6 py-4 text-center text-base font-bold transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
              style={{
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            >
              Explore Client Services
            </Link>
          </div>

          {/* Social Proof & Client Rating Strip */}
          <div className="mt-8 flex flex-wrap items-center gap-4 pt-6 border-t border-gray-200/60">
            <div className="flex -space-x-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-700 text-white text-xs font-bold ring-2 ring-white">US</span>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#146c78] text-white text-xs font-bold ring-2 ring-white">UK</span>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white text-xs font-bold ring-2 ring-white">AE</span>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-stone-700 text-white text-xs font-bold ring-2 ring-white">PK</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-900">4.9/5</span>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              Trusted by <span className="font-bold text-gray-900">450+ founders</span> across US, UK, UAE &amp; Pakistan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
