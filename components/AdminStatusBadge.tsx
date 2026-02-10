
"use client";
import { useState, useEffect } from 'react';

export default function AdminStatusBadge() {
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch('/api/admin/settings?key=admin_online_status');
                const data = await res.json();
                setIsOnline(data.value === 'online' || data.value === 'true');
            } catch (e) {
                setIsOnline(false);
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] backdrop-blur-md transition-all duration-500 shadow-lg ${isOnline ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 grayscale'}`}>
            <div className="relative flex items-center justify-center">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-zinc-500'} transition-colors duration-500`}></span>
                {isOnline && <span className="absolute w-full h-full rounded-full bg-emerald-400 animate-ping opacity-40"></span>}
            </div>
            <span className="drop-shadow-sm">{isOnline ? 'Live Support Online' : 'Operator Away'}</span>
        </div>
    );

}
