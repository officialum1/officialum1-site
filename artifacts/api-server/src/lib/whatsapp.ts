import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import type { Response } from "express";

const require = createRequire(import.meta.url);

// ── Types ─────────────────────────────────────────────────────────────────────
export interface WaMessage {
  id: string;
  from: string;
  fromMe: boolean;
  body: string;
  timestamp: number;
  status?: string;
  type?: string;
}

export interface WaChat {
  jid: string;
  name: string;
  lastMessage?: string;
  lastTimestamp?: number;
  unread: number;
  isGroup: boolean;
  profilePic?: string;
}

type ConnStatus = "disconnected" | "connecting" | "qr" | "connected";

// ── Silent pino-compatible logger ─────────────────────────────────────────────
function makeSilentLogger(): any {
  const noop = () => {};
  const logger: any = { level: "silent", trace: noop, debug: noop, info: noop, warn: noop, error: noop, fatal: noop };
  logger.child = () => logger;
  return logger;
}

// ── In-memory state ───────────────────────────────────────────────────────────
class WhatsAppService {
  private sock: any = null;
  public status: ConnStatus = "disconnected";
  public qrCode: string | null = null;
  public chats: Map<string, WaChat> = new Map();
  public messages: Map<string, WaMessage[]> = new Map();
  private sseClients: Set<Response> = new Set();
  private authDir: string;

  constructor() {
    this.authDir = "/tmp/um1-whatsapp-auth";
    if (!fs.existsSync(this.authDir)) fs.mkdirSync(this.authDir, { recursive: true });
  }

  // ── SSE broadcast ──────────────────────────────────────────────────────────
  addSSEClient(res: Response) { this.sseClients.add(res); }
  removeSSEClient(res: Response) { this.sseClients.delete(res); }

  private broadcast(event: string, data: unknown) {
    const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    this.sseClients.forEach(res => {
      try { res.write(msg); } catch { this.sseClients.delete(res); }
    });
  }

