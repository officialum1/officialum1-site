"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, LifeBuoy, Search } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageHero } from "@/components/ui/PageHero";

type FaqItem = {
  id: number;
  category?: string | null;
  title: string;
  content: string;
  slug?: string | null;
};

export default function FAQPage() {
  const [articles, setArticles] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/kb")
      .then((res) => res.json())
      .then((data) => {
        const systemFaqs: FaqItem[] = [
          {
            id: 999,
            category: "General",
            title: "How long does delivery take?",
            content:
              "Digital account details are delivered instantly to your dashboard and email. Custom services typically take 24-48 hours depending on complexity.",
          },
          {
            id: 998,
            category: "Payments",
            title: "What payment methods do you accept?",
            content:
              "We accept Credit/Debit Cards (Stripe), Binance Pay, and various Cryptocurrencies through Cryptomus for secure, global transactions.",
          },
          {
            id: 997,
            category: "Security",
            title: 'What is the "Verified Pro" program?',
            content:
              "Our verification program ensures a safe marketplace. Once you verify your identity with a valid ID and selfie, you gain access to premium high-value assets.",
          },
          {
            id: 996,
            category: "Warranty",
            title: "Do you offer replacements?",
            content:
              "Yes, we provide a 24-hour warranty on all digital assets. If the credentials are invalid upon arrival, we replace them instantly. Please check the assets immediately upon delivery.",
          },
          {
            id: 995,
            category: "General",
            title: "Can I request a custom service?",
            content:
              "Absolutely. If you need a specialized digital service not listed in our shop, contact our specialists for a custom quote on SEO, development, or marketing.",
          },
          {
            id: 994,
            category: "Account",
            title: "How do I track my orders?",
            content:
              'You can track all your active and past orders from the "My Orders" tab in your user dashboard.',
          },
          {
            id: 993,
            category: "Security",
            title: "Are my payment details secure?",
            content:
              "Yes. We use industry-standard encryption (SSL) and process all payments through verified global gateways like Stripe and Cryptomus. We never store your card details on our servers.",
          },
        ];

        if (Array.isArray(data)) {
          const merged: FaqItem[] = [...systemFaqs, ...(data as FaqItem[])];
          const unique = merged.filter(
            (v, i, a) => a.findIndex((t) => t.title === v.title) === i
          );
          setArticles(unique);
        } else {
          setArticles(systemFaqs);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const fromData = Array.from(
      new Set(articles.map((a) => a.category).filter(Boolean))
    ) as string[];
    return ["All", ...fromData];
  }, [articles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      const matchesSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q);
      const matchesCategory =
        activeCategory === "All" || a.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [articles, query, activeCategory]);

  const faqSchema = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: filtered.slice(0, 10).map((item) => ({
        "@type": "Question",
        name: item.title,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.content.replace(/<[^>]*>?/gm, ""),
        },
      })),
    };
  }, [filtered]);

  return (
    <main style={{ overflowX: "hidden" }}>
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div style={{ paddingTop: "80px" }}>
        <PageHero
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
          label="Support"
          title="How can we help?"
          description="Search our knowledge base for instant answers or explore categories."
        />

        <section style={{ paddingBottom: "96px" }}>
          <div className="container" style={{ paddingTop: "2.5rem" }}>
            <div className="card" style={{ maxWidth: "720px", margin: "0 auto" }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <Search size={18} style={{ color: "var(--muted)" }} />
                <input
                  className="input"
                  placeholder="Ask a question..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          </div>
        </section>

        <section style={{ paddingBottom: "120px" }}>
          <div className="container grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
            <aside className="lg:sticky lg:top-[110px] h-fit">
              <div className="section-label" style={{ marginBottom: "0.75rem" }}>
                Categories
              </div>
              <div className="card" style={{ padding: "0.75rem" }}>
                <div className="flex flex-wrap gap-2 lg:flex-col">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={activeCategory === cat ? "btn-primary" : "btn-secondary"}
                      style={{
                        justifyContent: "flex-start",
                        width: "100%",
                        textAlign: "left",
                        padding: "0.65rem 0.9rem",
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card" style={{ marginTop: "1.5rem" }}>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--indigo)",
                      background: "rgba(79,70,229,0.06)",
                    }}
                  >
                    <LifeBuoy size={18} />
                  </div>
                  <div style={{ fontWeight: 800 }}>Still need help?</div>
                </div>
                <p style={{ color: "var(--muted)", marginTop: "0.75rem", fontSize: "0.95rem" }}>
                  Our team is available 24/7 to assist you.
                </p>
                <div style={{ marginTop: "1rem" }}>
                  <Link href="/contact" className="btn-primary" style={{ width: "100%", textAlign: "center" }}>
                    Contact support
                  </Link>
                </div>
              </div>
            </aside>

            <div className="grid gap-3">
              {loading ? (
                <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
                  Loading answers…
                </div>
              ) : filtered.length > 0 ? (
                filtered.map((item, idx) => {
                  const isOpen = expandedId === item.id;
                  return (
                    <div key={item.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                      <button
                        onClick={() => setExpandedId(isOpen ? null : item.id)}
                        className="w-full"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "1rem",
                          padding: "1.25rem 1.25rem",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                        aria-expanded={isOpen}
                      >
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                          <span
                            aria-hidden
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 999,
                              border: "1px solid var(--border)",
                              background: isOpen ? "var(--indigo)" : "rgba(79,70,229,0.10)",
                            }}
                          />
                          <div style={{ fontWeight: 800, color: "var(--fg)" }}>{item.title}</div>
                        </div>

                        <ChevronDown
                          size={18}
                          style={{
                            color: "var(--muted)",
                            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 180ms ease",
                            flex: "none",
                          }}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            style={{ overflow: "hidden" }}
                          >
                            <div style={{ padding: "0 1.25rem 1.25rem 2.4rem" }}>
                              <div
                                style={{ color: "var(--muted)", lineHeight: 1.75, fontSize: "0.98rem" }}
                                dangerouslySetInnerHTML={{ __html: item.content }}
                              />

                              {item.slug ? (
                                <div style={{ marginTop: "1rem" }}>
                                  <Link href={`/kb/${item.slug}`} className="btn-ghost">
                                    Read full documentation →
                                  </Link>
                                </div>
                              ) : null}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              ) : (
                <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                  <div style={{ color: "var(--fg)", fontWeight: 900, fontSize: "1.25rem" }}>
                    No matches found
                  </div>
                  <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>
                    Try different keywords or contact support for help.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}

