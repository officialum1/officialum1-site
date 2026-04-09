"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

type DemandLevel = "High" | "Medium" | "Low";

type Z2UIntelResponse = {
  hotSearches: { keyword: string; demand: DemandLevel; competition: DemandLevel; opportunity: number }[];
  topOpportunity: {
    suggestedTitle: string;
    priceRange: string;
    pricingStrategy: string;
    seoDescription: string;
    rankingTips: string[];
  };
  quickWins: { action: string; impact: string }[];
  summary: string;
};

function badgeStyle(level: DemandLevel) {
  if (level === "High") return { background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.35)", color: "#00ff88" };
  if (level === "Medium") return { background: "rgba(255,193,7,0.10)", border: "1px solid rgba(255,193,7,0.35)", color: "#ffc107" };
  return { background: "rgba(255,68,68,0.10)", border: "1px solid rgba(255,68,68,0.35)", color: "#ff4444" };
}

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

export default function Z2UIntelPage() {
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [platform, setPlatform] = useState<"Z2U" | "G2G">("Z2U");
  const [category, setCategory] = useState<string>("Game Accounts");
  const [game, setGame] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Z2UIntelResponse | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const key = localStorage.getItem("admin_key") || "";
    if (!key) {
      window.location.href = "/admin/login";
      return;
    }
    setAdminPassword(key);
  }, []);

  const canAnalyze = useMemo(() => game.trim().length > 0 && !loading, [game, loading]);

  const onAnalyze = async () => {
    if (!game.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/admin/z2u-intel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({ platform, category, game: game.trim() }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Analysis failed, try again");
        return;
      }
      setData(json as Z2UIntelResponse);
    } catch (e: any) {
      setError(e?.message || "Analysis failed, try again");
    } finally {
      setLoading(false);
    }
  };

  const doCopy = async (key: string, text: string) => {
    try {
      await copyToClipboard(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((v) => (v === key ? null : v)), 1200);
    } catch {
      setCopiedKey(null);
    }
  };

  return (
    <AdminShell
      title="Z2U Intel"
      subtitle="Live marketplace intel to find demand gaps and generate ready-to-publish listings."
      right={<span className="badge">AI Live Search</span>}
    >
            <div className="glass" style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px", padding: "1.25rem", marginBottom: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr auto", gap: "0.9rem", alignItems: "end" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.7rem", color: "#666", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "1px" }}>Platform</label>
              <select
                className="input-field"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                style={{ width: "100%", height: "46px", borderRadius: "12px" }}
              >
                <option value="Z2U">Z2U</option>
                <option value="G2G">G2G</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.7rem", color: "#666", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "1px" }}>Category</label>
              <select
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: "100%", height: "46px", borderRadius: "12px" }}
              >
                {["Game Accounts", "Game Currency", "Game Items", "Boosting", "CD Keys", "Social Media Accounts"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.7rem", color: "#666", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "1px" }}>Game / Product</label>
              <input
                className="input-field"
                value={game}
                onChange={(e) => setGame(e.target.value)}
                placeholder='e.g. "Roblox", "Fortnite", "Reddit Accounts"'
                style={{ width: "100%", height: "46px", borderRadius: "12px" }}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={onAnalyze}
              disabled={!canAnalyze}
              style={{ height: "46px", borderRadius: "12px", padding: "0 1.4rem", fontWeight: "bold", opacity: canAnalyze ? 1 : 0.6, minWidth: "160px" }}
            >
              {loading ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                  <span className="loader" style={{ width: "18px", height: "18px", borderTopColor: "#00ff88", borderRightColor: "rgba(0, 255, 136, 0.2)", borderBottomColor: "rgba(0, 255, 136, 0.2)", borderLeftColor: "rgba(0, 255, 136, 0.2)" }} />
                  Analyzing...
                </span>
              ) : (
                "Analyze Now"
              )}
            </button>
          </div>

          {error && (
            <div style={{ marginTop: "1rem", color: "#ff4444", border: "1px solid rgba(255,68,68,0.35)", background: "rgba(255,68,68,0.08)", padding: "0.85rem 1rem", borderRadius: "12px" }}>
              {error}
            </div>
          )}
        </div>

        {data && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.9fr", gap: "1rem", alignItems: "start" }}>
              {/* Card 1 */}
              <div className="glass" style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px", padding: "1.25rem" }}>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "0.9rem" }}>🔥 Hot Keywords Table</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.7rem" }}>
                        <th style={{ textAlign: "left", padding: "0.65rem 0.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Keyword</th>
                        <th style={{ textAlign: "left", padding: "0.65rem 0.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Demand</th>
                        <th style={{ textAlign: "left", padding: "0.65rem 0.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Competition</th>
                        <th style={{ textAlign: "right", padding: "0.65rem 0.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Opportunity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.hotSearches?.map((k, idx) => (
                        <tr key={`${k.keyword}-${idx}`}>
                          <td style={{ padding: "0.7rem 0.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#ddd" }}>{k.keyword}</td>
                          <td style={{ padding: "0.7rem 0.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", padding: "0.25rem 0.5rem", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 700, ...badgeStyle(k.demand) }}>
                              {k.demand}
                            </span>
                          </td>
                          <td style={{ padding: "0.7rem 0.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", padding: "0.25rem 0.5rem", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 700, ...badgeStyle(k.competition) }}>
                              {k.competition}
                            </span>
                          </td>
                          <td style={{ padding: "0.7rem 0.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "right" }}>
                            <span style={{ fontWeight: 900, color: "#fff" }}>{k.opportunity}</span>
                            <span style={{ color: "#666", marginLeft: "0.25rem" }}>/10</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Card 2 */}
              <div className="glass" style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px", padding: "1.25rem" }}>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "0.9rem" }}>🎯 Best Offer to Create Today</div>

                {([
                  { key: "suggestedTitle", label: "Suggested Title", value: data.topOpportunity?.suggestedTitle || "" },
                  { key: "priceRange", label: "Price Range", value: data.topOpportunity?.priceRange || "" },
                  { key: "pricingStrategy", label: "Pricing Strategy", value: data.topOpportunity?.pricingStrategy || "" },
                  { key: "seoDescription", label: "SEO Description", value: data.topOpportunity?.seoDescription || "" },
                ] as const).map((f) => (
                  <div key={f.key} style={{ marginBottom: "0.95rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.45rem" }}>
                      <div style={{ fontSize: "0.72rem", color: "#666", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 800 }}>{f.label}</div>
                      <button
                        className="btn btn-outline"
                        onClick={() => doCopy(`field:${f.key}`, f.value)}
                        style={{ padding: "0.25rem 0.7rem", fontSize: "0.75rem", borderRadius: "10px", color: "#00ff88", borderColor: "#00ff8833" }}
                      >
                        {copiedKey === `field:${f.key}` ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div style={{ color: "#ddd", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{f.value}</div>
                  </div>
                ))}

                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.45rem" }}>
                    <div style={{ fontSize: "0.72rem", color: "#666", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 800 }}>Ranking Tips</div>
                    <button
                      className="btn btn-outline"
                      onClick={() => doCopy("field:rankingTips", (data.topOpportunity?.rankingTips || []).map((t, i) => `${i + 1}. ${t}`).join("\n"))}
                      style={{ padding: "0.25rem 0.7rem", fontSize: "0.75rem", borderRadius: "10px", color: "#00ff88", borderColor: "#00ff8833" }}
                    >
                      {copiedKey === "field:rankingTips" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <ol style={{ margin: 0, paddingLeft: "1.1rem", color: "#ddd", lineHeight: 1.6 }}>
                    {(data.topOpportunity?.rankingTips || []).map((tip, i) => (
                      <li key={i} style={{ marginBottom: "0.35rem" }}>{tip}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Card 3 */}
              <div className="glass" style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px", padding: "1.25rem" }}>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "0.9rem" }}>⚡ Quick Wins</div>
                <ol style={{ margin: 0, paddingLeft: "1.15rem", color: "#ddd", lineHeight: 1.6 }}>
                  {(data.quickWins || []).slice(0, 3).map((q, i) => (
                    <li key={i} style={{ marginBottom: "0.85rem" }}>
                      <div style={{ fontWeight: 800 }}>{q.action}</div>
                      <div style={{ color: "#888", marginTop: "0.25rem", fontSize: "0.9rem" }}>{q.impact}</div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div style={{ marginTop: "1rem", color: "#aaa", fontStyle: "italic", lineHeight: 1.6 }}>
              {data.summary}
            </div>
          </>
        )}
    </AdminShell>
  );
}