  // ── Connect ────────────────────────────────────────────────────────────────
  async connect() {
    if (this.sock && this.status !== "disconnected") return;
    this.status = "connecting";
    this.broadcast("status", { status: "connecting" });

    try {
      const baileys = require("@whiskeysockets/baileys");
      const makeWASocket = baileys.default ?? baileys.makeWASocket ?? baileys;
      const useMultiFileAuthState = baileys.useMultiFileAuthState;
      const fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;
      const DisconnectReason = baileys.DisconnectReason;
      const makeCacheableSignalKeyStore = baileys.makeCacheableSignalKeyStore;

      const { state, saveCreds } = await useMultiFileAuthState(this.authDir);
      const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1023078] as [number, number, number] }));

      this.sock = makeWASocket({
        version,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore ? makeCacheableSignalKeyStore(state.keys, console as any) : state.keys,
        },
        printQRInTerminal: false,
        logger: makeSilentLogger(),
        browser: ["OfficialUM1", "Chrome", "3.0.0"],
        syncFullHistory: false,
      });

      // Connection updates
      this.sock.ev.on("connection.update", async (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          // Generate QR as data URL
          const QRCode = require("qrcode");
          this.qrCode = await QRCode.toDataURL(qr).catch(() => null);
          this.status = "qr";
          this.broadcast("qr", { qr: this.qrCode });
          this.broadcast("status", { status: "qr" });
        }

        if (connection === "close") {
          const code = lastDisconnect?.error?.output?.statusCode;
          const shouldReconnect = code !== DisconnectReason?.loggedOut && code !== 401;
          this.status = "disconnected";
          this.qrCode = null;
          this.sock = null;
          this.broadcast("status", { status: "disconnected", reason: code });
          if (shouldReconnect) {
            setTimeout(() => this.connect(), 3000);
          } else {
            // Logged out — clear auth
            fs.rmSync(this.authDir, { recursive: true, force: true });
            fs.mkdirSync(this.authDir, { recursive: true });
          }
        }

        if (connection === "open") {
          this.status = "connected";
          this.qrCode = null;
          this.broadcast("status", { status: "connected", name: this.sock?.user?.name, phone: this.sock?.user?.id?.split(":")[0] });
          this.loadChats();
        }
      });

      // Save credentials on update
      this.sock.ev.on("creds.update", saveCreds);

      // Receive messages
      this.sock.ev.on("messages.upsert", ({ messages: msgs, type }: any) => {
        for (const msg of msgs) {
          if (!msg.key?.remoteJid) continue;
          const jid = msg.key.remoteJid;
          const body = msg.message?.conversation
            || msg.message?.extendedTextMessage?.text
            || msg.message?.imageMessage?.caption
            || (msg.message?.buttonsResponseMessage?.selectedDisplayText)
            || "[Media/Sticker]";
          const fromMe = msg.key.fromMe ?? false;
          const timestamp = Number(msg.messageTimestamp) * 1000;

          const waMsg: WaMessage = {
            id: msg.key.id ?? `${Date.now()}`,
            from: fromMe ? "me" : (jid.split("@")[0]),
            fromMe,
            body,
            timestamp,
            type: Object.keys(msg.message ?? {})[0] ?? "text",
          };

          // Store message
          if (!this.messages.has(jid)) this.messages.set(jid, []);
          const existing = this.messages.get(jid)!;
          if (!existing.find(m => m.id === waMsg.id)) {
            existing.push(waMsg);
            existing.sort((a, b) => a.timestamp - b.timestamp);
          }

          // Update chat
          const chat: WaChat = this.chats.get(jid) ?? {
            jid, name: jid.split("@")[0], unread: 0,
            isGroup: jid.endsWith("@g.us"),
          };
          chat.lastMessage = body;
          chat.lastTimestamp = timestamp;
          if (!fromMe && type === "notify") chat.unread = (chat.unread ?? 0) + 1;
          this.chats.set(jid, chat);

          // Broadcast to admin SSE clients
          this.broadcast("message", { jid, message: waMsg, chat });
        }
      });

      // Chat updates (read receipts, etc.)
      this.sock.ev.on("chats.update", (updates: any[]) => {
        for (const update of updates) {
          const existing = this.chats.get(update.id);
          if (existing) {
            if (update.unreadCount !== undefined) existing.unread = update.unreadCount;
            this.chats.set(update.id, existing);
          }
        }
      });

    } catch (err: any) {
      console.error("[WhatsApp] connect error:", err?.message);
      this.status = "disconnected";
      this.broadcast("status", { status: "disconnected", error: err?.message });
    }
  }

  // ── Load recent chats from sock ────────────────────────────────────────────
  private async loadChats() {
    try {
      const store = this.sock?.store;
      if (!store) return;
      // Store is optional — chats populate via events
    } catch { /* ignore */ }
  }

  // ── Send message ───────────────────────────────────────────────────────────
  async sendMessage(jid: string, text: string): Promise<boolean> {
    if (!this.sock || this.status !== "connected") return false;
    try {
      await this.sock.sendMessage(jid, { text });
      // Mark our own message
      const waMsg: WaMessage = {
        id: `out_${Date.now()}`,
        from: "me",
        fromMe: true,
        body: text,
        timestamp: Date.now(),
      };
      if (!this.messages.has(jid)) this.messages.set(jid, []);
      this.messages.get(jid)!.push(waMsg);
      const chat: WaChat = this.chats.get(jid) ?? { jid, name: jid.split("@")[0], unread: 0, isGroup: jid.endsWith("@g.us") };
      chat.lastMessage = text;
      chat.lastTimestamp = Date.now();
      this.chats.set(jid, chat);
      this.broadcast("message", { jid, message: waMsg, chat });
      return true;
    } catch (err: any) {
      console.error("[WhatsApp] send error:", err?.message);
      return false;
    }
  }

  // ── Mark as read ───────────────────────────────────────────────────────────
  async markRead(jid: string) {
    try {
      const msgs = this.messages.get(jid) ?? [];
      const keys = msgs.filter(m => !m.fromMe).map(m => ({ id: m.id, remoteJid: jid, fromMe: false }));
      if (keys.length && this.sock) await this.sock.readMessages(keys);
      const chat = this.chats.get(jid);
      if (chat) { chat.unread = 0; this.chats.set(jid, chat); }
    } catch { /* ignore */ }
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  async logout() {
    try {
      if (this.sock) await this.sock.logout().catch(() => {});
    } catch { /* ignore */ }
    this.sock = null;
    this.status = "disconnected";
    this.qrCode = null;
    this.chats.clear();
    this.messages.clear();
    fs.rmSync(this.authDir, { recursive: true, force: true });
    fs.mkdirSync(this.authDir, { recursive: true });
    this.broadcast("status", { status: "disconnected" });
  }

  // ── Getters ────────────────────────────────────────────────────────────────
  getChats(): WaChat[] {
    return Array.from(this.chats.values())
      .sort((a, b) => (b.lastTimestamp ?? 0) - (a.lastTimestamp ?? 0));
  }

  getMessages(jid: string): WaMessage[] {
    return this.messages.get(jid) ?? [];
  }

  getStatus() {
    return {
      status: this.status,
      qr: this.qrCode,
      name: this.sock?.user?.name ?? null,
      phone: this.sock?.user?.id?.split(":")[0] ?? null,
      chatCount: this.chats.size,
    };
  }

  // Auto-start if session exists
  async tryAutoConnect() {
    const credsFile = path.join(this.authDir, "creds.json");
    if (fs.existsSync(credsFile)) {
      await this.connect();
    }
  }
}

// Singleton
export const whatsappService = new WhatsAppService();
// Auto-connect on startup if session saved
whatsappService.tryAutoConnect().catch(() => {});
