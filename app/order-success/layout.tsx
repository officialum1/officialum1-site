import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/order-success",
  title: "Order Confirmed | OfficialUM1",
  description: "Your OfficialUM1 order confirmation and next steps.",
  noindex: true,
});

export default function OrderSuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
