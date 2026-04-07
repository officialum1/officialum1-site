import { Router, type IRouter } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { like, eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { ListProductsQueryParams, GetProductParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const rawQuery = req.query as Record<string, string | undefined>;
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rawQuery)) {
    cleaned[k] = v === "" || v === "undefined" || v === "null" ? null : v;
  }
  const params = ListProductsQueryParams.safeParse(cleaned);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { category, platform, search, minPrice, maxPrice, inStock, featured, limit = 20, offset = 0 } = params.data;

  const conditions = [];
  if (category && category.trim() !== "") conditions.push(eq(productsTable.category, category.trim()));
  if (platform && platform.trim() !== "") conditions.push(eq(productsTable.platform, platform.trim()));
  if (search && search.trim() !== "") conditions.push(like(productsTable.name, `%${search.trim()}%`));
  if (minPrice !== null && minPrice !== undefined) conditions.push(gte(productsTable.price, String(minPrice)));
  if (maxPrice !== null && maxPrice !== undefined) conditions.push(lte(productsTable.price, String(maxPrice)));
  if (inStock !== null && inStock !== undefined && String(inStock) !== "") conditions.push(eq(productsTable.inStock, inStock));
  if (featured !== null && featured !== undefined && String(featured) !== "") conditions.push(eq(productsTable.featured, featured));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [products, countResult] = await Promise.all([
    db.select().from(productsTable)
      .where(whereClause)
      .orderBy(desc(productsTable.createdAt))
      .limit(limit ?? 20)
      .offset(offset ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(productsTable).where(whereClause),
  ]);

  res.json({
    products: products.map(formatProduct),
    total: Number(countResult[0]?.count ?? 0),
    offset: offset ?? 0,
    limit: limit ?? 20,
  });
});

router.get("/products/featured", async (_req, res): Promise<void> => {
  const products = await db.select().from(productsTable)
    .where(eq(productsTable.featured, true))
    .orderBy(desc(productsTable.createdAt))
    .limit(8);
  res.json(products.map(formatProduct));
});

router.get("/products/categories", async (_req, res): Promise<void> => {
  const categories = await db.select().from(categoriesTable);
  const counts = await db.select({
    category: productsTable.category,
    count: sql<number>`count(*)`,
  }).from(productsTable).groupBy(productsTable.category);
  const typedCounts = counts as Array<{ category: string | null; count: number }>;
  const typedCategories = categories as typeof categoriesTable.$inferSelect[];

  const countMap = Object.fromEntries(typedCounts.map((c: { category: string | null; count: number }) => [c.category, Number(c.count)]));

  res.json(typedCategories.map((c: typeof categoriesTable.$inferSelect) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    productCount: countMap[c.name] ?? 0,
  })));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetProductParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.id));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(formatProduct(product));
});

function formatProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
    category: p.category,
    platform: p.platform ?? null,
    imageUrl: p.imageUrl ?? null,
    stock: p.stock,
    inStock: p.inStock,
    featured: p.featured,
    rating: p.rating != null ? Number(p.rating) : null,
    reviewCount: p.reviewCount,
    badge: p.badge ?? null,
    tags: (p.tags as string[]) ?? [],
    createdAt: p.createdAt.toISOString(),
  };
}

export default router;
