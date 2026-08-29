import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";
import { getRankMathConfig } from "@/lib/rank-math-server";
import { rankMathHomeMetadata } from "@/lib/rank-math-metadata";
import { webPageJsonLd } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return rankMathHomeMetadata();
}

export default async function Home() {
  const rm = await getRankMathConfig();
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      webPageJsonLd({
        path: "/",
        name: rm.general.homepage_title,
        description: rm.general.homepage_description,
        type: "WebPage",
      }),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <HomePageClient />
    </>
  );
}
