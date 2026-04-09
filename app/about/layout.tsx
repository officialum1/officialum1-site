import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "About Muhammad Umar Mumtaz | The Vision Behind OfficialUM1",
    description: "Learn about the mission, vision, and leadership of OfficialUM1. Founded by Muhammad Umar Mumtaz, we bridge the gap between technology and business growth.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
