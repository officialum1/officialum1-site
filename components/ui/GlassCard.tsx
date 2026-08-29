 "use client";

 import * as React from "react";

 type GlassCardProps = {
   children: React.ReactNode;
   className?: string;
   hover?: boolean;
 };

 export function GlassCard({ children, className = "", hover = true }: GlassCardProps) {
   const hoverClasses = hover
     ? "transition-transform transition-shadow duration-300 hover:-translate-y-[6px] hover:shadow-[0_22px_60px_rgba(0,0,0,0.7)]"
     : "";

   return (
     <div
       className={
         "rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-card)] " +
         "backdrop-blur-xl shadow-[0_18px_45px_rgba(0,0,0,0.45)] " +
         hoverClasses +
         " " +
         className
       }
     >
       {children}
     </div>
   );
 }

