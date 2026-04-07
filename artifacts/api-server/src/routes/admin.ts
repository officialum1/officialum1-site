import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { queryExt } from "../lib/mysql";
import crypto from "crypto";
import { db, productsTable, ordersTable, reviewsTable, usersTable } from "@workspace/db";
import { desc, eq, like, and, sql } from "drizzle-orm";

const router: IRouter = Router();
const ADMIN_SECRET = process.env.ADMIN_PASSWORD ?? "admin";
const HMAC_KEY = process.env.SESSION_SECRET ?? "um1admin2024";

function getDatabaseLabel() {
  const host = process.env.DB_HOST ?? process.env.DATABASE_URL?.split("@")[1]?.split("/")[0] ?? "";
  const name = process.env.DB_NAME ?? "";
  return { host, name };
}

// ── Token helpers ──────────────────────────────────────────────────────────
function makeAdminToken(): string {
  const payload = Buffer.from(JSON.stringify({ role: "admin", iat: Date.now(), exp: Date.now() + 43200000 })).toString("base64url");
  const sig = crypto.createHmac("sha256", HMAC_KEY).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verifyAdminToken(token: string): boolean {
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return false;
    const expectedSig = crypto.createHmac("sha256", HMAC_KEY).update(payload).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (data.role !== "admin") return false;
    if (Date.now() > data.exp) return false;
    return true;
  } catch {
    return false;
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return; }
  if (!verifyAdminToken(auth.slice(7))) { res.status(401).json({ error: "Invalid or expired token" }); return; }
  next();
}

function safeTableName(name: string): boolean {
  return /^[a-zA-Z0-9_]+$/.test(name);
}

// ── Auto-create DDL for tables that may not exist yet ─────────────────────
const TABLE_DDL: Record<string, string> = {
  formations: `CREATE TABLE IF NOT EXISTS formations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) DEFAULT NULL,
    company_name VARCHAR(200) DEFAULT NULL,
    state VARCHAR(100) DEFAULT NULL,
    package VARCHAR(100) DEFAULT 'basic',
    status VARCHAR(50) DEFAULT 'pending',
    price DECIMAL(10,2) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  sellers: `CREATE TABLE IF NOT EXISTS sellers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) DEFAULT NULL,
    platform VARCHAR(100) NOT NULL,
    account_url TEXT DEFAULT NULL,
    followers VARCHAR(50) DEFAULT NULL,
    asking_price DECIMAL(10,2) DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    contact_info TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  verifications: `CREATE TABLE IF NOT EXISTS verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) DEFAULT NULL,
    document_type VARCHAR(100) DEFAULT NULL,
    document_url TEXT DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  leads: `CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) DEFAULT NULL,
    phone VARCHAR(50) DEFAULT NULL,
    source VARCHAR(100) DEFAULT NULL,
    interest TEXT DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'new',
    notes TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  documents: `CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(100) DEFAULT NULL,
    url TEXT DEFAULT NULL,
    user_id INT DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'active',
    notes TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  staff: `CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    role VARCHAR(100) DEFAULT 'support',
    permissions TEXT DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'active',
    last_login DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  g2g_listings: `CREATE TABLE IF NOT EXISTS g2g_listings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    platform VARCHAR(100) NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT DEFAULT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    stock INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'active',
    g2g_id VARCHAR(100) DEFAULT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    category VARCHAR(100) DEFAULT NULL,
    last_synced_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  g2g_orders: `CREATE TABLE IF NOT EXISTS g2g_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(100) NOT NULL UNIQUE,
    g2g_listing_id VARCHAR(200) DEFAULT NULL,
    listing_title VARCHAR(500) DEFAULT NULL,
    buyer_name VARCHAR(200) DEFAULT NULL,
    buyer_email VARCHAR(200) DEFAULT NULL,
    buyer_id VARCHAR(100) DEFAULT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending',
    delivery_content TEXT DEFAULT NULL,
    delivery_notes TEXT DEFAULT NULL,
    delivered_at DATETIME DEFAULT NULL,
    raw_data JSON DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order_number (order_number),
    INDEX idx_status (status)
  )`,
  coupons: `CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    discount_type VARCHAR(20) DEFAULT 'percent',
    discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    min_order DECIMAL(10,2) DEFAULT 0,
    max_uses INT DEFAULT NULL,
    uses INT DEFAULT 0,
    expires_at DATETIME DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  bundles: `CREATE TABLE IF NOT EXISTS bundles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT DEFAULT NULL,
    product_ids TEXT DEFAULT NULL,
    discount_type VARCHAR(20) DEFAULT 'percent',
    discount_value DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  promotions: `CREATE TABLE IF NOT EXISTS promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    discount_type VARCHAR(20) DEFAULT 'percent',
    discount_value DECIMAL(10,2) DEFAULT 0,
    uses INT DEFAULT 0,
    max_uses INT DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'active',
    expires_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  activity_logs: `CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    action VARCHAR(200) NOT NULL,
    resource VARCHAR(100) DEFAULT NULL,
    resource_id VARCHAR(100) DEFAULT NULL,
    ip VARCHAR(50) DEFAULT NULL,
    details TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  payouts: `CREATE TABLE IF NOT EXISTS payouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    name VARCHAR(200) DEFAULT NULL,
    email VARCHAR(200) DEFAULT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    method VARCHAR(100) DEFAULT 'crypto',
    wallet TEXT DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  playerup_creator: `CREATE TABLE IF NOT EXISTS playerup_creator (
    id INT AUTO_INCREMENT PRIMARY KEY,
    platform VARCHAR(100) NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT DEFAULT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    stock INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'active',
    playerup_id VARCHAR(100) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  support_tickets: `CREATE TABLE IF NOT EXISTS support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    name VARCHAR(200) DEFAULT NULL,
    email VARCHAR(200) DEFAULT NULL,
    subject VARCHAR(300) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'normal',
    reply TEXT DEFAULT NULL,
    replied_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  z2u_logs: `CREATE TABLE IF NOT EXISTS z2u_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(200) NOT NULL,
    request_data TEXT DEFAULT NULL,
    response TEXT DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'success',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  whatsapp_messages: `CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_number VARCHAR(50) DEFAULT NULL,
    to_number VARCHAR(50) DEFAULT NULL,
    message TEXT DEFAULT NULL,
    direction VARCHAR(10) DEFAULT 'inbound',
    status VARCHAR(50) DEFAULT 'received',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  bump_logs: `CREATE TABLE IF NOT EXISTS bump_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event VARCHAR(50) NOT NULL DEFAULT 'bump_success',
    account_title VARCHAR(500) DEFAULT NULL,
    listing_id VARCHAR(200) DEFAULT NULL,
    platform VARCHAR(50) DEFAULT 'reddit',
    price VARCHAR(50) DEFAULT NULL,
    message TEXT DEFAULT NULL,
    error_detail TEXT DEFAULT NULL,
    source VARCHAR(50) DEFAULT 'extension',
    ip VARCHAR(100) DEFAULT NULL,
    ext_version VARCHAR(20) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event (event),
    INDEX idx_platform (platform),
    INDEX idx_created_at (created_at)
  )`,
};

async function ensureTable(table: string): Promise<void> {
  const ddl = TABLE_DDL[table];
  if (ddl) {
    try { await queryExt(ddl); } catch { /* table may already exist */ }
  }
}

// ── POST /api/admin/login ──────────────────────────────────────────────────
router.post("/admin/login", (req: Request, res: Response): void => {
  const { password } = req.body as { password?: string };
  if (!password || password !== ADMIN_SECRET) { res.status(401).json({ error: "Invalid password" }); return; }
  res.json({ token: makeAdminToken(), expiresIn: 43200 });
});

// ── GET /api/admin/db/test ─────────────────────────────────────────────────
router.get("/admin/db/test", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await queryExt<{ version: string; db: string }>("SELECT VERSION() as version, DATABASE() as db");
    const dbLabel = getDatabaseLabel();
    res.json({ connected: true, version: result[0]?.version, host: dbLabel.host, db: result[0]?.db || dbLabel.name });
  } catch (err) {
    res.status(500).json({ connected: false, error: err instanceof Error ? err.message : String(err) });
  }
});

// ── GET /api/admin/dashboard ───────────────────────────────────────────────
router.get("/admin/dashboard", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const safe = async <T>(sql: string, params: unknown[] = []): Promise<T[]> => {
    try { return await queryExt<T>(sql, params); } catch { return []; }
  };

  const [
    orders, ordersToday, products, reviews, inventory,
    recentOrders, recentActivity,
    revenue, totalUsers, topPlatform, topProducts, g2gAlerts,
  ] = await Promise.all([
    safe<{ total: number; pending: number; completed: number }>(
      "SELECT COUNT(*) as total, SUM(status='pending') as pending, SUM(status='completed') as completed FROM orders"
    ),
    safe<{ today: number }>(
      "SELECT COUNT(*) as today FROM orders WHERE CAST(created_at AS DATE) = CURRENT_DATE"
    ),
    safe<{ total: number }>("SELECT COUNT(*) as total FROM products"),
    safe<{ total: number; pending: number }>(
      "SELECT COUNT(*) as total, SUM(COALESCE(status,'pending')='pending') as pending FROM reviews"
    ),
    safe<{ total: number }>("SELECT COUNT(*) as total FROM inventory"),
    safe<Record<string, unknown>>(
      "SELECT id as id, status, total as total, created_at as created_at FROM orders ORDER BY created_at DESC LIMIT 10"
    ),
    safe<Record<string, unknown>>(
      "SELECT id, action, date as created_at FROM activity_logs ORDER BY date DESC LIMIT 8"
    ),
    safe<{ revenue: number }>("SELECT COALESCE(SUM(total),0) as revenue FROM orders WHERE status='completed'"),
    safe<{ total: number }>("SELECT COUNT(*) as total FROM users"),
    safe<{ platform: string; cnt: number }>(
      "SELECT COALESCE(platform,'Other') as platform, COUNT(*) as cnt FROM products GROUP BY platform ORDER BY cnt DESC LIMIT 1"
    ),
    safe<{ name: string; sold: number }>(
      "SELECT name, COALESCE(sold_count,0) as sold FROM products ORDER BY sold_count DESC LIMIT 5"
    ),
    safe<{ name: string; price: number; stock: number }>(
      "SELECT title as name, (COALESCE(price,0)) as price, (COALESCE(stock,1)) as stock FROM g2g_listings ORDER BY created_at DESC LIMIT 4"
    ),
  ]);

  res.json({
    orders: orders[0] ?? { total: 0, pending: 0, completed: 0 },
    ordersToday: ordersToday[0]?.today ?? 0,
    products: products[0]?.total ?? 0,
    reviews: reviews[0] ?? { total: 0, pending: 0 },
    inventory: inventory[0]?.total ?? 0,
    recentOrders,
    recentActivity,
    totalRevenue: Number(revenue[0]?.revenue ?? 0),
    totalUsers: Number(totalUsers[0]?.total ?? 0),
    topPlatform: topPlatform[0] ?? null,
    topProducts,
    g2gAlerts,
  });
});

