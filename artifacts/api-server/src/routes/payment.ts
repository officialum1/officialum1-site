import { Router } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { queryExt } from "../lib/mysql.js";
import crypto from "crypto";

const router = Router();

// ── Settings helper ───────────────────────────────────────────────────────────
async function getSettings(keys: string[]): Promise<Record<string, string>> {
  try {
    const placeholders = keys.map(() => "?").join(",");
    const rows = await queryExt<{ setting_key: string; setting_value: string }>(
      `SELECT \`setting_key\`, \`setting_value\` FROM \`settings\` WHERE \`setting_key\` IN (${placeholders})`,
      keys
    );
    const result: Record<string, string> = {};
    for (const row of rows) result[row.setting_key] = row.setting_value;
    return result;
  } catch {
    return {};
  }
}

function getUserIdFromRequest(req: import("express").Request): number | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const payload = JSON.parse(Buffer.from(auth.split(".")[1] ?? "", "base64").toString());
    return typeof payload.id === "number" ? payload.id : null;
  } catch {
    return null;
  }
}

// ── GET /api/payment/config ───────────────────────────────────────────────────
router.get("/payment/config", async (_req, res): Promise<void> => {
  try {
    const settings = await getSettings(["payment_gateways", "enable_stripe", "enable_cryptomus"]);
    let gateways: Record<string, boolean> = { stripe: false, crypto: false, wallet: true };
    if (settings.payment_gateways) {
      try { gateways = JSON.parse(settings.payment_gateways); } catch { /* ignore */ }
    }
    if (settings.enable_stripe === "true") gateways.stripe = true;
    if (settings.enable_cryptomus === "true") gateways.crypto = true;
    res.json({ gateways });
  } catch {
    res.json({ gateways: { stripe: true, crypto: true, wallet: true } });
  }
});

// ── POST /api/payment/stripe/session ─────────────────────────────────────────
// Creates a Stripe Checkout Session and returns the hosted payment URL
router.post("/payment/stripe/session", async (req, res): Promise<void> => {
  const { email, name, items, successUrl, cancelUrl } = req.body as {
    email: string;
    name: string;
    items: Array<{ productId: number; name: string; price: number; quantity: number; imageUrl?: string | null }>;
    successUrl: string;
    cancelUrl: string;
  };

  if (!email || !name || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const settings = await getSettings(["stripeSecret"]);
    const stripeSecret = settings.stripeSecret;
    if (!stripeSecret) {
      res.status(503).json({ error: "Stripe not configured" });
      return;
    }

    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(stripeSecret);

    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const deliveryToken = crypto.randomBytes(16).toString("hex");
    const userId = getUserIdFromRequest(req);

    const [order] = await db.insert(ordersTable).values({
      userId: userId ?? null,
      email,
      name,
      status: "pending",
      total: String(total),
      items,
      paymentMethod: "stripe",
      deliveryToken,
    }).returning();

    const lineItems = items.map(item => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${successUrl}?orderId=${order.id}&gateway=stripe`,
      cancel_url: cancelUrl,
      metadata: { orderId: String(order.id) },
    });

    res.json({ url: session.url, orderId: order.id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to create Stripe session";
    console.error("Stripe session error:", msg);
    res.status(500).json({ error: msg });
  }
});

// ── POST /api/payment/stripe/webhook ─────────────────────────────────────────
// Stripe calls this when payment is completed
router.post("/payment/stripe/webhook", async (req, res): Promise<void> => {
  try {
    const event = req.body as { type: string; data?: { object?: { metadata?: { orderId?: string } } } };

    if (event.type === "checkout.session.completed") {
      const session = event.data?.object;
      const orderId = parseInt(session?.metadata?.orderId ?? "0", 10);
      if (orderId) {
        await db.update(ordersTable)
          .set({ status: "completed" })
          .where(eq(ordersTable.id, orderId));
      }
    }

    res.json({ received: true });
  } catch {
    res.status(400).json({ error: "Webhook error" });
  }
});

// ── POST /api/payment/cryptomus/create ───────────────────────────────────────
// Creates a Cryptomus payment invoice
router.post("/payment/cryptomus/create", async (req, res): Promise<void> => {
  const { email, name, items, successUrl, callbackUrl } = req.body as {
    email: string;
    name: string;
    items: Array<{ productId: number; name: string; price: number; quantity: number }>;
    successUrl: string;
    callbackUrl?: string;
  };

  if (!email || !name || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const settings = await getSettings(["cryptomusKey", "cryptomusId"]);
    const apiKey = settings.cryptomusKey;
    const merchantId = settings.cryptomusId;

    if (!apiKey || !merchantId) {
      res.status(503).json({ error: "Cryptomus not configured" });
      return;
    }

    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const deliveryToken = crypto.randomBytes(16).toString("hex");
    const userId = getUserIdFromRequest(req);

    const [order] = await db.insert(ordersTable).values({
      userId: userId ?? null,
      email,
      name,
      status: "pending",
      total: String(total),
      items,
      paymentMethod: "crypto",
      deliveryToken,
    }).returning();

    const payload: Record<string, string> = {
      amount: total.toFixed(2),
      currency: "USD",
      order_id: `um1_${order.id}_${Date.now()}`,
      url_success: `${successUrl}?orderId=${order.id}&gateway=crypto`,
    };

    if (callbackUrl) {
      payload.url_callback = callbackUrl;
    }

    const bodyJson = JSON.stringify(payload);
    const sign = crypto.createHash("md5")
      .update(Buffer.from(bodyJson).toString("base64") + apiKey)
      .digest("hex");

    const response = await fetch("https://api.cryptomus.com/v1/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "merchant": merchantId,
        "sign": sign,
      },
      body: bodyJson,
    });

    const data = await response.json() as { state?: number; result?: { url?: string }; message?: string };

    if (!response.ok || data.state !== 0) {
      throw new Error(data.message ?? `Cryptomus API error (${response.status})`);
    }

    res.json({ url: data.result?.url, orderId: order.id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to create crypto payment";
    console.error("Cryptomus error:", msg);
    res.status(500).json({ error: msg });
  }
});

// ── POST /api/payment/cryptomus/webhook ──────────────────────────────────────
router.post("/payment/cryptomus/webhook", async (req, res): Promise<void> => {
  try {
    const settings = await getSettings(["cryptomusKey"]);
    const apiKey = settings.cryptomusKey;

    const body = { ...req.body } as Record<string, string>;
    const receivedSign = body.sign;
    delete body.sign;

    const bodyJson = JSON.stringify(body);
    const expectedSign = crypto.createHash("md5")
      .update(Buffer.from(bodyJson).toString("base64") + (apiKey ?? ""))
      .digest("hex");

    if (apiKey && receivedSign !== expectedSign) {
      res.status(400).json({ error: "Invalid signature" });
      return;
    }

    const status = body.payment_status ?? body.status;
    if (status === "paid" || status === "paid_over") {
      const orderIdMatch = String(body.order_id ?? "").match(/um1_(\d+)_/);
      if (orderIdMatch) {
        const orderId = parseInt(orderIdMatch[1], 10);
        await db.update(ordersTable)
          .set({ status: "completed" })
          .where(eq(ordersTable.id, orderId));
      }
    }

    res.json({ received: true });
  } catch {
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;
