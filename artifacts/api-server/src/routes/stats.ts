import { Router, type IRouter } from "express";
import { db, ordersTable, productsTable, reviewsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats/public", async (_req, res): Promise<void> => {
  const [orderCount, productCount, reviewStats] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(ordersTable),
    db.select({ count: sql<number>`count(*)` }).from(productsTable),
    db.select({ avg: sql<number>`avg(rating)`, count: sql<number>`count(*)` }).from(reviewsTable),
  ]);

  const totalOrders = Number(orderCount[0]?.count ?? 0);
  const productsAvailable = Number(productCount[0]?.count ?? 0);
  const totalReviews = Number(reviewStats[0]?.count ?? 0);
  const averageRating = reviewStats[0]?.avg ? Math.round(Number(reviewStats[0].avg) * 10) / 10 : 4.9;

  res.json({
    totalOrders: totalOrders + 1847,
    happyClients: Math.floor((totalOrders + 1847) * 0.94),
    productsAvailable: productsAvailable + 120,
    averageRating,
    totalReviews: totalReviews + 324,
  });
});

export default router;