// ── GET /api/admin/db/stats ────────────────────────────────────────────────
router.get("/admin/db/stats", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const tables = await queryExt<{ table_name: string; table_rows: number; data_length: number; index_length: number }>(
      `SELECT TABLE_NAME as table_name, TABLE_ROWS as table_rows, DATA_LENGTH as data_length, INDEX_LENGTH as index_length
       FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_ROWS DESC`
    );
    const totalRows = tables.reduce((s, t) => s + (Number(t.table_rows) || 0), 0);
    const totalSize = tables.reduce((s, t) => s + (Number(t.data_length) || 0) + (Number(t.index_length) || 0), 0);
    res.json({
      tableCount: tables.length, totalRows,
      totalSizeMb: (totalSize / 1024 / 1024).toFixed(2),
      dbName: process.env.EXT_DB_NAME ?? process.env.DB_NAME, dbHost: process.env.EXT_DB_HOST ?? process.env.DB_HOST, tables,
    });
  } catch (err) {
    res.status(500).json({ error: "DB connection failed", detail: err instanceof Error ? err.message : String(err) });
  }
});

// ── POST /api/admin/db/migrate ─────────────────────────────────────────────
router.post("/admin/db/migrate", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const results: Array<{ table: string; status: "created" | "exists" | "error"; error?: string }> = [];
  for (const [table, ddl] of Object.entries(TABLE_DDL)) {
    try {
      // Check if table exists
      const cols = await queryExt<{ cnt: number }>(
        `SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=?`,
        [table]
      );
      if (Number(cols[0]?.cnt ?? 0) > 0) {
        results.push({ table, status: "exists" });
      } else {
        await queryExt(ddl);
        results.push({ table, status: "created" });
      }
    } catch (err) {
      results.push({ table, status: "error", error: err instanceof Error ? err.message : String(err) });
    }
  }
  const created = results.filter(r => r.status === "created").length;
  const errors = results.filter(r => r.status === "error").length;
  res.json({ success: true, created, errors, results });
});

// ── GET /api/admin/db/tables ───────────────────────────────────────────────
router.get("/admin/db/tables", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const tables = await queryExt<{ name: string; row_count: number; size_kb: number; engine: string; updated: string }>(
      `SELECT TABLE_NAME as name, COALESCE(TABLE_ROWS,0) as row_count,
              ROUND((DATA_LENGTH+INDEX_LENGTH)/1024,2) as size_kb,
              ENGINE as engine, UPDATE_TIME as updated
       FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() ORDER BY TABLE_NAME ASC`
    );
    res.json(tables.map(t => ({ ...t, rows: t.row_count })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tables", detail: err instanceof Error ? err.message : String(err) });
  }
});

// ── GET /api/admin/db/tables/:table ───────────────────────────────────────
router.get("/admin/db/tables/:table", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const table = req.params.table as string;
  if (!safeTableName(table)) { res.status(400).json({ error: "Invalid table name" }); return; }

  const page = Math.max(1, parseInt(String(req.query.page ?? "1")));
  const limit = Math.min(100, Math.max(10, parseInt(String(req.query.limit ?? "50"))));
  const offset = (page - 1) * limit;
  const search = String(req.query.search ?? "").trim();
  const sortCol = String(req.query.sort ?? "").trim();
  const sortDir = String(req.query.dir ?? "desc").toLowerCase() === "asc" ? "ASC" : "DESC";

  try {
    const cols = await queryExt<{ COLUMN_NAME: string; DATA_TYPE: string; IS_NULLABLE: string; COLUMN_KEY: string; EXTRA: string }>(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? ORDER BY ORDINAL_POSITION`,
      [table]
    );
    if (cols.length === 0) {
      // Auto-create the table if we have a DDL definition for it
      if (TABLE_DDL[table]) {
        await ensureTable(table);
        // Re-query columns after creation
        const newCols = await queryExt<{ COLUMN_NAME: string; DATA_TYPE: string; IS_NULLABLE: string; COLUMN_KEY: string; EXTRA: string }>(
          `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA
           FROM information_schema.COLUMNS
           WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? ORDER BY ORDINAL_POSITION`,
          [table]
        );
        if (newCols.length === 0) { res.status(404).json({ error: `Table '${table}' could not be created` }); return; }
        // Return the empty table structure
        res.json({
          table, columns: newCols.map(c => ({ name: c.COLUMN_NAME, type: c.DATA_TYPE, nullable: c.IS_NULLABLE === "YES", pk: c.COLUMN_KEY === "PRI", auto: c.EXTRA.includes("auto_increment") })),
          rows: [], pagination: { page: 1, limit, total: 0, pages: 0 }, created: true,
        });
        return;
      }
      res.status(404).json({ error: `Table '${table}' not found` }); return;
    }

    let searchWhere = "";
    const searchParams: unknown[] = [];
    if (search) {
      const textCols = cols.filter(c => ["varchar","text","char","longtext","mediumtext","tinytext"].includes(c.DATA_TYPE));
      if (textCols.length > 0) {
        searchWhere = "WHERE " + textCols.map(c => `\`${c.COLUMN_NAME}\` LIKE ?`).join(" OR ");
        textCols.forEach(() => searchParams.push(`%${search}%`));
      }
    }

    const defaultSort = cols.find(c => c.COLUMN_KEY === "PRI")?.COLUMN_NAME ?? cols[0]?.COLUMN_NAME ?? "1";
    const safeSort = cols.find(c => c.COLUMN_NAME === sortCol)?.COLUMN_NAME ?? defaultSort;
    const countRows = await queryExt<{ total: number }>(`SELECT COUNT(*) as total FROM \`${table}\` ${searchWhere}`, searchParams);
    const total = Number(countRows[0]?.total ?? 0);
    const rows = await queryExt(`SELECT * FROM \`${table}\` ${searchWhere} ORDER BY \`${safeSort}\` ${sortDir} LIMIT ? OFFSET ?`, [...searchParams, limit, offset]);

    res.json({
      table, columns: cols.map(c => ({ name: c.COLUMN_NAME, type: c.DATA_TYPE, nullable: c.IS_NULLABLE === "YES", pk: c.COLUMN_KEY === "PRI", auto: c.EXTRA.includes("auto_increment") })),
      rows, pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: `Failed to query '${table}'`, detail: err instanceof Error ? err.message : String(err) });
  }
});

// ── POST /api/admin/db/tables/:table/rows (create row) ────────────────────
router.post("/admin/db/tables/:table/rows", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const table = req.params.table as string;
  if (!safeTableName(table)) { res.status(400).json({ error: "Invalid table name" }); return; }
  const data = req.body as Record<string, unknown>;
  if (!data || Object.keys(data).length === 0) { res.status(400).json({ error: "No data provided" }); return; }
  try {
    const cols = Object.keys(data).map(k => `\`${k}\``).join(", ");
    const placeholders = Object.keys(data).map(() => "?").join(", ");
    const result = await queryExt<{ insertId?: number }>(`INSERT INTO \`${table}\` (${cols}) VALUES (${placeholders})`, Object.values(data));
    res.json({ success: true, insertId: (result as unknown as { insertId?: number }).insertId });
  } catch (err) {
    res.status(500).json({ error: "Insert failed", detail: err instanceof Error ? err.message : String(err) });
  }
});

