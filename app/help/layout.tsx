import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/help",
  title: "Help Center | OfficialUM1",
  description:
    "OfficialUM1 help articles: account access, checkout, delivery, refunds, and using our digital marketing services.",
  keywords: "OfficialUM1 help, help center, account help",
});

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
