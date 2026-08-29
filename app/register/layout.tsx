import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/register",
  title: "Create Account | OfficialUM1",
  description: "Create a free OfficialUM1 buyer account for faster checkout and order history.",
  noindex: true,
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
