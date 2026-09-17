"use client";

import { useMemo, useState, useEffect } from "react";

interface LeadsTabProps {
    leads: any[];
    fetchData: (user?: any) => Promise<void>;
}

type Lead = {
    id: string;
    clientName?: string;
    platform?: string;
    budget?: number | string;
    status?: string;
    notes?: string;
    buyerEmail?: string;
    document_link?: string;
    lighthouse_score?: string;
    createdAt?: string;
};

const statusColors: Record<string, { bg: string; color: string; border: string }> = {
    New: { bg: "rgba(20,108,120,0.10)", color: "#146c78", border: "rgba(20,108,120,0.24)" },
    "In Progress": { bg: "rgba(217,145,61,0.14)", color: "#9a5c14", border: "rgba(217,145,61,0.28)" },
    Won: { bg: "rgba(20,132,95,0.12)", color: "#14845f", border: "rgba(20,132,95,0.24)" },
    Lost: { bg: "rgba(196,71,45,0.12)", color: "#a83a26", border: "rgba(196,71,45,0.24)" },
    Abandoned: { bg: "rgba(120,120,120,0.12)", color: "#555", border: "rgba(120,120,120,0.24)" },
};

function money(value: unknown) {
    return `$${Number(value || 0).toLocaleString()}`;
}

async function updateLead(lead: Lead, patch: Partial<Lead>) {
    await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            action: "update_status",
            id: lead.id,
            status: patch.status ?? lead.status ?? "New",
            notes: patch.notes ?? lead.notes ?? "",
            budget: patch.budget ?? lead.budget ?? 0,
            document_link: patch.document_link ?? lead.document_link ?? "",
        }),
    });
}