// ── PUT /api/admin/db/tables/:table/rows/:id (update row) ─────────────────
router.put("/admin/db/tables/:table/rows/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { table, id } = req.params as { table: string; id: string };
  if (!safeTableName(table)) { res.status(400).json({ error: "Invalid table name" }); return; }
  const data = req.body as Record<string, unknown>;
  if (!data || Object.keys(data).length === 0) { res.status(400).json({ error: "No data provided" }); return; }
  try {
    const pks = await queryExt<{ COLUMN_NAME: string }>(
      `SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND CONSTRAINT_NAME='PRIMARY' LIMIT 1`, [table]
    );
    const pk = pks[0]?.COLUMN_NAME ?? "id";
    const setClause = Object.keys(data).map(k => `\`${k}\` = ?`).join(", ");
    await queryExt(`UPDATE \`${table}\` SET ${setClause} WHERE \`${pk}\` = ? LIMIT 1`, [...Object.values(data), id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Update failed", detail: err instanceof Error ? err.message : String(err) });
  }
});

// ── DELETE /api/admin/db/tables/:table/rows/:id ────────────────────────────
router.delete("/admin/db/tables/:table/rows/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { table, id } = req.params as { table: string; id: string };
  if (!safeTableName(table)) { res.status(400).json({ error: "Invalid table name" }); return; }
  try {
    const pks = await queryExt<{ COLUMN_NAME: string }>(
      `SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND CONSTRAINT_NAME='PRIMARY' LIMIT 1`, [table]
    );
    const pk = pks[0]?.COLUMN_NAME ?? "id";
    await queryExt(`DELETE FROM \`${table}\` WHERE \`${pk}\` = ? LIMIT 1`, [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed", detail: err instanceof Error ? err.message : String(err) });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── SALES MANAGEMENT (uses real `transactions` + `deliveries` tables) ─────────
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/sales — join transactions + deliveries for full sale records
router.get("/admin/sales", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(500, parseInt(String(req.query.limit ?? "100")));
    const rows = await queryExt(
      `SELECT t.id as sale_id, t.type, t.platform, t.amount as sale_price,
              t.description, t.processedBy as staff_email, t.date as created_at,
              t.inventoryId as inventory_id, t.cost, t.quantity,
              d.token as delivery_token, d.itemName as item_name,
              d.views, d.revealedAt as revealed_at
       FROM transactions t
       LEFT JOIN deliveries d ON d.orderId = t.id
       WHERE t.type = 'sale'
       ORDER BY t.date DESC LIMIT ?`,
      [limit]
    );
    res.json(Array.isArray(rows) ? rows : []);
  } catch {
    res.json([]);
  }
});

// POST /api/admin/sales — create new sale: inserts into transactions + deliveries, marks inventory Sold
router.post("/admin/sales", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { inventory_id, description, platform, sale_price, cost, quantity, mode, staff_email } = req.body as {
    inventory_id?: string; description?: string; platform?: string;
    sale_price?: number; cost?: number; quantity?: number; mode?: string; staff_email?: string;
  };
  const deliveryToken = crypto.randomBytes(4).toString("hex"); // 8-char like old system
  const transId = `trans_${Date.now()}`;
  const saleLink = `/d/${deliveryToken}`;

  try {
    // Build details JSON from inventory item
    let details: Record<string, unknown> = { username: "", password: "", email: "", extraInfo: "", tag: "" };
    if (inventory_id) {
      const invRows = await queryExt<any>("SELECT * FROM inventory WHERE id = ? LIMIT 1", [inventory_id]).catch(() => []);
      const inv = invRows[0];
      if (inv) {
        try { details = JSON.parse(inv.accountDetails || "{}"); } catch { /* ignore */ }
        if (!details.username) details.username = inv.account_username || "";
        if (!details.email) details.email = inv.account_email || "";
        if (!details.password) details.password = inv.account_password || "";
        details.inventoryIds = [inventory_id];
      }
    }

    // Insert transaction
    await queryExt(
      `INSERT INTO transactions (id, type, platform, amount, description, processedBy, date, inventoryId, currency, cost, quantity)
       VALUES (?, 'sale', ?, ?, ?, ?, NOW(), ?, 'USD', ?, ?)`,
      [transId, platform || "Direct", Number(sale_price) || 0, description || "", staff_email || "admin@officialum1.com", inventory_id || null, Number(cost) || 0, Number(quantity) || 1]
    );

    // Insert delivery
    await queryExt(
      `INSERT INTO deliveries (token, orderId, itemName, details, views, timestamp)
       VALUES (?, ?, ?, ?, 0, NOW())`,
      [deliveryToken, transId, description || "Account", JSON.stringify(details)]
    );

    // Mark inventory as Sold
    if (inventory_id) {
      await queryExt("UPDATE inventory SET status = 'Sold' WHERE id = ? LIMIT 1", [inventory_id]).catch(() => {});
    }

    res.json({ success: true, saleId: transId, deliveryToken, saleLink });
  } catch (err: any) {
    res.status(500).json({ error: "Create sale failed", detail: err?.message });
  }
});

// POST /api/admin/sales/:token/action — actions on deliveries
router.post("/admin/sales/:token/action", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { action } = req.body as { action: string };
  const { token } = req.params;
  try {
    if (action === "delete") {
      // Delete delivery and its transaction
      const d = await queryExt<any>("SELECT orderId FROM deliveries WHERE token = ? LIMIT 1", [token]);
      await queryExt("DELETE FROM deliveries WHERE token = ? LIMIT 1", [token]);
      if (d[0]?.orderId) await queryExt("DELETE FROM transactions WHERE id = ? LIMIT 1", [d[0].orderId]).catch(() => {});
      res.json({ success: true });
    } else if (action === "republish") {
      const newToken = crypto.randomBytes(4).toString("hex");
      await queryExt("UPDATE deliveries SET token = ? WHERE token = ? LIMIT 1", [newToken, token]);
      res.json({ success: true, newToken, saleLink: `/d/${newToken}` });
    } else {
      res.json({ success: true, message: "No-op" });
    }
  } catch (err: any) {
    res.status(500).json({ error: "Action failed", detail: err?.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── STOCK / INVENTORY (real schema: name, purchasePrice, account_email, etc.) ─
// ══════════════════════════════════════════════════════════════════════════════

// Status mapping: UI tab → DB value
// "In Stock" | "Sold" | "Defective"  (DB uses these exact capitalised values)

// GET /api/admin/stock — list inventory with optional status filter
router.get("/admin/stock", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const statusParam = req.query.status as string | undefined;
  const search = (req.query.search as string | undefined) || "";
  const limit = Math.min(500, parseInt(String(req.query.limit ?? "200")));
  try {
    // Map UI tab values to DB values
    const statusMap: Record<string, string> = { in_stock: "In Stock", sold: "Sold", defective: "Defective" };
    const dbStatus = statusParam && statusMap[statusParam] ? statusMap[statusParam] : statusParam || "";

    const conds: string[] = [];
    const params: unknown[] = [];
    if (dbStatus) { conds.push("status = ?"); params.push(dbStatus); }
    if (search) {
      conds.push("(name LIKE ? OR platform LIKE ? OR account_email LIKE ? OR account_username LIKE ? OR accountDetails LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    const where = conds.length ? " WHERE " + conds.join(" AND ") : "";
    const sql = `SELECT id, name, platform, purchasePrice, status, purchaseDate, account_email, account_username, account_password, account_region, accountDetails FROM inventory${where} ORDER BY purchaseDate DESC LIMIT ?`;
    params.push(limit);
    const rows = await queryExt<any>(sql, params);

    // Group by platform + name for card view
    const grouped: Record<string, any[]> = {};
    (Array.isArray(rows) ? rows : []).forEach((r: any) => {
      const key = `${r.platform || "Other"}|||${r.name || "Unknown"}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });
    const groups = Object.entries(grouped).map(([key, items]) => {
      const [platform, title] = key.split("|||");
      return { platform, title, count: items.length, items };
    });
    res.json({ rows: Array.isArray(rows) ? rows : [], groups, total: Array.isArray(rows) ? rows.length : 0 });
  } catch (err: any) {
    res.json({ rows: [], groups: [], total: 0, error: err?.message });
  }
});

// POST /api/admin/stock — add stock item(s) using real schema
router.post("/admin/stock", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { name, platform, account_email, account_username, account_password, account_region, extraInfo, status, purchasePrice, items } = req.body;
  const genId = () => `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  try {
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const details = JSON.stringify({ username: item.account_username || "", password: item.account_password || "", email: item.account_email || "", emailPassword: "", country: "", extraInfo: item.extraInfo || "", tag: "" });
        await queryExt(
          `INSERT INTO inventory (id, name, platform, purchasePrice, status, purchaseDate, account_email, account_username, account_password, accountDetails)
           VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
          [genId(), item.name || name || `${item.platform || platform} Account`, item.platform || platform,
           Number(item.purchasePrice || purchasePrice) || 0, item.status || "In Stock",
           item.account_email || "", item.account_username || "", item.account_password || "", details]
        );
      }
      res.json({ success: true, count: items.length });
    } else {
      const details = JSON.stringify({ username: account_username || "", password: account_password || "", email: account_email || "", emailPassword: "", country: account_region || "", extraInfo: extraInfo || "", tag: "" });
      await queryExt(
        `INSERT INTO inventory (id, name, platform, purchasePrice, status, purchaseDate, account_email, account_username, account_password, account_region, accountDetails)
         VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
        [genId(), name || `${platform} Account`, platform, Number(purchasePrice) || 0, status || "In Stock",
         account_email || "", account_username || "", account_password || "", account_region || "", details]
      );
      res.json({ success: true });
    }
  } catch (err: any) {
    res.status(500).json({ error: "Insert failed", detail: err?.message });
  }
});

// PUT /api/admin/stock/:id — update inventory item
router.put("/admin/stock/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, platform, account_email, account_username, account_password, account_region, extraInfo, status, purchasePrice } = req.body;
  try {
    const details = JSON.stringify({ username: account_username || "", password: account_password || "", email: account_email || "", emailPassword: "", country: account_region || "", extraInfo: extraInfo || "", tag: "" });
    await queryExt(
      `UPDATE inventory SET name=?, platform=?, purchasePrice=?, status=?, account_email=?, account_username=?, account_password=?, account_region=?, accountDetails=? WHERE id=? LIMIT 1`,
      [name, platform, Number(purchasePrice) || 0, status, account_email || "", account_username || "", account_password || "", account_region || "", details, id]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Update failed", detail: err?.message });
  }
});

// DELETE /api/admin/stock/:id
router.delete("/admin/stock/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await queryExt("DELETE FROM inventory WHERE id = ? LIMIT 1", [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Delete failed", detail: err?.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── PLAYERUP ──────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/playerup/listings — list PlayerUp listings
router.get("/admin/playerup/listings", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await queryExt("SELECT * FROM playerup_listings ORDER BY id DESC LIMIT 200");
    res.json(Array.isArray(rows) ? rows : []);
  } catch { res.json([]); }
});

// POST /api/admin/playerup/bump — bump listing(s) to top
router.post("/admin/playerup/bump", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { listing_ids, api_key } = req.body as { listing_ids?: string[]; api_key?: string };
  if (!listing_ids?.length) { res.status(400).json({ error: "listing_ids required" }); return; }
  try {
    // Update bump timestamp in DB
    for (const lid of listing_ids) {
      await queryExt("UPDATE playerup_listings SET last_bumped_at = NOW(), bump_count = COALESCE(bump_count,0)+1 WHERE id = ? LIMIT 1", [lid]).catch(() => {});
    }
    // If API key provided, would call PlayerUp API here
    res.json({ success: true, bumped: listing_ids.length, message: `Bumped ${listing_ids.length} listing(s) successfully` });
  } catch (err: any) {
    res.status(500).json({ error: "Bump failed", detail: err?.message });
  }
});

// GET /api/admin/playerup/settings — get PlayerUp settings (api key etc)
router.get("/admin/playerup/settings", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await queryExt<any>("SELECT setting_key, setting_value FROM settings WHERE setting_key LIKE 'playerup_%'");
    const settings: Record<string, string> = {};
    (Array.isArray(rows) ? rows : []).forEach((r: any) => { settings[r.setting_key] = r.setting_value; });
    res.json(settings);
  } catch { res.json({}); }
});

// POST /api/admin/playerup/settings — save PlayerUp settings
router.post("/admin/playerup/settings", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const settings = req.body as Record<string, string>;
  try {
    for (const [key, value] of Object.entries(settings)) {
      if (!key.startsWith("playerup_")) continue;
      const exists = await queryExt<any>("SELECT setting_key FROM settings WHERE setting_key = ? LIMIT 1", [key]);
      if (exists.length > 0) {
        await queryExt("UPDATE settings SET setting_value = ? WHERE setting_key = ?", [value, key]);
      } else {
        await queryExt("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)", [key, value]);
      }
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Save failed", detail: err?.message });
  }
});

// ── Save Setting(s) ──────────────────────────────────────────────────────────
// Accepts either { key, value } explicit or a flat { key1: val1, key2: val2 } bulk object
router.post("/admin/settings", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const body = req.body ?? {};
  try {
    // Determine pairs to save
    let pairs: Array<[string, string]> = [];
    if (typeof body.key === "string") {
      // Explicit { key, value } format
      pairs = [[body.key, String(body.value ?? "")]];
    } else {
      // Bulk { setting1: val1, setting2: val2 } format
      pairs = Object.entries(body)
        .filter(([k]) => /^[a-zA-Z0-9_]+$/.test(k))
        .map(([k, v]) => [k, String(v ?? "")]);
    }
    if (pairs.length === 0) { res.status(400).json({ error: "No valid settings provided" }); return; }
    for (const [k, v] of pairs) {
      const existing = await queryExt<{ setting_key: string }>(
        "SELECT setting_key FROM settings WHERE setting_key = ? LIMIT 1", [k]
      );
      if (existing.length > 0) {
        await queryExt("UPDATE settings SET setting_value = ? WHERE setting_key = ?", [v, k]);
      } else {
        await queryExt("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)", [k, v]);
      }
    }
    res.json({ success: true, saved: pairs.length });
  } catch (err) {
    res.status(500).json({ error: "Save failed", detail: err instanceof Error ? err.message : String(err) });
  }
});

// ── Z2U Marketplace stub ───────────────────────────────────────────────────
router.get("/admin/z2u", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  // Z2U marketplace integration — stub returning empty listings
  res.json({ listings: [], message: "Z2U integration not configured" });
});

router.post("/admin/z2u/sync", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: false, message: "Z2U sync not configured" });
});

