import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicesSection from "@/components/ServicesSection";
import ROICalculator from "@/components/ROICalculator";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Services | SEO, Web Development & Guest Posting",
    description: "OfficialUM1 offers top-tier digital services including SEO Optimization, Custom Web Development, High-DA Guest Posting, and Social Media Growth.",
    keywords: ["SEO Services Sahiwal", "Guest Posting Agency", "Web Development Pakistan", "Speed Optimization Service", "Buy High DA Backlinks"],
};

export default function ServicesPage() {
    return (
        <main>
            <Navbar />
            <div style={{ paddingTop: '100px' }}>
                <ServicesSection />
                <ROICalculator />
            </div>
            <Footer />
        </main>
    );
}
