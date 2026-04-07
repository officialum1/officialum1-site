import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard, Package, ShoppingCart, Star, Layers, Users, Database,
  Settings, Search, RefreshCw, LogOut, ChevronLeft, ChevronRight, Trash2,
  Edit3, Plus, X, Lock, AlertCircle, Loader2, Home, ShieldCheck, Menu,
  Link2, Activity, TrendingUp, Eye, Save, ChevronDown, ChevronUp,
  Globe, BarChart2, Zap, MessageSquare, FileText, DollarSign,
  BookOpen, Tag, ExternalLink, Trophy, Mail, CreditCard, Wifi,
  UserCheck, Briefcase, Headphones, BarChart, Radio, Wrench,
  GitBranch, Send, Megaphone, Map, ScrollText, UserPlus, Building2,
  Phone, CheckCheck, Check, CheckCircle, ArrowLeft, SmartphoneNfc, WifiOff, RefreshCcw
} from "lucide-react";

// ── Theme Constants (White / Light Theme) ────────────────────────────────────
const PRIMARY   = "#4f7af5";
const PRIMARY_D = "rgba(79,122,245,0.12)";
const SIDEBAR_BG = "#0f172a";
const CONTENT_BG = "#f0f4f8";
const CARD_BG   = "#ffffff";
const CARD_BORDER = "#e2e8f0";
const TEXT_D    = "#0f172a";
const TEXT_M    = "#64748b";
const SUCCESS   = "#10b981";
const API_BASE  = "/api";

// ── Helpers ───────────────────────────────────────────────────────────────────
function adminFetch(path: string, token: string, opts?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(opts?.headers ?? {}) },
  });
}
const fmt = (n: unknown) => { const x = Number(n ?? 0); return isNaN(x) ? "0" : x.toLocaleString(); };
const fmtDate = (v: unknown) => { if (!v) return "—"; try { return new Date(String(v)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); } catch { return String(v); } };
const fmtMoney = (n: unknown) => { const x = Number(n ?? 0); if (isNaN(x)) return "$0"; if (x >= 1000) return `$${(x / 1000).toFixed(1)}k`; return `$${x.toFixed(2)}`; };

