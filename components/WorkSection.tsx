"use client";

import { useState, useEffect } from "react";

export default function WorkSection() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <section id="work" className="section-padding work-shell">
      <div className="container">
        <div className="work-header">
          <span className="section-label">Selected Work</span>
          <h2>Proof without turning the homepage into an endless gallery</h2>
          <p>
            This section now highlights a smaller set of projects so the homepage keeps momentum instead of becoming
            a giant scroll.
          </p>
        </div>

        <div className="work-grid">
          {projects.map((project) => (
            <article key={project.id} className="work-card">
              <div className="work-image-wrap">
                <img
                  src={
                    project.image ||
                    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  }
                  alt={project.title}
                  className="work-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
                  }}
                />
              </div>
              <div className="work-body">
                <div className="work-category">{project.category}</div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style jsx>{`
        .work-shell {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(248, 250, 252, 0.72) 100%);
        }

        .work-header {
          max-width: 760px;
          margin: 0 auto 32px;
          text-align: center;
        }

        .work-header h2 {
          margin: 12px 0;
        }

        .work-header p {
          margin: 0 auto;
          max-width: 640px;
        }

        .work-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .work-card {
          overflow: hidden;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 18px 44px rgba(15, 23, 42, 0.07);
        }

        .work-image-wrap {
          height: 210px;
          background: #dbeafe;
        }

        .work-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .work-body {
          padding: 20px;
        }

        .work-category {
          display: inline-block;
          margin-bottom: 10px;
          padding: 7px 10px;
          border-radius: 999px;
          background: rgba(79, 70, 229, 0.08);
          color: #4f46e5;
          font-size: 0.76rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .work-body h3 {
          margin-bottom: 10px;
          color: #0f172a;
          font-size: 1.08rem;
        }

        .work-body p {
          margin: 0;
        }

        @media (max-width: 980px) {
          .work-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .work-grid {
            grid-template-columns: 1fr;
          }

          .work-card {
            border-radius: 22px;
          }

          .work-image-wrap {
            height: 190px;
          }
        }
      `}</style>
    </section>
  );
}
