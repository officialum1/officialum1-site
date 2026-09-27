import Link from "next/link";
import { Globe, FileDigit, Shield, FileCheck } from "lucide-react";

const formationOptions = [
  {
    id: "uk-ltd",
    state: "🇬🇧 UK LTD Company",
    total: "$269",
    note: "London Office & CRN Included",
    href: "/services/uk-company-formation",
  },
  {
    id: "wyoming",
    state: "🇺🇸 Wyoming US LLC",
    total: "$275",
    note: "Global Zero State Tax Standard",
    href: "/services/form-business",
  },
  {
    id: "delaware",
    state: "🇺🇸 Delaware US LLC",
    total: "$265",
    note: "Startups & VC Hub",
    href: "/services/form-business",
  },
  {
    id: "texas",
    state: "🇺🇸 Texas US LLC",
    total: "$475",
    note: "Enterprise Commercial Choice",
    href: "/services/form-business",
  },
];

const features = [
  { icon: Globe, label: "Global Corporate Identity" },
  { icon: FileDigit, label: "Tax & EIN / UTR ID" },
  { icon: Shield, label: "Registered Agent & London Office" },
  { icon: FileCheck, label: "Wise & Stripe Banking Ready" },
];

export default function BusinessSection() {
  return (
    <section
      id="business-hub"
      aria-labelledby="business-hub-title"
      className="relative overflow-hidden py-16 sm:py-20 md:py-28"
      style={{
        background:
          "linear-gradient(180deg, var(--bg-section-alt) 0%, var(--bg-base) 100%)",
      }}
    >
      <div className="container relative z-10">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1.1fr] lg:items-start lg:gap-16">
          <div className="flex flex-col">
            <h2
              id="business-hub-title"
              className="mb-4 text-[clamp(2.2rem,5vw,3.2rem)] font-bold leading-tight tracking-tight"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-space-grotesk), sans-serif",
              }}
            >
              Scale Beyond{" "}
              <span style={{ color: "var(--accent-blue)" }}>
                Local Borders
              </span>
            </h2>

            <p
              className="mb-8 max-w-lg text-sm leading-relaxed md:text-base"
              style={{ color: "var(--text-muted)" }}
            >
              Launch and scale an official US LLC or UK LTD company from
              anywhere in the world. We streamline government incorporation,
              London/US registered office, tax numbers (EIN/UTR), and Wise /
              Stripe merchant banking setup.
            </p>

            <ul className="mb-8 space-y-3">
              {features.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-[#146c78]/10"
                  >
                    <Icon className="h-4 w-4 text-[#146c78]" />
                  </span>

                  <span>
                    <span
                      className="block text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {label}
                    </span>
                    <span
                      className="mt-1 block text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Official government direct filings with guaranteed
                      compliance.
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/services/uk-company-formation"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#146c78] px-6 py-3.5 text-sm font-bold text-white md:text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                🇬🇧 Form UK LTD ($269) <span aria-hidden="true">→</span>
              </Link>

              <Link
                href="/services/form-business"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#146c78]/30 px-6 py-3.5 text-sm font-bold text-[#146c78] md:text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                🇺🇸 Form US LLC ($275) <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div>
            <h3
              className="mb-4 text-sm font-bold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Formation Pricing Explorer
            </h3>

            <ul className="space-y-4">
              {formationOptions.map((option) => (
                <li key={option.id}>
                  <Link
                    href={option.href}
                    className="block w-full rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    <span className="flex flex-wrap items-center justify-between gap-3">
                      <span>
                        <span className="block text-lg font-bold text-gray-900">
                          {option.state}
                        </span>
                        <span className="mt-1 block text-xs uppercase text-gray-500">
                          {option.note}
                        </span>
                      </span>

                      <span className="rounded-xl bg-[#146c78]/10 px-4 py-2 text-lg font-bold text-[#146c78]">
                        {option.total}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
