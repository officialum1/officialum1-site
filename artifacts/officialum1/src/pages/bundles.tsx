import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Package, ShoppingCart, CheckCircle, Tag, ArrowRight, Zap, X } from "lucide-react";
import { SEO } from "@/components/SEO";
import { makeSimpleBreadcrumbs } from "@/lib/seo";
import { useToast } from "@/hooks/use-toast";

export function Bundles() {
  const [products, setProducts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/products?limit=100")
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : (Array.isArray(d?.products) ? d.products : []);
        setProducts(list.filter((p: any) => p.inStock !== false && (p.stock ?? 1) > 0));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggle = (p: any) => {
    if (selected.find(s => s.id === p.id)) {
      setSelected(selected.filter(s => s.id !== p.id));
    } else {
      if (selected.length >= 5) { toast({ title: "Maximum 5 items per bundle", variant: "destructive" }); return; }
      setSelected([...selected, p]);
    }
  };

  const DISCOUNT = selected.length >= 3 ? 0.15 : selected.length >= 2 ? 0.05 : 0;
  const subtotal = selected.reduce((acc, p) => acc + parseFloat(p.price), 0);
  const total = subtotal * (1 - DISCOUNT);

  const addBundleToCart = () => {
    if (selected.length < 2) { toast({ title: "Select at least 2 items", variant: "destructive" }); return; }
    const cart = JSON.parse(localStorage.getItem("um1_cart") || "[]");
    selected.forEach(p => {
      const price = (parseFloat(p.price) * (1 - DISCOUNT)).toFixed(2);
      if (!cart.find((c: any) => c.id === p.id)) cart.push({ ...p, price, qty: 1 });
    });
    localStorage.setItem("um1_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    setSelected([]);
    toast({ title: `🎉 Bundle added to cart! ${DISCOUNT > 0 ? `${(DISCOUNT * 100).toFixed(0)}% discount applied` : ""}` });
  };

  return (
    <div>
      <SEO
        title="Bundle Builder — Mix, Match & Save on Social Media Accounts"
        description="Build custom account bundles on OfficialUM1. Mix aged Reddit, Discord, Instagram, Snapchat, Telegram accounts and unlock automatic discounts. The more you buy, the more you save."
        keywords="account bundles, social media account packs, buy accounts in bulk, bundle discount, reddit bundle, discord bundle"
        breadcrumbs={makeSimpleBreadcrumbs({ name: "Bundle Builder", href: "/bundles" })}
        type="website"
      />
      {/* Hero */}
      <section className="py-16 px-4 text-center" style={{ background: "linear-gradient(180deg, rgba(16,185,129,0.06), transparent)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5 border" style={{ borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.07)", color: "#10b981" }}>
            <Tag className="w-3.5 h-3.5" /> Bundle Builder
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-4">Mix, Match & <span style={{ color: "#10b981" }}>Save</span></h1>
          <p className="text-muted-foreground text-lg mb-6">Pick any accounts you want. Build a custom bundle and unlock automatic discounts.</p>
          <div className="flex items-center justify-center gap-6 flex-wrap text-sm">
            {[
              { count: 2, label: "2 items", disc: "5% off", color: "#f59e0b" },
              { count: 3, label: "3+ items", disc: "15% off", color: "#10b981" },
              { count: 5, label: "Max 5 items", disc: "per bundle", color: "#4f7af5" },
            ].map(t => (
              <div key={t.count} className="flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold" style={{ borderColor: `${t.color}40`, background: `${t.color}10`, color: t.color }}>
                <Tag className="w-4 h-4" /> {t.label} → <strong>{t.disc}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">Available Products</h2>
              {selected.length > 0 && <span className="text-sm text-muted-foreground">{selected.length} selected</span>}
            </div>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <div key={i} className="h-40 rounded-2xl animate-pulse bg-muted" />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground rounded-2xl border border-border">
                No products available right now.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map(p => {
                  const isSel = !!selected.find(s => s.id === p.id);
                  return (
                    <button key={p.id} onClick={() => toggle(p)}
                      className="relative text-left rounded-2xl border p-4 transition-all duration-200 cursor-pointer"
                      style={{
                        background: isSel ? "rgba(16,185,129,0.06)" : "var(--card)",
                        borderColor: isSel ? "#10b981" : "var(--border)",
                        boxShadow: isSel ? "0 0 0 2px rgba(16,185,129,0.25)" : "none",
                      }}>
                      {isSel && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#10b981" }}>
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      {p.platform && (
                        <img src={`https://officialum1.com/icons/${p.platform?.toLowerCase()}.png`} alt={p.platform} className="w-10 h-10 object-contain mb-3 rounded-lg" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      )}
                      <p className="font-semibold text-sm mb-1 line-clamp-2 leading-snug">{p.title}</p>
                      <p className="font-black text-base" style={{ color: "#10b981" }}>${p.price}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bundle Summary */}
          <div>
            <div className="sticky top-24 rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-black text-lg mb-5 flex items-center gap-2">
                <Package className="w-5 h-5" style={{ color: "#10b981" }} /> Your Bundle
              </h3>

              {selected.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Select products to build your bundle
                </div>
              ) : (
                <div className="space-y-2 mb-5">
                  {selected.map(p => (
                    <div key={p.id} className="flex items-center justify-between gap-3 py-2 border-b border-border">
                      <span className="text-sm font-medium flex-1 truncate">{p.title}</span>
                      <span className="text-sm font-bold shrink-0">${p.price}</span>
                      <button onClick={() => toggle(p)} className="text-muted-foreground hover:text-red-500 transition shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Discount indicator */}
              <div className="space-y-2 text-sm mb-5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                </div>
                {DISCOUNT > 0 && (
                  <div className="flex justify-between font-semibold" style={{ color: "#10b981" }}>
                    <span>Bundle Discount ({(DISCOUNT * 100).toFixed(0)}%)</span>
                    <span>−${(subtotal * DISCOUNT).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-base pt-2 border-t border-border">
                  <span>Total</span><span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Progress bar */}
              {selected.length < 3 && (
                <div className="mb-5 p-3 rounded-xl text-xs font-semibold text-center" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                  {selected.length === 0 ? "Select 2 items for 5% off, 3 for 15%!" :
                    selected.length === 1 ? "Add 1 more item for 5% discount!" :
                      "Add 1 more item to unlock 15% discount!"}
                </div>
              )}

              <button onClick={addBundleToCart} disabled={selected.length < 2}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition disabled:opacity-40"
                style={{ background: "#10b981", boxShadow: selected.length >= 2 ? "0 6px 20px rgba(16,185,129,0.3)" : "none" }}>
                <ShoppingCart className="w-4 h-4" />
                {selected.length < 2 ? "Select at least 2 items" : `Add Bundle to Cart`}
                {DISCOUNT > 0 && <Zap className="w-4 h-4" />}
              </button>

              <Link href="/shop" className="block text-center text-xs text-muted-foreground hover:text-foreground mt-3 transition">
                Or shop individually →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
