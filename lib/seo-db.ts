import { query } from "@/lib/db";

let ensured = false;

const blogSeoColumns = [
  "ALTER TABLE blogs ADD COLUMN meta_title VARCHAR(255)",
  "ALTER TABLE blogs ADD COLUMN meta_description TEXT",
  "ALTER TABLE blogs ADD COLUMN focus_keyword VARCHAR(255)",
  "ALTER TABLE blogs ADD COLUMN seo_keywords TEXT",
  "ALTER TABLE blogs ADD COLUMN canonical_url VARCHAR(500)",
  "ALTER TABLE blogs ADD COLUMN robots VARCHAR(50) DEFAULT 'index,follow'",
  "ALTER TABLE blogs ADD COLUMN schema_type VARCHAR(50) DEFAULT 'BlogPosting'",
];

const productSeoColumns = [
  "ALTER TABLE products ADD COLUMN seo_title VARCHAR(255)",
  "ALTER TABLE products ADD COLUMN seo_description TEXT",
  "ALTER TABLE products ADD COLUMN focus_keyword VARCHAR(255)",
  "ALTER TABLE products ADD COLUMN seo_keywords TEXT",
  "ALTER TABLE products ADD COLUMN canonical_url VARCHAR(500)",
  "ALTER TABLE products ADD COLUMN robots VARCHAR(50) DEFAULT 'index,follow'",
  "ALTER TABLE products ADD COLUMN schema_type VARCHAR(50) DEFAULT 'Product'",
];

export async function ensureSeoColumns() {
  if (ensured) return;

  for (const statement of [...blogSeoColumns, ...productSeoColumns]) {
    try {
      await query(statement);
    } catch {
      // Existing columns are expected on healthy installs.
    }
  }

  ensured = true;
}
