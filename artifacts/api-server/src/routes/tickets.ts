import { Router, type IRouter } from "express";
import { db, ticketsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateTicketBody, ReplyToTicketParams, ReplyToTicketBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/tickets", async (req, res): Promise<void> => {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    res.json([]);
    return;
  }

  const tickets = await db.select().from(ticketsTable)
    .where(eq(ticketsTable.userId, userId))
    .orderBy(desc(ticketsTable.createdAt));

  res.json(tickets.map(formatTicket));
});

router.post("/tickets", async (req, res): Promise<void> => {
  const parsed = CreateTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = getUserIdFromRequest(req);
  const { subject, message, priority, orderId } = parsed.data;

  const [ticket] = await db.insert(ticketsTable).values({
    userId: userId ?? null,
    subject,
    message,
    priority,
    orderId: orderId ?? null,
    status: "open",
    replies: [],
  }).returning();

  res.status(201).json(formatTicket(ticket));
});

router.post("/tickets/:id/reply", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ReplyToTicketParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const parsed = ReplyToTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [ticket] = await db.select().from(ticketsTable).where(eq(ticketsTable.id, params.data.id));
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const existingReplies = (ticket.replies as Array<{ id: number; author: string; isStaff: boolean; message: string; createdAt: string }>) ?? [];
  const newReply = {
    id: existingReplies.length + 1,
    author: "Customer",
    isStaff: false,
    message: parsed.data.message,
    createdAt: new Date().toISOString(),
  };

  const [updated] = await db.update(ticketsTable)
    .set({ replies: [...existingReplies, newReply] })
    .where(eq(ticketsTable.id, params.data.id))
    .returning();

  res.status(201).json(formatTicket(updated));
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

function formatTicket(t: typeof ticketsTable.$inferSelect) {
  return {
    id: t.id,
    subject: t.subject,
    status: t.status,
    priority: t.priority,
    message: t.message,
    replies: t.replies ?? [],
    createdAt: t.createdAt.toISOString(),
  };
}

export default router;
