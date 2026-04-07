import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { makeFAQSchema } from "@/lib/seo";
import { SchemaScript } from "@/components/SEO";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  items: FAQItem[];
  title?: string;
  className?: string;
  withSchema?: boolean;
}

export function FAQSection({ items, title = "Frequently Asked Questions", className = "", withSchema = true }: FAQSectionProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className={`py-12 ${className}`} aria-label="FAQ">
      {withSchema && <SchemaScript schema={makeFAQSchema(items)} />}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-8 text-center">{title}</h2>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="border border-border/60 rounded-xl overflow-hidden bg-white"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                aria-expanded={open === i}
              >
                <span className="font-semibold text-foreground text-sm pr-4">{item.question}</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
