import { query } from "@/lib/db";

export async function getBlogsForListing(): Promise<any[]> {
  try {
    const rows: any = await query("SELECT * FROM blogs ORDER BY created_at DESC");
    return Array.isArray(rows)
      ? rows.map((p: any) => ({
          id: p.id,
          title: p.title,
          category: p.category,
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
        }))
      : [];
  } catch {
    return [];
  }
}
