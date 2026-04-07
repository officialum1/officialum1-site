import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { BookOpen, Search, ArrowRight, ChevronRight, ArrowLeft, Tag } from "lucide-react";
import { SEO } from "@/components/SEO";
import { makeSimpleBreadcrumbs, SITE_URL } from "@/lib/seo";

type Article = { id: number; title: string; content: string; category?: string; slug?: string };

const FALLBACK: Article[] = [
  { id: 1, slug: "how-to-buy", category: "Getting Started", title: "How to Make Your First Purchase", content: "Browse the shop, add an item to your cart, proceed to checkout, and complete payment. Your account details are delivered instantly to your dashboard and email." },
  { id: 2, slug: "delivery-process", category: "Getting Started", title: "How Delivery Works", content: "After successful payment, your order is processed automatically. Account credentials and delivery information appear under Dashboard → My Orders. Most orders are delivered within minutes." },
  { id: 3, slug: "warranty-policy", category: "Policies", title: "Warranty & Replacement Policy", content: "All accounts come with a 24-hour warranty. If credentials don't work upon delivery, contact support immediately with your order ID. We'll replace the account at no additional cost." },
  { id: 4, slug: "payment-methods", category: "Payments", title: "Accepted Payment Methods", content: "We accept Visa/Mastercard via Stripe, Binance Pay, and crypto payments via Cryptomus (BTC, ETH, USDT, and 50+ coins). All payments are secured with SSL encryption." },
  { id: 5, slug: "vip-membership", category: "Membership", title: "VIP Membership Benefits", content: "VIP members (Silver, Gold, Diamond) receive exclusive discounts on all products, early access to new listings, priority support queues, access to the Account Builder Wizard, and monthly bonuses." },
  { id: 6, slug: "verification-program", category: "Security", title: "Account Verification Program", content: "The Verified Pro program requires submitting a government-issued ID and a selfie. Verified users can sell accounts, access high-value assets, and build trust with the community." },
  { id: 7, slug: "refund-policy", category: "Policies", title: "Refund Policy", content: "Refunds are available for digital products that are provably non-functional at time of delivery. Once an account is accessed and credentials changed, refunds are not available. Contact support within 24 hours of purchase." },
  { id: 8, slug: "contact-support", category: "Support", title: "How to Contact Support", content: "Submit a support ticket via the Support page. VIP members get priority handling. You can also reach us on Discord and Telegram — links are in the footer." },
];

