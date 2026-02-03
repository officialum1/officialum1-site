"use client";

export default function PricingSection() {
    const plans = [
        {
            name: "Starter",
            price: "$499",
            features: ["5-Page Custom Website", "Basic SEO Setup", "Mobile Responsive", "Contact Form Integration", "1 Month Support"],
            recommend: false
        },
        {
            name: "Growth",
            price: "$999",
            features: ["10-Page Custom Website", "Advanced SEO & Schema", "Speed Optimization (90+)", "Blog Setup", "Social Media Integration", "3 Months Support"],
            recommend: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            features: ["Full E-Commerce / Web App", "Custom Backend", "API Integrations", "Advanced Security", "Priority 24/7 Support"],
            recommend: false
        }
    ];

    return (
        <section className="section-padding">
            <div className="container">
                <div className="section-header">
                    <h2>Transparent <span className="text-gradient">Pricing</span></h2>
                    <p className="subheading" style={{ margin: '1rem auto' }}>Clear, high-performance packages with no hidden costs.</p>
                </div>

                <div className="grid-3" style={{ alignItems: 'center' }}>
                    {plans.map((plan, index) => (
                        <div key={index} className="glass" style={{
                            padding: '3rem 2rem',
                            border: plan.recommend ? '1px solid var(--primary)' : '',
                            transform: plan.recommend ? 'scale(1.05)' : '',
                            boxShadow: plan.recommend ? '0 20px 40px var(--primary-glow)' : ''
                        }}>
                            {plan.recommend && (
                                <div style={{
                                    position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)',
                                    background: 'var(--primary)', padding: '0.4rem 1.2rem', borderRadius: '50px',
                                    fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px'
                                }}>
                                    MOST POPULAR
                                </div>
                            )}
                            <h3 style={{ fontSize: '1.4rem', opacity: 0.9 }}>{plan.name}</h3>
                            <div style={{ fontSize: '3rem', fontWeight: '900', color: '#fff', margin: '1rem 0 2.5rem' }}>{plan.price}</div>

                            <ul style={{ listStyle: 'none', marginBottom: '3rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {plan.features.map((feature, i) => (
                                    <li key={i} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', fontSize: '0.95rem' }}>
                                        <span style={{ color: 'var(--success)', fontSize: '1.2rem' }}>✓</span> {feature}
                                    </li>
                                ))}
                            </ul>

                            <a href="/contact" className={`btn ${plan.recommend ? 'btn-primary' : 'btn-outline'}`} style={{ width: '100%', padding: '1.1rem' }}>
                                Get Started
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
