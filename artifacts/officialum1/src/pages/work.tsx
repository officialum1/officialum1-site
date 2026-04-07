import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, ExternalLink, TrendingUp, Star, Zap } from "lucide-react";
import { SEO } from "@/components/SEO";
import { makeSimpleBreadcrumbs } from "@/lib/seo";

const CASE_STUDIES = [
  {
    id: 1, category: "SEO Campaign", title: "E-Commerce Brand — 340% Traffic Growth",
    description: "Full-scale SEO strategy covering technical audits, 200+ backlinks, and 60 optimised landing pages for a US e-commerce brand.",
    metrics: [{ label: "Organic Traffic", value: "+340%" }, { label: "Keywords Ranked", value: "1,200+" }, { label: "Timeline", value: "6 months" }],
    tags: ["SEO", "Content", "Link Building"], color: "#4f7af5",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2, category: "Web Design", title: "FinTech Dashboard — Full UI Overhaul",
    description: "Redesigned a complex analytics dashboard from the ground up — improving usability scores by 88% and cutting bounce rate in half.",
    metrics: [{ label: "UX Score", value: "+88%" }, { label: "Bounce Rate", value: "−51%" }, { label: "Timeline", value: "4 weeks" }],
    tags: ["UI/UX", "React", "Dashboard"], color: "#10b981",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3, category: "Social Media", title: "Creator Brand — 0 to 100K Followers",
    description: "Built and scaled a personal brand from zero using targeted content calendars, engagement loops, and cross-platform distribution.",
    metrics: [{ label: "Followers Gained", value: "100K+" }, { label: "Avg. Engagement", value: "8.4%" }, { label: "Timeline", value: "9 months" }],
    tags: ["Social Media", "Content", "Branding"], color: "#8b5cf6",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4, category: "Account Marketplace", title: "Scaling a Marketplace to $200K ARR",
    description: "Provided premium account inventory and marketplace infrastructure for a reseller scaling from side project to full business.",
    metrics: [{ label: "ARR Reached", value: "$200K" }, { label: "Accounts Sold", value: "3,000+" }, { label: "Timeline", value: "12 months" }],
    tags: ["Marketplace", "Accounts", "Growth"], color: "#f59e0b",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5, category: "Link Building", title: "SaaS Startup — Domain Authority 12 → 48",
    description: "Executed a 6-month link-building campaign securing 180+ editorial placements on DR50+ sites in the tech and B2B space.",
    metrics: [{ label: "DA Increase", value: "12 → 48" }, { label: "Backlinks Built", value: "180+" }, { label: "Timeline", value: "6 months" }],
    tags: ["Link Building", "PR", "SEO"], color: "#ec4899",
    image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6, category: "Automation", title: "Agency — Custom CRM & Workflow Automation",
    description: "Built a bespoke CRM and workflow automation system connecting Slack, Notion, and Stripe — saving 20+ hours per week.",
    metrics: [{ label: "Hours Saved/Week", value: "20+" }, { label: "Tools Integrated", value: "8" }, { label: "Timeline", value: "3 weeks" }],
    tags: ["Automation", "CRM", "Integrations"], color: "#06b6d4",
    image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
];

const ALL_TAGS = ["All", ...Array.from(new Set(CASE_STUDIES.flatMap(c => c.tags)))];

export function Work() {
  const [activeTag, setActiveTag] = useState("All");
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(d => Array.isArray(d) && setProjects(d)).catch(() => {});
  }, []);

  const filtered = activeTag === "All" ? CASE_STUDIES : CASE_STUDIES.filter(c => c.tags.includes(activeTag));

  return (
    <div>
      <SEO
        title="Our Work — OfficialUM1 Case Studies & Portfolio"
        description="Explore OfficialUM1 case studies: 340% traffic growth, 6-figure brand launches, and viral content campaigns. Real results for real clients."
        keywords="officialum1 portfolio, digital agency case studies, SEO results, web development portfolio, brand growth"
        breadcrumbs={makeSimpleBreadcrumbs({ name: "Our Work", href: "/work" })}
        type="website"
      />
      {/* Hero */}
      <section className="py-24 px-4 text-center" style={{ background: "linear-gradient(180deg, rgba(79,122,245,0.05), transparent)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5 border" style={{ borderColor: "rgba(79,122,245,0.3)", background: "rgba(79,122,245,0.07)", color: "#4f7af5" }}>
            <TrendingUp className="w-3.5 h-3.5" /> Selected Work
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-5">Results That <span style={{ color: "#4f7af5" }}>Speak</span> For Themselves</h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto mb-8">Real case studies. Real numbers. See how OfficialUM1 has helped brands and creators scale their digital presence.</p>
          <Link href="/services">
            <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white transition" style={{ background: "#4f7af5", boxShadow: "0 8px 24px rgba(79,122,245,0.3)" }}>
              Work With Us <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { val: "500+", label: "Clients Served" },
            { val: "$2M+", label: "Revenue Generated" },
            { val: "1,200+", label: "Projects Completed" },
            { val: "98%", label: "Client Satisfaction" },
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl font-black mb-1" style={{ color: "#4f7af5" }}>{s.val}</div>
              <div className="text-sm text-muted-foreground font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Filter */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {ALL_TAGS.map(tag => (
              <button key={tag} onClick={() => setActiveTag(tag)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all border"
                style={activeTag === tag
                  ? { background: "#4f7af5", color: "#fff", borderColor: "#4f7af5", boxShadow: "0 4px 12px rgba(79,122,245,0.3)" }
                  : { borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                {tag}
              </button>
            ))}
          </div>

          {/* Case studies grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filtered.map(cs => (
              <div key={cs.id} className="rounded-3xl border border-border bg-card overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  <img src={cs.image} alt={cs.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${cs.color}55, transparent)` }} />
                  <span className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                    style={{ background: cs.color }}>
                    {cs.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-base mb-2 leading-snug">{cs.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{cs.description}</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {cs.metrics.map(m => (
                      <div key={m.label} className="text-center rounded-xl py-2 px-1" style={{ background: `${cs.color}10`, border: `1px solid ${cs.color}25` }}>
                        <div className="text-base font-black" style={{ color: cs.color }}>{m.value}</div>
                        <div className="text-[10px] text-muted-foreground font-medium leading-tight">{m.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cs.tags.map(tag => (
                      <span key={tag} className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ background: "rgba(0,0,0,0.05)", color: "var(--muted-foreground)" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Live Projects from DB */}
          {projects.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-black text-center mb-8">Live Delivery Showcases</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {projects.slice(0, 6).map((p: any) => (
                  <div key={p.id} className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-all">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3" style={{ background: "rgba(79,122,245,0.1)", color: "#4f7af5" }}>
                      <Zap className="w-3 h-3" /> {p.category || "Project"}
                    </div>
                    <h3 className="font-bold mb-1.5">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="rounded-3xl p-10 text-center" style={{ background: "linear-gradient(135deg, rgba(79,122,245,0.1), rgba(139,92,246,0.08))", border: "1px solid rgba(79,122,245,0.2)" }}>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: "#4f7af5" }}>
              <Star className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-black mb-2">Ready to be our next success story?</h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">Let's talk about your goals. We'll build a custom strategy to get you there.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact">
                <button className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white transition" style={{ background: "#4f7af5" }}>
                  Start a Project <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/services">
                <button className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold border border-border transition hover:bg-black/5">
                  View Services <ExternalLink className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
