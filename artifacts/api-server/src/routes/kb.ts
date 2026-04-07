import { Router } from "express";
import { queryExt } from "../lib/mysql";

const router = Router();

// GET /api/kb — list all published KB articles
router.get("/kb", async (req, res): Promise<void> => {
  try {
    const category = req.query.category as string | undefined;
    let rows: any[];
    if (category) {
      rows = await queryExt(
        "SELECT id, title, slug, category, views, is_published, created_at, meta_description, keywords FROM knowledge_base WHERE is_published = 1 AND category = ? ORDER BY id DESC",
        [category]
      );
    } else {
      rows = await queryExt(
        "SELECT id, title, slug, category, views, is_published, created_at, meta_description, keywords FROM knowledge_base WHERE is_published = 1 ORDER BY id DESC"
      );
    }
    res.json(Array.isArray(rows) ? rows : []);
  } catch {
    res.json([]);
  }
});

// GET /api/kb/:slug — single article by slug
router.get("/kb/:slug", async (req, res): Promise<void> => {
  try {
    const rows = await queryExt("SELECT * FROM knowledge_base WHERE slug = ? LIMIT 1", [req.params.slug]);
    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(404).json({ error: "Article not found" });
      return;
    }
    // Increment view count
    await queryExt("UPDATE knowledge_base SET views = COALESCE(views, 0) + 1 WHERE slug = ?", [req.params.slug]).catch(() => {});
    res.json(rows[0]);
  } catch {
    res.status(404).json({ error: "Article not found" });
  }
});

// POST /api/kb — create article (admin)
router.post("/kb", async (req, res): Promise<void> => {
  try {
    const { title, slug, category, content, is_published, meta_description, keywords } = req.body;
    if (!title || !content) { res.status(400).json({ error: "title and content required" }); return; }
    const safeSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await queryExt(
      "INSERT INTO knowledge_base (title, slug, category, content, is_published, meta_description, keywords, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
      [title, safeSlug, category || "General", content, is_published ? 1 : 0, meta_description || null, keywords || null]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Create failed" });
  }
});

// PUT /api/kb — update article (admin)
router.put("/kb", async (req, res): Promise<void> => {
  try {
    const id = req.query.id as string;
    if (!id) { res.status(400).json({ error: "id required" }); return; }
    const body = req.body ?? {};
    // Build dynamic SET clause for only provided fields
    const allowed: Record<string, unknown> = {};
    if (body.title !== undefined) allowed.title = body.title;
    if (body.slug !== undefined) allowed.slug = body.slug;
    if (body.category !== undefined) allowed.category = body.category || "General";
    if (body.content !== undefined) allowed.content = body.content;
    if (body.is_published !== undefined) allowed.is_published = body.is_published ? 1 : 0;
    if (body.meta_description !== undefined) allowed.meta_description = body.meta_description || null;
    if (body.keywords !== undefined) allowed.keywords = body.keywords || null;
    if (Object.keys(allowed).length === 0) { res.status(400).json({ error: "No fields to update" }); return; }
    const setClauses = Object.keys(allowed).map(k => `${k} = ?`).join(", ");
    await queryExt(
      `UPDATE knowledge_base SET ${setClauses}, updated_at = NOW() WHERE id = ?`,
      [...Object.values(allowed), id]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Update failed" });
  }
});

// DELETE /api/kb — delete article (admin)
router.delete("/kb", async (req, res): Promise<void> => {
  try {
    const id = req.query.id as string;
    if (!id) { res.status(400).json({ error: "id required" }); return; }
    await queryExt("DELETE FROM knowledge_base WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Delete failed" });
  }
});

export default router;
