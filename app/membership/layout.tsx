import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/membership",
  title: "VIP Membership | OfficialUM1 Shop Perks",
  description:
    "OfficialUM1 membership tiers with shop discounts, early access, and priority support for frequent buyers.",
  keywords: "OfficialUM1 membership, VIP discounts digital products",
});

export default function MembershipLayout({ children }: { children: React.ReactNode }) {
  return children;
}
