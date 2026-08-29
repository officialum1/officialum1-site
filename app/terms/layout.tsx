import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/terms",
  title: "Terms of Service | OfficialUM1",
  description:
    "Terms of service for using OfficialUM1 websites, digital products, subscriptions, and professional marketing services.",
  keywords: "OfficialUM1 terms, terms of service",
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
