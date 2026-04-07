import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

function buildDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD ?? "";
  const database = process.env.DB_NAME;
  const port = process.env.DB_PORT ?? "3306";
  const protocol = process.env.DB_PROTOCOL ?? "mysql";

  if (!host || !user || !database) {
    throw new Error("DATABASE_URL or DB_HOST, DB_USER, and DB_NAME are not set");
  }

  const auth = `${encodeURIComponent(user)}:${encodeURIComponent(password)}@`;
  return `${protocol}://${auth}${host}:${port}/${database}`;
}

export function getExtPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(buildDatabaseUrl());
  }
  return pool;
}

export async function queryExt<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const pool = getExtPool();
  try {
    const [rows] = await pool.execute(sql, params as any ?? []);
    return rows as T[];
  } catch (err) {
    console.error("Database query error:", err);
    throw err;
  }
}
