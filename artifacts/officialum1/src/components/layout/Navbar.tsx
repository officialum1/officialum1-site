import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, useGetCart, useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, ShoppingCart, User, LogOut, LayoutDashboard, Ticket, FileText, X, ChevronRight, ChevronDown, Heart, Package, Wand2, BookOpen, HelpCircle, Star, Briefcase } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useWishlist } from "@/hooks/useWishlist";

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

const moreLinks = [
  { label: "Reviews", href: "/reviews", icon: Star, group: "Discover" },
  { label: "Bundle Builder", href: "/bundles", icon: Package, group: "Discover" },
  { label: "Account Builder", href: "/builder", icon: Wand2, group: "Discover" },
  { label: "Knowledge Base", href: "/kb", icon: BookOpen, group: "Help" },
  { label: "FAQ", href: "/faq", icon: HelpCircle, group: "Help" },
  { label: "Contact", href: "/contact", icon: Briefcase, group: "Help" },
];

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { data: user } = useGetMe({ query: { retry: false } });
  const { data: cart } = useGetCart();
  const logout = useLogout();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { count: wishlistCount } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setMoreOpen(false); }, [location]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("um1_token");
        queryClient.setQueryData(["/api/users/me"], null);
        toast({ title: "Logged out", description: "See you soon!" });
        setLocation("/");
      }
    });
  };

  const cartCount = cart?.itemCount ?? 0;

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-white/80 backdrop-blur-sm border-b border-border/50"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <img src="/logo.jpg" alt="OfficialUM1" className="h-10 w-auto" style={{ mixBlendMode: "multiply" }} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location === link.href
                    ? "text-primary bg-primary/10 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* More dropdown */}
            <div ref={moreRef} className="relative">
              <button
                onClick={() => setMoreOpen(o => !o)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  moreLinks.some(l => location === l.href)
                    ? "text-primary bg-primary/10 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5"
                }`}
              >
                More <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${moreOpen ? "rotate-180" : ""}`} />
              </button>
              {moreOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-56 rounded-2xl border border-border bg-white shadow-xl z-50 overflow-hidden">
                  {["Discover", "Help"].map((group, gi) => (
                    <div key={group}>
                      {gi > 0 && <div className="border-t border-border/60 mx-3" />}
                      <div className="px-4 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{group}</div>
                      {moreLinks.filter(l => l.group === group).map(link => {
                        const Icon = link.icon;
                        return (
                          <Link key={link.href} href={link.href}
                            className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors hover:bg-black/5 ${location === link.href ? "text-primary bg-primary/5" : "text-foreground"}`}>
                            <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            {link.label}
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                  <div className="px-4 py-3 border-t border-border/60">
                    <Link href="/shop" className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-bold text-primary-foreground transition-all" style={{ background: "linear-gradient(135deg, #4f7af5, #06b6d4)" }}>
                      🛒 Browse Full Marketplace
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">

            {/* Wishlist */}
            <Link href="/wishlist">
              <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-black/5 transition-all">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
                    {wishlistCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Cart trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-black/5 transition-all">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
                      {cartCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white border-l border-border w-full sm:max-w-[400px] flex flex-col">
                <SheetHeader className="border-b border-border pb-4">
                  <SheetTitle className="flex items-center gap-2 text-foreground">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    Cart {cartCount > 0 && <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">{cartCount} items</span>}
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-4">
                  {cart?.items?.length ? (
                    <div className="space-y-3">
                      {cart.items.map((item) => (
                        <div key={item.productId} className="flex gap-3 p-3 bg-muted/50 rounded-xl border border-border">
                          <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">{item.name}</p>
                            <p className="text-primary font-bold text-sm mt-1">${Number(item.price).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
                      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                        <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Your cart is empty</p>
                        <p className="text-sm text-muted-foreground mt-1">Browse the marketplace to get started</p>
                      </div>
                      <Link href="/shop">
                        <Button size="sm" className="mt-2">Browse Shop</Button>
                      </Link>
                    </div>
                  )}
                </div>

                {cart?.items?.length ? (
                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Subtotal</span>
                      <span className="text-xl font-black text-primary">${cart.total.toFixed(2)}</span>
                    </div>
                    <Button className="w-full h-12 font-semibold text-base" onClick={() => setLocation("/cart")}>
                      Checkout <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                    <Link href="/cart" className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                      View full cart
                    </Link>
                  </div>
                ) : null}
              </SheetContent>
            </Sheet>

            {/* Auth — desktop */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden md:flex items-center gap-2 h-9 px-3 rounded-lg border border-border hover:border-primary/40 hover:bg-black/5 transition-all text-sm font-medium">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center">
                      <User className="w-3 h-3 text-primary" />
                    </div>
                    <span className="truncate max-w-[100px] text-foreground">{user.name?.split(" ")[0]}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border-border shadow-lg">
                  <div className="px-3 py-2 border-b border-border/50">
                    <p className="text-xs text-muted-foreground">Signed in as</p>
                    <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuItem asChild className="cursor-pointer gap-2">
                    <Link href="/dashboard"><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer gap-2">
                    <Link href="/my-orders"><FileText className="w-4 h-4" /> My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer gap-2">
                    <Link href="/wishlist"><Heart className="w-4 h-4" /> Wishlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer gap-2">
                    <Link href="/support"><Ticket className="w-4 h-4" /> Support</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="h-9 px-4 text-foreground hover:bg-black/5">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="h-9 px-4 font-semibold">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/5 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-[80vw] max-w-[320px] bg-white border-l border-border flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <img src="/logo.jpg" alt="OfficialUM1" className="h-9 w-auto" style={{ mixBlendMode: "multiply" }} />
              </div>
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/5">
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-0.5">
              <Link href="/" className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${location === "/" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-black/5"}`}>
                Home <ChevronRight className="w-4 h-4 opacity-40" />
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${location === link.href ? "bg-primary/10 text-primary" : "text-foreground hover:bg-black/5"}`}
                >
                  {link.label} <ChevronRight className="w-4 h-4 opacity-40" />
                </Link>
              ))}
              <div className="pt-2 pb-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">More Pages</p>
              </div>
              {moreLinks.map(link => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${location === link.href ? "bg-primary/10 text-primary" : "text-foreground hover:bg-black/5"}`}>
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    {link.label}
                  </Link>
                );
              })}
              <Link href="/wishlist" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${location === "/wishlist" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-black/5"}`}>
                <Heart className="w-4 h-4 text-muted-foreground" /> Wishlist {wishlistCount > 0 && <span className="ml-auto text-xs font-bold text-red-500">{wishlistCount}</span>}
              </Link>
              <Link href="/bundles" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${location === "/bundles" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-black/5"}`}>
                <Package className="w-4 h-4 text-muted-foreground" /> Bundle Builder
              </Link>
            </nav>

            <div className="p-4 border-t border-border space-y-2">
              {user ? (
                <>
                  <div className="px-3 py-2 rounded-xl bg-muted mb-3">
                    <p className="text-xs text-muted-foreground">Signed in as</p>
                    <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
                  </div>
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" /> Logout
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login">
                    <Button variant="outline" className="w-full" size="sm">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full font-semibold" size="sm">Create Account</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