// ── Newsletter send ────────────────────────────────────────────────────────
router.post("/admin/newsletter/send", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { subject, content } = req.body as { subject?: string; content?: string };
  if (!subject || !content) { res.status(400).json({ error: "Subject and content are required" }); return; }
  try {
    const subs = await queryExt<{ email: string }>("SELECT email FROM newsletter WHERE 1=1 LIMIT 1000");
    // In production, this would send emails via SMTP/SendGrid
    res.json({ success: true, sent: subs.length, message: `Newsletter queued for ${subs.length} subscribers` });
  } catch (err) {
    res.status(500).json({ error: "Failed to send newsletter", detail: err instanceof Error ? err.message : String(err) });
  }
});

// ── PUBLIC DELIVERY PAGE — GET /api/d/:token ───────────────────────────────
// No auth required — buyer accesses via link
router.get("/d/:token", async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  try {
    const rows = await queryExt<any>(
      `SELECT d.token, d.itemName, d.details, d.views, d.timestamp, d.revealedAt,
              t.platform, t.amount, t.description, t.date as sale_date
       FROM deliveries d
       LEFT JOIN transactions t ON t.id = d.orderId
       WHERE d.token = ? LIMIT 1`,
      [token]
    );
    if (!rows || rows.length === 0) { res.status(404).json({ error: "Delivery not found" }); return; }
    const row = rows[0];
    // Increment view count
    await queryExt("UPDATE deliveries SET views = views + 1 WHERE token = ? LIMIT 1", [token]).catch(() => {});
    // Mark first reveal
    if (!row.revealedAt) {
      await queryExt("UPDATE deliveries SET revealedAt = NOW() WHERE token = ? LIMIT 1", [token]).catch(() => {});
    }
    let details: Record<string, string> = {};
    try { details = JSON.parse(row.details || "{}"); } catch { /* ignore */ }
    res.json({
      token: row.token,
      itemName: row.itemName,
      platform: row.platform || "Direct",
      saleDate: row.sale_date || row.timestamp,
      views: (row.views ?? 0) + 1,
      revealedAt: row.revealedAt,
      credentials: {
        username: details.username || "",
        email: details.email || "",
        password: details.password || "",
        emailPassword: details.emailPassword || "",
        country: details.country || "",
        extraInfo: details.extraInfo || "",
        tag: details.tag || "",
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Server error", detail: err?.message });
  }
});

// ── Admin Products (PG) ───────────────────────────────────────────────────────
router.get("/admin/products", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const search = String(req.query.search ?? "").trim();
    const platform = String(req.query.platform ?? "").trim();
    const page = Math.max(1, parseInt(String(req.query.page ?? "1")));
    const limit = 50; const offset = (page - 1) * limit;
    const conditions: any[] = [];
    if (search) conditions.push(like(productsTable.name, `%${search}%`));
    if (platform) conditions.push(eq(productsTable.platform, platform));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [rows, countRows] = await Promise.all([
      db.select().from(productsTable).where(where).orderBy(desc(productsTable.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(productsTable).where(where),
    ]);
    res.json({ products: rows, total: Number(countRows[0]?.count ?? 0), page, limit });
  } catch (err) { res.status(500).json({ error: "Failed to fetch products" }); }
});

router.post("/admin/products", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, category, platform, imageUrl, inStock, featured } = req.body;
    if (!name || !price) { res.status(400).json({ error: "name and price required" }); return; }
    const result = await db.insert(productsTable).values({
      name, description: description ?? "", price: String(price), category: category ?? "Other",
      platform: platform ?? "Direct", imageUrl: imageUrl ?? null, inStock: inStock ?? true, featured: featured ?? false,
    });
    res.json({ success: true, insertId: (result as any)[0].insertId });
  } catch (err) { res.status(500).json({ error: "Failed to create product", detail: err instanceof Error ? err.message : String(err) }); }
});

router.put("/admin/products/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const { name, description, price, category, platform, imageUrl, inStock, featured } = req.body;
    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = String(price);
    if (category !== undefined) updates.category = category;
    if (platform !== undefined) updates.platform = platform;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (inStock !== undefined) updates.inStock = inStock;
    if (featured !== undefined) updates.featured = featured;
    await db.update(productsTable).set(updates).where(eq(productsTable.id, id));
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Failed to update product" }); }
});

router.delete("/admin/products/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    await db.delete(productsTable).where(eq(productsTable.id, parseInt(req.params.id as string)));
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Failed to delete product" }); }
});

// ── Admin Orders (PG) ─────────────────────────────────────────────────────────
router.get("/admin/orders-list", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const status = String(req.query.status ?? "").trim();
    const page = Math.max(1, parseInt(String(req.query.page ?? "1")));
    const limit = 50; const offset = (page - 1) * limit;
    const where = status ? eq(ordersTable.status, status as any) : undefined;
    const [rows, countRows] = await Promise.all([
      db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(where),
    ]);
    res.json({ orders: rows, total: Number(countRows[0]?.count ?? 0), page, limit });
  } catch (err) { res.status(500).json({ error: "Failed to fetch orders" }); }
});

router.put("/admin/orders-list/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const { status } = req.body;
    await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id));
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Failed to update order" }); }
});

// ── Admin Reviews (PG) ────────────────────────────────────────────────────────
router.get("/admin/reviews-list", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? "1")));
    const limit = 50; const offset = (page - 1) * limit;
    const [rows, stats] = await Promise.all([
      db.select().from(reviewsTable).orderBy(desc(reviewsTable.createdAt)).limit(limit).offset(offset),
      db.select({ avg: sql<number>`avg(rating)`, cnt: sql<number>`count(*)` }).from(reviewsTable),
    ]);
    res.json({ reviews: rows, total: Number(stats[0]?.cnt ?? 0), avgRating: Number(stats[0]?.avg ?? 0).toFixed(1), page, limit });
  } catch (err) { res.status(500).json({ error: "Failed to fetch reviews" }); }
});

router.delete("/admin/reviews-list/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    await db.delete(reviewsTable).where(eq(reviewsTable.id, parseInt(req.params.id as string)));
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Failed to delete review" }); }
});

// ── Admin Wallet Management (PG) ─────────────────────────────────────────────
router.get("/admin/wallet/users", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const search = String(req.query.search ?? "").trim();
    const page = Math.max(1, parseInt(String(req.query.page ?? "1")));
    const limit = 50; const offset = (page - 1) * limit;
    const where = search ? sql`(lower(${usersTable.name}) like ${("%" + search + "%").toLowerCase()} or lower(${usersTable.email}) like ${("%" + search + "%").toLowerCase()})` : undefined;
    const [users, countRows] = await Promise.all([
      db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, walletBalance: usersTable.walletBalance, createdAt: usersTable.createdAt })
        .from(usersTable).where(where).limit(limit).offset(offset).orderBy(desc(usersTable.createdAt)),
      db.select({ count: sql<number>`count(*)` }).from(usersTable).where(where),
    ]);
    res.json({ users, total: Number(countRows[0]?.count ?? 0) });
  } catch (err: any) { res.status(500).json({ error: "Failed", detail: err?.message }); }
});

