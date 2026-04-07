import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL must be set. Did you forget to provision a database? DB operations will fail.",
  );
}

export const pool = process.env.DATABASE_URL ? mysql.createPool(process.env.DATABASE_URL) : null as any;
export const db = pool ? drizzle(pool, { schema, mode: 'default' }) : null as any;

export * from "./schema";
