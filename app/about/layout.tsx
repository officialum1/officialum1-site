import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/about",
  title: "About OfficialUM1 | Top Digital Marketing Agency in Sahiwal",
  description:
    "Learn about OfficialUM1, the leading digital marketing agency in Sahiwal, Pakistan. Specializing in high-ranking SEO, web development, and digital growth.",
  keywords: "Digital Marketing Agency Sahiwal, digital marketing agency in sahiwal, SEO agency sahiwal, OfficialUM1 about, Muhammad Umar Mumtaz",
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
