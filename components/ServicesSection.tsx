"use client";

import { useEffect, useState } from "react";
import { readJson } from "@/lib/read-json";

const FALLBACK_SERVICES = [
  {
    id: "web-dev",
    icon: "WD",
    title: "Web Development",
    desc: "High-performance, conversion-focused websites and web apps tailored to your brand.",
  },
  {
    id: "seo",
    icon: "SEO",
    title: "SEO Optimization",
    desc: "Technical and on-page SEO strategies engineered to grow qualified traffic.",
  },
  {
    id: "social-media",
    icon: "SM",
    title: "Social Media Management",
    desc: "Campaign strategy and content systems across the platforms that matter.",
  },
  {
    id: "guest-posting",
    icon: "GP",
    title: "Guest Posting",
    desc: "Authoritative placements on relevant websites to grow links and trust.",
  },
  {
    id: "us-business",
    icon: "US",
    title: "US Business Formation",
    desc: "End-to-end US company setup for founders anywhere in the world.",
  },
  {
    id: "rentals",
    icon: "RR",
    title: "Rentals / Pre-ranked Sites",
    desc: "Ready-to-rank properties and pre-built sites to shortcut your growth.",
  },
];

type Service = { id: string; icon: string; title: string; desc: string };

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => readJson<Service[]>(res))
      .then((data) =>
        setServices(Array.isArray(data) && data.length > 0 ? data : FALLBACK_SERVICES)
      )
      .catch(() => setServices(FALLBACK_SERVICES))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="services" className="section-padding" style={{ background: "var(--bg-base)" }}>
      <div className="container">
        <div className="mb-12 text-left md:mb-16">
          <div
            className="mb-3 text-xs font-bold uppercase"
            style={{ color: "var(--accent-blue)", letterSpacing: "0.14em" }}
          >
            Capabilities
          </div>
          <h2
            className="mb-3 text-[36px] font-black leading-tight md:text-[48px]"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            Our Expertise
          </h2>
          <p className="mt-4 max-w-xl text-base" style={{ color: "var(--text-muted)" }}>
            Comprehensive digital solutions designed to scale your business without messy execution.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-xl skeleton"
                  style={{
                    background: "#fff",
                    border: "1px solid var(--border-subtle)",
                  }}
                />
              ))
            : services.map((service) => {
                const isGuestPosting = service.title.toLowerCase().includes("guest");
                return (
                  <article
                    key={service.id}
                    className="services-card-home flex flex-col rounded-xl p-6 transition-all duration-300 hover:-translate-y-1"
                    style={{
                      background: "#fff",
                      border: "1px solid var(--border-subtle)",
                      boxShadow: "0 12px 28px rgba(24,32,38,0.06)",
                    }}
                  >
                    <div
                      className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg text-sm font-black"
                      style={{
                        background: "rgba(20,108,120,0.10)",
                        color: "var(--accent-blue)",
                      }}
                    >
                      {service.icon || "OS"}
                    </div>
                    <h3 className="mb-2 text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                      {service.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {service.desc}
                    </p>
                    <a
                      href={isGuestPosting ? "/services/guest-posting" : "/services"}
                      className="mt-5 inline-flex items-center text-[0.9rem] font-bold"
                      style={{ color: "var(--accent-blue)" }}
                    >
                      {isGuestPosting ? "View Packages" : "Learn More"} →
                    </a>
                  </article>
                );
              })}
        </div>
      </div>
    </section>
  );
}
