import { defineConfig } from "drizzle-kit";
import path from "path";
import dotenv from "dotenv";

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

// Load .env from workspace root - try current dir and its parents
dotenv.config({ path: "../../.env" });
dotenv.config({ path: ".env" }); // fallback for different run contexts

if (!process.env.DATABASE_URL && !(process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME)) {
  // If still not there, try to find it via cwd
  dotenv.config({ path: path.join(process.cwd(), "../../.env") });
}

if (!process.env.DATABASE_URL && !(process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME)) {
  throw new Error("DATABASE_URL or DB_HOST, DB_USER, and DB_NAME are not set. Please check your .env file.");
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "mysql",
  dbCredentials: {
    url: buildDatabaseUrl(),
  },
});
