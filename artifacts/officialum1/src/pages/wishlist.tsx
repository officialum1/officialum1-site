import { Link } from "wouter";
import { Heart, ShoppingCart, Trash2, ArrowRight, Package } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useToast } from "@/hooks/use-toast";

export function Wishlist() {
  const { items, remove, count } = useWishlist();
  const { toast } = useToast();

  const addToCart = (item: any) => {
    const cart = JSON.parse(localStorage.getItem("um1_cart") || "[]");
    if (!cart.find((c: any) => c.id === item.id)) {
      cart.push({ ...item, qty: 1 });
      localStorage.setItem("um1_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("storage"));
    }
    remove(item.id);
    toast({ title: "Moved to cart!", description: item.title });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/shop"><span className="hover:text-foreground transition cursor-pointer">Shop</span></Link>
            <span>/</span>
            <span>Wishlist</span>
          </div>
          <h1 className="text-3xl font-black flex items-center gap-2">
            <Heart className="w-7 h-7 fill-red-500 text-red-500" />
            Your Wishlist
            {count > 0 && <span className="text-lg font-bold text-muted-foreground">({count})</span>}
          </h1>
        </div>
        <Link href="/shop">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-black/5 transition">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>

      {count === 0 ? (
        <div className="text-center py-24 rounded-3xl border border-border bg-card">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(239,68,68,0.1)" }}>
            <Heart className="w-9 h-9 text-red-400" />
          </div>
          <h2 className="text-2xl font-black mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-7">Save items you love so you can find them later.</p>
          <Link href="/shop">
            <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white" style={{ background: "#4f7af5" }}>
              <Package className="w-4 h-4" /> Browse Shop <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(item => (
            <div key={item.id} className="rounded-2xl border border-border bg-card overflow-hidden group hover:shadow-lg transition-all duration-200">
              {item.image && (
                <div className="h-36 overflow-hidden bg-muted">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              {!item.image && item.platform && (
                <div className="h-36 flex items-center justify-center text-5xl" style={{ background: "rgba(79,122,245,0.05)" }}>
                  <img src={`https://officialum1.com/icons/${item.platform?.toLowerCase()}.png`} alt={item.platform} className="w-16 h-16 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
              <div className="p-4">
                {item.platform && (
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-2 inline-block" style={{ background: "rgba(79,122,245,0.1)", color: "#4f7af5" }}>
                    {item.platform}
                  </span>
                )}
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{item.title}</h3>
                <p className="text-lg font-black mb-4" style={{ color: "#4f7af5" }}>${item.price}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => addToCart(item)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                    style={{ background: "#4f7af5" }}>
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </button>
                  <button
                    onClick={() => remove(item.id)}
                    className="p-2.5 rounded-xl border border-border hover:border-red-300 hover:bg-red-50 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
