"use client";

import { useState, useEffect, useRef } from "react";
import LiveCount from "@/components/LiveCount";
import { Star } from "lucide-react";

const placeholderReviews = [
  { name: "Sarah K.", role: "Founder, Tech Startup", quote: "OfficialUM1 delivered our site on time and our organic traffic doubled in three months.", rating: 5 },
  { name: "James L.", role: "Marketing Director", quote: "Professional, responsive, and results-driven. Exactly what we needed to scale.", rating: 5 },
  { name: "Maria R.", role: "E-commerce Owner", quote: "From SEO to design—everything was handled with care. Highly recommend.", rating: 5 },
];

export default function StatsSocialProof() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-24"
      style={{ background: "var(--bg-section-alt)", color: "var(--text-primary)" }}
      aria-label="Stats and social proof"
    >
      <div className="container">
        {/* Stats row */}
        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3 md:gap-6">
          <div className="flex flex-col items-center">
            <div
              className="mb-2 text-4xl font-bold md:text-5xl"
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                background: "linear-gradient(135deg, var(--accent-blue), var(--accent-violet))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              <LiveCount metric="projects" suffix="+" triggerAnimation={isVisible} />
            </div>
            <p className="text-sm font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Projects Delivered
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="mb-2 text-4xl font-bold md:text-5xl"
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                background: "linear-gradient(135deg, var(--accent-blue), var(--accent-violet))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              <LiveCount metric="satisfaction" suffix="★" decimals={1} triggerAnimation={isVisible} />
            </div>
            <p className="text-sm font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Client Satisfaction
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="mb-2 text-4xl font-bold md:text-5xl"
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                background: "linear-gradient(135deg, var(--accent-blue), var(--accent-violet))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              <LiveCount metric="orders" short triggerAnimation={isVisible} />
            </div>
            <p className="text-sm font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Orders Processed
            </p>
          </div>
        </div>

        {/* Review cards */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {placeholderReviews.map((review, i) => (
            <div
              key={i}
              className="rounded-[20px] p-6 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "var(--bg-card)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderLeft: "3px solid",
                borderImage:
                  "linear-gradient(180deg, var(--accent-blue), var(--accent-violet)) 1",
                borderTop: "1px solid var(--border-subtle)",
                borderRight: "1px solid var(--border-subtle)",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <div className="mb-3 flex gap-1" role="img" aria-label={`${review.rating} out of 5 stars`}>
                {[...Array(review.rating)].map((_, j) => (
                  <Star key={j} className="h-5 w-5 fill-current" style={{ color: "#FBBF24" }} aria-hidden="true" />
                ))}
              </div>
              <p className="mb-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                &ldquo;{review.quote}&rdquo;
              </p>
              <div>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {review.name}
                </span>
                <span className="ml-2 text-xs" style={{ color: "var(--text-muted)" }}>
                  {review.role}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="/reviews"
            className="inline-flex items-center justify-center rounded-full border px-6 py-2.5 text-sm font-semibold"
            style={{
              borderColor: "var(--border-subtle)",
              color: "var(--text-primary)",
              background: "#fff",
            }}
          >
            Read All Reviews →
          </a>
        </div>
      </div>
    </section>
  );
}
