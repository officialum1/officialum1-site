"use client";

import { useState } from "react";
import { ArrowRight, Gauge, Mail, Search, Sparkles } from "lucide-react";

export default function FreeAuditSection() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
      } else {
        alert(data.error || "Audit failed. Please try a valid URL.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-padding audit-shell" id="audit">
      <div className="container">
        <div className="audit-card">
          <div className="audit-copy">
            <span className="section-label">AI Audit</span>
            <h2>Instant website review, wrapped in a cleaner lead capture flow</h2>
            <p>
              The new treatment makes this section feel like a premium utility instead of a heavy dark widget.
              It is easier to trust, easier to complete, and easier to use on mobile.
            </p>

            <div className="audit-points">
              <div className="audit-point">
                <Gauge size={18} />
                <span>Performance snapshot</span>
              </div>
              <div className="audit-point">
                <Search size={18} />
                <span>SEO and structure issues</span>
              </div>
              <div className="audit-point">
                <Sparkles size={18} />
                <span>Actionable next steps</span>
              </div>
            </div>
          </div>

          <div className="audit-panel">
            {!report ? (
              <form onSubmit={handleSubmit} className="audit-form">
                <label className="audit-field">
                  <span>Website URL</span>
                  <div className="audit-input-wrap">
                    <Search size={16} />
                    <input
                      type="url"
                      placeholder="https://example.com"
                      required
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="input-field audit-input"
                    />
                  </div>
                </label>

                <label className="audit-field">
                  <span>Business Email</span>
                  <div className="audit-input-wrap">
                    <Mail size={16} />
                    <input
                      type="email"
                      placeholder="you@company.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field audit-input"
                    />
                  </div>
                </label>

                <button type="submit" className="btn btn-primary audit-submit" disabled={loading}>
                  {loading ? "Scanning Website..." : "Run Free Audit"}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>
            ) : (
              <div className="audit-results">
                <div className="audit-score-row">
                  <div>
                    <p className="audit-overline">Audit results for</p>
                    <h3>{report.url}</h3>
                  </div>
                  <div className="audit-score-box">
                    <span>Health Score</span>
                    <strong>{report.score}/100</strong>
                  </div>
                </div>

                <div className="audit-metrics">
                  <div><span>Load Time</span><strong>{report.loadTime}ms</strong></div>
                  <div><span>Words</span><strong>{report.wordCount}</strong></div>
                  <div><span>Images</span><strong>{report.imgCount}</strong></div>
                  <div><span>Links</span><strong>{report.internalLinks + report.externalLinks}</strong></div>
                </div>

                <div className="audit-columns">
                  <div className="audit-list-card">
                    <h4>Passed checks</h4>
                    <ul>
                      {report.passed.length > 0 ? (
                        report.passed.map((item: string, i: number) => <li key={i}>{item}</li>)
                      ) : (
                        <li>No passed checks.</li>
                      )}
                    </ul>
                  </div>

                  <div className="audit-list-card">
                    <h4>Issues found</h4>
                    <ul>
                      {report.issues.length > 0 ? (
                        report.issues.map((item: string, i: number) => <li key={i}>{item}</li>)
                      ) : (
                        <li>No critical issues found.</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="audit-results-actions">
                  <a href="/contact?subject=Fix SEO Issues" className="btn btn-primary">
                    Book a Fix Call
                  </a>
                  <button onClick={() => setReport(null)} className="audit-reset">
                    Scan another site
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .audit-shell {
          background: linear-gradient(180deg, rgba(238, 242, 255, 0.45) 0%, rgba(236, 253, 245, 0.85) 100%);
        }

        .audit-card {
          display: grid;
          grid-template-columns: minmax(0, 0.95fr) minmax(320px, 1.05fr);
          gap: 24px;
          padding: 32px;
          border-radius: 34px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
        }

        .audit-copy h2 {
          margin: 12px 0;
          max-width: 11ch;
        }

        .audit-copy p {
          margin: 0 0 22px;
          max-width: 520px;
        }

        .audit-points {
          display: grid;
          gap: 12px;
        }

        .audit-point {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 18px;
          background: rgba(248, 250, 252, 0.95);
          border: 1px solid rgba(15, 23, 42, 0.06);
          color: #0f172a;
          font-weight: 600;
        }

        .audit-panel {
          padding: 24px;
          border-radius: 28px;
          background: linear-gradient(180deg, #f8fbff, #ffffff);
          border: 1px solid rgba(79, 70, 229, 0.1);
        }

        .audit-form {
          display: grid;
          gap: 16px;
        }

        .audit-field {
          display: grid;
          gap: 8px;
          font-weight: 600;
          color: #0f172a;
        }

        .audit-input-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(15, 23, 42, 0.08);
        }

        .audit-input-wrap :global(svg) {
          color: #64748b;
          flex-shrink: 0;
        }

        .audit-input {
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }

        .audit-submit {
          width: 100%;
          margin-top: 6px;
        }

        .audit-results {
          display: grid;
          gap: 18px;
        }

        .audit-score-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }

        .audit-overline {
          margin: 0 0 6px;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .audit-score-row h3 {
          margin: 0;
          font-size: 1.2rem;
          word-break: break-word;
        }

        .audit-score-box {
          min-width: 132px;
          padding: 14px;
          border-radius: 20px;
          background: rgba(79, 70, 229, 0.08);
          text-align: center;
        }

        .audit-score-box span {
          display: block;
          font-size: 0.76rem;
          color: #64748b;
          margin-bottom: 6px;
        }

        .audit-score-box strong {
          font-size: 1.8rem;
          color: #0f172a;
        }

        .audit-metrics,
        .audit-columns {
          display: grid;
          gap: 12px;
        }

        .audit-metrics {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .audit-metrics div,
        .audit-list-card {
          padding: 14px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(15, 23, 42, 0.06);
        }

        .audit-metrics span {
          display: block;
          font-size: 0.78rem;
          color: #64748b;
          margin-bottom: 6px;
        }

        .audit-metrics strong {
          color: #0f172a;
        }

        .audit-columns {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .audit-list-card h4 {
          margin-bottom: 10px;
          color: #0f172a;
        }

        .audit-list-card ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 8px;
        }

        .audit-list-card li {
          color: #475569;
        }

        .audit-results-actions {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .audit-reset {
          background: none;
          border: none;
          color: #4f46e5;
          font-weight: 700;
          cursor: pointer;
        }

        @media (max-width: 980px) {
          .audit-card {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .audit-card,
          .audit-panel {
            padding: 22px;
            border-radius: 24px;
          }

          .audit-metrics,
          .audit-columns {
            grid-template-columns: 1fr;
          }

          .audit-score-row,
          .audit-results-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .audit-results-actions :global(.btn) {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
