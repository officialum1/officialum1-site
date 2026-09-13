"use client";

import { FormEvent, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Send, Sparkles, Shield, TrendingUp, Zap, HelpCircle } from "lucide-react";

export const packageOptions = [
  {
    id: "starter",
    name: "Starter Authority Pack",
    price: "$499",
    budget: "499",
    placements: "5x DA 40+ Posts",
    badge: "For Local & Growing Sites",
    summary: "5 contextual DoFollow guest posts on DA 40+ real websites with 1k+ organic traffic.",
    features: [
      "5x High-DA 40+ Niche Placements",
      "Real Organic Traffic (1,000+ visits/mo)",
      "100% DoFollow & Contextual In-Content",
      "5x 800+ Word Editorial Articles Included",
      "365-Day Free Replacement Guarantee",
      "White-Label Live Placement Report"
    ]
  },
  {
    id: "da60-power",
    name: "DA 60+ Ranking Powerhouse",
    price: "$1,499",
    budget: "1499",
    placements: "10x DA 60+ Posts",
    badge: "⭐ MOST POPULAR / BEST SELLER",
    featured: true,
    summary: "10 elite DA 60+ / DR 65+ guest posts with 5,000+ real Google traffic. Built to outrank high-difficulty competition.",
    features: [
      "10x High-Authority DA 60+ / DR 65+ Domains",
      "Verified Google Traffic (5,000+ to 50,000+ visits)",
      "Zero PBNs / 100% Real Editorial Publishers",
      "10x 1,000+ Word Premium SEO Articles Included",
      "Exact-Match & Partial-Match Anchor Strategy",
      "Guaranteed Fast 5-10 Business Day Turnaround",
      "365-Day Replacement & Indexing Guarantee"
    ]
  },
  {
    id: "niche-edits",
    name: "Aged Niche Edits (Fast-Track)",
    price: "$599",
    budget: "599",
    placements: "5x Aged In-Content Links",
    badge: "Fastest Ranking Impact",
    summary: "5 curated contextual link insertions into aged, ranking articles with established Google trust.",
    features: [
      "5x Aged Articles Already Ranking in Google",
      "DA 45+ to DA 65+ Established Pages",
      "Instant Link Equity & Faster Indexing",
      "Natural Contextual Sentence Insertion",
      "Turnaround in 48 to 72 Hours",
      "Permanent Placement Guarantee"
    ]
  },
  {
    id: "enterprise-combo",
    name: "Enterprise All-In-One Surge",
    price: "$2,499",
    budget: "2499",
    placements: "15 Posts + 5 Niche Edits + PR",
    badge: "Aggressive Agency Dominator",
    summary: "Full-scale authority campaign: 15 DA60+ posts, 5 niche edits, and 1 AP-Style syndicated wire press release.",
    features: [
      "15x DA 60+ Tier-1 Editorial Placements",
      "5x Aged Niche Edit Link Insertions",
      "1x Syndicated Press Release to 300+ Media Sites",
      "Comprehensive Anchor Text & URL Mapping",
      "Dedicated Senior Link Building Strategist",
      "Permanent Placement & Indexing Warranty"
    ]
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
  orderMode: "preset" | "custom";
  customDa: string;
  customTraffic: string;
  customQty: number;
  message: string;
};

const initialPackage = packageOptions[1]; // DA 60+ Powerhouse

const initialForm: FormState = {
  name: "",
  email: "",
  domain: "",
  niche: "Tech & SaaS",
  targetUrl: "",
  anchorText: "",
  packageName: initialPackage.name,
  placements: initialPackage.placements,
  budget: initialPackage.budget,
  timeline: "Immediate (1-2 Weeks)",
  orderMode: "preset",
  customDa: "DA 50 - DA 60 ($299/link)",
  customTraffic: "5,000+ visits/mo",
  customQty: 3,
  message: "",
};

export default function GuestPostQuoteForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Calculate dynamic custom price
  const customCalculatedPrice = useMemo(() => {
    let perLinkPrice = 299;
    if (form.customDa.includes("DA 30 - DA 40")) perLinkPrice = 149;
    else if (form.customDa.includes("DA 50 - DA 60")) perLinkPrice = 299;
    else if (form.customDa.includes("DA 60 - DA 75")) perLinkPrice = 499;
    else if (form.customDa.includes("DA 75+")) perLinkPrice = 799;

    return perLinkPrice * form.customQty;
  }, [form.customDa, form.customQty]);

  const selectedPackage = useMemo(
    () => packageOptions.find((pkg) => pkg.name === form.packageName) || initialPackage,
    [form.packageName]
  );

  const updateField = (field: keyof FormState, value: any) => {
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

    const finalBudget = form.orderMode === "preset" ? form.budget : customCalculatedPrice.toString();
    const finalPlacements = form.orderMode === "preset" ? form.placements : `${form.customQty}x Custom Links (${form.customDa}, ${form.customTraffic})`;

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "guest_post_order",
          clientName: form.name,
          email: form.email,
          domain: form.domain,
          niche: form.niche,
          targetUrl: form.targetUrl,
          anchorText: form.anchorText,
          packageName: form.orderMode === "preset" ? form.packageName : "Custom Link Configuration",
          placements: finalPlacements,
          budget: `$${finalBudget}`,
          timeline: form.timeline,
          message: form.message,
          source: "Guest Posting Authority Engine Order Form",
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit order request. Please try again.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please reach out to hello@officialum1.com directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="order-form" className="w-full">
      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => updateField("orderMode", "preset")}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
            form.orderMode === "preset"
              ? "bg-[var(--accent-blue)] text-white shadow-lg shadow-blue-500/20"
              : "bg-white text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-gray-400"
          }`}
        >
          🏆 Guaranteed Power Packages
        </button>
        <button
          type="button"
          onClick={() => updateField("orderMode", "custom")}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
            form.orderMode === "custom"
              ? "bg-[var(--accent-blue)] text-white shadow-lg shadow-blue-500/20"
              : "bg-white text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-gray-400"
          }`}
        >
          ⚙️ Interactive Custom Link Calculator
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Package Cards or Calculator Summary */}
        <div className="lg:col-span-5 space-y-4">
          {form.orderMode === "preset" ? (
            <div className="space-y-4">
              {packageOptions.map((pkg) => {
                const isSelected = form.packageName === pkg.name;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => updateField("packageName", pkg.name)}
                    className={`relative p-5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-white border-[var(--accent-blue)] ring-2 ring-[var(--accent-blue)]/20 shadow-xl"
                        : "bg-white/80 border-[var(--border-subtle)] hover:border-gray-300"
                    }`}
                  >
                    {pkg.badge && (
                      <div className="absolute top-4 right-4">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          pkg.featured
                            ? "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                            : "bg-blue-500/10 text-[var(--accent-blue)] border border-blue-500/20"
                        }`}>
                          {pkg.badge}
                        </span>
                      </div>
                    )}

                    <div className="pr-20">
                      <h3 className="text-base font-extrabold text-[var(--text-primary)]">{pkg.name}</h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-[var(--text-primary)]">{pkg.price}</span>
                        <span className="text-xs font-semibold text-[var(--text-muted)]">/ {pkg.placements}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">{pkg.summary}</p>

                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                        {pkg.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs font-medium text-[var(--text-primary)]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Custom Calculator Controls */
            <div className="p-6 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-xl space-y-5">
              <div className="border-b pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-blue)]">Live Link Builder</span>
                <h3 className="text-lg font-black text-[var(--text-primary)] mt-1">Custom Authority Configuration</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Configure your exact domain metrics and quantity to calculate instant pricing.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-2">Target Domain Authority (DA / DR)</label>
                <select
                  value={form.customDa}
                  onChange={(e) => updateField("customDa", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-[var(--accent-blue)]"
                >
                  <option value="DA 30 - DA 40 ($149/link)">DA 30 - DA 40 / DR 35+ ($149 / link)</option>
                  <option value="DA 50 - DA 60 ($299/link)">DA 50 - DA 60 / DR 55+ ($299 / link) - High Authority</option>
                  <option value="DA 60 - DA 75 ($499/link)">DA 60 - DA 75 / DR 65+ ($499 / link) - Tier 1 Media</option>
                  <option value="DA 75+ ($799/link)">DA 75+ / DR 80+ ($799 / link) - Elite Publishing Sites</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-2">Minimum Organic Google Traffic Filter</label>
                <select
                  value={form.customTraffic}
                  onChange={(e) => updateField("customTraffic", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-[var(--accent-blue)]"
                >
                  <option value="1,000+ visits/mo">1,000+ Monthly Organic Google Visits</option>
                  <option value="5,000+ visits/mo">5,000+ Monthly Organic Google Visits (Recommended)</option>
                  <option value="10,000+ visits/mo">10,000+ Monthly Organic Google Visits</option>
                  <option value="50,000+ visits/mo">50,000+ High-Traffic Portal Placements</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-[var(--text-primary)]">Number of Backlinks Required</label>
                  <span className="text-xs font-bold text-[var(--accent-blue)]">{form.customQty} Placements</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={form.customQty}
                  onChange={(e) => updateField("customQty", parseInt(e.target.value))}
                  className="w-full accent-[var(--accent-blue)] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[var(--text-muted)] mt-1">
                  <span>1 Link</span>
                  <span>5 Links</span>
                  <span>10 Links</span>
                  <span>25 Links</span>
                </div>
              </div>

              {/* Dynamic Price Output Box */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[var(--accent-blue)]">Calculated Total</span>
                  <div className="text-2xl font-black text-[var(--text-primary)]">${customCalculatedPrice.toLocaleString()}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{form.customQty}x Contextual Placements</div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-1 rounded-md">
                    <Shield className="w-3 h-3" /> 100% Guaranteed
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Guarantee Badges */}
          <div className="p-4 rounded-2xl bg-white border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% DoFollow &amp; Permanent Indexing Guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>365-Day Free Link Replacement Warranty</span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Intake Form */}
        <div className="lg:col-span-7">
          <div className="p-6 md:p-8 rounded-3xl bg-white border border-[var(--border-subtle)] shadow-xl">
            <div className="border-b pb-4 mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[var(--accent-blue)] text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Direct Publisher Order Intake
              </div>
              <h2 className="text-2xl font-black text-[var(--text-primary)]">
                Launch Your Authority Campaign
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Provide your target domain and keywords. Our senior link-building team will shortlist verified matching publishers within 24 hours.
              </p>
            </div>

            {success ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-emerald-900">Campaign Order Received!</h3>
                <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
                  Thank you! Our link outreach directors are reviewing your target niche and domain. We will email your custom publisher shortlist, anchor mapping, and invoice to <strong>{form.email}</strong> within 12-24 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="mt-4 px-6 py-2.5 rounded-full bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
                >
                  Submit Another Campaign
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-[var(--accent-blue)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Business Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="sarah@company.com"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-[var(--accent-blue)]"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Website Domain *</label>
                    <input
                      type="text"
                      required
                      placeholder="https://yourwebsite.com"
                      value={form.domain}
                      onChange={(e) => updateField("domain", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-[var(--accent-blue)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Industry / Niche *</label>
                    <select
                      value={form.niche}
                      onChange={(e) => updateField("niche", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-[var(--accent-blue)]"
                    >
                      <option value="Tech & SaaS">Technology &amp; SaaS</option>
                      <option value="Ecommerce & Retail">E-Commerce &amp; Retail</option>
                      <option value="Finance & Crypto">Finance, Banking &amp; Crypto</option>
                      <option value="Health & Medical">Health, Fitness &amp; Medical</option>
                      <option value="Real Estate & Home">Real Estate &amp; Home Services</option>
                      <option value="Law & Legal">Legal &amp; Law Firms</option>
                      <option value="Travel & Hospitality">Travel &amp; Hospitality</option>
                      <option value="Marketing & Business">Marketing &amp; B2B Business</option>
                      <option value="Other Industry">Other Custom Niche</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Target Landing Page(s)</label>
                    <input
                      type="text"
                      placeholder="https://yourwebsite.com/money-page"
                      value={form.targetUrl}
                      onChange={(e) => updateField("targetUrl", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-[var(--accent-blue)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Desired Anchor Texts</label>
                    <input
                      type="text"
                      placeholder="e.g. Best CRM Software, Brand Name, etc."
                      value={form.anchorText}
                      onChange={(e) => updateField("anchorText", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-[var(--accent-blue)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Special Instructions or Competitor URLs</label>
                  <textarea
                    rows={2}
                    placeholder="Tell us if you want specific geographic targets (US, UK, CA, UAE), content topics, or publisher restrictions..."
                    value={form.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-[var(--accent-blue)]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-[var(--accent-blue)] hover:opacity-90 text-white font-extrabold text-sm transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting Campaign Order...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> 
                        {form.orderMode === "preset"
                          ? `Lock In ${selectedPackage.name} (${selectedPackage.price})`
                          : `Confirm ${form.customQty} Links Order ($${customCalculatedPrice.toLocaleString()})`
                        }
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-[var(--text-muted)] mt-2">
                    🔒 No upfront commitment required to receive initial publisher shortlist &amp; audit.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
