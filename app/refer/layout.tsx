import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/refer",
  title: "Referral Program | OfficialUM1",
  description:
    "Earn rewards by referring friends and businesses to OfficialUM1 SEO, web development, and digital product services.",
  keywords: "OfficialUM1 referral, affiliate rewards",
});

export default function ReferLayout({ children }: { children: React.ReactNode }) {
  return children;
}
