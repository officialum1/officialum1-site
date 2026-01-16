import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogSection from "@/components/BlogSection";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import WorkSection from "@/components/WorkSection";
import FreeAuditSection from "@/components/FreeAuditSection";
import TechTicker from "@/components/TechTicker";
import FAQSection from "@/components/FAQSection";
import PricingSection from "@/components/PricingSection";

export default function Home() {
  return (
    <main>
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="container" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="glass" style={{ display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '50px', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--accent)' }}>
            ✨ Elevate Your Digital Presence
          </div>
          <h1>
            Translating Digital Aspirations <br />
            into <span className="text-gradient">Tangible Results</span>
          </h1>
          <p className="subheading" style={{ marginTop: '1.5rem' }}>
            We are OfficialUM1. A premier digital agency crafting high-performance websites,
            data-driven SEO strategies, and magnetic social media campaigns.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="/contact" className="btn btn-primary">Start Your Project</a>
            <a href="/services" className="btn btn-outline">Explore Services</a>
          </div>
        </div>
      </section>

      {/* Tech Stack Ticker */}
      <TechTicker />

      {/* Services Section */}
      <ServicesSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Work Section */}
      <WorkSection />

      {/* Why Us / About Section */}

      {/* Why Us / About Section */}
      <section id="about" className="section-padding" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', right: 0, top: '20%', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.1, borderRadius: '50%' }}></div>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h2>Driven by Data,<br /> Fueled by <span className="text-gradient">Creativity</span></h2>
              <p style={{ marginBottom: '1.5rem' }}>
                At OfficialUM1, we don't just build websites; we build business engines.
                located in Sahiwal, Pakistan, we serve a global clientele with a mission to
                demystify the digital landscape.
              </p>
              <ul style={{ listStyle: 'none', display: 'grid', gap: '1rem' }}>
                {['Data-Driven Approach', 'Full-Cycle Development', 'Transparent Communication', 'Results-Oriented'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--accent)' }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div className="glass" style={{ padding: '3rem', borderRadius: '20px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -10, left: -10, width: '100px', height: '100px', borderTop: '2px solid var(--secondary)', borderLeft: '2px solid var(--secondary)', borderRadius: '20px 0 0 0' }}></div>
                <h3 style={{ fontSize: '3rem', color: 'white' }}>100+</h3>
                <p>Projects Delivered</p>
                <div style={{ margin: '2rem 0', height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                <h3 style={{ fontSize: '3rem', color: 'white' }}>98%</h3>
                <p>Client Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free Audit Lead Magnet */}
      <FreeAuditSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Blog Section */}
      <BlogSection />

      {/* CTA / Contact Section */}
      <section className="section-padding" style={{ textAlign: 'center' }}>
        <div className="container">
          <div className="glass" style={{ padding: '4rem 2rem', borderRadius: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Ready to Transform Your Digital Presence?</h2>
            <p className="subheading" style={{ margin: '1rem auto 2rem' }}>
              Let's discuss how we can help your brand grow today.
            </p>
            <a href="/contact" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 3rem' }}>
              Get in Touch
            </a>
          </div>
        </div>
      </section>


      <Footer />
    </main>
  );
}
