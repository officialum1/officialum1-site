import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  Globe2,
  Link as LinkIcon,
  SearchCheck,
  ShieldCheck,
  Target,
  TrendingUp,
  Sparkles,
  Zap,
  Award,
  Layers,
  Check,
  X,
  ExternalLink
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GuestPostQuoteForm from "@/components/GuestPostQuoteForm";
import { PageHero } from "@/components/ui/PageHero";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Buy High DA Guest Posts & Niche Edits (DA60+) | 100% DoFollow | OfficialUM1",
  description:
    "Buy high-authority niche guest posts & curated niche edits on 65,000+ verified real websites (DA 40 to DA 75+). 100% DoFollow, real Google organic traffic, zero PBNs, and 365-day replacement warranty.",
  keywords: [
    "buy guest posts",
    "high da guest posting",
    "da60 guest post package",
    "niche edits backlinks",
    "buy contextual backlinks",
    "dofollow link building agency",
    "b2b seo link building",
    "guest posting service usa",
    "blogger outreach agency",
  ],
  alternates: { canonical: "https://officialum1.com/services/guest-posting" },
};

const trustMetrics = [
  { value: "65,000+", label: "Verified Real Publishers", sub: "Manual Blogger Outreach Network" },
  { value: "DA 40 - 75+", label: "Domain Authority Range", sub: "Moz DA & Ahrefs DR 50-85+" },
  { value: "5k - 50k+", label: "Monthly Organic Traffic", sub: "Verified Google Search Visits" },
  { value: "100% DoFollow", label: "Contextual In-Content", sub: "365-Day Free Replacement" },
];

const vettingStandards = [
  {
    icon: SearchCheck,
    title: "1. Zero PBNs / 100% Real Websites",
    desc: "Every publisher in our network is an established, independently owned web property with real active readership, branded search volume, and legitimate editorial management."
  },
  {
    icon: TrendingUp,
    title: "2. Verified Google Organic Traffic",
    desc: "We strictly reject dead sites with inflated metrics. Each target domain must show positive, upward organic search traffic trends in Ahrefs and Semrush (1k to 50k+ monthly visits)."
  },
  {
    icon: Target,
    title: "3. Hyper-Relevant Niche Fit",
    desc: "Your link is placed inside closely matching editorial themes (Tech, SaaS, Health, Finance, E-Commerce, Legal) to ensure maximum contextual link equity flow."
  },
  {
    icon: FileText,
    title: "4. 1,000+ Word Native Content Included",
    desc: "Our native US/UK content team writes high-value, researched editorial articles that naturally integrate your brand anchors without triggering commercial footprint flags."
  },
  {
    icon: ShieldCheck,
    title: "5. 365-Day Replacement Warranty",
    desc: "If any publisher modifies, removes, or un-indexes a placement within 365 days, our team replaces it immediately on an equal or higher authority domain free of charge."
  },
  {
    icon: Zap,
    title: "6. Fast 5 to 10 Day Turnaround",
    desc: "No months of waiting. From niche shortlist review to live published URL and white-label ranking report, campaigns are fulfilled with rapid precision."
  }
];

const faqs = [
  {
    question: "What makes OfficialUM1's guest posting different from cheap link vendors?",
    answer:
      "Most cheap vendors use spammy Private Blog Networks (PBNs) or link-farm domains with zero actual Google search traffic. OfficialUM1 partners with 65,000+ real, active editorial publishers with verified Ahrefs organic traffic (5k-50k+ visits), strict 0% spam scores, and 100% permanent DoFollow in-content placement guarantees."
  },
  {
    question: "What is the difference between Guest Posts and Niche Edits?",
    answer:
      "A Guest Post is a brand-new 800-1,200 word article written and published on the partner website containing your contextual backlink. A Niche Edit (Curated Link Insertion) places your link into an already existing, aged article that is already indexed and ranking in Google, providing immediate ranking signals."
  },
  {
    question: "Do you provide a replacement guarantee?",
    answer:
      "Yes. We offer an industry-leading 365-day free replacement warranty. In the rare event that a publisher alters or removes an article within 12 months, we replace the link on an equal or higher DA domain at zero cost."
  },
  {
    question: "Can I choose my target anchor texts and landing pages?",
    answer:
      "Absolutely. You can specify exact-match, partial-match, branded, or URL anchors during ordering, or let our senior link-building strategists map optimal anchor distributions to protect your site against over-optimization penalties."
  },
  {
    question: "How fast will my guest posts go live?",
    answer:
      "Standard turnaround is 5 to 10 business days for Guest Posts, and 48 to 72 hours for Niche Edits. You receive a live white-label dashboard and spreadsheet report with live URLs, DA/DR metrics, anchor texts, and indexing status."
  },
];

