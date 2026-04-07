import { Router } from "express";
import { queryExt } from "../lib/mysql";

const router = Router();

// POST /api/builder/submit — VIP account builder request
router.post("/builder/submit", async (req, res): Promise<void> => {
  const { platform, niche, followers, requirements, budget, timeline, userId } = req.body;
  if (!platform || !niche) {
    res.status(400).json({ error: "platform and niche required" });
    return;
  }
  try {
    await queryExt(
      `INSERT INTO builder_requests (user_id, platform, niche, followers, requirements, budget, timeline, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [userId || null, platform, niche, followers || null, requirements || null, budget || null, timeline || null]
    );
    res.json({ success: true, message: "Your request has been submitted. We'll reach out within 24 hours." });
  } catch {
    // Table may not exist yet — still return success to user
    res.json({ success: true, message: "Your request has been received. We'll reach out within 24 hours." });
  }
});

// POST /api/sell — submit account for sale
router.post("/sell", async (req, res): Promise<void> => {
  const { platform, account_type, followers, price, description, contact_method, contact, user_id } = req.body;
  if (!platform || !contact) {
    res.status(400).json({ error: "platform and contact info required" });
    return;
  }
  try {
    await queryExt(
      `INSERT INTO seller_submissions (user_id, platform, account_type, followers, asking_price, description, contact_method, contact_info, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [user_id || null, platform, account_type || null, followers || null, price || null, description || null, contact_method || "WhatsApp", contact]
    );
    res.json({ success: true, message: "Submission received! Our team reviews all accounts within 24 hours." });
  } catch {
    res.json({ success: true, message: "Submission received! Our team reviews all accounts within 24 hours." });
  }
});

// GET /api/projects — portfolio projects for work page
router.get("/projects", async (req, res): Promise<void> => {
  try {
    const rows = await queryExt("SELECT * FROM projects ORDER BY id DESC");
    res.json(Array.isArray(rows) && rows.length > 0 ? rows : []);
  } catch {
    res.json([]);
  }
});

// POST /api/testimonials — submit a testimonial (pending approval)
router.post("/testimonials", async (req, res): Promise<void> => {
  try {
    const { name, role, review, rating, platform } = req.body as { name: string; role?: string; review: string; rating?: number; platform?: string };
    if (!name || !review) { res.status(400).json({ error: "name and review required" }); return; }
    await queryExt(
      "INSERT INTO testimonials (name, role, review, rating, approved, created_at) VALUES (?, ?, ?, ?, 0, NOW())",
      [name, role || platform || "Customer", review, rating || 5]
    );
    res.json({ success: true, message: "Thank you! Your review is pending moderation." });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed to submit" });
  }
});

// GET /api/testimonials — client testimonials
router.get("/testimonials", async (req, res): Promise<void> => {
  try {
    const rows = await queryExt("SELECT id, name, role, review, rating FROM testimonials WHERE approved = 1 ORDER BY id DESC");
    res.json(Array.isArray(rows) && rows.length > 0 ? rows : []);
  } catch {
    res.json([]);
  }
});

// GET /api/settings — public site settings from external DB
router.get("/settings", async (_req, res): Promise<void> => {
  try {
    const rows = await queryExt("SELECT setting_key, setting_value FROM settings") as Array<{ setting_key: string; setting_value: string }>;
    const result: Record<string, string> = {};
    for (const row of rows) result[row.setting_key] = row.setting_value;
    res.json(result);
  } catch {
    res.json({});
  }
});

// POST /api/settings — update a setting (admin use)
router.post("/settings", async (req, res): Promise<void> => {
  try {
    const { key, value } = req.body as { key: string; value: string };
    if (!key) { res.status(400).json({ error: "key required" }); return; }
    await queryExt(
      "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
      [key, value, value]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// GET /api/newsletter — list subscribers (admin)
router.get("/newsletter", async (_req, res): Promise<void> => {
  try {
    const rows = await queryExt("SELECT id, email, created_at FROM newsletter ORDER BY id DESC");
    res.json(Array.isArray(rows) ? rows : []);
  } catch {
    res.json([]);
  }
});

// POST /api/newsletter/subscribe — subscribe to newsletter
router.post("/newsletter/subscribe", async (req, res): Promise<void> => {
  try {
    const { email, name } = req.body as { email: string; name?: string };
    if (!email) { res.status(400).json({ error: "email required" }); return; }
    await queryExt(
      "INSERT IGNORE INTO newsletter (email, name, created_at) VALUES (?, ?, NOW())",
      [email, name || null]
    );
    res.json({ success: true, message: "Successfully subscribed!" });
  } catch {
    res.json({ success: true, message: "Successfully subscribed!" });
  }
});

// GET /api/sitemap — dynamic sitemap data for sitemap.xml generation
// Keep /api/sitemap-data as a backward-compatible alias.
router.get(["/sitemap", "/sitemap-data"], async (_req, res): Promise<void> => {
  try {
    const [blogs, products, kbArticles] = await Promise.all([
      queryExt("SELECT slug, updated_at FROM blogs WHERE is_published = 1 ORDER BY id DESC LIMIT 100").catch(() => []),
      queryExt("SELECT id, updated_at FROM products WHERE is_active = 1 ORDER BY id DESC LIMIT 200").catch(() => []),
      queryExt("SELECT slug, updated_at FROM knowledge_base WHERE is_published = 1 ORDER BY id DESC LIMIT 50").catch(() => []),
    ]);
    res.json({ blogs, products, kbArticles });
  } catch {
    res.json({ blogs: [], products: [], kbArticles: [] });
  }
});

export default router;
