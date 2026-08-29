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
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GuestPostQuoteForm from "@/components/GuestPostQuoteForm";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Guest Posting Services | Buy Niche Guest Posts | OfficialUM1",
  description:
    "Buy niche-relevant guest posting services from OfficialUM1. Publisher outreach, content planning, contextual placements, and clear placement reports for SEO authority growth.",
  keywords: [
    "guest posting services",
    "buy guest posts",
    "high DA guest posting",
    "guest post backlinks",
    "niche guest posts",
    "link building services",
  ],
  alternates: { canonical: "https://officialum1.com/services/guest-posting" },
};

const benefits = [
  {
    icon: Target,
    title: "Niche Fit First",
    text: "We match your campaign with publishers that make sense for your industry, target page, and audience intent.",
  },
  {
    icon: SearchCheck,
    title: "Publisher Vetting",
    text: "Sites are reviewed for relevance, visible content quality, indexability, and placement standards before outreach.",
  },
  {
    icon: FileText,
    title: "Content Included",
    text: "We can prepare the article, plan anchor text, and send a publisher-ready draft for approval.",
  },
  {
    icon: ShieldCheck,
    title: "Clean Reporting",
    text: "You receive the live URL, target page, anchor, publisher details, and final placement notes after publishing.",
  },
];

const packages = [
  {
    name: "Starter Placement",
    price: "$99+",
    detail: "For one money page, local SEO page, or first test placement.",
    items: ["1 niche placement", "Publisher shortlist", "Content guidance", "Live URL report"],
  },
  {
    name: "Growth Pack",
    price: "$249+",
    detail: "For brands that want momentum across multiple target pages.",
    items: ["3 placements", "Article writing included", "Anchor map", "Placement report"],
    featured: true,
  },
  {
    name: "Authority Pack",
    price: "$499+",
    detail: "For competitive niches that need stronger publisher quality.",
    items: ["5 placements", "Higher authority targets", "Manual outreach", "Monthly strategy notes"],
  },
  {
    name: "Monthly Agency Plan",
    price: "$999+",
    detail: "For recurring campaigns, agencies, and ongoing authority building.",
    items: ["5 to 10+ placements", "Monthly link plan", "Content calendar", "Performance reporting"],
  },
];

const processSteps = [
  {
    title: "Submit your target",
    text: "Share your domain, niche, target URL, anchor text, budget, and preferred delivery timeline.",
  },
  {
    title: "We shortlist publishers",
    text: "We check relevance, topical fit, content quality, and placement requirements before sending options.",
  },
  {
    title: "Approve content",
    text: "We prepare or refine the article so the placement reads naturally and matches publisher guidelines.",
  },
  {
    title: "Publish and report",
    text: "You get the live post URL, anchor, target page, publisher details, and campaign notes in one report.",
  },
];

const deliverables = [
  "Publisher URL and live guest post link",
  "Target page and anchor text record",
  "Content title and article status",
  "Placement date and package value",
  "Publisher policy notes where relevant",
  "Next-step recommendations for your SEO plan",
];

const faqs = [
  {
    question: "Do you guarantee rankings?",
    answer:
      "No. Guest posting can support authority and discovery, but Google rankings depend on many factors including site quality, content, technical SEO, competition, and search intent.",
  },
  {
    question: "Are links always follow links?",
    answer:
      "Link attributes depend on publisher policy. We focus on relevant, transparent placements and report the final URL and placement details clearly.",
  },
  {
    question: "Can you write the article?",
    answer:
      "Yes. Growth, Authority, and Monthly plans can include article writing, anchor planning, and publisher-ready formatting.",
  },
  {
    question: "How fast can a guest post go live?",
    answer:
      "Most simple placements can be planned within a few business days. Publishing time depends on publisher review speed and niche requirements.",
  },
];