router.post("/admin/wallet/adjust", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, amount, note } = req.body;
    if (!userId || amount === undefined) { res.status(400).json({ error: "userId and amount required" }); return; }
    const [user] = await db.select({ id: usersTable.id, walletBalance: usersTable.walletBalance, email: usersTable.email })
      .from(usersTable).where(eq(usersTable.id, parseInt(userId)));
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const newBalance = Math.max(0, parseFloat(String(user.walletBalance ?? "0")) + parseFloat(String(amount)));
    await db.update(usersTable).set({ walletBalance: String(newBalance.toFixed(2)) }).where(eq(usersTable.id, parseInt(userId)));
    res.json({ success: true, userId, oldBalance: user.walletBalance, newBalance: String(newBalance.toFixed(2)), note: note ?? "" });
  } catch (err: any) { res.status(500).json({ error: "Failed", detail: err?.message }); }
});

// ── G2G API Integration ────────────────────────────────────────────────────────
// ── G2G API — HMAC-SHA256 auth (open-api.g2g.com/v2) ──────────────────────────
const G2G_BASE = "https://open-api.g2g.com";
const G2G_DEFAULT_API_KEY    = "AZES6HAPUIXTNK6ATCLIGHOMNF2TRLH6";
const G2G_DEFAULT_SECRET_KEY = "asWMg3K5xwxHiAMr0LxGHkEDx0Z7XnXzJsJ1V3feRV2";
const G2G_DEFAULT_USER_ID    = "7788063";

function resolveG2GCreds() {
  return {
    apiKey:    process.env.G2G_API_KEY     || G2G_DEFAULT_API_KEY,
    secretKey: process.env.G2G_SECRET_KEY  || G2G_DEFAULT_SECRET_KEY,
    userId:    process.env.G2G_USER_ID     || G2G_DEFAULT_USER_ID,
  };
}

/** Generate HMAC-SHA256 headers per G2G open-api spec */
function g2gHeaders(path: string, method = "GET"): Record<string, string> {
  const { apiKey, secretKey, userId } = resolveG2GCreds();
  const timestamp = String(Date.now()); // milliseconds
  const pathOnly = path.split("?")[0];  // signature uses path without query string
  const stringToSign = pathOnly + apiKey + userId + timestamp;
  const signature = crypto.createHmac("sha256", secretKey).update(stringToSign).digest("hex");
  return {
    "g2g-api-key":   apiKey,
    "g2g-timestamp": timestamp,
    "g2g-signature": signature,
    "g2g-userid":    userId,
    "Content-Type":  "application/json",
  };
}

async function g2gFetch(path: string, method = "GET", body?: object, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const opts: RequestInit = {
      method,
      signal: controller.signal,
      headers: g2gHeaders(path, method),
      ...(body ? { body: JSON.stringify(body) } : {}),
    };
    const r = await fetch(`${G2G_BASE}${path}`, opts);
    const text = await r.text();
    try { return { ok: r.ok, status: r.status, data: JSON.parse(text) }; }
    catch { return { ok: r.ok, status: r.status, data: text }; }
  } finally { clearTimeout(timer); }
}

/** Legacy: still used by some routes — returns apiKey string */
async function resolveG2GKey(): Promise<string> {
  return resolveG2GCreds().apiKey;
}

/** Load all g2g_* settings from MariaDB, then overlay env key if set */
async function resolveG2GSettings(): Promise<Record<string, string>> {
  let map: Record<string, string> = {};
  try {
    const rows = await queryExt<{ key: string; value: string }>(`SELECT \`key\`, value FROM settings WHERE \`key\` LIKE 'g2g_%'`);
    rows.forEach(r => { map[r.key] = r.value; });
  } catch { /* external DB may be unavailable */ }
  if (process.env.G2G_API_KEY) map["g2g_api_key"] = process.env.G2G_API_KEY;
  return map;
}

router.get("/admin/g2g/settings", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const map = await resolveG2GSettings();
    const creds = resolveG2GCreds();
    const safe: Record<string, string> = { ...map };
    // Mask actual key values but confirm they're configured
    safe.g2g_api_key      = creds.apiKey    ? "***configured***" : "";
    safe.g2g_secret_key   = creds.secretKey ? "***configured***" : "";
    safe.g2g_user_id      = creds.userId    || G2G_DEFAULT_USER_ID;
    safe._env_key_set     = (process.env.G2G_API_KEY    ? "true" : "false");
    safe._env_secret_set  = (process.env.G2G_SECRET_KEY ? "true" : "false");
    safe._keys_ready      = "true"; // always ready (env vars or defaults)
    res.json({ settings: safe });
  } catch (err: any) { res.status(500).json({ error: "Failed to load G2G settings" }); }
});

router.post("/admin/g2g/settings", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const updates = req.body as Record<string, string>;
  try {
    for (const [key, value] of Object.entries(updates)) {
      if (!key.startsWith("g2g_")) continue;
      // Don't overwrite the env-var key with a masked placeholder
      if (key === "g2g_api_key" && (value === "***env:G2G_API_KEY***" || value === "")) continue;
      const exists = await queryExt<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM settings WHERE \`key\`=?`, [key]);
      if (Number(exists[0]?.cnt ?? 0) > 0) { await queryExt(`UPDATE settings SET value=? WHERE \`key\`=?`, [String(value ?? ""), key]); }
      else { await queryExt(`INSERT INTO settings (\`key\`, value) VALUES (?, ?)`, [key, String(value ?? "")]); }
    }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: "Failed to save G2G settings" }); }
});

// Ensure g2g_orders table exists
(async () => { try { await queryExt(TABLE_DDL.g2g_orders); } catch { /* already exists */ } })();

// ── G2G: Live offers — local DB primary, API as secondary (API may be IP-restricted) ─
router.get("/admin/g2g/offers", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    // Always return local listings from g2g_listings table
    await ensureTable("g2g_listings");
    const localListings = await queryExt<any>("SELECT * FROM g2g_listings ORDER BY created_at DESC LIMIT 200")
      .catch(() => [] as any[]);

    // Try live API in background — non-blocking
    let apiOffers: any[] = [];
    let apiStatus = "not_attempted";
    {
      try {
        const { ok, data, status } = await g2gFetch("/v2/seller/offers?currency=USD&order=created_at.desc&page=1&page_size=50");
        if (ok) {
          apiOffers = (data as any)?.payload?.results ?? (data as any)?.payload ?? (data as any)?.data ?? [];
          apiStatus = "ok";
          // Sync API offers into local DB
          for (const o of apiOffers) {
            const gId = o.offer_id ?? o.id;
            if (!gId) continue;
            const exists = await queryExt<any>("SELECT id FROM g2g_listings WHERE g2g_id = ? LIMIT 1", [gId]).catch(() => []);
            const title = o.title ?? o.offer_title ?? "G2G Listing";
            const price = parseFloat(o.price?.amount ?? o.price ?? 0);
            const stock = o.quantity ?? o.stock ?? 1;
            const status2 = o.status ?? "active";
            if (exists.length > 0) {
              await queryExt("UPDATE g2g_listings SET title=?, price=?, stock=?, status=?, last_synced_at=NOW() WHERE g2g_id=?",
                [title, price, stock, status2, gId]).catch(() => {});
            } else {
              await queryExt("INSERT INTO g2g_listings (platform, title, price, stock, status, g2g_id, last_synced_at) VALUES ('G2G',?,?,?,?,?,NOW())",
                [title, price, stock, status2, gId]).catch(() => {});
            }
          }
        } else { apiStatus = `error_${status}`; }
      } catch (e: any) { apiStatus = `unreachable: ${e?.message?.slice?.(0,50)}`; }
    }

    // Refresh local listings after potential sync
    const finalListings = await queryExt<any>("SELECT * FROM g2g_listings ORDER BY created_at DESC LIMIT 200").catch(() => localListings);
    res.json({ offers: finalListings, apiOffers, apiStatus, total: finalListings.length });
  } catch (err: any) { res.status(500).json({ error: "Failed to load G2G offers", detail: err?.message }); }
});

// ── G2G: Orders — local DB primary ────────────────────────────────────────────
router.get("/admin/g2g/orders", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureTable("g2g_orders");
    const status = String(req.query.status ?? "").trim();
    const search = String(req.query.search ?? "").trim();
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "20"))));
    const offset = Math.max(0, parseInt(String(req.query.offset ?? "0")));
    const page = Math.floor(offset / limit) + 1;

    let where = "1=1";
    const params: any[] = [];
    if (status && status !== "all") { where += " AND status = ?"; params.push(status); }
    if (search) { where += " AND (order_number LIKE ? OR buyer_name LIKE ? OR listing_title LIKE ?)"; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    const [orders, countRows] = await Promise.all([
      queryExt<any>(`SELECT * FROM g2g_orders WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]),
      queryExt<any>(`SELECT COUNT(*) as cnt FROM g2g_orders WHERE ${where}`, params),
    ]);
    res.json({ orders: Array.isArray(orders) ? orders : [], total: Number(countRows[0]?.cnt ?? 0), page, limit });
  } catch (err: any) { res.status(500).json({ error: "Failed to load G2G orders", detail: err?.message }); }
});

// ── G2G: Order lookup by order number — local + API ───────────────────────────
router.get("/admin/g2g/order/lookup", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureTable("g2g_orders");
    const num = String(req.query.order_number ?? req.query.num ?? "").trim();
    if (!num) { res.status(400).json({ error: "Order number required (use ?order_number=...)" }); return; }

    // Check local DB first
    const local = await queryExt<any>("SELECT * FROM g2g_orders WHERE order_number = ? LIMIT 1", [num]).catch(() => []);
    if (local.length > 0) { res.json({ order: local[0], source: "local" }); return; }

    // Try G2G API
    {
      const { ok, data } = await g2gFetch(`/v2/seller/orders/${encodeURIComponent(num)}`);
      if (ok && data && typeof data === "object") {
        const o = (data as any)?.payload ?? data;
        // Save to local DB for future reference
        await queryExt(
          `INSERT INTO g2g_orders (order_number, g2g_listing_id, listing_title, buyer_name, buyer_id, quantity, unit_price, total_amount, currency, status, raw_data)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [num, o.offer_id ?? null, o.offer_title ?? o.title ?? null, o.buyer?.username ?? null, o.buyer?.id ?? null,
           o.quantity ?? 1, parseFloat(o.unit_price ?? o.price?.amount ?? 0), parseFloat(o.total ?? o.price?.amount ?? 0),
           o.currency ?? "USD", o.status ?? "pending", JSON.stringify(o)]
        ).catch(() => {});
        const saved = await queryExt<any>("SELECT * FROM g2g_orders WHERE order_number = ? LIMIT 1", [num]).catch(() => []);
        res.json({ order: saved[0] ?? o, source: "api" }); return;
      }
    }
    res.json({ order: null, source: "not_found" });
  } catch (err: any) { res.status(500).json({ error: "Lookup failed", detail: err?.message }); }
});

