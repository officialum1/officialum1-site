import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "wouter";
import { CheckCircle2, Copy, Check, Shield, Clock, Eye, Package, Globe, User, Mail, Lock, Info, Tag, MapPin, AlertCircle, Loader2, Star, X } from "lucide-react";

const API = import.meta.env.VITE_API_BASE ?? "/api";
const PRIMARY = "#4f7af5";

interface Credentials {
  username: string;
  email: string;
  password: string;
  emailPassword: string;
  country: string;
  extraInfo: string;
  tag: string;
}

interface DeliveryData {
  token: string;
  itemName: string;
  platform: string;
  saleDate: string;
  views: number;
  revealedAt: string | null;
  credentials: Credentials;
}

const PLATFORM_ICON: Record<string, string> = {
  Instagram: "📸", TikTok: "🎵", YouTube: "📹", "Twitter/X": "🐦",
  Reddit: "🟠", Snapchat: "👻", Facebook: "📘", LinkedIn: "💼",
  Discord: "💬", Telegram: "✈️", Pinterest: "📌", GitHub: "🐙",
  Direct: "📦", Other: "📦",
};

function CopyField({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const [show, setShow] = useState(false);
  const isPassword = label.toLowerCase().includes("password");

  if (!value) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 group">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: PRIMARY + "18", color: PRIMARY }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm font-mono font-semibold text-slate-800 truncate select-all">
          {isPassword && !show ? "•".repeat(Math.min(value.length, 16)) : value}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {isPassword && (
          <button onClick={() => setShow(s => !s)}
            className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition">
            {show ? "Hide" : "Show"}
          </button>
        )}
        <button onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition"
          style={copied ? { background: "#10b98118", color: "#10b981" } : { background: "#fff", border: "1px solid #e2e8f0", color: "#64748b" }}>
          {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
        </button>
      </div>
    </div>
  );
}

export function DeliveryPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<DeliveryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedAll, setCopiedAll] = useState(false);
  const [reviewDismissed, setReviewDismissed] = useState(() =>
    !!localStorage.getItem(`review_dismissed_${token}`)
  );

  const fetchDelivery = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch(`${API}/d/${token}`);
      if (!r.ok) {
        if (r.status === 404) setError("This delivery link was not found or has expired.");
        else setError("Failed to load delivery. Please try again.");
        return;
      }
      const d = await r.json();
      setData(d);
    } catch {
      setError("Could not connect to server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchDelivery(); }, [fetchDelivery]);

  const copyAll = () => {
    if (!data) return;
    const c = data.credentials;
    const lines = [
      `📦 ${data.itemName} (${data.platform})`,
      c.username ? `👤 Username: ${c.username}` : "",
      c.email ? `📧 Email: ${c.email}` : "",
      c.password ? `🔒 Password: ${c.password}` : "",
      c.emailPassword ? `📧 Email Password: ${c.emailPassword}` : "",
      c.country ? `🌍 Country/Region: ${c.country}` : "",
      c.tag ? `🏷️ Tag: ${c.tag}` : "",
      c.extraInfo ? `ℹ️ Notes: ${c.extraInfo}` : "",
      `\n🔗 Delivery Link: ${window.location.href}`,
      `\n✅ Delivered by OfficialUM1 — officialum1.com`,
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(lines).catch(() => {});
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f0f4f8" }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: PRIMARY }} />
          <p className="text-sm text-slate-500">Loading your delivery…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#f0f4f8" }}>
        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Delivery Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">{error || "This link may have expired or been removed."}</p>
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition" style={{ background: PRIMARY }}>
            Back to OfficialUM1
          </Link>
        </div>
      </div>
    );
  }

  const creds = data.credentials;
  const hasContent = Object.values(creds).some(v => v);
  const icon = PLATFORM_ICON[data.platform] || "📦";

  return (
    <div className="min-h-screen" style={{ background: "#f0f4f8" }}>
      {/* Top bar */}
      <div className="border-b bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#4f7af5,#06b6d4)" }}>
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-slate-900 text-sm">OfficialUM1</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Eye className="w-3.5 h-3.5" />
            <span>{data.views} view{data.views !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Review prompt — shown on 2nd+ visit */}
        {data.views >= 2 && !reviewDismissed && (
          <div className="relative flex items-center gap-4 px-5 py-4 rounded-2xl mb-5 shadow-sm" style={{ background: "linear-gradient(135deg,#fef9c3,#fef3c7)", border: "1px solid #fde68a" }}>
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-yellow-900">Enjoying your purchase?</p>
              <p className="text-xs text-yellow-700 mt-0.5">We'd love a quick 5-star review — it helps us a lot!</p>
              <Link href="/reviews"
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition"
                style={{ background: "#f59e0b" }}
                onClick={() => { localStorage.setItem(`review_dismissed_${token}`, "1"); setReviewDismissed(true); }}>
                <Star className="w-3 h-3 fill-white" /> Leave a 5-Star Review
              </Link>
            </div>
            <button onClick={() => { localStorage.setItem(`review_dismissed_${token}`, "1"); setReviewDismissed(true); }}
              className="absolute top-3 right-3 p-1 rounded-full text-yellow-400 hover:text-yellow-600 hover:bg-yellow-100 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Success banner */}
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl mb-6 shadow-sm" style={{ background: "linear-gradient(135deg,#10b98115,#4f7af510)", border: "1px solid #10b98130" }}>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Delivery Ready</p>
            <p className="text-xs text-slate-500">Your account credentials have been securely prepared below.</p>
          </div>
          <div className="ml-auto text-2xl">{icon}</div>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100" style={{ background: PRIMARY + "08" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: PRIMARY }}>YOUR ORDER</p>
                <h1 className="text-xl font-black text-slate-900">{data.itemName}</h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white" style={{ background: PRIMARY }}>
                    <Package className="w-3 h-3" /> {data.platform}
                  </span>
                  {data.saleDate && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {new Date(data.saleDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-4xl">{icon}</div>
            </div>
          </div>

          {/* Credentials */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4" style={{ color: PRIMARY }} /> Account Credentials
              </h2>
              <button onClick={copyAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition"
                style={copiedAll ? { background: "#10b98110", color: "#10b981", border: "1px solid #10b98130" } : { background: "#fff", color: PRIMARY, border: `1px solid ${PRIMARY}40` }}>
                {copiedAll ? <><Check className="w-3 h-3" /> Copied All</> : <><Copy className="w-3 h-3" /> Copy All</>}
              </button>
            </div>

            {hasContent ? (
              <div className="space-y-2.5">
                <CopyField label="Username" value={creds.username} icon={<User className="w-4 h-4" />} />
                <CopyField label="Email" value={creds.email} icon={<Mail className="w-4 h-4" />} />
                <CopyField label="Password" value={creds.password} icon={<Lock className="w-4 h-4" />} />
                <CopyField label="Email Password" value={creds.emailPassword} icon={<Mail className="w-4 h-4" />} />
                <CopyField label="Country / Region" value={creds.country} icon={<MapPin className="w-4 h-4" />} />
                <CopyField label="Tag" value={creds.tag} icon={<Tag className="w-4 h-4" />} />
                {creds.extraInfo && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Info className="w-4 h-4 text-amber-600" />
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">Additional Notes</p>
                    </div>
                    <p className="text-sm text-amber-800 whitespace-pre-wrap">{creds.extraInfo}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No credential details available for this delivery.</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" style={{ color: PRIMARY }} /> Next Steps
          </h3>
          <ol className="space-y-2">
            {[
              "Copy the credentials above using the Copy buttons.",
              `Log in to ${data.platform === "Direct" ? "your account" : data.platform} using the username and password.`,
              "Change the password immediately after first login for security.",
              "If you have issues, contact our support team within 24 hours.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5" style={{ background: PRIMARY + "18", color: PRIMARY }}>{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-400 mb-1">24-hour warranty · Secure delivery by OfficialUM1</p>
          <Link href="/" className="text-xs font-semibold" style={{ color: PRIMARY }}>Need help? Contact Support →</Link>
        </div>

        {/* Token reference */}
        <div className="flex items-center justify-center gap-2 py-3">
          <span className="text-[10px] text-slate-300 font-mono">Delivery ID: {data.token}</span>
        </div>
      </div>
    </div>
  );
}
