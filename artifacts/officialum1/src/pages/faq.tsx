import { useState, useMemo } from "react";
import { Link } from "wouter";
import { ChevronDown, Search, LifeBuoy, ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { makeSimpleBreadcrumbs, makeFAQSchema } from "@/lib/seo";

const FAQS = [
  { id: 1, cat: "General", q: "How long does delivery take?", a: "Digital account details are delivered instantly to your dashboard and email after payment confirmation. Custom agency services typically take 24–72 hours depending on complexity." },
  { id: 2, cat: "Payments", q: "What payment methods do you accept?", a: "We accept Credit/Debit Cards (Stripe), Binance Pay, and Cryptocurrencies via Cryptomus for secure, borderless transactions." },
  { id: 3, cat: "Security", q: "What is the 'Verified Pro' program?", a: "Our verification program ensures a safe marketplace. Submit a valid ID and selfie photo — once approved you gain access to premium, high-value assets and seller privileges." },
  { id: 4, cat: "Warranty", q: "Do you offer replacements or refunds?", a: "Yes. We provide a 24-hour warranty on all digital accounts. If credentials are invalid on arrival, we replace them instantly. Check every account immediately after delivery." },
  { id: 5, cat: "General", q: "How do I track my order?", a: "Visit your Dashboard → My Orders after login. Each order shows real-time status: Pending, Processing, Delivered, or Completed." },
  { id: 6, cat: "Payments", q: "Is my payment information secure?", a: "All payments are processed through PCI-compliant gateways (Stripe, Cryptomus). We never store raw card data on our servers." },
  { id: 7, cat: "General", q: "Can I sell accounts on OfficialUM1?", a: "Yes! Apply for a Verified Seller account via our verification program. Once approved, you can list and sell digital assets on the marketplace." },
  { id: 8, cat: "Membership", q: "What are the membership tier benefits?", a: "Silver, Gold, and Diamond VIP members receive exclusive discounts, early access to premium listings, priority support, access to the Account Builder Wizard, and more." },
  { id: 9, cat: "Warranty", q: "What happens if an account gets banned after purchase?", a: "Our warranty covers accounts that are invalid at the time of delivery. Post-delivery bans caused by user actions fall outside warranty scope. Check our Terms for details." },
  { id: 10, cat: "Security", q: "Is my personal data shared with third parties?", a: "No. We follow strict data privacy principles. Your information is never sold or rented. Read our Privacy Policy for complete details." },
  { id: 11, cat: "Membership", q: "How do I upgrade my membership tier?", a: "Go to the Membership page, choose your plan (Silver, Gold, or Diamond), and complete payment. Your tier upgrades instantly." },
  { id: 12, cat: "General", q: "How do I contact support?", a: "Use the Support page to submit a ticket, or reach us via Discord/Telegram links in the footer. VIP members get priority queue access." },
];

const CATS = ["All", ...Array.from(new Set(FAQS.map(f => f.cat)))];

export function FAQ() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [openId, setOpenId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return FAQS.filter(f => {
      const matchCat = activeCat === "All" || f.cat === activeCat;
      const matchQ = !query || f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQ;
    });
  }, [query, activeCat]);

  const catColors: Record<string, string> = {
    General: "#4f7af5", Payments: "#10b981", Security: "#8b5cf6", Warranty: "#f59e0b", Membership: "#ec4899",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <SEO
        title="FAQ — OfficialUM1 Help & Common Questions"
        description="Answers to the most common questions about buying social media accounts, payment methods, account safety, delivery times, and OfficialUM1 membership plans."
        keywords="officialum1 FAQ, social media accounts FAQ, payment methods, delivery time, account safety"
        breadcrumbs={makeSimpleBreadcrumbs({ name: "FAQ", href: "/faq" })}
        schema={makeFAQSchema(filtered.length > 0 ? filtered.map(f => ({ question: f.q, answer: f.a })) : FAQS.map(f => ({ question: f.q, answer: f.a })))}
      />
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border" style={{ borderColor: "rgba(79,122,245,0.3)", background: "rgba(79,122,245,0.08)", color: "#4f7af5" }}>
          <LifeBuoy className="w-3.5 h-3.5" /> Help Center
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Frequently Asked <span style={{ color: "#4f7af5" }}>Questions</span></h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">Everything you need to know about OfficialUM1. Can't find an answer? Reach our support team.</p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
          placeholder="Search questions…"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpenId(null); }}
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-10">
        {CATS.map(c => (
          <button key={c} onClick={() => setActiveCat(c)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={activeCat === c
              ? { background: catColors[c] || "#4f7af5", color: "#fff", boxShadow: `0 4px 12px ${catColors[c] || "#4f7af5"}44` }
              : { background: "rgba(0,0,0,0.04)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }
            }>
            {c}
          </button>
        ))}
      </div>

      {/* FAQ accordion */}
      <div className="space-y-3 mb-16">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-muted-foreground">No results for "{query}"</p>
          </div>
        )}
        {filtered.map(f => (
          <div key={f.id} className="rounded-2xl border border-border bg-card overflow-hidden transition-all">
            <button
              onClick={() => setOpenId(openId === f.id ? null : f.id)}
              className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 hover:bg-black/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0"
                  style={{ background: (catColors[f.cat] || "#4f7af5") + "15", color: catColors[f.cat] || "#4f7af5" }}>
                  {f.cat}
                </span>
                <span className="font-semibold text-sm md:text-base">{f.q}</span>
              </div>
              <ChevronDown className={`w-5 h-5 shrink-0 text-muted-foreground transition-transform duration-200 ${openId === f.id ? "rotate-180" : ""}`} />
            </button>
            {openId === f.id && (
              <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                {f.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="rounded-3xl p-8 text-center" style={{ background: "linear-gradient(135deg, rgba(79,122,245,0.08), rgba(139,92,246,0.06))", border: "1px solid rgba(79,122,245,0.2)" }}>
        <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
        <p className="text-muted-foreground text-sm mb-5">Our support team is here 24/7 to help you.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/support">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition" style={{ background: "#4f7af5" }}>
              <LifeBuoy className="w-4 h-4" /> Open Support Ticket <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/contact">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition border border-border hover:bg-black/5">
              Contact Us
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