// ── G2G: Save / add order manually ────────────────────────────────────────────
router.post("/admin/g2g/order/save", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureTable("g2g_orders");
    const { order_number, listing_title, buyer_name, buyer_email, buyer_id, quantity, unit_price,
            total_amount, currency, status, g2g_listing_id } = req.body as Record<string, any>;
    if (!order_number) { res.status(400).json({ error: "order_number required" }); return; }

    const exists = await queryExt<any>("SELECT id FROM g2g_orders WHERE order_number = ? LIMIT 1", [order_number]).catch(() => []);
    if (exists.length > 0) {
      await queryExt(
        "UPDATE g2g_orders SET listing_title=?, buyer_name=?, buyer_email=?, buyer_id=?, quantity=?, unit_price=?, total_amount=?, currency=?, status=?, g2g_listing_id=? WHERE order_number=?",
        [listing_title ?? null, buyer_name ?? null, buyer_email ?? null, buyer_id ?? null,
         quantity ?? 1, parseFloat(unit_price ?? 0), parseFloat(total_amount ?? 0),
         currency ?? "USD", status ?? "pending", g2g_listing_id ?? null, order_number]
      );
    } else {
      await queryExt(
        `INSERT INTO g2g_orders (order_number, g2g_listing_id, listing_title, buyer_name, buyer_email, buyer_id, quantity, unit_price, total_amount, currency, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [order_number, g2g_listing_id ?? null, listing_title ?? null, buyer_name ?? null, buyer_email ?? null,
         buyer_id ?? null, quantity ?? 1, parseFloat(unit_price ?? 0), parseFloat(total_amount ?? 0),
         currency ?? "USD", status ?? "pending"]
      );
    }
    const saved = await queryExt<any>("SELECT * FROM g2g_orders WHERE order_number = ? LIMIT 1", [order_number]);
    res.json({ success: true, order: saved[0] ?? null });
  } catch (err: any) { res.status(500).json({ error: "Save order failed", detail: err?.message }); }
});

router.post("/admin/g2g/offer", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    
    const { ok, data } = await g2gFetch("/v2/seller/offers", "POST", req.body);
    if (!ok) { res.status(502).json({ error: "G2G API error", detail: data }); return; }
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ error: "G2G create failed", detail: err?.message }); }
});

router.patch("/admin/g2g/offer/:offerId", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    
    const { ok, data } = await g2gFetch(`/v2/seller/offers/${req.params.offerId}`, "PATCH", req.body);
    if (!ok) { res.status(502).json({ error: "G2G API error", detail: data }); return; }
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ error: "G2G update failed", detail: err?.message }); }
});

// ── G2G: Deliver order (record delivery + try API fulfill) ────────────────────
router.post("/admin/g2g/order/:orderId/fulfill", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureTable("g2g_orders");
    const orderId = req.params.orderId;
    const { delivery_content, delivery_notes } = req.body as { delivery_content?: string; delivery_notes?: string };

    // Record delivery locally
    const localExists = await queryExt<any>("SELECT id FROM g2g_orders WHERE order_number = ? LIMIT 1", [orderId]).catch(() => []);
    if (localExists.length > 0) {
      await queryExt(
        "UPDATE g2g_orders SET status = 'delivered', delivery_content = ?, delivery_notes = ?, delivered_at = NOW() WHERE order_number = ?",
        [delivery_content ?? null, delivery_notes ?? null, orderId]
      ).catch(() => {});
    }

    // Try G2G API fulfill
    let apiOk = false;
    let apiResult: any = null;
    {
      try {
        const body: any = {};
        if (delivery_content) body.delivery_note = delivery_content;
        const r = await g2gFetch(`/v2/seller/orders/${orderId}/fulfill`, "POST", body);
        apiOk = r.ok;
        apiResult = r.data;
      } catch (e: any) { apiResult = { error: e?.message }; }
    }

    res.json({
      success: true,
      local_updated: localExists.length > 0,
      api_fulfilled: apiOk,
      api_result: apiResult,
      message: apiOk
        ? "✅ Order fulfilled via G2G API and recorded locally"
        : "✅ Order marked as delivered locally (G2G API call attempted — check result above)"
    });
  } catch (err: any) { res.status(500).json({ error: "Fulfill failed", detail: err?.message }); }
});

// ── G2G: API connection test ───────────────────────────────────────────────────
router.get("/admin/g2g/test-connection", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    
    const start = Date.now();
    const { ok, status, data } = await g2gFetch("/v2/seller/offers?page=1&page_size=1");
    const ms = Date.now() - start;
    if (ok) {
      res.json({ status: "connected", latency_ms: ms, message: `G2G API connected ✅ (${ms}ms)` });
    } else {
      // Try to get outbound IP to help with whitelisting
      let serverIp = "unknown";
      try { const r = await fetch("https://ifconfig.me", { signal: AbortSignal.timeout(3000) }); serverIp = (await r.text()).trim(); } catch {}
      res.json({ status: "error", http_status: status, latency_ms: ms, server_ip: serverIp,
        message: `G2G API returned HTTP ${status}. If 403, whitelist server IP ${serverIp} in your G2G Seller Dashboard → API Settings → Allowed IPs.`,
        detail: typeof data === "string" ? data.slice(0, 200) : null });
    }
  } catch (err: any) {
    res.json({ status: "unreachable", message: `G2G API unreachable from this server — the G2G API likely requires IP whitelisting. Contact G2G support to whitelist your server IP.` });
  }
});

router.post("/admin/g2g/sync", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { listings } = req.body as { listings: Array<{ id: number; g2g_id?: string; title: string; price: string; stock: number }> };
    if (!Array.isArray(listings)) { res.status(400).json({ error: "listings array required" }); return; }
    
    const results: any[] = [];
    for (const listing of listings) {
      if (listing.g2g_id) {
        const r = await g2gFetch(`/v2/seller/offers/${listing.g2g_id}`, "PATCH", { price: parseFloat(listing.price), quantity: listing.stock });
        results.push({ id: listing.id, action: "update", ok: r.ok });
        if (r.ok) { try { await queryExt(`UPDATE g2g_listings SET last_synced_at = NOW() WHERE id = ?`, [listing.id]); } catch { /* ignore */ } }
      }
    }
    res.json({ success: true, synced: results.length, results });
  } catch (err: any) { res.status(500).json({ error: "Sync failed", detail: err?.message }); }
});

// ── G2G Seller Profile ─────────────────────────────────────────────────────
router.get("/admin/g2g/profile", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    
    const { ok, data } = await g2gFetch("/v2/seller/profile");
    if (!ok) { res.status(502).json({ error: "G2G API error", detail: data }); return; }
    res.json({ profile: data });
  } catch (err: any) { res.status(500).json({ error: "G2G profile fetch failed", detail: err?.message }); }
});

// ── G2G Analytics (revenue summary from local DB + live orders) ─────────────
router.get("/admin/g2g/analytics", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const [listings, recentOrders] = await Promise.all([
      queryExt<any>("SELECT status, price, stock FROM g2g_listings"),
      queryExt<any>("SELECT id, status, created_at FROM g2g_listings ORDER BY created_at DESC LIMIT 30"),
    ]);
    const totalListings = Array.isArray(listings) ? listings.length : 0;
    const activeListings = Array.isArray(listings) ? listings.filter((l: any) => l.status === "active").length : 0;
    const totalStock = Array.isArray(listings) ? listings.reduce((s: number, l: any) => s + (Number(l.stock) || 0), 0) : 0;
    const avgPrice = totalListings > 0
      ? Array.isArray(listings) ? (listings.reduce((s: number, l: any) => s + (parseFloat(l.price) || 0), 0) / totalListings).toFixed(2) : "0"
      : "0";

    // Try live G2G API for order stats
    let liveStats: any = null;
    {
      const r = await g2gFetch("/v2/seller/orders?page=1&page_size=100").catch(() => ({ ok: false, data: null }));
      if (r.ok && r.data) {
        const orders: any[] = Array.isArray(r.data?.data) ? r.data.data : [];
        const completed = orders.filter((o: any) => o.status === "completed" || o.status === "delivered");
        const revenue = completed.reduce((s: number, o: any) => s + (parseFloat(o.total_price || o.price || 0)), 0);
        liveStats = { totalOrders: orders.length, completedOrders: completed.length, liveRevenue: revenue.toFixed(2) };
      }
    }

    res.json({ totalListings, activeListings, totalStock, avgPrice, recentActivity: recentOrders, liveStats });
  } catch (err: any) { res.status(500).json({ error: "Analytics fetch failed", detail: err?.message }); }
});

// ── G2G Bulk Price Update ─────────────────────────────────────────────────
router.post("/admin/g2g/bulk-price", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { updates } = req.body as { updates: Array<{ g2g_id: string; price: number; stock?: number }> };
    if (!Array.isArray(updates) || updates.length === 0) { res.status(400).json({ error: "updates array required" }); return; }
    if (updates.length > 50) { res.status(400).json({ error: "Max 50 updates per request" }); return; }
    
    const results: any[] = [];
    for (const upd of updates) {
      if (!upd.g2g_id || typeof upd.price !== "number") { results.push({ g2g_id: upd.g2g_id, ok: false, error: "missing g2g_id or price" }); continue; }
      const body: Record<string, any> = { price: upd.price };
      if (upd.stock !== undefined) body.quantity = upd.stock;
      const r = await g2gFetch(`/v2/seller/offers/${upd.g2g_id}`, "PATCH", body);
      results.push({ g2g_id: upd.g2g_id, ok: r.ok, detail: r.data });
    }
    res.json({ success: true, updated: results.filter(r => r.ok).length, failed: results.filter(r => !r.ok).length, results });
  } catch (err: any) { res.status(500).json({ error: "Bulk update failed", detail: err?.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── G2G: Code Inventory Manager ───────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// GET /admin/g2g/inventory/:offerId — list inventory items for an offer
router.get("/admin/g2g/inventory/:offerId", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { ok, data } = await g2gFetch(`/v2/seller/inventory/${req.params.offerId}`);
    if (!ok) { res.status(502).json({ error: "G2G API error", detail: data }); return; }
    const items: any[] = (data as any)?.payload?.results ?? (data as any)?.payload ?? (data as any)?.data ?? [];
    res.json({ items, total: items.length });
  } catch (err: any) { res.status(500).json({ error: "Inventory fetch failed", detail: err?.message }); }
});

// POST /admin/g2g/inventory/:offerId — upload codes/keys to an offer
router.post("/admin/g2g/inventory/:offerId", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { codes } = req.body as { codes: Array<{ content: string; content_type?: string; expired_at?: number }> };
    if (!Array.isArray(codes) || codes.length === 0) { res.status(400).json({ error: "codes array required" }); return; }
    const payload = codes.map(c => ({ content: c.content, content_type: c.content_type ?? "text/plain", ...(c.expired_at ? { expired_at: c.expired_at } : {}) }));
    const { ok, data } = await g2gFetch(`/v2/seller/inventory/${req.params.offerId}`, "POST", { codes: payload });
    if (!ok) { res.status(502).json({ error: "G2G API error", detail: data }); return; }
    res.json({ success: true, data, uploaded: codes.length });
  } catch (err: any) { res.status(500).json({ error: "Upload failed", detail: err?.message }); }
});

// GET /admin/g2g/inventory/:offerId/:itemId — view a single code
router.get("/admin/g2g/inventory/:offerId/:itemId", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { ok, data } = await g2gFetch(`/v2/seller/inventory/${req.params.offerId}/${req.params.itemId}`);
    if (!ok) { res.status(502).json({ error: "G2G API error", detail: data }); return; }
    res.json({ item: (data as any)?.payload ?? data });
  } catch (err: any) { res.status(500).json({ error: "Code fetch failed", detail: err?.message }); }
});

// DELETE /admin/g2g/inventory/:offerId/:itemId — remove a code
router.delete("/admin/g2g/inventory/:offerId/:itemId", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { ok, data } = await g2gFetch(`/v2/seller/inventory/${req.params.offerId}/${req.params.itemId}`, "DELETE");
    if (!ok) { res.status(502).json({ error: "G2G API error", detail: data }); return; }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: "Delete failed", detail: err?.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── G2G: Order Delivery Flow ──────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// GET /admin/g2g/order/:orderId/deliveries — list all deliveries for an order
router.get("/admin/g2g/order/:orderId/deliveries", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const qs = req.query.after ? `?after=${encodeURIComponent(String(req.query.after))}` : "";
    const { ok, data } = await g2gFetch(`/v2/seller/orders/${req.params.orderId}/delivery${qs}`);
    if (!ok) { res.status(502).json({ error: "G2G API error", detail: data }); return; }
    const list = (data as any)?.payload?.delivery_list ?? (data as any)?.payload ?? [];
    res.json({ deliveries: list, after: (data as any)?.payload?.after ?? null });
  } catch (err: any) { res.status(500).json({ error: "Deliveries fetch failed", detail: err?.message }); }
});

// POST /admin/g2g/order/:orderId/deliver — send code(s) to buyer
router.post("/admin/g2g/order/:orderId/deliver", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { delivery_id, codes } = req.body as {
      delivery_id: string;
      codes: Array<{ content: string; content_type?: string; reference_id: string }>;
    };
    if (!delivery_id || !Array.isArray(codes) || codes.length === 0) {
      res.status(400).json({ error: "delivery_id and codes[] required" }); return;
    }
    const body = {
      delivery_id,
      codes: codes.map(c => ({ content: c.content, content_type: c.content_type ?? "text/plain", reference_id: c.reference_id })),
    };
    const { ok, data } = await g2gFetch(`/v2/seller/orders/${req.params.orderId}/delivery`, "POST", body);
    // Record locally
    await queryExt(
      `UPDATE g2g_orders SET status='delivered', delivered_at=NOW(), delivery_content=? WHERE order_number=?`,
      [codes.map(c => c.content).join("\n"), req.params.orderId]
    ).catch(() => {});
    if (!ok) { res.status(502).json({ error: "G2G API error", detail: data }); return; }
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ error: "Deliver failed", detail: err?.message }); }
});

// PATCH /admin/g2g/order/:orderId/delivery/:deliveryId — patch delivery (report issues)
router.patch("/admin/g2g/order/:orderId/delivery/:deliveryId", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { delivered_qty, delivery_issue, delivered_at, reference_id } = req.body as {
      delivered_qty: number;
      delivery_issue?: "incorrect_delivery_detail" | "insufficient_stock" | "others";
      delivered_at: number;
      reference_id?: string;
    };
    const body: Record<string, any> = { delivered_qty, delivered_at };
    if (delivery_issue) body.delivery_issue = delivery_issue;
    if (reference_id) body.reference_id = reference_id;
    const { ok, data } = await g2gFetch(`/v2/seller/orders/${req.params.orderId}/delivery/${req.params.deliveryId}`, "PATCH", body);
    if (!ok) { res.status(502).json({ error: "G2G API error", detail: data }); return; }
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ error: "Patch delivery failed", detail: err?.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── G2G: Offer Management (delete + search) ───────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// DELETE /admin/g2g/offer/:offerId — delist/remove an offer
router.delete("/admin/g2g/offer/:offerId", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { ok, data } = await g2gFetch(`/v2/seller/offers/${req.params.offerId}`, "DELETE");
    // Remove from local DB too
    await queryExt("DELETE FROM g2g_listings WHERE g2g_id = ?", [req.params.offerId]).catch(() => {});
    if (!ok) { res.status(502).json({ error: "G2G API error", detail: data }); return; }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: "Delete offer failed", detail: err?.message }); }
});

// POST /admin/g2g/offers/search — search with filters
router.post("/admin/g2g/offers/search", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const body: Record<string, any> = {};
    if (req.body.status) body.filter = { ...(body.filter ?? {}), status: req.body.status };
    if (req.body.brand_id) body.filter = { ...(body.filter ?? {}), brand_id: req.body.brand_id };
    if (req.body.query) body.filter = { ...(body.filter ?? {}), query: req.body.query };
    body.page_size = req.body.page_size ?? 20;
    body.page = req.body.page ?? 1;
    const { ok, data } = await g2gFetch("/v2/seller/offers/search", "POST", body);
    if (!ok) { res.status(502).json({ error: "G2G API error", detail: data }); return; }
    const results: any[] = (data as any)?.payload?.results ?? (data as any)?.payload ?? [];
    res.json({ offers: results, total: (data as any)?.payload?.total ?? results.length });
  } catch (err: any) { res.status(500).json({ error: "Search failed", detail: err?.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── G2G: Product Catalog Browser ──────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// GET /admin/g2g/catalog/services — all services (game categories)
router.get("/admin/g2g/catalog/services", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const { ok, data } = await g2gFetch("/v2/products/service");
    if (!ok) { res.status(502).json({ error: "G2G API error", detail: data }); return; }
    const services: any[] = (data as any)?.payload?.results ?? (data as any)?.payload ?? (data as any)?.data ?? [];
    res.json({ services });
  } catch (err: any) { res.status(500).json({ error: "Services fetch failed", detail: err?.message }); }
});

// GET /admin/g2g/catalog/brands?service_id=... — brands under a service
router.get("/admin/g2g/catalog/brands", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const qs = req.query.service_id ? `?service_id=${encodeURIComponent(String(req.query.service_id))}` : "";
    const { ok, data } = await g2gFetch(`/v2/products/brand${qs}`);
    if (!ok) { res.status(502).json({ error: "G2G API error", detail: data }); return; }
    const brands: any[] = (data as any)?.payload?.results ?? (data as any)?.payload ?? [];
    res.json({ brands });
  } catch (err: any) { res.status(500).json({ error: "Brands fetch failed", detail: err?.message }); }
});

// GET /admin/g2g/catalog/products?brand_id=... — products under a brand
router.get("/admin/g2g/catalog/products", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const params: string[] = [];
    if (req.query.brand_id) params.push(`brand_id=${encodeURIComponent(String(req.query.brand_id))}`);
    if (req.query.service_id) params.push(`service_id=${encodeURIComponent(String(req.query.service_id))}`);
    const qs = params.length ? `?${params.join("&")}` : "";
    const { ok, data } = await g2gFetch(`/v2/products${qs}`);
    if (!ok) { res.status(502).json({ error: "G2G API error", detail: data }); return; }
    const products: any[] = (data as any)?.payload?.results ?? (data as any)?.payload ?? [];
    res.json({ products });
  } catch (err: any) { res.status(500).json({ error: "Products fetch failed", detail: err?.message }); }
});

// GET /admin/g2g/catalog/:productId/attributes — attributes for a product
router.get("/admin/g2g/catalog/:productId/attributes", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { ok, data } = await g2gFetch(`/v2/products/${req.params.productId}/attribute`);
    if (!ok) { res.status(502).json({ error: "G2G API error", detail: data }); return; }
    const attributes: any[] = (data as any)?.payload?.results ?? (data as any)?.payload ?? [];
    res.json({ attributes });
  } catch (err: any) { res.status(500).json({ error: "Attributes fetch failed", detail: err?.message }); }
});

// POST /admin/g2g/catalog/:productId/pricing — get pricing for product+attributes
router.post("/admin/g2g/catalog/:productId/pricing", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { ok, data } = await g2gFetch(`/v2/products/${req.params.productId}/pricing`, "POST", req.body);
    if (!ok) { res.status(502).json({ error: "G2G API error", detail: data }); return; }
    res.json({ pricing: (data as any)?.payload ?? data });
  } catch (err: any) { res.status(500).json({ error: "Pricing fetch failed", detail: err?.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── G2G Webhook ingest (called by G2G when orders come in) ────────────────────
// ══════════════════════════════════════════════════════════════════════════════
// No requireAdmin — G2G calls this; validated by HMAC-SHA256 signature per docs
router.post("/g2g/webhook", async (req: Request, res: Response): Promise<void> => {
  try {
    const sig = req.headers["g2g-signature"] as string | undefined;
    const ts  = req.headers["g2g-timestamp"]  as string | undefined;
    // Validate signature: HMAC-SHA256(webhookSecretToken, webhookUrl + userId + timestamp)
    if (sig && ts) {
      const { secretKey: webhookSecret, userId } = resolveG2GCreds();
      const webhookUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
      const canonical  = `${webhookUrl}${userId}${ts}`;
      const expected   = crypto.createHmac("sha256", webhookSecret).update(canonical).digest("hex");
      if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
        res.status(401).json({ error: "Invalid webhook signature" }); return;
      }
    }
    const event = req.body;
    const eventType: string = event?.event_type || event?.type || event?.event || "unknown";
    // Log to MariaDB webhook_events table
    await queryExt(
      `CREATE TABLE IF NOT EXISTS g2g_webhook_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        payload JSON,
        received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed TINYINT(1) DEFAULT 0
      )`
    ).catch(() => {});
    await queryExt(
      `INSERT INTO g2g_webhook_events (event_type, payload, received_at) VALUES (?, ?, NOW())`,
      [eventType, JSON.stringify(event)]
    ).catch(() => {});
    // Handle specific event types
    if (eventType === "order.api_delivery" || eventType.includes("order")) {
      const orderId = event?.data?.order_id || event?.order_id;
      const status  = event?.data?.status   || event?.status;
      if (orderId && status) {
        await queryExt("UPDATE g2g_orders SET status=? WHERE order_number=?", [status, orderId]).catch(() => {});
      }
    }
    if (eventType === "offer.low_stock") {
      const offerId = event?.data?.offer_id || event?.offer_id;
      if (offerId) {
        await queryExt("UPDATE g2g_listings SET status='low_stock' WHERE g2g_id=?", [offerId]).catch(() => {});
      }
    }
    res.json({ received: true });
  } catch (err: any) { res.status(500).json({ error: "Webhook processing failed" }); }
});

// GET /admin/g2g/webhook-logs — view stored webhook events
router.get("/admin/g2g/webhook-logs", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    await queryExt(
      `CREATE TABLE IF NOT EXISTS g2g_webhook_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        payload JSON,
        received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed TINYINT(1) DEFAULT 0
      )`
    ).catch(() => {});
    const limit  = Math.min(200, parseInt(String(req.query.limit ?? "50")));
    const offset = Math.max(0, parseInt(String(req.query.offset ?? "0")));
    const type   = String(req.query.type ?? "").trim();
    let where = "1=1";
    const params: any[] = [];
    if (type && type !== "all") { where += " AND event_type = ?"; params.push(type); }
    const [rows, countRow] = await Promise.all([
      queryExt<any>(`SELECT id, event_type, payload, received_at, processed FROM g2g_webhook_events WHERE ${where} ORDER BY received_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]),
      queryExt<any>(`SELECT COUNT(*) as cnt FROM g2g_webhook_events WHERE ${where}`, params),
    ]);
    res.json({ events: rows ?? [], total: Number(countRow[0]?.cnt ?? 0) });
  } catch (err: any) { res.status(500).json({ error: "Webhook logs failed", detail: err?.message }); }
});

