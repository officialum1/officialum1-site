import * as React from "react";

type Breadcrumb = { label: string; href?: string };

type Props = {
  label?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  right?: React.ReactNode;
  variant?: "light" | "dark";
};

function MeshBgLight() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(20,108,120,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(20,108,120,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  );
}

function MeshBgDark() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.65]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(20,108,120,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(20,108,120,0.07) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
    </div>
  );
}

export function PageHero({
  label,
  title,
  description,
  breadcrumbs,
  right,
  variant = "dark",
}: Props) {
  const isDark = variant === "dark";

  return (
    <section
      className={
        "relative border-b " +
        (isDark
          ? "bg-[linear-gradient(180deg,#f7faf6,#eef4f2)] border-[var(--border-subtle)]"
          : "bg-white border-[var(--border)]")
      }
    >
      {isDark ? <MeshBgDark /> : <MeshBgLight />}
      <div className="relative container py-14 md:py-20">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            className="mb-4 text-[13px]"
            style={{ color: "var(--text-muted)" }}
          >
            {breadcrumbs.map((b, idx) => (
              <span key={`${b.label}-${idx}`}>
                {b.href ? (
                  <a
                    href={b.href}
                    className={
                      isDark
                        ? "hover:text-[var(--accent-blue)] transition"
                        : "hover:text-indigo-600 transition"
                    }
                  >
                    {b.label}
                  </a>
                ) : (
                  <span>{b.label}</span>
                )}
                {idx < breadcrumbs.length - 1 ? (
                  <span
                    className="mx-2"
                    style={{ color: "var(--border-subtle)" }}
                  >
                    /
                  </span>
                ) : null}
              </span>
            ))}
          </nav>
        )}

        {label ? (
          <div
            className="mb-3 text-xs font-semibold tracking-[0.2em] uppercase"
            style={{ color: "var(--accent-blue)" }}
          >
            {label}
          </div>
        ) : null}

        <div className="flex min-w-0 max-w-full flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 max-w-[340px] sm:max-w-3xl">
            <h1
            className="max-w-[340px] break-words text-[31px] font-extrabold leading-[1.08] tracking-normal sm:max-w-full md:text-[48px] lg:text-[56px]"
            style={{
              fontFamily:
                "var(--font-space-grotesk), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              color: "var(--text-primary)",
              overflowWrap: "anywhere",
            }}
          >
            <span
              style={{
                  color: "var(--text-primary)",
              }}
            >
              {title}
              </span>
            </h1>
            {description ? (
              <p
                className="mt-4 max-w-[330px] text-[14px] leading-7 sm:max-w-2xl md:text-[17px] md:leading-relaxed"
                style={{
                  color: "var(--text-muted)",
                  maxWidth: "100%",
                  overflowWrap: "anywhere",
                }}
              >
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
