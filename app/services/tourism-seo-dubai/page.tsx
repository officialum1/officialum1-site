import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Metadata } from 'next';
import { PageHero } from "@/components/ui/PageHero";
import Script from "next/script";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight, 
  MapPin, 
  Compass, 
  Palmtree, 
  Ship, 
  Car, 
  Zap, 
  Smartphone, 
  DollarSign, 
  Globe2 
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dubai Tourism SEO & Travel Web Development | OfficialUM1",
  description: "Scale direct tour bookings in Dubai and the UAE. High-converting Next.js booking engines, Google Maps 3-Pack dominance, and international travel SEO for Desert Safari, Yacht Rentals, and Tour Agencies.",
  keywords: [
    "dubai tourism seo",
    "travel website development dubai",
    "desert safari booking website",
    "yacht rental web design dubai",
    "travel agency marketing uae",
    "tour booking engine development"
  ],
  alternates: {
    canonical: "https://officialum1.com/services/tourism-seo-dubai",
  },
};

export default function TourismSeoDubaiPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does SEO help Dubai Tourism and Desert Safari companies get direct bookings?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "By ranking #1 on Google for high-intent search terms (like 'best desert safari dubai', 'luxury yacht rental dubai marina', 'dubai city tour packages') and Google Maps 3-Pack, tourists book directly on your website instead of high-commission OTAs like TripAdvisor, Viator, or GetYourGuide."
        }
      },
      {
        "@type": "Question",
        "name": "Why is sub-500ms speed critical for Dubai travel websites?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Over 88% of Dubai tourists book tours on mobile 5G connections from hotel rooms or airports. A fast Next.js booking engine eliminates checkout drop-offs and integrates 1-click Apple Pay, Google Pay, and WhatsApp booking."
        }
      }
    ]
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Dubai Tourism SEO & Travel Web Development",
    "provider": { "@type": "Organization", "name": "OfficialUM1 LLC" },
    "description": "High-performance booking websites and organic search dominance for Dubai tour operators, desert safari companies, and yacht rental agencies.",
    "url": "https://officialum1.com/services/tourism-seo-dubai"
  };

  return (
    <main style={{ background: "var(--bg-base)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <Navbar />

      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Script id="service-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

      <div style={{ paddingTop: '80px' }}>
        <PageHero
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Dubai Tourism SEO" }]}
          label="UAE Travel & Tourism Growth"
          title={<>Dubai <span style={{ color: "var(--accent-blue)" }}>Tourism SEO & Travel</span> Web Engineering</>}
          description="Capture high-ticket international tourists searching on Google. Sub-second booking portals, Google Maps 3-Pack dominance, and multi-currency checkouts for Dubai tour operators."
        />

        {/* Niche Pillars */}
        <section style={{ padding: "80px 0", background: "#ffffff", borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="container" style={{ maxWidth: "1100px" }}>
            
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--accent-blue)]">
                Tailored for UAE Tourism Leaders
              </span>
              <h2 className="text-3xl font-black mt-2">
                Stop Paying 25% Commissions to OTAs
              </h2>
              <p className="text-sm text-gray-500 mt-2 font-medium">
                We engineer direct booking engines that turn Google searchers from the US, UK, Europe, GCC, and Russia into direct paying clients.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px", marginBottom: "60px" }}>
              
              <div style={{ background: "var(--bg-base)", padding: "30px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                <Palmtree size={32} color="var(--accent-blue)" style={{ marginBottom: "16px" }} />
                <h3 style={{ fontSize: "19px", fontWeight: 900, marginBottom: "10px" }}>Desert Safari & Adventure</h3>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "14px", margin: 0 }}>
                  Dominate keywords like *VIP Desert Safari*, *Dune Buggy Dubai*, and *Quad Biking* with instant slot reservation.
                </p>
              </div>

              <div style={{ background: "var(--bg-base)", padding: "30px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                <Ship size={32} color="var(--accent-blue)" style={{ marginBottom: "16px" }} />
                <h3 style={{ fontSize: "19px", fontWeight: 900, marginBottom: "10px" }}>Luxury Yacht & Boat Rentals</h3>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "14px", margin: 0 }}>
                  Target high-net-worth VIP clients looking for private yacht charters in Dubai Marina and Dubai Harbour.
                </p>
              </div>

              <div style={{ background: "var(--bg-base)", padding: "30px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                <Car size={32} color="var(--accent-blue)" style={{ marginBottom: "16px" }} />
                <h3 style={{ fontSize: "19px", fontWeight: 900, marginBottom: "10px" }}>Exotic Car & Chauffeur</h3>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "14px", margin: 0 }}>
                  Capture luxury car rental and airport transfer bookings with dynamic pricing calculators and deposit escrow.
                </p>
              </div>

              <div style={{ background: "var(--bg-base)", padding: "30px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                <Compass size={32} color="var(--accent-blue)" style={{ marginBottom: "16px" }} />
                <h3 style={{ fontSize: "19px", fontWeight: 900, marginBottom: "10px" }}>City Tours & Dhow Cruise</h3>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "14px", margin: 0 }}>
                  Rank on top for Burj Khalifa combo tickets, Abu Dhabi day trips, and Marina dinner cruise packages.
                </p>
              </div>

            </div>

            {/* Feature Checklist */}
            <div style={{ background: "var(--bg-base)", padding: "40px", borderRadius: "24px", border: "1px solid var(--border-subtle)" }}>
              <h2 style={{ fontSize: "26px", fontWeight: 900, marginBottom: "24px" }}>
                What Your Custom Dubai Tourism Platform Includes:
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
                {[
                  "Sub-500ms Next.js 15 Booking Engine (loads instantly on mobile)",
                  "Google Maps 3-Pack Ranking in Downtown, Marina & Deira",
                  "1-Click WhatsApp Direct Booking & Instant Chat Integration",
                  "Multi-Currency Checkout: AED, USD, EUR, GBP, SAR via Stripe & Apple Pay",
                  "Automated Booking Confirmation & SMS/Email Ticket Dispatch",
                  "Bilingual Architecture (English, Arabic, Russian, Chinese SEO)",
                  "Zero OTA Commission — 100% of the customer revenue stays with you",
                  "Real-Time Tour Availability Calendar & Guide Assignment"
                ].map((feature, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "15px", color: "var(--text-primary)", fontWeight: 700 }}>
                    <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: "3px" }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Action Banner */}
        <section style={{ padding: "80px 0", background: "var(--bg-base)" }}>
          <div className="container" style={{ maxWidth: "860px" }}>
            <div style={{
              background: "linear-gradient(135deg, #182026 0%, #0c1217 100%)",
              borderRadius: "28px",
              padding: "48px 36px",
              color: "#ffffff",
              textAlign: "center",
              boxShadow: "0 22px 50px rgba(24, 32, 38, 0.15)"
            }}>
              <Badge className="bg-white/10 text-teal-300 mb-4">UAE Tourism Machine</Badge>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, marginBottom: "16px" }}>
                Ready to Double Direct Tour Bookings?
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "16px", maxWidth: "600px", margin: "0 auto 32px", lineHeight: 1.6 }}>
                Let OfficialUM1 engineer your high-speed booking platform and dominate Google.ae search results before peak season.
              </p>
              <Link
                href="/contact?service=Tourism+SEO+Dubai"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "16px 36px",
                  borderRadius: "999px",
                  background: "linear-gradient(135deg, var(--accent-blue), #14808e)",
                  color: "#ffffff",
                  fontWeight: 900,
                  fontSize: "16px",
                  textDecoration: "none",
                  boxShadow: "0 10px 26px rgba(20, 108, 120, 0.4)"
                }}
              >
                Request Free Tourism Growth Blueprint <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </main>
  );
}
