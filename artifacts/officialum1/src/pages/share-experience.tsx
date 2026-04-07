import { useState } from "react";
import { Link } from "wouter";
import { Star, Send, CheckCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ShareExperience() {
  const [form, setForm] = useState({ name: "", role: "", review: "", rating: 5, platform: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.review) return;
    setLoading(true);
    try {
      await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch {
      toast({ title: "Failed to submit. Please try again.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  if (submitted) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(16,185,129,0.1)" }}>
        <CheckCircle className="w-10 h-10" style={{ color: "#10b981" }} />
      </div>
      <h2 className="text-3xl font-black mb-3" style={{ color: "#10b981" }}>Thank You! 🎉</h2>
      <p className="text-muted-foreground mb-8">Your review has been submitted and is pending moderation. We appreciate your feedback — it helps others choose OfficialUM1 with confidence.</p>
      <div className="flex gap-3 justify-center">
        <Link href="/reviews"><button className="px-6 py-3 rounded-xl font-bold text-white text-sm" style={{ background: "#4f7af5" }}>View All Reviews</button></Link>
        <button onClick={() => { setSubmitted(false); setForm({ name: "", role: "", review: "", rating: 5, platform: "" }); }}
          className="px-6 py-3 rounded-xl font-semibold text-sm border border-border hover:bg-black/5 transition">
          Submit Another
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <Link href="/reviews">
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Reviews
        </button>
      </Link>

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border" style={{ borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.07)", color: "#f59e0b" }}>
          <Star className="w-3.5 h-3.5" /> Share Your Experience
        </div>
        <h1 className="text-4xl font-black mb-3">Your Voice Matters</h1>
        <p className="text-muted-foreground">Share your honest experience with OfficialUM1. Your feedback helps us improve and helps others make informed decisions.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-7 shadow-sm space-y-5">
        {/* Star rating */}
        <div>
          <label className="block text-sm font-bold mb-3">Overall Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} type="button" onClick={() => setForm(f => ({ ...f, rating: n }))}>
                <Star className={`w-8 h-8 transition-all ${form.rating >= n ? "fill-yellow-400 text-yellow-400 scale-110" : "text-muted-foreground"}`} />
              </button>
            ))}
            <span className="ml-2 text-sm font-semibold self-center text-muted-foreground">
              {["", "Poor", "Fair", "Good", "Great", "Excellent"][form.rating]}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Your Name <span className="text-red-500">*</span></label>
            <input className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Role / Company</label>
            <input className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              placeholder="e.g. Content Creator" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">What did you buy?</label>
          <input className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            placeholder="e.g. Instagram Account, SEO Service…" value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Your Review <span className="text-red-500">*</span></label>
          <textarea className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition h-36 resize-none"
            placeholder="Share your honest experience — what did you love? What could be improved?"
            value={form.review} onChange={e => setForm(f => ({ ...f, review: e.target.value }))} required />
          <p className="text-xs text-muted-foreground mt-1">{form.review.length}/500 characters</p>
        </div>

        <button type="submit" disabled={loading || !form.name || !form.review}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition disabled:opacity-40"
          style={{ background: "#4f7af5", boxShadow: "0 6px 20px rgba(79,122,245,0.3)" }}>
          {loading ? "Submitting…" : <><Send className="w-4 h-4" /> Submit Review</>}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          Reviews are moderated before publication. By submitting, you agree to our{" "}
          <Link href="/terms"><span className="underline cursor-pointer hover:text-foreground">Terms of Service</span></Link>.
        </p>
      </form>
    </div>
  );
}
