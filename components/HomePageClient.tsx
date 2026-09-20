"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomeHero from "@/components/HomeHero";
import ServicesSection from "@/components/ServicesSection";
import WorkSection from "@/components/WorkSection";
import FreeAuditSection from "@/components/FreeAuditSection";
import TechTicker from "@/components/TechTicker";
import PricingSection from "@/components/PricingSection";
import FeaturedProductsSection from "@/components/FeaturedProductsSection";
import BusinessSection from "@/components/BusinessSection";
import StatsSocialProof from "@/components/StatsSocialProof";
import BlogSection from "@/components/BlogSection";

import Script from "next/script";

export default function HomePageClient() {
  const homeFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What digital marketing services does OfficialUM1 offer?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "OfficialUM1 offers SEO services, web development, social media marketing, guest posting, and backlink building services. We serve clients in Sahiwal, Pakistan and worldwide.",
        },
      },
      {
        "@type": "Question",
        name: "Is OfficialUM1 based in Sahiwal Pakistan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, OfficialUM1 is a digital marketing agency based in Sahiwal, Punjab, Pakistan. We serve local businesses in Sahiwal as well as clients worldwide.",
        },
      },
      {
        "@type": "Question",
        name: "How much does SEO cost at OfficialUM1?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our SEO packages start from $499/month for the Starter plan. We offer affordable SEO services for small businesses in Pakistan and worldwide.",
        },
      },
      {
        "@type": "Question",
        name: "Do you offer guest posting services?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we offer high DA guest posting services with do-follow backlinks. Our guest posts are published on real, authoritative blogs in your niche.",
        },
      },
      {
        "@type": "Question",
        name: "Can you help international clients outside Pakistan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely. OfficialUM1 serves clients from USA, UK, Canada, Australia and worldwide. We offer white label SEO and outsourced web development for global agencies.",
        },
      },
    ],
  };

  return (
    <main className="home-redesign">
      <Navbar />

      <Script
        id="homepage-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqJsonLd) }}
      />

      <HomeHero />

      <FeaturedProductsSection />

      <BusinessSection />

      <TechTicker />

      <ServicesSection />

      <PricingSection />

      <StatsSocialProof />

      <WorkSection />

      <BlogSection />

      <FreeAuditSection />

      <section
        className="section-padding"
        style={{
          textAlign: "center",
          background: "var(--bg-section-alt)",
        }}
      >
        <div className="container">
          <div
            style={{
              padding: "clamp(2.5rem, 5vw, 3.5rem)",
              borderRadius: "16px",
              maxWidth: "900px",
              margin: "0 auto",
              border: "1px solid var(--border-subtle)",
              background: "#fff",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 18px 44px rgba(24,32,38,0.08)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "inherit",
                padding: "1px",
                background: "linear-gradient(135deg, rgba(20,108,120,0.18), rgba(196,71,45,0.16))",
                opacity: 0.45,
                zIndex: -1,
              }}
            />
            <h2
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3rem)",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: 0,
              }}
            >
              Ready to Transform Your Digital Presence?
            </h2>
            <p
              className="subheading"
              style={{
                margin: "1.5rem auto 2.5rem",
                maxWidth: "600px",
                color: "var(--text-muted)",
              }}
            >
              Let&apos;s discuss how we can help your brand grow today. Our team is online and ready to assist.
            </p>
            <a
              href="/contact"
              className="btn btn-primary"
              style={{
                fontSize: "1.05rem",
                padding: "1.1rem 3.3rem",
                borderRadius: "999px",
                background: "var(--gradient)",
                boxShadow: "var(--glow-blue)",
                border: "none",
                color: "#fff",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Get Free Consultation {"->"}
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <style jsx>{`
        @media (max-width: 1024px) {
          .section-padding { padding: 80px 0 !important; }
        }
        @media (max-width: 768px) {
          .section-padding { padding: 60px 0 !important; }
          .glass { padding: 2rem 1.5rem !important; }
        }
        @media (max-width: 480px) {
          .section-padding { padding: 40px 0 !important; }
        }
      `}</style>
    </main>
  );
}
