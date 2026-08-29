"use client";

import { useState } from "react";
import { Sparkles, TrendingUp, Building2, Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$499",
    icon: Sparkles,
    features: [
      "5-Page Custom Website",
      "Basic SEO Setup",
      "Mobile Responsive",
      "Contact Form Integration",
      "1 Month Support",
    ],
    recommend: false,
  },
  {
    name: "Growth",
    price: "$999",
    icon: TrendingUp,
    features: [
      "10-Page Custom Website",
      "Advanced SEO & Schema",
      "Speed Optimization (90+)",
      "Blog Setup",
      "Social Media Integration",
      "3 Months Support",
    ],
    recommend: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    icon: Building2,
    features: [
      "Full E-Commerce / Web App",
      "Custom Backend",
      "API Integrations",
      "Advanced Security",
      "Priority 24/7 Support",
    ],
    recommend: false,
  },
];

export default function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "onetime">("onetime");

  return (
    <section className="section-padding" style={{ background: "var(--bg-section)" }}>
      <div className="container">
        {/* Section title: left-aligned with accent underline */}
        <div className="mb-12 text-left md:mb-16">
          <h2
            className="mb-3 inline-block text-[clamp(2rem,5vw,3rem)] font-bold"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            Transparent{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--accent-blue), var(--accent-violet))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Pricing
            </span>
          </h2>
          <div
            className="h-1 w-24 rounded-full"
            style={{ background: "linear-gradient(90deg, var(--accent-blue), var(--accent-violet))" }}
          />
          <p className="mt-4 max-w-xl text-base" style={{ color: "var(--text-muted)" }}>
            Clear, high-performance packages with no hidden costs.
          </p>
        </div>

        {/* Pricing toggle (visual only) */}
        <div className="mb-10 flex justify-center">
          <div
            className="inline-flex rounded-full p-1"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
          >
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className="rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200"
              style={{
                background: billing === "monthly" ? "linear-gradient(135deg, var(--accent-blue), var(--accent-violet))" : "transparent",
                color: billing === "monthly" ? "#fff" : "var(--text-muted)",
              }}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("onetime")}
              className="rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200"
              style={{
                background: billing === "onetime" ? "linear-gradient(135deg, var(--accent-blue), var(--accent-violet))" : "transparent",
                color: billing === "onetime" ? "#fff" : "var(--text-muted)",
              }}
            >
              One-time
            </button>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3 md:items-stretch lg:gap-6">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={index}
                className={`pricing-card-home relative flex flex-col rounded-[20px] p-6 transition-all duration-300 md:p-8 ${
                  plan.recommend ? "order-first md:order-none lg:scale-[1.04] lg:z-10" : ""
                }`}
                style={{
                  background: "var(--bg-card)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: plan.recommend
                    ? "1px solid rgba(79, 142, 247, 0.5)"
                    : "1px solid rgba(255,255,255,0.09)",
                  boxShadow: plan.recommend ? "0 0 40px rgba(79, 142, 247, 0.15)" : "none",
                }}
              >
                {plan.recommend && (
                  <div
                    className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white"
                    style={{
                      background: "linear-gradient(135deg, var(--accent-blue), var(--accent-violet))",
                    }}
                  >
                    Most Popular
                  </div>
                )}
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    background: "rgba(79, 142, 247, 0.15)",
                    color: "var(--accent-blue)",
                  }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {plan.name}
                </h3>
                <div
                  className="mb-6 text-4xl font-black md:text-[2.5rem]"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                  }}
                >
                  {plan.price}
                </div>
                <ul className="mb-8 flex flex-1 flex-col gap-3 text-left">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-[0.95rem]" style={{ color: "var(--text-muted)" }}>
                      <span style={{ color: "var(--accent-blue)", flexShrink: 0 }}>
                        <Check className="h-5 w-5" strokeWidth={2.5} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href="/contact"
                  className="mt-auto w-full rounded-xl py-3.5 text-center font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  style={
                    plan.recommend
                      ? {
                          background: "linear-gradient(135deg, var(--accent-blue), var(--accent-violet))",
                          color: "#fff",
                          boxShadow: "0 4px 20px rgba(79, 142, 247, 0.35)",
                        }
                      : {
                          background: "transparent",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-subtle)",
                        }
                  }
                  aria-label={`Get started with ${plan.name}`}
                >
                  Get Started
                </a>
              </div>
            );
          })}
        </div>
      </div>
      <style jsx>{`
        .pricing-card-home:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35), 0 0 60px rgba(79, 142, 247, 0.12);
        }
        @media (min-width: 1024px) {
          .grid > div:nth-child(2).pricing-card-home:hover {
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35), 0 0 80px rgba(79, 142, 247, 0.25);
          }
        }
        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
