import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Wand2, ArrowRight, Lock, CheckCircle, ChevronRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { makeSimpleBreadcrumbs } from "@/lib/seo";
import { useToast } from "@/hooks/use-toast";

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Twitter/X", "Reddit", "Facebook", "LinkedIn", "Pinterest", "Snapchat", "Discord"];
const NICHES = ["Fitness & Health", "Finance & Crypto", "Lifestyle", "Gaming", "Fashion & Beauty", "Business & Entrepreneur", "Travel", "Tech", "Food & Cooking", "Other"];

type Step = 1 | 2 | 3 | 4;

export function Builder() {
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({ platform: "", niche: "", followers: "", requirements: "", budget: "", timeline: "" });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("um1_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  const isVip = user?.membership && !["none", "", null, undefined].includes(user.membership);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/builder/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId: user?.id }),
      });
      if (res.ok) setSubmitted(true);
      else toast({ title: "Submission failed. Please try again.", variant: "destructive" });
    } catch {
      toast({ title: "Network error. Please try again.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  if (!user) return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(79,122,245,0.1)" }}>
        <Lock className="w-7 h-7" style={{ color: "#4f7af5" }} />
      </div>
      <h2 className="text-2xl font-black mb-2">Login Required</h2>
      <p className="text-muted-foreground mb-7">You need to be logged in to access the Account Builder Wizard.</p>
      <Link href="/login"><button className="px-7 py-3 rounded-xl font-bold text-white" style={{ background: "#4f7af5" }}>Log In <ArrowRight className="w-4 h-4 inline" /></button></Link>
    </div>
  );

  if (!isVip) return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="w-20 h-20 text-5xl flex items-center justify-center mx-auto mb-5">🛡️</div>
      <h2 className="text-3xl font-black mb-3">VIP Members Only</h2>
      <p className="text-muted-foreground text-lg mb-3 max-w-lg mx-auto">The Account Builder Wizard is an exclusive feature for our <strong>Silver, Gold, and Diamond</strong> VIP members.</p>
      <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Request custom-built accounts with specific stats, niches, follower counts, and engagement — made to order for you.</p>
      <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
        {[{ tier: "Silver", price: "$9.99/mo", color: "#94a3b8" }, { tier: "Gold", price: "$24.99/mo", color: "#f59e0b" }, { tier: "Diamond", price: "$49.99/mo", color: "#818cf8" }].map(t => (
          <div key={t.tier} className="rounded-2xl border border-border p-4 text-center">
            <div className="font-black text-base" style={{ color: t.color }}>{t.tier}</div>
            <div className="text-xs text-muted-foreground font-semibold">{t.price}</div>
          </div>
        ))}
      </div>
      <Link href="/membership"><button className="px-8 py-4 rounded-xl font-black text-base text-black" style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 8px 24px rgba(245,158,11,0.35)" }}>Upgrade to VIP Now 🚀</button></Link>
    </div>
  );

  if (submitted) return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(16,185,129,0.1)" }}>
        <CheckCircle className="w-10 h-10" style={{ color: "#10b981" }} />
      </div>
      <h2 className="text-3xl font-black mb-3" style={{ color: "#10b981" }}>Request Submitted!</h2>
      <p className="text-muted-foreground mb-8">Your account builder request has been sent. Our team will review it and get back to you within 24 hours.</p>
      <div className="flex gap-3 justify-center">
        <Link href="/dashboard"><button className="px-6 py-3 rounded-xl font-bold text-white" style={{ background: "#4f7af5" }}>My Dashboard</button></Link>
        <button onClick={() => { setSubmitted(false); setStep(1); setForm({ platform: "", niche: "", followers: "", requirements: "", budget: "", timeline: "" }); }}
          className="px-6 py-3 rounded-xl font-semibold border border-border hover:bg-black/5 transition">
          Submit Another
        </button>
      </div>
    </div>
  );

  const steps = [
    { n: 1, label: "Platform" },
    { n: 2, label: "Requirements" },
    { n: 3, label: "Budget" },
    { n: 4, label: "Review" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <SEO
        title="VIP Account Builder — OfficialUM1 Custom Accounts"
        description="VIP members can request custom social media accounts built to their exact specifications. Choose your platform, niche, follower range, and requirements."
        keywords="custom social media account, VIP account builder, bespoke accounts, officialum1 VIP"
        breadcrumbs={makeSimpleBreadcrumbs({ name: "Account Builder", href: "/builder" })}
        noindex={true}
      />
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border" style={{ borderColor: "rgba(79,122,245,0.3)", background: "rgba(79,122,245,0.07)", color: "#4f7af5" }}>
          <Wand2 className="w-3.5 h-3.5" /> VIP Account Builder
        </div>
        <h1 className="text-4xl font-black mb-2">Build Your Custom Account</h1>
        <p className="text-muted-foreground">Tell us exactly what you need. We'll source or build it for you.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-border -z-10" />
        {steps.map((s, i) => (
          <div key={s.n} className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all ${step >= s.n ? "text-white" : "text-muted-foreground bg-card"}`}
              style={step >= s.n ? { background: "#4f7af5", borderColor: "#4f7af5" } : { borderColor: "var(--border)" }}>
              {step > s.n ? <CheckCircle className="w-4 h-4" /> : s.n}
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground hidden sm:block">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-border bg-card p-7 shadow-sm">
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-black">Which platform?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PLATFORMS.map(p => (
                <button key={p} onClick={() => setForm(f => ({ ...f, platform: p }))}
                  className="py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all"
                  style={form.platform === p ? { background: "#4f7af5", color: "#fff", borderColor: "#4f7af5" } : { borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                  {p}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Niche / Category</label>
              <div className="grid grid-cols-2 gap-2">
                {NICHES.map(n => (
                  <button key={n} onClick={() => setForm(f => ({ ...f, niche: n }))}
                    className="py-2 px-3 rounded-xl text-xs font-semibold border text-left transition-all"
                    style={form.niche === n ? { background: "#4f7af5", color: "#fff", borderColor: "#4f7af5" } : { borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-black">What are you looking for?</h2>
            <div>
              <label className="block text-sm font-semibold mb-2">Follower / Subscriber Count</label>
              <input className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. 10K–50K followers" value={form.followers} onChange={e => setForm(f => ({ ...f, followers: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Specific Requirements</label>
              <textarea className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 h-32 resize-none"
                placeholder="e.g. Must be monetized, aged account 2+ years, specific engagement rate, country-specific audience..."
                value={form.requirements} onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-black">Budget & Timeline</h2>
            <div>
              <label className="block text-sm font-semibold mb-2">Budget Range</label>
              <div className="grid grid-cols-2 gap-2">
                {["$50–$200", "$200–$500", "$500–$1K", "$1K–$5K", "$5K+", "Flexible"].map(b => (
                  <button key={b} onClick={() => setForm(f => ({ ...f, budget: b }))}
                    className="py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all"
                    style={form.budget === b ? { background: "#4f7af5", color: "#fff", borderColor: "#4f7af5" } : { borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Ideal Timeline</label>
              <div className="grid grid-cols-3 gap-2">
                {["ASAP", "Within a week", "Within a month", "Flexible"].map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, timeline: t }))}
                    className="py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all"
                    style={form.timeline === t ? { background: "#4f7af5", color: "#fff", borderColor: "#4f7af5" } : { borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-black">Review Your Request</h2>
            {[
              { label: "Platform", value: form.platform },
              { label: "Niche", value: form.niche },
              { label: "Follower Count", value: form.followers },
              { label: "Requirements", value: form.requirements },
              { label: "Budget", value: form.budget },
              { label: "Timeline", value: form.timeline },
            ].map(row => (
              <div key={row.label} className="flex gap-3 text-sm p-3 rounded-xl bg-muted/50">
                <span className="text-muted-foreground font-semibold w-32 shrink-0">{row.label}</span>
                <span className="font-medium">{row.value || "—"}</span>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-7">
          {step > 1 && (
            <button onClick={() => setStep(s => (s - 1) as Step)}
              className="px-5 py-3 rounded-xl font-semibold border border-border hover:bg-black/5 transition text-sm">
              Back
            </button>
          )}
          {step < 4 ? (
            <button onClick={() => setStep(s => (s + 1) as Step)}
              disabled={(step === 1 && (!form.platform || !form.niche)) || (step === 2 && !form.requirements)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition disabled:opacity-40"
              style={{ background: "#4f7af5" }}>
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition disabled:opacity-50"
              style={{ background: "#10b981" }}>
              {loading ? "Submitting…" : "Submit Request ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