export default function GuestPostingPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "High DA Guest Posting & Niche Edits Service",
    "serviceType": "SEO Link Building & Blogger Outreach",
    "provider": {
      "@type": "Organization",
      "name": "OfficialUM1 LLC",
      "url": "https://officialum1.com"
    },
    "description": "High-authority contextual guest posting and niche edit backlinks on 65,000+ verified real websites with guaranteed DoFollow links and real organic Google traffic.",
    "areaServed": ["US", "GB", "CA", "AE", "AU", "Worldwide"],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Guest Posting & Link Building Packages",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Starter Authority Pack (5x DA40+ Posts)"
          },
          "price": "499",
          "priceCurrency": "USD"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "DA 60+ Ranking Powerhouse (10x DA60+ Posts)"
          },
          "price": "1499",
          "priceCurrency": "USD"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Enterprise All-In-One Surge"
          },
          "price": "2499",
          "priceCurrency": "USD"
        }
      ]
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((f) => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  };

  return (
    <main style={{ background: "var(--bg-base)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <Navbar />

      <Script id="service-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div style={{ paddingTop: '80px' }}>
        <PageHero
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Guest Posting" }]}
          label="Enterprise Authority Engine"
          title={<>Premium High DA <span style={{ color: "var(--accent-blue)" }}>Guest Posting</span> &amp; Niche Edits</>}
          description="Scale your organic search rankings with contextual, 100% DoFollow backlinks on 65,000+ verified real websites (DA 40 to DA 75+). Guaranteed real Google traffic, zero PBNs, and 365-day replacement warranty."
          right={
            <a
              href="#order-form"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-extrabold text-sm transition-all shadow-xl shadow-blue-500/25"
              style={{ background: "linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-violet) 100%)" }}
            >
              <Zap size={16} /> Choose Link Package <ArrowRight size={16} />
            </a>
          }
        />

        {/* Live Authority Metrics Ribbon */}
        <section className="border-y border-[var(--border-subtle)] bg-white py-10">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {trustMetrics.map((m, i) => (
                <div key={i} className="text-center p-4 rounded-2xl bg-gray-50/60 border border-gray-100">
                  <div className="text-2xl md:text-3xl font-black text-[var(--accent-blue)]">{m.value}</div>
                  <div className="text-xs font-bold text-[var(--text-primary)] mt-1">{m.label}</div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{m.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Interactive Package & Order Engine */}
        <section className="py-20 md:py-28" style={{ background: "var(--bg-base)" }}>
          <div className="container max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent-blue)]">
                Guaranteed Authority Placements
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] mt-2">
                Select Your Link Building Strategy
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-3">
                Choose from our pre-configured, high-ROI authority bundles or use the interactive calculator to build a custom link package tailored to your target URLs.
              </p>
            </div>

            {/* Interactive Calculator and Order Component */}
            <GuestPostQuoteForm />
          </div>
        </section>

        {/* Quality Vetting & 6-Point Standard */}
        <section className="py-20 bg-white border-y border-[var(--border-subtle)]">
          <div className="container max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent-blue)]">
                The OfficialUM1 Quality Standard
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] mt-2">
                Why 900+ Agencies Trust Our Link Infrastructure
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-3">
                Google updates penalize artificial link schemes. We protect your domain with strict manual outreach, authentic editorial placement, and zero footprint.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vettingStandards.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-gray-50/40 hover:bg-white hover:shadow-lg transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--accent-blue)] flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-[var(--text-primary)] mb-2">{item.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Matrix: OfficialUM1 vs Cheap Marketplaces */}
        <section className="py-20 md:py-28" style={{ background: "var(--bg-base)" }}>
          <div className="container max-w-5xl">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent-blue)]">
                Comparison Analysis
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] mt-2">
                OfficialUM1 vs Cheap Link Marketplaces
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-3">
                See why leading US &amp; European SEO agencies choose our verified white-hat publisher network over dangerous cheap link brokers.
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--border-subtle)] bg-white overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b bg-gray-50/80 text-[var(--text-primary)]">
                      <th className="p-4 md:p-6 font-extrabold text-sm">Feature / Metric</th>
                      <th className="p-4 md:p-6 font-extrabold text-sm text-[var(--accent-blue)] bg-blue-50/50">
                        OfficialUM1 LLC
                      </th>
                      <th className="p-4 md:p-6 font-extrabold text-sm text-gray-500">
                        Cheap Freelancers / PBNs
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="p-4 md:p-6 font-bold text-[var(--text-primary)]">Publisher Authenticity</td>
                      <td className="p-4 md:p-6 font-semibold text-emerald-700 bg-blue-50/30">
                        <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> 100% Real Blogs &amp; Media Outlets</div>
                      </td>
                      <td className="p-4 md:p-6 text-gray-500">
                        <div className="flex items-center gap-1.5"><X className="w-4 h-4 text-red-500" /> De-indexed PBNs &amp; Link Farms</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 md:p-6 font-bold text-[var(--text-primary)]">Organic Google Traffic</td>
                      <td className="p-4 md:p-6 font-semibold text-emerald-700 bg-blue-50/30">
                        <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> Verified 1k - 50k+ Monthly Visits</div>
                      </td>
                      <td className="p-4 md:p-6 text-gray-500">
                        <div className="flex items-center gap-1.5"><X className="w-4 h-4 text-red-500" /> 0 Organic Search Visits</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 md:p-6 font-bold text-[var(--text-primary)]">Link Attribute</td>
                      <td className="p-4 md:p-6 font-semibold text-emerald-700 bg-blue-50/30">
                        <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> Guaranteed 100% DoFollow In-Content</div>
                      </td>
                      <td className="p-4 md:p-6 text-gray-500">
                        <div className="flex items-center gap-1.5"><X className="w-4 h-4 text-red-500" /> NoFollow, Sponsored, or Footer</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 md:p-6 font-bold text-[var(--text-primary)]">Content Quality</td>
                      <td className="p-4 md:p-6 font-semibold text-emerald-700 bg-blue-50/30">
                        <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> Native 1,000+ Word Researched Articles</div>
                      </td>
                      <td className="p-4 md:p-6 text-gray-500">
                        <div className="flex items-center gap-1.5"><X className="w-4 h-4 text-red-500" /> Low-Quality AI Spun 300 words</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 md:p-6 font-bold text-[var(--text-primary)]">Replacement Warranty</td>
                      <td className="p-4 md:p-6 font-semibold text-emerald-700 bg-blue-50/30">
                        <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> 365-Day Free Link Replacement</div>
                      </td>
                      <td className="p-4 md:p-6 text-gray-500">
                        <div className="flex items-center gap-1.5"><X className="w-4 h-4 text-red-500" /> None (Links deleted after 30 days)</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-20 bg-white border-t border-[var(--border-subtle)]">
          <div className="container max-w-4xl">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent-blue)]">
                Frequently Asked Questions
              </span>
              <h2 className="text-3xl font-black text-[var(--text-primary)] mt-2">
                Everything You Need to Know
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-gray-50/30">
                  <h3 className="text-base font-extrabold text-[var(--text-primary)]">{faq.question}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <a
                href="#order-form"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[var(--accent-blue)] text-white font-extrabold text-sm transition-all shadow-xl shadow-blue-500/25"
              >
                Launch Your Campaign Today <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
