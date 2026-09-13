"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Gauge, Loader2, Sparkles, Zap } from "lucide-react";

const speedPackages = [
  {
    name: "Standard Speed Boost",
    budget: "149",
    turnaround: "24-48 Hours",
    summary: "For standard WordPress blogs, portfolios & small business sites.",
  },
  {
    name: "WooCommerce & E-Commerce Pro",
    budget: "299",
    turnaround: "2-3 Days",
    summary: "For high-traffic WooCommerce stores, checkout & cart speed acceleration.",
  },
  {
    name: "Enterprise & Multi-Site Fleet",
    budget: "599",
    turnaround: "3-5 Days",
    summary: "Complete full-stack CDN edge caching, server tuning & custom query indexing.",
  },
];

type FormState = {
  name: string;
  email: string;
  domain: string;
  siteType: string;
  currentSpeedIssue: string;
  packageName: string;
  budget: string;
  message: string;
};

const initialPackage = speedPackages[0];

const initialForm: FormState = {
  name: "",
  email: "",
  domain: "",
  siteType: "WooCommerce Store",
  currentSpeedIssue: "Mobile load time > 4s",
  packageName: initialPackage.name,
  budget: initialPackage.budget,
  message: "",
};

export default function SpeedAuditQuoteForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePackageChange = (pkgName: string) => {
    const pkg = speedPackages.find((item) => item.name === pkgName) || initialPackage;
    setForm((prev) => ({
      ...prev,
      packageName: pkg.name,
      budget: pkg.budget,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      action: "add",
      clientName: form.name.trim() || form.domain.trim(),
      buyerEmail: form.email.trim(),
      platform: "WP Speed Optimization",
      budget: Number(form.budget) || 149,
      notes: [
        "=== WordPress Speed Optimization Request ===",
        `Website Domain: ${form.domain.trim()}`,
        `Site Type: ${form.siteType}`,
        `Speed Bottleneck / Issue: ${form.currentSpeedIssue}`,
        `Selected Package: ${form.packageName} ($${form.budget})`,
        `Client Notes: ${form.message.trim() || "No extra notes provided."}`,
      ].join("\n"),
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Unable to submit speed audit request. Please try again or email hello@officialum1.com");
      }

      setSuccess(true);
      setForm(initialForm);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-3xl border p-6 sm:p-10 shadow-xl relative"
      style={{
        background: "#ffffff",
        borderColor: "var(--border-subtle)",
        boxShadow: "0 18px 44px rgba(24,32,38,0.08)",
      }}
    >
      <div className="mb-8 text-center sm:text-left">
        <div
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3"
          style={{ background: "rgba(20,108,120,0.10)", color: "var(--accent-blue)" }}
        >
          <Zap className="h-3.5 w-3.5" /> Zero Downtime & 90+ Score Guarantee
        </div>
        <h3 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
          Request Your Free 2-Minute Speed Diagnostic
        </h3>
        <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--text-muted)" }}>
          Share your WordPress domain and our performance engineers will analyze the top 3 bottlenecks slowing down your mobile PageSpeed score.
        </p>
      </div>

      {success ? (
        <div
          className="rounded-2xl border p-8 text-center"
          style={{
            background: "rgba(20,132,95,0.06)",
            borderColor: "rgba(20,132,95,0.25)",
          }}
        >
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full mb-4"
            style={{ background: "rgba(20,132,95,0.15)", color: "#14845f" }}
          >
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h4 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Speed Audit Request Received!
          </h4>
          <p className="mt-2 text-sm max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
            Our engineering team is analyzing your domain diagnostics. You will receive a personalized PageSpeed breakdown and optimization roadmap via email within 2-4 hours.
          </p>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="mt-6 inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-bold text-white transition"
            style={{ background: "var(--gradient)" }}
          >
            Submit Another Website
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Package Selection Cards */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-3">
              1. Select Speed Package Tier
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {speedPackages.map((pkg) => {
                const active = form.packageName === pkg.name;
                return (
                  <button
                    key={pkg.name}
                    type="button"
                    onClick={() => handlePackageChange(pkg.name)}
                    className="text-left p-4 rounded-2xl border transition-all duration-200"
                    style={{
                      background: active ? "rgba(20,108,120,0.06)" : "#ffffff",
                      borderColor: active ? "var(--primary)" : "var(--border-subtle)",
                      boxShadow: active ? "0 4px 16px rgba(20,108,120,0.12)" : "none",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-500">{pkg.turnaround}</span>
                      <span className="text-base font-black" style={{ color: "var(--primary)" }}>
                        ${pkg.budget}
                      </span>
                    </div>
                    <div className="font-extrabold text-sm mb-1" style={{ color: "var(--text-primary)" }}>
                      {pkg.name}
                    </div>
                    <div className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {pkg.summary}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">
                Your Name / Business Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. John Doe or Acme Digital"
                className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                style={{
                  background: "var(--bg-base)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">
                Your Email Address *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="john@yourdomain.com"
                className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                style={{
                  background: "var(--bg-base)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          {/* Website Domain & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">
                Website URL / Domain *
              </label>
              <input
                type="text"
                required
                value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                style={{
                  background: "var(--bg-base)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">
                Platform / Setup
              </label>
              <select
                value={form.siteType}
                onChange={(e) => setForm({ ...form, siteType: e.target.value })}
                className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                style={{
                  background: "var(--bg-base)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="WooCommerce Store">WooCommerce Store (E-Commerce)</option>
                <option value="Elementor / Divi WP Site">Elementor / Divi / Visual Composer</option>
                <option value="Custom WordPress Theme">Custom WordPress Theme</option>
                <option value="High-Traffic Blog / Publisher">High-Traffic Blog / Publisher</option>
                <option value="Agency / Client Fleet">Agency / Multiple Client Sites</option>
              </select>
            </div>
          </div>

          {/* Speed Bottleneck & Message */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">
              Primary Bottleneck / Observation
            </label>
            <select
              value={form.currentSpeedIssue}
              onChange={(e) => setForm({ ...form, currentSpeedIssue: e.target.value })}
              className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 mb-3"
              style={{
                background: "var(--bg-base)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            >
              <option value="Mobile load time > 4s">Mobile load time > 4 seconds (High bounce rate)</option>
              <option value="Failing Google Core Web Vitals (LCP/CLS)">Failing Google Core Web Vitals (LCP/CLS)</option>
              <option value="Slow WooCommerce Checkout & Cart">Slow WooCommerce Checkout & Cart</option>
              <option value="High TTFB / Slow Server Response">High TTFB / Slow Server Response</option>
              <option value="Heavy JS / CSS Render-Blocking Assets">Heavy JS / CSS Render-Blocking Assets</option>
            </select>

            <textarea
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Any specific plugin issues, hosting details (Hostinger, Cloudways, Siteground), or goals you'd like us to know..."
              className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
              style={{
                background: "var(--bg-base)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-extrabold text-white shadow-xl transition-all duration-300 transform active:scale-[0.99] disabled:opacity-60"
            style={{
              background: "var(--gradient)",
              boxShadow: "var(--glow-blue)",
            }}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Auditing & Generating Speed Roadmap...
              </>
            ) : (
              <>
                <Gauge className="h-5 w-5" />
                Claim Free Speed Diagnostic & Lock Guaranteed 90+ Score
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-6 text-xs text-gray-500 text-center">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> 100% Zero Downtime
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Pay Only After 90+ Result
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> 24/7 SLA Support
            </span>
          </div>
        </form>
      )}
    </div>
  );
}
