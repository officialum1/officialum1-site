"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, FileCheck, Landmark, Shield } from "lucide-react";

const features = [
  {
    icon: BriefcaseBusiness,
    title: "Global-ready setup",
    desc: "A straightforward path for non-residents who want a US company structure without decoding the process alone.",
  },
  {
    icon: FileCheck,
    title: "EIN and compliance",
    desc: "Clear support for tax ID steps, filings, and the recurring items founders usually miss.",
  },
  {
    icon: Landmark,
    title: "State-by-state options",
    desc: "Compare common formation routes like Wyoming, Delaware, and Texas in one place.",
  },
  {
    icon: Shield,
    title: "Trusted support",
    desc: "Registered agent and admin support wrapped into a more understandable offer.",
  },
];

const states = [
  { state: "Wyoming", fee: "$100", note: "Lean, founder-friendly" },
  { state: "Delaware", fee: "$90", note: "Popular with startups" },
  { state: "Texas", fee: "$300", note: "Stronger enterprise fit" },
];

export default function BusinessSection() {
  return (
    <section id="business-hub" className="business-shell">
      <div className="container">
        <div className="business-grid">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="section-label">Business Formation</span>
            <h2>Launch in the US with a calmer, more trustworthy experience</h2>
            <p className="business-copy">
              This section now reads like a premium service lane instead of a separate dark product. It explains the
              offer faster, improves trust, and holds up much better on mobile.
            </p>

            <div className="business-points">
              <div className="business-pill">
                <BadgeCheck size={16} />
                <span>Clear next steps</span>
              </div>
              <div className="business-pill">
                <BadgeCheck size={16} />
                <span>Transparent estimated costs</span>
              </div>
              <div className="business-pill">
                <BadgeCheck size={16} />
                <span>Founder-friendly support</span>
              </div>
            </div>

            <div className="business-features">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div key={feature.title} className="business-feature">
                    <div className="business-feature-icon">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3>{feature.title}</h3>
                      <p>{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link href="/services/form-business" className="btn btn-primary">
              Launch Your Business
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="business-panel"
          >
            <div className="business-panel-header">
              <div>
                <p className="business-panel-overline">Formation Explorer</p>
                <h3>Compare popular state setups</h3>
              </div>
              <div className="business-panel-chip">Modernized</div>
            </div>

            <div className="business-state-list">
              {states.map((item) => (
                <div key={item.state} className="business-state-card">
                  <div>
                    <strong>{item.state}</strong>
                    <p>{item.note}</p>
                  </div>
                  <div className="business-fee">{item.fee} state fee</div>
                </div>
              ))}
            </div>

            <div className="business-summary">
              <div>
                <span>OfficialUM1 fee</span>
                <strong>$20</strong>
              </div>
              <div>
                <span>Registered agent</span>
                <strong>$100</strong>
              </div>
              <div>
                <span>Support style</span>
                <strong>Guided</strong>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .business-shell {
          padding: 88px 0;
          background: linear-gradient(180deg, rgba(236, 253, 245, 0.4) 0%, rgba(239, 246, 255, 0.82) 100%);
        }

        .business-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(320px, 0.92fr);
          gap: 28px;
          align-items: center;
        }

        .business-shell h2 {
          margin: 12px 0;
          max-width: 11ch;
        }

        .business-copy {
          max-width: 620px;
          margin-bottom: 22px;
        }

        .business-points {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }

        .business-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(15, 23, 42, 0.08);
          color: #334155;
          font-weight: 600;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
        }

        .business-features {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 26px;
        }

        .business-feature {
          display: flex;
          gap: 14px;
          padding: 18px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
        }

        .business-feature-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(16, 185, 129, 0.14));
          color: #4338ca;
          flex-shrink: 0;
        }

        .business-feature h3 {
          margin: 0 0 8px;
          font-size: 1.05rem;
          color: #0f172a;
        }

        .business-feature p {
          margin: 0;
          font-size: 0.92rem;
        }

        .business-panel {
          padding: 28px;
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 22px 56px rgba(15, 23, 42, 0.08);
        }

        .business-panel-header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .business-panel-overline {
          margin: 0 0 6px;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #64748b;
        }

        .business-panel-header h3 {
          margin: 0;
          color: #0f172a;
        }

        .business-panel-chip {
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(79, 70, 229, 0.08);
          color: #4f46e5;
          font-size: 0.8rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .business-state-list {
          display: grid;
          gap: 14px;
        }

        .business-state-card {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          padding: 18px;
          border-radius: 20px;
          background: linear-gradient(180deg, #ffffff, #f8fbff);
          border: 1px solid rgba(15, 23, 42, 0.06);
        }

        .business-state-card strong {
          color: #0f172a;
        }

        .business-state-card p {
          margin: 4px 0 0;
          font-size: 0.9rem;
        }

        .business-fee {
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          font-weight: 700;
          white-space: nowrap;
        }

        .business-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 18px;
        }

        .business-summary div {
          padding: 16px;
          border-radius: 18px;
          background: rgba(248, 250, 252, 0.92);
          border: 1px solid rgba(15, 23, 42, 0.06);
        }

        .business-summary span {
          display: block;
          margin-bottom: 6px;
          font-size: 0.76rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .business-summary strong {
          color: #0f172a;
        }

        @media (max-width: 1024px) {
          .business-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .business-features,
          .business-summary {
            grid-template-columns: 1fr;
          }

          .business-panel,
          .business-feature {
            padding: 22px;
            border-radius: 22px;
          }

          .business-state-card {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </section>
  );
}
