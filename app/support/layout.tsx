import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/support",
  title: "Customer Support | OfficialUM1",
  description:
    "Get help with orders, delivery, billing, and technical issues. OfficialUM1 support for shop buyers and marketing clients.",
  keywords: "OfficialUM1 support, order help, customer service",
});

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