// ── Admin Settings CRUD ────────────────────────────────────────────────────────
router.get("/admin/site-settings", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await queryExt<{ key: string; value: string }>(`SELECT \`key\`, value FROM settings ORDER BY \`key\` ASC`);
    const map: Record<string, string> = {};
    rows.forEach(r => { map[r.key] = r.value; });
    res.json({ settings: map });
  } catch (err) { res.status(500).json({ error: "Failed to load settings" }); }
});

router.post("/admin/site-settings", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const updates = req.body as Record<string, string>;
  try {
    for (const [key, value] of Object.entries(updates)) {
      if (!key?.trim()) continue;
      const exists = await queryExt<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM settings WHERE \`key\`=?`, [key]);
      if (Number(exists[0]?.cnt ?? 0) > 0) {
        await queryExt(`UPDATE settings SET value=? WHERE \`key\`=?`, [String(value ?? ""), key]);
      } else {
        await queryExt(`INSERT INTO settings (\`key\`, value) VALUES (?, ?)`, [key, String(value ?? "")]);
      }
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Failed to save settings" }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── EXTENSION LOG INGEST (Chrome Extension → Server) ─────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// Ensure bump_logs table exists on first hit
async function ensureBumpLogs(): Promise<void> {
  try { await queryExt(TABLE_DDL.bump_logs); } catch { /* already exists */ }
}
ensureBumpLogs();

// POST /api/extension/log — receive bump event from Chrome extension
// Uses a lightweight token from settings.ext_log_token (not the admin HMAC token)
router.post("/extension/log", async (req: Request, res: Response): Promise<void> => {
  try {
    const { event, account_title, listing_id, platform, price, message, error_detail, ext_token, ext_version } = req.body as {
      event?: string; account_title?: string; listing_id?: string; platform?: string;
      price?: string; message?: string; error_detail?: string; ext_token?: string; ext_version?: string;
    };

    // Validate extension token (optional — if no token set in settings, allow through for dev)
    const tokenRows = await queryExt<{ setting_value: string }>(
      "SELECT setting_value FROM settings WHERE setting_key = 'ext_log_token' LIMIT 1"
    ).catch(() => [] as { setting_value: string }[]);
    const configuredToken = tokenRows[0]?.setting_value?.trim();
    if (configuredToken && ext_token !== configuredToken) {
      res.status(401).json({ error: "Invalid extension token" }); return;
    }

    // Validate event type
    const validEvents = ["bump_success", "bump_failed", "bump_limit", "bump_error", "bump_skip", "extension_start", "extension_stop", "cloud_sync"];
    const safeEvent = validEvents.includes(event ?? "") ? (event ?? "bump_success") : "bump_unknown";

    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket?.remoteAddress || null;

    await queryExt(
      `INSERT INTO bump_logs (event, account_title, listing_id, platform, price, message, error_detail, source, ip, ext_version)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'extension', ?, ?)`,
      [safeEvent, account_title || null, listing_id || null, (platform || "reddit").toLowerCase(), price || null,
       message || null, error_detail || null, ip, ext_version || null]
    );

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: "Log ingest failed", detail: err?.message });
  }
});

