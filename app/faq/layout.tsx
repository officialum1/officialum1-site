import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "FAQ | Knowledge Base & Support Center",
    description: "Find instant answers to common questions about OfficialUM1 services, delivery, payments, and security. Our 24/7 support is here to help.",
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
