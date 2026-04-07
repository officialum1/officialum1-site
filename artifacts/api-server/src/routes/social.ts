import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { queryExt } from "../lib/mysql";
import crypto from "crypto";

const router: IRouter = Router();
const HMAC_KEY = process.env.SESSION_SECRET ?? "um1admin2024";

function verifyAdminToken(token: string): boolean {
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return false;
    const expectedSig = crypto.createHmac("sha256", HMAC_KEY).update(payload).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (data.role !== "admin") return false;
    if (Date.now() > data.exp) return false;
    return true;
  } catch { return false; }
}
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return; }
  if (!verifyAdminToken(auth.slice(7))) { res.status(401).json({ error: "Invalid or expired token" }); return; }
  next();
}

// ── Ensure social tables exist ─────────────────────────────────────────────
async function ensureSocialTables() {
  await queryExt(`CREATE TABLE IF NOT EXISTS social_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    caption TEXT NOT NULL,
    image_url TEXT DEFAULT NULL,
    platforms VARCHAR(200) DEFAULT 'instagram,facebook',
    status VARCHAR(50) DEFAULT 'draft',
    scheduled_at DATETIME DEFAULT NULL,
    published_at DATETIME DEFAULT NULL,
    ig_post_id VARCHAR(200) DEFAULT NULL,
    fb_post_id VARCHAR(200) DEFAULT NULL,
    tw_post_id VARCHAR(200) DEFAULT NULL,
    likes INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares INT DEFAULT 0,
    reach INT DEFAULT 0,
    impressions INT DEFAULT 0,
    error_msg TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`).catch(() => {});

  await queryExt(`CREATE TABLE IF NOT EXISTS social_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    platform VARCHAR(50) DEFAULT 'instagram',
    platform_comment_id VARCHAR(200) DEFAULT NULL,
    author VARCHAR(200) DEFAULT NULL,
    text TEXT NOT NULL,
    replied TINYINT DEFAULT 0,
    reply_text TEXT DEFAULT NULL,
    replied_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`).catch(() => {});
}
ensureSocialTables();

// ── Helper: get setting value ───────────────────────────────────────────────
async function getSetting(key: string): Promise<string | null> {
  try {
    const rows = await queryExt<{ value: string }>(`SELECT value FROM settings WHERE \`key\`=? LIMIT 1`, [key]);
    return rows[0]?.value ?? null;
  } catch { return null; }
}
async function getSettings(keys: string[]): Promise<Record<string, string>> {
  try {
    const placeholders = keys.map(() => "?").join(",");
    const rows = await queryExt<{ key: string; value: string }>(
      `SELECT \`key\`, value FROM settings WHERE \`key\` IN (${placeholders})`, keys
    );
    const result: Record<string, string> = {};
    rows.forEach(r => { result[r.key] = r.value; });
    return result;
  } catch { return {}; }
}

// ── GET /api/admin/social/posts ────────────────────────────────────────────
router.get("/admin/social/posts", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const posts = await queryExt(`SELECT * FROM social_posts ORDER BY id DESC LIMIT 100`);
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts", detail: err instanceof Error ? err.message : String(err) });
  }
});

// ── POST /api/admin/social/posts (create draft) ────────────────────────────
router.post("/admin/social/posts", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { caption, image_url, platforms, scheduled_at } = req.body;
  if (!caption) { res.status(400).json({ error: "Caption required" }); return; }
  try {
    const status = scheduled_at ? "scheduled" : "draft";
    await queryExt(
      `INSERT INTO social_posts (caption, image_url, platforms, status, scheduled_at) VALUES (?, ?, ?, ?, ?)`,
      [caption, image_url ?? null, platforms ?? "instagram,facebook", status, scheduled_at ?? null]
    );
    const [post] = await queryExt(`SELECT * FROM social_posts ORDER BY id DESC LIMIT 1`);
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ error: "Failed to create post", detail: err instanceof Error ? err.message : String(err) });
  }
});

