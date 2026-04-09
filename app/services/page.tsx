import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ROICalculator from "@/components/ROICalculator";
import SuccessRoadmap from "@/components/SuccessRoadmap";
import { Metadata } from 'next';
import { PageHero } from "@/components/ui/PageHero";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Globe, Search, Share2, Sparkles, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
    title: "Services | SEO, Web Development & Guest Posting",
    description: "OfficialUM1 offers top-tier digital services including SEO Optimization, Custom Web Development, High-DA Guest Posting, and Social Media Growth.",
    keywords: ["SEO Services Sahiwal", "Guest Posting Agency", "Web Development Pakistan", "Speed Optimization Service", "Buy High DA Backlinks"],
};

import Script from "next/script";

export default function ServicesPage() {
    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": "Digital Marketing & Web Development",
        "provider": {
            "@id": "https://officialum1.com/#organization"
        },
        "areaServed": "Worldwide",
        "description": "Premium SEO, Web Development, and Social Growth services tailored for global brands."
    };

    return (
        <main>
            <Navbar />
            <Script
                id="service-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
                    label="Services"
                    title={<>What We Build For You</>}
                    description="High-performance systems, SEO engines, and social growth stacks designed to convert—fast."
                />

                <section className="py-[120px] bg-white">
                    <div className="container">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { icon: Globe, title: "Web Development", desc: "Modern, conversion-first websites and internal tools built for speed and scale." },
                                { icon: Search, title: "SEO Optimization", desc: "Technical + content SEO that compounds traffic and ranks for profitable intent." },
                                { icon: TrendingUp, title: "Growth Systems", desc: "Funnels, landing pages, and analytics loops that turn visits into orders." },
                                { icon: Share2, title: "Social Media Growth", desc: "High-quality account growth strategies and acquisition-ready audiences." },
                                { icon: Sparkles, title: "Content Production", desc: "Blogs, KB, and product pages that read well and rank higher." },
                                { icon: Globe, title: "Guest Posting", desc: "High-DA placements with clean outreach and real editorial relevance." },
                            ].map((s) => (
                                <Card key={s.title} className="p-8">
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                                        <s.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-[24px] font-semibold text-gray-900 mb-2">{s.title}</h3>
                                    <p className="text-gray-600 text-[16px] leading-[1.7]">{s.desc}</p>
                                    <div className="mt-6">
                                        <a href="/contact" className="text-indigo-600 font-semibold hover:underline">
                                            Learn More →
                                        </a>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="divider" />

                <section className="py-[120px]" style={{ background: "var(--bg-alt)" }}>
                    <div className="container">
                        <div className="rounded-2xl p-10 border text-white overflow-hidden relative" style={{ borderColor: "rgba(255,255,255,0.12)", background: "linear-gradient(135deg, #312E81, #1D4ED8)" }}>
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
                            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                <div>
                                    <div className="mb-3">
                                        <Badge className="bg-white/15 text-white border border-white/20">Conversion CTA</Badge>
                                    </div>
                                    <h2 className="text-[40px] font-bold leading-tight mb-3">Ready to scale faster?</h2>
                                    <p className="text-white/80 max-w-2xl">Let’s map your next 30 days: what to build, what to rank, and what to automate.</p>
                                </div>
                                <div className="flex gap-3">
                                    <a href="/work" className="btn-outline bg-white text-indigo-700 border-white hover:shadow-lg">View Work</a>
                                    <a href="/contact" className="btn-primary">Get Started</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-[120px] bg-white">
                    <div className="container">
                        <SuccessRoadmap />
                    </div>
                </section>

                <section className="py-[120px]" style={{ background: "var(--bg-alt)" }}>
                    <div className="container">
                        <ROICalculator />
                    </div>
                </section>
            </div>
            <Footer />
        </main>
    );
}
