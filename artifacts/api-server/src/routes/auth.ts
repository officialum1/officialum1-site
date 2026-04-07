import { Router, type IRouter } from "express";
import { db, usersTable, ordersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import crypto from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "um1salt2024").digest("hex");
}

function makeToken(userId: number, email: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64");
  const payload = Buffer.from(JSON.stringify({ id: userId, email, iat: Date.now() })).toString("base64");
  const sig = crypto.createHmac("sha256", "um1secret2024").update(`${header}.${payload}`).digest("base64");
  return `${header}.${payload}.${sig}`;
}

function getUserIdFromToken(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(Buffer.from(parts[1] ?? "", "base64").toString());
    return typeof payload.id === "number" ? payload.id : null;
  } catch {
    return null;
  }
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password, name } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const referralCode = crypto.randomBytes(5).toString("hex").toUpperCase();
  const [user] = await db.insert(usersTable).values({
    email,
    password: hashPassword(password),
    name,
    referralCode,
    role: "buyer",
    walletBalance: "0",
  }).returning();

  const token = makeToken(user.id, user.email);

  res.status(201).json({
    user: formatUser(user),
    token,
    message: "Registration successful",
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  if (!user || user.password !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = makeToken(user.id, user.email);

  res.json({
    user: formatUser(user),
    token,
    message: "Login successful",
  });
});

router.post("/auth/logout", async (_req, res): Promise<void> => {
  res.sendStatus(204);
});

// POST /api/auth/forgot-password — send password reset (always returns success to prevent enumeration)
router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const { email } = req.body as { email?: string };
  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "Valid email required" });
    return;
  }
  // In production you'd send a real reset email here
  // For now we always respond success (prevents email enumeration)
  res.json({ success: true, message: "If that email exists, a reset link has been sent." });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const userId = getUserIdFromToken(auth.split(" ")[1] ?? "");
  if (!userId) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json(formatUser(user));
});

router.get("/dashboard", async (req, res): Promise<void> => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const userId = getUserIdFromToken(auth.split(" ")[1] ?? "");
  if (!userId) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const orders = await db.select().from(ordersTable)
    .where(eq(ordersTable.userId, userId))
    .orderBy(desc(ordersTable.createdAt))
    .limit(5);
  const typedOrders = orders as typeof ordersTable.$inferSelect[];

  const totalSpent = typedOrders.reduce((sum: number, o: typeof ordersTable.$inferSelect) => sum + Number(o.total), 0);

  res.json({
    user: formatUser(user),
    recentOrders: typedOrders.map((o: typeof ordersTable.$inferSelect) => ({
      id: o.id,
      status: o.status,
      total: Number(o.total),
      items: o.items,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt.toISOString(),
      deliveryToken: o.deliveryToken ?? null,
    })),
    walletBalance: Number(user.walletBalance),
    totalOrders: typedOrders.length,
    totalSpent,
    referralEarnings: 0,
    openTickets: 0,
  });
});

function formatUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    walletBalance: Number(u.walletBalance),
    referralCode: u.referralCode,
    membershipTier: u.membershipTier ?? null,
    createdAt: u.createdAt.toISOString(),
  };
}

export default router;
