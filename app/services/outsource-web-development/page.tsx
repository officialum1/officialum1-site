import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Metadata } from 'next';
import { PageHero } from "@/components/ui/PageHero";
import Script from "next/script";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
    title: "Outsource Web Development to Pakistan | Reliable Offshoring | OfficialUM1",
    description: "Save budget without dropping standards. Seamlessly Outsource Web Development to Pakistan’s premier engineering cluster for high-end Next.js & PHP delivery.",
    alternates: {
        canonical: "https://officialum1.com/services/outsource-web-development",
    },
};

export default function SeoGeneratedServicePage() {
    const faqJsonLd = {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Which technologies do you excel in?","acceptedAnswer":{"@type":"Answer","text":"Our core competency houses dynamic Next.js, core React, Laravel, and secure, performance-loaded database architectures."}}]};
    const breadcrumbJsonLd = {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://officialum1.com"},{"@type":"ListItem","position":2,"name":"Services","item":"https://officialum1.com/services"},{"@type":"ListItem","position":3,"name":"Outsource Web Dev","item":"https://officialum1.com/services/outsource-web-development"}]};
    const serviceSchema = {"@context":"https://schema.org","@type":"Service","name":"Outsource Web Development to Pakistan","provider":{"@type":"Organization","name":"OfficialUM1"},"description":"Save budget without dropping standards. Seamlessly Outsource Web Development to Pakistan’s premier engineering cluster for high-end Next.js & PHP delivery.","url":"https://officialum1.com/services/outsource-web-development"};

    return (
        <main>
            <Navbar />
            
            {/* SEO Scripts */}
            <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <Script id="service-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Outsource Web Dev" }]}
                    label="Specialized Service"
                    title={<>Outsource Web Development to Pakistan</>}
                    description="Elevate your infrastructure with global standards tailored to specific localized demands."
                />

                {/* Content Injector */}
                
<section className="py-[80px] bg-white">
    <div className="container max-w-4xl">
        <h2 className="text-[36px] font-bold mb-6 text-gray-900">Enterprise-Grade Code At Sustainable Scale</h2>
        <p className="text-gray-700 text-[18px] mb-6 leading-relaxed">We facilitate high-reliability execution. Choosing to outsource web development to Pakistan using OfficialUM1 allows access to world-class engineering velocity without ballooning internal overheads.</p>
    </div>
</section>
        

                {/* Universal High-Velocity CTA */}
                <section className="py-[100px] bg-gray-50">
                    <div className="container">
                        <div className="rounded-3xl p-12 border overflow-hidden relative" style={{ borderColor: "rgba(0,0,0,0.05)", background: "linear-gradient(135deg, #1E1B4B, #4338CA)" }}>
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                            <div className="relative text-center max-w-3xl mx-auto text-white">
                                <Badge className="bg-white/20 text-white mb-4">Scale Smarter</Badge>
                                <h2 className="text-[44px] font-extrabold mb-4 leading-tight">Ready to Architect Your Edge?</h2>
                                <p className="text-indigo-100 text-[18px] mb-8">Let’s strategize your path toward absolute market dominance today. No obligation, just real mapping.</p>
                                <a href="/contact" className="inline-flex items-center justify-center px-8 py-4 text-[16px] font-bold text-indigo-900 bg-white rounded-xl shadow-lg hover:bg-indigo-50 transition-all duration-300 transform hover:-translate-y-1">
                                    Get Started Now
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            
            <Footer />
        </main>
    );
}
