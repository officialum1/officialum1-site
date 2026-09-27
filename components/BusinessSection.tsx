"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Globe, FileDigit, Shield, FileCheck, Lock, Zap } from "lucide-react";

const formationOptions = [
  { id: "uk-ltd", state: "🇬🇧 UK LTD Company", total: "$269", note: "London Office & CRN Included", href: "/services/uk-company-formation" },
  { id: "wyoming", state: "🇺🇸 Wyoming US LLC", total: "$275", note: "Global Zero State Tax Standard", href: "/services/form-business" },
  { id: "delaware", state: "🇺🇸 Delaware US LLC", total: "$265", note: "Startups & VC Hub", href: "/services/form-business" },
  { id: "texas", state: "🇺🇸 Texas US LLC", total: "$475", note: "Enterprise Commercial Choice", href: "/services/form-business" },
];

const features = [
  { icon: Globe, label: "Global Corporate Identity" },
  { icon: FileDigit, label: "Tax & EIN / UTR ID" },
  { icon: Shield, label: "Registered Agent & London Office" },
  { icon: FileCheck, label: "Wise & Stripe Banking Ready" },
];

export default function BusinessSection() {
  const [selected, setSelected] = useState<string>("wyoming");

  return (
    <section
      id="business-hub"
      className="relative overflow-hidden py-20 md:py-28"
      style={{
        background: "linear-gradient(180deg, var(--bg-section-alt) 0%, var(--bg-base) 100%)",
      }}
    >
      <div className="container relative z-10">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1.1fr] lg:items-start lg:gap-16">
          {/* Left: copy + CTA */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <h2
              className="mb-4 text-[clamp(2.2rem,5vw,3.2rem)] font-bold leading-tight tracking-tight"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-space-grotesk), sans-serif" }}
            >
              Scale Beyond{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, var(--accent-blue), var(--accent-violet))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Local Borders
              </span>
            </h2>
            <p
              className="mb-8 max-w-lg text-sm md:text-base leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              Launch and scale an official US LLC or UK LTD company from anywhere in the world. We streamline government incorporation, London/US registered office, tax numbers (EIN/UTR), and Wise / Stripe merchant banking setup.
            </p>

            {/* Feature rows */}
            <div className="mb-8 space-y-3">
              {features.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      background: "rgba(20,108,120,0.12)",
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: "var(--accent-blue)" }} />
                  </div>
                  <div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {label}
                    </div>
                    <p
                      className="text-[0.75rem]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Official government direct filings with guaranteed compliance.
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/services/uk-company-formation"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm md:text-base font-bold text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(20,108,120,0.4)]"
                style={{
                  background: "#146c78",
                }}
              >
                🇬🇧 Form UK LTD ($269) →
              </Link>
              <Link
                href="/services/form-business"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm md:text-base font-bold transition-all duration-300 border hover:bg-[#146c78]/5"
                style={{
                  borderColor: "rgba(20,108,120,0.3)",
                  color: "#146c78",
                }}
              >
                🇺🇸 Form US LLC ($275) →
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-medium">
              <span
                className="rounded-full px-3 py-1.5"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-muted)",
                }}
              >
                🔒 Secure Process
              </span>
              <span
                className="rounded-full px-3 py-1.5"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-muted)",
                }}
              >
                🌍 Non-residents Welcome
              </span>
              <span
                className="rounded-full px-3 py-1.5"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-muted)",
                }}
              >
                ⚡ 24-48h Fast Turnaround
              </span>
            </div>
          </motion.div>

          {/* Right: pricing explorer cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <p className="mb-4 text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Formation Pricing Explorer
            </p>
            {formationOptions.map((opt) => (
              <Link
                key={opt.id}
                href={opt.href}
                className="business-formation-card block w-full rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{
                  background: "#fff",
                  border:
                    opt.id === 'uk-ltd'
                      ? "1.5px solid rgba(20, 108, 120, 0.45)"
                      : "1px solid var(--border-subtle)",
                  boxShadow: "0 4px 16px rgba(24,32,38,0.04)",
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div
                      className="text-lg font-bold flex items-center gap-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {opt.state}
                    </div>
                    <div
                      className="text-xs uppercase tracking-wide"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {opt.note}
                    </div>
                  </div>
                  <div
                    className="rounded-xl px-4 py-2 text-lg font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(20,108,120,0.1), rgba(196,71,45,0.1))",
                      color: "var(--accent-blue)",
                    }}
                  >
                    {opt.total}
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Trust row */}
        <div
          className="mt-14 flex flex-wrap items-center justify-center gap-6 border-t pt-10 text-sm"
          style={{ color: "var(--text-muted)", borderColor: "var(--border-subtle)" }}
        >
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4" style={{ color: "var(--accent-blue)" }} />
            Secure Process
          </span>
          <span className="flex items-center gap-2">
            <Globe className="h-4 w-4" style={{ color: "var(--accent-blue)" }} />
            Non-residents Welcome
          </span>
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4" style={{ color: "var(--accent-blue)" }} />
            Fast Turnaround
          </span>
        </div>
      </div>
    </section>
  );
}