export function KnowledgeBase() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetch("/api/kb").then(r => r.json())
      .then(d => setArticles([...FALLBACK, ...(Array.isArray(d) ? d : [])]))
      .catch(() => setArticles(FALLBACK));
  }, []);

  const categories = ["All", ...Array.from(new Set(articles.map(a => a.category || "General")))];
  const filtered = articles.filter(a => {
    const matchCat = activeCategory === "All" || (a.category || "General") === activeCategory;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const grouped = filtered.reduce((acc, a) => {
    const cat = a.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {} as Record<string, Article[]>);

  const catColors: Record<string, string> = {
    "Getting Started": "#4f7af5", "Policies": "#8b5cf6", "Payments": "#10b981", "Membership": "#f59e0b", "Security": "#ec4899", "Support": "#06b6d4",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <SEO
        title="Knowledge Base — Guides, Policies & Help Articles | OfficialUM1"
        description="Browse OfficialUM1's knowledge base for getting started guides, delivery explanations, warranty policies, payment FAQs, membership info, and security tips."
        keywords="officialum1 help, knowledge base, getting started, warranty policy, delivery guide, payment methods, membership FAQ"
        breadcrumbs={makeSimpleBreadcrumbs({ name: "Knowledge Base", href: "/kb" })}
        type="website"
      />
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border" style={{ borderColor: "rgba(79,122,245,0.3)", background: "rgba(79,122,245,0.07)", color: "#4f7af5" }}>
          <BookOpen className="w-3.5 h-3.5" /> Knowledge Base
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Everything You Need to <span style={{ color: "#4f7af5" }}>Know</span></h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">Find answers, guides, and policies all in one place.</p>
      </div>

      <div className="relative mb-7">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
          placeholder="Search articles…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map(c => (
          <button key={c} onClick={() => setActiveCategory(c)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all border"
            style={activeCategory === c
              ? { background: catColors[c] || "#4f7af5", color: "#fff", borderColor: catColors[c] || "#4f7af5" }
              : { borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
            {c}
          </button>
        ))}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No articles found for "{search}"</div>
      ) : (
        <div className="space-y-8 mb-12">
          {Object.entries(grouped).map(([cat, arts]) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4" style={{ color: catColors[cat] || "#4f7af5" }} />
                <h2 className="font-black text-lg">{cat}</h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: (catColors[cat] || "#4f7af5") + "15", color: catColors[cat] || "#4f7af5" }}>{arts.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {arts.map(a => (
                  <Link key={a.id} href={`/kb/${a.slug || a.id}`}>
                    <div className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: (catColors[cat] || "#4f7af5") + "15" }}>
                        <BookOpen className="w-4 h-4" style={{ color: catColors[cat] || "#4f7af5" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{a.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{a.content}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-3xl p-7 text-center" style={{ background: "linear-gradient(135deg, rgba(79,122,245,0.07), rgba(139,92,246,0.05))", border: "1px solid rgba(79,122,245,0.2)" }}>
        <h3 className="font-black text-xl mb-2">Didn't find what you need?</h3>
        <p className="text-muted-foreground text-sm mb-5">Our support team can help with any question.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/support"><button className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm" style={{ background: "#4f7af5" }}>Open Support Ticket <ArrowRight className="w-4 h-4" /></button></Link>
          <Link href="/faq"><button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-border hover:bg-black/5 transition">Browse FAQ</button></Link>
        </div>
      </div>
    </div>
  );
}

export function KBArticle() {
  const params = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fallback = FALLBACK.find(a => a.slug === params.slug || String(a.id) === params.slug);
    if (fallback) { setArticle(fallback); setLoading(false); return; }
    fetch(`/api/kb/${params.slug}`).then(r => r.json())
      .then(d => { setArticle(d); setLoading(false); })
      .catch(() => { setArticle(fallback || null); setLoading(false); });
  }, [params.slug]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted-foreground">Loading…</div>;
  if (!article) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-black mb-3">Article not found</h2>
      <Link href="/kb"><button className="px-6 py-3 rounded-xl font-bold border border-border hover:bg-black/5 transition">← Back to KB</button></Link>
    </div>
  );

  const catColors: Record<string, string> = { "Getting Started": "#4f7af5", "Policies": "#8b5cf6", "Payments": "#10b981", "Membership": "#f59e0b", "Security": "#ec4899", "Support": "#06b6d4" };
  const color = catColors[article.category || ""] || "#4f7af5";

  const kbArticleBreadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Knowledge Base", href: "/kb" },
    { name: article.title, href: `/kb/${article.slug || article.id}` },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <SEO
        title={`${article.title} — OfficialUM1 Knowledge Base`}
        description={article.content?.substring(0, 160) || `Read about ${article.title} in the OfficialUM1 knowledge base.`}
        keywords={`${article.title?.toLowerCase()}, ${article.category?.toLowerCase() || "help"}, officialum1 guide`}
        breadcrumbs={kbArticleBreadcrumbs}
        type="article"
      />
      <Link href="/kb">
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Knowledge Base
        </button>
      </Link>
      {article.category && (
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-4" style={{ background: `${color}15`, color }}>
          {article.category}
        </span>
      )}
      <h1 className="text-3xl md:text-4xl font-black mb-6">{article.title}</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed p-6 rounded-2xl border border-border bg-card">
        {article.content.split("\n").map((para, i) => para.trim() && <p key={i} className="mb-4 last:mb-0">{para}</p>)}
      </div>
      <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Was this article helpful?</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-black/5 transition">👍 Yes</button>
          <button className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-black/5 transition">👎 No</button>
        </div>
      </div>
    </div>
  );
}
