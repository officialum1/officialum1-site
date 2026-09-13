import { query } from "@/lib/db";
import staticPosts from "@/data/posts.json";

export async function getBlogsForListing(): Promise<any[]> {
  try {
    const rows: any = await query("SELECT * FROM blogs ORDER BY created_at DESC");
    if (Array.isArray(rows) && rows.length > 0) {
      return rows.map((p: any) => ({
        id: p.id,
        title: p.title,
        category: p.category || "Growth",
        image: p.image,
        excerpt: p.excerpt,
        content: p.content,
        slug: p.slug,
        read_time: p.read_time,
        date: new Date(p.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      }));
    }
  } catch {
    // Fall back to local posts
  }

  if (Array.isArray(staticPosts) && staticPosts.length > 0) {
    return staticPosts.map((p: any) => ({
      id: p.id,
      title: p.title,
      category: p.category || "Growth",
      image: p.image,
      excerpt: p.excerpt,
      content: p.content,
      slug: p.slug,
      read_time: p.readTime || p.read_time || "5 min read",
      date: p.date || "Sep 13, 2026",
    }));
  }

  return [];
}

