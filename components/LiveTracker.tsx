"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function LiveTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Generate a random session ID if not exists
        let sessionId = sessionStorage.getItem('oum1_session');
        if (!sessionId) {
            sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('oum1_session', sessionId);
        }

        const track = async () => {
            try {
                await fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId,
                        currentPath: pathname,
                        userAgent: navigator.userAgent
                    })
                });
            } catch (error) {
                // Silent fail
            }
        };

        track();

        // Heartbeat every 60 seconds
        const heartbeat = setInterval(track, 60000);

        return () => clearInterval(heartbeat);
    }, [pathname]);

    return null;
}
