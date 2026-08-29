import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/verify-email",
  title: "Verify Email | OfficialUM1",
  description: "Confirm your email address to activate your OfficialUM1 account.",
  noindex: true,
});

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
