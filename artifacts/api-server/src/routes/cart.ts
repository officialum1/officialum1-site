import { Router, type IRouter } from "express";
import { AddToCartBody, RemoveFromCartParams } from "@workspace/api-zod";

const router: IRouter = Router();

const sessionCarts = new Map<string, Array<{ productId: number; name: string; price: number; imageUrl: string | null; quantity: number }>>();

function getSessionId(req: import("express").Request): string {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    return `user_${auth.slice(7, 27)}`;
  }
  const forwarded = req.headers["x-forwarded-for"];
  const ip = typeof forwarded === "string" ? forwarded.split(",")[0] : req.ip ?? "anon";
  return `ip_${ip}`;
}

function buildCartResponse(items: Array<{ productId: number; name: string; price: number; imageUrl: string | null; quantity: number }>) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  return {
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    total: Math.round(subtotal * 100) / 100,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
  };
}

router.get("/cart", (req, res): void => {
  const sid = getSessionId(req);
  const items = sessionCarts.get(sid) ?? [];
  res.json(buildCartResponse(items));
});

router.post("/cart/add", async (req, res): Promise<void> => {
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { productId, quantity } = parsed.data;
  const sid = getSessionId(req);

  const { db, productsTable } = await import("@workspace/db");
  const { eq } = await import("drizzle-orm");

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const items = sessionCarts.get(sid) ?? [];
  const existing = items.find(i => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ productId, name: product.name, price: Number(product.price), imageUrl: product.imageUrl ?? null, quantity });
  }

  sessionCarts.set(sid, items);
  res.json(buildCartResponse(items));
});

router.delete("/cart/remove/:productId", (req, res): void => {
  const rawId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const params = RemoveFromCartParams.safeParse({ productId: parseInt(rawId ?? "0", 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }

  const sid = getSessionId(req);
  const items = (sessionCarts.get(sid) ?? []).filter(i => i.productId !== params.data.productId);
  sessionCarts.set(sid, items);
  res.json(buildCartResponse(items));
});

router.delete("/cart/clear", (req, res): void => {
  const sid = getSessionId(req);
  sessionCarts.delete(sid);
  res.sendStatus(204);
});

export default router;
