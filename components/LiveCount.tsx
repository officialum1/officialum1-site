"use client";

import { useState, useEffect } from 'react';

interface LiveCountProps {
    metric: 'orders' | 'reviews' | 'projects' | 'satisfaction' | 'activeUsers' | 'kbEngagement';
    suffix?: string;
    prefix?: string;
    decimals?: number;
    interval?: number;
    short?: boolean;
}

export default function LiveCount({ metric, suffix = "", prefix = "", decimals = 0, interval = 10000, short = false }: LiveCountProps) {
    const [count, setCount] = useState<number | null>(null);

    const formatNumber = (num: number) => {
        if (short && num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return decimals > 0 ? num.toFixed(decimals) : Math.floor(num).toLocaleString();
    };

    const fetchStat = async () => {
        try {
            const res = await fetch('/api/stats/live');
            const data = await res.json();
            const stats = data.stats || data;
            if (stats[metric] !== undefined) {
                setCount(stats[metric]);
            }
        } catch (e) {
            console.error("Live fetch error:", e);
        }
    };

    useEffect(() => {
        // Try to hook into the global live engine first (more efficient)
        const engine = (window as any).OfficialUM1_LiveStats;
        if (engine && typeof engine.onChange === 'function') {
            engine.onChange((data: any) => {
                const stats = data.stats || data;
                if (stats[metric] !== undefined) {
                    setCount(stats[metric]);
                }
            });
            return;
        }

        // Fallback to local polling if engine isn't ready
        fetchStat();
        const timer = setInterval(fetchStat, interval);
        return () => clearInterval(timer);
    }, [metric, interval]);

    if (count === null) return <span className="animate-pulse">...</span>;

    return (
        <span>
            {prefix}
            {formatNumber(count)}
            {suffix}
        </span>
    );
}
