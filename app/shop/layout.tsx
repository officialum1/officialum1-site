import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Premium Digital Shop | Buy Social Accounts & Verified Assets",
    description: "Browse our collection of high-quality aged social media accounts, verified assets, and premium digital solutions. Instant delivery and safe transactions guaranteed.",
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
