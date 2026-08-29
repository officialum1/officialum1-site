import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/bundles",
  title: "Product Bundles & Savings | OfficialUM1 Shop",
  description:
    "Bundle digital products on OfficialUM1 and save. Curated combinations for creators, gamers, and growth teams.",
  keywords: "digital product bundles, OfficialUM1 bundles, shop deals",
});

export default function BundlesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
