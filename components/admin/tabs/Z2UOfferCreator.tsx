"use client";
import { useState, useEffect } from 'react';

export default function Z2UOfferCreator() {
    const [logs, setLogs] = useState<any[]>([]);
    const [fetchingLogs, setFetchingLogs] = useState(false);

    useEffect(() => {
        fetchLogs();
        const logInterval = setInterval(fetchLogs, 10000); // Pulse every 10s

        return () => {
            clearInterval(logInterval);
        };
    }, []);

    const fetchLogs = async () => {
        setFetchingLogs(true);
        try {
            const res = await fetch('/api/admin/z2u?type=logs');
            const data = await res.json();
            setLogs(data.logs || []);
        } catch (e) { console.error(e); }
        setFetchingLogs(false);
    };

    return (
        <div className="FadeIn p-4">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3 text-emerald-400">
                        🛰️ Z2U Log's Telemetry
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest font-black">Pulse Active</span>
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Real-time telemetry and bump monitoring from your Z2U extension.</p>
                </div>
            </div>

            {/* REAL-TIME COMMAND LOGS (PLAYERUP STYLE) */}
            <div className="mt-4 glass-heavy rounded-3xl border border-white/10 overflow-hidden flex flex-col shadow-2xl">
                <div className="bg-black/50 px-8 py-4 border-b border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        ⚡ Z2U Satellite & Bump Telemetry
                    </span>
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 animate-pulse"></div>
                    </div>
                </div>
                <div className="h-[600px] overflow-y-auto p-6 font-mono text-[11px] space-y-1 custom-scrollbar bg-black/80">
                    {logs.length === 0 ? (
                        <div className="text-gray-600 italic py-4 pl-2 font-mono">Waiting for satellite telemetry... [LINKING]</div>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className="flex gap-4 border-l-2 border-white/5 pl-4 hover:border-emerald-500/50 transition-colors py-0.5">
                                <span className="text-gray-600 shrink-0">[{new Date(log.created_at).toLocaleTimeString([], { hour12: false })}]</span>
                                <span className="text-emerald-500 font-bold shrink-0">🛰️ UPLINK:</span>
                                <span className={`${log.type === 'success' ? 'text-emerald-400' :
                                    log.type === 'process' ? 'text-blue-400' :
                                        log.type === 'warning' ? 'text-amber-400' : 'text-gray-400'
                                    }`}>
                                    {log.message}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
