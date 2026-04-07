import React from "react";
import { useGetPublicStats, useGetFeaturedProducts, useGetRecentOrders, useListServices, useListReviews, useListBlogs } from "@workspace/api-client-react";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { makeOrganizationSchema, makeWebSiteSchema, makeFAQSchema, SITE_URL } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight, Star, ShoppingCart, CheckCircle, Quote,
  Shield, Zap, RefreshCcw, TrendingUp, Users, Package,
  Instagram, Twitter, Youtube, MessageCircle, Linkedin, Hash
} from "lucide-react";

const PLATFORM_META: Record<string, { icon: React.ReactNode; color: string; bg: string; img?: string }> = {
  Snapchat: {
    icon: <TrendingUp className="w-6 h-6" />,
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
    img: "https://officialum1.com/icons/snapchat.png",
  },
  Instagram: {
    icon: <Instagram className="w-6 h-6" />,
    color: "text-pink-600",
    bg: "bg-pink-50 border-pink-200",
    img: "https://officialum1.com/icons/instagram.png",
  },
  Twitter: {
    icon: <Twitter className="w-6 h-6" />,
    color: "text-sky-600",
    bg: "bg-sky-50 border-sky-200",
    img: "https://officialum1.com/icons/twitter.png",
  },
  YouTube: {
    icon: <Youtube className="w-6 h-6" />,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    img: "https://officialum1.com/icons/youtube.png",
  },
  Discord: {
    icon: <MessageCircle className="w-6 h-6" />,
    color: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-200",
    img: "https://cdn-icons-png.flaticon.com/512/5968/5968756.png",
  },
  Reddit: {
    icon: <Hash className="w-6 h-6" />,
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
    img: "https://officialum1.com/icons/reddit.png",
  },
  Telegram: {
    icon: <MessageCircle className="w-6 h-6" />,
    color: "text-blue-500",
    bg: "bg-blue-50 border-blue-200",
    img: "https://officialum1.com/icons/telegram.png",
  },
  TikTok: {
    icon: <TrendingUp className="w-6 h-6" />,
    color: "text-fuchsia-600",
    bg: "bg-fuchsia-50 border-fuchsia-200",
    img: "https://officialum1.com/icons/tiktok.png",
  },
  LinkedIn: {
    icon: <Linkedin className="w-6 h-6" />,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
};

function getPlatformMeta(platform?: string | null) {
  if (!platform) return { icon: <Package className="w-6 h-6" />, color: "text-primary", bg: "bg-primary/10 border-primary/20", img: undefined };
  const key = Object.keys(PLATFORM_META).find(k => platform.toLowerCase().includes(k.toLowerCase()));
  return key ? PLATFORM_META[key] : { icon: <Package className="w-6 h-6" />, color: "text-primary", bg: "bg-primary/10 border-primary/20", img: undefined };
}

const TRUST_BADGES = [
  { icon: <Shield className="w-5 h-5 text-primary" />, label: "Escrow Protected" },
  { icon: <Zap className="w-5 h-5 text-primary" />, label: "Instant Delivery" },
  { icon: <RefreshCcw className="w-5 h-5 text-primary" />, label: "Replacement Guarantee" },
  { icon: <Users className="w-5 h-5 text-primary" />, label: "1700+ Happy Clients" },
];

export function Home() {
  const { data: stats } = useGetPublicStats();
  const { data: featuredProducts, isLoading: featuredLoading } = useGetFeaturedProducts();
  const { data: recentOrders } = useGetRecentOrders();
  const { data: services } = useListServices();
  const { data: reviews } = useListReviews({ limit: 6 });
  const { data: blogs } = useListBlogs({ limit: 3 });

  const homeFAQs = [
    { question: "What is OfficialUM1?", answer: "OfficialUM1 is a premium digital marketplace and agency. We sell aged, verified social media accounts and offer SEO, web development, and US business formation services." },
    { question: "How fast is delivery?", answer: "Digital accounts are delivered instantly after payment — credentials go straight to your dashboard and email. No waiting." },
    { question: "Are the accounts safe and verified?", answer: "Yes. Every account is manually verified before listing. We check account age, activity history, and credentials. A replacement guarantee is included on every purchase." },
    { question: "What payment methods do you accept?", answer: "We accept Credit/Debit Cards via Stripe, Binance Pay, and Cryptocurrency (USDT, BTC, ETH) via Cryptomus." },
    { question: "Can I sell my account on OfficialUM1?", answer: "Yes. Navigate to the Shop page and click 'Sell Accounts' to submit your account for review. Our team evaluates and lists approved accounts." },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <SEO
        title="Premium Digital Marketplace & Agency"
        description="Buy aged, verified social media accounts instantly — Reddit, Instagram, Discord, Snapchat, Telegram, YouTube & more. Plus expert SEO, web development, and US business formation services. 1700+ happy clients."
        keywords="buy social media accounts, aged accounts for sale, reddit account for sale, discord account, instagram account, digital marketplace, SEO agency, web development"
        schema={[makeOrganizationSchema(), makeWebSiteSchema(), makeFAQSchema(homeFAQs)]}
      />

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-16">
        <div className="hero-glow absolute inset-0 pointer-events-none" />

        {/* Decorative grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "60px 60px" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs sm:text-sm font-medium mb-6 sm:mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Digital Infrastructure For Fast-Moving Brands
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[82px] font-black tracking-tight mb-4 sm:mb-6 leading-[1.05]">
            <span className="text-foreground">Build a cleaner, faster,</span>
            <br />
            <span className="gradient-text">more trusted digital presence.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl sm:max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            From premium digital products to SEO, web delivery, and US business setup, OfficialUM1 gives you one polished ecosystem instead of scattered tools.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-14">
            <Link href="/shop">
              <Button size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                Browse Shop <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/services">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all">
                Explore Services
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            {TRUST_BADGES.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                {b.icon}
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-40">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-primary" />
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-y border-border/40 bg-card/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            {[
              { value: "1,471+", label: "Projects Delivered" },
              { value: "4.9★", label: "Client Satisfaction" },
              { value: "4.8k+", label: "Orders Processed" },
              { value: "24/7", label: "Support Coverage" },
            ].map((s, i) => (
              <div key={i} className="group">
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-primary tabular-nums">{s.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mt-1 sm:mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Value Props ── */}
      <section className="section-pad border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Why teams stay with us</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">One partner for products, growth, and setup.</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm sm:text-base">
              Instead of juggling different vendors, you can manage digital assets, business services, and support from one place.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: "💻", title: "Digital services", desc: "SEO, automation, and web delivery" },
              { icon: "✅", title: "Verified products", desc: "Curated accounts and subscriptions" },
              { icon: "🏢", title: "US business hub", desc: "Formation, compliance, and support" },
              { icon: "💬", title: "Responsive support", desc: "Clear communication when issues happen" },
            ].map((item, i) => (
              <div key={i} className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/40 transition-all group">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live ticker ── */}
      {recentOrders && recentOrders.length > 0 && (
        <div className="bg-primary/5 border-b border-border/30 py-2.5 overflow-hidden relative">
          <div className="flex items-center">
            <div className="shrink-0 flex items-center gap-2 px-4 text-xs font-bold text-primary border-r border-primary/20 mr-4 whitespace-nowrap">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              LIVE
            </div>
            <div className="flex gap-8 animate-marquee whitespace-nowrap">
              {[...recentOrders, ...recentOrders].map((order, i) => (
                <span key={i} className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="text-muted-foreground">{order.timeAgo}</span>
                  <span className="text-border">·</span>
                  <span className="font-medium text-foreground">{order.productName}</span>
                  {order.platform && <span className="text-[10px] px-1.5 py-0.5 rounded bg-border/50 text-muted-foreground">{order.platform}</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Featured Products ── */}
      <section className="section-pad">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
            <div>
              <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Featured Access</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">Curated Best Sellers</h2>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">Premium products, cleaner cards, and faster buying decisions.</p>
            </div>
            <Link href="/shop" className="shrink-0">
              <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2 border-border/60 hover:border-primary/40">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredLoading ? (
              [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-72 w-full rounded-2xl" />)
            ) : (
              featuredProducts?.map((product) => {
                const meta = getPlatformMeta(product.platform);
                return (
                  <Link key={product.id} href={`/shop/${product.id}`} className="group">
                    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full">
                      {/* Platform icon block */}
                      <div className={`h-32 sm:h-36 flex items-center justify-center border-b border-border/30 ${meta.bg}`}>
                        <div className="group-hover:scale-110 transition-all duration-300">
                          {meta.img ? (
                            <img src={meta.img} alt={product.platform ?? product.name} className="w-12 h-12 sm:w-14 sm:h-14 object-contain" onError={(e) => {
                              const el = e.target as HTMLImageElement;
                              el.style.display = "none";
                            }} />
                          ) : (
                            <div className={`${meta.color} opacity-80 group-hover:opacity-100`}>
                              {React.cloneElement(meta.icon as React.ReactElement, { className: "w-12 h-12 sm:w-14 sm:h-14" })}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4 flex flex-col flex-1 gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color}`}>
                            {product.category}
                          </span>
                          {product.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/20">
                              {product.badge}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight flex-1">
                          {product.name}
                        </h3>

                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/30">
                          <div>
                            <span className="text-lg sm:text-xl font-black text-primary">${Number(product.price).toFixed(2)}</span>
                            {product.originalPrice && (
                              <span className="text-xs text-muted-foreground line-through ml-1.5">${Number(product.originalPrice).toFixed(2)}</span>
                            )}
                          </div>
                          {product.rating && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="w-3 h-3 fill-primary text-primary" />
                              <span className="font-semibold text-foreground">{product.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ── US Business Hub ── */}
      <section className="section-pad bg-card/10 border-y border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">US Business Hub</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">Scale beyond local borders with a cleaner setup path.</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-sm sm:text-base">
              We help you build a practical US business setup, from formation and EIN support to registered-agent service and compliance follow-through.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: "🌐", title: "Global Identity", desc: "Step-by-step formation support for Wyoming, Delaware, and other non-resident-friendly states." },
                { icon: "🧾", title: "Tax & EIN", desc: "Get EIN and tax setup handled with a cleaner process and less back-and-forth." },
                { icon: "📬", title: "Registered Agent", desc: "Keep legal mail and compliance notices routed through a dependable registered-agent layer." },
                { icon: "✅", title: "Compliance", desc: "Stay on top of annual filings, reminders, and follow-through without manual chaos." },
              ].map((item, i) => (
                <div key={i} className="bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/40 transition-all">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="font-bold text-sm text-foreground mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8">
              <h3 className="font-bold text-lg mb-1">Formation Pricing Explorer</h3>
              <p className="text-sm text-muted-foreground mb-6">Compare the most common setup routes</p>
              <div className="space-y-4">
                {[
                  { state: "Wyoming Formation", tag: "Global Standard", fee: "$100", total: "$220 est." },
                  { state: "Delaware Formation", tag: "Startup Favorite", fee: "$90", total: "$210 est." },
                  { state: "Texas Formation", tag: "Enterprise Choice", fee: "$300", total: "$420 est." },
                ].map((plan, i) => (
                  <div key={i} className="border border-border/50 rounded-xl p-4 hover:border-primary/40 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-sm text-foreground">{plan.state}</p>
                        <p className="text-xs text-muted-foreground">{plan.tag}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">{plan.tag}</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>{plan.fee} State Fee &nbsp;·&nbsp; OfficialUM1 fee: $20 &nbsp;·&nbsp; Registered agent: $100</p>
                      <p className="font-semibold text-foreground">Total: {plan.total}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/services/form-business" className="block mt-6">
                <Button className="w-full">Launch Your Business <ArrowRight className="ml-2 w-4 h-4" /></Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Platforms strip ── */}
      <section className="py-8 border-y border-border/30 bg-card/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs text-muted-foreground uppercase tracking-widest mb-6">Platforms We Cover</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {Object.entries(PLATFORM_META).map(([name, meta]) => (
              <Link key={name} href={`/shop?category=${name}`} className="flex flex-col items-center gap-1.5 group">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center transition-all group-hover:scale-110 ${meta.bg}`}>
                  <span className={meta.color}>{React.cloneElement(meta.icon as React.ReactElement, { className: "w-5 h-5 sm:w-6 sm:h-6" })}</span>
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground group-hover:text-foreground transition-colors">{name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="section-pad bg-card/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Digital Agency</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3">Expert Digital Services</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
              Our team of specialists helps brands grow through SEO, web development, and social media management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {services?.slice(0, 3).map(service => (
              <div key={service.id} className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/40 transition-all group flex flex-col gap-4">
                <div className="text-3xl">{service.icon}</div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">{service.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{service.description}</p>
                </div>
                <ul className="space-y-2 flex-1">
                  {service.features.slice(0, 4).map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="pt-3 border-t border-border/40">
                  <span className="text-xs text-muted-foreground">Starting from </span>
                  <span className="text-primary font-bold text-sm">{service.price}</span>
                </div>
                <Link href={`/contact?service=${encodeURIComponent(service.title)}`}>
                  <Button variant="outline" size="sm" className="w-full border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all">
                    Get a Quote
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-10">
            <Link href="/services">
              <Button size="lg" className="px-8 font-semibold">
                All Services <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section className="section-pad">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
            <div>
              <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Why OfficialUM1</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-5">The Safest Way to Buy Digital Accounts</h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-8">
                We've been in the business since 2019 serving thousands of clients worldwide. Every account is hand-verified and sold with our escrow protection and replacement guarantee.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: <Shield className="w-5 h-5 text-primary" />, title: "Escrow Protection", desc: "Your payment is held securely until delivery is confirmed." },
                  { icon: <Zap className="w-5 h-5 text-primary" />, title: "Fast Delivery", desc: "Most orders delivered within 24 hours of purchase." },
                  { icon: <RefreshCcw className="w-5 h-5 text-primary" />, title: "Replacement Policy", desc: "If an account has issues we replace it, no questions asked." },
                  { icon: <CheckCircle className="w-5 h-5 text-primary" />, title: "Verified Quality", desc: "All accounts are hand-checked before listing." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 p-4 rounded-xl border border-border/40 bg-card/30 hover:border-primary/30 transition-all">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">{item.icon}</div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { emoji: "🔥", stat: "1,800+", label: "Orders" },
                { emoji: "⭐", stat: "4.8/5", label: "Rating" },
                { emoji: "🛡️", stat: "100%", label: "Secure" },
                { emoji: "⚡", stat: "24h", label: "Delivery" },
              ].map((card, i) => (
                <div key={i} className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 text-center hover:border-primary/30 transition-all group">
                  <div className="text-3xl sm:text-4xl mb-3">{card.emoji}</div>
                  <p className="text-2xl sm:text-3xl font-black text-primary">{card.stat}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 uppercase tracking-wider">{card.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      {reviews && reviews.length > 0 && (
        <section className="section-pad bg-card/10 border-y border-border/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
              <div>
                <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Testimonials</p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">What Our Clients Say</h2>
              </div>
              <Link href="/reviews">
                <Button variant="outline" size="sm" className="gap-2 border-border/60 w-full sm:w-auto">
                  All Reviews <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-card border border-border/50 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 hover:border-primary/30 transition-all">
                  <Quote className="w-6 h-6 text-primary/40 shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{review.content}"</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-border/30">
                    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                      {review.author?.charAt(0).toUpperCase() ?? "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{review.author ?? "Anonymous"}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < (review.rating ?? 5) ? "fill-primary text-primary" : "fill-border text-border"}`} />
                        ))}
                      </div>
                    </div>
                    {review.platform && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-border/50 text-muted-foreground shrink-0">{review.platform}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Blog ── */}
      {blogs && blogs.length > 0 && (
        <section className="section-pad">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
              <div>
                <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Blog</p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">Latest Insights</h2>
              </div>
              <Link href="/blog">
                <Button variant="outline" size="sm" className="gap-2 border-border/60 w-full sm:w-auto">
                  All Posts <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {blogs.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                  <div className="bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/40 transition-all flex flex-col h-full">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="h-40 sm:h-44 object-cover w-full" />
                    ) : (
                      <div className="h-36 sm:h-40 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <TrendingUp className="w-10 h-10 text-primary/30" />
                      </div>
                    )}
                    <div className="p-4 sm:p-5 flex flex-col gap-2 flex-1">
                      {post.category && (
                        <span className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wider">{post.category}</span>
                      )}
                      <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug flex-1">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/30">
                        <span className="text-xs text-muted-foreground">{post.author}</span>
                        <span className="text-xs text-primary font-medium group-hover:underline">Read →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="section-pad">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card overflow-hidden p-8 sm:p-12 md:p-16 text-center">
            <div className="absolute inset-0 hero-glow opacity-60 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-3">Get Started Today</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground mb-4">
                Ready to Scale Your<br className="hidden sm:block" /> Digital Presence?
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-sm sm:text-base">
                Join thousands of businesses and individuals who trust OfficialUM1 for their digital growth.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link href="/shop">
                  <Button size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-8 font-bold text-base shadow-lg shadow-primary/20">
                    Browse Marketplace <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-8 border-border/60 hover:border-primary/40">
                    Talk to Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