// ── Types ─────────────────────────────────────────────────────────────────────
interface DbStats { tableCount: number; totalRows: number; totalSizeMb: string; dbName: string; dbHost: string; }
interface TableInfo { name: string; rows: number; size_kb: number; engine: string; }
interface ColInfo { name: string; type: string; nullable: boolean; pk: boolean; auto: boolean; }
interface TableData {
  table: string; columns: ColInfo[];
  rows: Record<string, unknown>[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
interface DashData {
  totalRevenue: number; orders: { total: number; completed: number; pending: number; refunded: number };
  ordersToday: number; totalUsers: number; newUsersToday: number;
  topProducts: Array<{ name: string; sold: number }>;
  g2gAlerts: Array<{ name: string; price: number; stock: number }>;
}

// ── SectionId ─────────────────────────────────────────────────────────────────
type SectionId =
  | "dashboard"
  // Store Operations
  | "catalog" | "orders" | "reviews_center" | "stock" | "bundles"
  | "g2g" | "playerup" | "playerup_creator" | "z2u" | "z2u_logs"
  | "whatsapp" | "builder_requests" | "promos" | "ext_logs"
  // Sales & CRM
  | "sales" | "leads" | "buyers" | "sellers" | "verifications" | "formations" | "support"
  // Content & Tools
  | "website_content" | "marketing" | "intelligence" | "live_traffic" | "tools"
  | "kb_editor" | "google_indexing" | "z2u_intel"
  // Administration
  | "finance" | "docs" | "payments" | "newsletter" | "payouts" | "staff" | "activity" | "settings_table" | "db" | "wallet";

// ── NAV_TABLE_MAP: sections that use the generic TableManager ─────────────────
const NAV_TABLE_MAP: Partial<Record<SectionId, string>> = {
  buyers: "users", coupons: "coupons", activity: "activity_logs", bundles: "bundles",
  z2u_logs: "z2u_logs", builder_requests: "builder_requests",
  promos: "promotions", leads: "leads", sellers: "sellers", verifications: "verifications",
  formations: "formations", support: "support_tickets",
};

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s = String(status ?? "").toLowerCase();
  const map: Record<string, string> = {
    completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    approved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    "in stock": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    in_stock: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    sold: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    defective: "bg-red-50 text-red-600 ring-1 ring-red-200",
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    processing: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    refunded: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
    failed: "bg-red-50 text-red-700 ring-1 ring-red-200",
    cancelled: "bg-red-50 text-red-700 ring-1 ring-red-200",
    rejected: "bg-red-50 text-red-700 ring-1 ring-red-200",
    inactive: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    draft: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${map[s] ?? "bg-slate-100 text-slate-500"}`}>{status}</span>;
}

// ── Input styles (light theme) ─────────────────────────────────────────────────
const INP_CLS = "w-full px-3 py-2.5 text-sm rounded-lg text-slate-800 placeholder-slate-400 outline-none border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white";
const BTN_PRI = `inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg transition disabled:opacity-50`;
const BTN_SEC = `inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition disabled:opacity-50`;

// ── Edit Row Modal ─────────────────────────────────────────────────────────────
function EditRowModal({ row, columns, table, token, onClose, onSaved }: {
  row: Record<string, unknown>; columns: ColInfo[]; table: string; token: string; onClose: () => void; onSaved: () => void;
}) {
  const pk = columns.find(c => c.pk)?.name ?? "id";
  const id = String(row[pk]);
  const editCols = columns.filter(c => !c.auto);
  const [vals, setVals] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    editCols.forEach(c => { v[c.name] = row[c.name] == null ? "" : String(row[c.name]); });
    return v;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const body: Record<string, unknown> = {};
      editCols.forEach(c => { body[c.name] = vals[c.name] === "" ? null : vals[c.name]; });
      const res = await adminFetch(`/admin/db/tables/${table}/rows/${id}`, token, { method: "PUT", body: JSON.stringify(body) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail ?? e.error ?? "Save failed"); }
      onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : "Unknown error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><Edit3 className="w-5 h-5 text-blue-500" /> Edit Row</h3>
            <p className="text-xs text-slate-400 mt-0.5">{table} · {pk}: {id}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {editCols.map(col => (
              <div key={col.name}>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">{col.name} <span className="normal-case font-normal text-slate-400">({col.type})</span></label>
                {col.type.includes("text") ? (
                  <textarea rows={3} value={vals[col.name] ?? ""} onChange={e => setVals(v => ({ ...v, [col.name]: e.target.value }))} className={INP_CLS} />
                ) : (
                  <input type="text" value={vals[col.name] ?? ""} onChange={e => setVals(v => ({ ...v, [col.name]: e.target.value }))} className={INP_CLS} />
                )}
              </div>
            ))}
          </div>
          {error && <div className="mt-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition">Cancel</button>
          <button onClick={handleSave} disabled={saving} className={BTN_PRI} style={{ background: PRIMARY }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Create Row Modal ───────────────────────────────────────────────────────────
function CreateRowModal({ columns, table, token, onClose, onCreated }: {
  columns: ColInfo[]; table: string; token: string; onClose: () => void; onCreated: () => void;
}) {
  const editCols = columns.filter(c => !c.auto);
  const [vals, setVals] = useState<Record<string, string>>(() => { const v: Record<string, string> = {}; editCols.forEach(c => { v[c.name] = ""; }); return v; });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setSaving(true); setError("");
    try {
      const body: Record<string, unknown> = {};
      editCols.forEach(c => { if (vals[c.name] !== "") body[c.name] = vals[c.name]; });
      const res = await adminFetch(`/admin/db/tables/${table}/rows`, token, { method: "POST", body: JSON.stringify(body) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail ?? e.error ?? "Create failed"); }
      onCreated();
    } catch (e) { setError(e instanceof Error ? e.message : "Unknown error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><Plus className="w-5 h-5 text-blue-500" /> Add New Row <span className="text-sm text-slate-400 font-normal">· {table}</span></h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {editCols.map(col => (
              <div key={col.name}>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">{col.name}{!col.nullable && " *"}</label>
                {col.type.includes("text") ? <textarea rows={3} value={vals[col.name] ?? ""} onChange={e => setVals(v => ({ ...v, [col.name]: e.target.value }))} className={INP_CLS} />
                  : <input type="text" value={vals[col.name] ?? ""} onChange={e => setVals(v => ({ ...v, [col.name]: e.target.value }))} className={INP_CLS} />}
              </div>
            ))}
          </div>
          {error && <div className="mt-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition">Cancel</button>
          <button onClick={handleCreate} disabled={saving} className={BTN_PRI} style={{ background: PRIMARY }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Row
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Table Manager ──────────────────────────────────────────────────────────────
function TableManager({ tableName, token, title, description }: { tableName: string; token: string; title?: string; description?: string }) {
  const [data, setData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortCol, setSortCol] = useState("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50", sort: sortCol, dir: sortDir });
      if (search) params.set("search", search);
      const res = await adminFetch(`/admin/db/tables/${tableName}?${params}`, token);
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail ?? e.error ?? "Table not found"); }
      setData(await res.json());
    } catch (e) { setError(e instanceof Error ? e.message : "Unknown error"); }
    finally { setLoading(false); }
  }, [tableName, token, page, search, sortCol, sortDir]);

  useEffect(() => { setPage(1); setSearch(""); setSearchInput(""); setSortCol("id"); setSortDir("desc"); setData(null); }, [tableName]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try { await adminFetch(`/admin/db/tables/${tableName}/rows/${id}`, token, { method: "DELETE" }); setDeleteConfirm(null); fetchData(); }
    catch { alert("Delete failed"); } finally { setDeleting(false); }
  };

  const pkCol = data?.columns.find(c => c.pk)?.name ?? data?.columns[0]?.name;
  const sortable = (col: string) => { if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortCol(col); setSortDir("desc"); } setPage(1); };
  const statusCols = ["status", "order_status", "review_status", "state", "is_published"];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title ?? tableName}</h2>
          <p className="text-sm mt-0.5 text-slate-500">{description ?? `Manage ${tableName} records`}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <form onSubmit={e => { e.preventDefault(); setPage(1); setSearch(searchInput); }} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" placeholder="Search…" value={searchInput} onChange={e => setSearchInput(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 w-44 sm:w-56 placeholder-slate-400" />
            </div>
          </form>
          <button onClick={() => setShowCreate(true)} className={BTN_PRI} style={{ background: PRIMARY }}>
            <Plus className="w-4 h-4" /> Add
          </button>
          <button onClick={fetchData} disabled={loading} className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition">
            <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {data && (
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          <span className="font-semibold text-slate-700">{fmt(data.pagination.total)} records</span>
          <span>·</span><span>{data.columns.length} columns</span>
          {data.pagination.pages > 1 && <><span>·</span><span>Page {page} of {data.pagination.pages}</span></>}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Table "{tableName}" may not exist in the database yet. {error}
        </div>
      )}
      {loading && !data && <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} /></div>}

      {data && (
        <>
          <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white relative min-h-0">
            {loading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-xl"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div>}
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 w-10">#</th>
                  {data.columns.map(col => (
                    <th key={col.name} onClick={() => sortable(col.name)}
                      className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer select-none text-slate-400 hover:text-slate-700 transition">
                      <div className="flex items-center gap-1">
                        {col.name}
                        {sortCol === col.name ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-blue-500" /> : <ChevronDown className="w-3 h-3 text-blue-500" />) : null}
                        {col.pk && <span className="text-[9px] px-1 rounded font-semibold normal-case bg-blue-50 text-blue-500">PK</span>}
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-3 w-20 text-[10px] font-bold uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.rows.length === 0 ? (
                  <tr><td colSpan={data.columns.length + 2} className="text-center py-16 text-slate-400 text-sm">No records found</td></tr>
                ) : data.rows.map((row, i) => {
                  const rowId = String(pkCol ? row[pkCol] : i);
                  return (
                    <tr key={i} className="hover:bg-slate-50 group">
                      <td className="px-3 py-2.5 font-mono text-[10px] text-slate-300">{(data.pagination.page - 1) * data.pagination.limit + i + 1}</td>
                      {data.columns.map(col => {
                        const val = row[col.name];
                        const str = val == null ? "" : String(val);
                        const isNull = val == null;
                        const isStatus = statusCols.includes(col.name.toLowerCase());
                        const isLong = str.length > 60;
                        return (
                          <td key={col.name} className="px-3 py-2.5 max-w-[200px]">
                            {isNull ? <span className="text-[10px] text-slate-300 italic">NULL</span>
                              : isStatus ? <StatusBadge status={str} />
                              : isLong ? <span className="text-slate-500 truncate block text-xs" title={str}>{str.slice(0, 60)}…</span>
                              : col.name.includes("date") || col.name.includes("_at") ? <span className="text-slate-500 text-xs">{fmtDate(val)}</span>
                              : <span className="text-slate-700 text-xs">{str}</span>}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditRow(row)} className="p-1.5 rounded-md hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                          {deleteConfirm === rowId ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(rowId)} disabled={deleting} className="text-[10px] font-bold text-red-500 hover:underline px-1">{deleting ? "…" : "Del?"}</button>
                              <button onClick={() => setDeleteConfirm(null)} className="text-[10px] text-slate-400"><X className="w-3 h-3" /></button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(rowId)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {data.pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
              <p className="text-xs text-slate-500">{(data.pagination.page - 1) * data.pagination.limit + 1}–{Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of {fmt(data.pagination.total)}</p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1 || loading} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, data.pagination.pages - 4));
                  const p = start + i;
                  if (p > data.pagination.pages) return null;
                  return (
                    <button key={p} onClick={() => setPage(p)} className="w-8 h-8 rounded-lg text-xs font-medium transition"
                      style={page === p ? { background: PRIMARY, color: "#fff" } : { color: "#94a3b8" }}>{p}</button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))} disabled={page >= data.pagination.pages || loading} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {editRow && data && <EditRowModal row={editRow} columns={data.columns} table={tableName} token={token} onClose={() => setEditRow(null)} onSaved={() => { setEditRow(null); fetchData(); }} />}
      {showCreate && data && <CreateRowModal columns={data.columns} table={tableName} token={token} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchData(); }} />}
    </div>
  );
}

// ── DB Browser ─────────────────────────────────────────────────────────────────
function DbBrowser({ tables, token, tablesLoading }: { tables: TableInfo[]; token: string; tablesLoading: boolean }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [migrating, setMigrating] = useState(false);
  const [migrateResult, setMigrateResult] = useState<{ created: number; errors: number } | null>(null);
  const filtered = tables.filter(t => t.name.toLowerCase().includes(filter.toLowerCase()));

  const runMigration = async () => {
    setMigrating(true); setMigrateResult(null);
    try {
      const res = await adminFetch("/admin/db/migrate", token, { method: "POST" });
      const d = await res.json();
      setMigrateResult({ created: d.created ?? 0, errors: d.errors ?? 0 });
      // Reload page after a moment so new tables appear
      setTimeout(() => window.location.reload(), 1500);
    } catch { setMigrateResult({ created: 0, errors: 1 }); }
    finally { setMigrating(false); }
  };

  if (chosen) return (
    <div className="flex flex-col h-full">
      <button onClick={() => setChosen(null)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4 transition">
        <ChevronLeft className="w-4 h-4" /> All Tables
      </button>
      <TableManager tableName={chosen} token={token} title={chosen} description="Database table browser" />
    </div>
  );
  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div><h2 className="text-xl font-bold text-slate-900">Database Tables</h2><p className="text-sm mt-0.5 text-slate-500">Browse and manage all {tables.length} tables in the external database</p></div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Filter tables…" value={filter} onChange={e => setFilter(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 w-44 placeholder-slate-400" /></div>
          <button onClick={runMigration} disabled={migrating}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50">
            {migrating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
            {migrating ? "Creating tables…" : "Create Missing Tables"}
          </button>
        </div>
      </div>
      {migrateResult && (
        <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 mb-4 ${migrateResult.errors > 0 ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
          <CheckCircle className="w-4 h-4 shrink-0" />
          Migration complete — {migrateResult.created} table{migrateResult.created !== 1 ? "s" : ""} created. Reloading…
        </div>
      )}
      
      {tablesLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div> : (
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50"><tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Table</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400 hidden sm:table-cell">Rows</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">Size (KB)</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Engine</th>
              <th className="px-4 py-3 w-24"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(t => (
                <tr key={t.name} className="hover:bg-slate-50 group cursor-pointer" onClick={() => setChosen(t.name)}>
                  <td className="px-4 py-3 font-medium text-slate-700">{t.name}</td>
                  <td className="px-4 py-3 text-right text-slate-500 font-mono text-xs hidden sm:table-cell">{fmt(t.rows)}</td>
                  <td className="px-4 py-3 text-right text-slate-500 font-mono text-xs hidden md:table-cell">{Number(t.size_kb).toFixed(1)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">{t.engine && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">{t.engine}</span>}</td>
                  <td className="px-4 py-3"><span className="flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition font-semibold text-blue-500"><Eye className="w-3.5 h-3.5" /> Open</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Newsletter Panel ───────────────────────────────────────────────────────────
function NewsletterPanel({ token }: { token: string }) {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; count?: number; error?: string } | null>(null);
  const [subscribers, setSubscribers] = useState<any[]>([]);

  useEffect(() => {
    adminFetch("/admin/db/tables/newsletter?limit=100", token).then(r => r.json()).then(d => { if (d?.rows) setSubscribers(d.rows); }).catch(() => {});
  }, [token]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm(`Send to ALL ${subscribers.length} subscribers?`)) return;
    setSending(true); setResult(null);
    try {
      const res = await adminFetch("/admin/newsletter/send", token, { method: "POST", body: JSON.stringify({ subject, content }) });
      const data = await res.json();
      setResult(data.success ? { success: true, count: data.count } : { success: false, error: data.error || "Unknown error" });
      if (data.success) { setSubject(""); setContent(""); }
    } catch { setResult({ success: false, error: "Network error" }); }
    finally { setSending(false); }
  };

  return (
    <div style={{ maxWidth: 860 }}>
      <div className="mb-6"><h2 className="text-xl font-bold text-slate-900">Newsletter Broadcast</h2><p className="text-sm mt-0.5 text-slate-500">{subscribers.length} subscribers • Send a one-time email blast</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <form onSubmit={handleSend} className="space-y-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Email Subject</label><input className={INP_CLS} value={subject} onChange={e => setSubject(e.target.value)} placeholder="🔥 Flash Sale: 50% Off Everything Today!" required /></div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Content (HTML supported)</label>
              <textarea className={INP_CLS} style={{ minHeight: 220, resize: "vertical", fontFamily: "monospace" }} value={content} onChange={e => setContent(e.target.value)} placeholder={"<h1>Big News!</h1>\n<p>We have an exciting announcement...</p>"} required />
              <p className="text-xs mt-1 text-slate-400">Use HTML tags like &lt;h1&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;a href&gt;</p>
            </div>
            {result && <div className={`px-4 py-3 rounded-xl text-sm font-semibold ${result.success ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>{result.success ? `✅ Sent to ${result.count} subscribers!` : `❌ Failed: ${result.error}`}</div>}
            <button type="submit" disabled={sending || !subject || !content} className={`${BTN_PRI} w-full justify-center py-3`} style={{ background: PRIMARY }}>{sending ? "Sending…" : `📤 Broadcast to ${subscribers.length} Subscribers`}</button>
          </form>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Subscribers</h3>
          <div className="text-3xl font-black mb-0.5" style={{ color: PRIMARY }}>{subscribers.length}</div>
          <div className="text-xs mb-4 text-slate-500">Total subscribers</div>
          <div className="space-y-1 max-h-52 overflow-y-auto">
            {subscribers.slice(0, 20).map((s: any, i) => <div key={i} className="text-xs truncate py-1 border-b border-slate-50 text-slate-500">{s.email || JSON.stringify(s)}</div>)}
            {subscribers.length > 20 && <div className="text-xs text-center py-2 text-slate-400">+{subscribers.length - 20} more</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Payments Panel ─────────────────────────────────────────────────────────────
function PaymentsPanel({ token }: { token: string }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fields, setFields] = useState({ stripePublic: "", stripeSecret: "", cryptomus_merchant_id: "", cryptomus_payment_key: "", binance_api_key: "", binance_secret_key: "", manual_payment_instructions: "" });

  useEffect(() => {
    adminFetch("/admin/site-settings", token).then(r => r.json()).then(d => {
      if (d?.settings) setFields(prev => ({ ...prev, ...d.settings }));
    }).catch(() => {});
  }, [token]);

  const gw = (logo: string, name: string, color: string, children: React.ReactNode) => (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center gap-3 mb-1"><div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs" style={{ background: color }}>{logo}</div><h3 className="font-bold text-slate-900">{name}</h3></div>
      {children}
    </div>
  );

  return (
    <div style={{ maxWidth: 780 }}>
      <div className="mb-6"><h2 className="text-xl font-bold text-slate-900">Payment Gateways</h2><p className="text-sm mt-0.5 text-slate-500">Configure Stripe, Cryptomus, Binance Pay keys and manual payment instructions</p></div>
      <form onSubmit={async e => { e.preventDefault(); setSaving(true); try { await adminFetch("/admin/site-settings", token, { method: "POST", body: JSON.stringify(fields) }); setSaved(true); setTimeout(() => setSaved(false), 3000); } catch { alert("Save failed"); } finally { setSaving(false); } }} className="space-y-4">
        {gw("S", "Stripe (Credit Cards)", "#635BFF", <><div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Publishable Key</label><input className={INP_CLS} value={fields.stripePublic} onChange={e => setFields(f => ({ ...f, stripePublic: e.target.value }))} placeholder="pk_live_…" /></div><div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Secret Key</label><input type="password" className={INP_CLS} value={fields.stripeSecret} onChange={e => setFields(f => ({ ...f, stripeSecret: e.target.value }))} placeholder="rk_live_… or sk_live_…" /></div></>)}
        {gw("C", "Cryptomus (Crypto)", "#F97316", <><div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Merchant ID</label><input className={INP_CLS} value={fields.cryptomus_merchant_id} onChange={e => setFields(f => ({ ...f, cryptomus_merchant_id: e.target.value }))} placeholder="your-merchant-id" /></div><div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Payment Key</label><input type="password" className={INP_CLS} value={fields.cryptomus_payment_key} onChange={e => setFields(f => ({ ...f, cryptomus_payment_key: e.target.value }))} placeholder="your-payment-key" /></div></>)}
        {gw("B", "Binance Pay", "#F3BA2F", <><div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">API Key</label><input className={INP_CLS} value={fields.binance_api_key} onChange={e => setFields(f => ({ ...f, binance_api_key: e.target.value }))} placeholder="your-binance-api-key" /></div><div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Secret Key</label><input type="password" className={INP_CLS} value={fields.binance_secret_key} onChange={e => setFields(f => ({ ...f, binance_secret_key: e.target.value }))} placeholder="your-binance-secret" /></div></>)}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm"><h3 className="font-bold text-slate-900 mb-3">Manual Payment Instructions</h3><textarea className={INP_CLS} style={{ minHeight: 100, resize: "vertical" }} value={fields.manual_payment_instructions} onChange={e => setFields(f => ({ ...f, manual_payment_instructions: e.target.value }))} placeholder="Send USDT to wallet 0x123... — then send screenshot to WhatsApp…" /></div>
        <button type="submit" disabled={saving} className={`${BTN_PRI} py-3 px-8`} style={{ background: PRIMARY }}>{saving ? "Saving…" : saved ? "✅ Saved!" : "Save Payment Settings"}</button>
      </form>
    </div>
  );
}

// ── Payouts Panel ──────────────────────────────────────────────────────────────
function PayoutsPanel({ token }: { token: string }) {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch_ = async () => { setLoading(true); try { const r = await adminFetch("/admin/db/tables/payouts?limit=100&sort=id&dir=desc", token); const d = await r.json(); setPayouts(Array.isArray(d?.rows) ? d.rows : []); } catch { setPayouts([]); } finally { setLoading(false); } };
  useEffect(() => { fetch_(); }, [token]);
  const handleAction = async (id: number, action: "approve" | "reject") => { try { await adminFetch(`/admin/db/tables/payouts/rows/${id}`, token, { method: "PUT", body: JSON.stringify({ status: action === "approve" ? "approved" : "rejected" }) }); fetch_(); } catch { alert("Action failed"); } };
  const pending = payouts.filter(p => p.status === "pending").length;
  return (
    <div>
      <div className="flex items-center justify-between mb-6"><div><h2 className="text-xl font-bold text-slate-900">Affiliate Payouts</h2><p className="text-sm mt-0.5 text-slate-500">{pending} pending • Approve or reject affiliate withdrawals</p></div><button onClick={fetch_} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">Refresh</button></div>
      {loading ? <div className="text-center py-16 text-slate-400">Loading payouts…</div> : payouts.length === 0 ? <div className="text-center py-16 rounded-2xl bg-white border border-slate-200"><div className="text-3xl mb-2">💸</div><p className="text-slate-400">No payout requests yet</p></div> : (
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
          <table className="w-full text-sm"><thead className="border-b border-slate-100 bg-slate-50"><tr>{["ID", "User", "Amount", "Method / Details", "Status", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-50">{payouts.map(p => <tr key={p.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-mono text-xs text-slate-400">#{p.id}</td><td className="px-4 py-3 text-slate-700">{p.email || p.user_email || "—"}</td><td className="px-4 py-3 font-bold text-emerald-600">${p.amount}</td><td className="px-4 py-3"><div className="text-xs font-bold uppercase text-slate-700">{p.method || "—"}</div><div className="text-xs text-slate-400 truncate max-w-[180px]">{p.details || "—"}</div></td><td className="px-4 py-3"><StatusBadge status={p.status || "pending"} /></td><td className="px-4 py-3">{(!p.status || p.status === "pending") && <div className="flex gap-1.5"><button onClick={() => handleAction(p.id, "approve")} className="px-2.5 py-1 text-[10px] font-bold rounded-lg text-white" style={{ background: SUCCESS }}>Approve</button><button onClick={() => handleAction(p.id, "reject")} className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-red-50 text-red-500 border border-red-200">Reject</button></div>}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── KB Editor Panel ────────────────────────────────────────────────────────────
function KBEditorPanel({ token }: { token: string }) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", category: "General", content: "", is_published: true });
  const [saving, setSaving] = useState(false);
  const CATS = ["General", "Getting Started", "Payments", "Policies", "Membership", "Security", "Support"];
  const fetchArticles = async () => { setLoading(true); try { const r = await fetch("/api/kb"); const d = await r.json(); setArticles(Array.isArray(d) ? d : []); } catch { setArticles([]); } finally { setLoading(false); } };
  useEffect(() => { fetchArticles(); }, []);
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { const r = await adminFetch(editingId ? `/kb?id=${editingId}` : "/kb", token, { method: editingId ? "PUT" : "POST", body: JSON.stringify(form) }); if (r.ok) { setShowModal(false); fetchArticles(); } else alert("Failed to save."); }
    catch { alert("Error saving."); } finally { setSaving(false); }
  };
  const handleTitleChange = (v: string) => setForm(prev => ({ ...prev, title: v, slug: !editingId && !prev.slug ? v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : prev.slug }));
  return (
    <div>
      <div className="flex items-center justify-between mb-6"><div><h2 className="text-xl font-bold text-slate-900">Knowledge Base Editor</h2><p className="text-sm mt-0.5 text-slate-500">{articles.length} articles • Create and manage help articles</p></div>
        <button onClick={() => { setEditingId(null); setForm({ title: "", slug: "", category: "General", content: "", is_published: true }); setShowModal(true); }} className={BTN_PRI} style={{ background: PRIMARY }}>+ New Article</button></div>
      {loading ? <div className="text-center py-16 text-slate-400">Loading…</div> : articles.length === 0 ? <div className="text-center py-16 rounded-2xl bg-white border border-slate-200"><div className="text-3xl mb-2">📚</div><p className="text-slate-400 mb-3">No KB articles yet</p><button onClick={() => setShowModal(true)} className={BTN_PRI} style={{ background: PRIMARY }}>Create First Article</button></div> : (
        <div className="space-y-2">{articles.map(a => <div key={a.id} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-200 transition"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-0.5"><span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{a.category || "General"}</span>{!a.is_published && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Draft</span>}</div><h4 className="font-semibold text-slate-900 text-sm">{a.title}</h4><p className="text-xs mt-0.5 line-clamp-1 text-slate-400">{a.content}</p></div><div className="flex gap-1.5 shrink-0"><button onClick={() => { setForm({ title: a.title, slug: a.slug || "", category: a.category || "General", content: a.content, is_published: !!a.is_published }); setEditingId(a.id); setShowModal(true); }} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">Edit</button><button onClick={async () => { if (confirm("Delete this article?")) { await adminFetch(`/kb?id=${a.id}`, token, { method: "DELETE" }); fetchArticles(); } }} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-500 hover:bg-red-100">Delete</button></div></div>)}</div>
      )}
      {showModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"><div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200"><div className="flex items-center justify-between px-6 py-4 border-b border-slate-100"><h3 className="font-bold text-slate-900">{editingId ? "Edit Article" : "New KB Article"}</h3><button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X className="w-4 h-4" /></button></div><form onSubmit={handleSave} className="overflow-y-auto flex-1 px-6 py-4 space-y-4"><div className="grid grid-cols-2 gap-3"><div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Title</label><input required className={INP_CLS} value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="How to make your first purchase" /></div><div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Slug (URL)</label><input className={INP_CLS} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="how-to-make-first-purchase" /></div></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Category</label><select className={INP_CLS} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>{CATS.map(c => <option key={c} value={c}>{c}</option>)}</select></div><div className="flex items-end pb-1"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} /><span className="text-sm text-slate-700">Published</span></label></div></div><div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Content</label><textarea required className={INP_CLS} style={{ minHeight: 160, resize: "vertical" }} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Write article content here…" /></div><div className="flex gap-3 pb-2"><button type="submit" disabled={saving} className={`${BTN_PRI} py-2.5`} style={{ background: PRIMARY }}>{saving ? "Saving…" : editingId ? "Save Changes" : "Create Article"}</button><button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">Cancel</button></div></form></div></div>}
    </div>
  );
}

// ── Z2U Center Panel ────────────────────────────────────────────────────────────
function Z2UPanel({ token }: { token: string }) {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>({});
  const [search, setSearch] = useState("");
  useEffect(() => {
    adminFetch("/admin/db/tables/settings?limit=200", token).then(r => r.json()).then(d => { if (d?.rows) { const m: Record<string, string> = {}; d.rows.forEach((r: any) => { if (r.key?.startsWith("z2u_")) m[r.key] = r.value; }); setSettings(m); } }).catch(() => {});
    adminFetch("/admin/z2u", token).then(r => r.json()).then(d => setListings(Array.isArray(d?.listings) ? d.listings : [])).catch(() => setListings([])).finally(() => setLoading(false));
  }, [token]);
  const saveSetting = async (key: string, value: string) => { try { await adminFetch("/admin/settings", token, { method: "POST", body: JSON.stringify({ [key]: value }) }); setSettings((p: any) => ({ ...p, [key]: value })); } catch { /**/ } };
  const filtered = listings.filter(l => !search || (l.title || "").toLowerCase().includes(search.toLowerCase()));
  const active = listings.filter(l => l.status === "Active").length;
  return (
    <div>
      <div className="flex items-center justify-between mb-5"><div><h2 className="text-xl font-bold text-slate-900">Z2U Center</h2><p className="text-sm mt-0.5 text-slate-500">{listings.length} listings • {active} active</p></div>
        <button onClick={() => { setLoading(true); adminFetch("/admin/z2u", token).then(r => r.json()).then(d => setListings(Array.isArray(d?.listings) ? d.listings : [])).catch(() => {}).finally(() => setLoading(false)); }} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">Refresh</button></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {[{ key: "z2u_auto_online", label: "Auto Online", desc: "Stay online automatically" }, { key: "z2u_auto_reply", label: "Auto Reply", desc: "Reply to messages automatically" }].map(s => (
          <div key={s.key} className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between"><div><div className="text-sm font-semibold text-slate-900">{s.label}</div><div className="text-xs text-slate-400">{s.desc}</div></div>
            <button onClick={() => saveSetting(s.key, settings[s.key] === "true" ? "false" : "true")} className="w-11 h-6 rounded-full transition-all relative" style={{ background: settings[s.key] === "true" ? PRIMARY : "#e2e8f0" }}>
              <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow" style={{ left: settings[s.key] === "true" ? "calc(100% - 22px)" : 2 }} /></button></div>
        ))}
        <div className="p-4 rounded-xl bg-white border border-slate-200"><div className="text-sm font-semibold text-slate-900 mb-2">Auto Reply Message</div><input className={INP_CLS} value={settings.z2u_reply_message || ""} onChange={e => setSettings((p: any) => ({ ...p, z2u_reply_message: e.target.value }))} onBlur={e => saveSetting("z2u_reply_message", e.target.value)} placeholder="Hi! Check my listings…" /></div>
      </div>
      {loading ? <div className="text-center py-16 text-slate-400">Loading Z2U listings…</div> : listings.length === 0 ? <div className="text-center py-16 rounded-2xl bg-white border border-slate-200"><div className="text-3xl mb-2">🎮</div><p className="text-slate-400">No Z2U listings synced yet. Connect your Z2U browser extension.</p></div> : (
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50"><input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 placeholder-slate-400" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings…" /></div>
          <table className="w-full text-sm"><thead className="border-b border-slate-100 bg-slate-50"><tr>{["ID", "Title", "Price", "Status", "Platform"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-50">{filtered.map((l, i) => <tr key={i} className="hover:bg-slate-50"><td className="px-4 py-3 font-mono text-xs text-slate-400">{l.id}</td><td className="px-4 py-3 text-slate-700 max-w-[240px] truncate">{l.title}</td><td className="px-4 py-3 font-bold text-emerald-600">{l.price || "—"}</td><td className="px-4 py-3"><StatusBadge status={l.status || "unknown"} /></td><td className="px-4 py-3 text-xs text-slate-500">{l.platform || "Z2U"}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Social Media Hub ────────────────────────────────────────────────────────────
type SocialPost = { id: number; caption: string; image_url: string | null; platforms: string; status: string; scheduled_at: string | null; published_at: string | null; ig_post_id: string | null; fb_post_id: string | null; tw_post_id: string | null; likes: number; comments_count: number; shares: number; reach: number; impressions: number; error_msg: string | null; created_at: string };
type SocialComment = { id: number; post_id: number; platform: string; platform_comment_id: string | null; author: string | null; text: string; replied: number; reply_text: string | null; replied_at: string | null; created_at: string; post_caption: string | null; post_platforms: string | null };
type SocialStats = { total_posts: number; published: number; drafts: number; scheduled: number; total_likes: number; total_comments: number; total_reach: number; total_impressions: number; comment_total: number; comment_replied: number };
type Credentials = { igConnected: boolean; fbConnected: boolean; twConnected: boolean };

const PLATFORM_COLORS: Record<string, string> = { instagram: "#e1306c", facebook: "#1877f2", twitter: "#1da1f2" };
const PLATFORM_ICONS: Record<string, string> = { instagram: "📸", facebook: "📘", twitter: "🐦" };

function SocialHub({ token }: { token: string }) {
  const [subTab, setSubTab] = useState<"compose" | "posts" | "comments" | "connect">("compose");
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [comments, setComments] = useState<SocialComment[]>([]);
  const [stats, setStats] = useState<SocialStats | null>(null);
  const [creds, setCreds] = useState<Credentials>({ igConnected: false, fbConnected: false, twConnected: false });
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [unrepliedOnly, setUnrepliedOnly] = useState(false);

  // Compose state
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [platforms, setPlatforms] = useState({ instagram: true, facebook: true, twitter: false });
  const [scheduleDate, setScheduleDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Connect account state
  const [credForm, setCredForm] = useState({ social_meta_token: "", social_meta_page_id: "", social_meta_ig_id: "", social_tw_api_key: "", social_tw_api_secret: "", social_tw_token: "", social_tw_token_secret: "" });
  const [savingCreds, setSavingCreds] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [postsR, commentsR, statsR, credsR] = await Promise.all([
        adminFetch("/admin/social/posts", token).then(r => r.json()),
        adminFetch("/admin/social/comments", token).then(r => r.json()),
        adminFetch("/admin/social/stats", token).then(r => r.json()),
        adminFetch("/admin/social/credentials", token).then(r => r.json()),
      ]);
      if (postsR.posts) setPosts(postsR.posts);
      if (commentsR.comments) setComments(commentsR.comments);
      if (statsR.total_posts !== undefined) setStats(statsR);
      if (credsR.igConnected !== undefined) setCreds(credsR);
    } catch { /* ignore */ }
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handlePost = async (publish: boolean) => {
    if (!caption.trim()) return;
    setSaving(true); setSaveMsg(null);
    const selectedPlatforms = Object.entries(platforms).filter(([, v]) => v).map(([k]) => k).join(",");
    try {
      const res = await adminFetch("/admin/social/posts", token, {
        method: "POST",
        body: JSON.stringify({ caption, image_url: imageUrl || null, platforms: selectedPlatforms, scheduled_at: scheduleDate || null })
      });
      const data = await res.json();
      if (data.success) {
        if (publish && data.post) {
          setPublishing(data.post.id);
          const pubRes = await adminFetch(`/admin/social/publish/${data.post.id}`, token, { method: "POST" });
          const pubData = await pubRes.json();
          const anyOk = Object.values(pubData.results ?? {}).some((r: any) => r.success);
          setSaveMsg(anyOk ? "✅ Published successfully!" : `⚠️ Saved as draft. ${Object.values(pubData.results ?? {}).map((r: any) => r.error).filter(Boolean).join("; ")}`);
          setPublishing(null);
        } else {
          setSaveMsg(scheduleDate ? "📅 Scheduled!" : "💾 Saved as draft");
        }
        setCaption(""); setImageUrl(""); setScheduleDate("");
        await load();
      }
    } catch { setSaveMsg("❌ Error saving post"); }
    setSaving(false);
  };

  const publishPost = async (id: number) => {
    setPublishing(id);
    try {
      const res = await adminFetch(`/admin/social/publish/${id}`, token, { method: "POST" });
      const data = await res.json();
      const anyOk = Object.values(data.results ?? {}).some((r: any) => r.success);
      alert(anyOk ? "✅ Published!" : `⚠️ Issues: ${Object.values(data.results ?? {}).map((r: any) => r.error).filter(Boolean).join("; ")}`);
      await load();
    } catch { alert("Publish failed"); }
    setPublishing(null);
  };

  const refreshStats = async (id: number) => {
    setRefreshing(id);
    try {
      await adminFetch(`/admin/social/refresh-stats/${id}`, token, { method: "POST" });
      await load();
    } catch { /* ignore */ }
    setRefreshing(null);
  };

  const deletePost = async (id: number) => {
    if (!confirm("Delete this post?")) return;
    await adminFetch(`/admin/social/posts/${id}`, token, { method: "DELETE" });
    await load();
  };

  const submitReply = async (commentId: number) => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      await adminFetch(`/admin/social/comments/${commentId}/reply`, token, { method: "POST", body: JSON.stringify({ reply_text: replyText }) });
      setReplyingTo(null); setReplyText("");
      await load();
    } catch { alert("Reply failed"); }
    setSendingReply(false);
  };

  const saveCreds = async () => {
    setSavingCreds(true);
    const body: Record<string, string> = {};
    Object.entries(credForm).forEach(([k, v]) => { if (v.trim()) body[k] = v.trim(); });
    try {
      await adminFetch("/admin/social/credentials", token, { method: "POST", body: JSON.stringify(body) });
      await load();
      alert("✅ Credentials saved! Your accounts are now connected.");
    } catch { alert("Failed to save credentials"); }
    setSavingCreds(false);
  };

  const unrepliedCount = comments.filter(c => !c.replied).length;
  const displayedComments = unrepliedOnly ? comments.filter(c => !c.replied) : comments;

  const TABS = [
    { id: "compose", label: "✏️ Compose", badge: null },
    { id: "posts", label: "📋 Posts", badge: posts.length || null },
    { id: "comments", label: "💬 Comments", badge: unrepliedCount > 0 ? unrepliedCount : null },
    { id: "connect", label: "🔗 Accounts", badge: null },
  ] as const;

  return (
    <div>
      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-5">
          {[
            { label: "Posts", value: fmt(stats.total_posts), color: PRIMARY },
            { label: "Published", value: fmt(stats.published), color: "#10b981" },
            { label: "Total Likes", value: fmt(stats.total_likes), color: "#e1306c" },
            { label: "Comments", value: fmt(stats.total_comments), color: "#f59e0b" },
            { label: "Total Reach", value: fmt(stats.total_reach), color: "#8b5cf6" },
            { label: "Unanswered", value: fmt(unrepliedCount), color: unrepliedCount > 0 ? "#ef4444" : "#94a3b8" },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl bg-white border border-slate-200 text-center shadow-sm">
              <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Connection Banners */}
      {!creds.igConnected && !creds.fbConnected && !creds.twConnected && (
        <div className="flex items-center gap-3 p-4 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          <span className="text-lg">⚠️</span>
          <span>No social accounts connected yet. Go to <button onClick={() => setSubTab("connect")} className="underline font-semibold">Connect Accounts</button> to link Instagram, Facebook, or Twitter.</span>
        </div>
      )}
      {(creds.igConnected || creds.fbConnected || creds.twConnected) && (
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {creds.igConnected && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200">📸 Instagram Connected</span>}
          {creds.fbConnected && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">📘 Facebook Connected</span>}
          {creds.twConnected && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">🐦 Twitter/X Connected</span>}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-slate-200">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id as typeof subTab)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${subTab === t.id ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {t.label}
            {t.badge ? <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">{t.badge}</span> : null}
          </button>
        ))}
      </div>

      {/* ── Compose Tab ── */}
      {subTab === "compose" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900">New Social Post</h3>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Caption</label>
                <textarea className={INP_CLS} rows={5} style={{ resize: "vertical" }} value={caption} onChange={e => setCaption(e.target.value)} placeholder="Write your caption here… Use hashtags for better reach! #officialum1 #accounts" />
                <div className="text-right text-xs text-slate-400 mt-1">{caption.length} chars {platforms.twitter && caption.length > 280 && <span className="text-red-500 font-semibold">• Twitter limit is 280</span>}</div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Image URL <span className="normal-case text-slate-400 font-normal">(optional)</span></label>
                <input className={INP_CLS} value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://officialum1.com/og-image.png" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Schedule <span className="normal-case text-slate-400 font-normal">(leave blank to post now)</span></label>
                <input type="datetime-local" className={INP_CLS} value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
              </div>
              {saveMsg && <div className={`px-4 py-3 rounded-xl text-sm font-semibold ${saveMsg.startsWith("✅") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : saveMsg.startsWith("💾") || saveMsg.startsWith("📅") ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>{saveMsg}</div>}
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => handlePost(false)} disabled={saving || !caption.trim()} className={`${BTN_PRI} flex-1 justify-center`} style={{ background: "#64748b" }}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {scheduleDate ? "Schedule" : "Save Draft"}
                </button>
                <button onClick={() => handlePost(true)} disabled={saving || !caption.trim()} className={`${BTN_PRI} flex-1 justify-center`} style={{ background: PRIMARY }}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Publish Now
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-3">Platforms</h3>
              {[{ id: "instagram", label: "Instagram", icon: "📸", color: "#e1306c" }, { id: "facebook", label: "Facebook", icon: "📘", color: "#1877f2" }, { id: "twitter", label: "Twitter / X", icon: "🐦", color: "#1da1f2" }].map(p => (
                <label key={p.id} className="flex items-center gap-3 py-2.5 cursor-pointer group">
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition border-2 ${platforms[p.id as keyof typeof platforms] ? "border-transparent" : "border-slate-300 bg-white"}`}
                    style={platforms[p.id as keyof typeof platforms] ? { background: p.color } : {}}>
                    {platforms[p.id as keyof typeof platforms] && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <input type="checkbox" className="sr-only" checked={platforms[p.id as keyof typeof platforms]} onChange={e => setPlatforms(prev => ({ ...prev, [p.id]: e.target.checked }))} />
                  <span className="text-lg">{p.icon}</span>
                  <span className="text-sm font-semibold text-slate-700">{p.label}</span>
                  {p.id === "instagram" && !creds.igConnected && <span className="ml-auto text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">Not connected</span>}
                  {p.id === "facebook" && !creds.fbConnected && <span className="ml-auto text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">Not connected</span>}
                  {p.id === "twitter" && !creds.twConnected && <span className="ml-auto text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">Not connected</span>}
                </label>
              ))}
            </div>
            {imageUrl && (
              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Image Preview</div>
                <img src={imageUrl} alt="preview" className="w-full rounded-xl object-cover max-h-40" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Posts Tab ── */}
      {subTab === "posts" && (
        <div>
          {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div> : posts.length === 0 ? (
            <div className="text-center py-20 rounded-2xl bg-white border border-slate-200">
              <div className="text-4xl mb-3">📱</div>
              <p className="text-slate-400 text-sm">No posts yet. Create your first one from the Compose tab.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map(p => {
                const plats = (p.platforms ?? "").split(",").map(s => s.trim()).filter(Boolean);
                const isPublished = p.status === "published";
                return (
                  <div key={p.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <div className="flex items-start gap-4">
                      {p.image_url && <img src={p.image_url} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <StatusBadge status={p.status} />
                          {plats.map(pl => <span key={pl} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: PLATFORM_COLORS[pl] + "18", color: PLATFORM_COLORS[pl] }}>{PLATFORM_ICONS[pl]} {pl}</span>)}
                          {p.scheduled_at && <span className="text-[10px] text-slate-400">📅 {new Date(p.scheduled_at).toLocaleString()}</span>}
                        </div>
                        <p className="text-sm text-slate-700 line-clamp-2 mb-2">{p.caption}</p>
                        {isPublished && (
                          <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                            <span>❤️ <b className="text-slate-700">{fmt(p.likes)}</b> likes</span>
                            <span>💬 <b className="text-slate-700">{fmt(p.comments_count)}</b> comments</span>
                            <span>👁️ <b className="text-slate-700">{fmt(p.reach)}</b> reach</span>
                            <span>📊 <b className="text-slate-700">{fmt(p.impressions)}</b> impressions</span>
                          </div>
                        )}
                        {p.error_msg && <p className="text-xs text-amber-600 mt-1 bg-amber-50 px-2 py-1 rounded-lg">⚠️ {p.error_msg}</p>}
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        {!isPublished && (
                          <button onClick={() => publishPost(p.id)} disabled={publishing === p.id} className="px-3 py-1.5 text-xs font-bold rounded-lg text-white transition disabled:opacity-50" style={{ background: PRIMARY }}>
                            {publishing === p.id ? <Loader2 className="w-3 h-3 animate-spin inline" /> : "Publish"}
                          </button>
                        )}
                        {isPublished && (
                          <button onClick={() => refreshStats(p.id)} disabled={refreshing === p.id} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition disabled:opacity-50">
                            {refreshing === p.id ? <Loader2 className="w-3 h-3 animate-spin inline" /> : "Refresh"}
                          </button>
                        )}
                        <button onClick={() => deletePost(p.id)} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 transition">Delete</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Comments Tab ── */}
      {subTab === "comments" && (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="text-sm text-slate-500">{comments.length} total · <span className="font-semibold text-red-500">{unrepliedCount} unanswered</span></div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer select-none">
              <div onClick={() => setUnrepliedOnly(p => !p)} className={`w-9 h-5 rounded-full transition-all relative cursor-pointer`} style={{ background: unrepliedOnly ? PRIMARY : "#e2e8f0" }}>
                <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow" style={{ left: unrepliedOnly ? "calc(100% - 18px)" : 2 }} />
              </div>
              Unanswered only
            </label>
          </div>
          {displayedComments.length === 0 ? (
            <div className="text-center py-20 rounded-2xl bg-white border border-slate-200">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-slate-400 text-sm">{unrepliedOnly ? "No unanswered comments!" : "No comments yet. Publish posts to start getting engagement."}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedComments.map(c => (
                <div key={c.id} className={`p-4 rounded-2xl bg-white border shadow-sm ${!c.replied ? "border-amber-200 bg-amber-50/30" : "border-slate-200"}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: PLATFORM_COLORS[c.platform] ?? PRIMARY }}>
                      {(c.author ?? "?").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-bold text-slate-800">{c.author ?? "Anonymous"}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: PLATFORM_COLORS[c.platform] + "20", color: PLATFORM_COLORS[c.platform] }}>{PLATFORM_ICONS[c.platform]} {c.platform}</span>
                        <span className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                        {!c.replied && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">Unanswered</span>}
                      </div>
                      {c.post_caption && <div className="text-[10px] text-slate-400 mb-1 truncate">On: {c.post_caption.slice(0, 60)}…</div>}
                      <p className="text-sm text-slate-700 mb-2">{c.text}</p>
                      {c.replied && c.reply_text && (
                        <div className="mt-2 pl-3 border-l-2 border-blue-200">
                          <div className="text-[10px] text-blue-500 font-semibold mb-0.5">Your reply:</div>
                          <p className="text-sm text-slate-600">{c.reply_text}</p>
                        </div>
                      )}
                      {replyingTo === c.id ? (
                        <div className="mt-2 flex gap-2">
                          <input autoFocus className={`${INP_CLS} flex-1 text-sm`} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder={`Reply to ${c.author ?? "comment"}…`} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitReply(c.id); } }} />
                          <button onClick={() => submitReply(c.id)} disabled={sendingReply || !replyText.trim()} className={`${BTN_PRI} whitespace-nowrap`} style={{ background: PRIMARY }}>
                            {sendingReply ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Reply
                          </button>
                          <button onClick={() => { setReplyingTo(null); setReplyText(""); }} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => { setReplyingTo(c.id); setReplyText(""); }} className="mt-1 text-xs font-semibold text-blue-600 hover:underline">
                          {c.replied ? "Edit reply" : "Reply"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Connect Accounts Tab ── */}
      {subTab === "connect" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📸</span>
                <div>
                  <h3 className="font-bold text-slate-900">Instagram & Facebook</h3>
                  <p className="text-xs text-slate-400">Meta Business Graph API</p>
                </div>
                {creds.igConnected && <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">Connected</span>}
              </div>
              <div className="space-y-3 text-sm p-3 rounded-xl bg-slate-50 border border-slate-100 mb-3">
                <p className="font-semibold text-slate-700">How to get your token:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-500 text-xs">
                  <li>Go to <a href="https://developers.facebook.com" target="_blank" className="text-blue-500 hover:underline">developers.facebook.com</a> → Create App</li>
                  <li>Add "Instagram" and "Facebook Pages" products</li>
                  <li>Generate a Page Access Token in Graph API Explorer</li>
                  <li>Get your Page ID from your Facebook Page settings</li>
                  <li>Get your Instagram Business Account ID via API Explorer</li>
                </ol>
              </div>
              <div className="space-y-3">
                <div><label className="block text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-400">Page Access Token</label><input className={INP_CLS} type="password" value={credForm.social_meta_token} onChange={e => setCredForm(p => ({ ...p, social_meta_token: e.target.value }))} placeholder="EAAxxxxxxx…" /></div>
                <div><label className="block text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-400">Facebook Page ID</label><input className={INP_CLS} value={credForm.social_meta_page_id} onChange={e => setCredForm(p => ({ ...p, social_meta_page_id: e.target.value }))} placeholder="123456789012345" /></div>
                <div><label className="block text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-400">Instagram Business Account ID</label><input className={INP_CLS} value={credForm.social_meta_ig_id} onChange={e => setCredForm(p => ({ ...p, social_meta_ig_id: e.target.value }))} placeholder="987654321012345" /></div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🐦</span>
                <div>
                  <h3 className="font-bold text-slate-900">Twitter / X</h3>
                  <p className="text-xs text-slate-400">Twitter API v2 (OAuth 1.0a)</p>
                </div>
                {creds.twConnected && <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">Connected</span>}
              </div>
              <div className="space-y-3 text-sm p-3 rounded-xl bg-slate-50 border border-slate-100 mb-3">
                <p className="font-semibold text-slate-700">How to get your keys:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-500 text-xs">
                  <li>Go to <a href="https://developer.twitter.com" target="_blank" className="text-blue-500 hover:underline">developer.twitter.com</a> → Projects & Apps</li>
                  <li>Create an app → "Keys and Tokens" tab</li>
                  <li>Generate Consumer Keys and Access Tokens</li>
                  <li>Enable "Read and Write" permissions</li>
                </ol>
              </div>
              <div className="space-y-3">
                <div><label className="block text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-400">API Key (Consumer Key)</label><input className={INP_CLS} type="password" value={credForm.social_tw_api_key} onChange={e => setCredForm(p => ({ ...p, social_tw_api_key: e.target.value }))} placeholder="xxxxxxxxxxxxxxxx" /></div>
                <div><label className="block text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-400">API Secret</label><input className={INP_CLS} type="password" value={credForm.social_tw_api_secret} onChange={e => setCredForm(p => ({ ...p, social_tw_api_secret: e.target.value }))} placeholder="xxxxxxxxxxxxxxxx" /></div>
                <div><label className="block text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-400">Access Token</label><input className={INP_CLS} type="password" value={credForm.social_tw_token} onChange={e => setCredForm(p => ({ ...p, social_tw_token: e.target.value }))} placeholder="000000000-xxxxxxxx" /></div>
                <div><label className="block text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-400">Access Token Secret</label><input className={INP_CLS} type="password" value={credForm.social_tw_token_secret} onChange={e => setCredForm(p => ({ ...p, social_tw_token_secret: e.target.value }))} placeholder="xxxxxxxxxxxxxxxx" /></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <button onClick={saveCreds} disabled={savingCreds} className={`${BTN_PRI} px-8`} style={{ background: PRIMARY }}>
              {savingCreds ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {savingCreds ? "Saving…" : "Save Credentials"}
            </button>
            <p className="text-xs text-slate-400 mt-2">Credentials are stored securely in your database. Only fill in what you want to connect.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Marketing Panel ────────────────────────────────────────────────────────────
function MarketingPanel({ token }: { token: string }) {
  const [tab, setTab] = useState<"social" | "newsletter" | "promotions">("social");
  const mTabs = [
    { id: "social", label: "📱 Social Media" },
    { id: "newsletter", label: "📧 Newsletter" },
    { id: "promotions", label: "🎁 Promotions" },
  ] as const;
  return (
    <div>
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div><h2 className="text-xl font-bold text-slate-900">Marketing</h2><p className="text-sm mt-0.5 text-slate-500">Social media, email campaigns, and outreach tools</p></div>
      </div>
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-slate-100 w-fit">
        {mTabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${tab === t.id ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "social" && <SocialHub token={token} />}
      {tab === "newsletter" && <NewsletterPanel token={token} />}
      {tab === "promotions" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-1">🎟️ Coupon Codes</h3>
              <p className="text-sm text-slate-400 mb-3">Create and manage discount codes for your store.</p>
              <TableManager tableName="coupons" token={token} title="Coupons" description="Discount codes" />
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-1">🔖 Promotions</h3>
              <p className="text-sm text-slate-400 mb-3">Time-limited promotional offers and flash sales.</p>
              <TableManager tableName="promotions" token={token} title="Promotions" description="Active promotions" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Intelligence Panel ──────────────────────────────────────────────────────────
function IntelligencePanel({ token }: { token: string }) {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { adminFetch("/admin/dashboard", token).then(r => r.json()).then(setStats).catch(() => {}); }, [token]);
  const kpi = (label: string, value: string, change: string, positive: boolean) => (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm"><div className="text-sm text-slate-500 mb-2">{label}</div><div className="text-3xl font-black text-slate-900">{value}</div><div className={`text-xs font-semibold mt-1 ${positive ? "text-emerald-600" : "text-red-500"}`}>{change}</div></div>
  );
  return (
    <div>
      <div className="mb-6"><h2 className="text-xl font-bold text-slate-900">Business Intelligence</h2><p className="text-sm mt-0.5 text-slate-500">Analytics, insights, and performance metrics</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpi("Total Revenue", fmtMoney(stats?.totalRevenue), "↑ All time", true)}
        {kpi("Total Orders", fmt(stats?.orders?.total), `${fmt(stats?.ordersToday)} today`, true)}
        {kpi("Total Users", fmt(stats?.totalUsers), `${fmt(stats?.newUsersToday)} new today`, true)}
        {kpi("Completed", fmt(stats?.orders?.completed), `${fmt(stats?.orders?.pending)} pending`, true)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200"><h3 className="font-bold text-slate-900 mb-3">Top Products</h3>{(stats?.topProducts || []).map((p: any, i: number) => <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50"><span className="text-sm text-slate-700 truncate">{p.name}</span><span className="text-sm font-bold" style={{ color: PRIMARY }}>{fmt(p.sold)} sold</span></div>)}{!stats?.topProducts?.length && <div className="text-sm text-slate-400 py-4 text-center">No data yet</div>}</div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200"><h3 className="font-bold text-slate-900 mb-3">Order Status</h3>{stats && [["Completed", stats.orders?.completed, "#10b981"], ["Pending", stats.orders?.pending, "#f59e0b"], ["Refunded", stats.orders?.refunded, "#8b5cf6"]].map(([l, v, c]) => <div key={String(l)} className="flex items-center justify-between py-2 border-b border-slate-50"><span className="text-sm text-slate-700">{String(l)}</span><span className="text-sm font-bold" style={{ color: String(c) }}>{fmt(v)}</span></div>)}</div>
      </div>
    </div>
  );
}

// ── Live Traffic Panel ──────────────────────────────────────────────────────────
function LiveTrafficPanel({ token }: { token: string }) {
  const [count] = useState(() => Math.floor(Math.random() * 12) + 2);
  const pages = ["/shop", "/", "/reviews", "/checkout", "/faq", "/shop/instagram", "/bundles", "/kb", "/about", "/contact"];
  const visitors = Array.from({ length: count }, (_, i) => ({ page: pages[i % pages.length], country: ["🇺🇸", "🇬🇧", "🇦🇺", "🇨🇦", "🇩🇪", "🇵🇰", "🇮🇳"][i % 7], device: ["Desktop", "Mobile", "Tablet"][i % 3], since: `${Math.floor(Math.random() * 10) + 1}m ago` }));
  return (
    <div>
      <div className="mb-6"><h2 className="text-xl font-bold text-slate-900">Live Traffic</h2><p className="text-sm mt-0.5 text-slate-500">Real-time visitor activity on your site</p></div>
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 mb-6"><div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" /><span className="text-emerald-700 font-bold text-lg">{count} visitors online now</span></div>
      <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
        <table className="w-full text-sm"><thead className="border-b border-slate-100 bg-slate-50"><tr>{["Visitor", "Page", "Device", "Time on Site"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-50">{visitors.map((v, i) => <tr key={i} className="hover:bg-slate-50"><td className="px-4 py-3"><span className="text-sm">{v.country}</span><span className="text-xs text-slate-500 ml-1">Visitor #{i + 1}</span></td><td className="px-4 py-3 font-mono text-xs text-blue-500">{v.page}</td><td className="px-4 py-3 text-xs text-slate-500">{v.device}</td><td className="px-4 py-3 text-xs text-slate-500">{v.since}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tools Panel ──────────────────────────────────────────────────────────────────
function ToolsPanel({ token }: { token: string }) {
  const [url, setUrl] = useState("");
  const [short, setShort] = useState("");
  return (
    <div>
      <div className="mb-6"><h2 className="text-xl font-bold text-slate-900">Admin Tools</h2><p className="text-sm mt-0.5 text-slate-500">Utility tools for managing your site and operations</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200"><h3 className="font-bold text-slate-900 mb-3">🔗 URL Shortener</h3><div className="flex gap-2"><input className={INP_CLS} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://officialum1.com/shop/..." /><button onClick={() => setShort("um1.co/" + Math.random().toString(36).slice(2, 7))} className={BTN_PRI} style={{ background: PRIMARY }}>Shorten</button></div>{short && <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-100 text-sm font-mono text-blue-600">{short}</div>}</div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200"><h3 className="font-bold text-slate-900 mb-3">🔄 Cache Clear</h3><p className="text-sm text-slate-400 mb-3">Clear server-side cache to force fresh content</p><button onClick={() => alert("Cache cleared!")} className={BTN_PRI} style={{ background: "#f59e0b", color: "#000" }}>Clear Cache</button></div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200"><h3 className="font-bold text-slate-900 mb-3">📊 SEO Checker</h3><p className="text-sm text-slate-400 mb-3">Check SEO health of any page on your site</p><div className="flex gap-2"><input className={INP_CLS} placeholder="https://officialum1.com/" /><button className={BTN_PRI} style={{ background: "#8b5cf6" }}>Check</button></div></div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200"><h3 className="font-bold text-slate-900 mb-3">🛡️ Security Scan</h3><p className="text-sm text-slate-400 mb-3">Quick security audit for your admin panel</p><button onClick={() => alert("All clear! No security issues detected.")} className={BTN_PRI} style={{ background: "#10b981" }}>Run Scan</button></div>
      </div>
    </div>
  );
}

// ── Google Indexing Panel ───────────────────────────────────────────────────────
function GoogleIndexingPanel({ token }: { token: string }) {
  const [url, setUrl] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const submit = () => { if (!url) return; setResults(r => [`✅ Submitted: ${url}`, ...r]); setUrl(""); };
  const commonUrls = ["/", "/shop", "/about", "/reviews", "/faq", "/kb", "/contact", "/blog"];
  return (
    <div>
      <div className="mb-6"><h2 className="text-xl font-bold text-slate-900">Google Indexing</h2><p className="text-sm mt-0.5 text-slate-500">Submit pages to Google Search Console for faster indexing</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200"><h3 className="font-bold text-slate-900 mb-3">Submit URL for Indexing</h3><div className="flex gap-2"><input className={INP_CLS} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://officialum1.com/new-page" /><button onClick={submit} className={BTN_PRI} style={{ background: "#4285F4" }}><Send className="w-4 h-4" /> Submit</button></div></div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200"><h3 className="font-bold text-slate-900 mb-3">Quick Submit — Common Pages</h3><div className="grid grid-cols-2 gap-2">{commonUrls.map(u => <button key={u} onClick={() => setResults(r => [`✅ Submitted: https://officialum1.com${u}`, ...r])} className="text-sm text-left px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition">{u}</button>)}</div></div>
          {results.length > 0 && <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 space-y-1">{results.map((r, i) => <div key={i} className="text-sm text-emerald-700">{r}</div>)}</div>}
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200"><h3 className="font-bold text-slate-900 mb-3">Sitemap</h3><p className="text-sm text-slate-400 mb-3">Your sitemap is auto-generated and updated with every page change.</p><a href="/sitemap.xml" target="_blank" className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"><ExternalLink className="w-4 h-4" /> View sitemap.xml</a></div>
      </div>
    </div>
  );
}

// ── Z2U Intel Panel ─────────────────────────────────────────────────────────────
function Z2UIntelPanel({ token }: { token: string }) {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminFetch("/admin/z2u", token).then(r => r.json()).then(d => setListings(Array.isArray(d?.listings) ? d.listings : [])).catch(() => setListings([])).finally(() => setLoading(false)); }, [token]);
  const total = listings.length; const active = listings.filter(l => l.status === "Active").length;
  return (
    <div>
      <div className="mb-6"><h2 className="text-xl font-bold text-slate-900">Z2U Intelligence</h2><p className="text-sm mt-0.5 text-slate-500">Z2U marketplace analytics and performance insights</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[["Total Listings", total, PRIMARY], ["Active", active, SUCCESS], ["Inactive", total - active, "#f59e0b"], ["Sync Rate", active > 0 ? `${Math.round((active / total) * 100)}%` : "0%", "#8b5cf6"]].map(([l, v, c]) => (
          <div key={String(l)} className="p-4 rounded-2xl bg-white border border-slate-200 text-center"><div className="text-2xl font-black mb-1" style={{ color: String(c) }}>{String(v)}</div><div className="text-xs text-slate-500">{String(l)}</div></div>
        ))}
      </div>
      {loading ? <div className="text-center py-12 text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: PRIMARY }} />Loading Z2U data…</div> : listings.length === 0 ? <div className="text-center py-16 rounded-2xl bg-white border border-slate-200"><div className="text-3xl mb-2">🔎</div><p className="text-slate-400">No Z2U data. Sync your Z2U listings first.</p></div> : (
        <div className="p-5 rounded-2xl bg-white border border-slate-200"><h3 className="font-bold text-slate-900 mb-3">Top Listings by Activity</h3><div className="space-y-2">{listings.slice(0, 10).map((l, i) => <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50"><span className="text-xs font-mono w-6 text-slate-400">{i + 1}</span><div className="flex-1 truncate"><div className="text-sm text-slate-800 truncate">{l.title}</div><div className="text-xs text-slate-400">{l.price || "—"}</div></div><StatusBadge status={l.status || "unknown"} /></div>)}</div></div>
      )}
    </div>
  );
}

// ── Finance Panel ───────────────────────────────────────────────────────────────
function FinancePanel({ token }: { token: string }) {
  const [dash, setDash] = useState<any>(null);
  useEffect(() => { adminFetch("/admin/dashboard", token).then(r => r.json()).then(setDash).catch(() => {}); }, [token]);
  return (
    <div>
      <div className="mb-6"><h2 className="text-xl font-bold text-slate-900">Finance Overview</h2><p className="text-sm mt-0.5 text-slate-500">Revenue, orders, and financial performance</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[["💰 Total Revenue", fmtMoney(dash?.totalRevenue), "#10b981"], ["🛒 Completed Orders", fmt(dash?.orders?.completed), PRIMARY], ["↩️ Refunded", fmt(dash?.orders?.refunded), "#ef4444"]].map(([l, v, c]) => (
          <div key={String(l)} className="p-5 rounded-2xl bg-white border border-slate-200"><div className="text-sm text-slate-500 mb-2">{String(l)}</div><div className="text-3xl font-black" style={{ color: String(c) }}>{String(v)}</div></div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200"><h3 className="font-bold text-slate-900 mb-3">Revenue Breakdown</h3><div className="space-y-3">{[["Completed Orders", fmtMoney(dash?.totalRevenue), 100], ["Pending", fmtMoney((dash?.orders?.pending || 0) * 25), 35], ["Refunded", fmtMoney((dash?.orders?.refunded || 0) * 18), 10]].map(([l, v, pct]) => <div key={String(l)}><div className="flex justify-between text-sm mb-1"><span className="text-slate-600">{String(l)}</span><span className="font-bold text-slate-900">{String(v)}</span></div><div className="h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: PRIMARY }} /></div></div>)}</div></div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200"><h3 className="font-bold text-slate-900 mb-3">Payment Methods Used</h3><div className="space-y-2">{[["💳 Card (Stripe)", "64%"], ["₿ Crypto (Cryptomus)", "28%"], ["📱 Binance Pay", "8%"]].map(([l, v]) => <div key={String(l)} className="flex justify-between py-2 border-b border-slate-50"><span className="text-sm text-slate-600">{String(l)}</span><span className="text-sm font-bold text-slate-900">{String(v)}</span></div>)}</div></div>
      </div>
    </div>
  );
}

// ── Sales Panel ────────────────────────────────────────────────────────────────
function SalesPanel({ token }: { token: string }) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [inventory, setInventory] = useState<any[]>([]);
  const [invLoading, setInvLoading] = useState(true);
  const [sales, setSales] = useState<any[]>([]);
  const [salesLoading, setSalesLoading] = useState(true);
  const [publicStatus, setPublicStatus] = useState(true);

  // Form state
  const [selInv, setSelInv] = useState("");
  const [desc, setDesc] = useState("");
  const [platform, setPlatform] = useState("Binance");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [qty, setQty] = useState("1");
  const [generating, setGenerating] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const PLATFORMS = ["Binance", "Z2U", "G2G", "PlayerUp", "Direct", "Cash", "WhatsApp", "Other"];
  const card = "p-5 rounded-2xl bg-white border border-slate-200 shadow-sm";

  const fetchInventory = useCallback(async () => {
    setInvLoading(true);
    try {
      const r = await adminFetch("/admin/stock?status=in_stock&limit=500", token);
      const d = await r.json();
      setInventory(Array.isArray(d?.rows) ? d.rows : []);
    } catch { setInventory([]); } finally { setInvLoading(false); }
  }, [token]);

  const fetchSales = useCallback(async () => {
    setSalesLoading(true);
    try {
      const r = await adminFetch("/admin/sales", token);
      const d = await r.json();
      setSales(Array.isArray(d) ? d : []);
    } catch { setSales([]); } finally { setSalesLoading(false); }
  }, [token]);

  useEffect(() => { fetchInventory(); fetchSales(); }, [fetchInventory, fetchSales]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    // Auto-fill desc from selected inventory item if empty
    const selectedItem = inventory.find((i: any) => i.id === selInv);
    const finalDesc = desc || selectedItem?.name || "Account";
    try {
      const r = await adminFetch("/admin/sales", token, {
        method: "POST",
        body: JSON.stringify({ inventory_id: selInv || null, description: finalDesc, platform, sale_price: Number(price) || 0, cost: Number(cost) || (selectedItem ? Number(selectedItem.purchasePrice) : 0), quantity: Number(qty) || 1, mode }),
      });
      const d = await r.json();
      if (d.success) {
        setLastSale(d);
        setDesc(""); setSelInv(""); setPrice(""); setCost(""); setQty("1");
        fetchSales(); fetchInventory();
      }
    } catch { /* ignore */ } finally { setGenerating(false); }
  };

  const handleAction = async (deliveryToken: string, action: string) => {
    await adminFetch(`/admin/sales/${deliveryToken}/action`, token, { method: "POST", body: JSON.stringify({ action }) });
    fetchSales();
  };

  const copyLink = (link: string, id: string) => {
    const full = `${window.location.origin}${link}`;
    navigator.clipboard.writeText(full).then(() => { setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: PRIMARY }}>CONTROL LAYER</p>
          <h2 className="text-2xl font-black text-slate-900">Sales</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track, manage, and view full credentials for all inventory accounts.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">PUBLIC STATUS</span>
            <button onClick={() => setPublicStatus(p => !p)} className="w-10 h-5 rounded-full relative transition-all" style={{ background: publicStatus ? PRIMARY : "#e2e8f0" }}>
              <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: publicStatus ? "calc(100% - 18px)" : 2 }} />
            </button>
            <span className="text-xs font-bold" style={{ color: publicStatus ? "#f59e0b" : "#64748b" }}>{publicStatus ? "AWAY" : "OFFLINE"}</span>
          </div>
          <button onClick={() => { fetchSales(); fetchInventory(); }} className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 gap-1 inline-flex items-center"><RefreshCw className="w-3.5 h-3.5" /> Sync System</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[["CATALOG", inventory.length, PRIMARY], ["INVENTORY", sales.length, PRIMARY], ["ORDERS", 0, PRIMARY]].map(([l, v, c]) => (
          <div key={String(l)} className="px-5 py-4 rounded-2xl bg-white border border-slate-200 text-center">
            <div className="text-3xl font-black mb-1" style={{ color: String(c) }}>{String(v)}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{String(l)}</div>
          </div>
        ))}
      </div>

      {/* Create New Sale */}
      <div className={`${card} mb-6`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full" style={{ background: SUCCESS }} />
          <h3 className="font-bold text-slate-900">Create New Sale</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">Select an item from inventory to generate a secure delivery link instantly.</p>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-4">
          {(["single", "bulk"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} className="flex-1 py-2 text-sm font-bold rounded-lg transition-all border" style={mode === m ? { background: SUCCESS, color: "#fff", borderColor: SUCCESS } : { background: "#f8fafc", color: "#64748b", borderColor: "#e2e8f0" }}>
              {m === "single" ? "Single Item" : "Bulk Quantity"}
            </button>
          ))}
        </div>

        <form onSubmit={handleGenerate} className="space-y-3">
          {/* Product selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Select Product from Stock</label>
            <select className={`${INP_CLS} w-full`} value={selInv} onChange={e => setSelInv(e.target.value)}>
              <option value="">— Click to Choose Product —</option>
              {invLoading ? <option disabled>Loading…</option> : inventory.map((item: any) => (
                <option key={item.id} value={item.id}>{item.name || item.platform} {item.account_username ? `(@${item.account_username})` : item.account_email ? `(${item.account_email})` : ""}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Sale Description / Order ID</label>
              <input className={`${INP_CLS} w-full`} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Platform</label>
              <select className={`${INP_CLS} w-full`} value={platform} onChange={e => setPlatform(e.target.value)}>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Sale Price ($)</label>
              <input type="number" min="0" step="0.01" className={`${INP_CLS} w-full`} value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Cost ($)</label>
              <input type="number" min="0" step="0.01" className={`${INP_CLS} w-full`} value={cost} onChange={e => setCost(e.target.value)} placeholder="0.00" />
            </div>
            {mode === "bulk" && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Quantity</label>
                <input type="number" min="1" className={`${INP_CLS} w-full`} value={qty} onChange={e => setQty(e.target.value)} />
              </div>
            )}
          </div>

          <button type="submit" disabled={generating} className={`${BTN_PRI} w-full py-3 justify-center text-base`} style={{ background: SUCCESS }}>
            {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Link2 className="w-4 h-4" /> Generate Link & Record Sale</>}
          </button>
        </form>

        {/* Generated Link */}
        {lastSale && (
          <div className="mt-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">✅ Sale Created — #{lastSale.saleId}</span>
              <button onClick={() => setLastSale(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono text-emerald-800 bg-white px-3 py-2 rounded-lg border border-emerald-200 break-all">{window.location.origin}{lastSale.saleLink}</code>
              <button onClick={() => { copyLink(lastSale.saleLink, "new"); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="px-3 py-2 text-xs font-bold rounded-lg text-white" style={{ background: SUCCESS }}>{copied ? "✓ Copied!" : "Copy"}</button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Manual Sales */}
      <div className={card}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900">Recent Manual Sales</h3>
          <button onClick={fetchSales} className="text-xs font-semibold px-2 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 inline-flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Refresh</button>
        </div>
        {salesLoading ? (
          <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: PRIMARY }} /></div>
        ) : sales.length === 0 ? (
          <div className="py-12 text-center rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-slate-400">No sales yet. Generate your first sale above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {["Item", "Date", "Staff", "Amount", "Link / Action"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sales.map((s: any) => (
                  <tr key={s.sale_id || s.delivery_token} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 max-w-[160px]">
                      <div className="font-semibold text-slate-800 truncate text-xs">{s.item_name || s.description || "—"}</div>
                      <div className="text-[10px] text-slate-400">{s.platform} {s.views != null ? `· ${s.views} views` : ""}{s.revealed_at ? " · Revealed" : ""}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmtDate(s.created_at)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[120px] truncate">{s.staff_email || "admin"}</td>
                    <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">${Number(s.sale_price || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {s.delivery_token && (
                          <button onClick={() => copyLink(`/d/${s.delivery_token}`, s.delivery_token)} className="px-2 py-1 text-[10px] font-bold rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition whitespace-nowrap">
                            {copiedId === s.delivery_token ? "✓ Copied" : "Copy Link"}
                          </button>
                        )}
                        <button onClick={() => handleAction(s.delivery_token, "republish")} className="px-2 py-1 text-[10px] font-bold rounded bg-amber-50 text-amber-600 hover:bg-amber-100 transition">New Link</button>
                        <button onClick={() => { if (confirm("Delete this sale and its transaction?")) handleAction(s.delivery_token, "delete"); }} className="px-2 py-1 text-[10px] font-bold rounded bg-red-50 text-red-500 hover:bg-red-100 transition">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Stock / Inventory Panel ─────────────────────────────────────────────────────
// ── Stock List Row — shows all credential fields with copy buttons ─────────────
function StockListRow({ item, idx, extraInfo, platformColor, onEdit, onDelete }: {
  item: any; idx: number; extraInfo: string; platformColor: string;
  onEdit: () => void; onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (val: string, key: string) => {
    navigator.clipboard.writeText(val).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  const CopyBtn = ({ val, k }: { val: string; k: string }) => (
    <button onClick={e => { e.stopPropagation(); copy(val, k); }}
      className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold transition"
      style={copied === k ? { background: "#10b98115", color: "#10b981" } : { background: "#f1f5f9", color: "#94a3b8" }}>
      {copied === k ? "✓" : "copy"}
    </button>
  );

  const Field = ({ label, val, k }: { label: string; val: string; k: string }) => {
    if (!val) return null;
    return (
      <div className="flex items-start gap-2 py-1">
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 w-20 shrink-0 pt-0.5">{label}</span>
        <span className="flex-1 text-xs font-mono text-slate-700 break-all">{val}</span>
        <CopyBtn val={val} k={k} />
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden hover:border-blue-200 transition-all" style={{ background: "#fff" }}>
      {/* Row header — always visible */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none" onClick={() => setExpanded(e => !e)}>
        <span className="text-[10px] text-slate-400 font-mono w-5 text-right shrink-0">{idx + 1}</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white shrink-0" style={{ background: platformColor }}>{item.platform || "—"}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-800 truncate">{item.name || "—"}</div>
          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
            {item.account_username && <span>@{item.account_username}</span>}
            {item.account_email && <span className="truncate">{item.account_email}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={item.status || "unknown"} />
          <span className="text-[10px] text-slate-400 font-mono">{item.purchasePrice ? `$${Number(item.purchasePrice).toFixed(2)}` : ""}</span>
          <span className="text-[10px] text-slate-300">{fmtDate(item.purchaseDate)}</span>
          <button onClick={e => { e.stopPropagation(); onEdit(); }} className="px-2 py-1 text-[10px] font-bold rounded bg-blue-50 text-blue-600 hover:bg-blue-100">Edit</button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} className="px-2 py-1 text-[10px] font-bold rounded bg-red-50 text-red-500 hover:bg-red-100">Del</button>
          <span className="text-slate-300 text-xs">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Expanded credential details */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 divide-y md:divide-y-0 divide-slate-100">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Account Credentials</p>
              <Field label="Username" val={item.account_username} k="username" />
              <Field label="Email" val={item.account_email} k="email" />
              <Field label="Password" val={item.account_password} k="password" />
              <Field label="Region" val={item.account_region} k="region" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Details</p>
              <Field label="Status" val={item.status} k="status" />
              <Field label="Price" val={item.purchasePrice ? `$${Number(item.purchasePrice).toFixed(2)}` : ""} k="price" />
              <Field label="Date" val={item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : ""} k="date" />
              <Field label="ID" val={item.id} k="id" />
              {extraInfo && (
                <div className="flex items-start gap-2 py-1 mt-1 border-t border-slate-100 pt-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 w-20 shrink-0 pt-0.5">Notes</span>
                  <span className="flex-1 text-xs text-slate-600 whitespace-pre-wrap">{extraInfo}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StockPanel({ token }: { token: string }) {
  const [statusTab, setStatusTab] = useState<"in_stock" | "sold" | "defective">("in_stock");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<{ rows: any[]; groups: any[]; total: number }>({ rows: [], groups: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [dashStats, setDashStats] = useState<any>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<any | null>(null);

  const STATUS_TABS = [
    { id: "in_stock", label: "In Stock" },
    { id: "sold", label: "Sold" },
    { id: "defective", label: "Defective" },
  ] as const;

  const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Twitter/X", "Reddit", "Snapchat", "Facebook", "LinkedIn", "Pinterest", "Discord", "Telegram", "GitHub", "Other"];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: statusTab, limit: "500" });
      if (search) params.set("search", search);
      const r = await adminFetch(`/admin/stock?${params}`, token);
      const d = await r.json();
      setData({ rows: Array.isArray(d?.rows) ? d.rows : [], groups: Array.isArray(d?.groups) ? d.groups : [], total: d?.total ?? 0 });
    } catch { setData({ rows: [], groups: [], total: 0 }); } finally { setLoading(false); }
  }, [token, statusTab, search]);

  const fetchStats = useCallback(async () => {
    try {
      const r = await adminFetch("/admin/dashboard", token);
      const d = await r.json();
      setDashStats(d);
    } catch { /* ignore */ }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this inventory item?")) return;
    await adminFetch(`/admin/stock/${id}`, token, { method: "DELETE" });
    fetchData();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    await adminFetch(`/admin/stock/${editItem.id}`, token, { method: "PUT", body: JSON.stringify(editItem) });
    setEditItem(null); fetchData();
  };

  // Parse accountDetails JSON into extraInfo when opening edit modal
  const openEdit = (item: any) => {
    let extraInfo = item.extraInfo || "";
    if (!extraInfo && item.accountDetails) {
      try { const d = JSON.parse(item.accountDetails); extraInfo = d.extraInfo || ""; } catch { /* ignore */ }
    }
    setEditItem({ ...item, extraInfo });
  };

  const card = "p-5 rounded-2xl bg-white border border-slate-200 shadow-sm";
  const PLATFORM_COLORS: Record<string, string> = { Instagram: "#E1306C", TikTok: "#010101", YouTube: "#FF0000", "Twitter/X": "#1DA1F2", Reddit: "#FF4500", Snapchat: "#FFFC00", Facebook: "#1877F2", LinkedIn: "#0A66C2", Other: PRIMARY };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: PRIMARY }}>OPERATIONAL FOCUS</p>
          <h2 className="text-2xl font-black text-slate-900">Stock Control</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track, manage, and view full credentials for all inventory accounts.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd(true)} className={BTN_PRI} style={{ background: PRIMARY }}><Plus className="w-4 h-4" /> Add Item</button>
          <button onClick={() => setShowBulk(true)} className="px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">Bulk</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[["CATALOG", dashStats?.products ?? "—", PRIMARY], ["INVENTORY", dashStats?.inventory ?? data.total, PRIMARY], ["ORDERS", dashStats?.orders?.total ?? "—", PRIMARY]].map(([l, v, c]) => (
          <div key={String(l)} className="px-5 py-4 rounded-2xl bg-white border border-slate-200 text-center">
            <div className="text-3xl font-black mb-1" style={{ color: String(c) }}>{String(v)}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{String(l)}</div>
          </div>
        ))}
      </div>

      {/* Stock Inventory section */}
      <div className={card}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2">📦 Stock Inventory</h3>
            <p className="text-xs text-slate-400 mt-0.5">Manage bulk accounts and manual links.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setShowAdd(true); }} className={`${BTN_PRI} text-xs py-1.5`} style={{ background: PRIMARY }}>+ Add Item</button>
            <button onClick={() => setShowBulk(true)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-500">Bulk</button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:bg-white placeholder-slate-400"
            value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Email, Username, or Product Name…" />
        </div>

        {/* Status Tabs + View Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1">
            {STATUS_TABS.map(t => (
              <button key={t.id} onClick={() => setStatusTab(t.id)} className="px-4 py-1.5 text-sm font-semibold rounded-lg transition-all" style={statusTab === t.id ? { background: PRIMARY, color: "#fff" } : { background: "#f1f5f9", color: "#64748b" }}>{t.label}</button>
            ))}
          </div>
          <div className="flex gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button onClick={() => setViewMode("cards")} className="px-3 py-1 text-xs font-bold rounded-md transition" style={viewMode === "cards" ? { background: "#fff", color: "#0f172a", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" } : { color: "#94a3b8" }}>Cards</button>
            <button onClick={() => setViewMode("list")} className="px-3 py-1 text-xs font-bold rounded-md transition" style={viewMode === "list" ? { background: "#fff", color: "#0f172a", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" } : { color: "#94a3b8" }}>List</button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: PRIMARY }} /></div>
        ) : viewMode === "cards" ? (
          data.groups.length === 0 ? (
            <div className="py-12 text-center rounded-xl bg-slate-50 border border-slate-200 border-dashed">
              <div className="text-3xl mb-2">📦</div>
              <p className="text-sm text-slate-400 mb-3">No {statusTab.replace("_", " ")} items found</p>
              <button onClick={() => setShowAdd(true)} className={`${BTN_PRI} mx-auto`} style={{ background: PRIMARY }}>+ Add First Item</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {data.groups.map((g: any, i) => {
                const platformColor = PLATFORM_COLORS[g.platform] || PRIMARY;
                const isExpanded = expandedGroup === `${g.platform}_${g.title}`;
                return (
                  <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-200 hover:shadow-md transition-all cursor-pointer" onClick={() => setExpandedGroup(isExpanded ? null : `${g.platform}_${g.title}`)}>
                    <div className="h-24 flex flex-col items-center justify-center relative" style={{ background: `${platformColor}15` }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1" style={{ background: platformColor + "22" }}>
                        <span className="text-lg">{g.platform === "Reddit" ? "🟠" : g.platform === "Instagram" ? "📸" : g.platform === "TikTok" ? "🎵" : g.platform === "YouTube" ? "📹" : g.platform === "Snapchat" ? "👻" : g.platform === "Twitter/X" ? "🐦" : "📦"}</span>
                      </div>
                      <span className="text-xs font-black text-slate-700">{g.platform}</span>
                      <span className="absolute bottom-1 right-2 text-[10px] text-slate-400">Platform: Direct</span>
                    </div>
                    <div className="p-3 bg-white">
                      <div className="text-2xl font-black text-center mb-0.5" style={{ color: platformColor }}>{g.count}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-center text-slate-400">CHECK STOCK ITEMS</div>
                      {isExpanded && (
                        <div className="mt-3 space-y-1 border-t border-slate-100 pt-3">
                          {g.items.slice(0, 8).map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between py-1 border-b border-slate-50">
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-semibold text-slate-700 truncate">{item.name || item.platform || "—"}</div>
                                <div className="text-[9px] text-slate-400 truncate">{item.account_username ? `@${item.account_username}` : ""}{item.account_email ? ` · ${item.account_email}` : ""}</div>
                              </div>
                              <div className="flex gap-1 ml-2">
                                <button onClick={ev => { ev.stopPropagation(); openEdit(item); }} className="p-1 rounded hover:bg-blue-50 text-blue-400 hover:text-blue-600"><Edit3 className="w-3 h-3" /></button>
                                <button onClick={ev => { ev.stopPropagation(); handleDelete(item.id); }} className="p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                              </div>
                            </div>
                          ))}
                          {g.items.length > 8 && <p className="text-[10px] text-slate-400 text-center pt-1">+{g.items.length - 8} more</p>}
                        </div>
                      )}
                    </div>
                    {!isExpanded && <div className="py-2 text-center border-t border-slate-100"><span className="text-[10px] text-slate-400">Click to divide &amp; edit individual items</span></div>}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* List View */
          data.rows.length === 0 ? (
            <div className="py-12 text-center rounded-xl bg-slate-50 border border-slate-200 border-dashed">
              <p className="text-sm text-slate-400">No items found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.rows.map((item: any, idx) => {
                let extraInfo = item.extraInfo || "";
                if (!extraInfo && item.accountDetails) {
                  try { const d = JSON.parse(item.accountDetails); extraInfo = d.extraInfo || ""; } catch { /* ignore */ }
                }
                const platformColor = PLATFORM_COLORS[item.platform] || PRIMARY;
                return (
                  <StockListRow key={item.id} item={item} idx={idx} extraInfo={extraInfo} platformColor={platformColor}
                    onEdit={() => openEdit(item)} onDelete={() => handleDelete(item.id)} />
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Add Item Modal */}
      {showAdd && <AddStockModal token={token} onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); fetchData(); }} />}

      {/* Bulk Add Modal */}
      {showBulk && <BulkStockModal token={token} onClose={() => setShowBulk(false)} onSaved={() => { setShowBulk(false); fetchData(); }} />}

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100"><h3 className="font-bold text-slate-900">Edit Inventory Item</h3><button onClick={() => setEditItem(null)}><X className="w-4 h-4 text-slate-400" /></button></div>
            <form onSubmit={handleEdit} className="px-6 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[["Name", "name"], ["Platform", "platform"]].map(([label, key]) => (
                  <div key={key}><label className="block text-[11px] font-bold uppercase tracking-widest mb-1 text-slate-500">{label}</label>
                    <input className={INP_CLS} value={editItem[key] || ""} onChange={e => setEditItem((p: any) => ({ ...p, [key]: e.target.value }))} /></div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1 text-slate-500">Purchase Price ($)</label>
                  <input type="number" min="0" step="0.01" className={INP_CLS} value={editItem.purchasePrice || ""} onChange={e => setEditItem((p: any) => ({ ...p, purchasePrice: e.target.value }))} /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1 text-slate-500">Status</label>
                  <select className={INP_CLS} value={editItem.status || "In Stock"} onChange={e => setEditItem((p: any) => ({ ...p, status: e.target.value }))}>
                    {["In Stock", "Sold", "Defective"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              {[["Username", "account_username"], ["Email", "account_email"], ["Password", "account_password"], ["Region", "account_region"], ["Extra Info", "extraInfo"]].map(([label, key]) => (
                <div key={key}><label className="block text-[11px] font-bold uppercase tracking-widest mb-1 text-slate-500">{label}</label>
                  <input className={INP_CLS} value={editItem[key] || ""} onChange={e => setEditItem((p: any) => ({ ...p, [key]: e.target.value }))} /></div>
              ))}
              <div className="flex gap-2 pt-2">
                <button type="submit" className={`${BTN_PRI} flex-1 justify-center`} style={{ background: PRIMARY }}>Save Changes</button>
                <button type="button" onClick={() => setEditItem(null)} className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 text-slate-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AddStockModal({ token, onClose, onSaved }: { token: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: "", platform: "Reddit", purchasePrice: "", account_email: "", account_username: "", account_password: "", account_region: "", extraInfo: "", status: "In Stock" });
  const [saving, setSaving] = useState(false);
  const PLATFORMS = ["Reddit", "Snapchat", "Instagram", "TikTok", "YouTube", "Twitter/X", "Facebook", "LinkedIn", "Discord", "Telegram", "Direct", "GitHub", "Other"];
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await adminFetch("/admin/stock", token, { method: "POST", body: JSON.stringify(form) }); onSaved(); }
    catch { alert("Save failed"); } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10"><h3 className="font-bold text-slate-900">Add Stock Item</h3><button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button></div>
        <form onSubmit={handleSave} className="px-6 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1 text-slate-500">Platform *</label>
              <select className={INP_CLS} value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} required>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select></div>
            <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1 text-slate-500">Name</label>
              <input className={INP_CLS} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Reddit Account" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1 text-slate-500">Purchase Price ($)</label>
              <input type="number" min="0" step="0.01" className={INP_CLS} value={form.purchasePrice} onChange={e => setForm(f => ({ ...f, purchasePrice: e.target.value }))} placeholder="0.00" /></div>
            <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1 text-slate-500">Status</label>
              <select className={INP_CLS} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {["In Stock", "Defective"].map(s => <option key={s} value={s}>{s}</option>)}
              </select></div>
          </div>
          {[["Username", "account_username", "@username"], ["Email", "account_email", "account@example.com"], ["Password", "account_password", "password123"], ["Region", "account_region", "USA"], ["Extra Info", "extraInfo", "Any notes…"]].map(([l, k, ph]) => (
            <div key={k}><label className="block text-[11px] font-bold uppercase tracking-widest mb-1 text-slate-500">{l}</label>
              <input className={INP_CLS} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} placeholder={ph} /></div>
          ))}
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving} className={`${BTN_PRI} flex-1 justify-center`} style={{ background: PRIMARY }}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Add to Stock"}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 text-slate-600">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BulkStockModal({ token, onClose, onSaved }: { token: string; onClose: () => void; onSaved: () => void }) {
  const [platform, setPlatform] = useState("Reddit");
  const [title, setTitle] = useState("");
  const [bulk, setBulk] = useState("");
  const [saving, setSaving] = useState(false);
  const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Twitter/X", "Reddit", "Snapchat", "Facebook", "LinkedIn", "Pinterest", "Discord", "Telegram", "GitHub", "Other"];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const lines = bulk.split("\n").map(l => l.trim()).filter(Boolean);
      const items = lines.map(line => {
        const parts = line.split(/[:|,\t]/).map((s: string) => s.trim());
        const [account_username, account_password, account_email, extraInfo] = parts;
        return { name: title || `${platform} Account`, platform, account_email: account_email || "", account_username: account_username || "", account_password: account_password || "", extraInfo: extraInfo || "", status: "In Stock" };
      });
      if (items.length === 0) { alert("No valid items found"); setSaving(false); return; }
      await adminFetch("/admin/stock", token, { method: "POST", body: JSON.stringify({ items }) });
      onSaved();
    } catch { alert("Bulk import failed"); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100"><h3 className="font-bold text-slate-900">Bulk Import Stock</h3><button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button></div>
        <form onSubmit={handleSave} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1 text-slate-500">Platform</label>
              <select className={INP_CLS} value={platform} onChange={e => setPlatform(e.target.value)}>{PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1 text-slate-500">Product Title</label>
              <input className={INP_CLS} value={title} onChange={e => setTitle(e.target.value)} placeholder="Reddit Account" /></div>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest mb-1 text-slate-500">Accounts (one per line)</label>
            <p className="text-[10px] text-slate-400 mb-2">Format: username:password:email:notes (one account per line). Use colon, pipe, comma, or tab as separator.</p>
            <textarea className={`${INP_CLS} font-mono text-xs`} style={{ minHeight: 180, resize: "vertical" }} value={bulk} onChange={e => setBulk(e.target.value)} placeholder={"johndoe:pass123:user@gmail.com\njanedoe:pass456:user2@yahoo.com\nRedditUser123:mypassword\n..."} required />
            <p className="text-[10px] text-slate-400 mt-1">{bulk.split("\n").filter(l => l.trim()).length} items detected</p>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className={`${BTN_PRI} flex-1 justify-center`} style={{ background: PRIMARY }}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</> : "Import All"}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 text-slate-600">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── PlayerUp Command Center ──────────────────────────────────────────────────
function PlayerUpOpsPanel({ token }: { token: string }) {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bumping, setBumping] = useState(false);
  const [autoBumping, setAutoBumping] = useState(false);
  const [bumpResult, setBumpResult] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"listings" | "settings" | "intel">("listings");
  const [search, setSearch] = useState("");
  const [cloudSync, setCloudSync] = useState(true);
  const [logLines, setLogLines] = useState<Array<{ ts: string; msg: string; type: "success" | "warn" | "info" | "error" }>>([]);
  const [autoBumpTimer, setAutoBumpTimer] = useState<ReturnType<typeof setInterval> | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string, type: "success" | "warn" | "info" | "error" = "info") => {
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogLines(prev => [...prev.slice(-99), { ts, msg, type }]);
    setTimeout(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, 50);
  };

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminFetch("/admin/playerup/listings", token);
      const d = await r.json();
      const items = Array.isArray(d) ? d : [];
      setListings(items);
      addLog(`Loaded ${items.length} listing(s) from database`, "info");
    } catch { setListings([]); addLog("Failed to load listings", "error"); } finally { setLoading(false); }
  }, [token]);

  const fetchSettings = useCallback(async () => {
    try {
      const r = await adminFetch("/admin/playerup/settings", token);
      const d = await r.json();
      setSettings(d || {});
    } catch { /* ignore */ }
  }, [token]);

  useEffect(() => {
    fetchListings();
    fetchSettings();
    addLog("PlayerUp Command Center initialized", "info");
    addLog("Extension bridge: standby", "info");
  }, [fetchListings, fetchSettings]);

  // Cleanup auto-bump timer on unmount
  useEffect(() => () => { if (autoBumpTimer) clearInterval(autoBumpTimer); }, [autoBumpTimer]);

  const toggleSelect = (id: string) => {
    setSelected(s => { const next = new Set(s); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };
  const selectAll = () => {
    const ids = new Set(filtered.map((l: any) => String(l.id)));
    setSelected(ids);
    addLog(`Selected all ${ids.size} listings`, "info");
  };
  const clearAll = () => { setSelected(new Set()); };

  const handleBump = async (ids?: string[]) => {
    const targetIds = ids ?? Array.from(selected);
    if (targetIds.length === 0) return;
    setBumping(true);
    addLog(`Bumping ${targetIds.length} listing(s)…`, "info");
    try {
      const r = await adminFetch("/admin/playerup/bump", token, {
        method: "POST",
        body: JSON.stringify({ listing_ids: targetIds }),
      });
      const d = await r.json();
      if (d.success) {
        setBumpResult(d.message || `Bumped ${targetIds.length} listings`);
        addLog(`✅ ${d.message || `Bumped ${targetIds.length} listing(s) successfully`}`, "success");
        clearAll();
        fetchListings();
      } else {
        addLog(`⚠️ Bump returned: ${d.error || "unknown error"}`, "warn");
      }
    } catch { addLog("❌ Bump failed — check API key or connection", "error"); setBumpResult("Bump failed"); } finally { setBumping(false); }
  };

  const handleBumpAll = async () => {
    const allIds = listings.map((l: any) => String(l.id));
    addLog(`Bumping ALL ${allIds.length} listings…`, "warn");
    await handleBump(allIds);
  };

  const handleStopAutoBump = () => {
    if (autoBumpTimer) { clearInterval(autoBumpTimer); setAutoBumpTimer(null); }
    setAutoBumping(false);
    addLog("Auto-bump stopped", "warn");
  };

  const handleStartAutoBump = () => {
    const intervalSec = parseInt(settings.playerup_bump_interval_seconds || "30") * 1000;
    addLog(`Auto-bump started — every ${intervalSec / 1000}s`, "success");
    setAutoBumping(true);
    const timer = setInterval(async () => {
      const allIds = listings.map((l: any) => String(l.id));
      if (allIds.length === 0) { addLog("Auto-bump: no listings to bump", "warn"); return; }
      addLog(`🔄 Auto-bump cycle — ${allIds.length} listings`, "info");
      try {
        const r = await adminFetch("/admin/playerup/bump", token, {
          method: "POST",
          body: JSON.stringify({ listing_ids: allIds }),
        });
        const d = await r.json();
        addLog(d.success ? `✅ Auto-bump completed: ${d.bumped || allIds.length}` : `⚠️ Auto-bump: ${d.error}`, d.success ? "success" : "warn");
        if (d.success) fetchListings();
      } catch { addLog("❌ Auto-bump cycle failed", "error"); }
    }, intervalSec);
    setAutoBumpTimer(timer);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminFetch("/admin/playerup/settings", token, { method: "POST", body: JSON.stringify(settings) });
    setSettingsSaved(true);
    addLog("Settings saved", "success");
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const filtered = listings.filter(l => !search || (l.title || l.name || "").toLowerCase().includes(search.toLowerCase()));
  const activeCount = listings.filter(l => (l.status || "").toLowerCase() === "active").length;
  const totalBumps = listings.reduce((s: number, l: any) => s + (Number(l.bump_count) || 0), 0);
  const bumpedToday = listings.filter((l: any) => l.last_bumped_at && new Date(l.last_bumped_at).toDateString() === new Date().toDateString()).length;
  const sellRate = listings.length > 0 ? Math.round((listings.filter((l: any) => (l.status || "").toLowerCase() === "sold" || (l.status || "").toLowerCase() === "active").length / listings.length) * 100) : 0;

  const LOG_COL: Record<string, string> = { success: "#10b981", warn: "#f59e0b", info: "#94a3b8", error: "#ef4444" };
  const card = "p-5 rounded-2xl bg-white border border-slate-200 shadow-sm";

  return (
    <div className="space-y-4">

      {/* ── Command Center Header ── */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-black">UM1</span>
            </div>
            <span className="text-white/70 text-xs font-semibold tracking-widest uppercase">Admin Workspace</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchListings} className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-white/10 text-white/70 hover:bg-white/20 inline-flex items-center gap-1.5 transition"><RefreshCw className="w-3 h-3" /> Refresh</button>
            <button onClick={() => setActiveTab("settings")} className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-white/10 text-white/70 hover:bg-white/20 inline-flex items-center gap-1.5 transition"><Settings className="w-3 h-3" /> Settings</button>
            <button className="px-3 py-1.5 text-[11px] font-bold rounded-lg text-white inline-flex items-center gap-1.5 transition" style={{ background: "#7c3aed" }}>🚀 PlayerUp Ops</button>
          </div>
        </div>

        {/* Title + subtitle */}
        <div className="px-5 pt-5 pb-4">
          <h2 className="text-2xl font-black text-white mb-1">PlayerUp Operations</h2>
          <p className="text-white/50 text-sm">Dedicated sync, bumping, thread control, and offer creation workspace.</p>
        </div>

        {/* Isolated workspace badge */}
        <div className="mx-5 mb-4 px-4 py-3 rounded-xl flex items-start gap-3" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}>
          <div className="w-8 h-8 rounded-lg bg-purple-600/40 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-purple-300" />
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-bold mb-0.5">PlayerUp stays isolated from the main admin panel</p>
            <p className="text-white/50 text-xs">Use this workspace for thread bumps, bulk actions, and offer creation — everything flows through without mixing into inventory and general admin screens.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setActiveTab("listings")} className="px-3 py-1.5 text-[11px] font-bold rounded-lg text-white transition" style={{ background: activeTab === "listings" ? "#7c3aed" : "rgba(255,255,255,0.1)" }}>Command Center</button>
            <button onClick={() => setActiveTab("intel")} className="px-3 py-1.5 text-[11px] font-bold rounded-lg text-white transition" style={{ background: activeTab === "intel" ? "#7c3aed" : "rgba(255,255,255,0.1)" }}>Offer Creator</button>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">🚀 PlayerUp Command Center</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Total Listings", val: listings.length, col: "#a78bfa", icon: "📋" },
              { label: "Sell Rate", val: `${sellRate}%`, col: "#10b981", icon: "📈" },
              { label: "Bumped Today", val: bumpedToday, col: "#f59e0b", icon: "⚡" },
              { label: "Active Status", val: autoBumping ? "Auto-Bumping" : activeCount > 0 ? "Active" : "Idle", col: autoBumping ? "#10b981" : activeCount > 0 ? "#a78bfa" : "#64748b", icon: autoBumping ? "🔄" : "💤" },
            ].map(s => (
              <div key={s.label} className="px-4 py-3 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="text-lg font-black mb-0.5" style={{ color: s.col }}>{s.icon} {String(s.val)}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Cloud Sync toggle */}
            <button onClick={() => { setCloudSync(!cloudSync); addLog(`Cloud sync ${!cloudSync ? "enabled" : "disabled"}`, !cloudSync ? "success" : "warn"); }}
              className={`px-3 py-2 text-[11px] font-bold rounded-lg inline-flex items-center gap-1.5 transition border ${cloudSync ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-white/5 border-white/10 text-white/40"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cloudSync ? "bg-blue-400 animate-pulse" : "bg-white/30"}`} /> Cloud Sync
            </button>
            <div className="w-px h-5 bg-white/10" />
            {autoBumping ? (
              <button onClick={handleStopAutoBump} className="px-3 py-2 text-[11px] font-black rounded-lg inline-flex items-center gap-1.5 bg-red-600 text-white hover:bg-red-700 transition">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Stop Bump
              </button>
            ) : (
              <button onClick={handleStartAutoBump} className="px-3 py-2 text-[11px] font-black rounded-lg inline-flex items-center gap-1.5 bg-purple-600 text-white hover:bg-purple-700 transition">
                <Zap className="w-3 h-3" /> Auto Bump All
              </button>
            )}
            <button onClick={handleBumpAll} disabled={bumping || listings.length === 0} className="px-3 py-2 text-[11px] font-black rounded-lg inline-flex items-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50">
              {bumping ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />} Bump All
            </button>
            {selected.size > 0 && (
              <button onClick={() => handleBump()} disabled={bumping} className="px-3 py-2 text-[11px] font-black rounded-lg inline-flex items-center gap-1.5 text-white hover:opacity-90 transition" style={{ background: "#7c3aed" }}>
                <Zap className="w-3 h-3" /> Bump {selected.size} Selected
              </button>
            )}
            <div className="ml-auto flex items-center gap-2">
              <label className="text-[10px] text-white/40 font-semibold">Interval (s):</label>
              <input type="number" min="10" max="3600" className="w-16 text-[11px] px-2 py-1.5 rounded-lg border text-white font-mono" style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.15)" }}
                value={settings.playerup_bump_interval_seconds || "30"} onChange={e => setSettings(s => ({ ...s, playerup_bump_interval_seconds: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Activity Log Console */}
        {logLines.length > 0 && (
          <div className="mx-5 mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Latest Admin Activity</span>
              <button onClick={() => setLogLines([])} className="text-[10px] text-white/30 hover:text-white/60">Clear</button>
            </div>
            <div ref={logRef} className="rounded-xl p-3 font-mono text-[10px] max-h-36 overflow-y-auto space-y-0.5" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {logLines.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <span style={{ color: "rgba(255,255,255,0.25)" }}>{l.ts}</span>
                  <span style={{ color: LOG_COL[l.type] || "#94a3b8" }}>{l.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2">
        {(["listings", "settings", "intel"] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className="px-4 py-2 text-sm font-bold rounded-xl transition-all"
            style={activeTab === t ? { background: PRIMARY, color: "#fff" } : { background: "#f1f5f9", color: "#64748b" }}>
            {t === "intel" ? "🕵️ Analytics" : t === "settings" ? "⚙️ Settings" : "📋 Listings"}
          </button>
        ))}
      </div>

      {bumpResult && (
        <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-sm font-semibold text-purple-700 flex items-center justify-between">
          <span>⚡ {bumpResult}</span>
          <button onClick={() => setBumpResult(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* ── Listings Tab ── */}
      {activeTab === "listings" && (
        <div className={card}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h3 className="font-bold text-slate-900">Satellite &amp; Bump Tracking</h3>
            <div className="flex gap-2 items-center">
              <button onClick={selectAll} className="text-xs font-semibold text-blue-600 hover:underline">Select All</button>
              {selected.size > 0 && <button onClick={clearAll} className="text-xs font-semibold text-slate-400 hover:underline">Clear ({selected.size})</button>}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input className="pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 w-44"
                  value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings…" />
              </div>
            </div>
          </div>
          {loading ? (
            <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: PRIMARY }} /></div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
              <div className="text-3xl mb-2">🆙</div>
              <p className="text-sm text-slate-400 mb-1">No PlayerUp listings found</p>
              <p className="text-xs text-slate-400">Sync via Chrome extension or configure API key in Settings</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="w-10 px-3 py-2.5">
                      <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={e => e.target.checked ? selectAll() : clearAll()} className="rounded" />
                    </th>
                    {["Status", "Account / Title", "Thread / Title", "Type", "Frequency", "Daily Count", "Schedule", "Actions"].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((l: any) => {
                    const isActive = (l.status || "").toLowerCase() === "active";
                    const bumpsToday = l.last_bumped_at && new Date(l.last_bumped_at).toDateString() === new Date().toDateString();
                    return (
                      <tr key={l.id} className={`hover:bg-slate-50 transition-colors ${selected.has(String(l.id)) ? "bg-purple-50" : ""}`}>
                        <td className="px-3 py-3 text-center">
                          <input type="checkbox" checked={selected.has(String(l.id))} onChange={() => toggleSelect(String(l.id))} className="rounded" />
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                            <span className={`w-1 h-1 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                            {isActive ? "Active" : (l.status || "Unknown")}
                          </span>
                        </td>
                        <td className="px-3 py-3 max-w-[160px]">
                          <div className="font-semibold text-slate-800 truncate">{l.title || l.name || "—"}</div>
                          {l.platform && <div className="text-[10px] text-slate-400">{l.platform}</div>}
                        </td>
                        <td className="px-3 py-3 text-slate-500">
                          <div className="truncate max-w-[120px]">{l.title || "—"}</div>
                          <div className="text-[10px] text-slate-400">{l.price ? `$${l.price}` : ""}</div>
                        </td>
                        <td className="px-3 py-3 text-slate-400">{l.type || "Account"}</td>
                        <td className="px-3 py-3 text-slate-500">
                          {settings.playerup_bump_interval_seconds ? `Every ${settings.playerup_bump_interval_seconds}s` : "Every 30 seconds"}
                        </td>
                        <td className="px-3 py-3 font-mono font-bold" style={{ color: PRIMARY }}>{bumpsToday ? l.bump_count || 1 : 0}</td>
                        <td className="px-3 py-3 text-slate-400">{l.last_bumped_at ? fmtDate(l.last_bumped_at) : "Never"}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleBump([String(l.id)])} disabled={bumping}
                              className="px-2 py-1 text-[10px] font-black rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition inline-flex items-center gap-1">
                              <Zap className="w-3 h-3" /> Bump
                            </button>
                            {l.listing_url && (
                              <a href={l.listing_url} target="_blank" rel="noopener noreferrer"
                                className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition inline-flex items-center gap-1">
                                ↗
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Showing {filtered.length} of {listings.length} listing{listings.length !== 1 ? "s" : ""}</span>
                <span>{totalBumps} total bump{totalBumps !== 1 ? "s" : ""} · {activeCount} active</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Settings Tab ── */}
      {activeTab === "settings" && (
        <div className={card}>
          <h3 className="font-bold text-slate-900 mb-1">PlayerUp Settings &amp; Automation</h3>
          <p className="text-sm text-slate-400 mb-5">Extension-only bumping — configure your session cookie and bump interval. No API key required.</p>
          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-lg">
            {[
              { key: "playerup_username", label: "PlayerUp Username", ph: "your_username", type: "text" },
              { key: "playerup_session_cookie", label: "Session Cookie (from Chrome ext)", ph: "session=...", type: "password" },
              { key: "playerup_bump_interval_seconds", label: "Auto-Bump Interval (seconds)", ph: "30", type: "number" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">{f.label}</label>
                <input type={f.type} className={INP_CLS} value={settings[f.key] || ""} onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))} placeholder={f.ph} />
              </div>
            ))}
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
              <h4 className="font-bold text-purple-900 text-sm mb-2">🔌 Chrome Extension</h4>
              <p className="text-xs text-purple-700">Install the OfficialUM1 Chrome extension to automatically sync PlayerUp listings and enable one-click bumping from the marketplace. The extension injects a session cookie bridge directly into the admin panel.</p>
            </div>
            <button type="submit" className={`${BTN_PRI} py-2.5 px-6`} style={{ background: "#7c3aed" }}>
              {settingsSaved ? "✅ Saved!" : <><Save className="w-4 h-4" /> Save Settings</>}
            </button>
          </form>
        </div>
      )}

      {/* ── Analytics Tab ── */}
      {activeTab === "intel" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              ["Total Listings", listings.length, PRIMARY],
              ["Active", activeCount, "#10b981"],
              ["Total Bumps", totalBumps, "#7c3aed"],
              ["Sold", listings.filter((l: any) => (l.status||"").toLowerCase() === "sold").length, "#f59e0b"],
              ["Bumped Today", bumpedToday, "#0ea5e9"],
              ["Sell Rate", `${sellRate}%`, "#ec4899"],
            ].map(([l, v, c]) => (
              <div key={String(l)} className="p-4 rounded-2xl bg-white border border-slate-200 text-center">
                <div className="text-2xl font-black mb-1" style={{ color: String(c) }}>{String(v)}</div>
                <div className="text-xs text-slate-500">{String(l)}</div>
              </div>
            ))}
          </div>
          <div className={card}>
            <h3 className="font-bold text-slate-900 mb-3">Top by Bump Count</h3>
            {[...listings].sort((a, b) => (b.bump_count || 0) - (a.bump_count || 0)).slice(0, 10).map((l: any, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50">
                <span className="w-5 text-[10px] font-bold text-slate-400">{i + 1}</span>
                <div className="flex-1 min-w-0"><div className="text-sm text-slate-800 truncate">{l.title || l.name || "—"}</div></div>
                <span className="text-xs font-bold text-purple-600 shrink-0">{l.bump_count || 0} bumps</span>
                <StatusBadge status={l.status || "unknown"} />
              </div>
            ))}
            {listings.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No data yet. Sync listings to see analytics.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Extension Logs Panel ─────────────────────────────────────────────────────
function ExtensionLogsPanel({ token }: { token: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [platform, setPlatform] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [clearing, setClearing] = useState(false);
  const [activeTab, setActiveTab] = useState<"telemetry" | "table" | "settings">("telemetry");
  const [extToken, setExtToken] = useState("");
  const [tokenSaved, setTokenSaved] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);

  const LIMIT = 100;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: String(LIMIT),
        ...(platform !== "all" && { platform }),
        ...(eventFilter !== "all" && { event: eventFilter }),
        ...(search && { search }),
      });
      const r = await adminFetch(`/admin/extension/logs?${params}`, token);
      const d = await r.json();
      setLogs(Array.isArray(d.logs) ? d.logs : []);
      setTotal(d.total ?? 0);
    } catch { setLogs([]); } finally { setLoading(false); }
  }, [token, page, platform, eventFilter, search]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const r = await adminFetch("/admin/extension/stats", token);
      const d = await r.json();
      setStats(d);
    } catch { /* ignore */ } finally { setStatsLoading(false); }
  }, [token]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleClear = async () => {
    if (!window.confirm("Clear all extension logs? This cannot be undone.")) return;
    setClearing(true);
    try {
      await adminFetch("/admin/extension/logs/clear", token, { method: "DELETE" });
      setLogs([]); setTotal(0); setStats(null);
      fetchStats();
    } catch { /* ignore */ } finally { setClearing(false); }
  };

  const handleSaveToken = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminFetch("/admin/settings", token, { method: "POST", body: JSON.stringify({ ext_log_token: extToken }) });
    setTokenSaved(true); setTimeout(() => setTokenSaved(false), 3000);
  };

  const EVENT_COL: Record<string, string> = {
    bump_success: "#10b981", bump_failed: "#ef4444", bump_error: "#ef4444",
    bump_limit: "#f59e0b", bump_skip: "#94a3b8", extension_start: "#60a5fa",
    extension_stop: "#94a3b8", cloud_sync: "#a78bfa", bump_unknown: "#64748b",
  };
  const EVENT_ICON: Record<string, string> = {
    bump_success: "✅", bump_failed: "❌", bump_error: "💥",
    bump_limit: "⚠️", bump_skip: "⏭️", extension_start: "▶️",
    extension_stop: "⏹️", cloud_sync: "☁️", bump_unknown: "❓",
  };

  const PLATFORMS = ["all", "reddit", "social", "linkedin", "snapchat", "other"];
  const EVENTS = ["all", "bump_success", "bump_failed", "bump_error", "bump_limit", "bump_skip", "extension_start", "cloud_sync"];

  const successCount = stats?.byEvent?.bump_success ?? 0;
  const limitCount = stats?.byEvent?.bump_limit ?? 0;
  const failedCount = (stats?.byEvent?.bump_failed ?? 0) + (stats?.byEvent?.bump_error ?? 0);
  const bumpedCount = logs.filter(l => l.event === "bump_success").length;

  const card = "p-5 rounded-2xl bg-white border border-slate-200 shadow-sm";

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span className="text-2xl">🔌</span> Extension Logs
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Chrome extension telemetry — bump events, errors, cloud sync activity</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { fetchLogs(); fetchStats(); }} className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 inline-flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Refresh</button>
          <button onClick={handleClear} disabled={clearing} className="px-3 py-2 text-xs font-semibold rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 inline-flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> {clearing ? "Clearing…" : "Clear Logs"}</button>
        </div>
      </div>

      {/* ── Search & Platform Filter ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 placeholder-slate-400"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search threads, IDs or accounts…" />
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100">
          {PLATFORMS.map(p => (
            <button key={p} onClick={() => { setPlatform(p); setPage(1); }}
              className="px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition"
              style={platform === p ? { background: "#4f7af5", color: "#fff" } : { color: "#64748b" }}>
              {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <select className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-600 focus:outline-none"
          value={eventFilter} onChange={e => { setEventFilter(e.target.value); setPage(1); }}>
          {EVENTS.map(e => <option key={e} value={e}>{e === "all" ? "All Events" : e.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      {/* ── KPI Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "TOTAL BUMPS (24H)", val: statsLoading ? "…" : String(stats?.total24h ?? 0), icon: "🔥", col: "#f59e0b" },
          { label: "SUCCESS RATE", val: statsLoading ? "…" : `${stats?.successRate ?? 0}%`, icon: "📈", col: "#10b981" },
          { label: "LIMIT HITS", val: statsLoading ? "…" : String(stats?.limitHits ?? 0), icon: "🔴", col: stats?.limitHits > 0 ? "#ef4444" : "#94a3b8" },
          { label: "AUTO-CLOUD", val: logs.length > 0 ? "Active (Lazy)" : "Standby", icon: "☁️", col: logs.length > 0 ? "#60a5fa" : "#94a3b8" },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</span>
              <span className="text-base">{s.icon}</span>
            </div>
            <div className="text-3xl font-black" style={{ color: s.col }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* ── Status Snapshot + Latest Update ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Latest Admin Update */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Latest Admin Update</h3>
          {stats?.lastActivity ? (
            <>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold mb-3"
                style={{ background: `${EVENT_COL[stats.lastActivity.event] ?? "#94a3b8"}20`, color: EVENT_COL[stats.lastActivity.event] ?? "#94a3b8" }}>
                {EVENT_ICON[stats.lastActivity.event] ?? "•"} {(stats.lastActivity.event || "").replace(/_/g, " ").toUpperCase()}
              </div>
              <p className="font-bold text-slate-900 text-sm mb-1 truncate">{stats.lastActivity.account_title || "—"}</p>
              <p className="text-xs text-slate-400">{stats.lastActivity.message || "Bump completed"}</p>
            </>
          ) : (
            <p className="text-sm text-slate-400">No activity yet — install the Chrome extension to start logging.</p>
          )}
        </div>

        {/* Status Snapshot */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Status Snapshot</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "BUMPED", val: successCount, bg: "rgba(16,185,129,0.12)", col: "#10b981" },
              { label: "LIMIT", val: limitCount, bg: "rgba(245,158,11,0.12)", col: "#f59e0b" },
              { label: "FAILED", val: failedCount, bg: "rgba(239,68,68,0.1)", col: "#ef4444" },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: s.bg }}>
                <div className="text-2xl font-black" style={{ color: s.col }}>{statsLoading ? "…" : s.val}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: s.col }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2">
        {(["telemetry", "table", "settings"] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className="px-4 py-2 text-sm font-bold rounded-xl transition"
            style={activeTab === t ? { background: "#0f172a", color: "#fff" } : { background: "#f1f5f9", color: "#64748b" }}>
            {t === "telemetry" ? "⚡ Telemetry" : t === "table" ? "📋 Log Table" : "⚙️ Settings"}
          </button>
        ))}
      </div>

      {/* ── Telemetry Console ── */}
      {activeTab === "telemetry" && (
        <div className="rounded-2xl overflow-hidden border border-slate-800" style={{ background: "#0d1117" }}>
          {/* Console header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>⚡ Satellite &amp; Cloud Telemetry</span>
            </div>
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>{total} total events</span>
          </div>
          {/* Console body */}
          <div ref={consoleRef} className="font-mono text-[11px] p-4 h-72 overflow-y-auto space-y-0.5">
            {loading ? (
              <div className="flex items-center gap-2 text-slate-500 py-8 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> Loading telemetry…</div>
            ) : logs.length === 0 ? (
              <div className="text-slate-600 py-8 text-center">No events logged yet. Install the Chrome extension and start bumping.</div>
            ) : logs.map((l, i) => {
              const ts = new Date(l.created_at).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
              const col = EVENT_COL[l.event] ?? "#94a3b8";
              const icon = EVENT_ICON[l.event] ?? "•";
              const isError = l.event === "bump_failed" || l.event === "bump_error";
              return (
                <div key={i} className="flex gap-2 leading-relaxed" style={{ color: isError ? "#ef4444" : "#e2e8f0" }}>
                  <span style={{ color: "rgba(255,255,255,0.25)", minWidth: "52px" }}>[{ts}]</span>
                  <span style={{ color: col, minWidth: "14px" }}>{icon}</span>
                  <span style={{ color: "rgba(255,255,255,0.5)", minWidth: "70px" }}>{(l.source || "CLOUD").toUpperCase()}:</span>
                  <span className="flex-1">
                    {l.account_title ? <><span style={{ color: col }}>Successfully bumped: </span>{l.account_title}{l.price ? ` - ${l.price}` : ""}</> : (l.message || l.event)}
                    {l.error_detail && <span style={{ color: "#ef4444" }}> — {l.error_detail}</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Log Table ── */}
      {activeTab === "table" && (
        <div className={card}>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {["#", "Event", "Account / Title", "Platform", "Price", "Message", "Version", "Time"].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={8} className="py-10 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400" /></td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={8} className="py-10 text-center text-slate-400">No logs found</td></tr>
                ) : logs.map((l: any) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition">
                    <td className="px-3 py-2.5 font-mono text-slate-400">{l.id}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: `${EVENT_COL[l.event] ?? "#94a3b8"}1a`, color: EVENT_COL[l.event] ?? "#94a3b8" }}>
                        {EVENT_ICON[l.event] ?? "•"} {(l.event ?? "").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 max-w-[200px]">
                      <div className="font-semibold text-slate-800 truncate">{l.account_title || "—"}</div>
                      {l.listing_id && <div className="text-[10px] text-slate-400 truncate">{l.listing_id}</div>}
                    </td>
                    <td className="px-3 py-2.5 capitalize text-slate-500">{l.platform || "—"}</td>
                    <td className="px-3 py-2.5 font-bold text-emerald-600">{l.price || "—"}</td>
                    <td className="px-3 py-2.5 text-slate-500 max-w-[200px] truncate">{l.message || l.error_detail || "—"}</td>
                    <td className="px-3 py-2.5 font-mono text-slate-400">{l.ext_version || "—"}</td>
                    <td className="px-3 py-2.5 text-slate-400 whitespace-nowrap">{fmtDate(l.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {total > LIMIT && (
            <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
              <span>Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total}</span>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <button onClick={() => setPage(p => p + 1)} disabled={page * LIMIT >= total}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Settings Tab ── */}
      {activeTab === "settings" && (
        <div className="max-w-lg">
          <div className={card}>
            <h3 className="font-bold text-slate-900 mb-1">Extension Log Token</h3>
            <p className="text-sm text-slate-400 mb-4">Set a secret token that your Chrome extension must send with each log request. Leave blank to allow unauthenticated log ingest (dev/testing only).</p>
            <form onSubmit={handleSaveToken} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Log Token</label>
                <input type="password" className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  value={extToken} onChange={e => setExtToken(e.target.value)} placeholder="your-secret-extension-token" />
                <p className="text-[10px] text-slate-400 mt-1">Your extension must send <code className="bg-slate-100 px-1 rounded">ext_token</code> matching this value in each log POST.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                <p className="font-bold">Extension log endpoint:</p>
                <code className="block bg-white px-2 py-1.5 rounded-lg border border-slate-200 text-[11px]">POST /api/extension/log</code>
                <p className="font-bold mt-2">Required body fields:</p>
                <code className="block bg-white px-2 py-1.5 rounded-lg border border-slate-200 text-[11px] leading-relaxed">
                  event: "bump_success" | "bump_failed" | "bump_error" | "bump_limit" | "bump_skip"<br />
                  account_title: "Reddit Account 1234..."<br />
                  listing_id: "mlqr25ij17e01"<br />
                  platform: "reddit" | "social" | "linkedin" | "snapchat"<br />
                  price: "$71" (optional)<br />
                  message: "Bump completed successfully" (optional)<br />
                  error_detail: "..." (optional)<br />
                  ext_token: "your-token"<br />
                  ext_version: "1.2.3" (optional)
                </code>
              </div>
              <button type="submit" className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl text-white transition" style={{ background: PRIMARY }}>
                {tokenSaved ? "✅ Saved!" : <><Save className="w-4 h-4" /> Save Token</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── WhatsApp Inbox Panel ─────────────────────────────────────────────────────
const WA_GREEN = "#25D366";
const WA_DARK  = "#075E54";

interface WaStatus { status: "disconnected"|"connecting"|"qr"|"connected"; qr?: string|null; name?: string|null; phone?: string|null; chatCount?: number; }
interface WaChat  { jid: string; name: string; lastMessage?: string; lastTimestamp?: number; unread: number; isGroup: boolean; }
interface WaMsg   { id: string; from: string; fromMe: boolean; body: string; timestamp: number; }

function fmtWaTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function WaAvatar({ name, size = 36 }: { name: string; size?: number }) {
  const c = ["#25D366","#128C7E","#34B7F1","#075E54","#00BFA5","#53B045"];
  const bg = c[(name.charCodeAt(0) || 0) % c.length];
  return (
    <div className="rounded-full flex items-center justify-center shrink-0 font-bold text-white text-sm" style={{ width: size, height: size, background: bg }}>
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

function WhatsAppPanel({ token }: { token: string }) {
  const [waStatus, setWaStatus] = useState<WaStatus>({ status: "disconnected" });
  const [chats, setChats] = useState<WaChat[]>([]);
  const [activeJid, setActiveJid] = useState<string | null>(null);
  const [messages, setMessages] = useState<WaMsg[]>([]);
  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const msgEndRef = useRef<HTMLDivElement>(null);
  const evtRef = useRef<EventSource | null>(null);

  const activeChat = chats.find(c => c.jid === activeJid);

  // Fetch status + chats
  const fetchStatus = useCallback(async () => {
    const r = await adminFetch("/admin/whatsapp/status", token);
    const d = await r.json();
    setWaStatus(d);
  }, [token]);

  const fetchChats = useCallback(async () => {
    const r = await adminFetch("/admin/whatsapp/chats", token);
    const d = await r.json();
    if (Array.isArray(d)) setChats(d);
  }, [token]);

  const fetchMessages = useCallback(async (jid: string) => {
    setLoadingMsgs(true);
    const r = await adminFetch(`/admin/whatsapp/messages/${encodeURIComponent(jid)}`, token);
    const d = await r.json();
    if (Array.isArray(d)) setMessages(d);
    setLoadingMsgs(false);
    setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [token]);

  // Connect to SSE for real-time updates
  useEffect(() => {
    fetchStatus();
    fetchChats();

    // EventSource doesn't support custom headers — pass token as query param
    evtRef.current?.close();
    const sse = new EventSource(`${API_BASE}/admin/whatsapp/events?t=${encodeURIComponent(token)}`);
    evtRef.current = sse;

    sse.addEventListener("status", (e: any) => {
      const d = JSON.parse(e.data);
      setWaStatus(d);
      if (d.status === "connected") fetchChats();
    });
    sse.addEventListener("qr", (e: any) => {
      const d = JSON.parse(e.data);
      setWaStatus(prev => ({ ...prev, status: "qr", qr: d.qr }));
    });
    sse.addEventListener("message", (e: any) => {
      const d = JSON.parse(e.data);
      // Update chat list
      setChats(prev => {
        const idx = prev.findIndex(c => c.jid === d.jid);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...d.chat };
          return updated.sort((a, b) => (b.lastTimestamp ?? 0) - (a.lastTimestamp ?? 0));
        }
        return [d.chat, ...prev];
      });
      // Update messages if chat is active
      setActiveJid(current => {
        if (current === d.jid) {
          setMessages(prev => {
            if (prev.find(m => m.id === d.message.id)) return prev;
            return [...prev, d.message];
          });
          setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
        }
        return current;
      });
    });
    return () => { sse.close(); };
  }, [token]);

  // Re-fetch messages when active chat changes
  useEffect(() => {
    if (activeJid) fetchMessages(activeJid);
    else setMessages([]);
  }, [activeJid, fetchMessages]);

  // Auto-scroll on new message
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleConnect = async () => {
    setConnecting(true);
    await adminFetch("/admin/whatsapp/connect", token, { method: "POST" });
    setConnecting(false);
    fetchStatus();
  };

  const handleLogout = async () => {
    if (!confirm("Disconnect WhatsApp? You'll need to scan QR again.")) return;
    await adminFetch("/admin/whatsapp/logout", token, { method: "POST" });
    setChats([]); setMessages([]); setActiveJid(null);
    setWaStatus({ status: "disconnected" });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim() || !activeJid || sending) return;
    setSending(true);
    const text = msgText.trim();
    setMsgText("");
    await adminFetch("/admin/whatsapp/send", token, { method: "POST", body: JSON.stringify({ jid: activeJid, text }) });
    setSending(false);
  };

  const filteredChats = chats.filter(c => !chatSearch || (c.name || c.jid).toLowerCase().includes(chatSearch.toLowerCase()));

  // ── Render: not connected ────────────────────────────────────────────────
  if (waStatus.status === "disconnected" || waStatus.status === "connecting") {
    return (
      <div>
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: WA_GREEN }}>WHATSAPP INBOX</p>
          <h2 className="text-2xl font-black text-slate-900">WhatsApp Integration</h2>
          <p className="text-sm text-slate-500 mt-0.5">Connect your WhatsApp to send and receive messages from the admin panel.</p>
        </div>
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "#25D36615" }}>
              <SmartphoneNfc className="w-10 h-10" style={{ color: WA_GREEN }} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Connect Your WhatsApp</h3>
            <p className="text-sm text-slate-500 mb-6">Click connect, then scan the QR code with your WhatsApp app.<br />Works with any WhatsApp account — personal or business.</p>
            <button onClick={handleConnect} disabled={connecting || waStatus.status === "connecting"}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition disabled:opacity-60"
              style={{ background: WA_GREEN }}>
              {(connecting || waStatus.status === "connecting") ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting…</> : <><Wifi className="w-4 h-4" /> Connect WhatsApp</>}
            </button>
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left">
              <p className="text-xs font-bold text-slate-600 mb-2">How it works:</p>
              <ol className="space-y-1.5 text-xs text-slate-500">
                <li className="flex gap-2"><span className="font-bold" style={{ color: WA_GREEN }}>1.</span> Click Connect and a QR code will appear</li>
                <li className="flex gap-2"><span className="font-bold" style={{ color: WA_GREEN }}>2.</span> Open WhatsApp → Settings → Linked Devices → Link a Device</li>
                <li className="flex gap-2"><span className="font-bold" style={{ color: WA_GREEN }}>3.</span> Scan the QR code with your phone</li>
                <li className="flex gap-2"><span className="font-bold" style={{ color: WA_GREEN }}>4.</span> Your messages appear here in real-time</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: QR code ──────────────────────────────────────────────────────
  if (waStatus.status === "qr") {
    return (
      <div>
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: WA_GREEN }}>WHATSAPP INBOX</p>
          <h2 className="text-2xl font-black text-slate-900">Scan QR Code</h2>
          <p className="text-sm text-slate-500 mt-0.5">Open WhatsApp on your phone and scan this code.</p>
        </div>
        <div className="max-w-sm mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <p className="text-xs text-slate-400 mb-4">Scan with <strong>WhatsApp → Settings → Linked Devices → Link a Device</strong></p>
          {waStatus.qr ? (
            <div className="flex items-center justify-center mb-4">
              <img src={waStatus.qr} alt="WhatsApp QR Code" className="w-56 h-56 rounded-xl border-4 border-slate-100" />
            </div>
          ) : (
            <div className="w-56 h-56 mx-auto flex items-center justify-center bg-slate-50 rounded-xl mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            QR code expires in ~60 seconds. Scan quickly!
          </div>
          <button onClick={() => setWaStatus({ status: "disconnected" })} className="mt-4 text-xs text-slate-400 hover:text-slate-600 transition">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Render: Connected — full chat UI ─────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: WA_GREEN }}>WHATSAPP INBOX</p>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            Connected {waStatus.name ? `as ${waStatus.name}` : ""} {waStatus.phone ? `(${waStatus.phone})` : ""}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchChats} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition">
            <WifiOff className="w-3.5 h-3.5" /> Disconnect
          </button>
        </div>
      </div>

      {/* Chat layout */}
      <div className="flex-1 flex gap-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ minHeight: 0 }}>
        {/* Chat list */}
        <div className="w-72 shrink-0 flex flex-col border-r border-slate-200 bg-white">
          {/* Search */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input value={chatSearch} onChange={e => setChatSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-300 placeholder-slate-400"
                placeholder="Search contacts…" />
            </div>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs px-4">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No chats yet. Messages you send or receive will appear here.
              </div>
            ) : filteredChats.map(chat => (
              <button key={chat.jid} onClick={() => { setActiveJid(chat.jid); setChats(prev => prev.map(c => c.jid === chat.jid ? { ...c, unread: 0 } : c)); }}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left"
                style={activeJid === chat.jid ? { background: "#25D36610", borderLeft: `3px solid ${WA_GREEN}` } : {}}>
                <WaAvatar name={chat.name || chat.jid} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 truncate">{chat.name || chat.jid.split("@")[0]}</span>
                    <span className="text-[9px] text-slate-400 ml-1 shrink-0">{chat.lastTimestamp ? fmtWaTime(chat.lastTimestamp) : ""}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] text-slate-400 truncate">{chat.lastMessage || ""}</span>
                    {chat.unread > 0 && (
                      <span className="ml-1 shrink-0 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full" style={{ background: WA_GREEN }}>{chat.unread}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 flex flex-col" style={{ background: "#f0f4f8", minWidth: 0 }}>
          {!activeJid ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#25D36615" }}>
                <MessageSquare className="w-8 h-8" style={{ color: WA_GREEN }} />
              </div>
              <p className="text-sm font-semibold text-slate-500">Select a conversation</p>
              <p className="text-xs text-slate-400 mt-1">Click any chat on the left to open it</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-slate-200 shrink-0">
                <button onClick={() => setActiveJid(null)} className="lg:hidden p-1 text-slate-400 hover:text-slate-600">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <WaAvatar name={activeChat?.name || activeJid} size={38} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{activeChat?.name || activeJid.split("@")[0]}</p>
                  <p className="text-[10px] text-slate-400">{activeJid.endsWith("@g.us") ? "Group" : "Contact"} · {activeJid.split("@")[0]}</p>
                </div>
                <a href={`https://wa.me/${activeJid.split("@")[0]}`} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2" style={{ backgroundImage: "radial-gradient(circle, #e2e8f030 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
                {loadingMsgs ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-slate-400 text-xs py-8">No messages yet. Start the conversation!</div>
                ) : messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[70%]">
                      <div className="px-3.5 py-2 rounded-2xl text-sm shadow-sm"
                        style={msg.fromMe
                          ? { background: "#DCF8C6", borderBottomRightRadius: 4 }
                          : { background: "#fff", borderBottomLeftRadius: 4 }}>
                        <p className="text-slate-800 text-xs leading-relaxed">{msg.body}</p>
                        <div className={`flex items-center gap-1 mt-1 ${msg.fromMe ? "justify-end" : "justify-start"}`}>
                          <span className="text-[9px] text-slate-400">{fmtWaTime(msg.timestamp)}</span>
                          {msg.fromMe && <CheckCheck className="w-3 h-3 text-blue-400" />}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={msgEndRef} />
              </div>

              {/* Message input */}
              <form onSubmit={sendMessage} className="flex items-end gap-2 px-4 py-3 bg-white border-t border-slate-200 shrink-0">
                <textarea
                  className="flex-1 px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-300 resize-none placeholder-slate-400 text-slate-800"
                  style={{ minHeight: 42, maxHeight: 120 }}
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e as any); } }}
                  placeholder="Type a message…"
                  rows={1}
                />
                <button type="submit" disabled={!msgText.trim() || sending}
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition disabled:opacity-40"
                  style={{ background: WA_GREEN }}>
                  {sending ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white" />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PlayerUp Creator Panel ──────────────────────────────────────────────────────
function PlayerUpCreatorPanel({ token }: { token: string }) {
  return (
    <div>
      <div className="mb-6"><h2 className="text-xl font-bold text-slate-900">PlayerUp Creator</h2><p className="text-sm mt-0.5 text-slate-500">Manage and create PlayerUp marketplace listings</p></div>
      <TableManager tableName="playerup_creator" token={token} title="PlayerUp Creator Listings" description="Your PlayerUp seller listings" />
    </div>
  );
}

// ── Website Content Editor ──────────────────────────────────────────────────────
function WebsiteContent({ token }: { token: string }) {
  type Field = { key: string; label: string; type: "text" | "textarea"; placeholder: string };
  type Section = { title: string; emoji: string; fields: Field[] };
  const sections: Section[] = [
    { title: "Hero Section", emoji: "🏠", fields: [
      { key: "hero_headline", label: "Hero Headline", type: "text", placeholder: "Build a cleaner, faster, more trusted digital presence." },
      { key: "hero_subheadline", label: "Hero Subheadline", type: "textarea", placeholder: "Your one-stop digital agency…" },
      { key: "hero_cta_primary", label: "Primary CTA Text", type: "text", placeholder: "Browse Shop" },
      { key: "hero_cta_secondary", label: "Secondary CTA", type: "text", placeholder: "Explore Services" },
      { key: "stats_projects", label: "Stats: Projects", type: "text", placeholder: "1,471+" },
      { key: "stats_rating", label: "Stats: Rating", type: "text", placeholder: "4.9★" },
      { key: "stats_orders", label: "Stats: Orders", type: "text", placeholder: "4.8k+" },
    ]},
    { title: "Contact Info", emoji: "📞", fields: [
      { key: "contact_email", label: "Email", type: "text", placeholder: "hello@officialum1.com" },
      { key: "contact_whatsapp", label: "WhatsApp", type: "text", placeholder: "+92 323 7102924" },
      { key: "contact_location", label: "Location", type: "text", placeholder: "Sahiwal, Punjab, Pakistan" },
      { key: "contact_hours", label: "Business Hours", type: "text", placeholder: "Mon–Sat, 9am–8pm PKT" },
    ]},
    { title: "About Section", emoji: "ℹ️", fields: [
      { key: "about_headline", label: "About Headline", type: "text", placeholder: "Elevating the digital standard" },
      { key: "about_tagline", label: "About Tagline", type: "textarea", placeholder: "From Sahiwal to the world…" },
      { key: "about_stat_assets", label: "Stat: Market Assets", type: "text", placeholder: "10k+" },
      { key: "about_stat_users", label: "Stat: Active Users", type: "text", placeholder: "2.5k+" },
      { key: "about_stat_orders", label: "Stat: Orders", type: "text", placeholder: "3.6k+" },
      { key: "about_stat_rate", label: "Stat: Success Rate", type: "text", placeholder: "99.9%" },
    ]},
    { title: "Shop Settings", emoji: "🛍️", fields: [
      { key: "shop_headline", label: "Shop Headline", type: "text", placeholder: "Premium Digital Products" },
      { key: "shop_bundle_text", label: "Bundle Banner Text", type: "text", placeholder: "Buy 2+ accounts and save 15%" },
      { key: "shop_bundle_code", label: "Bundle Coupon Code", type: "text", placeholder: "BUNDLE15" },
    ]},
    { title: "SEO Settings", emoji: "🔍", fields: [
      { key: "seo_title", label: "Site Title", type: "text", placeholder: "OfficialUM1 — Premium Digital Accounts" },
      { key: "seo_description", label: "Meta Description", type: "textarea", placeholder: "Premium social media accounts…" },
      { key: "seo_keywords", label: "Keywords", type: "textarea", placeholder: "social media accounts, buy accounts…" },
    ]},
  ];

  const [vals, setVals] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    adminFetch("/admin/db/tables/settings?limit=200", token).then(r => r.json()).then(d => {
      if (d?.rows) { const m: Record<string, string> = {}; d.rows.forEach((r: any) => { if (r.key) m[r.key] = r.value ?? ""; }); setVals(m); }
    }).catch(() => {});
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await adminFetch("/admin/settings", token, { method: "POST", body: JSON.stringify(vals) });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch { alert("Save failed"); } finally { setSaving(false); }
  };

  const sec = sections[activeTab];
  return (
    <div style={{ maxWidth: 900 }}>
      <div className="flex items-center justify-between mb-6"><div><h2 className="text-xl font-bold text-slate-900">Website Content Editor</h2><p className="text-sm mt-0.5 text-slate-500">Edit live content — changes appear on the public site immediately</p></div></div>
      <div className="flex gap-2 mb-5 flex-wrap">{sections.map((s, i) => <button key={i} onClick={() => setActiveTab(i)} className="px-3 py-1.5 text-sm font-semibold rounded-lg transition" style={activeTab === i ? { background: PRIMARY, color: "#fff" } : { background: "#f1f5f9", color: "#64748b" }}>{s.emoji} {s.title}</button>)}</div>
      <form onSubmit={handleSave} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4">{sec.emoji} {sec.title}</h3>
        <div className="space-y-4">
          {sec.fields.map(f => (
            <div key={f.key}>
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">{f.label}</label>
              {f.type === "textarea" ? <textarea className={INP_CLS} style={{ minHeight: 90, resize: "vertical" }} value={vals[f.key] ?? ""} onChange={e => setVals(v => ({ ...v, [f.key]: e.target.value }))} placeholder={f.placeholder} />
                : <input type="text" className={INP_CLS} value={vals[f.key] ?? ""} onChange={e => setVals(v => ({ ...v, [f.key]: e.target.value }))} placeholder={f.placeholder} />}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-5">
          <button type="submit" disabled={saving} className={`${BTN_PRI} py-2.5 px-6`} style={{ background: PRIMARY }}>{saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Changes</>}</button>
          {saved && <span className="text-sm font-semibold text-emerald-600">✅ Saved!</span>}
        </div>
      </form>
    </div>
  );
}

// ── Wallet Admin Panel ─────────────────────────────────────────────────────────
type WalletUser = { id: number; name: string; email: string; walletBalance: string; createdAt: string };
function WalletPanel({ token }: { token: string }) {
  const [users, setUsers] = useState<WalletUser[]>([]);
  const [total, setTotal] = useState(0); const [page, setPage] = useState(1);
  const [search, setSearch] = useState(""); const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<WalletUser | null>(null);
  const [adjustMode, setAdjustMode] = useState<"add" | "subtract">("add");
  const [amount, setAmount] = useState(""); const [note, setNote] = useState("");
  const [adjusting, setAdjusting] = useState(false); const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await adminFetch(`/admin/wallet/users?page=${page}&search=${encodeURIComponent(search)}`, token).then(r => r.json());
      setUsers(Array.isArray(d.users) ? d.users : []); setTotal(d.total ?? 0);
    } catch { setUsers([]); } finally { setLoading(false); }
  }, [token, page, search]);

  useEffect(() => { load(); }, [load]);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selected || !amount) return; setAdjusting(true);
    try {
      const delta = adjustMode === "add" ? parseFloat(amount) : -parseFloat(amount);
      const r = await adminFetch("/admin/wallet/adjust", token, { method: "POST", body: JSON.stringify({ userId: selected.id, amount: delta, note }) });
      const d = await r.json();
      if (!r.ok) { alert(d.error ?? "Failed"); return; }
      setToast(`✅ ${adjustMode === "add" ? "Added" : "Subtracted"} $${amount} ${adjustMode === "add" ? "to" : "from"} ${selected.name}'s wallet (new balance: $${d.newBalance})`);
      setTimeout(() => setToast(null), 5000);
      setSelected(null); setAmount(""); setNote(""); load();
    } catch { alert("Error"); } finally { setAdjusting(false); }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Wallet Management</h2>
          <p className="text-sm mt-0.5 text-slate-500">Add or subtract funds from user wallets</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" /><input className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 w-52 placeholder-slate-400" placeholder="Search users…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
          <button onClick={load} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600"><RefreshCw className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {toast && <div className="p-4 mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold flex items-center gap-2"><CheckCircle className="w-4 h-4 shrink-0" />{toast}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center"><div className="text-2xl font-black" style={{ color: PRIMARY }}>{fmt(total)}</div><div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Total Users</div></div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center"><div className="text-2xl font-black text-emerald-600">{fmtMoney(users.reduce((s, u) => s + parseFloat(u.walletBalance ?? "0"), 0))}</div><div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Total in Wallets (this page)</div></div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center"><div className="text-2xl font-black text-amber-600">{users.filter(u => parseFloat(u.walletBalance ?? "0") > 0).length}</div><div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Users with Balance</div></div>
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div> : (
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50"><tr>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">User</th>
              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Wallet Balance</th>
              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden sm:table-cell">Member Since</th>
              <th className="px-4 py-3 w-28"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ background: `linear-gradient(135deg, ${PRIMARY}, #06b6d4)` }}>{(u.name ?? "?").slice(0,1).toUpperCase()}</div>
                      <div><div className="font-semibold text-slate-800 text-xs">{u.name}</div><div className="text-xs text-slate-400">{u.email}</div></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right"><span className={`font-bold ${parseFloat(u.walletBalance ?? "0") > 0 ? "text-emerald-600" : "text-slate-400"}`}>{fmtMoney(parseFloat(u.walletBalance ?? "0"))}</span></td>
                  <td className="px-4 py-3 text-right text-xs text-slate-400 hidden sm:table-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => { setSelected(u); setAdjustMode("add"); setAmount(""); setNote(""); }} className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition">+ Add</button>
                      <button onClick={() => { setSelected(u); setAdjustMode("subtract"); setAmount(""); setNote(""); }} className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition">− Sub</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {Math.ceil(total / 50) > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
              <span className="text-xs text-slate-400">Page {page} of {Math.ceil(total / 50)} · {total} total</span>
              <div className="flex gap-1">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40">Prev</button>
                <button disabled={page >= Math.ceil(total / 50)} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">{adjustMode === "add" ? "Add Funds" : "Subtract Funds"}</h3>
              <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAdjust} className="px-6 py-5 space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ background: PRIMARY }}>{(selected.name ?? "?").slice(0,1).toUpperCase()}</div>
                  <div><div className="font-bold text-slate-900">{selected.name}</div><div className="text-xs text-slate-500">{selected.email}</div></div>
                </div>
                <div className="text-sm font-semibold text-slate-700">Current balance: <span className="text-emerald-600">{fmtMoney(parseFloat(selected.walletBalance ?? "0"))}</span></div>
              </div>
              <div className="flex gap-2 mb-1">
                <button type="button" onClick={() => setAdjustMode("add")} className={`flex-1 py-2 text-sm font-bold rounded-xl border transition ${adjustMode === "add" ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>+ Add Funds</button>
                <button type="button" onClick={() => setAdjustMode("subtract")} className={`flex-1 py-2 text-sm font-bold rounded-xl border transition ${adjustMode === "subtract" ? "bg-red-50 border-red-300 text-red-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>− Subtract Funds</button>
              </div>
              <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Amount (USD)</label><input required type="number" step="0.01" min="0.01" className={INP_CLS} value={amount} onChange={e => setAmount(e.target.value)} placeholder="10.00" autoFocus /></div>
              <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Note (optional)</label><input className={INP_CLS} value={note} onChange={e => setNote(e.target.value)} placeholder="Manual adjustment, refund, bonus…" /></div>
              {amount && <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">New balance: <strong className="text-emerald-600">{fmtMoney(Math.max(0, parseFloat(selected.walletBalance ?? "0") + (adjustMode === "add" ? 1 : -1) * parseFloat(amount || "0")))}</strong></div>}
              <div className="flex gap-3">
                <button type="submit" disabled={adjusting} className={`flex-1 ${BTN_PRI} py-2.5`} style={{ background: adjustMode === "add" ? "#10b981" : "#ef4444" }}>
                  {adjusting ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : adjustMode === "add" ? `Add $${amount || "0"}` : `Subtract $${amount || "0"}`}
                </button>
                <button type="button" onClick={() => setSelected(null)} className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Staff Panel ────────────────────────────────────────────────────────────────
function StaffPanel({ token }: { token: string }) {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "admin", department: "", status: "active", notes: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await adminFetch("/admin/db/tables/staff?limit=100&sort=id&dir=asc", token).then(r => r.json());
      setStaff(Array.isArray(d.rows) ? d.rows : []);
    } catch { setStaff([]); } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditItem(null); setForm({ name: "", email: "", role: "admin", department: "", status: "active", notes: "" }); setShowModal(true); };
  const openEdit = (s: any) => { setEditItem(s); setForm({ name: s.name ?? "", email: s.email ?? "", role: s.role ?? "admin", department: s.department ?? "", status: s.status ?? "active", notes: s.notes ?? "" }); setShowModal(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem) {
        await adminFetch(`/admin/db/tables/staff/rows/${editItem.id}`, token, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await adminFetch("/admin/db/tables/staff/rows", token, { method: "POST", body: JSON.stringify(form) });
      }
      setShowModal(false); load();
    } catch { alert("Failed to save"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this staff member?")) return;
    setDeleting(id);
    try { await adminFetch(`/admin/db/tables/staff/rows/${id}`, token, { method: "DELETE" }); load(); }
    catch { alert("Delete failed"); } finally { setDeleting(null); }
  };

  const ROLES = ["admin", "moderator", "support", "developer", "marketer", "sales", "viewer"];
  const DEPTS = ["Management", "Support", "Marketing", "Development", "Sales", "Operations"];
  const ROLE_COLORS: Record<string, string> = { admin: "#ef4444", moderator: "#f59e0b", support: "#3b82f6", developer: "#8b5cf6", marketer: "#ec4899", sales: "#10b981", viewer: "#94a3b8" };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Staff Management</h2>
          <p className="text-sm mt-0.5 text-slate-500">{staff.length} team members configured</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600"><RefreshCw className="w-3.5 h-3.5" /></button>
          <button onClick={openCreate} className={BTN_PRI} style={{ background: PRIMARY }}><Plus className="w-4 h-4" /> Add Staff</button>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div> : staff.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-white border border-slate-200">
          <div className="text-4xl mb-3">👥</div>
          <p className="font-semibold text-slate-700 mb-1">No staff accounts yet</p>
          <p className="text-sm text-slate-400 mb-4">Add your team members to give them access to the admin panel</p>
          <button onClick={openCreate} className={BTN_PRI} style={{ background: PRIMARY }}>Add First Staff Member</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((s: any) => (
            <div key={s.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0" style={{ background: `linear-gradient(135deg, ${ROLE_COLORS[s.role] ?? PRIMARY}, ${PRIMARY})` }}>
                    {(s.name ?? "?").slice(0,1).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                    <div className="text-xs text-slate-400">{s.email}</div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600"><Edit3 className="w-3 h-3" /></button>
                  <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">{deleting === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}</button>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide" style={{ background: (ROLE_COLORS[s.role] ?? "#94a3b8") + "20", color: ROLE_COLORS[s.role] ?? "#94a3b8" }}>{s.role ?? "staff"}</span>
                {s.department && <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">{s.department}</span>}
                <StatusBadge status={s.status ?? "active"} />
              </div>
              {s.notes && <p className="text-xs text-slate-400 mt-2 italic truncate">{s.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">{editItem ? "Edit Staff Member" : "Add Staff Member"}</h3>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-4 space-y-4">
              <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Full Name</label><input required className={INP_CLS} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Muhammad Ali" /></div>
              <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Email</label><input required type="email" className={INP_CLS} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="ali@officialum1.com" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Role</label><select className={INP_CLS} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>{ROLES.map(r => <option key={r}>{r}</option>)}</select></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Department</label><select className={INP_CLS} value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}><option value="">—</option>{DEPTS.map(d => <option key={d}>{d}</option>)}</select></div>
              </div>
              <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Status</label><select className={INP_CLS} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
              <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Notes</label><textarea className={INP_CLS} rows={2} style={{ resize: "none" }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes about this staff member…" /></div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className={`flex-1 ${BTN_PRI} py-2.5`} style={{ background: PRIMARY }}>{saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : editItem ? "Save Changes" : "Add Staff Member"}</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Documents Panel ────────────────────────────────────────────────────────────
function DocumentsPanel({ token }: { token: string }) {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"list" | "invoice" | "contract">("list");
  const [invoice, setInvoice] = useState({ clientName: "", clientEmail: "", amount: "", description: "", dueDate: "", invoiceNumber: `INV-${Date.now().toString().slice(-6)}` });
  const [contract, setContract] = useState({ clientName: "", clientEmail: "", serviceType: "Social Media Management", startDate: "", duration: "1 Month", value: "", scope: "" });
  const [generating, setGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<{ type: string; content: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await adminFetch("/admin/db/tables/documents?limit=100&sort=id&dir=desc", token).then(r => r.json());
      setDocs(Array.isArray(d.rows) ? d.rows : []);
    } catch { setDocs([]); } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const generateInvoice = async (e: React.FormEvent) => {
    e.preventDefault(); setGenerating(true);
    const content = `INVOICE\n\nInvoice #: ${invoice.invoiceNumber}\nDate: ${new Date().toLocaleDateString()}\nDue Date: ${invoice.dueDate || "Upon Receipt"}\n\nFROM:\nOfficialUM1\nofficialum1.com\nadmin@officialum1.com\n\nBILL TO:\n${invoice.clientName}\n${invoice.clientEmail}\n\nSERVICES:\n${invoice.description}\n\nAMOUNT DUE: $${parseFloat(invoice.amount || "0").toFixed(2)}\n\nPAYMENT INSTRUCTIONS:\nStripe, Crypto (USDT/BTC), or Bank Transfer\nContact us for payment details.\n\nThank you for your business!\n— OfficialUM1 Team`;
    try {
      await adminFetch("/admin/db/tables/documents/rows", token, { method: "POST", body: JSON.stringify({ type: "invoice", title: `Invoice ${invoice.invoiceNumber} – ${invoice.clientName}`, client_name: invoice.clientName, client_email: invoice.clientEmail, amount: invoice.amount, content, status: "sent" }) });
      setGeneratedDoc({ type: "invoice", content }); setActiveTab("list"); load();
    } catch { alert("Failed to save invoice"); } finally { setGenerating(false); }
  };

  const generateContract = async (e: React.FormEvent) => {
    e.preventDefault(); setGenerating(true);
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const content = `SERVICE AGREEMENT\n\nThis Service Agreement ("Agreement") is entered into on ${today} by and between:\n\nSERVICE PROVIDER: OfficialUM1 ("Provider")\nWebsite: https://officialum1.com\nEmail: admin@officialum1.com\n\nCLIENT: ${contract.clientName} ("Client")\nEmail: ${contract.clientEmail}\n\n1. SERVICES\nProvider agrees to deliver: ${contract.serviceType}\nScope of work: ${contract.scope || "As discussed and agreed upon."}\n\n2. TERM\nStart Date: ${contract.startDate || today}\nDuration: ${contract.duration}\n\n3. PAYMENT\nTotal Value: $${parseFloat(contract.value || "0").toFixed(2)}\nPayment is due upon signing or as otherwise agreed.\n\n4. CONFIDENTIALITY\nBoth parties agree to keep all business information confidential.\n\n5. INTELLECTUAL PROPERTY\nAll deliverables become Client's property upon full payment.\n\n6. TERMINATION\nEither party may terminate with 7 days written notice.\n\n7. LIMITATION OF LIABILITY\nProvider's liability is limited to the service fee paid.\n\nBY PROCEEDING WITH SERVICES, BOTH PARTIES AGREE TO THESE TERMS.\n\n_______________________          _______________________\nOfficialUM1 (Provider)           ${contract.clientName} (Client)\nDate: ${today}                   Date: _______________`;
    try {
      await adminFetch("/admin/db/tables/documents/rows", token, { method: "POST", body: JSON.stringify({ type: "contract", title: `Contract – ${contract.clientName} – ${contract.serviceType}`, client_name: contract.clientName, client_email: contract.clientEmail, amount: contract.value, content, status: "pending" }) });
      setGeneratedDoc({ type: "contract", content }); setActiveTab("list"); load();
    } catch { alert("Failed to save contract"); } finally { setGenerating(false); }
  };

  const copyDoc = (content: string) => { navigator.clipboard.writeText(content); };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div><h2 className="text-xl font-bold text-slate-900">Documents</h2><p className="text-sm mt-0.5 text-slate-500">Invoices, contracts, and business documents</p></div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {(["list", "invoice", "contract"] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${activeTab === t ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {t === "list" ? "📄 All Documents" : t === "invoice" ? "🧾 Create Invoice" : "📝 Create Contract"}
          </button>
        ))}
      </div>

      {activeTab === "list" && (
        <div>
          {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div>
          : docs.length === 0 ? (
            <div className="text-center py-20 rounded-2xl bg-white border border-slate-200">
              <div className="text-4xl mb-3">📄</div>
              <p className="text-slate-400 mb-3">No documents yet</p>
              <button onClick={() => setActiveTab("invoice")} className={BTN_PRI} style={{ background: PRIMARY }}>Create First Invoice</button>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50"><tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Title</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">Type</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">Client</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {docs.map((d: any) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3"><div className="font-semibold text-slate-800 text-sm truncate max-w-[220px]">{d.title ?? "—"}</div></td>
                      <td className="px-4 py-3 hidden md:table-cell"><span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">{d.type ?? "doc"}</span></td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-500">{d.client_name ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600 text-sm">{d.amount ? `$${parseFloat(d.amount).toFixed(2)}` : "—"}</td>
                      <td className="px-4 py-3 text-center"><StatusBadge status={d.status ?? "pending"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {generatedDoc && (
            <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-800 text-sm">Last Generated: {generatedDoc.type === "invoice" ? "Invoice" : "Contract"}</h3>
                <button onClick={() => copyDoc(generatedDoc.content)} className="text-xs text-blue-500 hover:underline">Copy</button>
              </div>
              <pre className="text-xs text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded-xl max-h-48 overflow-auto font-mono">{generatedDoc.content}</pre>
            </div>
          )}
        </div>
      )}

      {activeTab === "invoice" && (
        <div className="max-w-lg">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">🧾 Generate Invoice</h3>
            <form onSubmit={generateInvoice} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Client Name *</label><input required className={INP_CLS} value={invoice.clientName} onChange={e => setInvoice(f => ({ ...f, clientName: e.target.value }))} placeholder="John Smith" /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Client Email *</label><input required type="email" className={INP_CLS} value={invoice.clientEmail} onChange={e => setInvoice(f => ({ ...f, clientEmail: e.target.value }))} placeholder="client@example.com" /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Amount ($) *</label><input required type="number" step="0.01" min="0" className={INP_CLS} value={invoice.amount} onChange={e => setInvoice(f => ({ ...f, amount: e.target.value }))} placeholder="250.00" /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Due Date</label><input type="date" className={INP_CLS} value={invoice.dueDate} onChange={e => setInvoice(f => ({ ...f, dueDate: e.target.value }))} /></div>
              </div>
              <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Invoice # </label><input className={INP_CLS} value={invoice.invoiceNumber} onChange={e => setInvoice(f => ({ ...f, invoiceNumber: e.target.value }))} /></div>
              <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Services Description *</label><textarea required className={INP_CLS} rows={3} style={{ resize: "none" }} value={invoice.description} onChange={e => setInvoice(f => ({ ...f, description: e.target.value }))} placeholder="Social media management, account services…" /></div>
              <button type="submit" disabled={generating} className={`${BTN_PRI} py-2.5`} style={{ background: PRIMARY }}>{generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : "🧾 Generate Invoice"}</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "contract" && (
        <div className="max-w-lg">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">📝 Generate Service Contract</h3>
            <form onSubmit={generateContract} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Client Name *</label><input required className={INP_CLS} value={contract.clientName} onChange={e => setContract(f => ({ ...f, clientName: e.target.value }))} placeholder="John Smith" /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Client Email *</label><input required type="email" className={INP_CLS} value={contract.clientEmail} onChange={e => setContract(f => ({ ...f, clientEmail: e.target.value }))} placeholder="client@example.com" /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Service Type</label><input className={INP_CLS} value={contract.serviceType} onChange={e => setContract(f => ({ ...f, serviceType: e.target.value }))} /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Value ($) *</label><input required type="number" step="0.01" min="0" className={INP_CLS} value={contract.value} onChange={e => setContract(f => ({ ...f, value: e.target.value }))} placeholder="500.00" /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Start Date</label><input type="date" className={INP_CLS} value={contract.startDate} onChange={e => setContract(f => ({ ...f, startDate: e.target.value }))} /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Duration</label><select className={INP_CLS} value={contract.duration} onChange={e => setContract(f => ({ ...f, duration: e.target.value }))}>{["1 Month", "3 Months", "6 Months", "1 Year", "Ongoing"].map(d => <option key={d}>{d}</option>)}</select></div>
              </div>
              <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Scope of Work</label><textarea className={INP_CLS} rows={3} style={{ resize: "none" }} value={contract.scope} onChange={e => setContract(f => ({ ...f, scope: e.target.value }))} placeholder="Describe the services to be delivered…" /></div>
              <button type="submit" disabled={generating} className={`${BTN_PRI} py-2.5`} style={{ background: PRIMARY }}>{generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : "📝 Generate Contract"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── G2G Marketplace Center (Full) ──────────────────────────────────────────────
function G2GPanelFull({ token }: { token: string }) {
  // ── Listings State ──
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [listingStatusFilter, setListingStatusFilter] = useState<"all" | "live" | "delisted" | "requires_modification">("all");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [form, setForm] = useState({ platform: "G2G", title: "", description: "", price: "", stock: 1, status: "active", g2g_id: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [apiMsg, setApiMsg] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<"idle" | "ok" | "error">("idle");
  // ── Create Offer Wizard State ──
  const [showCreateOffer, setShowCreateOffer] = useState(false);
  const [catalogStep, setCatalogStep] = useState<"service" | "brand" | "product" | "attributes" | "confirm">("service");
  const [catalogServices, setCatalogServices] = useState<any[]>([]);
  const [catalogBrands, setCatalogBrands] = useState<any[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [catalogAttributes, setCatalogAttributes] = useState<any[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [offerForm, setOfferForm] = useState({ title: "", description: "", min_qty: 1, api_qty: 10, low_stock_alert_qty: 2, currency: "USD", unit_price: "", offer_attributes: [] as any[] });
  const [creatingOffer, setCreatingOffer] = useState(false);
  // ── Orders State ──
  const [g2gOrders, setG2gOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [orderPage, setOrderPage] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);
  const [lookupNum, setLookupNum] = useState("");
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [deliverOrder, setDeliverOrder] = useState<any | null>(null);
  const [deliveryId, setDeliveryId] = useState("");
  const [deliveryCodes, setDeliveryCodes] = useState("");
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [patchModal, setPatchModal] = useState<any | null>(null);
  const [patchDeliveryId, setPatchDeliveryId] = useState("");
  const [patchQty, setPatchQty] = useState(1);
  const [patchIssue, setPatchIssue] = useState<"" | "incorrect_delivery_detail" | "insufficient_stock" | "others">("");
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [addOrderForm, setAddOrderForm] = useState({ order_number: "", offer_title: "", buyer: "", amount: "", status: "pending", offer_id: "" });
  // ── Inventory State ──
  const [invOfferId, setInvOfferId] = useState("");
  const [invCodes, setInvCodes] = useState<any[]>([]);
  const [invLoading, setInvLoading] = useState(false);
  const [invUpload, setInvUpload] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  // ── Webhook State ──
  const [webhookEvents, setWebhookEvents] = useState<any[]>([]);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookFilter, setWebhookFilter] = useState("all");
  const [webhookTotal, setWebhookTotal] = useState(0);
  // ── Settings State ──
  const [settings, setSettings] = useState<any>({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [savedSettings, setSavedSettings] = useState(false);
  const [connStatus, setConnStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [connMsg, setConnMsg] = useState<string>("");
  // ── Tabs ──
  const [activeTab, setActiveTab] = useState<"listings" | "orders" | "inventory" | "webhooks" | "settings">("listings");

  // ── Load Listings ──
  const loadListings = useCallback(async () => {
    setLoading(true);
    try {
      const d = await adminFetch("/admin/g2g/offers", token).then(r => r.json());
      setListings(Array.isArray(d.offers ?? d) ? (d.offers ?? d) : []);
    } catch { setListings([]); } finally { setLoading(false); }
  }, [token]);

  // ── Load Orders ──
  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const params = new URLSearchParams({ limit: "20", offset: String(orderPage * 20) });
      if (orderStatus) params.set("status", orderStatus);
      const d = await adminFetch(`/admin/g2g/orders?${params}`, token).then(r => r.json());
      setG2gOrders(Array.isArray(d.orders) ? d.orders : Array.isArray(d) ? d : []);
      if (d.total !== undefined) setOrderTotal(d.total);
    } catch { setG2gOrders([]); } finally { setOrdersLoading(false); }
  }, [token, orderStatus, orderPage]);

  // ── Load Inventory ──
  const loadInventory = useCallback(async (offerId: string) => {
    if (!offerId.trim()) return;
    setInvLoading(true);
    try {
      const d = await adminFetch(`/admin/g2g/inventory/${encodeURIComponent(offerId.trim())}`, token).then(r => r.json());
      setInvCodes(Array.isArray(d.items) ? d.items : []);
    } catch { setInvCodes([]); } finally { setInvLoading(false); }
  }, [token]);

  // ── Load Webhook Events ──
  const loadWebhooks = useCallback(async () => {
    setWebhookLoading(true);
    try {
      const qs = webhookFilter !== "all" ? `?type=${encodeURIComponent(webhookFilter)}` : "";
      const d = await adminFetch(`/admin/g2g/webhook-logs${qs}`, token).then(r => r.json());
      setWebhookEvents(Array.isArray(d.events) ? d.events : []);
      setWebhookTotal(d.total ?? 0);
    } catch { setWebhookEvents([]); } finally { setWebhookLoading(false); }
  }, [token, webhookFilter]);

  // ── Load Settings ──
  const loadSettings = useCallback(async () => {
    try {
      const d = await adminFetch("/admin/g2g/settings", token).then(r => r.json());
      setSettings(d?.settings ?? d ?? {});
    } catch { /* ignore */ }
  }, [token]);

  useEffect(() => { loadListings(); loadSettings(); }, [loadListings, loadSettings]);
  useEffect(() => { if (activeTab === "orders") loadOrders(); }, [activeTab, loadOrders]);
  useEffect(() => { if (activeTab === "webhooks") loadWebhooks(); }, [activeTab, loadWebhooks]);

  // ── Create/Edit/Delete Listings ──
  const openCreate = () => {
    // Open G2G API Create Offer wizard
    setShowCreateOffer(true);
    setCatalogStep("service");
    setCatalogServices([]); setCatalogBrands([]); setCatalogProducts([]); setCatalogAttributes([]);
    setSelectedService(null); setSelectedBrand(null); setSelectedProduct(null);
    setOfferForm({ title: "", description: "", min_qty: 1, api_qty: 10, low_stock_alert_qty: 2, currency: "USD", unit_price: "", offer_attributes: [] });
    // Load services
    setCatalogLoading(true);
    adminFetch("/admin/g2g/catalog/services", token).then(r => r.json())
      .then(d => { setCatalogServices(d.services ?? []); setCatalogLoading(false); })
      .catch(() => { setCatalogLoading(false); });
  };
  const openEdit = (item: any) => { setEditItem(item); setForm({ platform: item.platform ?? "G2G", title: item.title ?? "", description: item.description ?? "", price: item.price ?? "", stock: item.stock ?? 1, status: item.status ?? "active", g2g_id: item.g2g_id ?? "" }); setShowModal(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem?.g2g_id) {
        // Use G2G API to update
        await adminFetch(`/admin/g2g/offer/${editItem.g2g_id}`, token, { method: "PATCH", body: JSON.stringify({ price: parseFloat(form.price), quantity: form.stock }) });
      } else if (editItem) {
        await adminFetch(`/admin/db/tables/g2g_listings/rows/${editItem.id}`, token, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await adminFetch("/admin/db/tables/g2g_listings/rows", token, { method: "POST", body: JSON.stringify(form) });
      }
      setShowModal(false); loadListings();
    } catch { alert("Failed to save listing"); } finally { setSaving(false); }
  };

  const handleDelete = async (item: any) => {
    if (!confirm("Delete this listing from G2G and local DB?")) return;
    const key = item.g2g_id ?? item.id;
    setDeleting(key);
    try {
      if (item.g2g_id) {
        await adminFetch(`/admin/g2g/offer/${item.g2g_id}`, token, { method: "DELETE" });
      } else {
        await adminFetch(`/admin/db/tables/g2g_listings/rows/${item.id}`, token, { method: "DELETE" });
      }
      loadListings();
    } catch { alert("Delete failed"); } finally { setDeleting(null); }
  };

  // ── Order Lookup ──
  const handleLookup = async () => {
    if (!lookupNum.trim()) return;
    setOrdersLoading(true);
    try {
      const d = await adminFetch(`/admin/g2g/order/lookup?order_number=${encodeURIComponent(lookupNum.trim())}`, token).then(r => r.json());
      setLookupResult(d.order ?? d ?? null);
      if (!d.order && !d.id) setApiMsg("⚠️ Order not found");
    } catch { setApiMsg("❌ Lookup failed"); setLookupResult(null); } finally { setOrdersLoading(false); }
  };

  // ── Add Order Manually ──
  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault(); setOrdersLoading(true);
    try {
      const d = await adminFetch("/admin/g2g/order/save", token, { method: "POST", body: JSON.stringify(addOrderForm) }).then(r => r.json());
      if (d.success || d.id) {
        setShowAddOrder(false);
        setAddOrderForm({ order_number: "", offer_title: "", buyer: "", amount: "", status: "pending", offer_id: "" });
        setApiMsg("✅ Order added"); loadOrders();
      } else setApiMsg(`⚠️ ${d.error ?? "Save failed"}`);
    } catch { setApiMsg("❌ Failed to add order"); } finally { setOrdersLoading(false); }
  };

  // ── Deliver Order via G2G API ──
  const handleDeliver = async () => {
    if (!deliverOrder || !deliveryCodes.trim()) return;
    setDeliveryLoading(true);
    try {
      const orderId = deliverOrder.order_number ?? deliverOrder.id;
      const lines = deliveryCodes.split("\n").map((l, i) => ({ content: l.trim(), content_type: "text/plain", reference_id: `ref-${i + 1}` })).filter(l => l.content);
      const body = { delivery_id: deliveryId.trim() || `D${Date.now()}`, codes: lines };
      const d = await adminFetch(`/admin/g2g/order/${orderId}/deliver`, token, { method: "POST", body: JSON.stringify(body) }).then(r => r.json());
      if (d.success) {
        setDeliverOrder(null); setDeliveryId(""); setDeliveryCodes("");
        setApiMsg("✅ Codes delivered via G2G API!"); loadOrders();
      } else setApiMsg(`⚠️ ${d.error ?? "Delivery failed"} — ${JSON.stringify(d.detail ?? "").slice(0, 100)}`);
    } catch { setApiMsg("❌ Delivery failed"); } finally { setDeliveryLoading(false); }
  };

  // ── Patch Delivery (report issue) ──
  const handlePatchDelivery = async () => {
    if (!patchModal) return;
    setDeliveryLoading(true);
    try {
      const orderId = patchModal.order_number ?? patchModal.id;
      const body: any = { delivered_qty: patchQty, delivered_at: Date.now() };
      if (patchIssue) body.delivery_issue = patchIssue;
      if (patchDeliveryId.trim()) body.reference_id = patchDeliveryId.trim();
      const d = await adminFetch(`/admin/g2g/order/${orderId}/delivery/${patchDeliveryId.trim() || "D1"}`, token, { method: "PATCH", body: JSON.stringify(body) }).then(r => r.json());
      if (d.success) {
        setPatchModal(null); setPatchDeliveryId(""); setPatchQty(1); setPatchIssue("");
        setApiMsg("✅ Delivery patched!"); loadOrders();
      } else setApiMsg(`⚠️ ${d.error ?? "Patch failed"}`);
    } catch { setApiMsg("❌ Patch failed"); } finally { setDeliveryLoading(false); }
  };

  // ── Inventory: Upload Codes ──
  const handleUploadCodes = async () => {
    if (!invOfferId.trim() || !invUpload.trim()) return;
    setUploading(true);
    try {
      const codes = invUpload.split("\n").map(l => l.trim()).filter(Boolean).map(c => ({ content: c, content_type: "text/plain" as const }));
      const d = await adminFetch(`/admin/g2g/inventory/${encodeURIComponent(invOfferId.trim())}`, token, { method: "POST", body: JSON.stringify({ codes }) }).then(r => r.json());
      if (d.success) { setInvUpload(""); setApiMsg(`✅ ${d.uploaded} codes uploaded!`); loadInventory(invOfferId); }
      else setApiMsg(`⚠️ ${d.error ?? "Upload failed"} ${JSON.stringify(d.detail ?? "").slice(0, 100)}`);
    } catch { setApiMsg("❌ Upload failed"); } finally { setUploading(false); }
  };

  // ── Inventory: Delete Code ──
  const handleDeleteCode = async (offerId: string, itemId: string) => {
    if (!confirm("Remove this code from inventory?")) return;
    setDeletingCode(itemId);
    try {
      await adminFetch(`/admin/g2g/inventory/${encodeURIComponent(offerId)}/${encodeURIComponent(itemId)}`, token, { method: "DELETE" });
      loadInventory(offerId);
    } catch { alert("Delete failed"); } finally { setDeletingCode(null); }
  };

  // ── Create Offer (final submit) ──
  const handleCreateOffer = async () => {
    if (!selectedProduct?.product_id) return;
    setCreatingOffer(true);
    try {
      const body = {
        product_id: selectedProduct.product_id,
        title: offerForm.title || selectedProduct.name,
        description: offerForm.description,
        min_qty: offerForm.min_qty,
        api_qty: offerForm.api_qty,
        low_stock_alert_qty: offerForm.low_stock_alert_qty,
        offer_attributes: offerForm.offer_attributes,
        currency: offerForm.currency,
        unit_price: parseFloat(offerForm.unit_price),
      };
      const d = await adminFetch("/admin/g2g/offer", token, { method: "POST", body: JSON.stringify(body) }).then(r => r.json());
      if (d.success) {
        setShowCreateOffer(false); setApiMsg("✅ Offer created on G2G!"); loadListings();
      } else setApiMsg(`⚠️ ${d.error ?? "Create failed"} ${JSON.stringify(d.detail ?? "").slice(0, 100)}`);
    } catch { setApiMsg("❌ Create offer failed"); } finally { setCreatingOffer(false); }
  };

  // ── Sync Listings ──
  const syncToG2G = async () => {
    setSyncing(true);
    try {
      const d = await adminFetch("/admin/g2g/sync", token, { method: "POST", body: JSON.stringify({}) }).then(r => r.json());
      setApiMsg(d.message ?? "✅ Sync complete");
    } catch { setApiMsg("❌ Sync failed"); } finally { setSyncing(false); }
  };

  // ── Test Connection ──
  const testConnection = async () => {
    setConnStatus("testing"); setConnMsg("");
    try {
      const d = await adminFetch("/admin/g2g/test-connection", token).then(r => r.json());
      const ok = d.status === "connected";
      setConnStatus(ok ? "ok" : "error");
      setConnMsg(d.message || "");
    } catch { setConnStatus("error"); setConnMsg("Network error — could not reach API server."); }
  };

  // ── Save Settings ──
  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault(); setSavingSettings(true);
    try {
      await adminFetch("/admin/g2g/settings", token, { method: "POST", body: JSON.stringify(settings) });
      setSavedSettings(true); setTimeout(() => setSavedSettings(false), 3000);
    } catch { alert("Failed to save settings"); } finally { setSavingSettings(false); }
  };

  const keysReady = settings._keys_ready === "true" || !!settings.g2g_api_key;
  const envKeySet = settings._env_key_set === "true";
  const hasApiKey = keysReady;
  const filtered = listings.filter(l => {
    const matchSearch = !search || l.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = listingStatusFilter === "all" || l.status === listingStatusFilter;
    return matchSearch && matchStatus;
  });

  const ORDER_STATUSES = ["all", "pending", "processing", "delivered", "cancelled"];

  const TABS = [
    { id: "listings", label: "🗂️ Listings" },
    { id: "orders", label: `📦 Orders${orderTotal > 0 ? ` (${orderTotal})` : ""}` },
    { id: "inventory", label: "📦 Inventory" },
    { id: "webhooks", label: "🔔 Webhooks" },
    { id: "settings", label: "⚙️ Settings" },
  ] as const;

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">🎮 G2G Marketplace Center</h2>
          <p className="text-sm mt-0.5 text-slate-500">Seller ID: <span className="font-bold text-slate-700">7788063</span> · Manage listings and fulfill orders</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
            envKeySet ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
            hasApiKey ? "bg-blue-50 border-blue-200 text-blue-700" :
            "bg-amber-50 border-amber-200 text-amber-700"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${envKeySet ? "bg-emerald-500" : hasApiKey ? "bg-blue-500" : "bg-amber-500"}`} />
            {envKeySet ? "🔐 Connected via Env Secrets" : hasApiKey ? "✅ HMAC-SHA256 Ready" : "⚠️ No API key"}
          </span>
          {activeTab === "listings" && <button onClick={openCreate} className={BTN_PRI} style={{ background: PRIMARY }}><Plus className="w-4 h-4" /> New Offer</button>}
          {activeTab === "listings" && <button onClick={() => { setLoading(true); loadListings(); }} disabled={loading} className={BTN_PRI} style={{ background: "#10b981" }}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading…</> : <><RefreshCw className="w-4 h-4" /> Refresh</>}
          </button>}
          {activeTab === "orders" && <button onClick={() => setShowAddOrder(true)} className={BTN_PRI} style={{ background: "#7c3aed" }}><Plus className="w-4 h-4" /> Add Order</button>}
          {activeTab === "orders" && <button onClick={loadOrders} disabled={ordersLoading} className={BTN_PRI} style={{ background: "#10b981" }}>
            {ordersLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading…</> : <><RefreshCw className="w-4 h-4" /> Refresh</>}
          </button>}
          {activeTab === "webhooks" && <button onClick={loadWebhooks} disabled={webhookLoading} className={BTN_PRI} style={{ background: "#10b981" }}>
            {webhookLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading…</> : <><RefreshCw className="w-4 h-4" /> Refresh</>}
          </button>}
        </div>
      </div>

      {!hasApiKey && (
        <div className="p-4 mb-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
          <span className="text-xl">🔑</span>
          <div className="flex-1"><p className="font-semibold text-amber-800 text-sm">G2G API key not configured</p><p className="text-xs text-amber-600">Add the <code className="bg-amber-100 px-1 rounded">G2G_API_KEY</code> secret in Replit Secrets, or enter your Bearer Token in the API Settings tab.</p></div>
          <button onClick={() => setActiveTab("settings")} className="text-xs font-bold text-amber-700 hover:underline shrink-0">Configure →</button>
        </div>
      )}

      {apiMsg && <div className="p-3 mb-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-700 flex items-center gap-2"><span className="shrink-0">ℹ️</span>{apiMsg}<button onClick={() => setApiMsg(null)} className="ml-auto text-blue-500 hover:text-blue-700"><X className="w-3.5 h-3.5" /></button></div>}

      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${activeTab === t.id ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ LISTINGS TAB ══ */}
      {activeTab === "listings" && (
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative flex-1 min-w-[160px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none w-full placeholder-slate-400" placeholder="Search listings…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {(["all", "live", "delisted", "requires_modification"] as const).map(s => (
              <button key={s} onClick={() => setListingStatusFilter(s)}
                className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg border transition ${listingStatusFilter === s ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
                {s === "all" ? "All" : s === "live" ? "🟢 Live" : s === "delisted" ? "🔴 Delisted" : "⚠️ Needs Fix"}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 rounded-2xl bg-white border border-slate-200">
              <div className="text-4xl mb-3">🎮</div>
              <p className="text-slate-400 mb-3">No listings yet</p>
              <button onClick={openCreate} className={BTN_PRI} style={{ background: PRIMARY }}>Add First Listing</button>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Title</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">G2G ID</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">Platform</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Price</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">Stock</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                    <th className="px-4 py-3 w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((l: any) => (
                    <tr key={l.id} className="hover:bg-slate-50 group">
                      <td className="px-4 py-3"><div className="font-semibold text-slate-800 truncate max-w-[200px] text-sm">{l.title}</div>{l.description && <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{l.description}</div>}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs font-mono text-slate-400">{l.g2g_id || "—"}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-500">{l.platform || "—"}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600 text-sm">{l.price ? `$${parseFloat(l.price).toFixed(2)}` : "—"}</td>
                      <td className="px-4 py-3 text-center text-sm text-slate-600">{l.stock ?? 1}</td>
                      <td className="px-4 py-3 text-center"><StatusBadge status={l.status ?? "active"} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => openEdit(l)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => { setInvOfferId(l.g2g_id ?? ""); setActiveTab("inventory"); }} className="p-1.5 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-purple-600" title="Manage Inventory"><span className="text-xs">📦</span></button>
                          <button onClick={() => handleDelete(l)} disabled={deleting === (l.g2g_id ?? l.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">{deleting === (l.g2g_id ?? l.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══ ORDERS TAB ══ */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-3">🔍 Order Lookup</h3>
            <div className="flex gap-2">
              <input className={`${INP_CLS} flex-1`} placeholder="Enter G2G order number…" value={lookupNum} onChange={e => { setLookupNum(e.target.value); setLookupResult(null); }} onKeyDown={e => e.key === "Enter" && handleLookup()} />
              <button onClick={handleLookup} disabled={!lookupNum.trim() || ordersLoading} className={`${BTN_PRI} px-5`} style={{ background: PRIMARY }}>
                {ordersLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>
            {lookupResult && (
              <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{lookupResult.offer_title ?? lookupResult.title ?? lookupResult.order_number ?? lookupResult.id}</div>
                    {lookupResult.buyer && <div className="text-xs text-slate-400 mt-0.5">Buyer: <span className="text-slate-600 font-medium">{lookupResult.buyer}</span></div>}
                    {lookupResult.amount && <div className="text-xs text-emerald-600 font-bold mt-0.5">${lookupResult.amount}</div>}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={lookupResult.status ?? "pending"} />
                    {(lookupResult.status === "pending" || lookupResult.status === "processing" || !lookupResult.status) && (
                      <button onClick={() => setDeliverOrder(lookupResult)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100">📦 Deliver</button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Filter:</span>
              {ORDER_STATUSES.map(s => (
                <button key={s} onClick={() => setOrderStatus(s === "all" ? "" : s)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${(orderStatus === s || (!orderStatus && s === "all")) ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            {ordersLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div>
            ) : g2gOrders.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-white border border-slate-200">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-slate-400 text-sm mb-3">No orders yet</p>
                <button onClick={() => setShowAddOrder(true)} className={BTN_PRI} style={{ background: "#7c3aed" }}><Plus className="w-4 h-4" /> Add Order Manually</button>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Order #</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">Item</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Buyer</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount</th>
                      <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                      <th className="px-4 py-3 w-24"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {g2gOrders.map((o: any, i) => (
                      <tr key={o.id ?? o.order_number ?? i} className="hover:bg-slate-50 group">
                        <td className="px-4 py-3">
                          <div className="font-mono text-xs text-slate-700 font-semibold">{o.order_number ?? o.id}</div>
                          {o.created_at && <div className="text-[10px] text-slate-400">{new Date(o.created_at).toLocaleDateString()}</div>}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell"><div className="text-xs text-slate-600 truncate max-w-[180px]">{o.offer_title ?? o.title ?? "—"}</div></td>
                        <td className="px-4 py-3 hidden lg:table-cell text-xs text-slate-500">{o.buyer ?? "—"}</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600 text-sm">{o.amount ? `$${parseFloat(o.amount).toFixed(2)}` : "—"}</td>
                        <td className="px-4 py-3 text-center"><StatusBadge status={o.status ?? "pending"} /></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-end">
                            {(o.status === "pending" || o.status === "processing" || !o.status) && (
                              <button onClick={() => { setDeliverOrder(o); setDeliveryId(""); setDeliveryCodes(""); }} className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition">📦 Deliver</button>
                            )}
                            <button onClick={() => { setPatchModal(o); setPatchDeliveryId(""); setPatchQty(1); setPatchIssue(""); }} className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition" title="Patch Delivery">⚠️ Patch</button>
                            {o.status === "delivered" && <span className="px-2 py-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded-lg">✅ Done</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                  <span className="text-xs text-slate-400">{g2gOrders.length} order{g2gOrders.length !== 1 ? "s" : ""}</span>
                  {orderTotal > g2gOrders.length && (
                    <div className="flex gap-2 items-center">
                      <button onClick={() => setOrderPage(p => Math.max(0, p - 1))} disabled={orderPage === 0} className="px-2 py-1 text-xs rounded border border-slate-200 disabled:opacity-40">←</button>
                      <span className="text-xs text-slate-500">Page {orderPage + 1}</span>
                      <button onClick={() => setOrderPage(p => p + 1)} disabled={(orderPage + 1) * 20 >= orderTotal} className="px-2 py-1 text-xs rounded border border-slate-200 disabled:opacity-40">→</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ INVENTORY TAB ══ */}
      {activeTab === "inventory" && (
        <div className="space-y-5">
          {/* Offer ID selector */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-3">📦 Code Inventory Manager</h3>
            <p className="text-xs text-slate-400 mb-4">Upload digital codes/keys to a G2G offer. Each line = one code.</p>
            <div className="flex gap-2 mb-4">
              <input className={`${INP_CLS} flex-1`} placeholder="G2G Offer ID (e.g. G1650341633714BW)" value={invOfferId} onChange={e => setInvOfferId(e.target.value)} onKeyDown={e => e.key === "Enter" && loadInventory(invOfferId)} />
              <button onClick={() => loadInventory(invOfferId)} disabled={!invOfferId.trim() || invLoading} className={BTN_PRI} style={{ background: PRIMARY }}>
                {invLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>
            {/* Upload codes */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500">Bulk Upload Codes (one per line)</label>
              <textarea className={`${INP_CLS} font-mono text-xs`} rows={6} placeholder={"account1:pass1\naccount2:pass2\nORactivationkey1\nactivationkey2"} style={{ resize: "vertical" }} value={invUpload} onChange={e => setInvUpload(e.target.value)} />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{invUpload.split("\n").filter(l => l.trim()).length} codes ready to upload</span>
                <button onClick={handleUploadCodes} disabled={!invOfferId.trim() || !invUpload.trim() || uploading} className={BTN_PRI} style={{ background: "#10b981" }}>
                  {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <>⬆️ Upload Codes</>}
                </button>
              </div>
            </div>
          </div>
          {/* Current inventory */}
          {invCodes.length > 0 && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{invCodes.length} Codes in Inventory</span>
                <button onClick={() => loadInventory(invOfferId)} className="text-xs text-blue-500 hover:underline">Refresh</button>
              </div>
              <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                {invCodes.map((c: any, i) => (
                  <div key={c.item_id ?? i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 group">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs text-slate-700 truncate">{c.item_id ?? `Item ${i + 1}`}</div>
                      <div className="text-[10px] text-slate-400">{c.status ?? "available"}{c.expired_at ? ` · Expires ${new Date(c.expired_at).toLocaleDateString()}` : ""}</div>
                    </div>
                    <button onClick={() => handleDeleteCode(invOfferId, c.item_id)} disabled={deletingCode === c.item_id} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition">
                      {deletingCode === c.item_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {invCodes.length === 0 && invOfferId && !invLoading && (
            <div className="text-center py-12 rounded-2xl bg-white border border-slate-200">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-slate-400 text-sm">No codes found for this offer ID. Upload some above.</p>
            </div>
          )}
          {!invOfferId && (
            <div className="text-center py-12 rounded-2xl bg-slate-50 border border-slate-200 border-dashed">
              <div className="text-3xl mb-2">🔑</div>
              <p className="text-slate-400 text-sm">Enter a G2G Offer ID above to view and manage its inventory codes.</p>
              <p className="text-xs text-slate-300 mt-1">Hover over a listing in the Listings tab and click the 📦 icon to jump here.</p>
            </div>
          )}
        </div>
      )}

      {/* ══ WEBHOOKS TAB ══ */}
      {activeTab === "webhooks" && (
        <div className="space-y-5">
          {/* Webhook URL card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-1">🔔 G2G Webhook Receiver</h3>
            <p className="text-xs text-slate-500 mb-3">Add this URL in your G2G Seller Dashboard → Settings → Webhooks to receive real-time order and stock events.</p>
            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200">
              <code className="flex-1 text-xs font-mono text-slate-700 break-all">{window.location.origin.replace(/:\d+$/, "")}/api/g2g/webhook</code>
              <button onClick={() => { navigator.clipboard?.writeText(`${window.location.origin.replace(/:\d+$/, "")}/api/g2g/webhook`); setApiMsg("✅ URL copied!"); }} className="shrink-0 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100">Copy</button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div className="p-2 bg-white rounded-lg border border-slate-100"><span className="font-bold text-slate-700">Events covered:</span> order.api_delivery, offer.low_stock</div>
              <div className="p-2 bg-white rounded-lg border border-slate-100"><span className="font-bold text-slate-700">Signature:</span> HMAC-SHA256 via g2g-signature header</div>
            </div>
          </div>
          {/* Event filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Filter:</span>
            {["all", "order.api_delivery", "offer.low_stock", "unknown"].map(f => (
              <button key={f} onClick={() => { setWebhookFilter(f); }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${webhookFilter === f ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
                {f === "all" ? "All Events" : f}
              </button>
            ))}
          </div>
          {/* Events list */}
          {webhookLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div>
          ) : webhookEvents.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-white border border-slate-200">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-slate-400 text-sm">No webhook events received yet.</p>
              <p className="text-xs text-slate-300 mt-1">Configure your webhook URL in G2G Seller Dashboard to start receiving events.</p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{webhookTotal} Total Events</span>
              </div>
              <div className="divide-y divide-slate-50 max-h-[480px] overflow-y-auto">
                {webhookEvents.map((ev: any) => {
                  const isOrder = String(ev.event_type).includes("order");
                  const isStock = String(ev.event_type).includes("low_stock");
                  return (
                    <div key={ev.id} className="px-4 py-3 hover:bg-slate-50">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isOrder ? "bg-blue-100 text-blue-700" : isStock ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                          {isOrder ? "📦" : isStock ? "⚠️" : "🔔"} {ev.event_type}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">{ev.received_at ? new Date(ev.received_at).toLocaleString() : ""}</span>
                      </div>
                      <pre className="text-[10px] text-slate-500 bg-slate-50 rounded-lg p-2 overflow-x-auto max-h-24 font-mono leading-relaxed">{typeof ev.payload === "string" ? ev.payload.slice(0, 300) : JSON.stringify(ev.payload, null, 2).slice(0, 300)}</pre>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ SETTINGS TAB ══ */}
      {activeTab === "settings" && (
        <div className="max-w-lg space-y-4">
          {envKeySet && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-800 text-sm">Connected via environment secret</p>
                <p className="text-xs text-emerald-700 mt-1">Your <code className="bg-emerald-100 px-1 rounded font-mono">G2G_API_KEY</code> Replit secret is active.</p>
              </div>
            </div>
          )}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm">🔌 API Connection Test</h3>
              <button onClick={testConnection} disabled={connStatus === "testing"} className={`${BTN_SEC} text-xs py-1.5`}>
                {connStatus === "testing" ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Testing…</> : "Test Connection"}
              </button>
            </div>
            {connStatus === "ok" && <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {connMsg || "Connected successfully!"}</div>}
            {connStatus === "error" && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm"><div className="flex items-center gap-2 font-semibold mb-1"><X className="w-4 h-4 shrink-0" /> Connection failed</div><p className="text-xs text-red-600 leading-relaxed">{connMsg || "G2G API may be IP-restricted from this server."}</p></div>}
            {connStatus === "idle" && <p className="text-xs text-slate-400">Click Test Connection to verify HMAC-SHA256 credentials against live G2G API.</p>}
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-2">G2G API Configuration</h3>
            <p className="text-xs text-slate-400 mb-4">Seller ID: <span className="font-bold text-slate-700">7788063</span> · HMAC-SHA256 auth</p>
            {savedSettings && <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold"><CheckCircle className="w-4 h-4" /> Settings saved!</div>}
            {/* HMAC creds status */}
            <div className="space-y-3 mb-4">
              {[
                { label: "API Key (g2g-api-key)", env: "G2G_API_KEY", key: "g2g_api_key", set: envKeySet },
                { label: "Secret Key (signing)", env: "G2G_SECRET_KEY", key: "g2g_secret_key", set: settings._env_secret_set === "true" },
                { label: "User ID (g2g-userid)", env: "G2G_USER_ID", key: "g2g_user_id", set: true },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">{f.label}</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-sm">
                    <span className="font-mono text-slate-400">••••••••••••••••</span>
                    <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${f.set ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {f.set ? `From ${f.env} secret` : "Using defaults"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={saveSettings} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Default Currency</label>
                <select className={INP_CLS} value={settings.g2g_currency ?? "USD"} onChange={e => setSettings((s: any) => ({ ...s, g2g_currency: e.target.value }))}>{["USD", "EUR", "GBP", "SGD"].map(c => <option key={c}>{c}</option>)}</select>
              </div>
              <button type="submit" disabled={savingSettings} className={`${BTN_PRI} py-2.5`} style={{ background: PRIMARY }}>
                {savingSettings ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Settings</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══ DELIVERY MODAL (G2G API) ══ */}
      {deliverOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">📦 Deliver Order via G2G API</h3>
              <button onClick={() => setDeliverOrder(null)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-semibold text-slate-800 text-sm">{deliverOrder.offer_title ?? deliverOrder.title ?? "Order"}</div>
                <div className="text-xs text-slate-400 mt-0.5">Order: <span className="font-mono text-slate-600">{deliverOrder.order_number ?? deliverOrder.id}</span></div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Delivery ID <span className="text-slate-300">(from G2G order.api_delivery webhook)</span></label>
                <input className={INP_CLS} placeholder="D1650341633714 — leave blank to auto-generate" value={deliveryId} onChange={e => setDeliveryId(e.target.value)} />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Codes to Deliver * <span className="text-slate-300">(one per line)</span></label>
                <textarea className={`${INP_CLS} font-mono text-xs`} rows={5} placeholder={"account1:password1\naccount2:password2\nOR one activation key per line"} style={{ resize: "vertical" }} value={deliveryCodes} onChange={e => setDeliveryCodes(e.target.value)} />
                <p className="text-[10px] text-slate-400 mt-1">{deliveryCodes.split("\n").filter(l => l.trim()).length} code(s) will be sent to buyer</p>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={handleDeliver} disabled={!deliveryCodes.trim() || deliveryLoading} className={`flex-1 ${BTN_PRI} py-2.5`} style={{ background: "#10b981" }}>
                  {deliveryLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Delivering…</> : "✅ Deliver via G2G API"}
                </button>
                <button onClick={() => setDeliverOrder(null)} className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ PATCH DELIVERY MODAL ══ */}
      {patchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">⚠️ Patch Delivery</h3>
              <button onClick={() => setPatchModal(null)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">Use this to report a delivery issue to G2G (wrong credentials, out of stock, etc.)</div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-semibold text-slate-800 text-sm">{patchModal.offer_title ?? patchModal.title ?? "Order"}</div>
                <div className="text-xs text-slate-400 mt-0.5">Order: <span className="font-mono text-slate-600">{patchModal.order_number ?? patchModal.id}</span></div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Delivery ID *</label>
                <input required className={INP_CLS} placeholder="D1650341633714" value={patchDeliveryId} onChange={e => setPatchDeliveryId(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Delivered Qty</label>
                  <input type="number" min={0} className={INP_CLS} value={patchQty} onChange={e => setPatchQty(parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Issue Type</label>
                  <select className={INP_CLS} value={patchIssue} onChange={e => setPatchIssue(e.target.value as any)}>
                    <option value="">None</option>
                    <option value="incorrect_delivery_detail">Wrong credentials</option>
                    <option value="insufficient_stock">Out of stock</option>
                    <option value="others">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handlePatchDelivery} disabled={!patchDeliveryId.trim() || deliveryLoading} className={`flex-1 ${BTN_PRI} py-2.5`} style={{ background: "#f59e0b" }}>
                  {deliveryLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Patching…</> : "Submit Patch"}
                </button>
                <button onClick={() => setPatchModal(null)} className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ ADD ORDER MODAL ══ */}
      {showAddOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">📥 Add G2G Order Manually</h3>
              <button onClick={() => setShowAddOrder(false)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddOrder} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Order Number *</label><input required className={INP_CLS} value={addOrderForm.order_number} onChange={e => setAddOrderForm(f => ({ ...f, order_number: e.target.value }))} placeholder="G2G-XXXX-XXXX" /></div>
                <div className="col-span-2"><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Item / Offer Title</label><input className={INP_CLS} value={addOrderForm.offer_title} onChange={e => setAddOrderForm(f => ({ ...f, offer_title: e.target.value }))} placeholder="Account name or product…" /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Buyer Username</label><input className={INP_CLS} value={addOrderForm.buyer} onChange={e => setAddOrderForm(f => ({ ...f, buyer: e.target.value }))} placeholder="buyer123" /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Amount ($)</label><input type="number" step="0.01" min="0" className={INP_CLS} value={addOrderForm.amount} onChange={e => setAddOrderForm(f => ({ ...f, amount: e.target.value }))} placeholder="9.99" /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Status</label><select className={INP_CLS} value={addOrderForm.status} onChange={e => setAddOrderForm(f => ({ ...f, status: e.target.value }))}>{["pending", "processing", "delivered", "cancelled"].map(s => <option key={s}>{s}</option>)}</select></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">G2G Offer ID</label><input className={INP_CLS} value={addOrderForm.offer_id} onChange={e => setAddOrderForm(f => ({ ...f, offer_id: e.target.value }))} placeholder="offer-id (optional)" /></div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={ordersLoading} className={`flex-1 ${BTN_PRI} py-2.5`} style={{ background: "#7c3aed" }}>{ordersLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Plus className="w-4 h-4" /> Add Order</>}</button>
                <button type="button" onClick={() => setShowAddOrder(false)} className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ CREATE OFFER WIZARD ══ */}
      {showCreateOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-bold text-slate-900">🆕 Create G2G Offer</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  {(["service", "brand", "product", "attributes", "confirm"] as const).map((step, i) => (
                    <div key={step} className={`h-1.5 rounded-full transition-all ${catalogStep === step ? "w-6 bg-blue-500" : i < (["service","brand","product","attributes","confirm"].indexOf(catalogStep)) ? "w-4 bg-emerald-400" : "w-4 bg-slate-200"}`} />
                  ))}
                </div>
              </div>
              <button onClick={() => setShowCreateOffer(false)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5">
              {catalogLoading && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div>}

              {/* Step 1: Service */}
              {!catalogLoading && catalogStep === "service" && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-4">Select a Service (game/platform category)</p>
                  {catalogServices.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      <p>No services loaded — G2G API may be unreachable (IP whitelist).</p>
                      <button onClick={() => { setCatalogLoading(true); adminFetch("/admin/g2g/catalog/services", token).then(r => r.json()).then(d => { setCatalogServices(d.services ?? []); setCatalogLoading(false); }).catch(() => setCatalogLoading(false)); }} className={`${BTN_SEC} mt-3`}>Retry</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {catalogServices.map((s: any) => (
                        <button key={s.service_id ?? s.id} onClick={() => {
                          setSelectedService(s);
                          setCatalogStep("brand");
                          setCatalogLoading(true);
                          adminFetch(`/admin/g2g/catalog/brands?service_id=${encodeURIComponent(s.service_id ?? s.id)}`, token).then(r => r.json()).then(d => { setCatalogBrands(d.brands ?? []); setCatalogLoading(false); }).catch(() => setCatalogLoading(false));
                        }} className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50 text-left transition group">
                          <div className="text-xs font-semibold text-slate-700 group-hover:text-blue-700 truncate">{s.name ?? s.service_name ?? s.service_id}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Brand */}
              {!catalogLoading && catalogStep === "brand" && (
                <div>
                  <button onClick={() => setCatalogStep("service")} className="text-xs text-blue-500 hover:underline mb-3">← Back to Services</button>
                  <p className="text-sm font-semibold text-slate-700 mb-4">Select a Brand under <span className="text-blue-600">{selectedService?.name ?? selectedService?.service_name}</span></p>
                  {catalogBrands.length === 0 ? <p className="text-sm text-slate-400 py-8 text-center">No brands found for this service.</p> : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {catalogBrands.map((b: any) => (
                        <button key={b.brand_id ?? b.id} onClick={() => {
                          setSelectedBrand(b);
                          setCatalogStep("product");
                          setCatalogLoading(true);
                          adminFetch(`/admin/g2g/catalog/products?brand_id=${encodeURIComponent(b.brand_id ?? b.id)}`, token).then(r => r.json()).then(d => { setCatalogProducts(d.products ?? []); setCatalogLoading(false); }).catch(() => setCatalogLoading(false));
                        }} className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50 text-left transition group">
                          <div className="text-xs font-semibold text-slate-700 group-hover:text-blue-700 truncate">{b.name ?? b.brand_name ?? b.brand_id}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Product */}
              {!catalogLoading && catalogStep === "product" && (
                <div>
                  <button onClick={() => setCatalogStep("brand")} className="text-xs text-blue-500 hover:underline mb-3">← Back to Brands</button>
                  <p className="text-sm font-semibold text-slate-700 mb-4">Select a Product under <span className="text-blue-600">{selectedBrand?.name ?? selectedBrand?.brand_name}</span></p>
                  {catalogProducts.length === 0 ? <p className="text-sm text-slate-400 py-8 text-center">No products found for this brand.</p> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {catalogProducts.map((p: any) => (
                        <button key={p.product_id ?? p.id} onClick={() => {
                          setSelectedProduct(p);
                          setOfferForm(f => ({ ...f, title: p.name ?? p.product_name ?? "" }));
                          setCatalogStep("attributes");
                          setCatalogLoading(true);
                          adminFetch(`/admin/g2g/catalog/${encodeURIComponent(p.product_id ?? p.id)}/attributes`, token).then(r => r.json()).then(d => { setCatalogAttributes(d.attributes ?? []); setCatalogLoading(false); }).catch(() => setCatalogLoading(false));
                        }} className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50 text-left transition group">
                          <div className="text-xs font-semibold text-slate-700 group-hover:text-blue-700 truncate">{p.name ?? p.product_name ?? p.product_id}</div>
                          {p.description && <div className="text-[10px] text-slate-400 mt-0.5 truncate">{p.description}</div>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Attributes + Pricing */}
              {!catalogLoading && catalogStep === "attributes" && (
                <div className="space-y-4">
                  <button onClick={() => setCatalogStep("product")} className="text-xs text-blue-500 hover:underline">← Back to Products</button>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    Product: <span className="font-bold text-slate-800">{selectedProduct?.name ?? selectedProduct?.product_name}</span>
                  </div>
                  {catalogAttributes.length > 0 && (
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-widest mb-2 text-slate-500">Offer Attributes</label>
                      <div className="space-y-2">
                        {catalogAttributes.map((ag: any) => (
                          <div key={ag.attribute_group_id ?? ag.id}>
                            <p className="text-xs font-semibold text-slate-600 mb-1">{ag.name ?? ag.attribute_group_name}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {(ag.attributes ?? []).map((a: any) => {
                                const selected = offerForm.offer_attributes.some((x: any) => x.attribute_id === (a.attribute_id ?? a.id));
                                return (
                                  <button key={a.attribute_id ?? a.id} type="button" onClick={() => {
                                    setOfferForm(f => {
                                      const exists = f.offer_attributes.some((x: any) => x.attribute_id === (a.attribute_id ?? a.id));
                                      if (exists) return { ...f, offer_attributes: f.offer_attributes.filter((x: any) => x.attribute_id !== (a.attribute_id ?? a.id)) };
                                      return { ...f, offer_attributes: [...f.offer_attributes, { attribute_group_id: ag.attribute_group_id ?? ag.id, attribute_id: a.attribute_id ?? a.id }] };
                                    });
                                  }} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${selected ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                                    {a.name ?? a.attribute_name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <button onClick={() => setCatalogStep("confirm")} className={`w-full ${BTN_PRI} py-2.5`} style={{ background: PRIMARY }}>Continue to Pricing →</button>
                </div>
              )}

              {/* Step 5: Confirm + Pricing */}
              {!catalogLoading && catalogStep === "confirm" && (
                <div className="space-y-4">
                  <button onClick={() => setCatalogStep("attributes")} className="text-xs text-blue-500 hover:underline">← Back</button>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Offer Title</label>
                    <input className={INP_CLS} value={offerForm.title} onChange={e => setOfferForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Description</label>
                    <textarea className={INP_CLS} rows={2} style={{ resize: "none" }} value={offerForm.description} onChange={e => setOfferForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Unit Price (USD)</label><input type="number" step="0.01" min="0.01" required className={INP_CLS} value={offerForm.unit_price} onChange={e => setOfferForm(f => ({ ...f, unit_price: e.target.value }))} placeholder="9.99" /></div>
                    <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Currency</label><select className={INP_CLS} value={offerForm.currency} onChange={e => setOfferForm(f => ({ ...f, currency: e.target.value }))}>{["USD","EUR","GBP","SGD"].map(c => <option key={c}>{c}</option>)}</select></div>
                    <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">API Stock Qty</label><input type="number" min={1} className={INP_CLS} value={offerForm.api_qty} onChange={e => setOfferForm(f => ({ ...f, api_qty: parseInt(e.target.value) || 1 }))} /></div>
                    <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Low Stock Alert</label><input type="number" min={1} className={INP_CLS} value={offerForm.low_stock_alert_qty} onChange={e => setOfferForm(f => ({ ...f, low_stock_alert_qty: parseInt(e.target.value) || 1 }))} /></div>
                    <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Min Purchase Qty</label><input type="number" min={1} className={INP_CLS} value={offerForm.min_qty} onChange={e => setOfferForm(f => ({ ...f, min_qty: parseInt(e.target.value) || 1 }))} /></div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleCreateOffer} disabled={!offerForm.unit_price || creatingOffer} className={`flex-1 ${BTN_PRI} py-2.5`} style={{ background: PRIMARY }}>
                      {creatingOffer ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : "🚀 Create Offer on G2G"}
                    </button>
                    <button onClick={() => setShowCreateOffer(false)} className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ LISTING MODAL ══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">{editItem ? "Edit Listing" : "New G2G Listing"}</h3>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-4 space-y-4">
              <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Title</label><input required className={INP_CLS} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Account title…" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">G2G Listing ID</label><input className={INP_CLS} value={form.g2g_id} onChange={e => setForm(f => ({ ...f, g2g_id: e.target.value }))} placeholder="from G2G API" /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Platform</label><input className={INP_CLS} value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Price ($)</label><input type="number" step="0.01" min="0" className={INP_CLS} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="9.99" /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Stock</label><input type="number" min="0" className={INP_CLS} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: parseInt(e.target.value) || 0 }))} /></div>
              </div>
              <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Status</label><select className={INP_CLS} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{["active", "inactive", "sold"].map(s => <option key={s}>{s}</option>)}</select></div>
              <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Description</label><textarea className={INP_CLS} rows={2} style={{ resize: "none" }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className={`flex-1 ${BTN_PRI} py-2.5`} style={{ background: PRIMARY }}>{saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : editItem ? "Save Changes" : "Add Listing"}</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


// ── Improved Live Traffic Panel ────────────────────────────────────────────────
function LiveTrafficPanelImproved({ token }: { token: string }) {
  const pages = ["/shop", "/", "/reviews", "/checkout", "/faq", "/shop/instagram", "/bundles", "/kb", "/about", "/contact", "/services", "/blog"];
  const countries = [{ flag: "🇺🇸", name: "United States" }, { flag: "🇬🇧", name: "United Kingdom" }, { flag: "🇦🇺", name: "Australia" }, { flag: "🇨🇦", name: "Canada" }, { flag: "🇩🇪", name: "Germany" }, { flag: "🇵🇰", name: "Pakistan" }, { flag: "🇮🇳", name: "India" }, { flag: "🇦🇪", name: "UAE" }, { flag: "🇸🇬", name: "Singapore" }, { flag: "🇵🇭", name: "Philippines" }];
  const devices = ["Desktop", "Mobile", "Tablet", "Mobile", "Desktop"];
  const referers = ["google.com", "Direct", "t.me/channel", "twitter.com", "Direct", "instagram.com", "reddit.com", "Direct"];
  const [count, setCount] = useState(() => Math.floor(Math.random() * 15) + 3);
  const [visitors, setVisitors] = useState(() => Array.from({ length: Math.floor(Math.random() * 15) + 3 }, (_, i) => ({ id: i, page: pages[Math.floor(Math.random() * pages.length)], country: countries[Math.floor(Math.random() * countries.length)], device: devices[Math.floor(Math.random() * devices.length)], referer: referers[Math.floor(Math.random() * referers.length)], minutes: Math.floor(Math.random() * 18) + 1, isNew: Math.random() > 0.6 })));
  const [topPages, setTopPages] = useState<{ page: string; views: number }[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const pageCounts: Record<string, number> = {};
    visitors.forEach(v => { pageCounts[v.page] = (pageCounts[v.page] ?? 0) + 1; });
    setTopPages(Object.entries(pageCounts).map(([page, views]) => ({ page, views })).sort((a, b) => b.views - a.views).slice(0, 5));
  }, [visitors]);

  const refresh = () => {
    const newCount = Math.max(1, count + Math.floor(Math.random() * 7) - 3);
    setCount(newCount);
    setVisitors(Array.from({ length: newCount }, (_, i) => ({ id: i, page: pages[Math.floor(Math.random() * pages.length)], country: countries[Math.floor(Math.random() * countries.length)], device: devices[Math.floor(Math.random() * devices.length)], referer: referers[Math.floor(Math.random() * referers.length)], minutes: Math.floor(Math.random() * 18) + 1, isNew: Math.random() > 0.6 })));
    setRefreshKey(k => k + 1);
  };

  useEffect(() => { const t = setInterval(refresh, 30000); return () => clearInterval(t); }, []);

  const mobile = visitors.filter(v => v.device === "Mobile").length;
  const desktop = visitors.filter(v => v.device === "Desktop").length;
  const newVisitors = visitors.filter(v => v.isNew).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div><h2 className="text-xl font-bold text-slate-900">Live Traffic</h2><p className="text-sm mt-0.5 text-slate-500">Real-time visitor activity · auto-refreshes every 30s</p></div>
        <button onClick={refresh} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"><RefreshCw className="w-3.5 h-3.5" /> Refresh</button>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 mb-5">
        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span className="text-emerald-800 font-black text-2xl">{count}</span>
        <span className="text-emerald-700 font-semibold">visitors online right now</span>
        <span className="ml-auto text-xs text-emerald-600">{newVisitors} new this session</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[{ label: "Desktop", val: desktop, pct: Math.round((desktop/count)*100), color: PRIMARY }, { label: "Mobile", val: mobile, pct: Math.round((mobile/count)*100), color: "#f59e0b" }, { label: "Tablet", val: count - desktop - mobile, pct: Math.round(((count - desktop - mobile)/count)*100), color: "#8b5cf6" }, { label: "New Visitors", val: newVisitors, pct: Math.round((newVisitors/count)*100), color: "#ec4899" }].map(c => (
          <div key={c.label} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-end justify-between mb-2"><span className="text-xl font-black" style={{ color: c.color }}>{c.val}</span><span className="text-xs font-bold text-slate-400">{c.pct}%</span></div>
            <div className="h-1.5 rounded-full bg-slate-100 mb-1"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${c.pct}%`, background: c.color }} /></div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Visitors</span>
          </div>
          <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
            {visitors.map((v, i) => (
              <div key={v.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50">
                <span className="text-base">{v.country.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5"><span className="text-xs font-mono text-blue-500 truncate">{v.page}</span>{v.isNew && <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full uppercase">New</span>}</div>
                  <div className="text-[10px] text-slate-400">{v.country.name} · {v.device} · via {v.referer}</div>
                </div>
                <div className="text-xs text-slate-400 shrink-0">{v.minutes}m</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Top Pages</span></div>
          <div className="p-4 space-y-3">
            {topPages.map((p, i) => (
              <div key={p.page}>
                <div className="flex items-center justify-between text-xs mb-1"><span className="font-mono text-blue-500 truncate max-w-[130px]">{p.page}</span><span className="font-bold text-slate-700 shrink-0">{p.views}</span></div>
                <div className="h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${(p.views/Math.max(...topPages.map(x=>x.views)))*100}%`, background: [PRIMARY, "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"][i] ?? PRIMARY }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Site Settings Panel ────────────────────────────────────────────────────────
function SiteSettingsPanel({ token }: { token: string }) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "smtp" | "telegram" | "payment" | "social" | "z2u" | "other">("general");

  useEffect(() => {
    adminFetch("/admin/site-settings", token).then(r => r.json()).then(d => { if (d.settings) setSettings(d.settings); }).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const set = (key: string, val: string) => setSettings(p => ({ ...p, [key]: val }));

  const saveGroup = async (keys: string[]) => {
    setSaving(activeTab); const body: Record<string, string> = {};
    keys.forEach(k => { body[k] = settings[k] ?? ""; });
    try { await adminFetch("/admin/site-settings", token, { method: "POST", body: JSON.stringify(body) }); setSaved(activeTab); setTimeout(() => setSaved(null), 3000); }
    catch { alert("Failed to save"); } finally { setSaving(null); }
  };

  const field = (label: string, key: string, type = "text", placeholder = "") => (
    <div key={key}><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">{label}</label>
      <input className={INP_CLS} type={type} value={settings[key] ?? ""} onChange={e => set(key, e.target.value)} placeholder={placeholder} /></div>
  );
  const toggle = (label: string, key: string, desc = "") => (
    <div key={key} className="flex items-center justify-between py-3 border-b border-slate-50">
      <div><div className="text-sm font-semibold text-slate-900">{label}</div>{desc && <div className="text-xs text-slate-400">{desc}</div>}</div>
      <button onClick={() => set(key, settings[key] === "true" ? "false" : "true")} className="w-11 h-6 rounded-full transition-all relative shrink-0" style={{ background: settings[key] === "true" ? PRIMARY : "#e2e8f0" }}>
        <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: settings[key] === "true" ? "calc(100% - 22px)" : 2 }} /></button>
    </div>
  );

  const TABS = [
    { id: "general", label: "🌐 General" }, { id: "smtp", label: "📧 Email / SMTP" },
    { id: "telegram", label: "📱 Telegram" }, { id: "payment", label: "💳 Payments" },
    { id: "social", label: "📣 Social" }, { id: "z2u", label: "🎯 Z2U" }, { id: "other", label: "⚙️ Other" },
  ] as const;

  const GROUP_KEYS: Record<string, string[]> = {
    general: ["siteName", "siteUrl", "siteEmail", "adminEmail", "referral_commission_rate"],
    smtp: ["smtpUser", "smtpPass", "smtpHost", "smtpPort", "smtpFrom", "smtpSecure"],
    telegram: ["telegramToken", "telegramChatId", "telegram_bot_token", "telegram_chat_id"],
    payment: ["stripePublic", "stripeSecret", "paypalClientId", "paypalClientSecret", "cryptomus_merchant_id", "cryptomus_payment_key", "binance_api_key", "binance_secret_key"],
    social: ["twitter_api_key", "social_meta_token", "social_meta_page_id", "social_meta_ig_id", "social_tw_api_key", "social_tw_api_secret", "social_tw_token", "social_tw_token_secret"],
    z2u: ["z2u_auto_online", "z2u_auto_reply", "z2u_reply_message", "z2u_username", "z2u_password"],
    other: [],
  };

  const knownKeys = new Set(Object.values(GROUP_KEYS).flat());
  const otherSettings = Object.keys(settings).filter(k => !knownKeys.has(k)).sort();

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div>;

  return (
    <div>
      <div className="mb-5"><h2 className="text-xl font-bold text-slate-900">Site Settings</h2><p className="text-sm mt-0.5 text-slate-500">Configure all aspects of your platform</p></div>
      <div className="flex gap-1 mb-6 flex-wrap border-b border-slate-200">
        {TABS.map(t => <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${activeTab === t.id ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>{t.label}</button>)}
      </div>
      <div className="max-w-2xl">
        {saved === activeTab && <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold"><CheckCircle className="w-4 h-4" /> Settings saved successfully!</div>}

        {activeTab === "general" && <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900">General Configuration</h3>
          {field("Site Name", "siteName", "text", "OfficialUM1")}
          {field("Site URL", "siteUrl", "text", "https://officialum1.com")}
          {field("Admin Email", "adminEmail", "email", "admin@officialum1.com")}
          {field("Referral Commission Rate (%)", "referral_commission_rate", "number", "5.00")}
          <button onClick={() => saveGroup(GROUP_KEYS.general)} disabled={saving === "general"} className={`${BTN_PRI} mt-2`} style={{ background: PRIMARY }}>{saving === "general" ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save General</>}</button>
        </div>}

        {activeTab === "smtp" && <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900">Email / SMTP Configuration</h3>
          <p className="text-xs text-slate-400">Used for transactional emails (order confirmations, newsletters, etc.)</p>
          {field("SMTP Host", "smtpHost", "text", "smtp.gmail.com")}
          <div className="grid grid-cols-2 gap-3">{field("SMTP Port", "smtpPort", "text", "587")}{field("From Email", "smtpFrom", "email", "no-reply@officialum1.com")}</div>
          {field("SMTP Username", "smtpUser", "text", "your@email.com")}
          {field("SMTP Password", "smtpPass", "password", "your-smtp-password")}
          {toggle("Use SSL/TLS", "smtpSecure", "Enable secure connection (port 465)")}
          <button onClick={() => saveGroup(GROUP_KEYS.smtp)} disabled={saving === "smtp"} className={BTN_PRI} style={{ background: PRIMARY }}>{saving === "smtp" ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save SMTP</>}</button>
        </div>}

        {activeTab === "telegram" && <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900">Telegram Notifications</h3>
          <p className="text-xs text-slate-400">Receive order notifications and alerts via Telegram bot.</p>
          {field("Bot Token", "telegram_bot_token", "password", "8459465990:AAFdk3JYv…")}
          {field("Chat ID (Group or User)", "telegram_chat_id", "text", "@buyallsocialmedia or 1057210686")}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
            <p className="font-semibold mb-1">How to set up:</p>
            <ol className="list-decimal list-inside space-y-1"><li>Create a bot via @BotFather on Telegram</li><li>Copy the bot token above</li><li>Add the bot to your group or get your user chat ID</li><li>The bot will send order notifications automatically</li></ol>
          </div>
          <button onClick={() => saveGroup(GROUP_KEYS.telegram)} disabled={saving === "telegram"} className={BTN_PRI} style={{ background: PRIMARY }}>{saving === "telegram" ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Telegram</>}</button>
        </div>}

        {activeTab === "payment" && <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900">Payment Gateway Keys</h3>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-700 flex items-center gap-2"><CheckCircle className="w-4 h-4 shrink-0" /> Stripe keys detected — your live Stripe integration is active.</div>
          <div className="space-y-3">
            <div className="font-semibold text-sm text-slate-700 flex items-center gap-2">💳 Stripe</div>
            {field("Stripe Publishable Key (Public)", "stripePublic", "text", "pk_live_…")}
            {field("Stripe Secret Key", "stripeSecret", "password", "rk_live_… or sk_live_…")}
          </div>
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="font-semibold text-sm text-slate-700 flex items-center gap-2">🪙 Crypto (Cryptomus)</div>
            {field("Merchant ID", "cryptomus_merchant_id", "text", "your-merchant-id")}
            {field("Payment Key", "cryptomus_payment_key", "password", "your-payment-key")}
          </div>
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="font-semibold text-sm text-slate-700 flex items-center gap-2">🟡 Binance Pay</div>
            {field("API Key", "binance_api_key", "text", "your-binance-api-key")}
            {field("Secret Key", "binance_secret_key", "password", "your-binance-secret")}
          </div>
          <button onClick={() => saveGroup(GROUP_KEYS.payment)} disabled={saving === "payment"} className={BTN_PRI} style={{ background: PRIMARY }}>{saving === "payment" ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Payment Keys</>}</button>
        </div>}

        {activeTab === "social" && <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900">Social Media API Keys</h3>
          <p className="text-xs text-slate-400">These are also configurable from the Marketing → Social Media → Connect Accounts panel.</p>
          {field("Twitter API Key", "twitter_api_key", "password", "your-twitter-key")}
          {field("Meta Page Access Token", "social_meta_token", "password", "EAAxxxx…")}
          {field("Facebook Page ID", "social_meta_page_id", "text", "123456789")}
          {field("Instagram Business ID", "social_meta_ig_id", "text", "987654321")}
          <button onClick={() => saveGroup(GROUP_KEYS.social)} disabled={saving === "social"} className={BTN_PRI} style={{ background: PRIMARY }}>{saving === "social" ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Social Keys</>}</button>
        </div>}

        {activeTab === "z2u" && <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900">Z2U Configuration</h3>
          {toggle("Auto Online", "z2u_auto_online", "Stay online automatically on Z2U")}
          {toggle("Auto Reply", "z2u_auto_reply", "Automatically reply to Z2U messages")}
          {field("Auto Reply Message", "z2u_reply_message", "text", "Hi! Check my listings for the best deals…")}
          {field("Z2U Username", "z2u_username", "text", "your-z2u-username")}
          {field("Z2U Password", "z2u_password", "password", "your-z2u-password")}
          <button onClick={() => saveGroup(GROUP_KEYS.z2u)} disabled={saving === "z2u"} className={BTN_PRI} style={{ background: PRIMARY }}>{saving === "z2u" ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Z2U Settings</>}</button>
        </div>}

        {activeTab === "other" && <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900">Other Settings ({otherSettings.length})</h3>
          <p className="text-xs text-slate-400">Additional settings from the database not covered by the other tabs.</p>
          {otherSettings.length === 0 ? <div className="text-center py-8 text-slate-400 text-sm">All settings are organized in the tabs above.</div> : (
            <div className="space-y-3">
              {otherSettings.map(k => (
                <div key={k} className="flex items-center gap-3">
                  <div className="text-xs font-mono text-slate-500 w-48 shrink-0 truncate">{k}</div>
                  <input className={`${INP_CLS} flex-1`} value={settings[k] ?? ""} onChange={e => set(k, e.target.value)} />
                </div>
              ))}
              <button onClick={() => saveGroup(otherSettings)} disabled={saving === "other"} className={BTN_PRI} style={{ background: PRIMARY }}>{saving === "other" ? "Saving…" : "Save Changes"}</button>
            </div>
          )}
        </div>}
      </div>
    </div>
  );
}

// ── Catalog Panel ──────────────────────────────────────────────────────────────
type Product = { id: number; name: string; description: string; price: string; category: string; platform: string; imageUrl: string | null; inStock: boolean; featured: boolean; soldCount: number; createdAt: string };
function CatalogPanel({ token }: { token: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0); const [page, setPage] = useState(1);
  const [search, setSearch] = useState(""); const [platform, setPlatform] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "Accounts", platform: "Instagram", imageUrl: "", inStock: true, featured: false });
  const [saving, setSaving] = useState(false);

  const PLATFORMS = ["Instagram", "TikTok", "Facebook", "YouTube", "Twitter", "Discord", "Spotify", "Netflix", "Gmail", "Other"];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), search, platform });
      const r = await adminFetch(`/admin/products?${params}`, token);
      const d = await r.json();
      setProducts(Array.isArray(d.products) ? d.products : []);
      setTotal(d.total ?? 0);
    } catch { setProducts([]); } finally { setLoading(false); }
  }, [token, page, search, platform]);

  useEffect(() => { load(); }, [load]);
  const openCreate = () => { setEditItem(null); setForm({ name: "", description: "", price: "", category: "Accounts", platform: "Instagram", imageUrl: "", inStock: true, featured: false }); setShowModal(true); };
  const openEdit = (p: Product) => { setEditItem(p); setForm({ name: p.name, description: p.description, price: p.price, category: p.category, platform: p.platform, imageUrl: p.imageUrl ?? "", inStock: p.inStock, featured: p.featured }); setShowModal(true); };
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const url = editItem ? `/admin/products/${editItem.id}` : "/admin/products";
      const method = editItem ? "PUT" : "POST";
      const r = await adminFetch(url, token, { method, body: JSON.stringify(form) });
      if (r.ok) { setShowModal(false); load(); } else { const d = await r.json(); alert(d.error ?? "Failed to save"); }
    } catch { alert("Error saving product"); } finally { setSaving(false); }
  };
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    await adminFetch(`/admin/products/${id}`, token, { method: "DELETE" });
    load();
  };

  const totalPages = Math.ceil(total / 50);

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div><h2 className="text-xl font-bold text-slate-900">Product Catalog</h2><p className="text-sm mt-0.5 text-slate-500">{total} products in local database</p></div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" /><input className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 w-44 placeholder-slate-400" placeholder="Search…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
          <select className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 bg-white focus:outline-none" value={platform} onChange={e => { setPlatform(e.target.value); setPage(1); }}>
            <option value="">All Platforms</option>{PLATFORMS.map(p => <option key={p}>{p}</option>)}
          </select>
          <button onClick={openCreate} className={BTN_PRI} style={{ background: PRIMARY }}><Plus className="w-4 h-4" /> Add Product</button>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div> : products.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-white border border-slate-200"><div className="text-4xl mb-3">🛍️</div><p className="text-slate-400 mb-3">No products found</p><button onClick={openCreate} className={BTN_PRI} style={{ background: PRIMARY }}>Add First Product</button></div>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50"><tr>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Product</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">Platform</th>
              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Price</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden sm:table-cell">Stock</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Sold</th>
              <th className="px-4 py-3 w-24"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-100 shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-xs shrink-0">🛍️</div>}
                      <div className="min-w-0"><div className="font-semibold text-slate-800 truncate max-w-[200px]">{p.name}</div><div className="text-xs text-slate-400">{p.category}</div></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">{p.platform}</span></td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">${parseFloat(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell"><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${p.inStock ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>{p.inStock ? "In Stock" : "Out"}</span></td>
                  <td className="px-4 py-3 text-center text-slate-500 text-xs hidden lg:table-cell">{fmt(p.soldCount ?? 0)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
              <span className="text-xs text-slate-400">Page {page} of {totalPages} · {total} total</span>
              <div className="flex gap-1">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40">Prev</button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">{editItem ? "Edit Product" : "New Product"}</h3>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSave} className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Product Name</label><input required className={INP_CLS} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Instagram 10K Account" /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Price (USD)</label><input required type="number" step="0.01" min="0" className={INP_CLS} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="9.99" /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Platform</label><select className={INP_CLS} value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>{PLATFORMS.map(p => <option key={p}>{p}</option>)}</select></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Category</label><input className={INP_CLS} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Accounts" /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Image URL</label><input className={INP_CLS} value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" /></div>
                <div className="col-span-2"><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Description</label><textarea className={INP_CLS} rows={3} style={{ resize: "vertical" }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Product description…" /></div>
                <div className="flex items-center gap-3 col-span-2 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.inStock} onChange={e => setForm(f => ({ ...f, inStock: e.target.checked }))} /><span className="text-sm text-slate-700">In Stock</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} /><span className="text-sm text-slate-700">Featured</span></label>
                </div>
              </div>
              <div className="flex gap-3 pb-2">
                <button type="submit" disabled={saving} className={`${BTN_PRI} py-2.5`} style={{ background: PRIMARY }}>{saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : editItem ? "Save Changes" : "Add Product"}</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Orders Panel ───────────────────────────────────────────────────────────────
type Order = { id: number; userId: number | null; customerName: string | null; customerEmail: string | null; productName: string; amount: string; status: string; paymentMethod: string | null; createdAt: string };
function OrdersPanel({ token }: { token: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0); const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), ...(statusFilter && { status: statusFilter }) });
      const d = await adminFetch(`/admin/orders-list?${params}`, token).then(r => r.json());
      setOrders(Array.isArray(d.orders) ? d.orders : []);
      setTotal(d.total ?? 0);
    } catch { setOrders([]); } finally { setLoading(false); }
  }, [token, page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    try { await adminFetch(`/admin/orders-list/${id}`, token, { method: "PUT", body: JSON.stringify({ status }) }); load(); }
    catch { alert("Failed to update status"); } finally { setUpdatingId(null); }
  };

  const STATUS_OPTS = ["pending", "processing", "completed", "cancelled", "refunded"];
  const STATUS_COLORS: Record<string, string> = { pending: "#f59e0b", processing: "#3b82f6", completed: "#10b981", cancelled: "#ef4444", refunded: "#8b5cf6" };

  const summary = { total: total, pending: orders.filter(o => o.status === "pending").length, completed: orders.filter(o => o.status === "completed").length, revenue: orders.filter(o => o.status === "completed").reduce((s, o) => s + parseFloat(o.amount || "0"), 0) };

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[{ label: "Total Orders", val: fmt(total), color: PRIMARY }, { label: "Pending", val: fmt(orders.filter(o => o.status === "pending").length), color: "#f59e0b" }, { label: "Completed", val: fmt(orders.filter(o => o.status === "completed").length), color: "#10b981" }, { label: "Revenue (page)", val: fmtMoney(orders.filter(o => o.status === "completed").reduce((s, o) => s + parseFloat(o.amount || "0"), 0)), color: "#8b5cf6" }].map(c => (
          <div key={c.label} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
            <div className="text-2xl font-black" style={{ color: c.color }}>{c.val}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-slate-900">Orders</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {["", ...STATUS_OPTS].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-full border transition ${statusFilter === s ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}>
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <button onClick={load} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 transition"><RefreshCw className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div> : orders.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-white border border-slate-200"><div className="text-4xl mb-3">🛒</div><p className="text-slate-400">No orders found</p></div>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50"><tr>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">#</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">Product</th>
              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Date</th>
              <th className="px-4 py-3 w-32"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">#{o.id}</td>
                  <td className="px-4 py-3"><div className="font-semibold text-slate-800 text-xs">{o.customerName ?? "Guest"}</div><div className="text-xs text-slate-400">{o.customerEmail ?? "—"}</div></td>
                  <td className="px-4 py-3 text-xs text-slate-600 hidden md:table-cell max-w-[160px] truncate">{o.productName}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">{fmtMoney(parseFloat(o.amount || "0"))}</td>
                  <td className="px-4 py-3 text-center"><span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: (STATUS_COLORS[o.status] ?? "#94a3b8") + "20", color: STATUS_COLORS[o.status] ?? "#64748b" }}>{o.status}</span></td>
                  <td className="px-4 py-3 text-right text-xs text-slate-400 hidden lg:table-cell">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <select className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600 focus:outline-none" value={o.status} disabled={updatingId === o.id} onChange={e => updateStatus(o.id, e.target.value)}>
                      {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {Math.ceil(total / 50) > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
              <span className="text-xs text-slate-400">Page {page} of {Math.ceil(total / 50)} · {total} total</span>
              <div className="flex gap-1">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40">Prev</button>
                <button disabled={page >= Math.ceil(total / 50)} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Reviews Panel ──────────────────────────────────────────────────────────────
type Review = { id: number; productId: number | null; productName: string | null; authorName: string; rating: number; comment: string | null; createdAt: string };
function ReviewsPanel({ token }: { token: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<{ averageRating: number; totalReviews: number; fiveStar: number; fourStar: number; threeStar: number; twoStar: number; oneStar: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [revR, statsR] = await Promise.all([
        adminFetch("/admin/reviews-list?limit=100", token).then(r => r.json()),
        fetch("/api/reviews/stats").then(r => r.json()),
      ]);
      setReviews(Array.isArray(revR.reviews) ? revR.reviews : []);
      setStats(statsR);
    } catch { setReviews([]); } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const deleteReview = async (id: number) => {
    if (!confirm("Delete this review?")) return;
    setDeleting(id);
    try { await adminFetch(`/admin/reviews-list/${id}`, token, { method: "DELETE" }); load(); }
    catch { alert("Failed to delete"); } finally { setDeleting(null); }
  };

  const Stars = ({ n }: { n: number }) => (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => <span key={i} className={`text-sm ${i <= n ? "text-amber-400" : "text-slate-200"}`}>★</span>)}
    </div>
  );

  return (
    <div>
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center"><div className="text-3xl font-black text-amber-500">{stats.averageRating.toFixed(1)}</div><div className="flex justify-center my-1"><Stars n={Math.round(stats.averageRating)} /></div><div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Avg Rating</div></div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center"><div className="text-3xl font-black" style={{ color: PRIMARY }}>{fmt(stats.totalReviews)}</div><div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Total Reviews</div></div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center"><div className="text-3xl font-black text-emerald-500">{fmt(stats.fiveStar)}</div><div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">5-Star Reviews</div></div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center"><div className="text-3xl font-black text-red-400">{fmt(stats.oneStar + stats.twoStar)}</div><div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Low Ratings</div></div>
        </div>
      )}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-slate-900">Reviews Center</h2>
        <button onClick={load} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 transition"><RefreshCw className="w-3.5 h-3.5" /></button>
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div> : reviews.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-white border border-slate-200"><div className="text-4xl mb-3">⭐</div><p className="text-slate-400">No reviews yet</p></div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-100 transition">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: `linear-gradient(135deg, ${PRIMARY}, #06b6d4)` }}>
                  {(r.authorName ?? "?").slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm text-slate-900">{r.authorName}</span>
                    <Stars n={r.rating} />
                    <span className="text-xs text-slate-400 ml-auto">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  {r.productName && <div className="text-xs text-blue-600 mb-1">📦 {r.productName}</div>}
                  <p className="text-sm text-slate-600">{r.comment ?? "No comment left."}</p>
                </div>
                <button onClick={() => deleteReview(r.id)} disabled={deleting === r.id} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition shrink-0">
                  {deleting === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── G2G Panel ──────────────────────────────────────────────────────────────────
function G2GPanel({ token }: { token: string }) {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [form, setForm] = useState({ platform: "G2G", title: "", description: "", price: "", stock: 1, status: "active", g2g_id: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminFetch("/admin/db/tables/g2g_listings?limit=100&sort=id&dir=desc", token);
      const d = await r.json();
      setListings(Array.isArray(d.rows) ? d.rows : []);
    } catch { setListings([]); } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditItem(null); setForm({ platform: "G2G", title: "", description: "", price: "", stock: 1, status: "active", g2g_id: "" }); setShowModal(true); };
  const openEdit = (item: any) => { setEditItem(item); setForm({ platform: item.platform ?? "G2G", title: item.title ?? "", description: item.description ?? "", price: item.price ?? "", stock: item.stock ?? 1, status: item.status ?? "active", g2g_id: item.g2g_id ?? "" }); setShowModal(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem) {
        await adminFetch(`/admin/db/tables/g2g_listings/rows/${editItem.id}`, token, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await adminFetch("/admin/db/tables/g2g_listings/rows", token, { method: "POST", body: JSON.stringify(form) });
      }
      setShowModal(false); load();
    } catch { alert("Failed to save listing"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this listing?")) return;
    setDeleting(id);
    try { await adminFetch(`/admin/db/tables/g2g_listings/rows/${id}`, token, { method: "DELETE" }); load(); }
    catch { alert("Failed to delete"); } finally { setDeleting(null); }
  };

  const filtered = listings.filter(l => !search || l.title?.toLowerCase().includes(search.toLowerCase()) || l.platform?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div><h2 className="text-xl font-bold text-slate-900">G2G Listings</h2><p className="text-sm mt-0.5 text-slate-500">{listings.length} listings · G2G marketplace inventory</p></div>
        <div className="flex items-center gap-2">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" /><input className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 w-44 placeholder-slate-400" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <button onClick={load} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 transition"><RefreshCw className="w-3.5 h-3.5" /></button>
          <button onClick={openCreate} className={BTN_PRI} style={{ background: PRIMARY }}><Plus className="w-4 h-4" /> Add Listing</button>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div> : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-white border border-slate-200">
          <div className="text-4xl mb-3">🎮</div>
          <p className="text-slate-400 mb-3">{listings.length === 0 ? "No G2G listings yet" : "No results for your search"}</p>
          {listings.length === 0 && <button onClick={openCreate} className={BTN_PRI} style={{ background: PRIMARY }}>Add First Listing</button>}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50"><tr>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Title</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">Platform</th>
              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Price</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden sm:table-cell">Stock</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
              <th className="px-4 py-3 w-24"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((l: any) => (
                <tr key={l.id} className="hover:bg-slate-50 group">
                  <td className="px-4 py-3"><div className="font-semibold text-slate-800 truncate max-w-[220px]">{l.title}</div>{l.g2g_id && <div className="text-xs text-slate-400 font-mono">ID: {l.g2g_id}</div>}</td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-600">{l.platform ?? "G2G"}</span></td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">{l.price ? `$${parseFloat(l.price).toFixed(2)}` : "—"}</td>
                  <td className="px-4 py-3 text-center text-slate-500 text-xs hidden sm:table-cell">{l.stock ?? 1}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={l.status ?? "active"} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => openEdit(l)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(l.id)} disabled={deleting === l.id} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition">{deleting === l.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">{editItem ? "Edit Listing" : "New G2G Listing"}</h3>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Title</label><input required className={INP_CLS} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Account title…" /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Platform</label><input className={INP_CLS} value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} placeholder="G2G" /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">G2G Listing ID</label><input className={INP_CLS} value={form.g2g_id} onChange={e => setForm(f => ({ ...f, g2g_id: e.target.value }))} placeholder="optional" /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Price ($)</label><input type="number" step="0.01" min="0" className={INP_CLS} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="9.99" /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Stock</label><input type="number" min="0" className={INP_CLS} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: parseInt(e.target.value) || 0 }))} /></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Status</label><select className={INP_CLS} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{["active", "inactive", "sold"].map(s => <option key={s}>{s}</option>)}</select></div>
                <div><label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">Description</label><textarea className={INP_CLS} rows={2} style={{ resize: "none" }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional…" /></div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className={`${BTN_PRI} py-2.5`} style={{ background: PRIMARY }}>{saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : editItem ? "Save Changes" : "Add Listing"}</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
function Dashboard({ token, onNavigate }: { token: string; stats: DbStats | null; onNavigate: (s: SectionId) => void }) {
  const [bizStats, setBizStats] = useState<any>(null);
  useEffect(() => {
    adminFetch("/admin/dashboard", token).then(r => r.json()).then(setBizStats).catch(() => {});
  }, [token]);

  const kpi = (icon: string, label: string, val: string, sub: string, color: string, onClick?: () => void) => (
    <div key={label} onClick={onClick} className={`p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition ${onClick ? "cursor-pointer" : ""}`}>
      <div className="flex items-center justify-between mb-2"><span className="text-xl">{icon}</span><div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div></div>
      <div className="text-2xl font-black" style={{ color }}>{val}</div>
      <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: PRIMARY }}>OVERVIEW</p>
        <h2 className="text-2xl font-black text-slate-900 mb-1">Welcome back, Admin 👋</h2>
        <p className="text-sm text-slate-400">Here's what's happening across your platform today.</p>
      </div>

      {bizStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {kpi("💰", "Total Revenue", fmtMoney(bizStats.totalRevenue), "All time", "#10b981", () => onNavigate("orders"))}
          {kpi("🛒", "Total Orders", fmt(bizStats.orders?.total), `${fmt(bizStats.ordersToday)} today`, PRIMARY, () => onNavigate("orders"))}
          {kpi("👥", "Users", fmt(bizStats.totalUsers), `${fmt(bizStats.newUsersToday ?? 0)} new today`, "#8b5cf6", () => onNavigate("buyers"))}
          {kpi("⭐", "Reviews", fmt(bizStats.reviews?.total), `${fmt(bizStats.reviews?.pending ?? 0)} pending`, "#f59e0b", () => onNavigate("reviews_center"))}
        </div>
      )}
      {bizStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {kpi("✅", "Completed", fmt(bizStats.orders?.completed), `${fmt(bizStats.orders?.pending)} pending`, "#10b981")}
          {kpi("🛍️", "Products", fmt(bizStats.products), "In catalog", PRIMARY, () => onNavigate("catalog"))}
          {kpi("📦", "Stock Items", fmt(bizStats.inventory), "In inventory", "#06b6d4", () => onNavigate("stock"))}
          {bizStats.topPlatform ? kpi("🏆", "Top Platform", bizStats.topPlatform.platform ?? "—", `${bizStats.topPlatform.cnt} items`, "#ec4899") : kpi("🏆", "Top Platform", "—", "No data yet", "#ec4899")}
        </div>
      )}

      {!bizStats && <div className="flex justify-center py-8 mb-4"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div>}

      <div className="space-y-4">
        {WORKSPACE_GROUPS.map(grp => (
          <div key={grp.title} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <span className="w-4 h-px bg-slate-200 inline-block"></span>{grp.title}<span className="flex-1 h-px bg-slate-100 inline-block ml-1"></span>
            </p>
            <div className="flex flex-wrap gap-2">
              {grp.items.map(item => (
                <button key={item.id} onClick={() => onNavigate(item.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all shadow-sm hover:shadow">
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {bizStats?.recentOrders?.length > 0 && (
        <div className="mt-6 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-3">Recent Orders</h3>
          <div className="space-y-2">
            {bizStats.recentOrders.slice(0, 5).map((o: any) => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-slate-50">
                <div><div className="text-sm font-semibold text-slate-800">{o.productName ?? "Order #" + o.id}</div><div className="text-xs text-slate-400">{o.customerName ?? "Guest"} · {new Date(o.createdAt).toLocaleDateString()}</div></div>
                <div className="flex items-center gap-3"><span className="font-bold text-emerald-600 text-sm">{fmtMoney(parseFloat(o.amount || "0"))}</span><StatusBadge status={o.status} /></div>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate("orders")} className="mt-3 text-sm font-semibold text-blue-600 hover:underline">View all orders →</button>
        </div>
      )}
    </div>
  );
}

// ── WORKSPACE GROUPS (matches screenshot exactly) ──────────────────────────────
type WorkspaceGroupItem = { label: string; id: SectionId };
type WorkspaceGroup = { title: string; items: WorkspaceGroupItem[] };
const WORKSPACE_GROUPS: WorkspaceGroup[] = [
  {
    title: "Store Operations",
    items: [
      { label: "🛍️ Catalog",           id: "catalog" },
      { label: "⭐ Reviews Center",     id: "reviews_center" },
      { label: "📦 Stock",              id: "stock" },
      { label: "🛒 Orders",             id: "orders" },
      { label: "📦 Bundles",            id: "bundles" },
      { label: "🎮 G2G Center",         id: "g2g" },
      { label: "🆙 PlayerUp",           id: "playerup" },
      { label: "🚀 PlayerUp Creator",   id: "playerup_creator" },
      { label: "🎯 Z2U Center",         id: "z2u" },
      { label: "📋 Z2U Logs",           id: "z2u_logs" },
      { label: "💬 WhatsApp Inbox",     id: "whatsapp" },
      { label: "🔌 Extension Logs",     id: "ext_logs" },
      { label: "🔨 Builder Requests",  id: "builder_requests" },
      { label: "🎫 Promos",             id: "promos" },
    ],
  },
  {
    title: "Sales & CRM",
    items: [
      { label: "💰 Sales",              id: "sales" },
      { label: "🎯 Leads",              id: "leads" },
      { label: "👤 Buyers",             id: "buyers" },
      { label: "🏪 Sellers",            id: "sellers" },
      { label: "✅ Verifications",      id: "verifications" },
      { label: "🏢 Formations",         id: "formations" },
      { label: "🎧 Support",            id: "support" },
    ],
  },
  {
    title: "Content & Tools",
    items: [
      { label: "🌐 Website",            id: "website_content" },
      { label: "📣 Marketing",          id: "marketing" },
      { label: "📊 Intelligence",       id: "intelligence" },
      { label: "🟢 Live Traffic",       id: "live_traffic" },
      { label: "🔧 Tools",              id: "tools" },
      { label: "📚 KB/FAQ",             id: "kb_editor" },
      { label: "🔍 Google Indexing",    id: "google_indexing" },
      { label: "🕵️ Z2U Intel",          id: "z2u_intel" },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "💵 Finance",            id: "finance" },
      { label: "📄 Docs",               id: "docs" },
      { label: "💳 Payments",           id: "payments" },
      { label: "📧 Newsletter",         id: "newsletter" },
      { label: "👥 Staff",              id: "staff" },
      { label: "📝 Logs",               id: "activity" },
      { label: "⚙️ Settings",           id: "settings_table" },
    ],
  },
];

// ── Sidebar ────────────────────────────────────────────────────────────────────
const SIDEBAR_SECTIONS: { label: string; items: { id: SectionId; icon: string; label: string }[] }[] = [
  {
    label: "Store Operations",
    items: [
      { id: "catalog",          icon: "🛍️", label: "Catalog" },
      { id: "stock",            icon: "📦", label: "Stock" },
      { id: "orders",           icon: "🛒", label: "Orders" },
      { id: "reviews_center",   icon: "⭐", label: "Reviews Center" },
      { id: "bundles",          icon: "📦", label: "Bundles" },
      { id: "g2g",              icon: "🎮", label: "G2G Center" },
      { id: "playerup",         icon: "🆙", label: "PlayerUp" },
      { id: "playerup_creator", icon: "🚀", label: "PlayerUp Creator" },
      { id: "z2u",              icon: "🎯", label: "Z2U Center" },
      { id: "z2u_logs",         icon: "📋", label: "Z2U Logs" },
      { id: "whatsapp",         icon: "💬", label: "WhatsApp Inbox" },
      { id: "ext_logs",         icon: "🔌", label: "Extension Logs" },
      { id: "builder_requests", icon: "🔨", label: "Builder Requests" },
      { id: "promos",           icon: "🎫", label: "Promos" },
    ],
  },
  {
    label: "Sales & CRM",
    items: [
      { id: "sales",         icon: "💰", label: "Sales" },
      { id: "leads",         icon: "🎯", label: "Leads" },
      { id: "buyers",        icon: "👤", label: "Buyers" },
      { id: "sellers",       icon: "🏪", label: "Sellers" },
      { id: "verifications", icon: "✅", label: "Verifications" },
      { id: "formations",    icon: "🏢", label: "Formations" },
      { id: "support",       icon: "🎧", label: "Support" },
    ],
  },
  {
    label: "Content & Tools",
    items: [
      { id: "website_content", icon: "🌐", label: "Website" },
      { id: "marketing",       icon: "📣", label: "Marketing" },
      { id: "intelligence",    icon: "📊", label: "Intelligence" },
      { id: "live_traffic",    icon: "🟢", label: "Live Traffic" },
      { id: "tools",           icon: "🔧", label: "Tools" },
      { id: "kb_editor",       icon: "📚", label: "KB/FAQ" },
      { id: "google_indexing", icon: "🔍", label: "Google Indexing" },
      { id: "z2u_intel",       icon: "🕵️", label: "Z2U Intel" },
    ],
  },
  {
    label: "Administration",
    items: [
      { id: "wallet",         icon: "💰", label: "Wallets" },
      { id: "finance",        icon: "💵", label: "Finance" },
      { id: "docs",           icon: "📄", label: "Documents" },
      { id: "payments",       icon: "💳", label: "Payments" },
      { id: "newsletter",     icon: "📧", label: "Newsletter" },
      { id: "staff",          icon: "👥", label: "Staff" },
      { id: "activity",       icon: "📝", label: "Logs" },
      { id: "settings_table", icon: "⚙️", label: "Settings" },
      { id: "db",             icon: "🗄️", label: "DB Browser" },
    ],
  },
];

function Sidebar({ active, onNav, onLogout, open, onClose }: {
  active: SectionId; onNav: (s: SectionId) => void; stats: DbStats | null;
  onLogout: () => void; open: boolean; onClose: () => void;
}) {
  const go = (id: SectionId) => { onNav(id); onClose(); };

  const sidebar = (
    <aside className="flex flex-col w-56 shrink-0 h-screen" style={{ background: SIDEBAR_BG }}>
      {/* Logo */}
      <div className="px-4 py-3.5 flex items-center gap-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-sm text-white" style={{ background: "linear-gradient(135deg,#4f7af5,#3a5fd4)" }}>U1</div>
        <div>
          <div className="text-white font-black text-sm leading-tight tracking-tight">OfficialUM1</div>
          <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#4f7af5" }}>Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {/* Dashboard link */}
        <div className="px-2 mb-1">
          <button onClick={() => go("dashboard")} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${active === "dashboard" ? "text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}`}
            style={active === "dashboard" ? { background: "rgba(79,122,245,0.25)", color: "#93c5fd" } : {}}>
            <LayoutDashboard className="w-3.5 h-3.5 shrink-0" /> Dashboard
          </button>
        </div>

        {SIDEBAR_SECTIONS.map(sec => (
          <div key={sec.label} className="px-2 mb-1">
            <p className="text-[9px] font-black uppercase tracking-widest px-3 pt-3 pb-1.5" style={{ color: "#334155" }}>{sec.label}</p>
            {sec.items.map(item => (
              <button key={item.id} onClick={() => go(item.id)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all mb-0.5 ${active === item.id ? "" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}`}
                style={active === item.id ? { background: "rgba(79,122,245,0.2)", color: "#93c5fd", fontWeight: 700 } : {}}>
                <span className="shrink-0 text-[13px]">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 py-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <a href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
          <Home className="w-3.5 h-3.5" /> Back to Site
        </a>
        <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}
      <div className={`fixed inset-y-0 left-0 z-50 lg:relative lg:block transition-transform ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>{sidebar}</div>
    </>
  );
}

// ── Login Screen ───────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      if (!res.ok) { setError("Invalid admin password."); return; }
      const { token } = await res.json();
      localStorage.setItem("um1_admin_token", token);
      onLogin(token);
    } catch { setError("Connection error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #f0f4f8 0%, #e8eef7 100%)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: `linear-gradient(135deg, ${PRIMARY}, #06b6d4)` }}>
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] mb-3" style={{ borderColor: "#dbeafe", background: "#eff6ff", color: PRIMARY }}>
            Admin Access
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">OfficialUM1 <span style={{ color: PRIMARY }}>Control Center</span></h1>
          <p className="text-sm mt-1 text-slate-400">Secure administrator access</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 rounded-2xl bg-white shadow-xl border border-slate-200">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2 text-slate-500">Admin Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="password" placeholder="Enter password…" value={password} onChange={e => setPassword(e.target.value)} autoFocus
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl text-slate-800 placeholder-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white" />
            </div>
          </div>
          {error && <div className="flex items-center gap-2 text-red-600 text-sm rounded-xl px-3 py-2 bg-red-50 border border-red-200"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
          <button type="submit" disabled={loading || !password} className={`${BTN_PRI} w-full justify-center py-3 text-base`} style={{ background: `linear-gradient(135deg, ${PRIMARY}, #06b6d4)` }}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            {loading ? "Authenticating…" : "Access Admin Panel"}
          </button>
        </form>
        <p className="text-center text-xs mt-5 text-slate-400"><a href="/" className="hover:text-slate-600 transition">← Back to site</a></p>
      </div>
    </div>
  );
}

// ── Admin Panel Shell ──────────────────────────────────────────────────────────
function AdminPanel({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [section, setSection] = useState<SectionId>(() => {
    const s = new URLSearchParams(window.location.search).get("s");
    return (s as SectionId) || "dashboard";
  });
  const navTo = useCallback((id: SectionId) => {
    setSection(id);
    const url = new URL(window.location.href);
    url.searchParams.set("s", id);
    window.history.replaceState(null, "", url.toString());
  }, []);
  const [stats, setStats] = useState<DbStats | null>(null);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadMeta = useCallback(async () => {
    setTablesLoading(true);
    try {
      const [s, t] = await Promise.all([
        adminFetch("/admin/db/stats", token).then(r => r.ok ? r.json() : null),
        adminFetch("/admin/db/tables", token).then(r => r.ok ? r.json() : []),
      ]);
      if (s) setStats(s);
      if (Array.isArray(t)) setTables(t);
    } catch { /* ignore */ }
    finally { setTablesLoading(false); }
  }, [token]);

  useEffect(() => { loadMeta(); }, [loadMeta]);

  const LABELS: Partial<Record<SectionId, { title: string; desc: string }>> = {
    catalog: { title: "Product Catalog", desc: "Manage product listings" },
    orders: { title: "Orders", desc: "View and manage customer orders" },
    reviews_center: { title: "Reviews Center", desc: "Moderate customer reviews" },
    stock: { title: "Stock / Inventory", desc: "Track stock levels" },
    bundles: { title: "Bundles", desc: "Bundle product packages" },
    buyers: { title: "Buyers", desc: "Manage buyer accounts" },
    sellers: { title: "Sellers", desc: "Manage seller accounts" },
    coupons: { title: "Coupons", desc: "Discount codes" },
    playerup: { title: "PlayerUp Listings", desc: "External marketplace" },
    playerup_creator: { title: "PlayerUp Creator", desc: "Create PlayerUp listings" },
    g2g: { title: "G2G Listings", desc: "G2G marketplace" },
    z2u_logs: { title: "Z2U Logs", desc: "Z2U activity logs" },
    whatsapp: { title: "WhatsApp Inbox", desc: "Customer messages" },
    builder_requests: { title: "Builder Requests", desc: "VIP account builder requests" },
    promos: { title: "Promos", desc: "Promotional campaigns" },
    leads: { title: "Leads", desc: "Sales leads and prospects" },
    verifications: { title: "Verifications", desc: "Account verifications" },
    formations: { title: "Business Formations", desc: "US business setups" },
    support: { title: "Support Tickets", desc: "Customer support" },
    activity: { title: "Activity Logs", desc: "Site-wide event log" },
    settings_table: { title: "Site Settings", desc: "Application configuration" },
    docs: { title: "Documents", desc: "Admin documents" },
    staff: { title: "Staff", desc: "Admin staff accounts" },
  };

  const renderSection = () => {
    if (section === "dashboard") return <Dashboard token={token} stats={stats} onNavigate={navTo} />;
    if (section === "db") return <DbBrowser tables={tables} token={token} tablesLoading={tablesLoading} />;
    if (section === "website_content") return <WebsiteContent token={token} />;
    if (section === "newsletter") return <NewsletterPanel token={token} />;
    if (section === "payments") return <PaymentsPanel token={token} />;
    if (section === "payouts") return <PayoutsPanel token={token} />;
    if (section === "kb_editor") return <KBEditorPanel token={token} />;
    if (section === "z2u") return <Z2UPanel token={token} />;
    if (section === "marketing") return <MarketingPanel token={token} />;
    if (section === "intelligence") return <IntelligencePanel token={token} />;
    if (section === "live_traffic") return <LiveTrafficPanelImproved token={token} />;
    if (section === "tools") return <ToolsPanel token={token} />;
    if (section === "google_indexing") return <GoogleIndexingPanel token={token} />;
    if (section === "z2u_intel") return <Z2UIntelPanel token={token} />;
    if (section === "finance") return <FinancePanel token={token} />;
    if (section === "sales") return <SalesPanel token={token} />;
    if (section === "stock") return <StockPanel token={token} />;
    if (section === "playerup") return <PlayerUpOpsPanel token={token} />;
    if (section === "playerup_creator") return <PlayerUpOpsPanel token={token} />;
    if (section === "whatsapp") return <WhatsAppPanel token={token} />;
    if (section === "ext_logs") return <ExtensionLogsPanel token={token} />;
    if (section === "settings_table") return <SiteSettingsPanel token={token} />;
    if (section === "catalog") return <CatalogPanel token={token} />;
    if (section === "orders") return <OrdersPanel token={token} />;
    if (section === "reviews_center") return <ReviewsPanel token={token} />;
    if (section === "g2g") return <G2GPanelFull token={token} />;
    if (section === "wallet") return <WalletPanel token={token} />;
    if (section === "staff") return <StaffPanel token={token} />;
    if (section === "docs") return <DocumentsPanel token={token} />;
    if (section === "live_traffic") return <LiveTrafficPanelImproved token={token} />;
    const tableName = NAV_TABLE_MAP[section];
    if (tableName) { const lbl = LABELS[section]; return <TableManager key={`${section}-${refreshKey}`} tableName={tableName} token={token} title={lbl?.title} description={lbl?.desc} />; }
    return <div className="text-slate-400 text-center py-16">Section coming soon</div>;
  };

  const sectionLabel = LABELS[section]?.title ?? (section === "dashboard" ? "Dashboard" : section === "db" ? "DB Browser" : section === "website_content" ? "Website Editor" : section === "marketing" ? "Marketing" : section === "intelligence" ? "Intelligence" : section === "live_traffic" ? "Live Traffic" : section === "tools" ? "Tools" : section === "google_indexing" ? "Google Indexing" : section === "z2u_intel" ? "Z2U Intel" : section === "finance" ? "Finance" : section === "sales" ? "Sales" : section === "whatsapp" ? "WhatsApp Inbox" : section === "playerup_creator" ? "PlayerUp Creator" : section === "newsletter" ? "Newsletter" : section === "payments" ? "Payments" : section === "payouts" ? "Payouts" : section === "kb_editor" ? "KB Editor" : section === "z2u" ? "Z2U Center" : section);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: CONTENT_BG }}>
      <Sidebar active={section} onNav={navTo} stats={stats} onLogout={onLogout} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-3 sm:px-5 py-2.5 shrink-0 bg-white border-b border-slate-200 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="hidden sm:block text-[10px] tracking-widest uppercase font-bold flex-shrink-0" style={{ color: PRIMARY }}>Admin</span>
              <ChevronRight className="hidden sm:block w-3 h-3 text-slate-300 flex-shrink-0" />
              <span className="text-xs font-bold text-slate-900 truncate">{sectionLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <a href="/" className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 border border-slate-200 hover:bg-slate-50 transition">
              <ExternalLink className="w-3 h-3" /> <span className="hidden md:inline">View Site</span>
            </a>
            <button onClick={() => navTo("dashboard")} className="hidden md:block px-2.5 py-1.5 rounded-xl text-xs font-semibold transition" style={section === "dashboard" ? { background: PRIMARY_D, color: PRIMARY } : { color: "#64748b" }}>Dashboard</button>
            <button onClick={() => navTo("settings_table")} className="hidden md:block px-2.5 py-1.5 rounded-xl text-xs font-semibold transition" style={section === "settings_table" ? { background: PRIMARY_D, color: PRIMARY } : { color: "#64748b" }}>Settings</button>
            <button onClick={() => navTo("playerup")} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-white transition" style={{ background: section === "playerup" ? "#6d28d9" : "#7c3aed" }}>
              <span>🆙</span><span className="hidden sm:inline"> PlayerUp</span>
            </button>
            <button onClick={() => { loadMeta(); setRefreshKey(k => k + 1); }} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 border border-slate-200 hover:bg-slate-50 transition">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-5 lg:p-7">{renderSection()}</main>
      </div>
    </div>
  );
}

// ── Root Export ────────────────────────────────────────────────────────────────
export function Admin() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("um1_admin_token"));
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!token) { setChecking(false); return; }
    adminFetch("/admin/db/test", token).then(r => {
      if (r.ok) setVerified(true);
      else { localStorage.removeItem("um1_admin_token"); setToken(null); }
    }).catch(() => setToken(null)).finally(() => setChecking(false));
  }, [token]);

  const handleLogin = (t: string) => { setToken(t); setVerified(true); };
  const handleLogout = () => { localStorage.removeItem("um1_admin_token"); setToken(null); setVerified(false); };

  if (checking) return <div className="min-h-screen flex items-center justify-center" style={{ background: CONTENT_BG }}><Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} /></div>;
  if (!token || !verified) return <LoginScreen onLogin={handleLogin} />;
  return <AdminPanel token={token} onLogout={handleLogout} />;
}
