"use client";
export default function Footer() {
    return (
        <footer style={{
            background: 'linear-gradient(to top, #000 0%, #050505 100%)',
            borderTop: '1px solid var(--glass-border)',
            paddingTop: '5rem',
            paddingBottom: '2rem',
            marginTop: '5rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Glow */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60%',
                height: '400px',
                background: 'radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%)',
                zIndex: 0,
                pointerEvents: 'none'
            }}></div>

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>

                {/* Top Section: CTA + Newsletter */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4rem',
                    paddingBottom: '3rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    gap: '2rem'
                }}>
                    <div style={{ maxWidth: '500px' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Ready to setup your digital presence?
                        </h2>
                        <p style={{ color: '#888' }}>Join our newsletter for exclusive tips and updates.</p>
                    </div>

                    <div style={{ flex: 1, maxWidth: '400px' }}>
                        <form style={{ display: 'flex', gap: '0.5rem' }} onSubmit={async (e) => {
                            e.preventDefault();
                            const input = (e.target as any)[0] as HTMLInputElement;
                            const email = input.value;
                            if (!email) return;

                            try {
                                const res = await fetch('/api/newsletter', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ email })
                                });
                                if (res.ok) {
                                    alert('Subscribed Successfully!');
                                    input.value = '';
                                }
                            } catch (err) {
                                alert('Error subscribing. Try again.');
                            }
                        }}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                required
                                style={{
                                    padding: '0.8rem 1.2rem',
                                    borderRadius: '50px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    width: '100%',
                                    outline: 'none'
                                }}
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '50px', whiteSpace: 'nowrap' }}>
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem' }}>

                    {/* Brand Column */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                            <img src="/logo.jpg" alt="OfficialUM1 Logo" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>OfficialUM1</h3>
                        </div>
                        <p style={{ color: '#888', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                            Translating digital aspirations into tangible results for brands worldwide. We build the future of your business.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <a href="https://facebook.com/officialum1" target="_blank" rel="noopener noreferrer" className="social-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02c0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89c1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" /></svg>
                            </a>
                            <a href="https://instagram.com/officialum1" target="_blank" rel="noopener noreferrer" className="social-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3z" /></svg>
                            </a>
                            <a href="https://linkedin.com/company/officialum1" target="_blank" rel="noopener noreferrer" className="social-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 style={{ marginBottom: '1.2rem', color: 'white', fontSize: '1.1rem' }}>Services</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <li><a href="/services" className="footer-link">Web Development</a></li>
                            <li><a href="/services" className="footer-link">SEO Optimization</a></li>
                            <li><a href="/services" className="footer-link">Social Media Management</a></li>
                            <li><a href="/store" className="footer-link">Rent Pre-Ranked Sites</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '1.2rem', color: 'white', fontSize: '1.1rem' }}>Company</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <li><a href="/about" className="footer-link">About Us</a></li>
                            <li><a href="/work" className="footer-link">Our Work</a></li>
                            <li><a href="/reviews" className="footer-link">Reviews</a></li>
                            <li><a href="/contact" className="footer-link">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '1.2rem', color: 'white', fontSize: '1.1rem' }}>Resources</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <li><a href="/help" className="footer-link">Help Center (FAQ)</a></li>
                            <li><a href="/tools/password-generator" className="footer-link">Password Generator</a></li>
                            <li><a href="/blog" className="footer-link">Insights & Blog</a></li>
                            <li><a href="/backlink-checker" className="footer-link">Backlink Checker</a></li>
                            <li><a href="/terms" className="footer-link">Terms & Conditions</a></li>
                            <li><a href="/privacy" className="footer-link">Privacy Policy</a></li>
                        </ul>
                    </div>

                </div>

                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    marginTop: '4rem',
                    paddingTop: '2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    color: '#666',
                    fontSize: '0.9rem'
                }}>
                    <p>&copy; {new Date().getFullYear()} OfficialUM1. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <span>Sahiwal, Punjab, Pakistan</span>
                        <a href="mailto:hello@officialum1.com" style={{ color: 'var(--text-muted)' }}>hello@officialum1.com</a>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .footer-link {
                    color: #888;
                    transition: all 0.2s;
                    font-size: 0.95rem;
                }
                .footer-link:hover {
                    color: var(--primary);
                    padding-left: 5px;
                }
                .social-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #ccc;
                    transition: all 0.3s;
                    border: 1px solid transparent;
                }
                .social-icon:hover {
                    background: var(--primary);
                    color: white;
                    transform: translateY(-3px);
                    border-color: rgba(255,255,255,0.2);
                    box-shadow: 0 5px 15px rgba(79, 70, 229, 0.4);
                }
            `}</style>
        </footer>
    );
}
