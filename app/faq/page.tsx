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
    <main style={{ overflowX: "hidden", background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div style={{ paddingTop: "80px" }}>
        <PageHero
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
          label="Support"
          title={<>How can we <span style={{color: 'var(--accent-violet)'}}>help?</span></>}
          description="Search our knowledge base for instant answers or explore categories."
        />

        <section style={{ paddingBottom: "60px", background: 'var(--bg-section-alt)' }}>
          <div className="container" style={{ paddingTop: "2.5rem" }}>
            <div style={{ 
                maxWidth: "720px", 
                margin: "0 auto",
                background: '#fff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '24px',
                padding: '1rem 1.5rem',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 12px 34px rgba(24,32,38,0.08)'
            }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <Search size={22} style={{ color: "var(--accent-blue)", opacity: 0.9 }} />
                <input
                  className="input"
                  placeholder="Type your question here..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{ 
                      flex: 1, 
                      background: 'transparent', 
                      border: 'none', 
                      color: 'var(--text-primary)', 
                      fontSize: '1.1rem',
                      padding: '0.5rem 0',
                      outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section style={{ paddingBottom: "120px" }}>
          <div className="container grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
            <aside className="lg:sticky lg:top-[110px] h-fit">
              <div style={{ 
                  color: 'var(--accent-blue)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '2px', 
                  fontSize: '0.8rem', 
                  fontWeight: '700', 
                  marginBottom: '1rem',
                  paddingLeft: '0.5rem'
              }}>
                Categories
              </div>
              <div style={{ 
                  padding: "1rem", 
                  background: '#fff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '24px'
              }}>
                <div className="flex flex-wrap gap-2 lg:flex-col">
                  {categories.map((cat) => {
                    const active = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                          justifyContent: "flex-start",
                          width: "100%",
                          textAlign: "left",
                          padding: "0.75rem 1.2rem",
                          borderRadius: '12px',
                          background: active ? 'var(--gradient)' : 'transparent',
                          color: active ? '#fff' : 'var(--text-muted)',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: active ? '700' : '500',
                          fontSize: '0.95rem',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ 
                  marginTop: "2rem", 
                  padding: '2rem 1.5rem',
                  background: '#fff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '24px',
                  textAlign: 'center'
              }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      border: "1px solid rgba(255,68,68,0.2)",
                      display: "grid",
                      placeItems: "center",
                      color: "#ff4444",
                      background: "rgba(255,68,68,0.06)",
                      margin: '0 auto 1rem'
                    }}
                  >
                    <LifeBuoy size={22} />
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem' }}>Still need help?</div>
                <p style={{ color: "var(--text-muted)", marginTop: "0.75rem", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  Our support visionaries are available to assist you.
                </p>
                <div style={{ marginTop: "1.5rem" }}>
                  <Link href="/contact" className="btn btn-outline" style={{ 
                      width: "100%", 
                      textAlign: "center", 
                      display: 'block',
                      padding: '0.8rem',
                      borderRadius: '12px',
                      borderColor: 'rgba(255,68,68,0.3)',
                      color: '#ff4444'
                  }}>
                    Contact support
                  </Link>
                </div>
              </div>
            </aside>

            <div className="grid gap-4">
              {loading ? (
                <div style={{ 
                    textAlign: "center", 
                    padding: "4rem", 
                    color: "var(--text-muted)",
                    background: '#fff',
                    borderRadius: '24px',
                    border: '1px solid var(--border-subtle)'
                }}>
                  Syncing with knowledge core…
                </div>
              ) : filtered.length > 0 ? (
                filtered.map((item, idx) => {
                  const isOpen = expandedId === item.id;
                  return (
                    <motion.div 
                      key={item.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{ 
                          background: '#fff', 
                          border: isOpen ? '1px solid rgba(20,108,120,0.35)' : '1px solid var(--border-subtle)',
                          borderRadius: '20px',
                          overflow: "hidden",
                          transition: 'all 0.3s ease'
                      }}
                    >
                      <button
                        onClick={() => setExpandedId(isOpen ? null : item.id)}
                        className="w-full"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "1rem",
                          padding: "1.5rem 2rem",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                        aria-expanded={isOpen}
                      >
                        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                          <span
                            aria-hidden
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: isOpen ? "var(--accent-blue)" : "var(--border-subtle)",
                              boxShadow: isOpen ? '0 0 10px rgba(255,68,68,0.5)' : 'none',
                              transition: 'all 0.3s ease'
                            }}
                          />
                          <div style={{ 
                              fontWeight: 700, 
                              color: 'var(--text-primary)', 
                              fontSize: '1.1rem',
                              transition: 'color 0.2s'
                          }}>{item.title}</div>
                        </div>

                        <ChevronDown
                          size={20}
                          style={{
                            color: isOpen ? "#ff4444" : "#64748b",
                            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.3s ease",
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
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            style={{ overflow: "hidden" }}
                          >
                            <div style={{ padding: "0 2rem 2rem 3rem" }}>
                              <div
                                style={{ color: "var(--text-muted)", lineHeight: 1.8, fontSize: "1.05rem" }}
                                dangerouslySetInnerHTML={{ __html: item.content }}
                              />

                              {item.slug ? (
                                <div style={{ marginTop: "1.5rem" }}>
                                  <Link href={`/kb/${item.slug}`} style={{
                                      color: '#ff4444',
                                      fontWeight: '600',
                                      fontSize: '0.95rem',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.5rem'
                                  }}>
                                    View Detailed Guide &rarr;
                                  </Link>
                                </div>
                              ) : null}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              ) : (
                <div style={{ 
                    textAlign: "center", 
                    padding: "4rem 2rem", 
                    background: '#fff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '24px'
                }}>
                  <div style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "1.5rem" }}>
                    Zero results found.
                  </div>
                  <p style={{ color: "var(--text-muted)", marginTop: "0.75rem", fontSize: '1.1rem' }}>
                    Our database does not match that query. Try custom keywords.
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
