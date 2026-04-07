import { mysqlTable, text, int, timestamp, json, varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ticketsTable = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"),
  userEmail: varchar("user_email", { length: 191 }),
  subject: text("subject").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("open"),
  priority: varchar("priority", { length: 50 }).notNull().default("normal"),
  message: text("message").notNull(),
  orderId: int("order_id"),
  replies: json("replies").$type<Array<{ id: number; author: string; isStaff: boolean; message: string; createdAt: string }>>().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const insertTicketSchema = createInsertSchema(ticketsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof ticketsTable.$inferSelect;
