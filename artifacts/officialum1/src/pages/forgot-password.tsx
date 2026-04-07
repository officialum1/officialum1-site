import { useState } from "react";
import { Link } from "wouter";
import { Mail, ArrowLeft, CheckCircle, Loader2, KeyRound } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) { setStatus("success"); }
      else {
        const d = await res.json();
        setError(d.error || "Failed to send reset email");
        setStatus("error");
      }
    } catch {
      setError("Network error. Please check your connection.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link href="/login">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </button>
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(79,122,245,0.1)" }}>
            <KeyRound className="w-8 h-8" style={{ color: "#4f7af5" }} />
          </div>
          <h1 className="text-3xl font-black mb-2">Forgot Password?</h1>
          <p className="text-muted-foreground text-sm">Enter your email and we'll send you a link to reset your password.</p>
        </div>

        {status === "success" ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(16,185,129,0.1)" }}>
              <CheckCircle className="w-7 h-7" style={{ color: "#10b981" }} />
            </div>
            <h3 className="font-black text-xl mb-2" style={{ color: "#10b981" }}>Email Sent!</h3>
            <p className="text-muted-foreground text-sm mb-2">
              A password reset link has been sent to <strong>{email}</strong>.
            </p>
            <p className="text-muted-foreground text-xs mb-6">Don't see it? Check your spam or junk folder.</p>
            <Link href="/login">
              <button className="px-6 py-3 rounded-xl font-bold text-sm border border-border hover:bg-black/5 transition">
                Back to Login
              </button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-7 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" required
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            {status === "error" && (
              <div className="px-4 py-3 rounded-xl text-sm text-red-600" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={status === "loading" || !email}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition disabled:opacity-50"
              style={{ background: "#4f7af5", boxShadow: "0 6px 20px rgba(79,122,245,0.3)" }}>
              {status === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Mail className="w-4 h-4" /> Send Reset Link</>}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Remember your password?{" "}
              <Link href="/login"><span className="font-semibold text-primary hover:underline cursor-pointer">Log in</span></Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