export default function GuestPostingPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Guest Posting Services",
    provider: {
      "@type": "Organization",
      name: "OfficialUM1",
      url: "https://officialum1.com",
    },
    areaServed: "Worldwide",
    serviceType: "Guest Posting and Link Building",
    description:
      "Niche-relevant guest post placements with publisher outreach, content planning, and placement reporting.",
    url: "https://officialum1.com/services/guest-posting",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Guest Posting Packages",
      itemListElement: packages.map((pkg) => ({
        "@type": "Offer",
        name: pkg.name,
        description: pkg.detail,
        priceCurrency: "USD",
        price: pkg.price.replace(/[^0-9]/g, ""),
        availability: "https://schema.org/InStock",
      })),
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="inner-page">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([serviceJsonLd, faqJsonLd]) }}
      />
      <div style={{ paddingTop: "80px" }}>
        <PageHero
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: "Guest Posting" },
          ]}
          label="Guest Posting"
          title="Guest posts that turn authority into leads"
          description="Sell smarter with niche-relevant publisher outreach, clean content planning, transparent reports, and a quote flow connected directly to your admin CRM."
          right={
            <Link
              href="#quote"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-4 text-sm font-black text-white"
              style={{ background: "var(--gradient)", boxShadow: "var(--glow-blue)" }}
            >
              Get Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <section className="py-[72px]" style={{ background: "var(--bg-base)" }}>
          <div className="container">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit) => (
                <article
                  key={benefit.title}
                  className="rounded-xl border p-6"
                  style={{
                    background: "#ffffff",
                    borderColor: "var(--border-subtle)",
                    boxShadow: "0 12px 30px rgba(24,32,38,0.06)",
                  }}
                >
                  <div
                    className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg"
                    style={{ background: "rgba(20,108,120,0.10)", color: "var(--accent-blue)" }}
                  >
                    <benefit.icon size={23} />
                  </div>
                  <h2 className="mb-3 text-xl font-black" style={{ color: "var(--text-primary)" }}>
                    {benefit.title}
                  </h2>
                  <p className="text-sm leading-7" style={{ color: "var(--text-muted)" }}>
                    {benefit.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-[88px]" style={{ background: "var(--bg-section)" }}>
          <div className="container">
            <div className="mb-12 max-w-3xl">
              <span
                className="text-xs font-bold uppercase"
                style={{ color: "var(--accent-blue)", letterSpacing: "0.14em" }}
              >
                Packages
              </span>
              <h2 className="mt-4 text-3xl font-black md:text-5xl">
                Pick a package, then we customize the publisher list
              </h2>
              <p className="mt-4" style={{ color: "var(--text-muted)" }}>
                Pricing starts simple, but the final quote depends on niche difficulty, publisher quality, traffic standards, article length, and delivery speed.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-4">
              {packages.map((pkg) => (
                <article
                  key={pkg.name}
                  className="relative flex flex-col rounded-xl border p-6"
                  style={{
                    background: pkg.featured ? "linear-gradient(180deg,#ffffff,#f3faf8)" : "#ffffff",
                    borderColor: pkg.featured ? "rgba(20,108,120,0.34)" : "var(--border-subtle)",
                    boxShadow: pkg.featured
                      ? "0 18px 44px rgba(20,108,120,0.14)"
                      : "0 12px 30px rgba(24,32,38,0.06)",
                  }}
                >
                  {pkg.featured ? (
                    <span
                      className="mb-4 w-fit rounded-full px-3 py-1 text-xs font-black uppercase"
                      style={{ color: "var(--accent-blue)", background: "rgba(20,108,120,0.10)" }}
                    >
                      Best seller
                    </span>
                  ) : null}
                  <h3 className="mb-2 text-2xl font-black" style={{ color: "var(--text-primary)" }}>
                    {pkg.name}
                  </h3>
                  <div className="mb-4 text-3xl font-black" style={{ color: "var(--accent-blue)" }}>
                    {pkg.price}
                  </div>
                  <p className="mb-6 text-sm leading-7" style={{ color: "var(--text-muted)" }}>
                    {pkg.detail}
                  </p>
                  <ul className="mb-8 grid gap-3">
                    {pkg.items.map((item) => (
                      <li key={item} className="flex gap-3 text-sm" style={{ color: "var(--text-primary)" }}>
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" style={{ color: "var(--accent-blue)" }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="#quote"
                    className="mt-auto inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-bold text-white"
                    style={{ background: "var(--gradient)", boxShadow: "var(--glow-blue)" }}
                  >
                    Request Quote
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-[88px]" style={{ background: "var(--bg-base)" }}>
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <span
                  className="text-xs font-bold uppercase"
                  style={{ color: "var(--accent-blue)", letterSpacing: "0.14em" }}
                >
                  How it works
                </span>
                <h2 className="mt-4 text-3xl font-black md:text-5xl">
                  A simple sales flow your team can actually manage
                </h2>
                <p className="mt-4 leading-8" style={{ color: "var(--text-muted)" }}>
                  The public page collects quote details. The admin panel stores every request as a lead, so you can follow up, update status, attach documents, and track revenue.
                </p>
              </div>

              <div className="grid gap-4">
                {processSteps.map((step, index) => (
                  <article
                    key={step.title}
                    className="grid gap-4 rounded-xl border p-5 sm:grid-cols-[52px_1fr]"
                    style={{ background: "#ffffff", borderColor: "var(--border-subtle)" }}
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-black"
                      style={{ background: "rgba(20,108,120,0.10)", color: "var(--accent-blue)" }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="mb-2 text-xl font-black" style={{ color: "var(--text-primary)" }}>
                        {step.title}
                      </h3>
                      <p className="text-sm leading-7" style={{ color: "var(--text-muted)" }}>
                        {step.text}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="quote" className="py-[88px]" style={{ background: "var(--bg-section)" }}>
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div>
                <span
                  className="text-xs font-bold uppercase"
                  style={{ color: "var(--accent-blue)", letterSpacing: "0.14em" }}
                >
                  Connected to admin
                </span>
                <h2 className="mt-4 text-3xl font-black md:text-5xl">
                  Guest post quotes now become trackable leads
                </h2>
                <p className="mt-4 leading-8" style={{ color: "var(--text-muted)" }}>
                  Jab koi client form submit karega, admin panel ke Leads tab mein Guest Posting pipeline ke andar aa jayega. Follow-up, notes, status, budget, aur report link wahi manage ho sakte hain.
                </p>

                <div className="mt-8 grid gap-4">
                  {[
                    { icon: Globe2, title: "Client details", text: "Domain, niche, target URL, anchor, budget, and timeline are saved." },
                    { icon: BarChart3, title: "Revenue tracking", text: "Budget value goes into your lead pipeline and dashboard totals." },
                    { icon: LinkIcon, title: "Report ready", text: "Final publisher URL can be stored in the existing document/report link field." },
                    { icon: TrendingUp, title: "Upsell path", text: "Single placement buyers can be moved into monthly packages." },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4">
                      <div
                        className="flex h-11 w-11 flex-none items-center justify-center rounded-lg"
                        style={{ background: "rgba(196,71,45,0.10)", color: "var(--accent-violet)" }}
                      >
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="mb-1 text-lg font-black" style={{ color: "var(--text-primary)" }}>
                          {item.title}
                        </h3>
                        <p className="text-sm leading-7" style={{ color: "var(--text-muted)" }}>
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <GuestPostQuoteForm />
            </div>
          </div>
        </section>

        <section className="py-[88px]" style={{ background: "var(--bg-base)" }}>
          <div className="container">
            <div
              className="grid gap-8 rounded-2xl border p-6 sm:p-8 lg:grid-cols-2"
              style={{
                background: "linear-gradient(135deg, #ffffff, #eef4f2)",
                borderColor: "var(--border-subtle)",
                boxShadow: "0 18px 44px rgba(24,32,38,0.08)",
              }}
            >
              <div>
                <h2 className="mb-4 text-3xl font-black">What the client receives</h2>
                <p className="leading-8" style={{ color: "var(--text-muted)" }}>
                  Every campaign should be easy to verify. Keep the output concrete so the buyer can see exactly what was delivered.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {deliverables.map((item) => (
                  <div key={item} className="flex gap-3 rounded-xl bg-white p-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" style={{ color: "var(--accent-blue)" }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-[88px]" style={{ background: "var(--bg-section)" }}>
          <div className="container">
            <div className="mb-10 max-w-3xl">
              <span
                className="text-xs font-bold uppercase"
                style={{ color: "var(--accent-blue)", letterSpacing: "0.14em" }}
              >
                FAQ
              </span>
              <h2 className="mt-4 text-3xl font-black md:text-5xl">
                Clear expectations before the sale
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {faqs.map((faq) => (
                <article
                  key={faq.question}
                  className="rounded-xl border p-6"
                  style={{ background: "#ffffff", borderColor: "var(--border-subtle)" }}
                >
                  <h3 className="mb-3 text-xl font-black" style={{ color: "var(--text-primary)" }}>
                    {faq.question}
                  </h3>
                  <p className="text-sm leading-7" style={{ color: "var(--text-muted)" }}>
                    {faq.answer}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
