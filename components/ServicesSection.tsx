"use client";

import { useEffect, useState } from "react";
import { readJson } from "@/lib/read-json";

const FALLBACK_SERVICES = [
  {
    id: "guest-posting",
    icon: "GP",
    title: "High DA Guest Posting",
    desc: "100% DoFollow editorial backlinks on 65,000+ real websites with verified Google traffic.",
    href: "/services/guest-posting",
    cta: "View DA Packs"
  },
  {
    id: "speed-opt",
    icon: "⚡",
    title: "WordPress Speed Optimization",
    desc: "Guaranteed 90+ Google Core Web Vitals score and sub-1.5s load times with zero downtime.",
    href: "/services/wordpress-speed-optimization",
    cta: "Speed Up Site"
  },
  {
    id: "niche-edits",
    icon: "NE",
    title: "Curated Niche Edits",
    desc: "Fast-track authority with in-content links placed inside aged, indexed Google articles.",
    href: "/services/niche-edits",
    cta: "Explore Niche Edits"
  },
  {
    id: "press-release",
    icon: "PR",
    title: "Press Release Syndication",
    desc: "Broadcast company news across 350+ news portals, AP News, Yahoo Finance & Google News.",
    href: "/services/press-release-distribution",
    cta: "Distribute PR"
  },
  {
    id: "local-seo",
    icon: "MAP",
    title: "Local SEO Citation Building",
    desc: "Dominate Google Maps 3-pack with 100% manual business directory submissions across 8 countries.",
    href: "/services/local-citations",
    cta: "Build Citations"
  },
  {
    id: "nextjs-dev",
    icon: "JS",
    title: "Next.js 15 Web Architecture",
    desc: "Ultra-fast headless React web engineering built for high-scale enterprise conversion.",
    href: "/services/wordpress-to-nextjs-migration",
    cta: "Migrate to Next.js"
  },
];

type Service = { id: string; icon: string; title: string; desc: string; href?: string; cta?: string };

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>(FALLBACK_SERVICES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => readJson<Service[]>(res))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
        }
      })
      .catch(() => setServices(FALLBACK_SERVICES));
  }, []);

  return (
    <section id="services" className="section-padding" style={{ background: "var(--bg-base)" }}>
      <div className="container">
        <div className="mb-12 text-left md:mb-16">
          <div
            className="mb-3 text-xs font-bold uppercase"
            style={{ color: "var(--accent-blue)", letterSpacing: "0.14em" }}
          >
            Enterprise Capabilities
          </div>
          <h2
            className="mb-3 text-[36px] font-black leading-tight md:text-[48px]"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            Engineered For Explosive Growth
          </h2>
          <p className="mt-4 max-w-xl text-base" style={{ color: "var(--text-muted)" }}>
            High-performance web architecture, guaranteed high-DA link building, and data-backed search engine domination.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const targetHref = service.href || (service.title.toLowerCase().includes("guest") ? "/services/guest-posting" : "/services");
            const ctaText = service.cta || "Explore Service";

            return (
              <article
                key={service.id}
                className="services-card-home flex flex-col justify-between rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 bg-white border border-[var(--border-subtle)] shadow-sm hover:shadow-xl"
              >
                <div>
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-sm font-black bg-blue-50 text-[var(--accent-blue)]"
                  >
                    {service.icon || "OS"}
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-[var(--text-primary)]">
                    {service.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                    {service.desc}
                  </p>
                </div>

                <a
                  href={targetHref}
                  className="mt-6 inline-flex items-center text-xs font-black uppercase tracking-wider text-[var(--accent-blue)] hover:underline"
                >
                  {ctaText} &rarr;
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
