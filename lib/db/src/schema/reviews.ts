import { mysqlTable, text, int, timestamp, boolean, varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reviewsTable = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("product_id"),
  productName: text("product_name"),
  authorName: varchar("author_name", { length: 255 }).notNull(),
  rating: int("rating").notNull(),
  comment: text("comment").notNull(),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, createdAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;
