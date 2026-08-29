import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/login",
  title: "Sign In | OfficialUM1",
  description: "Sign in to your OfficialUM1 buyer account to track orders and manage your profile.",
  noindex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
