import * as React from "react";

type Breadcrumb = { label: string; href?: string };

type Props = {
  label?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  right?: React.ReactNode;
};

function MeshBg() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div
        className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-30"
        style={{ background: "linear-gradient(135deg, #4F46E5, #06B6D4)" }}
      />
      <div
        className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-30"
        style={{ background: "linear-gradient(135deg, #2563EB, #4F46E5)" }}
      />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(#4F46E5 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
    </div>
  );
}

export function PageHero({ label, title, description, breadcrumbs, right }: Props) {
  return (
    <section className="relative bg-white border-b" style={{ borderColor: "var(--border)" }}>
      <MeshBg />
      <div className="relative container py-20">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="text-[13px] text-gray-500 mb-4">
            {breadcrumbs.map((b, idx) => (
              <span key={`${b.label}-${idx}`}>
                {b.href ? (
                  <a className="hover:text-indigo-600 transition" href={b.href}>
                    {b.label}
                  </a>
                ) : (
                  <span>{b.label}</span>
                )}
                {idx < breadcrumbs.length - 1 ? <span className="mx-2 text-gray-300">/</span> : null}
              </span>
            ))}
          </nav>
        )}

        {label ? <div className="section-label mb-3">{label}</div> : null}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-3xl">
            <h1 className="text-[42px] md:text-[64px] font-extrabold leading-[1.05] tracking-[-0.04em]">
              <span className="text-gradient">{title}</span>
            </h1>
            {description ? (
              <p className="mt-4 text-[16px] md:text-[18px] text-gray-600 leading-[1.7]">
                {description}
              </p>
            ) : null}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
      </div>
    </section>
  );
}

