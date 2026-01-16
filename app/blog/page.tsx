import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogSection from "@/components/BlogSection";

export const dynamic = 'force-dynamic';

export default function BlogPage() {
    return (
        <main>
            <Navbar />
            <div style={{ paddingTop: '100px' }}>
                <BlogSection />
            </div>
            <Footer />
        </main>
    );
}