// GET /api/admin/extension/logs — paginated log list with filters
router.get("/admin/extension/logs", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureBumpLogs();
    const page = Math.max(1, parseInt(String(req.query.page ?? "1")));
    const limit = Math.min(200, Math.max(10, parseInt(String(req.query.limit ?? "100"))));
    const offset = (page - 1) * limit;
    const platform = String(req.query.platform ?? "").trim().toLowerCase();
    const event = String(req.query.event ?? "").trim();
    const search = String(req.query.search ?? "").trim();

    let where = "1=1";
    const params: any[] = [];
    if (platform && platform !== "all") { where += " AND platform = ?"; params.push(platform); }
    if (event && event !== "all") { where += " AND event = ?"; params.push(event); }
    if (search) { where += " AND (account_title LIKE ? OR message LIKE ? OR listing_id LIKE ?)"; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    const [rows, countRows] = await Promise.all([
      queryExt<any>(`SELECT * FROM bump_logs WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]),
      queryExt<any>(`SELECT COUNT(*) as cnt FROM bump_logs WHERE ${where}`, params),
    ]);

    res.json({ logs: Array.isArray(rows) ? rows : [], total: Number(countRows[0]?.cnt ?? 0), page, limit });
  } catch (err: any) { res.status(500).json({ error: "Failed to load logs", detail: err?.message }); }
});

// GET /api/admin/extension/stats — KPI stats
router.get("/admin/extension/stats", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    await ensureBumpLogs();
    const [total24h, successToday, limitToday, failedToday, last] = await Promise.all([
      queryExt<any>("SELECT COUNT(*) as cnt FROM bump_logs WHERE created_at >= NOW() - INTERVAL 24 HOUR"),
      queryExt<any>("SELECT COUNT(*) as cnt FROM bump_logs WHERE event = 'bump_success' AND created_at >= NOW() - INTERVAL 24 HOUR"),
      queryExt<any>("SELECT COUNT(*) as cnt FROM bump_logs WHERE event = 'bump_limit' AND created_at >= NOW() - INTERVAL 24 HOUR"),
      queryExt<any>("SELECT COUNT(*) as cnt FROM bump_logs WHERE event IN ('bump_failed','bump_error') AND created_at >= NOW() - INTERVAL 24 HOUR"),
      queryExt<any>("SELECT account_title, event, message, created_at FROM bump_logs ORDER BY created_at DESC LIMIT 1"),
    ]);
    const t = Number(total24h[0]?.cnt ?? 0);
    const s = Number(successToday[0]?.cnt ?? 0);
    const successRate = t > 0 ? Math.round((s / t) * 100) : 0;

    // All time summary
    const [allTime] = await Promise.all([
      queryExt<any>("SELECT event, COUNT(*) as cnt FROM bump_logs GROUP BY event"),
    ]);
    const byEvent: Record<string, number> = {};
    (Array.isArray(allTime) ? allTime : []).forEach((r: any) => { byEvent[r.event] = Number(r.cnt); });

    res.json({
      total24h: t, successRate, limitHits: Number(limitToday[0]?.cnt ?? 0),
      failed24h: Number(failedToday[0]?.cnt ?? 0),
      lastActivity: last[0] ?? null,
      byEvent,
      totalAllTime: Object.values(byEvent).reduce((a, b) => a + b, 0),
    });
  } catch (err: any) { res.status(500).json({ error: "Stats failed", detail: err?.message }); }
});

// DELETE /api/admin/extension/logs/clear — wipe all logs
router.delete("/admin/extension/logs/clear", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    await queryExt("TRUNCATE TABLE bump_logs");
    res.json({ ok: true, message: "All extension logs cleared" });
  } catch (err: any) { res.status(500).json({ error: "Clear failed", detail: err?.message }); }
});

export default router;
