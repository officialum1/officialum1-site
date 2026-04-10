"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/Badge";
import { BarChart3, Cog, Home, Lightbulb, Menu, Rocket, Shield, Store, Users, X } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

const NAV: Array<{ section: string; items: NavItem[] }> = [
  {
    section: "Workspace",
    items: [
      { href: "/admin/inventory", label: "Admin Workspace", icon: <Home className="h-4 w-4" /> },
      { href: "/admin/z2u", label: "Z2U Center", icon: <Rocket className="h-4 w-4" /> },
      { href: "/admin/g2g", label: "G2G Center", icon: <Store className="h-4 w-4" /> },
      { href: "/admin/z2u-intel", label: "Z2U Intel", icon: <Lightbulb className="h-4 w-4" /> },
    ],
  },
  {
    section: "Admin",
    items: [
      { href: "/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
      { href: "/admin/dashboard", label: "Dashboard", icon: <BarChart3 className="h-4 w-4" /> },
      { href: "/admin/settings", label: "Settings", icon: <Cog className="h-4 w-4" /> },
    ],
  },
];

export function AdminShell(props: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  hideSidebar?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const sidebarContent = (
    <nav className="space-y-6">
      {NAV.map((group) => (
        <div key={group.section}>
          <div className="px-3 text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-2">
            {group.section}
          </div>
          <div className="flex flex-col gap-1">
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cx(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold transition",
                    active ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <span className={cx("text-gray-500", active && "text-indigo-700")}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.href === "/admin/z2u-intel" ? (
                    <span className="ml-auto">
                      <Badge className="bg-indigo-100 text-indigo-700">AI</Badge>
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <Navbar />
      
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed bottom-6 right-6 z-[1100]">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="h-14 w-14 rounded-full bg-indigo-600 text-white shadow-2xl flex items-center justify-center hover:bg-indigo-700 transition-all active:scale-95"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[1090]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div 
        className={cx(
          "lg:hidden fixed top-0 left-0 h-full w-[280px] bg-white z-[1095] shadow-2xl transition-transform duration-300 ease-in-out pt-24 px-4",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-3 mb-8">
          <div className="text-lg font-extrabold tracking-tight text-gray-900">Admin</div>
          <div className="text-[14px] text-gray-500">OfficialUM1 Control</div>
        </div>
        {sidebarContent}
      </div>

      <div style={{ display: "flex", paddingTop: "80px", minHeight: "100vh" }}>
        {!props.hideSidebar ? (
          <aside
            className="hidden lg:block"
            style={{
              width: "280px",
              flexShrink: 0,
              padding: "2rem 1rem",
              borderRight: "1px solid var(--border)",
              background: "#fff",
              position: "sticky",
              top: "80px",
              height: "calc(100vh - 80px)",
              overflowY: "auto",
            }}
          >
            <div className="px-3 mb-6">
              <div className="text-sm font-extrabold tracking-tight text-gray-900">Admin</div>
              <div className="text-[13px] text-gray-500">OfficialUM1 Control Center</div>
            </div>

            {sidebarContent}

            <div className="mt-8 px-3">
              <div className="rounded-2xl border p-4 bg-white" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-[13px] text-gray-900">Admin Access</div>
                    <div className="text-[12px] text-gray-500 leading-relaxed">
                      Requires admin login. API calls remain unchanged.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        ) : null}

        <section className="flex-1 admin-content transition-all duration-300">
          <div className="container py-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
              <div className="max-w-3xl">
                <h1 className="text-[32px] md:text-[40px] font-bold tracking-tight text-gray-900">
                  {props.title}
                </h1>
                {props.subtitle ? <p className="mt-2 text-gray-600">{props.subtitle}</p> : null}
              </div>
              {props.right ? <div className="shrink-0">{props.right}</div> : null}
            </div>

            {props.children}
          </div>
        </section>
      </div>
    </main>
  );
}

