import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/faq",
  title: "FAQ & Knowledge Base | OfficialUM1 Support",
  description:
    "Answers to common questions about OfficialUM1 services, orders, SEO packages, delivery, billing, and account support.",
  keywords: "OfficialUM1 FAQ, digital marketing help, SEO questions, support",
});

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
