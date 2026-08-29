import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WorkSection from "@/components/WorkSection";

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Our Work | Case Studies & Success Stories",
    description: "Explore how OfficialUM1 has helped brands scale through custom websites, SEO campaigns, and social media strategies.",
    keywords: ["SEO Case Studies", "Web Design Portfolio", "Digital Marketing Results"],
};

export default function WorkPage() {
    return (
        <main>
            <Navbar />
            <div style={{ paddingTop: '100px' }}>
                <WorkSection />
            </div>
            <Footer />
        </main>
    );
}
