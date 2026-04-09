import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "OfficialUM1 Blog | SEO, Marketing & Tech Insights",
    description: "Expert analysis and actionable insights on search engine optimization, digital marketing strategies, and the latest in web technology. Scale your business with OfficialUM1.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
