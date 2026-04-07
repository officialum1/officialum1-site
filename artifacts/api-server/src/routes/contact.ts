import { Router, type IRouter } from "express";
import { db, contactsTable, newsletterTable } from "@workspace/db";
import { SubmitContactBody, SubscribeNewsletterBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/contact", async (req, res): Promise<void> => {
  const parsed = SubmitContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db.insert(contactsTable).values(parsed.data);
  res.status(201).json({ success: true, message: "Your message has been received. We will get back to you within 24 hours." });
});

router.post("/newsletter/subscribe", async (req, res): Promise<void> => {
  const parsed = SubscribeNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, name } = parsed.data;

  try {
    await db.insert(newsletterTable).values({ email, name: name ?? null });
    res.status(201).json({ success: true, message: "Successfully subscribed to the newsletter!" });
  } catch {
    res.status(400).json({ error: "Email already subscribed" });
  }
});

export default router;
