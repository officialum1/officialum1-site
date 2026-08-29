import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/store",
  title: "Ranked Website Rentals | OfficialUM1 Store",
  description:
    "Rent pre-ranked digital assets and websites from OfficialUM1. Skip the cold-start phase with properties that already have visibility.",
  keywords: "website rental, ranked websites, OfficialUM1 store",
});

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
