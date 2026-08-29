import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/my-orders",
  title: "My Orders | OfficialUM1",
  description: "View your OfficialUM1 purchase history and delivery status.",
  noindex: true,
});

export default function MyOrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
