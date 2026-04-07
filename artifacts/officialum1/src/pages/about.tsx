import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Zap, Users, Globe, ArrowRight, TrendingUp, Code2, Lock, ChevronDown, ChevronUp, Star, Target, Heart, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { makeSimpleBreadcrumbs, makeOrganizationSchema } from "@/lib/seo";

const PRIMARY = "#4f7af5";

const FAQ_ITEMS = [
  { q: "What exactly does OfficialUM1 do?", a: "OfficialUM1 operates across two verticals: a digital agency offering SEO, custom software, social media management, and growth services; and a digital marketplace where you can buy verified social media accounts, aged profiles, and bundled digital assets. Both services are built around transparency, security, and measurable results." },
  { q: "How do I know accounts are verified and safe?", a: "Every account in our marketplace goes through a 7-step verification process: age verification, engagement rate analysis, niche authenticity check, past ban history review, email/phone access confirmation, recovery option setup, and a final live-login test before delivery. We offer a 48-hour replacement guarantee on all accounts." },
  { q: "Do you offer custom packages or bulk orders?", a: "Absolutely. We serve agencies, resellers, and high-volume buyers regularly. Contact us via WhatsApp or the contact page for custom pricing, SLA agreements, and white-label options. Bulk orders (10+) receive a minimum 15% discount." },
  { q: "Is G2G.com integration active?", a: "Yes — OfficialUM1 is an active seller on G2G.com. Listings sync between our platform and G2G in real-time. If you prefer purchasing through G2G's escrow, search for OfficialUM1 on the platform. Prices are identical across both channels." },
  { q: "What payment methods do you accept?", a: "We accept Stripe (all major credit/debit cards), USDT (TRC-20 and ERC-20), Bitcoin, and direct bank transfer for larger orders. Wallet credits can be loaded and used for instant checkout. All transactions are logged and receipt-confirmed." },
  { q: "How fast is delivery after purchase?", a: "Digital accounts and pre-listed products are delivered within 1–24 hours after payment confirmation. Custom builds, agency services, and business formation packages have timelines outlined on each product page. We maintain a 99.9% on-time delivery rate." },
  { q: "Can I resell products from OfficialUM1?", a: "Yes. We have a formal reseller program with tiered discounts starting at 20% off for approved partners. Resellers get access to a dedicated account manager, bulk pricing sheets, and white-label delivery options. Apply via the contact form with 'Reseller Inquiry' in the subject." },
  { q: "What is your refund or replacement policy?", a: "We offer a 48-hour account replacement guarantee if an account stops working or doesn't match the listed specs. For agency/service orders, we revise until satisfied (up to 3 rounds included). Refund requests on services are handled case-by-case within 7 business days." },
];

const TIMELINE = [
  { year: "2020", title: "Foundation", desc: "OfficialUM1 launched from Sahiwal, Pakistan as a freelance digital services operation, primarily offering social media management and SEO." },
  { year: "2021", title: "Marketplace Expansion", desc: "Expanded into account marketplace with first 500 verified accounts. Built the first internal verification pipeline to ensure quality." },
  { year: "2022", title: "Platform Build", desc: "Developed a custom full-stack platform — moving away from third-party tools to own the entire customer experience." },
  { year: "2023", title: "G2G Partnership", desc: "Joined G2G.com as an official verified seller, expanding reach to a global buyer base. Volume crossed 2,000 fulfilled orders." },
  { year: "2024", title: "Global Scale", desc: "Launched multi-currency wallet system, reseller program, and white-label packages. Team expanded internationally." },
  { year: "2025", title: "Full Platform 2.0", desc: "Rebuilt entire platform with Next.js, Drizzle ORM, and real-time admin infrastructure. API integrations with G2G, Z2U, and PlayerUp." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border/40 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-200">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-foreground hover:bg-black/3 transition-colors gap-4"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="text-sm md:text-base">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 shrink-0 text-primary" /> : <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed bg-muted/20">
          <div className="pt-1">{a}</div>
        </div>
      )}
    </div>
  );
}

