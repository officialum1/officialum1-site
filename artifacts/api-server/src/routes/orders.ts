import { Router, type IRouter } from "express";
import { db, ordersTable, productsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CheckoutBody, GetOrderParams } from "@workspace/api-zod";
import crypto from "crypto";

const router: IRouter = Router();

router.get("/orders/recent", async (_req, res): Promise<void> => {
  const recentOrders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(10);
  const typedOrders = recentOrders as typeof ordersTable.$inferSelect[];

  const result = typedOrders.map((o: typeof ordersTable.$inferSelect) => {
    const items = o.items as Array<{ name: string; productId: number }>;
    const firstItem = items[0];
    const productName = firstItem?.name ?? "Product";

    const diffMs = Date.now() - new Date(o.createdAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    let timeAgo = "";
    if (diffMins < 1) timeAgo = "just now";
    else if (diffMins < 60) timeAgo = `${diffMins}m ago`;
    else if (diffMins < 1440) timeAgo = `${Math.floor(diffMins / 60)}h ago`;
    else timeAgo = `${Math.floor(diffMins / 1440)}d ago`;

    return { productName, platform: null, timeAgo };
  });

  res.json(result);
});

router.get("/orders", async (req, res): Promise<void> => {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    res.json([]);
    return;
  }

  const orders = await db.select().from(ordersTable)
    .where(eq(ordersTable.userId, userId))
    .orderBy(desc(ordersTable.createdAt));

  res.json(orders.map(formatOrder));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetOrderParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid order ID" });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(formatOrder(order));
});

router.post("/orders/checkout", async (req, res): Promise<void> => {
  const parsed = CheckoutBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { paymentMethod, email, name } = parsed.data;

  const sessionCart = req.headers["x-cart-data"];
  let cartItems: Array<{ productId: number; name: string; price: number; imageUrl?: string | null; quantity: number }> = [];

  if (typeof sessionCart === "string") {
    try {
      cartItems = JSON.parse(Buffer.from(sessionCart, "base64").toString());
    } catch {
      cartItems = [];
    }
  }

  if (cartItems.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryToken = crypto.randomBytes(16).toString("hex");
  const userId = getUserIdFromRequest(req);

  const [order] = await db.insert(ordersTable).values({
    userId: userId ?? null,
    email,
    name,
    status: "completed",
    total: String(total),
    items: cartItems,
    paymentMethod,
    deliveryToken,
  }).returning();

  res.status(201).json({
    orderId: order.id,
    deliveryToken: order.deliveryToken,
    message: "Order placed successfully",
  });
});

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

function formatOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id,
    status: o.status,
    total: Number(o.total),
    items: o.items,
    paymentMethod: o.paymentMethod,
    createdAt: o.createdAt.toISOString(),
    deliveryToken: o.deliveryToken ?? null,
  };
}

export default router;
