import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ path: "../../.env" });

const pool = mysql.createPool(process.env.DATABASE_URL);

async function hasCol(dbName, table, col) {
  const [rows] = await pool.query(
    "SELECT COUNT(*) c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND COLUMN_NAME=?",
    [dbName, table, col],
  );
  return Number(rows[0].c) > 0;
}

async function run(sql) {
  await pool.query(sql);
}

const [dbRows] = await pool.query("SELECT DATABASE() as db");
const dbName = dbRows[0].db;

if (!(await hasCol(dbName, "products", "slug"))) await run("ALTER TABLE products ADD COLUMN slug VARCHAR(191) NULL");
if (!(await hasCol(dbName, "products", "original_price"))) await run("ALTER TABLE products ADD COLUMN original_price DECIMAL(10,2) NULL");
if (!(await hasCol(dbName, "products", "category"))) await run("ALTER TABLE products ADD COLUMN category VARCHAR(191) NOT NULL DEFAULT 'general'");
if (!(await hasCol(dbName, "products", "image_url"))) await run("ALTER TABLE products ADD COLUMN image_url TEXT NULL");
if (!(await hasCol(dbName, "products", "in_stock"))) await run("ALTER TABLE products ADD COLUMN in_stock BOOLEAN NOT NULL DEFAULT true");
if (!(await hasCol(dbName, "products", "featured"))) await run("ALTER TABLE products ADD COLUMN featured BOOLEAN NOT NULL DEFAULT false");
if (!(await hasCol(dbName, "products", "rating"))) await run("ALTER TABLE products ADD COLUMN rating DECIMAL(3,2) NULL");
if (!(await hasCol(dbName, "products", "review_count"))) await run("ALTER TABLE products ADD COLUMN review_count INT NOT NULL DEFAULT 0");
if (!(await hasCol(dbName, "products", "badge"))) await run("ALTER TABLE products ADD COLUMN badge VARCHAR(191) NULL");
if (!(await hasCol(dbName, "products", "tags"))) await run("ALTER TABLE products ADD COLUMN tags JSON NULL");
if (!(await hasCol(dbName, "products", "updated_at"))) {
  await run("ALTER TABLE products ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
}

await run("UPDATE products SET image_url = COALESCE(image_url, image) WHERE image_url IS NULL");
await run("UPDATE products SET slug = LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), '/', '-'), '--', '-')) WHERE slug IS NULL OR slug=''");
await run(
  "UPDATE products p JOIN (SELECT slug FROM products GROUP BY slug HAVING COUNT(*)>1) d ON p.slug = d.slug SET p.slug = CONCAT(p.slug, '-', p.id)",
);
await run("UPDATE products SET tags = JSON_ARRAY() WHERE tags IS NULL");
await run("UPDATE products SET category = COALESCE(NULLIF(category, ''), platform, 'general')");

await pool.end();
console.log("products compatibility columns ensured");
