"use client";

import { FormEvent, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

const packageOptions = [
  {
    name: "Starter Placement",
    budget: "99",
    placements: "1",
    summary: "One niche-relevant placement for a focused target page.",
  },
  {
    name: "Growth Pack",
    budget: "249",
    placements: "3",
    summary: "Three placements with article planning and anchor mapping.",
  },
  {
    name: "Authority Pack",
    budget: "499",
    placements: "5",
    summary: "Higher authority publishers for competitive SEO campaigns.",
  },
  {
    name: "Monthly Agency Plan",
    budget: "999",
    placements: "10",
    summary: "Recurring outreach, reporting, and monthly link planning.",
  },
];

type FormState = {
  name: string;
  email: string;
  domain: string;
  niche: string;
  targetUrl: string;
  anchorText: string;
  packageName: string;
  placements: string;
  budget: string;
  timeline: string;
  message: string;
};

const initialPackage = packageOptions[1];

const initialForm: FormState = {
  name: "",
  email: "",
  domain: "",
  niche: "",
  targetUrl: "",
  anchorText: "",
  packageName: initialPackage.name,
  placements: initialPackage.placements,
  budget: initialPackage.budget,
  timeline: "This month",
  message: "",
};

export default function GuestPostQuoteForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const selectedPackage = useMemo(
    () => packageOptions.find((pkg) => pkg.name === form.packageName) || initialPackage,
    [form.packageName]
  );

  const updateField = (field: keyof FormState, value: string) => {
    if (field === "packageName") {
      const pkg = packageOptions.find((item) => item.name === value);
      setForm((current) => ({
        ...current,
        packageName: value,
        placements: pkg?.placements || current.placements,
        budget: pkg?.budget || current.budget,
      }));
      return;
    }

    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "guest_post_quote",
          ...form,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to submit quote request.");
      }

      setSuccess(true);
      setForm(initialForm);
    } catch (submitError: any) {
      setError(submitError.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full rounded-2xl border p-5 sm:p-7"
      style={{
        background: "#ffffff",
        borderColor: "var(--border-subtle)",
        boxShadow: "0 18px 44px rgba(24, 32, 38, 0.10)",
      }}
    >
      <div className="mb-6">
        <div
          className="mb-3 inline-flex rounded-full px-4 py-2 text-xs font-bold uppercase"
          style={{
            color: "var(--accent-blue)",
            border: "1px solid var(--border-subtle)",
            background: "#f7faf6",
            letterSpacing: "0.12em",
          }}
        >
          Get a quote
        </div>
        <h2 className="mb-3 text-2xl font-black sm:text-3xl" style={{ color: "var(--text-primary)" }}>
          Tell us your guest posting goal
        </h2>
        <p className="text-sm leading-7" style={{ color: "var(--text-muted)" }}>
          Your request will go straight into the admin Leads pipeline as a Guest Posting quote.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Name or company
            <input
              className="input-field"
              required
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Your brand name"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Email
            <input
              className="input-field"
              required
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="you@example.com"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Website / domain
            <input
              className="input-field"
              required
              value={form.domain}
              onChange={(event) => updateField("domain", event.target.value)}
              placeholder="example.com"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Niche
            <input
              className="input-field"
              required
              value={form.niche}
              onChange={(event) => updateField("niche", event.target.value)}
              placeholder="SaaS, business, crypto, local SEO"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Target URL
            <input
              className="input-field"
              value={form.targetUrl}
              onChange={(event) => updateField("targetUrl", event.target.value)}
              placeholder="Page you want to promote"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Anchor text
            <input
              className="input-field"
              value={form.anchorText}
              onChange={(event) => updateField("anchorText", event.target.value)}
              placeholder="Preferred anchor or keyword"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
          <label className="grid gap-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Package
            <select
              className="input-field"
              value={form.packageName}
              onChange={(event) => updateField("packageName", event.target.value)}
            >
              {packageOptions.map((pkg) => (
                <option key={pkg.name} value={pkg.name}>
                  {pkg.name} - from ${pkg.budget}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Timeline
            <select
              className="input-field"
              value={form.timeline}
              onChange={(event) => updateField("timeline", event.target.value)}
            >
              <option>This week</option>
              <option>This month</option>
              <option>Monthly campaign</option>
              <option>Need advice</option>
            </select>
          </label>
        </div>

        <div
          className="grid gap-3 rounded-xl border p-4 text-sm sm:grid-cols-3"
          style={{ borderColor: "var(--border-subtle)", background: "#f7faf6", color: "var(--text-primary)" }}
        >
          <div>
            <span className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
              Suggested budget
            </span>
            <input
              className="mt-2 w-full rounded-lg border bg-white px-3 py-2 text-base font-black"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
              type="number"
              min="0"
              value={form.budget}
              onChange={(event) => updateField("budget", event.target.value)}
            />
          </div>
          <div>
            <span className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
              Placements
            </span>
            <input
              className="mt-2 w-full rounded-lg border bg-white px-3 py-2 text-base font-black"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
              type="number"
              min="1"
              value={form.placements}
              onChange={(event) => updateField("placements", event.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm leading-6" style={{ color: "var(--text-muted)" }}>
            <CheckCircle2 className="h-5 w-5 flex-none" style={{ color: "var(--accent-blue)" }} />
            {selectedPackage.summary}
          </div>
        </div>

        <label className="grid gap-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          Extra requirements
          <textarea
            className="input-field min-h-[120px]"
            value={form.message}
            onChange={(event) => updateField("message", event.target.value)}
            placeholder="Tell us DA/DR target, country, traffic preference, competitor pages, or any publisher rules."
          />
        </label>

        {error ? (
          <div className="rounded-lg border px-4 py-3 text-sm font-semibold" style={{ borderColor: "#f2c2b8", color: "#a83a26", background: "#fff4f1" }}>
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-lg border px-4 py-3 text-sm font-semibold" style={{ borderColor: "#b7dfd4", color: "var(--success)", background: "#f1fbf7" }}>
            Quote request received. Admin Leads mein Guest Posting lead add ho gayi hai.
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-black text-white transition disabled:opacity-70"
          style={{ background: "var(--gradient)", boxShadow: "var(--glow-blue)" }}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          {loading ? "Sending quote..." : "Send Guest Post Quote"}
        </button>
      </form>
    </div>
  );
}
