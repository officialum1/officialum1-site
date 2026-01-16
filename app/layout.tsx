import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import CookieBanner from "@/components/CookieBanner";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollProgress from "@/components/ScrollProgress";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://officialum1.com'),
  title: "OfficialUM1 | Digital Excellence",
  description: "Translating digital aspirations into tangible results. Web Development, SEO, and Social Media Marketing experts.",
  openGraph: {
    images: ['/logo.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OfficialUM1 | Digital Excellence',
    description: 'Translating digital aspirations into tangible results. Web Development, SEO, and Social Media Marketing experts.',
    images: ['/logo.jpg'],
    creator: '@officialum1',
  },
  verification: {
    google: 'google-site-verification-code-here', // Replace with real code
    yandex: 'yandex-verification-code',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://officialum1.com/#organization",
        "name": "OfficialUM1",
        "url": "https://officialum1.com",
        "logo": "https://officialum1.com/logo.jpg",
        "email": "hello@officialum1.com",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Sahiwal",
          "addressRegion": "Punjab",
          "addressCountry": "PK"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+92-323-7102924",
          "contactType": "customer service",
          "areaServed": "Global",
          "availableLanguage": ["English", "Urdu"]
        },
        "sameAs": [
          "https://facebook.com/officialum1",
          "https://instagram.com/officialum1",
          "https://linkedin.com/company/officialum1"
        ],
        "knowsAbout": [
          "Search Engine Optimization (SEO)",
          "Web Development",
          "Guest Posting",
          "Backlink Building",
          "Social Media Marketing",
          "Digital Strategy"
        ]
      },
      {
        "@type": "LocalBusiness",
        "parentOrganization": { "@id": "https://officialum1.com/#organization" },
        "name": "OfficialUM1",
        "image": "https://officialum1.com/logo.jpg",
        "telephone": "+92-323-7102924",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Sahiwal",
          "addressRegion": "Punjab",
          "addressCountry": "PK"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 30.6682,
          "longitude": 73.1114
        },
        "hasMap": "https://maps.app.goo.gl/vq49Dk3RSGwaizaBF",
        "priceRange": "$$",
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
          ],
          "opens": "09:00",
          "closes": "23:00"
        }
      }
    ]
  };

  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-G5WV453K9J`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-G5WV453K9J');
          `}
        </Script>
        <CookieBanner />
        <ScrollProgress />
        {/* <WhatsAppButton /> */}
        {children}
      </body>
    </html>
  );
}
