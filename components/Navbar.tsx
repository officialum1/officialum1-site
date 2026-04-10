"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext";
import AdminStatusBadge from "@/components/AdminStatusBadge";
import { usePathname } from "next/navigation";
import { Bell, Heart, Menu, Search, ShoppingCart, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const pathname = usePathname();

  const { toggleCart, cartCount } = useCart() as any;
  const { wishlist } = useWishlist();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll);

    const stored = localStorage.getItem("buyer_user");
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        fetchNotifications(parsedUser.id);
      } catch {}
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchNotifications = async (userId: string) => {
    try {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data);
    } catch {}
  };

  const markAllRead = async () => {
    if (unreadCount === 0 || !user) return;
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, action: "markAllRead" }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem("buyer_user");
    setUser(null);
    window.location.href = "/";
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const term = (e.target as HTMLInputElement).value;
      if (term.trim()) {
        window.location.href = `/shop?search=${encodeURIComponent(term)}`;
        setIsOpen(false);
      }
    }
  };

  const navLinks: { href: string; label: string; highlight?: boolean }[] = [
    { href: "/services", label: "Services" },
    { href: "/shop", label: "Shop" },
    { href: "/my-orders", label: "Track Order" },
    { href: "/reviews", label: "Reviews" },
    { href: "/blog", label: "Blog" },
    { href: "/faq", label: "Knowledge Base" },
    { href: "/about", label: "About" },
    { href: "/services/form-business", label: "US Business Hub", highlight: true },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-[2000] transition-all duration-300 ${scrolled ? "nav-shell-scrolled" : "nav-shell-top"}`}
    >
      <div className="container py-4">
        <div className="nav-shell">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/" className="nav-brand">
              <img src="/logo.jpg" alt="OfficialUM1 Logo" className="nav-logo" />
              <div className="min-w-0">
                <div className="nav-brand-name">OfficialUM1</div>
                <div className="nav-brand-sub">Digital growth platform</div>
              </div>
            </Link>
            <div className="hidden xl:block">
              <AdminStatusBadge />
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 nav-links-desktop">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className={`nav-link-pill ${isActive(l.href) ? "active" : ""} ${l.highlight ? "highlight" : ""}`}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 nav-search">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                onKeyDown={handleSearch}
                className="nav-search-input-clean"
              />
            </div>

            {user && (
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markAllRead();
                }}
                className="nav-icon-button"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-slate-700" />
                {unreadCount > 0 && <span className="nav-count">{unreadCount}</span>}
              </button>
            )}

            <Link href="/wishlist" className="nav-icon-button" aria-label="Wishlist">
              <Heart className="h-5 w-5 text-slate-700" />
              {wishlist.length > 0 && <span className="nav-count">{wishlist.length}</span>}
            </Link>

            <button onClick={toggleCart} className="nav-icon-button" aria-label="Cart">
              <ShoppingCart className="h-5 w-5 text-slate-700" />
              {cartCount > 0 && <span className="nav-count">{cartCount}</span>}
            </button>

            <Link href="/services" className="hidden md:inline-flex btn btn-primary">
              Get Started
            </Link>

            <button className="lg:hidden nav-icon-button" onClick={() => setIsOpen((v) => !v)} aria-label="Toggle menu">
              {isOpen ? <X className="h-5 w-5 text-slate-900" /> : <Menu className="h-5 w-5 text-slate-900" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden">
          <div className="container pb-4">
            <div className="mobile-drawer">
              <div className="nav-search mobile-search">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  onKeyDown={handleSearch}
                  className="nav-search-input-clean"
                />
              </div>

              <div className="flex flex-col gap-1">
                {navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setIsOpen(false)}
                    className={`mobile-nav-link ${isActive(l.href) ? "active" : ""}`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                {user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setIsOpen(false)} className="btn btn-outline w-full">
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="btn btn-outline w-full"
                      style={{ borderColor: "rgba(239,68,68,0.22)", color: "var(--error)" }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsOpen(false)} className="btn btn-outline w-full">
                      Login
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)} className="btn btn-primary w-full">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .nav-shell-top {
          background: transparent;
        }

        .nav-shell-scrolled {
          background: rgba(248, 250, 252, 0.82);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        }

        .nav-shell {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 16px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.86);
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08);
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          text-decoration: none;
        }

        .nav-logo {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          object-fit: cover;
          border: 1px solid rgba(15, 23, 42, 0.08);
        }

        .nav-brand-name {
          color: #0f172a;
          font-weight: 800;
          font-size: 1rem;
          line-height: 1.1;
        }

        .nav-brand-sub {
          color: #64748b;
          font-size: 0.74rem;
          white-space: nowrap;
        }

        .nav-links-desktop {
          padding: 4px;
          border-radius: 18px;
          background: rgba(248, 250, 252, 0.95);
          border: 1px solid rgba(15, 23, 42, 0.04);
        }

        .nav-link-pill {
          padding: 10px 13px;
          border-radius: 14px;
          color: #475569;
          font-size: 0.82rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .nav-link-pill:hover,
        .nav-link-pill.active {
          color: #0f172a;
          background: #ffffff;
        }

        .nav-link-pill.highlight {
          color: #4338ca;
        }

        .nav-search {
          border-radius: 16px;
          background: rgba(248, 250, 252, 0.95);
          border: 1px solid rgba(15, 23, 42, 0.08);
          padding: 0 12px;
          height: 42px;
        }

        .nav-search-input-clean {
          width: 180px;
          background: transparent;
          outline: none;
          border: none;
          font-size: 0.84rem;
          color: #0f172a;
        }

        .nav-icon-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
        }

        .nav-count {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 999px;
          background: linear-gradient(135deg, #4f46e5, #0ea5e9);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 800;
        }

        .mobile-drawer {
          padding: 16px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 20px 44px rgba(15, 23, 42, 0.08);
        }

        .mobile-search {
          margin-bottom: 14px;
        }

        .mobile-search .nav-search-input-clean {
          width: 100%;
        }

        .mobile-nav-link {
          padding: 12px 14px;
          border-radius: 14px;
          color: #334155;
          font-weight: 700;
          text-decoration: none;
        }

        .mobile-nav-link.active {
          background: rgba(79, 70, 229, 0.08);
          color: #4338ca;
        }

        @media (max-width: 768px) {
          .nav-shell {
            padding: 10px 12px;
            border-radius: 20px;
          }

          .nav-brand-sub {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
