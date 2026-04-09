"use client";

export default function Footer() {
  return (
    <footer className="footer-shell">
      <div className="container">
        <div className="footer-card">
          <div className="footer-top">
            <div className="footer-brand-block">
              <div className="footer-brand">
                <img src="/logo.jpg" alt="OfficialUM1 Logo" className="footer-logo" />
                <div>
                  <div className="footer-brand-name">OfficialUM1</div>
                  <div className="footer-brand-sub">Modern growth, clean execution</div>
                </div>
              </div>
              <h2>Build a digital presence that feels premium and easy to trust.</h2>
              <p>
                We help brands launch, sell, and scale with clearer UX, stronger storefronts, and better customer
                journeys across services and digital products.
              </p>
            </div>

            <form
              className="footer-newsletter"
              onSubmit={async (e) => {
                e.preventDefault();
                const input = (e.target as any)[0] as HTMLInputElement;
                const email = input.value;
                if (!email) return;

                try {
                  const res = await fetch("/api/newsletter", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                  });
                  if (res.ok) {
                    alert("Subscribed Successfully!");
                    input.value = "";
                  }
                } catch {
                  alert("Error subscribing. Try again.");
                }
              }}
            >
              <div className="footer-newsletter-label">Stay in the loop</div>
              <p>Get launch updates, product drops, and practical growth advice.</p>
              <div className="footer-newsletter-row">
                <input type="email" placeholder="Enter your email" required className="footer-input" />
                <button type="submit" className="btn btn-primary">
                  Subscribe
                </button>
              </div>
            </form>
          </div>

          <div className="footer-links">
            <div>
              <div className="footer-heading">Services</div>
              <ul>
                <li><a href="/services">Web Development</a></li>
                <li><a href="/services">SEO Optimization</a></li>
                <li><a href="/services">Social Media Management</a></li>
                <li><a href="/store">Rentals</a></li>
              </ul>
            </div>

            <div>
              <div className="footer-heading">Company</div>
              <ul>
                <li><a href="/about">About Us</a></li>
                <li><a href="/work">Our Work</a></li>
                <li><a href="/reviews">Reviews</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>

            <div>
              <div className="footer-heading">Resources</div>
              <ul>
                <li><a href="/help">Help Center</a></li>
                <li><a href="/blog">Insights & Blog</a></li>
                <li><a href="/terms">Terms & Conditions</a></li>
                <li><a href="/privacy">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <div className="footer-heading">Contact</div>
              <ul>
                <li>Sahiwal, Punjab, Pakistan</li>
                <li><a href="mailto:hello@officialum1.com">hello@officialum1.com</a></li>
                <li><a href="/services/form-business">US Business Hub</a></li>
                <li><a href="/shop">Browse Shop</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div>&copy; {new Date().getFullYear()} OfficialUM1. All rights reserved.</div>
            <div className="footer-bottom-links">
              <a href="/terms">Terms</a>
              <a href="/privacy">Privacy</a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer-shell {
          margin-top: 80px;
          padding-bottom: 28px;
          background: linear-gradient(180deg, rgba(248, 250, 252, 0.35) 0%, rgba(226, 232, 240, 0.45) 100%);
        }

        .footer-card {
          padding: 32px;
          border-radius: 32px;
          background: linear-gradient(180deg, #0f172a, #111827);
          color: #e2e8f0;
          box-shadow: 0 28px 72px rgba(15, 23, 42, 0.22);
        }

        .footer-top {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
          gap: 28px;
          padding-bottom: 28px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }

        .footer-logo {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .footer-brand-name {
          font-weight: 800;
          font-size: 1rem;
        }

        .footer-brand-sub {
          color: #94a3b8;
          font-size: 0.78rem;
        }

        .footer-brand-block h2 {
          color: #ffffff;
          margin-bottom: 12px;
          max-width: 13ch;
        }

        .footer-brand-block p,
        .footer-newsletter p {
          margin: 0;
          color: #94a3b8;
        }

        .footer-newsletter {
          padding: 22px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .footer-newsletter-label {
          margin-bottom: 8px;
          color: #ffffff;
          font-weight: 700;
        }

        .footer-newsletter-row {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .footer-input {
          width: 100%;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          padding: 0 16px;
          min-height: 48px;
          outline: none;
        }

        .footer-links {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
          padding: 28px 0;
        }

        .footer-heading {
          margin-bottom: 12px;
          color: #ffffff;
          font-size: 0.84rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .footer-links ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 10px;
        }

        .footer-links li,
        .footer-links a {
          color: #94a3b8;
          text-decoration: none;
        }

        .footer-links a:hover,
        .footer-bottom a:hover {
          color: #ffffff;
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          font-size: 0.92rem;
        }

        .footer-bottom-links {
          display: flex;
          gap: 16px;
        }

        .footer-bottom-links a {
          color: #94a3b8;
          text-decoration: none;
        }

        @media (max-width: 960px) {
          .footer-top,
          .footer-links {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 640px) {
          .footer-card {
            padding: 22px;
            border-radius: 24px;
          }

          .footer-top,
          .footer-links,
          .footer-newsletter-row,
          .footer-bottom {
            grid-template-columns: 1fr;
            flex-direction: column;
            align-items: flex-start;
          }

          .footer-newsletter-row :global(.btn) {
            width: 100%;
          }

          .footer-input {
            min-height: 46px;
          }
        }
      `}</style>
    </footer>
  );
}
