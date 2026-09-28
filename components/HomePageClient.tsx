"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomeHero from "@/components/HomeHero";
import TechTicker from "@/components/TechTicker";
import ServicesSection from "@/components/ServicesSection";
import FeaturedProductsSection from "@/components/FeaturedProductsSection";
import BusinessSection from "@/components/BusinessSection";
import StatsSocialProof from "@/components/StatsSocialProof";
import FreeAuditSection from "@/components/FreeAuditSection";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HomePageClient() {
  return (
    <main className="home-redesign">
      <Navbar />

      {/* 1. Hero: Core Value Proposition & Primary CTAs */}
      <HomeHero />

      {/* 2. Tech & Trust Ticker: Instant authority marquee */}
      <TechTicker />

      {/* 3. Core Agency Services: 4 Primary Pillars */}
      <ServicesSection />

      {/* 4. Digital Assets Hub: Top Verified Accounts & Assets */}
      <FeaturedProductsSection />

      {/* 5. Corporate Formation Hub: US LLC & UK LTD with Banking */}
      <BusinessSection />

      {/* 6. Social Proof & Performance Metrics */}
      <StatsSocialProof />

      {/* 7. Free Audit Conversion Lead Capture */}
      <FreeAuditSection />

      {/* 8. Bottom Final Strategic Call-to-Action */}
      <section
        className="section-padding py-20 md:py-28"
        aria-labelledby="home-cta-title"
        style={{
          textAlign: "center",
          background: "var(--bg-section-alt)",
        }}
      >
        <div className="container">
          <div
            style={{
              padding: "clamp(2rem, 5vw, 3.5rem)",
              borderRadius: "28px",
              maxWidth: "920px",
              margin: "0 auto",
              border: "1px solid var(--border-subtle)",
              background: "#ffffff",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(24,32,38,0.08)",
            }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider mb-4 bg-primary/10 text-primary">
              <Sparkles className="w-3.5 h-3.5" /> High-Performance Digital Partner
            </div>

            <h2
              id="home-cta-title"
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontWeight: 800,
                color: "var(--text-primary)",
                lineHeight: 1.15,
              }}
            >
              Ready to Accelerate Your Brand&apos;s Growth?
            </h2>

            <p
              className="subheading"
              style={{
                margin: "1.2rem auto 2.2rem",
                maxWidth: "620px",
                color: "var(--text-muted)",
                fontSize: "1.05rem"
              }}
            >
              From custom WordPress & Next.js architectures to global SEO backlink syndication and US/UK entity formation — our engineering team is ready to scale your business.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="btn btn-primary inline-flex items-center justify-center gap-2 font-extrabold text-white text-base py-4 px-8 rounded-2xl shadow-xl transition-all"
                style={{
                  background: "var(--gradient)",
                  boxShadow: "var(--glow-blue)",
                }}
              >
                Schedule Free Strategy Session <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/bundles"
                className="inline-flex items-center justify-center gap-2 font-bold text-gray-800 text-base py-4 px-8 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all"
              >
                Explore Agency Bundles
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