// ── DELETE /api/admin/social/posts/:id ────────────────────────────────────
router.delete("/admin/social/posts/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    await queryExt(`DELETE FROM social_posts WHERE id=?`, [req.params.id]);
    await queryExt(`DELETE FROM social_comments WHERE post_id=?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// ── POST /api/admin/social/publish/:id ────────────────────────────────────
router.post("/admin/social/publish/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const posts = await queryExt<any>(`SELECT * FROM social_posts WHERE id=?`, [id]);
    if (!posts.length) { res.status(404).json({ error: "Post not found" }); return; }
    const post = posts[0];
    const platforms: string[] = (post.platforms ?? "instagram,facebook").split(",").map((p: string) => p.trim());

    const settings = await getSettings([
      "social_meta_token", "social_meta_page_id", "social_meta_ig_id",
      "social_tw_api_key", "social_tw_api_secret", "social_tw_token", "social_tw_token_secret"
    ]);

    const results: Record<string, { success: boolean; post_id?: string; error?: string }> = {};
    let igPostId: string | null = null;
    let fbPostId: string | null = null;
    let twPostId: string | null = null;

    // ── Instagram via Meta Graph API ───────────────────────────────────────
    if (platforms.includes("instagram") && settings.social_meta_token && settings.social_meta_ig_id) {
      try {
        // Step 1: Create media container
        const containerBody = new URLSearchParams();
        containerBody.set("caption", post.caption);
        containerBody.set("access_token", settings.social_meta_token);
        if (post.image_url) {
          containerBody.set("image_url", post.image_url);
          containerBody.set("media_type", "IMAGE");
        } else {
          containerBody.set("media_type", "IMAGE");
          containerBody.set("image_url", "https://officialum1.com/og-image.png");
        }

        const containerRes = await fetch(
          `https://graph.facebook.com/v19.0/${settings.social_meta_ig_id}/media`,
          { method: "POST", body: containerBody }
        );
        const containerData = await containerRes.json() as any;

        if (containerData.id) {
          // Step 2: Publish
          const publishBody = new URLSearchParams();
          publishBody.set("creation_id", containerData.id);
          publishBody.set("access_token", settings.social_meta_token);
          const publishRes = await fetch(
            `https://graph.facebook.com/v19.0/${settings.social_meta_ig_id}/media_publish`,
            { method: "POST", body: publishBody }
          );
          const publishData = await publishRes.json() as any;
          igPostId = publishData.id ?? null;
          results.instagram = { success: !!igPostId, post_id: igPostId ?? undefined, error: publishData.error?.message };
        } else {
          results.instagram = { success: false, error: containerData.error?.message ?? "Container creation failed" };
        }
      } catch (e) {
        results.instagram = { success: false, error: e instanceof Error ? e.message : String(e) };
      }
    } else if (platforms.includes("instagram")) {
      results.instagram = { success: false, error: "Instagram not connected. Add credentials in Settings." };
    }

    // ── Facebook Page via Graph API ────────────────────────────────────────
    if (platforms.includes("facebook") && settings.social_meta_token && settings.social_meta_page_id) {
      try {
        const body = new URLSearchParams();
        body.set("message", post.caption);
        body.set("access_token", settings.social_meta_token);
        if (post.image_url) body.set("link", post.image_url);

        const fbRes = await fetch(
          `https://graph.facebook.com/v19.0/${settings.social_meta_page_id}/feed`,
          { method: "POST", body }
        );
        const fbData = await fbRes.json() as any;
        fbPostId = fbData.id ?? null;
        results.facebook = { success: !!fbPostId, post_id: fbPostId ?? undefined, error: fbData.error?.message };
      } catch (e) {
        results.facebook = { success: false, error: e instanceof Error ? e.message : String(e) };
      }
    } else if (platforms.includes("facebook")) {
      results.facebook = { success: false, error: "Facebook not connected. Add credentials in Settings." };
    }

    // ── Twitter/X via v2 API ───────────────────────────────────────────────
    if (platforms.includes("twitter") && settings.social_tw_api_key && settings.social_tw_token) {
      try {
        // OAuth 1.0a signature
        const method = "POST";
        const url = "https://api.twitter.com/2/tweets";
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const nonce = crypto.randomBytes(16).toString("hex");

        const oauthParams: Record<string, string> = {
          oauth_consumer_key: settings.social_tw_api_key,
          oauth_nonce: nonce,
          oauth_signature_method: "HMAC-SHA1",
          oauth_timestamp: timestamp,
          oauth_token: settings.social_tw_token,
          oauth_version: "1.0",
        };
        const sortedParams = Object.entries(oauthParams).sort(([a], [b]) => a.localeCompare(b));
        const paramStr = sortedParams.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
        const baseStr = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramStr)}`;
        const sigKey = `${encodeURIComponent(settings.social_tw_api_secret ?? "")}&${encodeURIComponent(settings.social_tw_token_secret ?? "")}`;
        const signature = crypto.createHmac("sha1", sigKey).update(baseStr).digest("base64");
        oauthParams.oauth_signature = signature;

        const authHeader = "OAuth " + Object.entries(oauthParams)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
          .join(", ");

        const twRes = await fetch(url, {
          method: "POST",
          headers: { "Authorization": authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ text: post.caption.slice(0, 280) })
        });
        const twData = await twRes.json() as any;
        twPostId = twData.data?.id ?? null;
        results.twitter = { success: !!twPostId, post_id: twPostId ?? undefined, error: twData.errors?.[0]?.message };
      } catch (e) {
        results.twitter = { success: false, error: e instanceof Error ? e.message : String(e) };
      }
    } else if (platforms.includes("twitter")) {
      results.twitter = { success: false, error: "Twitter not connected. Add credentials in Settings." };
    }

    const anySuccess = Object.values(results).some(r => r.success);
    const errorMsgs = Object.entries(results).filter(([, v]) => !v.success).map(([k, v]) => `${k}: ${v.error}`).join("; ");

    await queryExt(
      `UPDATE social_posts SET status=?, published_at=?, ig_post_id=?, fb_post_id=?, tw_post_id=?, error_msg=? WHERE id=?`,
      [
        anySuccess ? "published" : "failed",
        anySuccess ? new Date() : null,
        igPostId, fbPostId, twPostId,
        errorMsgs || null,
        id
      ]
    );

    res.json({ success: anySuccess, results });
  } catch (err) {
    res.status(500).json({ error: "Publish failed", detail: err instanceof Error ? err.message : String(err) });
  }
});

// ── POST /api/admin/social/refresh-stats/:id ───────────────────────────────
router.post("/admin/social/refresh-stats/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const posts = await queryExt<any>(`SELECT * FROM social_posts WHERE id=?`, [id]);
    if (!posts.length) { res.status(404).json({ error: "Post not found" }); return; }
    const post = posts[0];
    const settings = await getSettings(["social_meta_token", "social_meta_ig_id"]);

    let likes = Number(post.likes ?? 0);
    let commentsCount = Number(post.comments_count ?? 0);
    let reach = Number(post.reach ?? 0);
    let impressions = Number(post.impressions ?? 0);
    const newComments: Array<{ platform: string; platform_comment_id: string; author: string; text: string }> = [];

    // Fetch Instagram stats + comments
    if (post.ig_post_id && settings.social_meta_token) {
      try {
        const insightsRes = await fetch(
          `https://graph.facebook.com/v19.0/${post.ig_post_id}?fields=like_count,comments_count,reach,impressions&access_token=${settings.social_meta_token}`
        );
        const insightsData = await insightsRes.json() as any;
        if (insightsData.like_count !== undefined) likes = insightsData.like_count;
        if (insightsData.comments_count !== undefined) commentsCount = insightsData.comments_count;
        if (insightsData.reach !== undefined) reach = insightsData.reach;
        if (insightsData.impressions !== undefined) impressions = insightsData.impressions;

        // Fetch comments
        const commentsRes = await fetch(
          `https://graph.facebook.com/v19.0/${post.ig_post_id}/comments?fields=id,username,text,timestamp&access_token=${settings.social_meta_token}`
        );
        const commentsData = await commentsRes.json() as any;
        if (commentsData.data) {
          for (const c of commentsData.data) {
            const exists = await queryExt<{ id: number }>(`SELECT id FROM social_comments WHERE platform_comment_id=?`, [c.id]);
            if (!exists.length) {
              newComments.push({ platform: "instagram", platform_comment_id: c.id, author: c.username, text: c.text });
            }
          }
        }
      } catch { /* ignore */ }
    }

    // Insert new comments
    for (const c of newComments) {
      await queryExt(
        `INSERT INTO social_comments (post_id, platform, platform_comment_id, author, text) VALUES (?, ?, ?, ?, ?)`,
        [id, c.platform, c.platform_comment_id, c.author, c.text]
      ).catch(() => {});
    }

    await queryExt(
      `UPDATE social_posts SET likes=?, comments_count=?, reach=?, impressions=? WHERE id=?`,
      [likes, commentsCount, reach, impressions, id]
    );

    const updatedPost = (await queryExt(`SELECT * FROM social_posts WHERE id=?`, [id]))[0];
    res.json({ success: true, post: updatedPost, newComments: newComments.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to refresh stats", detail: err instanceof Error ? err.message : String(err) });
  }
});

