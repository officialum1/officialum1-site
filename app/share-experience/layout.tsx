import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/share-experience",
  title: "Share Your Experience | OfficialUM1",
  description:
    "Tell us about your experience with OfficialUM1 services or purchases. Your feedback helps us improve delivery and support.",
  keywords: "OfficialUM1 feedback, share experience, customer stories",
});

export default function ShareExperienceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
