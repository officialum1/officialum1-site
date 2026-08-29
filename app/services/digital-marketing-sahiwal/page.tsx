import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Metadata } from 'next';
import { PageHero } from "@/components/ui/PageHero";
import Script from "next/script";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
    title: "Digital Marketing Agency Sahiwal | OfficialUM1",
    description: "OfficialUM1 is Sahiwal's top digital marketing agency. We offer SEO, web development, social media marketing, guest posting and backlinks. Serving Sahiwal, Okara, Pakpattan and all of Punjab.",
    alternates: {
        canonical: "https://officialum1.com/services/digital-marketing-sahiwal",
    },
};

export default function SeoGeneratedServicePage() {
    const faqJsonLd = {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What makes your Sahiwal agency unique?","acceptedAnswer":{"@type":"Answer","text":"We fuse global technical standards with deep local context directly from Sahiwal, guaranteeing relevance."}},{"@type":"Question","name":"Do you serve other areas near Sahiwal?","acceptedAnswer":{"@type":"Answer","text":"Yes, we serve Pakpattan, Okara, and all neighboring regions from our central hub."}}]};
    const breadcrumbJsonLd = {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://officialum1.com"},{"@type":"ListItem","position":2,"name":"Services","item":"https://officialum1.com/services"},{"@type":"ListItem","position":3,"name":"Digital Marketing Sahiwal","item":"https://officialum1.com/services/digital-marketing-sahiwal"}]};
    const serviceSchema = {"@context":"https://schema.org","@type":"Service","name":"Digital Marketing Agency in Sahiwal, Pakistan","provider":{"@type":"Organization","name":"OfficialUM1"},"description":"OfficialUM1 is Sahiwal's top digital marketing agency. We offer SEO, web development, social media marketing, guest posting and backlinks. Serving Sahiwal, Okara, Pakpattan and all of Punjab.","url":"https://officialum1.com/services/digital-marketing-sahiwal"};

    return (
        <main>
            <Navbar />
            
            {/* SEO Scripts */}
            <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <Script id="service-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Digital Marketing Sahiwal" }]}
                    label="Specialized Service"
                    title={<>Digital Marketing Agency in Sahiwal, Pakistan</>}
                    description="Elevate your infrastructure with global standards tailored to specific localized demands."
                />

                {/* Content Injector */}
                
<section className="py-[80px] bg-white">
    <div className="container max-w-4xl">
        <h2 className="text-[36px] font-bold mb-6 text-gray-900">Dominate the Sahiwal Market with High-Performance Strategies</h2>
        <p className="text-gray-700 text-[18px] mb-6 leading-relaxed">As the premier digital marketing agency Sahiwal founders rely on, OfficialUM1 crafts conversion engines that drive local growth. Our team deeply understands the Sahiwal commercial climate and blends this localized insight with global frameworks.</p>
        <p className="text-gray-700 text-[18px] mb-6 leading-relaxed">Operating directly out of Sahiwal, we build infrastructures for scaling brands. Whether you run a brick-and-mortar retailer in Sahiwal or a regional logistics network, our specialized methodologies guarantee visibility.</p>
        
        <h3 className="text-[28px] font-semibold mt-10 mb-4 text-gray-900">Service Pricing Guide</h3>
        <ul className="space-y-4 mb-8">
            <li className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex justify-between"><strong>Local SEO Management</strong> <span>Starts at $199/mo</span></li>
            <li className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex justify-between"><strong>Custom Web Design</strong> <span>Starts at $499</span></li>
            <li className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex justify-between"><strong>Social Media Growth</strong> <span>Starts at $299/mo</span></li>
        </ul>

        <h3 className="text-[28px] font-semibold mt-10 mb-4 text-gray-900">Why Choose Us?</h3>
        <p className="text-gray-700 mb-6">We reside right here in Sahiwal. That means real-time communication, absolute accountability, and strategies anchored specifically in the unique behaviors of Sahiwal, Punjab consumers.</p>

        <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-100 mt-12">
            <h4 className="font-bold text-indigo-900 mb-2">Local Trust Signals</h4>
            <p className="text-indigo-700">📍 Office Location: Sahiwal, Punjab, Pakistan<br/>📞 Contact Direct: +923237102924</p>
        </div>
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
