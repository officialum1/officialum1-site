import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import CookieBanner from "@/components/CookieBanner";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollProgress from "@/components/ScrollProgress";
import DynamicSalesPulse from '@/components/DynamicSalesPulse';
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import CartSidebar from "@/components/CartSidebar";
import GlobalAnnouncement from "@/components/GlobalAnnouncement";
import LoyaltyBanner from "@/components/LoyaltyBanner";
import { Toaster } from "sonner";

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
  title: {
    default: "OfficialUM1 | Premier Digital Agency",
    template: "%s | OfficialUM1"
  },
  description: "Translating digital aspirations into tangible results. Experts in Web Development, SEO Optimization, and Social Media Growth.",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://officialum1.com',
    siteName: 'OfficialUM1',
    images: [{
      url: '/logo.jpg',
      width: 1200,
      height: 630,
      alt: 'OfficialUM1 Digital Excellence'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OfficialUM1 | Digital Excellence',
    description: 'Translating digital aspirations into tangible results. Web Development, SEO, and Social Media Marketing experts.',
    images: ['/logo.jpg'],
    creator: '@officialum1',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
      }
    ]
  };

  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <Toaster position="top-right" expand={false} richColors />
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
        <CartProvider>
          <WishlistProvider>
            <GlobalAnnouncement />
            <CartSidebar />
            <CookieBanner />
            <LoyaltyBanner />
            <ScrollProgress />
            <DynamicSalesPulse />
            {children}
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
