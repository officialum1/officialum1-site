import { Router, type IRouter } from "express";
import { db, blogsTable } from "@workspace/db";
import { eq, desc, like } from "drizzle-orm";
import { ListBlogsQueryParams, GetBlogParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/blogs", async (req, res): Promise<void> => {
  const params = ListBlogsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { limit = 10, offset = 0, category } = params.data;

  let query = db.select().from(blogsTable).$dynamic();
  if (category) {
    query = query.where(like(blogsTable.category, `%${category}%`));
  }

  const blogs = await query
    .orderBy(desc(blogsTable.createdAt))
    .limit(limit ?? 10)
    .offset(offset ?? 0);

  res.json(blogs.map(formatBlog));
});

router.get("/blogs/:slug", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const params = GetBlogParams.safeParse({ slug: raw });
  if (!params.success) {
    res.status(400).json({ error: "Invalid slug" });
    return;
  }

  const [blog] = await db.select().from(blogsTable).where(eq(blogsTable.slug, params.data.slug));
  if (!blog) {
    res.status(404).json({ error: "Blog post not found" });
    return;
  }

  res.json(formatBlog(blog));
});

function formatBlog(b: typeof blogsTable.$inferSelect) {
  return {
    id: b.id,
    title: b.title,
    slug: b.slug,
    excerpt: b.excerpt,
    content: b.content,
    imageUrl: b.imageUrl ?? null,
    category: b.category,
    author: b.author,
    readTime: b.readTime,
    createdAt: b.createdAt.toISOString(),
  };
}

export default router;
