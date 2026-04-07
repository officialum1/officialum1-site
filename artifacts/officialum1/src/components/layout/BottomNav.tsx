import { useLocation, Link } from "wouter";
import { Home, ShoppingBag, Star, User, LayoutGrid } from "lucide-react";
import { useGetMe } from "@workspace/api-client-react";

const NAV_ITEMS = [
  { href: "/",        icon: Home,        label: "Home"   },
  { href: "/shop",    icon: ShoppingBag, label: "Shop"   },
  { href: "/reviews", icon: Star,        label: "Reviews" },
  { href: "/services",icon: LayoutGrid,  label: "Services"},
  { href: "/login",   icon: User,        label: "Account", authHref: "/dashboard" },
] as const;

export function BottomNav() {
  const [location] = useLocation();
  const { data: user } = useGetMe({ query: { retry: false } });

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.07)]">
        <div className="flex items-stretch h-[60px]">
          {NAV_ITEMS.map(({ href, icon: Icon, label, authHref }) => {
            const resolvedHref = authHref && user ? authHref : href;
            const active = location === resolvedHref || location === href ||
              (href === "/shop" && location.startsWith("/shop"));
            return (
              <Link
                key={href}
                href={resolvedHref}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 relative tap-sm"
                style={{ minHeight: "unset", minWidth: "unset" }}
              >
                <div className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-200 ${
                  active ? "text-[#4f7af5]" : "text-slate-400"
                }`}>
                  {active && (
                    <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#4f7af5]" />
                  )}
                  <Icon className={`transition-all duration-200 ${active ? "w-5 h-5 scale-110" : "w-5 h-5"}`} strokeWidth={active ? 2.5 : 1.8} />
                  <span className={`text-[10px] font-semibold leading-none ${active ? "text-[#4f7af5]" : "text-slate-400"}`}>
                    {label === "Account" && user ? user.name?.split(" ")[0] || "Me" : label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
