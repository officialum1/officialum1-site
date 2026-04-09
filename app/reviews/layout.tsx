import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Customer Reviews | Trust & Performance Verified",
    description: "Read what thousands of happy clients say about OfficialUM1. Our 4.9/5 average rating reflects our commitment to excellence in digital services.",
};

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
