import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const proofPoints = [
  "US Registered Entity (LLC)",
  "Sub-Second Next.js Stacks",
  "Data-Backed Organic SEO",
  "High DA Guest Posting",
];

export default function HomeHero() {
  return (
    <section
      className="homeHero relative overflow-hidden px-0 py-24 sm:py-28 md:py-36"
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
          <div
            className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider"
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
            <span>OfficialUM1 LLC • US-Registered Advertising &amp; Marketing Agency</span>
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
            <strong>OfficialUM1 LLC</strong> is a US-registered digital
            marketing and software engineering agency. We build hyper-speed
            Next.js web applications, data-backed SEO ranking systems,
            authoritative guest posting campaigns, and revenue growth
            infrastructure for global brands and ambitious enterprises.
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
        </div>
      </div>
    </section>
  );
}