export function About() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Muhammad Umar Mumtaz",
    "alternateName": "Umar Mumtaz",
    "jobTitle": "Founder & CEO",
    "worksFor": {
      "@type": "Organization",
      "name": "OfficialUM1",
      "url": "https://officialum1.com"
    },
    "url": "https://officialum1.com/about",
    "sameAs": ["https://officialum1.com"],
    "knowsAbout": ["Digital Marketing", "SEO", "Social Media Accounts", "Full Stack Development", "Digital Agency", "Account Marketplace"],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Sahiwal",
      "addressCountry": "PK"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_ITEMS.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a }
    }))
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="About OfficialUM1 — Premium Digital Marketplace & Agency"
        description="OfficialUM1 is a global digital marketplace and agency founded by Muhammad Umar Mumtaz. 10k+ digital assets, 2.5k+ users, G2G verified seller, and full-stack agency services."
        keywords="about officialum1, digital agency, social media account marketplace, Muhammad Umar Mumtaz, G2G seller, digital products Pakistan"
        breadcrumbs={makeSimpleBreadcrumbs({ name: "About", href: "/about" })}
        schema={makeOrganizationSchema()}
      />

      {/* Extra JSON-LD schemas */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Hero */}
      <div className="pt-24 pb-16 border-b border-border/30 bg-card/20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
          <Badge variant="outline" className="text-primary border-primary/50 bg-primary/10 mb-4">About OfficialUM1</Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight mb-5 leading-tight">
            Where Digital Assets<br className="hidden sm:block" /> Meet Verified Growth
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            OfficialUM1 is a premium digital marketplace and agency — helping brands, creators, and entrepreneurs build authority, presence, and revenue in the digital economy.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs font-semibold">G2G Verified Seller</Badge>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 text-xs font-semibold">99.9% Success Rate</Badge>
            <Badge className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1 text-xs font-semibold">10,000+ Assets Delivered</Badge>
            <Badge className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1 text-xs font-semibold">Est. 2020</Badge>
          </div>
        </div>
      </div>

      {/* Stats */}
      <section className="border-b border-border/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10.0k+", label: "Digital Assets Delivered", color: "text-primary" },
              { value: "2.5k+", label: "Verified Buyers & Sellers", color: "text-emerald-600" },
              { value: "3.6k+", label: "Orders Fulfilled", color: "text-amber-600" },
              { value: "99.9%", label: "On-Time Success Rate", color: "text-purple-600" },
            ].map((s, i) => (
              <div key={i} className="space-y-1">
                <p className={`text-3xl sm:text-4xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission / Philosophy */}
      <section className="py-16 border-b border-border/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div>
                <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Our Philosophy</p>
                <h2 className="text-2xl sm:text-3xl font-black">We Build.&nbsp;&nbsp;You Grow.</h2>
              </div>
              <p className="text-muted-foreground text-base leading-relaxed">
                A digital presence shouldn't just exist — it should perform. Whether it's high-authority social assets, custom software, or full-service SEO, we handle the complexity so you can focus on results.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We operate at the intersection of technology and trust. Every asset is verified, every service is benchmarked, and every client relationship is built on transparent, measurable outcomes.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: TrendingUp, text: "Data-Driven Decision Making" },
                  { icon: Code2, text: "High-Performance Full-Stack Architecture" },
                  { icon: Lock, text: "Secure Asset Escrow & Verified Delivery" },
                  { icon: Globe, text: "G2G, Z2U & PlayerUp Marketplace Integration" },
                  { icon: Target, text: "Measurable ROI on Every Engagement" },
                  { icon: Heart, text: "Long-term Partnerships, Not One-Off Transactions" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-5">
              <div className="bg-card/50 border border-border/50 rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-3">Our Mission</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  To revolutionize the digital economy by providing transparent, scalable, and performance-first digital solutions. From verified social accounts to white-label agency packages — we are the single source for brands that demand excellence.
                </p>
              </div>

              <blockquote className="border-l-4 border-primary pl-5 py-2">
                <p className="text-muted-foreground italic text-sm leading-relaxed">
                  "OfficialUM1 isn't just an agency — it's a commitment to excellence. We don't just reach goals; we redefine what's possible."
                </p>
                <footer className="text-xs text-primary font-semibold mt-2">— Muhammad Umar Mumtaz, Founder</footer>
              </blockquote>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <ShieldCheck className="w-4 h-4" />, text: "100% Verified Assets" },
                  { icon: <Zap className="w-4 h-4" />, text: "1–24h Delivery" },
                  { icon: <Users className="w-4 h-4" />, text: "Dedicated Support" },
                  { icon: <Cpu className="w-4 h-4" />, text: "API-Connected Platform" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-xl border border-border/40 bg-card/30 text-sm">
                    <span className="text-primary">{item.icon}</span>
                    <span className="text-muted-foreground text-xs">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-16 bg-card/10 border-b border-border/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Leadership</p>
            <h2 className="text-2xl sm:text-3xl font-black">Meet the Founder</h2>
            <p className="text-muted-foreground text-sm mt-2 max-w-xl mx-auto">The story of OfficialUM1 is the story of one person's relentless belief that quality digital work should be accessible to everyone.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
            {/* Photo + Tags */}
            <div className="lg:col-span-2 flex flex-col items-center lg:items-start gap-6">
              <div className="relative">
                <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-xl bg-primary/10">
                  <img
                    src="https://officialum1.com/founder.jpg"
                    alt="Muhammad Umar Mumtaz — Founder of OfficialUM1"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-6xl font-black text-primary/40">U</div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <Star className="w-4 h-4 text-white fill-white" />
                </div>
              </div>

              <div className="text-center lg:text-left">
                <h3 className="text-xl font-bold text-foreground">Muhammad Umar Mumtaz</h3>
                <p className="text-primary font-semibold text-sm">Founder & CEO, OfficialUM1</p>
                <p className="text-xs text-muted-foreground mt-1">Sahiwal, Punjab, Pakistan 🇵🇰</p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {["Visionary Founder", "Full-Stack Dev", "SEO Strategist", "Marketplace Builder", "Growth Hacker"].map(tag => (
                  <Badge key={tag} variant="outline" className="text-primary border-primary/40 bg-primary/5 text-[10px]">{tag}</Badge>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/40 text-sm w-full max-w-xs">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">What he builds</p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {["Full-stack web platforms", "Account verification systems", "SEO content engines", "API marketplace integrations", "Digital product marketplaces"].map(item => (
                    <li key={item} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bio + Timeline */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">From Sahiwal to Global Scale</h3>
                <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
                  <p>
                    Muhammad Umar Mumtaz launched OfficialUM1 in 2020 from Sahiwal, Pakistan, with a clear thesis: the digital economy was ripe for a platform that combined the trust of a marketplace with the quality of an agency. Most platforms delivered one or the other — OfficialUM1 was built to deliver both.
                  </p>
                  <p>
                    Umar holds deep expertise in full-stack development (React, Node.js, Express, Drizzle ORM), SEO strategy, social media account verification, and API marketplace integration. He personally built the verification pipeline that now underpins every account sold on OfficialUM1.
                  </p>
                  <p>
                    By 2023, OfficialUM1 had become a verified seller on G2G.com — one of the world's largest digital goods marketplaces — and had fulfilled over 2,000 verified orders. Today, the platform serves clients across 40+ countries and has expanded into a full agency offering including custom software, white-label social management, and business formation services.
                  </p>
                  <p>
                    Umar's approach is methodical: build for durability, verify everything, and never let the platform outpace its quality controls. This philosophy has resulted in a 99.9% success rate and a growing body of repeat clients who have made OfficialUM1 their primary digital growth partner.
                  </p>
                </div>
              </div>

              <blockquote className="border-l-4 border-primary pl-5 py-2">
                <p className="text-muted-foreground italic text-sm">
                  "Every feature I add to OfficialUM1 starts with one question: does this make life easier and more profitable for our clients? If the answer is yes, we build it. If it's a nice-to-have, we wait."
                </p>
              </blockquote>

              {/* Timeline */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Company Timeline</p>
                <div className="space-y-4">
                  {TIMELINE.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-primary-foreground shrink-0" style={{ background: PRIMARY }}>{item.year.slice(-2)}</div>
                        {i < TIMELINE.length - 1 && <div className="w-0.5 flex-1 bg-border/50 mt-1" />}
                      </div>
                      <div className="pb-4">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-primary">{item.year}</span>
                          <span className="text-sm font-bold text-foreground">{item.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services overview */}
      <section className="py-16 border-b border-border/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">What We Offer</p>
            <h2 className="text-2xl sm:text-3xl font-black">Two Powerhouses. One Platform.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: "🛒",
                title: "Digital Marketplace",
                subtitle: "Buy Verified Accounts & Assets",
                points: ["Instagram, TikTok, YouTube, Twitter accounts", "Aged & niche-specific profiles", "G2G & Z2U verified inventory", "Bulk order & reseller pricing", "48-hour replacement guarantee"],
                cta: { label: "Browse Shop", href: "/shop" },
                color: "from-blue-50 to-purple-50",
                border: "border-blue-200/60",
              },
              {
                icon: "⚡",
                title: "Digital Agency",
                subtitle: "Strategy, Software & Growth",
                points: ["Social media management & growth", "SEO, content strategy & link building", "Custom web platforms & APIs", "Business formation services", "White-label packages for agencies"],
                cta: { label: "View Services", href: "/services" },
                color: "from-emerald-50 to-teal-50",
                border: "border-emerald-200/60",
              },
            ].map((s, i) => (
              <div key={i} className={`rounded-2xl p-6 bg-gradient-to-br ${s.color} border ${s.border}`}>
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="text-lg font-bold text-foreground mb-0.5">{s.title}</h3>
                <p className="text-primary text-sm font-semibold mb-4">{s.subtitle}</p>
                <ul className="space-y-2 mb-6">
                  {s.points.map((p, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="text-primary text-xs">✓</span> {p}
                    </li>
                  ))}
                </ul>
                <Link href={s.cta.href}>
                  <Button size="sm" variant="outline" className="text-primary border-primary/30 hover:bg-primary hover:text-white transition-all">
                    {s.cta.label} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-b border-border/30 bg-card/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">FAQ</p>
            <h2 className="text-2xl sm:text-3xl font-black">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-sm mt-2">Everything you need to know before working with OfficialUM1.</p>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground mb-3">Still have questions?</p>
            <Link href="/contact">
              <Button variant="outline" size="sm" className="text-primary border-primary/30 hover:bg-primary hover:text-white transition-all">
                Contact Us <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl p-10 sm:p-14 text-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${PRIMARY}15, ${PRIMARY}08)`, border: `1px solid ${PRIMARY}30` }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="relative">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4 text-xs">Ready to Start?</Badge>
              <h2 className="text-2xl sm:text-3xl font-black mb-4">Elevate Your Digital Presence</h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-base">
                Join 2,500+ buyers and sellers who trust OfficialUM1 for verified assets, professional agency services, and a platform built for growth.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/services">
                  <Button size="lg" className="font-semibold px-8">
                    Our Services <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button size="lg" variant="outline" className="font-semibold px-8 border-primary/30 text-primary hover:bg-primary hover:text-white">
                    Browse Marketplace
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
