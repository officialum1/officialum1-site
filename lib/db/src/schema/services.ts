import { mysqlTable, text, int, boolean, decimal, json, varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const servicesTable = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  priceLabel: varchar("price_label", { length: 100 }).notNull(),
  features: json("features").$type<string[]>().notNull(),
  popular: boolean("popular").notNull().default(false),
});

export const insertServiceSchema = createInsertSchema(servicesTable).omit({ id: true });
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof servicesTable.$inferSelect;
