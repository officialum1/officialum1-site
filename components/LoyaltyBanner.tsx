"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function LoyaltyBanner() {
    const pathname = usePathname();
    const [points, setPoints] = useState(0);

    useEffect(() => {
        const stored = localStorage.getItem("buyer_user");
        if (stored) {
            const user = JSON.parse(stored);
            setPoints(user.loyalty_points || 0);
        }
    }, []);

    if (pathname?.startsWith("/admin")) return null;
    if (points === 0) return null;

    return (
        <div
            style={{
                background: "linear-gradient(90deg, rgba(20,108,120,0.12), rgba(217,145,61,0.22))",
                color: "var(--text-primary)",
                textAlign: "center",
                padding: "8px",
                fontSize: "0.9rem",
                fontWeight: "bold",
                position: "fixed",
                top: "80px",
                width: "100%",
                zIndex: 99,
                borderBottom: "1px solid var(--border-subtle)",
            }}
        >
            You have {points} loyalty points. Redeem them for discounts at checkout.
        </div>
    );
}
