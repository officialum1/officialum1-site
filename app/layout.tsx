import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { unstable_noStore as noStore } from "next/cache";
import "./globals.css";
import nextDynamic from "next/dynamic";
import Script from "next/script";
import { Toaster } from "sonner";
import { getRankMathConfig } from "@/lib/rank-math-server";
import { buildWebmasterVerificationMetadata } from "@/lib/rank-math-webmaster";
import { buildRankMathOrganizationGraph, buildRankMathWebsiteSchema } from "@/lib/rank-math-schema";
import { normalizeRobots, SITE_URL, absoluteUrl } from "@/lib/seo";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CompareProvider } from "./context/CompareContext";

// Lazy-loaded Global Components to improve PageSpeed (TBT & Initial JS load)
const CookieBanner = nextDynamic(() => import("@/components/CookieBanner"));
const ScrollProgress = nextDynamic(() => import("@/components/ScrollProgress"));
const DynamicSalesPulse = nextDynamic(() => import("@/components/DynamicSalesPulse"));
const CartSidebar = nextDynamic(() => import("@/components/CartSidebar"));
const CompareFloatingBar = nextDynamic(() => import("@/components/CompareFloatingBar"));
const LoyaltyBanner = nextDynamic(() => import("@/components/LoyaltyBanner"));
const StickyMobileCTA = nextDynamic(() => import("@/components/StickyMobileCTA"));
const LiveTracker = nextDynamic(() => import("@/components/LiveTracker"));
const AgentWebMcp = nextDynamic(() => import("@/components/AgentWebMcp"));

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  noStore();
  const rm = await getRankMathConfig();
  const webmasterMeta = buildWebmasterVerificationMetadata(rm.webmaster);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: rm.general.homepage_title,
      template: "%s",
    },
    description: rm.general.homepage_description,
    keywords: rm.general.homepage_keywords || rm.advanced.global_keywords,
    authors: [{ name: rm.knowledge_panel.org_name }],
    creator: rm.knowledge_panel.org_name,
    publisher: rm.knowledge_panel.org_name,
    robots: normalizeRobots(rm.general.default_robots),
    ...webmasterMeta,
    openGraph: {
      title: rm.general.homepage_title,
      description: rm.general.homepage_description,
      url: SITE_URL,
      siteName: rm.general.site_name,
      images: [{ url: absoluteUrl(rm.advanced.og_default_image), width: 1200, height: 630 }],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: rm.general.homepage_title,
      description: rm.general.homepage_description,
      creator: rm.social.twitter_handle || "@officialum1",
      images: [absoluteUrl(rm.advanced.og_default_image)],
    },
  };
}

export const viewport = {
  themeColor: '#146c78',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  noStore();
  const rm = await getRankMathConfig();
  const organizationJsonLd = buildRankMathOrganizationGraph(rm);
  const websiteJsonLd = buildRankMathWebsiteSchema(rm);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
        <Toaster position="top-right" expand={false} richColors />
        {organizationJsonLd["@graph"]?.length ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
          />
        ) : null}
        {websiteJsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
          />
        ) : null}

        <Script
          id="webmcp-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var mc=navigator.modelContext;if(!mc||!mc.registerTool)return;mc.registerTool({name:"search_products",description:"Search OfficialUM1 shop products",inputSchema:{type:"object",properties:{query:{type:"string"}}},execute:function(i){return fetch("/api/v1/shop?q="+encodeURIComponent(String((i&&i.query)||"")),{headers:{"PAYMENT-SIGNATURE":"webmcp"}}).then(function(r){return r.json();});}});mc.registerTool({name:"get_site_info",description:"OfficialUM1 agent discovery endpoints",inputSchema:{type:"object",properties:{}},execute:function(){return Promise.resolve({site:"https://officialum1.com",apiCatalog:"https://officialum1.com/.well-known/api-catalog",mcp:"https://officialum1.com/mcp"});}});}catch(e){}})();`,
          }}
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
        <Script
          strategy="lazyOnload"
          src="/scripts/live-engine.js"
        />
        <CartProvider>
          <WishlistProvider>
            <CompareProvider>
              {children}
              <CartSidebar />
              <CompareFloatingBar />
              <CookieBanner />
              <LoyaltyBanner />
              <ScrollProgress />
              <DynamicSalesPulse />
              <StickyMobileCTA />
              <LiveTracker />
              <AgentWebMcp />
            </CompareProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
