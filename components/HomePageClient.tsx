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
import Link from "next/link";

export default function HomePageClient() {
  return (
    <>
      <Navbar />

      <main className="home-redesign">
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
              <h2
                id="home-cta-title"
                style={{
                  fontSize: "clamp(2rem, 4.5vw, 3rem)",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  lineHeight: 1.15,
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
                Let&apos;s discuss how we can help your brand grow today. Our
                team is online and ready to assist.
              </p>

              <Link
                href="/contact"
                className="btn btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.05rem",
                  padding: "1.1rem 2rem",
                  borderRadius: "999px",
                  background: "var(--gradient)",
                  boxShadow: "var(--glow-blue)",
                  color: "#fff",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Get Free Consultation <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
