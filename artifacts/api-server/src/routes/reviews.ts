import { Router, type IRouter } from "express";
import { db, reviewsTable, productsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { ListReviewsQueryParams, CreateReviewBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/reviews", async (req, res): Promise<void> => {
  const params = ListReviewsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { productId, limit = 20 } = params.data;

  let query = db.select().from(reviewsTable).$dynamic();
  if (productId !== null && productId !== undefined) {
    query = query.where(eq(reviewsTable.productId, productId));
  }

  const reviews = await query.orderBy(desc(reviewsTable.createdAt)).limit(limit ?? 20);
  res.json(reviews.map(formatReview));
});

router.get("/reviews/stats", async (_req, res): Promise<void> => {
  const reviews = await db.select().from(reviewsTable);
  const typedReviews = reviews as typeof reviewsTable.$inferSelect[];
  const total = typedReviews.length;

  if (total === 0) {
    res.json({ averageRating: 0, totalReviews: 0, fiveStar: 0, fourStar: 0, threeStar: 0, twoStar: 0, oneStar: 0 });
    return;
  }

  const avg = typedReviews.reduce((sum: number, r: typeof reviewsTable.$inferSelect) => sum + r.rating, 0) / total;

  res.json({
    averageRating: Math.round(avg * 10) / 10,
    totalReviews: total,
    fiveStar: typedReviews.filter((r: typeof reviewsTable.$inferSelect) => r.rating === 5).length,
    fourStar: typedReviews.filter((r: typeof reviewsTable.$inferSelect) => r.rating === 4).length,
    threeStar: typedReviews.filter((r: typeof reviewsTable.$inferSelect) => r.rating === 3).length,
    twoStar: typedReviews.filter((r: typeof reviewsTable.$inferSelect) => r.rating === 2).length,
    oneStar: typedReviews.filter((r: typeof reviewsTable.$inferSelect) => r.rating === 1).length,
  });
});

router.post("/reviews", async (req, res): Promise<void> => {
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { productId, rating, comment, authorName } = parsed.data;

  let productName: string | null = null;
  if (productId !== null && productId !== undefined) {
    const [product] = await db.select({ name: productsTable.name }).from(productsTable).where(eq(productsTable.id, productId));
    productName = product?.name ?? null;
  }

  const [review] = await db.insert(reviewsTable).values({
    productId: productId ?? null,
    productName,
    authorName,
    rating,
    comment,
    verified: false,
  }).returning();

  if (productId !== null && productId !== undefined) {
    const allReviews = await db.select({ rating: reviewsTable.rating }).from(reviewsTable).where(eq(reviewsTable.productId, productId));
    const typedRatings = allReviews as Array<{ rating: number }>;
    const avgRating = typedRatings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / typedRatings.length;
    await db.update(productsTable)
      .set({ rating: String(Math.round(avgRating * 10) / 10), reviewCount: typedRatings.length })
      .where(eq(productsTable.id, productId));
  }

  res.status(201).json(formatReview(review));
});

function formatReview(r: typeof reviewsTable.$inferSelect) {
  return {
    id: r.id,
    productId: r.productId ?? null,
    productName: r.productName ?? null,
    authorName: r.authorName,
    rating: r.rating,
    comment: r.comment,
    verified: r.verified,
    createdAt: r.createdAt.toISOString(),
  };
}

export default router;
