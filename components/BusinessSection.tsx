"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Globe, FileDigit, Shield, FileCheck, Lock, Zap } from "lucide-react";

const formationOptions = [
  { id: "wyoming", state: "Wyoming", total: "$220", note: "Global Standard" },
  { id: "delaware", state: "Delaware", total: "$210", note: "Startups Hub" },
  { id: "texas", state: "Texas", total: "$420", note: "Enterprise Choice" },
];

const features = [
  { icon: Globe, label: "Global Identity" },
  { icon: FileDigit, label: "Tax & EIN" },
  { icon: Shield, label: "Legal Agent" },
  { icon: FileCheck, label: "Compliance" },
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
              Launch and scale a US company from anywhere in the world. We streamline formation, tax, and compliance so
              you can focus on building the product and serving your customers.
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
                      background: "rgba(79,142,247,0.18)",
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
                      Expert support so you never navigate US regulations alone.
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/services/form-business"
              className="inline-flex w-fit items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(79,142,247,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              style={{
                background: "linear-gradient(135deg, var(--accent-blue), var(--accent-violet))",
              }}
              aria-label="Launch Your Business"
            >
              Launch Your Business →
            </Link>

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
                ⚡ Fast Turnaround
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
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelected(opt.id)}
                className="business-formation-card w-full rounded-2xl p-5 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                style={{
                  background: "#fff",
                  border:
                    selected === opt.id
                      ? "1px solid rgba(20, 108, 120, 0.45)"
                      : "1px solid var(--border-subtle)",
                  boxShadow:
                    selected === opt.id
                      ? "0 14px 34px rgba(20, 108, 120, 0.14)"
                      : "0 0 0 rgba(0,0,0,0)",
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div
                      className="text-lg font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {opt.state} Formation
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
              </button>
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