// ── GET /api/admin/social/comments ────────────────────────────────────────
router.get("/admin/social/comments", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const unreplied = req.query.unreplied === "1";
  try {
    const where = unreplied ? "WHERE c.replied=0" : "";
    const comments = await queryExt(
      `SELECT c.*, p.caption as post_caption, p.platforms as post_platforms
       FROM social_comments c
       LEFT JOIN social_posts p ON p.id=c.post_id
       ${where} ORDER BY c.id DESC LIMIT 200`
    );
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comments", detail: err instanceof Error ? err.message : String(err) });
  }
});

// ── POST /api/admin/social/comments/:id/reply ──────────────────────────────
router.post("/admin/social/comments/:id/reply", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { reply_text } = req.body;
  if (!reply_text?.trim()) { res.status(400).json({ error: "Reply text required" }); return; }
  try {
    const comments = await queryExt<any>(`SELECT * FROM social_comments WHERE id=?`, [id]);
    if (!comments.length) { res.status(404).json({ error: "Comment not found" }); return; }
    const comment = comments[0];
    const settings = await getSettings(["social_meta_token"]);

    let apiSuccess = false;
    // Reply on Instagram via Meta Graph API
    if (comment.platform === "instagram" && comment.platform_comment_id && settings.social_meta_token) {
      try {
        const body = new URLSearchParams();
        body.set("message", reply_text);
        body.set("access_token", settings.social_meta_token);
        const replyRes = await fetch(
          `https://graph.facebook.com/v19.0/${comment.platform_comment_id}/replies`,
          { method: "POST", body }
        );
        const replyData = await replyRes.json() as any;
        apiSuccess = !!replyData.id;
      } catch { /* fall through */ }
    }

    // Always save reply locally regardless of API success
    await queryExt(
      `UPDATE social_comments SET replied=1, reply_text=?, replied_at=NOW() WHERE id=?`,
      [reply_text, id]
    );

    res.json({ success: true, api_posted: apiSuccess });
  } catch (err) {
    res.status(500).json({ error: "Reply failed", detail: err instanceof Error ? err.message : String(err) });
  }
});

