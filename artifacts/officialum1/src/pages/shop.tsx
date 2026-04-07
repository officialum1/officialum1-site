import React from "react";
import { useListProducts, useGetCategories, useAddToCart } from "@workspace/api-client-react";
import { SEO } from "@/components/SEO";
import { makeSimpleBreadcrumbs } from "@/lib/seo";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, ShoppingCart, Star, Package,
  Instagram, Twitter, Youtube, MessageCircle, Linkedin, Hash, TrendingUp,
  CheckCircle, ArrowRight, Loader2, DollarSign, Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PLATFORM_META: Record<string, { icon: React.ReactNode; color: string; bg: string; img?: string }> = {
  Snapchat: {
    icon: <TrendingUp className="w-10 h-10" />,
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
    img: "https://officialum1.com/icons/snapchat.png",
  },
  Instagram: {
    icon: <Instagram className="w-10 h-10" />,
    color: "text-pink-600",
    bg: "bg-pink-50 border-pink-200",
    img: "https://officialum1.com/icons/instagram.png",
  },
  Twitter: {
    icon: <Twitter className="w-10 h-10" />,
    color: "text-sky-600",
    bg: "bg-sky-50 border-sky-200",
    img: "https://officialum1.com/icons/twitter.png",
  },
  YouTube: {
    icon: <Youtube className="w-10 h-10" />,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    img: "https://officialum1.com/icons/youtube.png",
  },
  Discord: {
    icon: <MessageCircle className="w-10 h-10" />,
    color: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-200",
    img: "https://cdn-icons-png.flaticon.com/512/5968/5968756.png",
  },
  Reddit: {
    icon: <Hash className="w-10 h-10" />,
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
    img: "https://officialum1.com/icons/reddit.png",
  },
  Telegram: {
    icon: <MessageCircle className="w-10 h-10" />,
    color: "text-blue-500",
    bg: "bg-blue-50 border-blue-200",
    img: "https://officialum1.com/icons/telegram.png",
  },
  TikTok: {
    icon: <TrendingUp className="w-10 h-10" />,
    color: "text-fuchsia-600",
    bg: "bg-fuchsia-50 border-fuchsia-200",
    img: "https://officialum1.com/icons/tiktok.png",
  },
  LinkedIn: {
    icon: <Linkedin className="w-10 h-10" />,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
};

function getPlatformMeta(platform?: string | null) {
  if (!platform) return { icon: <Package className="w-10 h-10" />, color: "text-primary", bg: "bg-primary/10 border-primary/20", img: undefined };
  const key = Object.keys(PLATFORM_META).find(k => platform.toLowerCase().includes(k.toLowerCase()));
  return key ? PLATFORM_META[key] : { icon: <Package className="w-10 h-10" />, color: "text-primary", bg: "bg-primary/10 border-primary/20", img: undefined };
}

const CATEGORY_TABS = ["All", "Reddit", "Telegram", "Discord", "Snapchat", "YouTube", "TikTok", "Instagram", "Twitter", "LinkedIn"];
const SELL_PLATFORMS = ["Instagram", "TikTok", "YouTube", "Twitter/X", "Reddit", "Snapchat", "Facebook", "LinkedIn", "Pinterest", "Discord", "Telegram", "Other"];
const CONTACT_METHODS = ["WhatsApp", "Telegram", "Email", "Discord"];

function SellForm() {
  const { toast } = useToast();
  const [form, setForm] = useState({ platform: "", account_type: "", followers: "", price: "", description: "", contact_method: "WhatsApp", contact: "" });
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/sell", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { setSubmitted(true); }
      else { toast({ title: "Submission failed. Please try again.", variant: "destructive" }); }
    } catch { toast({ title: "Network error. Please check connection.", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const inp = "w-full px-4 py-3 rounded-xl text-sm border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition";

  if (submitted) return (
    <div className="max-w-xl mx-auto text-center py-16">
      <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-green-500" /></div>
      <h2 className="text-2xl font-black text-foreground mb-3">Submission Received! 🎉</h2>
      <p className="text-muted-foreground mb-6">Our team reviews all accounts within 24 hours. We'll contact you via {form.contact_method} to discuss pricing and next steps.</p>
      <div className="bg-card border border-border rounded-2xl p-5 text-left mb-6 space-y-2">
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Platform</span><span className="font-semibold">{form.platform}</span></div>
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Asking Price</span><span className="font-semibold text-primary">${form.price || "Open to offer"}</span></div>
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Contact via</span><span className="font-semibold">{form.contact_method}: {form.contact}</span></div>
      </div>
      <Button onClick={() => { setSubmitted(false); setStep(1); setForm({ platform: "", account_type: "", followers: "", price: "", description: "", contact_method: "WhatsApp", contact: "" }); }}>Submit Another Account</Button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-primary/30 bg-primary/5 text-primary"><DollarSign className="w-3.5 h-3.5" /> Sell Your Account</div>
        <h2 className="text-3xl font-black text-foreground mb-3">Turn Your Accounts into <span className="text-primary">Cash</span></h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">We buy high-quality accounts across all platforms. Submit yours and get a price within 24 hours.</p>
      </div>

      {/* Process steps */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[["1", "Submit Details", "Fill in account info"], ["2", "Get Reviewed", "Team checks quality"], ["3", "Get Paid", "Fast USDT or bank"]].map(([n, t, d], i) => (
          <div key={n} className={`p-4 rounded-2xl border text-center transition-all ${step === i + 1 ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black mx-auto mb-2" style={step === i + 1 ? { background: "var(--primary)", color: "#fff" } : { background: "var(--muted)", color: "var(--muted-foreground)" }}>{n}</div>
            <div className="text-xs font-bold text-foreground">{t}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{d}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-5">
        {/* Step 1 — Account info */}
        <div>
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full text-xs font-black flex items-center justify-center text-white" style={{ background: "var(--primary)" }}>1</span> Account Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Platform *</label>
              <select className={inp} value={form.platform} onChange={set("platform")} required>
                <option value="">Select platform…</option>
                {SELL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Account Type</label>
              <input className={inp} value={form.account_type} onChange={set("account_type")} placeholder="e.g. Aged, PVA, Creator" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Followers / Age</label>
              <input className={inp} value={form.followers} onChange={set("followers")} placeholder="e.g. 50K followers, 3yr old" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Asking Price (USD)</label>
              <input type="number" min="0" step="0.01" className={inp} value={form.price} onChange={set("price")} placeholder="Leave blank if open to offers" />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Account Description</label>
            <textarea className={inp} style={{ minHeight: 90, resize: "vertical" }} value={form.description} onChange={set("description")} placeholder="Tell us about the account — niche, engagement rate, monetization, history, etc." />
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Step 2 — Contact info */}
        <div>
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full text-xs font-black flex items-center justify-center text-white" style={{ background: "var(--primary)" }}>2</span> How Should We Contact You?</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Contact Method *</label>
              <select className={inp} value={form.contact_method} onChange={set("contact_method")} required>
                {CONTACT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">{form.contact_method} Handle / Number *</label>
              <input className={inp} value={form.contact} onChange={set("contact")} placeholder={form.contact_method === "Email" ? "you@example.com" : form.contact_method === "WhatsApp" ? "+1 555 0100" : `Your ${form.contact_method} username`} required />
            </div>
          </div>
        </div>

        {/* Trust signals */}
        <div className="grid grid-cols-3 gap-2">
          {["⚡ 24hr Review", "💰 Best Rates", "🔒 Secure Deal"].map(t => <div key={t} className="text-center text-xs font-semibold text-muted-foreground py-2 rounded-xl bg-muted/40">{t}</div>)}
        </div>

        <Button type="submit" size="lg" className="w-full gap-2 h-12 text-base font-bold" disabled={loading}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          {loading ? "Submitting…" : "Submit Account for Review"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">By submitting you agree to our <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>. We never share your contact details.</p>
      </form>
    </div>
  );
}

export function Shop() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  // Read ?tab= from URL
  const urlTab = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("tab") : "buy";
  const [activeTab, setActiveTab] = useState<"buy" | "sell">(urlTab === "sell" ? "sell" : "buy");

  const switchTab = (tab: "buy" | "sell") => {
    setActiveTab(tab);
    const newUrl = tab === "sell" ? "/shop?tab=sell" : "/shop";
    window.history.replaceState({}, "", import.meta.env.BASE_URL.replace(/\/$/, "") + newUrl);
  };

  const { data: categoryData } = useGetCategories();
  const { data: productsData, isLoading } = useListProducts({
    search: search || null,
    category
  });

  const addToCart = useAddToCart();
  const { toast } = useToast();

  const handleAddToCart = (productId: number, e: React.MouseEvent) => {
    e.preventDefault();
    addToCart.mutate({ data: { productId, quantity: 1 } }, {
      onSuccess: () => {
        toast({ title: "Added to cart", description: "Item added successfully." });
      },
      onError: () => {
        toast({ title: "Error", description: "Could not add to cart.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Buy Verified Social Media Accounts — OfficialUM1 Marketplace"
        description="Shop 8+ verified, aged social media accounts: Reddit, Snapchat, Discord, Telegram, Instagram, and more. Instant delivery, escrow protection, and a replacement guarantee. From $5."
        keywords="buy social media accounts, aged reddit account, discord account for sale, snapchat account, telegram account, instagram account, verified accounts marketplace"
        breadcrumbs={makeSimpleBreadcrumbs({ name: "Shop", href: "/shop" })}
        type="website"
      />
      {/* Hero */}
      <div className="pt-24 pb-8 sm:pt-28 sm:pb-10 border-b border-border/30 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-primary text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2">Marketplace</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground mb-2">
            {activeTab === "sell" ? "Sell Your Account" : "Premium Digital Products"}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {activeTab === "sell" ? "Submit your account for review. We pay top rates within 24 hours." : "Buy high-quality digital products instantly. Filter by category and check out in minutes."}
          </p>

          {/* Buy / Sell Tab Switch */}
          <div className="flex gap-1 mt-5 p-1 rounded-xl bg-muted/40 border border-border w-fit">
            <button onClick={() => switchTab("buy")}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "buy" ? "bg-background text-foreground shadow-sm border border-border/60" : "text-muted-foreground hover:text-foreground"}`}>
              🛒 Buy Accounts
            </button>
            <button onClick={() => switchTab("sell")}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "sell" ? "bg-background text-foreground shadow-sm border border-border/60" : "text-muted-foreground hover:text-foreground"}`}>
              💰 Sell Accounts
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Sell Tab */}
        {activeTab === "sell" && <SellForm />}
        {activeTab === "buy" && <>

        {/* Bundle Banner */}
        <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-foreground text-lg">Exclusive Bundle Offer</h3>
            <p className="text-muted-foreground text-sm mt-0.5">
              Combine any 2+ accounts and get an instant <span className="font-bold text-primary">15% discount</span> applied at checkout.
            </p>
          </div>
          <Link href="/shop" className="shrink-0">
            <Button size="sm" className="px-6 font-semibold">Start Saving Now</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 h-11 bg-card border-border/60 focus:border-primary/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="sm:w-64">
            <Select value={category ?? "all"} onValueChange={(v) => setCategory(v === "all" ? null : v)}>
              <SelectTrigger className="h-11 bg-card border-border/60 focus:border-primary/50">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setCategory(tab === "All" ? null : tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                (tab === "All" && !category) || category === tab
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Results info */}
        {!isLoading && productsData?.products && (
          <p className="text-sm text-muted-foreground mb-5">
            Showing <span className="font-semibold text-foreground">{productsData.products.length}</span> products
            {category && <> in <span className="font-semibold text-primary">{category}</span></>}
            {search && <> matching <span className="font-semibold text-primary">"{search}"</span></>}
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-card/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : productsData?.products?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No products found</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different search or category</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setCategory(null); }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {productsData?.products?.map((product) => {
              const meta = getPlatformMeta(product.platform);
              return (
                <Link key={product.id} href={`/shop/${product.id}`} className="group block">
                  <div className="bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full">
                    {/* Platform icon */}
                    <div className={`h-36 sm:h-40 flex flex-col items-center justify-center border-b border-border/30 relative ${meta.bg}`}>
                      {product.badge && (
                        <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground z-10">
                          🔥 {product.badge}
                        </span>
                      )}
                      <div className="group-hover:scale-110 transition-all duration-300">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-14 h-14 sm:w-16 sm:h-16 object-contain" />
                        ) : meta.img ? (
                          <img src={meta.img} alt={product.platform ?? product.name} className="w-14 h-14 sm:w-16 sm:h-16 object-contain" onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }} />
                        ) : (
                          <div className={meta.color}>
                            {React.cloneElement(meta.icon as React.ReactElement, { className: "w-12 h-12 sm:w-14 sm:h-14" })}
                          </div>
                        )}
                      </div>
                      {product.inStock === false && (
                        <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                          <span className="text-xs font-bold text-muted-foreground px-2 py-1 rounded-full bg-background border border-border">Out of Stock</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col gap-2.5 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color}`}>
                          {product.category ?? product.platform}
                        </span>
                        {product.rating && (
                          <div className="flex items-center gap-1 text-xs">
                            <Star className="w-3 h-3 fill-primary text-primary" />
                            <span className="font-semibold text-foreground">{product.rating}</span>
                          </div>
                        )}
                      </div>
                      {/* Instant + Warranty badges */}
                      <div className="flex gap-1.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">⚡ Instant</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">🛡️ Warranty</span>
                      </div>

                      <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug flex-1">
                        {product.name}
                      </h3>

                      <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-border/30">
                        <div>
                          <span className="text-lg font-black text-primary">${Number(product.price).toFixed(2)}</span>
                          {product.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through ml-1.5">${Number(product.originalPrice).toFixed(2)}</span>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="w-full mt-1 h-9 font-semibold gap-2"
                        disabled={!product.inStock || addToCart.isPending}
                        variant={product.inStock ? "default" : "secondary"}
                        onClick={(e) => handleAddToCart(product.id, e)}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {product.inStock ? "Add to Cart" : "Unavailable"}
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        </>}
      </div>
    </div>
  );
}
