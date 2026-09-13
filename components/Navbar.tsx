"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Heart, Menu, Search, ShoppingCart, Sparkles, X } from "lucide-react";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const unreadCount = notifications.filter(n => !n.is_read).length;
    const pathname = usePathname();

    const { toggleCart, cartCount } = useCart() as any;
    const { wishlist } = useWishlist();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);

        // Check Auth
        const stored = localStorage.getItem('buyer_user');
        if (stored) {
            try {
                const u = JSON.parse(stored);
                setUser(u);
                fetchNotifications(u.id);
            } catch (e) { }
        }

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    const fetchNotifications = async (userId: string) => {
        try {
            const res = await fetch(`/api/notifications?userId=${userId}`);
            const data = await res.json();
            if (Array.isArray(data)) setNotifications(data);
        } catch { }
    };

    const markAllRead = async () => {
        if (unreadCount === 0) return;
        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, action: 'markAllRead' })
            });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        } catch { }
    };

    const handleLogout = () => {
        localStorage.removeItem('buyer_user');
        setUser(null);
        window.location.href = '/';
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const term = (e.target as HTMLInputElement).value;
            if (term.trim()) {
                window.location.href = `/shop?search=${encodeURIComponent(term)}`;
                setIsOpen(false);
            }
        }
    };

    const navLinks = [
        { href: "/services", label: "Services" },
        { href: "/shop", label: "Shop" },
        { href: "/reviews", label: "Reviews" },
        { href: "/store", label: "Rentals" },
        { href: "/blog", label: "Blog" },
        { href: "/services/form-business", label: "Business Hub", highlight: true },
    ];

    const mobileNavLinks = [
        { href: "/services", label: "All Services" },
        { href: "/services/guest-posting", label: "🔗 High-DA Guest Posting" },
        { href: "/services/niche-edits", label: "⚡ Aged Niche Edits" },
        { href: "/services/crypto-guest-posting", label: "🪙 Crypto & Web3 Links" },
        { href: "/services/press-release-distribution", label: "📰 Press Release Distribution" },
        { href: "/services/local-citations", label: "📍 Local SEO Citations (8 Countries)" },
        { href: "/shop", label: "Shop" },
        ...(user ? [{ href: "/my-orders", label: "Track Order" }] : []),
        { href: "/reviews", label: "Reviews" },
        { href: "/store", label: "Rentals" },
        { href: "/blog", label: "Blog" },
        { href: "/faq", label: "FAQ" },
        { href: "/about", label: "About" },
        { href: "/services/form-business", label: "Business Hub", highlight: true },
    ];

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname === href || pathname.startsWith(href + "/");
    };

    return (
        <header
            className="fixed top-0 inset-x-0 z-[2000] border-b transition-colors duration-300"
            style={{
                borderColor: "var(--border-subtle)",
                background: scrolled ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.86)",
                boxShadow: scrolled ? "0 10px 30px rgba(24,32,38,0.08)" : "0 1px 0 rgba(24,32,38,0.04)",
            }}
        >
            <div className="container flex h-20 items-center justify-between gap-4">
                {/* Logo + Admin badge */}
                <div className="flex flex-shrink-0 items-center gap-3 pr-4">
                    <Link href="/" className="flex items-center gap-2.5 whitespace-nowrap">
                        <div className="relative h-9 w-9 flex-shrink-0">
                            <img
                                src="/logo.jpg"
                                alt="OfficialUM1 Logo"
                                className="h-9 w-9 rounded-full object-cover"
                                style={{ border: "1px solid var(--border-subtle)" }}
                            />
                            <span
                                className="absolute -right-1 -bottom-1 h-2.5 w-2.5 rounded-full"
                                style={{
                                    background: "linear-gradient(135deg, var(--accent-blue), var(--accent-violet))",
                                    boxShadow: "0 0 14px rgba(20,108,120,0.35)",
                                }}
                            />
                        </div>
                        <span
                            className="font-extrabold text-[17px] tracking-tight whitespace-nowrap"
                            style={{ color: "var(--text-primary)", fontFamily: "var(--font-space-grotesk), sans-serif" }}
                        >
                            OfficialUM1
                        </span>
                    </Link>
                </div>

                {/* Center nav */}
                <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex px-2">
                    <Link
                        href="/services"
                        className={`relative flex-shrink-0 whitespace-nowrap px-2 py-2 text-[12.5px] 2xl:text-[13.5px] font-semibold transition-colors ${
                            isActive("/services") && pathname === "/services"
                                ? "text-[var(--accent-blue)]"
                                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        }`}
                    >
                        Services
                    </Link>

                    {/* Packages Mega Dropdown */}
                    <div className="relative group py-2">
                        <button
                            type="button"
                            className="flex items-center gap-1 px-2 text-[12.5px] 2xl:text-[13.5px] font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
                        >
                            <span>Packages</span>
                            <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                        </button>

                        <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:block w-[720px] p-6 bg-white rounded-3xl border border-[var(--border-subtle)] shadow-2xl z-[3000] animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-3 gap-6 text-left">
                                {/* Col 1: Link Building */}
                                <div>
                                    <div className="text-[11px] font-black uppercase tracking-wider text-[var(--accent-blue)] border-b pb-2 mb-3">
                                        Link Building
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">DA Packages</div>
                                    <ul className="space-y-1.5 text-xs font-semibold text-gray-700 mb-4">
                                        <li>
                                            <Link href="/services/guest-posting" className="hover:text-[var(--accent-blue)] flex items-center justify-between">
                                                <span>DA50+ Package</span>
                                                <span className="text-[10px] text-gray-400">$299+</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/services/guest-posting" className="hover:text-[var(--accent-blue)] flex items-center justify-between font-bold text-[var(--text-primary)]">
                                                <span>DA60+ Powerhouse ⭐</span>
                                                <span className="text-[10px] text-[var(--accent-blue)] font-bold">$1,499</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/services/guest-posting" className="hover:text-[var(--accent-blue)] flex items-center justify-between">
                                                <span>DA70+ Elite Pack</span>
                                                <span className="text-[10px] text-gray-400">$2,499</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/services/niche-edits" className="hover:text-[var(--accent-blue)] flex items-center justify-between text-indigo-600">
                                                <span>Aged Niche Edits ⚡</span>
                                                <span className="text-[10px] text-indigo-500">$599+</span>
                                            </Link>
                                        </li>
                                    </ul>

                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Crypto Packages</div>
                                    <ul className="space-y-1.5 text-xs font-semibold text-gray-700">
                                        <li><Link href="/services/crypto-guest-posting" className="hover:text-[var(--accent-blue)]">Crypto Starter Pack ($899)</Link></li>
                                        <li><Link href="/services/crypto-guest-posting" className="hover:text-[var(--accent-blue)]">Crypto Growth Pack ($1,899)</Link></li>
                                        <li><Link href="/services/crypto-guest-posting" className="hover:text-[var(--accent-blue)]">Crypto Elite Pack ($3,499)</Link></li>
                                    </ul>
                                </div>

                                {/* Col 2: Press Release */}
                                <div>
                                    <div className="text-[11px] font-black uppercase tracking-wider text-[var(--accent-blue)] border-b pb-2 mb-3">
                                        Press Release Distribution
                                    </div>
                                    <ul className="space-y-2 text-xs font-semibold text-gray-700">
                                        <li>
                                            <Link href="/services/press-release-distribution" className="hover:text-[var(--accent-blue)] block">
                                                <div className="font-bold text-[var(--text-primary)]">National Wire (250+ Sites)</div>
                                                <div className="text-[10px] text-gray-400 font-normal">Google News, NBC, CBS &bull; $399</div>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/services/press-release-distribution" className="hover:text-[var(--accent-blue)] block">
                                                <div className="font-bold text-[var(--text-primary)]">Global Authority Wire (400+) ⭐</div>
                                                <div className="text-[10px] text-gray-400 font-normal">Yahoo Finance &amp; AP Wire &bull; $799</div>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/services/press-release-distribution" className="hover:text-[var(--accent-blue)] block">
                                                <div className="font-bold text-[var(--text-primary)]">Enterprise Financial PR</div>
                                                <div className="text-[10px] text-gray-400 font-normal">Stock &amp; Crypto Terminals &bull; $1,499</div>
                                            </Link>
                                        </li>
                                        <li className="pt-2 border-t">
                                            <Link href="/press" className="hover:text-[var(--accent-blue)] text-[11px] text-[var(--accent-blue)] font-bold block">
                                                &rarr; Visit Corporate Press Room
                                            </Link>
                                        </li>
                                    </ul>
                                </div>

                                {/* Col 3: Local SEO Listings */}
                                <div>
                                    <div className="text-[11px] font-black uppercase tracking-wider text-[var(--accent-blue)] border-b pb-2 mb-3">
                                        Local SEO (Citations)
                                    </div>
                                    <ul className="space-y-1.5 text-xs font-semibold text-gray-700">
                                        <li><Link href="/services/local-citations" className="hover:text-[var(--accent-blue)]">🇺🇸 USA Local Listings ($149+)</Link></li>
                                        <li><Link href="/services/local-citations" className="hover:text-[var(--accent-blue)]">🇬🇧 UK Local Listings ($149+)</Link></li>
                                        <li><Link href="/services/local-citations" className="hover:text-[var(--accent-blue)]">🇨🇦 Canada Local Listings ($149+)</Link></li>
                                        <li><Link href="/services/local-citations" className="hover:text-[var(--accent-blue)]">🇦🇺 Australia Local Listings ($149+)</Link></li>
                                        <li><Link href="/services/local-citations" className="hover:text-[var(--accent-blue)]">🇦🇪 Dubai Local Listings ($149+)</Link></li>
                                        <li><Link href="/services/local-citations" className="hover:text-[var(--accent-blue)]">🇸🇬 Singapore Local Listings ($149+)</Link></li>
                                        <li><Link href="/services/local-citations" className="hover:text-[var(--accent-blue)]">🇵🇭 Philippines Local Listings ($149+)</Link></li>
                                        <li><Link href="/services/local-citations" className="hover:text-[var(--accent-blue)]">🇮🇩 Indonesia Local Listings ($149+)</Link></li>
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-gray-500">🔒 100% Verified Manual Placement &bull; 365-Day Replacement Warranty</span>
                                <Link href="/store" className="font-bold text-[var(--accent-blue)] hover:underline">
                                    Browse Authority Store &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>

                    {[
                        { href: "/shop", label: "Shop" },
                        { href: "/reviews", label: "Reviews" },
                        { href: "/store", label: "Rentals" },
                        { href: "/blog", label: "Blog" },
                        { href: "/services/form-business", label: "Business Hub", highlight: true },
                    ].map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className={`relative flex-shrink-0 whitespace-nowrap px-2 py-2 text-[12.5px] 2xl:text-[13.5px] font-semibold transition-colors ${
                                isActive(l.href)
                                    ? "text-[var(--accent-blue)]"
                                    : l.highlight
                                    ? "text-[var(--accent-blue)]"
                                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            }`}
                        >
                            <span className="relative whitespace-nowrap">
                                {l.label}
                                <span
                                    className={`absolute left-0 -bottom-1 h-[2px] rounded-full transition-all ${
                                        isActive(l.href)
                                            ? "w-full"
                                            : "w-0"
                                    }`}
                                    style={{
                                        background: isActive(l.href)
                                            ? "linear-gradient(90deg, var(--accent-blue), var(--accent-violet))"
                                            : "transparent",
                                    }}
                                />
                            </span>
                        </Link>
                    ))}
                    {user && (user.role === "admin" || user.role === "staff") && (
                        <Link
                            href="/admin/inventory"
                            className={`relative flex-shrink-0 whitespace-nowrap px-2 py-2 text-[13px] font-semibold transition-colors ${
                                isActive("/admin")
                                    ? "text-[var(--accent-blue)]"
                                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            }`}
                        >
                            <span className="relative">
                                Admin
                                <span
                                    className={`absolute left-0 -bottom-1 h-[2px] rounded-full transition-all ${
                                        isActive("/admin") ? "w-full" : "w-0"
                                    }`}
                                    style={{
                                        background: isActive("/admin")
                                            ? "linear-gradient(90deg, var(--accent-blue), var(--accent-violet))"
                                            : "transparent",
                                    }}
                                />
                            </span>
                        </Link>
                    )}
                    {user && user.role === "seller" && (
                        <Link
                            href="/dashboard/seller"
                            className={`relative flex-shrink-0 whitespace-nowrap px-2 py-2 text-[13px] font-semibold transition-colors ${
                                isActive("/dashboard/seller")
                                    ? "text-[var(--accent-blue)]"
                                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            }`}
                        >
                            <span className="relative">
                                Seller Center
                                <span
                                    className={`absolute left-0 -bottom-1 h-[2px] rounded-full transition-all ${
                                        isActive("/dashboard/seller") ? "w-full" : "w-0"
                                    }`}
                                    style={{
                                        background: isActive("/dashboard/seller")
                                            ? "linear-gradient(90deg, var(--accent-blue), var(--accent-violet))"
                                            : "transparent",
                                    }}
                                />
                            </span>
                        </Link>
                    )}
                </nav>

                {/* Right controls */}
                <div className="navActions flex flex-shrink-0 items-center gap-2">
                    {/* Desktop search */}
                    <div
                        className="hidden items-center gap-2 rounded-full border px-3 py-2 md:flex"
                        style={{
                            borderColor: "var(--border-subtle)",
                            background: "#fff",
                        }}
                    >
                        <Search className="h-4 w-4 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            aria-label="Search products"
                            onKeyDown={handleSearch}
                            className="w-40 bg-transparent text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none 2xl:w-52"
                        />
                    </div>

                    {/* Notifications */}
                    {user && (
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    if (!showNotifications) markAllRead();
                                }}
                                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white transition hover:bg-[var(--bg-section-alt)]"
                                style={{ borderColor: "var(--border-subtle)" }}
                                aria-label="Notifications"
                                aria-expanded={showNotifications}
                                aria-controls="notifications-dropdown"
                            >
                                <Bell className="h-5 w-5 text-[var(--text-primary)]" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent-blue)] px-1 text-[11px] font-bold text-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div
                                    id="notifications-dropdown"
                                    className="absolute right-0 top-12 z-[2100] w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border bg-white shadow-2xl"
                                    style={{ borderColor: "var(--border-subtle)" }}
                                >
                                    <div className="border-b px-4 py-3" style={{ borderColor: "var(--border-subtle)" }}>
                                        <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                                            Notifications
                                        </div>
                                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                                            Latest account and order updates
                                        </div>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto p-2">
                                        {notifications.length === 0 ? (
                                            <div className="px-3 py-5 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                                                No notifications yet.
                                            </div>
                                        ) : (
                                            notifications.slice(0, 8).map((item, index) => (
                                                <div
                                                    key={item.id || index}
                                                    className="rounded-xl px-3 py-2 text-sm"
                                                    style={{ background: item.is_read ? "#fff" : "var(--bg-section-alt)" }}
                                                >
                                                    <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                                                        {item.title || item.type || "Update"}
                                                    </div>
                                                    <div className="mt-1 text-xs leading-5" style={{ color: "var(--text-muted)" }}>
                                                        {item.message || item.body || "You have a new notification."}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Wishlist */}
                    <Link
                        href="/wishlist"
                        className="navWishlist relative inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white transition hover:bg-[var(--bg-section-alt)]"
                        style={{ borderColor: "var(--border-subtle)" }}
                        aria-label="Wishlist"
                    >
                        <Heart className="h-5 w-5 text-[var(--text-primary)]" />
                        {wishlist.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent-violet)] px-1 text-[11px] font-bold text-white">
                                {wishlist.length}
                            </span>
                        )}
                    </Link>

                    {/* Cart */}
                    <button
                        onClick={toggleCart}
                        className="navCart relative inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white transition hover:bg-[var(--bg-section-alt)]"
                        style={{ borderColor: "var(--border-subtle)" }}
                        aria-label="Cart"
                    >
                        <ShoppingCart className="h-5 w-5 text-[var(--text-primary)]" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent-blue)] px-1 text-[11px] font-bold text-white">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {/* Auth CTAs - desktop */}
                    <div className="hidden items-center gap-2 md:flex">
                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="whitespace-nowrap rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors"
                                    style={{
                                        borderColor: "var(--border-subtle)",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="whitespace-nowrap rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors"
                                    style={{
                                        borderColor: "rgba(239,68,68,0.35)",
                                        color: "rgb(248,113,113)",
                                    }}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="whitespace-nowrap rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors"
                                    style={{
                                        borderColor: "var(--border-subtle)",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold text-white transition-transform duration-200"
                                    style={{
                                        background: "linear-gradient(135deg, var(--accent-blue), var(--accent-violet))",
                                        boxShadow: "0 12px 24px rgba(20,108,120,0.16)",
                                    }}
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="navMenu inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white text-[var(--text-primary)] transition hover:bg-[var(--bg-section-alt)] xl:hidden"
                        style={{ borderColor: "var(--border-subtle)" }}
                        onClick={() => setIsOpen((v) => !v)}
                        aria-label="Toggle menu"
                        aria-expanded={isOpen}
                        aria-controls="mobile-menu-drawer"
                    >
                        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile full-screen drawer */}
            {isOpen && (
                <div className="xl:hidden">
                    <div
                        className="fixed inset-0 z-[1900] bg-black/60"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />
                    <div
                        id="mobile-menu-drawer"
                        className="navbarDrawer fixed inset-y-0 left-0 right-0 z-[1950] flex w-full max-w-none flex-col overflow-y-auto px-6 py-6 sm:left-auto sm:max-w-md"
                        style={{
                            background: "#ffffff",
                            color: "var(--text-primary)",
                            boxShadow: "-18px 0 50px rgba(24,32,38,0.14)",
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
                                <img
                                    src="/logo.jpg"
                                    alt="OfficialUM1 Logo"
                                    className="h-10 w-10 rounded-full object-cover"
                                    style={{ border: "1px solid var(--border-subtle)" }}
                                />
                                <span
                                    className="text-lg font-extrabold"
                                    style={{ color: "var(--text-primary)" }}
                                >
                                    OfficialUM1
                                </span>
                            </Link>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border"
                                style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
                                aria-label="Close menu"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mt-6 space-y-6">
                            <div
                                className="flex items-center gap-2 rounded-full border px-3 py-2"
                                style={{
                                    borderColor: "var(--border-subtle)",
                                    background: "#fff",
                                }}
                            >
                                <Search className="h-4 w-4 text-[var(--text-muted)]" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    aria-label="Search products"
                                    onKeyDown={handleSearch}
                                    className="w-full bg-transparent text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
                                />
                            </div>

                            <div className="grid gap-2 text-left">
                                {mobileNavLinks.map((l) => (
                                    <Link
                                        key={l.href}
                                        href={l.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`w-full rounded-2xl border px-4 py-3 text-[1rem] font-semibold tracking-normal transition ${
                                            isActive(l.href)
                                                ? "border-[rgba(20,108,120,0.22)] bg-[rgba(20,108,120,0.08)] text-[var(--accent-blue)]"
                                                : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-section-alt)] hover:text-[var(--text-primary)]"
                                        }`}
                                    >
                                        {l.label}
                                    </Link>
                                ))}
                                {user && (user.role === "admin" || user.role === "staff") && (
                                    <Link
                                        href="/admin/inventory"
                                        onClick={() => setIsOpen(false)}
                                        className={`w-full rounded-2xl border px-4 py-3 text-[1rem] font-semibold tracking-normal ${
                                            isActive("/admin")
                                                ? "border-[rgba(20,108,120,0.22)] bg-[rgba(20,108,120,0.08)] text-[var(--accent-blue)]"
                                                : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                        }`}
                                    >
                                        Admin
                                    </Link>
                                )}
                                {user && user.role === "seller" && (
                                    <Link
                                        href="/dashboard/seller"
                                        onClick={() => setIsOpen(false)}
                                        className={`w-full rounded-2xl border px-4 py-3 text-[1rem] font-semibold tracking-normal ${
                                            isActive("/dashboard/seller")
                                                ? "border-[rgba(20,108,120,0.22)] bg-[rgba(20,108,120,0.08)] text-[var(--accent-blue)]"
                                                : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                        }`}
                                    >
                                        Seller Center
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            {user ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setIsOpen(false)}
                                        className="block w-full rounded-full border px-4 py-3 text-center text-[14px] font-semibold"
                                        style={{
                                            borderColor: "var(--border-subtle)",
                                            color: "var(--text-primary)",
                                        }}
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsOpen(false);
                                        }}
                                        className="block w-full rounded-full border px-4 py-3 text-center text-[14px] font-semibold"
                                        style={{
                                            borderColor: "rgba(239,68,68,0.35)",
                                            color: "rgb(248,113,113)",
                                        }}
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="block w-full rounded-full border px-4 py-3 text-center text-[14px] font-semibold"
                                        style={{
                                            borderColor: "var(--border-subtle)",
                                            color: "var(--text-primary)",
                                        }}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={() => setIsOpen(false)}
                                        className="block w-full rounded-full px-4 py-3 text-center text-[14px] font-semibold text-white"
                                        style={{
                                            background: "linear-gradient(135deg, var(--accent-blue), var(--accent-violet))",
                                            boxShadow: "0 0 30px rgba(79,142,247,0.4)",
                                        }}
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <style jsx>{`
              .navbarDrawer {
                transform: translateX(0) !important;
              }
              @media (max-width: 640px) {
                .navbarDrawer {
                  left: 0 !important;
                  right: 0 !important;
                  width: 100vw !important;
                  max-width: 100vw !important;
                }
              }
            `}</style>
        </header>
    );
}
