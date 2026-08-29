"use client";

import { useState, useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

interface LiveCountProps {
    metric: 'orders' | 'reviews' | 'projects' | 'satisfaction' | 'activeUsers' | 'kbEngagement' | 'marketAssets';
    suffix?: string;
    prefix?: string;
    decimals?: number;
    interval?: number;
    short?: boolean;
    /** When true, animates from 0 to value (for count-up on scroll). */
    triggerAnimation?: boolean;
}

export default function LiveCount({ metric, suffix = "", prefix = "", decimals = 0, interval = 10000, short = false, triggerAnimation = false }: LiveCountProps) {
    const baseValues: Record<string, number> = {
        orders: 3600,
        reviews: 3675,
        projects: 250,
        satisfaction: 4.88,
        activeUsers: 2500,
        kbEngagement: 12000,
        marketAssets: 10000
    };

    const [count, setCount] = useState<number>(baseValues[metric] ?? 0);
    const [displayValue, setDisplayValue] = useState<number>(triggerAnimation ? 0 : (baseValues[metric] ?? 0));
    const hasAnimated = useRef(false);

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
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') return;

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
        fetchStat();
        const timer = setInterval(fetchStat, interval);
        return () => clearInterval(timer);
    }, [metric, interval]);

    // Count-up animation when triggerAnimation becomes true
    useEffect(() => {
        if (!triggerAnimation) return;
        if (!hasAnimated.current) {
            hasAnimated.current = true;
            setDisplayValue(0);
            const target = count;
            animate(0, target, {
                duration: 1.5,
                ease: "easeOut",
                onUpdate: (v) => setDisplayValue(v),
            });
        } else {
            setDisplayValue(count);
        }
    }, [triggerAnimation, count]);

    const valueToShow = triggerAnimation ? displayValue : count;

    return (
        <span className="LivePulse">
            {prefix}
            {formatNumber(valueToShow)}
            {suffix}
        </span>
    );
}
