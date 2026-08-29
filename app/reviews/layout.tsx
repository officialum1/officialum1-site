import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/reviews",
  title: "Client Reviews | OfficialUM1 Digital Marketing & Shop",
  description:
    "Read verified client reviews for OfficialUM1 SEO, web development, and digital product delivery. Transparent feedback from real buyers.",
  keywords: "OfficialUM1 reviews, client testimonials, SEO agency reviews Pakistan",
});

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