export default function LeadsTab({ leads: initialLeads, fetchData }: LeadsTabProps) {
    const [liveLeads, setLiveLeads] = useState<Lead[]>(initialLeads as Lead[]);
    const [activeFilter, setActiveFilter] = useState<string>("ALL");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isSyncing, setIsSyncing] = useState<boolean>(false);

    // Fetch fresh leads on mount to bypass any stale cache
    const refreshFreshLeads = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch(`/api/leads?t=${Date.now()}`, { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setLiveLeads(data);
                }
            }
        } catch (e) {
            console.error("Error fetching fresh leads:", e);
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        refreshFreshLeads();
    }, []);

    useEffect(() => {
        if (Array.isArray(initialLeads) && initialLeads.length > 0 && liveLeads.length === 0) {
            setLiveLeads(initialLeads);
        }
    }, [initialLeads]);

    // Campaign Counts
    const counts = useMemo(() => {
        let speed = 0;
        let pr = 0;
        let auth = 0;
        let quotes = 0;

        liveLeads.forEach((l) => {
            const src = `${l.platform || ""} ${l.notes || ""}`.toLowerCase();
            if (src.includes("speed") || src.includes("pagespeed")) speed++;
            else if (src.includes("pr ") || src.includes("press release") || src.includes("wire")) pr++;
            else if (src.includes("authority") || src.includes("guest post")) auth++;
            else quotes++;
        });

        return { speed, pr, auth, quotes, total: liveLeads.length };
    }, [liveLeads]);

    // Filtered Leads
    const filteredLeads = useMemo(() => {
        return liveLeads.filter((l) => {
            const src = `${l.platform || ""} ${l.notes || ""}`.toLowerCase();
            const text = `${l.clientName || ""} ${l.buyerEmail || ""} ${l.platform || ""} ${l.notes || ""}`.toLowerCase();
            
            if (searchTerm && !text.includes(searchTerm.toLowerCase())) return false;

            if (activeFilter === "SPEED") return src.includes("speed") || src.includes("pagespeed");
            if (activeFilter === "PR") return src.includes("pr ") || src.includes("press release") || src.includes("wire");
            if (activeFilter === "AUTHORITY") return src.includes("authority") || src.includes("guest post");
            if (activeFilter === "QUOTES") return !src.includes("speed") && !src.includes("pr") && !src.includes("authority");

            return true;
        });
    }, [liveLeads, activeFilter, searchTerm]);

    const stats = useMemo(() => {
        const pipeline = liveLeads.filter((lead) => ["New", "In Progress"].includes(lead.status || "New"));
        return [
            { label: "Total Leads", value: liveLeads.length, color: "#182026" },
            { label: "⚡ Speed Leads", value: counts.speed, color: "#9a5c14" },
            { label: "📰 PR Wire Leads", value: counts.pr, color: "#146c78" },
            { label: "🔗 Authority Links", value: counts.auth, color: "#14845f" },
            {
                label: "Pipeline Value",
                value: money(pipeline.reduce((sum, lead) => sum + Number(lead.budget || 0), 0)),
                color: "#14845f",
            },
        ];
    }, [liveLeads, counts]);

    return (
        <div className="FadeIn">
            <div className="glass" style={{ padding: "2rem", borderRadius: "16px", marginBottom: "2rem", border: "1px solid #dce4df", position: "relative", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                    <div>
                        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.5rem", color: "#182026" }}>
                            Business Lead Pipeline & Cold Outreach CRM
                        </h2>
                        <p style={{ color: "#4f5f68", fontSize: "1rem" }}>
                            Live tracking for all 3 Cold Outreach Campaigns (Speed, PR, Authority Links) and Inbound Quotes.
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button
                            className="btn btn-secondary"
                            style={{ padding: "0.8rem 1.2rem", fontWeight: 800, border: "1px solid #dce4df", background: "#ffffff", cursor: "pointer", borderRadius: "10px" }}
                            onClick={refreshFreshLeads}
                            disabled={isSyncing}
                        >
                            {isSyncing ? "Syncing..." : "🔄 Refresh Live CRM"}
                        </button>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "1rem", marginTop: "2rem" }}>
                    {stats.map((stat) => (
                        <div key={stat.label} style={{ background: "#ffffff", padding: "1.1rem", borderRadius: "12px", border: "1px solid #dce4df" }}>
                            <div style={{ fontSize: "0.72rem", color: "#61717a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.45rem", fontWeight: 800 }}>
                                {stat.label}
                            </div>
                            <div style={{ fontSize: "1.45rem", fontWeight: 900, color: stat.color }}>{stat.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CAMPAIGN TABS */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
                {[
                    { id: "ALL", label: `All Leads (${counts.total})` },
                    { id: "SPEED", label: `⚡ WordPress Speed (${counts.speed})` },
                    { id: "PR", label: `📰 PR Wire Syndication (${counts.pr})` },
                    { id: "AUTHORITY", label: `🔗 Authority Links (${counts.auth})` },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveFilter(tab.id)}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "999px",
                            fontSize: "0.85rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            background: activeFilter === tab.id ? "#182026" : "#ffffff",
                            color: activeFilter === tab.id ? "#ffffff" : "#4f5f68",
                            border: activeFilter === tab.id ? "1px solid #182026" : "1px solid #dce4df",
                        }}
                    >
                        {tab.label}
                    </button>
                ))}

                <div style={{ marginLeft: "auto" }}>
                    <input
                        type="text"
                        placeholder="Search leads, domains, emails..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: "8px 14px",
                            borderRadius: "10px",
                            border: "1px solid #dce4df",
                            fontSize: "0.85rem",
                            minWidth: "240px",
                            outline: "none"
                        }}
                    />
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
                <div className="glass" style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #dce4df" }}>
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #dce4df", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                        <div>
                            <h3 style={{ margin: 0, color: "#182026" }}>Active Lead Database ({filteredLeads.length})</h3>
                            <p style={{ margin: "0.3rem 0 0", color: "#61717a", fontSize: "0.9rem" }}>
                                Displaying dispatched cold outreach emails and customer quote leads.
                            </p>
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "820px" }}>
                            <thead>
                                <tr style={{ textAlign: "left", borderBottom: "1px solid #dce4df", background: "#f7faf6" }}>
                                    <th style={{ padding: "1rem", color: "#61717a", fontSize: "0.8rem" }}>CLIENT / DOMAIN</th>
                                    <th style={{ padding: "1rem", color: "#61717a", fontSize: "0.8rem" }}>CAMPAIGN / SERVICE</th>
                                    <th style={{ padding: "1rem", color: "#61717a", fontSize: "0.8rem" }}>EST. VALUE</th>
                                    <th style={{ padding: "1rem", color: "#61717a", fontSize: "0.8rem" }}>STATUS</th>
                                    <th style={{ padding: "1rem", color: "#61717a", fontSize: "0.8rem" }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeads.map((lead) => {
                                    const status = lead.status || "New";
                                    const colors = statusColors[status] || statusColors.New;
                                    const isSpeed = (lead.platform || "").includes("Speed");
                                    const isPR = (lead.platform || "").includes("PR");
                                    const isAuth = (lead.platform || "").includes("Authority");

                                    return (
                                        <tr key={lead.id} style={{ borderBottom: "1px solid rgba(24,32,38,0.08)", background: "#ffffff" }}>
                                            <td style={{ padding: "1rem", verticalAlign: "top" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                                    <strong style={{ color: "#182026", fontSize: "0.95rem" }}>{lead.clientName || "Unnamed Lead"}</strong>
                                                    {isSpeed ? (
                                                        <span style={{ border: "1px solid rgba(217,145,61,0.28)", background: "rgba(217,145,61,0.1)", color: "#9a5c14", borderRadius: "999px", padding: "2px 8px", fontSize: "0.7rem", fontWeight: 800 }}>
                                                            ⚡ Speed Outreach
                                                        </span>
                                                    ) : isPR ? (
                                                        <span style={{ border: "1px solid rgba(20,108,120,0.24)", background: "rgba(20,108,120,0.08)", color: "#146c78", borderRadius: "999px", padding: "2px 8px", fontSize: "0.7rem", fontWeight: 800 }}>
                                                            📰 PR Wire
                                                        </span>
                                                    ) : isAuth ? (
                                                        <span style={{ border: "1px solid rgba(20,132,95,0.24)", background: "rgba(20,132,95,0.08)", color: "#14845f", borderRadius: "999px", padding: "2px 8px", fontSize: "0.7rem", fontWeight: 800 }}>
                                                            🔗 DA60+ Links
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <div style={{ fontSize: "0.82rem", color: "#146c78", fontWeight: 700, marginTop: "4px" }}>
                                                    {lead.buyerEmail || "No email"}
                                                </div>
                                            </td>
                                            <td style={{ padding: "1rem", verticalAlign: "top" }}>
                                                <div style={{ color: "#182026", fontWeight: 700 }}>{lead.platform || "General"}</div>
                                                {lead.notes ? (
                                                    <pre style={{ marginTop: "0.5rem", maxWidth: "380px", whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: "0.75rem", lineHeight: 1.55, color: "#61717a" }}>
                                                        {String(lead.notes).slice(0, 240)}
                                                        {String(lead.notes).length > 240 ? "..." : ""}
                                                    </pre>
                                                ) : null}
                                            </td>
                                            <td style={{ padding: "1rem", verticalAlign: "top" }}>
                                                <strong style={{ color: "#14845f", fontSize: "0.95rem" }}>{money(lead.budget)}</strong>
                                            </td>
                                            <td style={{ padding: "1rem", verticalAlign: "top" }}>
                                                <select
                                                    value={status}
                                                    onChange={async (event) => {
                                                        await updateLead(lead, { status: event.target.value });
                                                        refreshFreshLeads();
                                                    }}
                                                    style={{
                                                        padding: "6px 12px",
                                                        borderRadius: "999px",
                                                        fontSize: "0.78rem",
                                                        fontWeight: 800,
                                                        background: colors.bg,
                                                        color: colors.color,
                                                        border: `1px solid ${colors.border}`,
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    <option>New</option>
                                                    <option>In Progress</option>
                                                    <option>Won</option>
                                                    <option>Lost</option>
                                                    <option>Abandoned</option>
                                                </select>
                                            </td>
                                            <td style={{ padding: "1rem", verticalAlign: "top" }}>
                                                <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                                                    <button
                                                        title="Edit notes"
                                                        onClick={async () => {
                                                            const notes = prompt("Edit notes for this lead:", lead.notes || "");
                                                            if (notes !== null) {
                                                                await updateLead(lead, { notes });
                                                                refreshFreshLeads();
                                                            }
                                                        }}
                                                        style={{ background: "#ffffff", border: "1px solid #dce4df", color: "#182026", cursor: "pointer", padding: "6px 10px", borderRadius: "8px", fontWeight: 800, fontSize: "0.75rem" }}
                                                    >
                                                        Notes
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredLeads.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#61717a" }}>
                                            No leads found matching this filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