// ── GET /api/admin/social/stats ────────────────────────────────────────────
router.get("/admin/social/stats", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totals] = await queryExt<any>(
      `SELECT COUNT(*) as total_posts,
              SUM(CASE WHEN status='published' THEN 1 ELSE 0 END) as published,
              SUM(CASE WHEN status='draft' THEN 1 ELSE 0 END) as drafts,
              SUM(CASE WHEN status='scheduled' THEN 1 ELSE 0 END) as scheduled,
              SUM(likes) as total_likes,
              SUM(comments_count) as total_comments,
              SUM(reach) as total_reach,
              SUM(impressions) as total_impressions
       FROM social_posts`
    );
    const [commentTotals] = await queryExt<any>(
      `SELECT COUNT(*) as total, SUM(replied) as replied FROM social_comments`
    );
    res.json({ ...totals, comment_total: commentTotals?.total ?? 0, comment_replied: commentTotals?.replied ?? 0 });
  } catch (err) {
    res.status(500).json({ error: "Stats failed" });
  }
});

// ── GET /api/admin/social/credentials ─────────────────────────────────────
router.get("/admin/social/credentials", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const keys = ["social_meta_token", "social_meta_page_id", "social_meta_ig_id", "social_tw_api_key", "social_tw_api_secret", "social_tw_token", "social_tw_token_secret"];
  const settings = await getSettings(keys);
  // Only reveal whether set, not the actual values
  const status: Record<string, boolean> = {};
  keys.forEach(k => { status[k] = !!(settings[k]?.trim()); });
  const igConnected = !!(settings.social_meta_token && settings.social_meta_ig_id);
  const fbConnected = !!(settings.social_meta_token && settings.social_meta_page_id);
  const twConnected = !!(settings.social_tw_api_key && settings.social_tw_token);
  res.json({ status, igConnected, fbConnected, twConnected });
});

// ── POST /api/admin/social/credentials ────────────────────────────────────
router.post("/admin/social/credentials", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const allowedKeys = ["social_meta_token", "social_meta_page_id", "social_meta_ig_id", "social_tw_api_key", "social_tw_api_secret", "social_tw_token", "social_tw_token_secret"];
  try {
    for (const [key, value] of Object.entries(req.body)) {
      if (!allowedKeys.includes(key)) continue;
      const val = String(value ?? "").trim();
      const exists = await queryExt<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM settings WHERE \`key\`=?`, [key]);
      if (Number(exists[0]?.cnt ?? 0) > 0) {
        await queryExt(`UPDATE settings SET value=? WHERE \`key\`=?`, [val, key]);
      } else {
        await queryExt(`INSERT INTO settings (\`key\`, value) VALUES (?, ?)`, [key, val]);
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save credentials", detail: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
