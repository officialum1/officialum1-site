import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Delivery & Fulfillment Policy | OfficialUM1 LLC",
  description: "Learn about the fulfillment timelines and delivery process for OfficialUM1 LLC digital services.",
  alternates: {
    canonical: `${SITE_URL}/delivery-policy`,
  },
};

export default function DeliveryPolicyPage() {
  return (
    <main className="inner-page" style={{ position: "relative", paddingTop: "80px", background: "#030305", minHeight: "100vh", color: "#fff" }}>
      <Navbar />

      <section style={{
        padding: "120px 0 60px",
        background: "linear-gradient(180deg, rgba(79, 142, 247, 0.05) 0%, transparent 100%)",
        textAlign: "center"
      }}>
        <div className="container" style={{ maxWidth: "850px", margin: "0 auto", padding: "0 20px" }}>
          <h1
            style={{ fontSize: "clamp(2.2rem, 4vw, 3.5rem)", fontWeight: "900", letterSpacing: "-1.5px", marginBottom: "1rem" }}
          >
            Delivery & <span style={{ color: "#4f8ef7" }}>Fulfillment Policy</span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>
            Last Updated: January 2026
          </p>
        </div>
      </section>

      <section style={{ paddingBottom: "120px" }}>
        <div className="container" style={{ maxWidth: "850px", margin: "0 auto", padding: "0 20px" }}>
          <div
            style={{
              padding: "3.5rem",
              borderRadius: "32px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              lineHeight: "1.9",
              color: "#cbd5e1",
              fontSize: "1.05rem"
            }}
          >
            <p style={{ marginBottom: "1.5rem" }}>
              At <strong>OfficialUM1 LLC</strong>, we deliver all products and services electronically. Because our offerings are digital (software tools, web development, search engine optimization, and consulting), no physical goods are shipped.
            </p>

            <h2 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "800", marginTop: "2rem", marginBottom: "1rem" }}>
              1. Digital Tools & Platform Access
            </h2>
            <p style={{ marginBottom: "1.5rem" }}>
              Access to purchased software tools, platform credits, API endpoints, or downloadable deliverables is fulfilled <strong>instantly or within minutes</strong> following payment confirmation. You will receive an automated email confirmation with login credentials or dashboard access instructions.
            </p>

            <h2 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "800", marginTop: "2rem", marginBottom: "1rem" }}>
              2. Custom Web Development & Project Delivery
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              Custom web design, application development, and integrations follow a structured milestone delivery schedule agreed upon during project kickoff:
            </p>
            <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", marginBottom: "1.5rem" }}>
              <li style={{ marginBottom: "0.5rem" }}><strong>Phase 1 (Discovery & Architecture):</strong> 2–5 business days.</li>
              <li style={{ marginBottom: "0.5rem" }}><strong>Phase 2 (Design & Staging Preview):</strong> 5–14 business days.</li>
              <li style={{ marginBottom: "0.5rem" }}><strong>Phase 3 (Production Deployment & Final Handover):</strong> Upon client review and milestone approval.</li>
            </ul>

            <h2 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "800", marginTop: "2rem", marginBottom: "1rem" }}>
              3. SEO, Backlink & Marketing Services
            </h2>
            <p style={{ marginBottom: "1.5rem" }}>
              SEO campaigns, technical audits, and content outreach are initiated within <strong>24 to 48 business hours</strong> after receiving project requirements. Audit reports and live placement tracking links are delivered directly to your client dashboard and email.
            </p>

            <h2 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "800", marginTop: "2rem", marginBottom: "1rem" }}>
              4. Confirmation of Delivery
            </h2>
            <p style={{ marginBottom: "1.5rem" }}>
              Upon fulfillment, a formal delivery notification containing access details, download links, or milestone sign-off reports is sent to the email address associated with your account.
            </p>

            <h2 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "800", marginTop: "2rem", marginBottom: "1rem" }}>
              5. Delivery Inquiries & Support
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              If you experience any delay in receiving access or deliverables, please reach out to our fulfillment team immediately:
            </p>
            <p style={{ marginBottom: "0.5rem" }}><strong>OfficialUM1 LLC</strong></p>
            <p style={{ marginBottom: "0.5rem" }}>1001 South Main Street, Suite 600, Kalispell, MT 59901, USA</p>
            <p style={{ marginBottom: "0.5rem" }}>Email: <strong>hello@officialum1.com</strong></p>
            <p style={{ marginBottom: "1rem" }}>Support Desk: Available 24/7 via dashboard</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
