import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/privacy",
  title: "Privacy Policy | OfficialUM1",
  description:
    "OfficialUM1 privacy policy: how we collect, use, and protect personal data across our website, shop, and marketing services.",
  keywords: "OfficialUM1 privacy policy, data protection",
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
