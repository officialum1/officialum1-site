"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

export default function ServicesSection() {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => setServices(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch((err) => console.error("Failed to load services", err));
  }, []);

  return (
    <section id="services" className="section-padding services-shell">
      <div className="container">
        <div className="services-header">
          <span className="section-label">Services</span>
          <h2>Focused offers with cleaner scanning on mobile</h2>
          <p>
            We trimmed this section into a tighter grid so visitors can understand what you do without getting lost
            in a wall of options.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
              <a href="/services" className="service-link">
                Learn more
                <ArrowRight size={15} />
              </a>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .services-shell {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(248, 250, 252, 0.9) 100%);
        }

        .services-header {
          max-width: 720px;
          margin: 0 auto 32px;
          text-align: center;
        }

        .services-header h2 {
          margin: 12px 0;
        }

        .services-header p {
          margin: 0 auto;
          max-width: 620px;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .service-card {
          padding: 24px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 18px 44px rgba(15, 23, 42, 0.07);
        }

        .service-icon {
          width: 52px;
          height: 52px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          margin-bottom: 16px;
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(14, 165, 233, 0.14));
          font-size: 1.5rem;
        }

        .service-card h3 {
          color: #0f172a;
          margin-bottom: 10px;
          font-size: 1.1rem;
        }

        .service-card p {
          margin-bottom: 18px;
        }

        .service-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #4f46e5;
          font-weight: 700;
          text-decoration: none;
        }

        @media (max-width: 980px) {
          .services-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .services-grid {
            grid-template-columns: 1fr;
          }

          .service-card {
            padding: 20px;
            border-radius: 22px;
          }
        }
      `}</style>
    </section>
  );
}
