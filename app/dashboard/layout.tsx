import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Dashboard | OfficialUM1",
  description: "Manage your OfficialUM1 account, orders, wallet, and verification status.",
  robots: { index: false, follow: true },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
