import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/verify",
  title: "Verify Account | OfficialUM1",
  description: "Complete account verification for OfficialUM1.",
  noindex: true,
});

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
