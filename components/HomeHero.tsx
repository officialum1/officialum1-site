import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

const proofPoints = [
  "US Registered Entity (LLC)",
  "Sub-Second Next.js Stacks",
  "Data-Backed Organic SEO",
  "High DA Guest Posting",
];

export default function HomeHero() {
  return (
    <section
      className="homeHero relative min-h-[720px] overflow-hidden px-0 pb-20 pt-28 md:min-h-[820px] md:pt-36"
      aria-label="Hero"
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
        <div className="max-w-3xl">
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider"
            style={{
              borderColor: "rgba(20,108,120,0.22)",
              background: "rgba(255,255,255,0.92)",
              color: "var(--accent-blue)",
              boxShadow: "0 2px 10px rgba(20,108,120,0.06)",
            }}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>OfficialUM1 LLC • US-Registered Advertising & Marketing Agency</span>
          </div>

          <h1
            className="homeHeroTitle mb-6 max-w-[330px] text-[32px] font-black leading-[1.08] sm:max-w-[760px] sm:text-[46px] md:text-[64px] lg:text-[74px]"
            style={{
              fontFamily:
                "var(--font-space-grotesk), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              color: "var(--text-primary)",
              overflowWrap: "anywhere",
            }}
          >
            <span className="block">Architecting high-speed </span>
            <span className="block">web systems & </span>
            <span className="block sm:inline">exponential </span>
            {" "}
            <span className="block sm:inline" style={{ color: "var(--accent-blue)" }}>revenue.</span>
          </h1>

          <p
            className="mb-8 max-w-[330px] text-[16px] leading-7 sm:max-w-2xl md:text-[18px] md:leading-8"
            style={{ color: "var(--text-muted)" }}
          >
            <strong>OfficialUM1 LLC</strong> is a US-registered digital marketing and software engineering agency. We build hyper-speed Next.js web applications, data-backed SEO ranking systems, authoritative guest posting campaigns, and revenue growth infrastructure for global brands and ambitious enterprises.
          </p>

          <div className="mb-9 grid max-w-[330px] grid-cols-1 gap-3 sm:max-w-2xl sm:grid-cols-2 lg:grid-cols-4">
            {proofPoints.map((point) => (
              <div
                key={point}
                className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-semibold shadow-sm transition-transform duration-150 hover:-translate-y-0.5"
                style={{
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              >
                <CheckCircle2 className="h-4 w-4 flex-none" style={{ color: "var(--accent-blue)" }} />
                <span>{point}</span>
              </div>
            ))}
          </div>

          <div className="flex w-full max-w-[330px] flex-col gap-3 sm:max-w-xl sm:flex-row">
            <Link
              href="#audit"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-4 text-base font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: "var(--gradient)", boxShadow: "var(--glow-blue)" }}
              aria-label="Get Free SEO & Speed Audit"
            >
              <Sparkles className="h-5 w-5" />
              Get Free SEO & Speed Audit
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-6 py-4 text-base font-bold transition-transform duration-200 hover:-translate-y-0.5"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
              aria-label="Explore Services"
            >
              Explore Client Services
            </Link>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-gray-500">
            <span>Looking for digital assets & verified tools?</span>
            <Link href="/shop" className="font-bold underline transition-colors hover:text-emerald-700">
              Browse Digital Store →
            </Link>
          </div>
        </div>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-20"
        style={{ background: "linear-gradient(to bottom, transparent, var(--bg-section))" }}
      />
    </section>
  );
}

