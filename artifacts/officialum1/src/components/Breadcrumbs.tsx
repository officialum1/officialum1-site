import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import type { BreadcrumbItem } from "@/lib/seo";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  if (items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-sm text-muted-foreground ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isFirst = index === 0;

        return (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50" />}
            {isLast ? (
              <span className="text-foreground font-medium truncate max-w-[200px]" aria-current="page">
                {isFirst && <Home className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-primary transition-colors truncate max-w-[160px]"
              >
                {isFirst && <Home className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
                {item.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
