import { mysqlTable, text, int, timestamp, decimal, json, varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"),
  email: varchar("email", { length: 191 }).notNull(),
  name: text("name").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  items: json("items").$type<Array<{ productId: number; name: string; price: number; imageUrl?: string | null; quantity: number }>>().notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  couponCode: varchar("coupon_code", { length: 50 }),
  deliveryToken: text("delivery_token"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
