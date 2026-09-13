import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  Globe2,
  SearchCheck,
  ShieldCheck,
  Target,
  TrendingUp,
  Sparkles,
  Zap,
  MapPin,
  Building2,
  Check
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GuestPostQuoteForm from "@/components/GuestPostQuoteForm";
import LocalCitationsCountrySelector from "@/components/LocalCitationsCountrySelector";
import { PageHero } from "@/components/ui/PageHero";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Local SEO Citation Building Service | USA, UK, Canada, Australia, Dubai | OfficialUM1",
  description:
    "Dominate Google Maps and local 3-pack search results with 100% manual local business citation building across USA, UK, Canada, Australia, Dubai, Singapore, Philippines, and Indonesia.",
  keywords: [
    "local citation building service",
    "usa local business listings",
    "uk local business listings",
    "canada local business listings",
    "australia local citations",
    "dubai local business listings",
    "singapore local citations",
    "google maps citation building",
    "nap consistency service",
  ],
  alternates: { canonical: "https://officialum1.com/services/local-citations" },
};

export default function LocalCitationsPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Local Citation Building & NAP Directory Submissions",
    "serviceType": "Local SEO & Google Maps Optimization",
    "provider": {
      "@type": "Organization",
      "name": "OfficialUM1 LLC",
      "url": "https://officialum1.com"
    },
    "description": "Manual high-authority local citation building across USA, UK, Canada, Australia, Dubai, Singapore, Philippines, and Indonesia with 100% NAP consistency for top Google Maps 3-Pack rankings.",
    "areaServed": ["US", "GB", "CA", "AE", "AU", "SG", "PH", "ID", "Worldwide"],
  };

  return (
    <main style={{ background: "var(--bg-base)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <Navbar />
      <Script id="citations-service-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />

      <div style={{ paddingTop: '80px' }}>
        <PageHero
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Local Citations" }]}
          label="International Local SEO Engine"
          title={<>Manual Local Business <span style={{ color: "var(--accent-blue)" }}>Citation Building</span></>}
          description="Power your Google Maps 3-pack rankings with 100% manual, high-authority local business citations across USA, UK, Canada, Australia, Dubai, Singapore, Philippines, and Indonesia. Zero automated bots, perfect NAP consistency, and full login credentials provided."
          right={
            <a
              href="#order-form"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-extrabold text-sm transition-all shadow-xl shadow-blue-500/25"
              style={{ background: "linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-violet) 100%)" }}
            >
              <MapPin size={16} /> Order Local Citations <ArrowRight size={16} />
            </a>
          }
        />

        {/* Interactive Country Selector and Packages Grid */}
        <section className="py-20 md:py-28" style={{ background: "var(--bg-base)" }}>
          <div className="container max-w-6xl">
            <LocalCitationsCountrySelector />

            {/* Quote and Order Form */}
            <GuestPostQuoteForm />
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
