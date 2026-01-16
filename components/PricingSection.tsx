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
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2>Transparent <span className="text-gradient">Pricing</span></h2>
                    <p className="subheading">Invest in your digital future with clear, no-hidden-cost packages.</p>
                </div>

                <div className="grid-3">
                    {plans.map((plan, index) => (
                        <div key={index} className="glass" style={{
                            padding: '2rem',
                            borderRadius: '16px',
                            position: 'relative',
                            border: plan.recommend ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                            transform: plan.recommend ? 'scale(1.05)' : 'scale(1)',
                            zIndex: plan.recommend ? 10 : 1
                        }}>
                            {plan.recommend && (
                                <div style={{
                                    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                                    background: 'var(--primary)', padding: '0.2rem 1rem', borderRadius: '20px',
                                    fontSize: '0.8rem', fontWeight: 'bold'
                                }}>
                                    MOST POPULAR
                                </div>
                            )}
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{plan.name}</h3>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', color: 'white' }}>{plan.price}</div>

                            <ul style={{ listStyle: 'none', marginBottom: '2rem', textAlign: 'left' }}>
                                {plan.features.map((feature, i) => (
                                    <li key={i} style={{ marginBottom: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#ccc' }}>
                                        <span style={{ color: 'var(--accent)' }}>✓</span> {feature}
                                    </li>
                                ))}
                            </ul>

                            <a href="/contact" className={`btn ${plan.recommend ? 'btn-primary' : 'btn-outline'}`} style={{ width: '100%', textAlign: 'center' }}>
                                Get Started
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
