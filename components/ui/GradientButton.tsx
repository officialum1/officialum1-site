 "use client";

 import Link from "next/link";
 import * as React from "react";

 type Props = {
   children: React.ReactNode;
   href?: string;
   variant?: "primary" | "secondary";
   className?: string;
 } & React.ButtonHTMLAttributes<HTMLButtonElement>;

 export function GradientButton({
   children,
   href,
   variant = "primary",
   className = "",
   ...buttonProps
 }: Props) {
   const base =
     "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold " +
     "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 transition-all duration-300";

   const primary =
     "text-white shadow-[0_0_28px_rgba(79,142,247,0.5)] " +
     "bg-[linear-gradient(135deg,var(--accent-blue),var(--accent-violet))] " +
     "hover:shadow-[0_0_40px_rgba(79,142,247,0.75)]";

   const secondary =
     "text-[var(--text-primary)] border border-[var(--border-subtle)] bg-transparent " +
     "hover:bg-[rgba(79,142,247,0.12)]";

   const classes =
     base + " " + (variant === "primary" ? primary : secondary) + " " + className;

   if (href) {
     return (
       <Link href={href} className={classes}>
         {children}
       </Link>
     );
   }

   return (
     <button className={classes} {...buttonProps}>
       {children}
     </button>
   );
 }

