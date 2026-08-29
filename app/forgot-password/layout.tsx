import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/forgot-password",
  title: "Forgot Password | OfficialUM1",
  description: "Reset your OfficialUM1 account password securely.",
  noindex: true,
});

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
