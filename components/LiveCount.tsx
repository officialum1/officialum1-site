"use client";

import { useState, useEffect } from 'react';

interface LiveCountProps {
    metric: 'orders' | 'reviews' | 'projects' | 'satisfaction' | 'activeUsers' | 'kbEngagement' | 'marketAssets';
    suffix?: string;
    prefix?: string;
    decimals?: number;
    interval?: number;
    short?: boolean;
}

export default function LiveCount({ metric, suffix = "", prefix = "", decimals = 0, interval = 10000, short = false }: LiveCountProps) {
    // Emergency Base Values to prevent ANY "Empty Static" look on first load
    const baseValues: Record<string, number> = {
        orders: 3600,
        reviews: 3675,
        projects: 250,
        satisfaction: 4.88,
        activeUsers: 142,
        kbEngagement: 12000,
        marketAssets: 10000
    };

    const [count, setCount] = useState<number>(baseValues[metric] || 0);

    const formatNumber = (num: number) => {
        if (short && num >= 1000) {
            return (num / 1000).toFixed(1) + 'k+';
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
        } catch (e) { }
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

    return (
        <span className="LivePulse">
            {prefix}
            {formatNumber(count)}
            {suffix}
        </span>
    );
}
