import { Router, type Request, type Response } from "express";
import { whatsappService } from "../lib/whatsapp";

const router = Router();

// ── Middleware: require admin ──────────────────────────────────────────────────
import crypto from "crypto";
const HMAC_KEY = process.env.SESSION_SECRET ?? "um1admin2024";
function requireAdmin(req: Request, res: Response, next: () => void) {
  const auth = req.headers.authorization ?? "";
  const token = auth.replace("Bearer ", "");
  if (!token) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) { res.status(401).json({ error: "Invalid token" }); return; }
    const expected = crypto.createHmac("sha256", HMAC_KEY).update(payload).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) { res.status(401).json({ error: "Unauthorized" }); return; }
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (data.role !== "admin" || Date.now() > data.exp) { res.status(401).json({ error: "Expired" }); return; }
    next();
  } catch { res.status(401).json({ error: "Unauthorized" }); }
}

// ── GET /api/admin/whatsapp/status ─────────────────────────────────────────────
router.get("/admin/whatsapp/status", requireAdmin, (_req, res) => {
  res.json(whatsappService.getStatus());
});

// ── POST /api/admin/whatsapp/connect ──────────────────────────────────────────
router.post("/admin/whatsapp/connect", requireAdmin, async (_req, res) => {
  await whatsappService.connect();
  res.json({ success: true, status: whatsappService.status });
});

// ── POST /api/admin/whatsapp/logout ───────────────────────────────────────────
router.post("/admin/whatsapp/logout", requireAdmin, async (_req, res) => {
  await whatsappService.logout();
  res.json({ success: true });
});

// ── GET /api/admin/whatsapp/chats ─────────────────────────────────────────────
router.get("/admin/whatsapp/chats", requireAdmin, (_req, res) => {
  res.json(whatsappService.getChats());
});

// ── GET /api/admin/whatsapp/messages/:jid ────────────────────────────────────
router.get("/admin/whatsapp/messages/:jid", requireAdmin, async (req, res) => {
  const jid = decodeURIComponent(req.params.jid as string);
  await whatsappService.markRead(jid);
  res.json(whatsappService.getMessages(jid));
});

// ── POST /api/admin/whatsapp/send ─────────────────────────────────────────────
router.post("/admin/whatsapp/send", requireAdmin, async (req, res) => {
  const { jid, text } = req.body as { jid: string; text: string };
  if (!jid || !text) { res.status(400).json({ error: "jid and text required" }); return; }
  const ok = await whatsappService.sendMessage(jid, text);
  res.json({ success: ok });
});

// ── GET /api/admin/whatsapp/events — SSE stream ───────────────────────────────
// EventSource doesn't support custom headers, so we accept token via query param too
function requireAdminOrQuery(req: Request, res: Response, next: () => void) {
  // Try Bearer header first
  const auth = req.headers.authorization ?? "";
  if (auth.startsWith("Bearer ")) { requireAdmin(req, res, next); return; }
  // Fall back to query param ?t=<token>
  const qt = (req.query.t as string) ?? "";
  if (qt) {
    req.headers.authorization = `Bearer ${qt}`;
    requireAdmin(req, res, next);
    return;
  }
  res.status(401).json({ error: "Unauthorized" });
}

router.get("/admin/whatsapp/events", requireAdminOrQuery, (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Send current status immediately
  const status = whatsappService.getStatus();
  res.write(`event: status\ndata: ${JSON.stringify(status)}\n\n`);

  whatsappService.addSSEClient(res);

  // Heartbeat every 20s
  const hb = setInterval(() => {
    try { res.write(": heartbeat\n\n"); } catch { clearInterval(hb); }
  }, 20000);

  req.on("close", () => {
    clearInterval(hb);
    whatsappService.removeSSEClient(res);
  });
});

export default router;
