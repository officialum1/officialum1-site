"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { CheckCircle2, ShoppingBag, TrendingUp, X } from "lucide-react";
import { readJson } from "@/lib/read-json";

type PulseNotification = {
    title: string;
    message: ReactNode;
    time: string;
    type: "real" | "trending";
};

export default function DynamicSalesPulse() {
    const pathname = usePathname();
    const [notification, setNotification] = useState<PulseNotification | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [realSales, setRealSales] = useState<any[]>([]);
    const [shopItems, setShopItems] = useState<any[]>([]);

    useEffect(() => {
        const host = window.location.hostname;
        if (host === "localhost" || host === "127.0.0.1") return;

        const loadInitialData = async () => {
            try {
                const salesRes = await fetch("/api/sales/recent");
                const salesData = await readJson<any[]>(salesRes);
                if (Array.isArray(salesData)) setRealSales(salesData);

                const productsRes = await fetch("/api/products");
                const productsData = await readJson<any[]>(productsRes);
                if (Array.isArray(productsData)) setShopItems(productsData);
            } catch {
                setRealSales([]);
                setShopItems([]);
            }
        };

        loadInitialData();
        const refreshInterval = setInterval(loadInitialData, 120000);
        return () => clearInterval(refreshInterval);
    }, []);

    useEffect(() => {
        const triggerNotification = () => {
            let selected: PulseNotification | null = null;

            if (realSales.length > 0) {
                const sale = realSales[Math.floor(Math.random() * realSales.length)];
                const rawName = sale.customerName || sale.username || "Customer";
                const maskedName = rawName.length > 2 ? rawName.substring(0, 3) + "****" : rawName + "****";

                selected = {
                    title: "Verified Purchase",
                    message: (
                        <span>
                            <b>{maskedName}</b> just bought <b>{sale.product}</b>
                        </span>
                    ),
                    time: "Just now",
                    type: "real",
                };
            } else if (shopItems.length > 0) {
                const item = shopItems[Math.floor(Math.random() * shopItems.length)];

                selected = {
                    title: "Trending Now",
                    message: `${item.name} is in high demand right now.`,
                    time: "Live",
                    type: "trending",
                };
            }

            if (selected) {
                setNotification(selected);
                setIsVisible(true);
                setTimeout(() => setIsVisible(false), 6000);
            }
        };

        const nextPulse = () => {
            const delay = Math.floor(Math.random() * (45000 - 20000 + 1)) + 20000;
            return setTimeout(() => {
                triggerNotification();
                pulseTimeout = nextPulse();
            }, delay);
        };

        let pulseTimeout = setTimeout(triggerNotification, 5000);
        return () => clearTimeout(pulseTimeout);
    }, [realSales, shopItems]);

    if (pathname?.startsWith("/admin")) return null;
    if (!notification) return null;

    const Icon = notification.type === "real" ? ShoppingBag : TrendingUp;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="salesPulse"
                    initial={{ x: -100, opacity: 0, scale: 0.92 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ x: -100, opacity: 0, scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    style={{
                        position: "fixed",
                        bottom: "18px",
                        left: "18px",
                        zIndex: 99999,
                        width: "min(300px, calc(100vw - 32px))",
                        pointerEvents: "auto",
                    }}
                >
                    <div
                        style={{
                            background: "rgba(255, 255, 255, 0.94)",
                            backdropFilter: "blur(16px)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "16px",
                            padding: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            boxShadow: "0 16px 42px rgba(24,32,38,0.14)",
                            overflow: "hidden",
                            position: "relative",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: "12px",
                                right: "12px",
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: "var(--accent-blue)",
                                boxShadow: "0 0 10px rgba(20,108,120,0.3)",
                            }}
                        />

                        <div
                            style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "12px",
                                background: "rgba(20,108,120,0.08)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                border: "1px solid var(--border-subtle)",
                                color: "var(--accent-blue)",
                            }}
                        >
                            <Icon size={21} />
                        </div>

                        <div style={{ flex: 1 }}>
                            <div
                                style={{
                                    fontSize: "0.68rem",
                                    color: "var(--accent-blue)",
                                    fontWeight: 800,
                                    textTransform: "uppercase",
                                    letterSpacing: 0,
                                    marginBottom: "2px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                }}
                            >
                                {notification.title}
                                {notification.type === "real" && (
                                    <span style={{ display: "inline-flex", color: "#14845f" }}>
                                        <CheckCircle2 size={13} />
                                    </span>
                                )}
                            </div>
                            <div
                                style={{
                                    fontSize: "0.82rem",
                                    color: "var(--text-primary)",
                                    fontWeight: 500,
                                    lineHeight: 1.35,
                                }}
                            >
                                {notification.message}
                            </div>
                            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "4px" }}>
                                {notification.time}
                            </div>
                        </div>

                        <button
                            onClick={() => setIsVisible(false)}
                            style={{
                                background: "#fff",
                                border: "1px solid var(--border-subtle)",
                                color: "var(--text-muted)",
                                width: "26px",
                                height: "26px",
                                borderRadius: "50%",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            aria-label="Close sales notification"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 6, ease: "linear" }}
                        style={{
                            height: "2px",
                            background: "var(--gradient)",
                            position: "absolute",
                            bottom: 0,
                            left: "16px",
                            right: "16px",
                            borderRadius: "2px",
                            opacity: 0.75,
                        }}
                    />

                    <style jsx>{`
                        @media (max-width: 640px) {
                            .salesPulse {
                                display: none;
                            }
                        }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
