"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Gauge, Loader2, Send, Sparkles, Zap } from "lucide-react";

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

  const selectedPackage = speedPackages.find((pkg) => pkg.name === form.packageName) || initialPackage;

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
    <div className="relative rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-900/90 to-gray-950 p-6 sm:p-10 shadow-2xl backdrop-blur-xl text-white">
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1 text-xs font-semibold text-red-400 mb-3">
          <Zap className="h-3.5 w-3.5" /> Zero Downtime & 90+ Score Guarantee
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Request Your Free 2-Minute Speed Audit
        </h3>
        <p className="mt-2 text-sm sm:text-base text-gray-400">
          Share your WordPress domain and we will diagnose the top 3 bottlenecks slowing down your mobile PageSpeed score.
        </p>
      </div>

      {success ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h4 className="text-xl font-bold text-white">Speed Audit Request Received!</h4>
          <p className="mt-2 text-sm text-gray-300 max-w-md mx-auto">
            Our engineering team is analyzing your domain diagnostics. You will receive a personalized PageSpeed breakdown and optimization roadmap via email within 2-4 hours.
          </p>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-gray-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition"
          >
            Submit Another Website
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/50 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Package Selection Cards */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
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
                    className={`text-left p-4 rounded-2xl border transition-all duration-200 ${
                      active
                        ? "border-red-500 bg-red-950/20 ring-1 ring-red-500 shadow-lg shadow-red-500/10"
                        : "border-gray-800 bg-gray-900/60 hover:border-gray-700 hover:bg-gray-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-300">{pkg.turnaround}</span>
                      <span className="text-base font-extrabold text-red-400">${pkg.budget}</span>
                    </div>
                    <div className="font-bold text-white text-sm mb-1">{pkg.name}</div>
                    <div className="text-xs text-gray-400 leading-relaxed">{pkg.summary}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Your Name / Business Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. John Doe or Acme Digital"
                className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Your Email Address *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="john@yourdomain.com"
                className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Website Domain & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Website URL / Domain *
              </label>
              <input
                type="text"
                required
                value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Platform / Setup
              </label>
              <select
                value={form.siteType}
                onChange={(e) => setForm({ ...form, siteType: e.target.value })}
                className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Primary Bottleneck / Observation
            </label>
            <select
              value={form.currentSpeedIssue}
              onChange={(e) => setForm({ ...form, currentSpeedIssue: e.target.value })}
              className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 mb-3"
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
              className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-red-600/25 hover:from-red-500 hover:to-red-500 transition-all duration-300 transform active:scale-[0.99] disabled:opacity-60"
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
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 100% Zero Downtime
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Pay Only After 90+ Result
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 24/7 SLA Support
            </span>
          </div>
        </form>
      )}
    </div>
  );
}
