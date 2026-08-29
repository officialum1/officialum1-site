import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/checkout",
  title: "Checkout | OfficialUM1",
  description: "Secure checkout for OfficialUM1 digital products and services.",
  noindex: true,
});

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
