import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/contact",
  title: "Contact OfficialUM1 | Free Consultation — SEO & Web Development",
  description:
    "Contact OfficialUM1 for SEO, web development, and social media services. Based in Sahiwal, Pakistan; serving clients worldwide.",
  keywords: "contact OfficialUM1, digital marketing consultation, SEO quote Pakistan",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
