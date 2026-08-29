"use client";

import { useMemo } from "react";

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

function isGuestPostingLead(lead: Lead) {
    const text = `${lead.platform || ""} ${lead.notes || ""}`.toLowerCase();
    return text.includes("guest posting") || text.includes("guest post");
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

export default function LeadsTab({ leads, fetchData }: LeadsTabProps) {
    const leadList = leads as Lead[];

    const stats = useMemo(() => {
        const guestPosting = leadList.filter(isGuestPostingLead);
        const pipeline = leadList.filter((lead) => ["New", "In Progress"].includes(lead.status || "New"));
        return [
            { label: "Total Leads", value: leadList.length, color: "#182026" },
            { label: "Guest Post Quotes", value: guestPosting.length, color: "#146c78" },
            { label: "Open Pipeline", value: pipeline.length, color: "#9a5c14" },
            {
                label: "Pipeline Value",
                value: money(pipeline.reduce((sum, lead) => sum + Number(lead.budget || 0), 0)),
                color: "#14845f",
            },
        ];
    }, [leadList]);

    return (
        <div className="FadeIn">
            <div className="glass" style={{ padding: "2rem", borderRadius: "16px", marginBottom: "2rem", border: "1px solid #dce4df", position: "relative", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                    <div>
                        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.5rem", color: "#182026" }}>
                            Business Lead Pipeline
                        </h2>
                        <p style={{ color: "#4f5f68", fontSize: "1rem" }}>
                            Track quote requests, guest posting buyers, abandoned carts, and service leads from one CRM view.
                        </p>
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ padding: "0.9rem 1.3rem", fontWeight: 800, border: "none" }}
                        onClick={() => alert("Use the public Guest Posting quote form or Fast Add Lead to capture new leads.")}
                    >
                        Capture Lead
                    </button>
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

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 0.8fr)", gap: "1.5rem" }}>
                <div className="glass" style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #dce4df" }}>
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #dce4df", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                        <div>
                            <h3 style={{ margin: 0, color: "#182026" }}>Active Lead Database</h3>
                            <p style={{ margin: "0.3rem 0 0", color: "#61717a", fontSize: "0.9rem" }}>
                                Guest Posting leads are highlighted automatically.
                            </p>
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "820px" }}>
                            <thead>
                                <tr style={{ textAlign: "left", borderBottom: "1px solid #dce4df", background: "#f7faf6" }}>
                                    <th style={{ padding: "1rem", color: "#61717a", fontSize: "0.8rem" }}>CLIENT</th>
                                    <th style={{ padding: "1rem", color: "#61717a", fontSize: "0.8rem" }}>SERVICE</th>
                                    <th style={{ padding: "1rem", color: "#61717a", fontSize: "0.8rem" }}>BUDGET</th>
                                    <th style={{ padding: "1rem", color: "#61717a", fontSize: "0.8rem" }}>STATUS</th>
                                    <th style={{ padding: "1rem", color: "#61717a", fontSize: "0.8rem" }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leadList.map((lead) => {
                                    const status = lead.status || "New";
                                    const colors = statusColors[status] || statusColors.New;
                                    const guestPosting = isGuestPostingLead(lead);

                                    return (
                                        <tr key={lead.id} style={{ borderBottom: "1px solid rgba(24,32,38,0.08)", background: guestPosting ? "rgba(20,108,120,0.04)" : "#ffffff" }}>
                                            <td style={{ padding: "1rem", verticalAlign: "top" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                                    <strong style={{ color: "#182026" }}>{lead.clientName || "Unnamed lead"}</strong>
                                                    {guestPosting ? (
                                                        <span style={{ border: "1px solid rgba(20,108,120,0.24)", color: "#146c78", borderRadius: "999px", padding: "2px 8px", fontSize: "0.7rem", fontWeight: 800 }}>
                                                            Guest Posting
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <div style={{ fontSize: "0.78rem", color: "#61717a", marginTop: "5px" }}>
                                                    {lead.buyerEmail || "No email"}
                                                </div>
                                                {lead.lighthouse_score ? (
                                                    <div style={{ fontSize: "0.75rem", color: Number(lead.lighthouse_score) > 80 ? "#14845f" : "#a83a26", marginTop: "5px" }}>
                                                        Lighthouse: {lead.lighthouse_score}%
                                                    </div>
                                                ) : null}
                                            </td>
                                            <td style={{ padding: "1rem", verticalAlign: "top" }}>
                                                <div style={{ color: "#182026", fontWeight: 700 }}>{lead.platform || "General"}</div>
                                                {lead.notes ? (
                                                    <pre style={{ marginTop: "0.5rem", maxWidth: "340px", whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: "0.75rem", lineHeight: 1.55, color: "#61717a" }}>
                                                        {String(lead.notes).slice(0, 280)}
                                                        {String(lead.notes).length > 280 ? "..." : ""}
                                                    </pre>
                                                ) : null}
                                            </td>
                                            <td style={{ padding: "1rem", verticalAlign: "top" }}>
                                                <strong style={{ color: "#14845f" }}>{money(lead.budget)}</strong>
                                            </td>
                                            <td style={{ padding: "1rem", verticalAlign: "top" }}>
                                                <select
                                                    value={status}
                                                    onChange={async (event) => {
                                                        await updateLead(lead, { status: event.target.value });
                                                        fetchData();
                                                    }}
                                                    style={{
                                                        padding: "6px 10px",
                                                        borderRadius: "999px",
                                                        fontSize: "0.78rem",
                                                        fontWeight: 800,
                                                        background: colors.bg,
                                                        color: colors.color,
                                                        border: `1px solid ${colors.border}`,
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
                                                        title="Run audit"
                                                        onClick={async () => {
                                                            const res = await fetch("/api/leads", { method: "POST", body: JSON.stringify({ action: "run_audit", id: lead.id }) });
                                                            if (res.ok) fetchData();
                                                        }}
                                                        style={{ background: "#f7faf6", border: "1px solid #dce4df", color: "#182026", cursor: "pointer", padding: "7px 10px", borderRadius: "8px", fontWeight: 800 }}
                                                    >
                                                        Audit
                                                    </button>
                                                    <button
                                                        title="Generate pitch"
                                                        onClick={async () => {
                                                            const res = await fetch("/api/leads", { method: "POST", body: JSON.stringify({ action: "generate_pitch", id: lead.id }) });
                                                            if (res.ok) {
                                                                const data = await res.json();
                                                                alert(`Personalized pitch:\n\n${data.pitch}`);
                                                                fetchData();
                                                            }
                                                        }}
                                                        style={{ background: "rgba(20,108,120,0.10)", border: "1px solid rgba(20,108,120,0.24)", color: "#146c78", cursor: "pointer", padding: "7px 10px", borderRadius: "8px", fontWeight: 800 }}
                                                    >
                                                        Pitch
                                                    </button>
                                                    <button
                                                        title="Set report link"
                                                        onClick={async () => {
                                                            const link = prompt("Enter report or placement URL:", lead.document_link || "");
                                                            if (link !== null) {
                                                                await updateLead(lead, { document_link: link });
                                                                fetchData();
                                                            }
                                                        }}
                                                        style={{ background: lead.document_link ? "rgba(20,132,95,0.12)" : "#f7faf6", border: "1px solid #dce4df", color: lead.document_link ? "#14845f" : "#182026", cursor: "pointer", padding: "7px 10px", borderRadius: "8px", fontWeight: 800 }}
                                                    >
                                                        Report
                                                    </button>
                                                    <button
                                                        title="Edit notes"
                                                        onClick={async () => {
                                                            const notes = prompt("Edit notes for this lead:", lead.notes || "");
                                                            if (notes !== null) {
                                                                await updateLead(lead, { notes });
                                                                fetchData();
                                                            }
                                                        }}
                                                        style={{ background: "#ffffff", border: "1px solid #dce4df", color: "#182026", cursor: "pointer", padding: "7px 10px", borderRadius: "8px", fontWeight: 800 }}
                                                    >
                                                        Notes
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {leadList.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#61717a" }}>
                                            No leads yet. Submit the Guest Posting quote form or add one manually.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div className="glass" style={{ padding: "1.5rem", borderRadius: "16px", border: "1px solid #dce4df" }}>
                        <h4 style={{ marginBottom: "1rem", color: "#182026" }}>Fast Add Lead</h4>
                        <form onSubmit={async (event) => {
                            event.preventDefault();
                            const formData = new FormData(event.target as HTMLFormElement);
                            const res = await fetch("/api/leads", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    action: "add",
                                    clientName: formData.get("name"),
                                    platform: formData.get("service"),
                                    budget: formData.get("budget"),
                                    buyerEmail: formData.get("email"),
                                    notes: formData.get("notes"),
                                }),
                            });
                            if (res.ok) {
                                (event.target as HTMLFormElement).reset();
                                fetchData();
                            }
                        }} style={{ display: "grid", gap: "0.8rem" }}>
                            <input name="name" placeholder="Contact / company name" className="input-field" required />
                            <input name="email" type="email" placeholder="Client email" className="input-field" />
                            <select name="service" className="input-field" defaultValue="Guest Posting">
                                <option>Guest Posting</option>
                                <option>SEO Services</option>
                                <option>Website Development</option>
                                <option>Accounts & Growth</option>
                                <option>Business Formation</option>
                            </select>
                            <input name="budget" type="number" placeholder="Estimated budget ($)" className="input-field" />
                            <textarea name="notes" placeholder="Domain, niche, target URL, anchor text, next step..." className="input-field" style={{ minHeight: "96px" }} />
                            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Add Lead</button>
                        </form>
                    </div>

                    <div className="glass" style={{ padding: "1.5rem", borderRadius: "16px", border: "1px solid #dce4df" }}>
                        <h4 style={{ marginBottom: "1rem", color: "#182026" }}>Guest Posting Sales Checklist</h4>
                        <div style={{ display: "grid", gap: "0.9rem", color: "#4f5f68", fontSize: "0.9rem" }}>
                            <span>1. Confirm client niche, country, target URL, and anchor preference.</span>
                            <span>2. Shortlist publishers by relevance and visible quality.</span>
                            <span>3. Share pricing, delivery time, and final link attribute policy.</span>
                            <span>4. Publish, add the report URL, and mark the lead Won.</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media (max-width: 1100px) {
                    div[style*="minmax(0, 2fr)"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
