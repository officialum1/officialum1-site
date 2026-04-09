import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BacklinkChecker from "@/components/BacklinkChecker";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Free Backlink Checker & Domain Authority Tool | OfficialUM1",
    description: "Check your website's Domain Authority (DA) and Page Authority (PA) for free. Get a comprehensive backlink analysis report to improve your SEO rankings.",
    keywords: ["Free Backlink Checker", "Domain Authority Checker", "Check DA PA", "SEO Tools", "Website Authority Analysis"],
    openGraph: {
        title: "Free Backlink & Domain Authority Checker",
        description: "Instant analysis of your website's authority and trust signals.",
        images: ['/logo.jpg'],
    }
};

export default function BacklinkCheckerPage() {
    return (
        <main>
            <Navbar />
            <div style={{ paddingTop: '120px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem', padding: '0 1rem' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Backlink Intelligence Tool
                    </h1>
                    <p style={{ color: '#aaa', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                        Understand your site's power. Analyze your link profile and discover opportunities to rank higher.
                    </p>
                </div>

                <BacklinkChecker />

                <div className="container" style={{ marginTop: '4rem', marginBottom: '4rem' }}>
                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Why Check Your Domain Authority?</h3>
                        <p style={{ color: '#ccc', lineHeight: '1.6' }}>
                            Domain Authority (DA) is a search engine ranking score developed by Moz that predicts how likely a website is to rank on search engine result pages (SERPs). A Domain Authority score ranges from one to 100, with higher scores corresponding to a greater ability to rank.
                            <br /><br />
                            <strong>Use our tool to:</strong>
                            <ul style={{ marginLeft: '1.5rem', marginTop: '1rem' }}>
                                <li>Benchmark against competitors</li>
                                <li>Track your SEO efforts over time</li>
                                <li>Identify bad backlinks that might be hurting your score</li>
                                <li>Find high-quality guest posting opportunities</li>
                            </ul>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
