import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ path: "../../.env" });

const pool = mysql.createPool(process.env.DATABASE_URL);

async function hasTable(dbName, table) {
  const [rows] = await pool.query(
    "SELECT COUNT(*) c FROM information_schema.TABLES WHERE TABLE_SCHEMA=? AND TABLE_NAME=?",
    [dbName, table],
  );
  return Number(rows[0].c) > 0;
}

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

if (await hasTable(dbName, "orders")) {
  if (!(await hasCol(dbName, "orders", "id"))) await run("ALTER TABLE orders ADD COLUMN id INT NULL");
  if (!(await hasCol(dbName, "orders", "user_id"))) await run("ALTER TABLE orders ADD COLUMN user_id INT NULL");
  if (!(await hasCol(dbName, "orders", "email"))) await run("ALTER TABLE orders ADD COLUMN email VARCHAR(191) NULL");
  if (!(await hasCol(dbName, "orders", "name"))) await run("ALTER TABLE orders ADD COLUMN name TEXT NULL");
  if (!(await hasCol(dbName, "orders", "total"))) await run("ALTER TABLE orders ADD COLUMN total DECIMAL(10,2) NULL");
  if (!(await hasCol(dbName, "orders", "items"))) await run("ALTER TABLE orders ADD COLUMN items JSON NULL");
  if (!(await hasCol(dbName, "orders", "payment_method"))) await run("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) NULL");
  if (!(await hasCol(dbName, "orders", "coupon_code"))) await run("ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50) NULL");
  if (!(await hasCol(dbName, "orders", "delivery_token"))) await run("ALTER TABLE orders ADD COLUMN delivery_token TEXT NULL");
  if (!(await hasCol(dbName, "orders", "created_at"))) await run("ALTER TABLE orders ADD COLUMN created_at TIMESTAMP NULL");
  if (!(await hasCol(dbName, "orders", "updated_at"))) {
    await run("ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
  }
  if (!(await hasCol(dbName, "orders", "status"))) {
    await run("ALTER TABLE orders ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending'");
  }

  if (await hasCol(dbName, "orders", "orderId")) {
    await run("UPDATE orders SET id = orderId WHERE id IS NULL");
  }
  if (await hasCol(dbName, "orders", "guestEmail")) {
    await run("UPDATE orders SET email = COALESCE(email, guestEmail) WHERE email IS NULL");
  }
  if (await hasCol(dbName, "orders", "amount")) {
    await run("UPDATE orders SET total = COALESCE(total, CAST(amount AS DECIMAL(10,2))) WHERE total IS NULL");
  }
  if (await hasCol(dbName, "orders", "method")) {
    await run("UPDATE orders SET payment_method = COALESCE(payment_method, method) WHERE payment_method IS NULL");
  }
  if (await hasCol(dbName, "orders", "date")) {
    await run("UPDATE orders SET created_at = COALESCE(created_at, date) WHERE created_at IS NULL");
  }

  await run("UPDATE orders SET id = COALESCE(id, 0)");
  await run("UPDATE orders SET email = COALESCE(email, 'unknown@example.com')");
  await run("UPDATE orders SET name = COALESCE(name, 'Guest')");
  await run("UPDATE orders SET total = COALESCE(total, 0)");
  await run("UPDATE orders SET payment_method = COALESCE(payment_method, 'unknown')");
  await run("UPDATE orders SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP)");
  await run("UPDATE orders SET items = COALESCE(items, JSON_ARRAY())");
}

if (await hasTable(dbName, "reviews")) {
  if (!(await hasCol(dbName, "reviews", "id"))) await run("ALTER TABLE reviews ADD COLUMN id INT NULL");
  if (!(await hasCol(dbName, "reviews", "product_id"))) await run("ALTER TABLE reviews ADD COLUMN product_id INT NULL");
  if (!(await hasCol(dbName, "reviews", "product_name"))) await run("ALTER TABLE reviews ADD COLUMN product_name TEXT NULL");
  if (!(await hasCol(dbName, "reviews", "author_name"))) await run("ALTER TABLE reviews ADD COLUMN author_name VARCHAR(255) NULL");
  if (!(await hasCol(dbName, "reviews", "verified"))) await run("ALTER TABLE reviews ADD COLUMN verified BOOLEAN NOT NULL DEFAULT false");
  if (!(await hasCol(dbName, "reviews", "created_at"))) await run("ALTER TABLE reviews ADD COLUMN created_at TIMESTAMP NULL");
  if (!(await hasCol(dbName, "reviews", "rating"))) await run("ALTER TABLE reviews ADD COLUMN rating INT NULL");
  if (!(await hasCol(dbName, "reviews", "comment"))) await run("ALTER TABLE reviews ADD COLUMN comment TEXT NULL");

  if (await hasCol(dbName, "reviews", "date")) {
    await run("UPDATE reviews SET created_at = COALESCE(created_at, date) WHERE created_at IS NULL");
  }
  await run("UPDATE reviews SET author_name = COALESCE(author_name, 'Anonymous')");
  await run("UPDATE reviews SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP)");
  await run("UPDATE reviews SET rating = COALESCE(rating, 5)");
  await run("UPDATE reviews SET comment = COALESCE(comment, '')");
}

if (await hasTable(dbName, "blogs")) {
  if (!(await hasCol(dbName, "blogs", "slug"))) await run("ALTER TABLE blogs ADD COLUMN slug VARCHAR(191) NULL");
  if (!(await hasCol(dbName, "blogs", "image_url"))) await run("ALTER TABLE blogs ADD COLUMN image_url TEXT NULL");
  if (!(await hasCol(dbName, "blogs", "updated_at"))) {
    await run("ALTER TABLE blogs ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
  }
  if (!(await hasCol(dbName, "blogs", "read_time"))) await run("ALTER TABLE blogs ADD COLUMN read_time INT NOT NULL DEFAULT 5");
  if (!(await hasCol(dbName, "blogs", "created_at"))) await run("ALTER TABLE blogs ADD COLUMN created_at TIMESTAMP NULL");

  if (await hasCol(dbName, "blogs", "image")) {
    await run("UPDATE blogs SET image_url = COALESCE(image_url, image) WHERE image_url IS NULL");
  }
  await run("UPDATE blogs SET slug = COALESCE(NULLIF(slug, ''), CONCAT('blog-', id))");
  await run("UPDATE blogs b JOIN (SELECT slug FROM blogs GROUP BY slug HAVING COUNT(*) > 1) d ON b.slug = d.slug SET b.slug = CONCAT(b.slug, '-', b.id)");
  await run("UPDATE blogs SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP)");
}

await pool.end();
console.log("orders/reviews/blogs compatibility ensured");
