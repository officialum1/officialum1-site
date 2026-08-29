"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function ScrollProgress() {
    const pathname = usePathname();
    
    // Disable user scroll progress bar inside private Admin area
    if (pathname?.startsWith('/admin')) return null;

    const [width, setWidth] = useState(0);

    const onScroll = () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        setWidth(scrolled);
    };

    useEffect(() => {
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '3px',
            background: 'linear-gradient(90deg, var(--accent), var(--secondary))',
            width: `${width}%`,
            zIndex: 99999,
            transition: 'width 0.1s ease-out',
            boxShadow: '0 0 10px var(--primary)'
        }} />
    );
}
