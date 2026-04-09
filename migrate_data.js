const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    console.log("Starting Migration...");
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    // 1. PROMOS -> COUPONS
    console.log("Migrating Promos...");
    const promoPath = path.join(process.cwd(), 'data', 'promocodes.json');
    try {
        const promoData = JSON.parse(await fs.readFile(promoPath, 'utf8'));
        for (const p of promoData) {
            // Check if exists
            const [rows] = await conn.execute("SELECT id FROM coupons WHERE code = ?", [p.code]);
            if (rows.length === 0) {
                await conn.execute(
                    "INSERT INTO coupons (code, type, value, expiry, status, created_at) VALUES (?, 'percent', ?, ?, 'active', ?)",
                    [p.code, p.discount, p.expiresAt ? new Date(p.expiresAt) : null, new Date(p.createdAt || Date.now())]
                );
                console.log(`Inserted Coupon: ${p.code}`);
            } else {
                console.log(`Coupon ${p.code} already exists.`);
            }
        }
    } catch (e) {
        console.error("Promo Migration Error:", e.message);
    }

    // 2. POSTS -> BLOGS
    console.log("Migrating Blogs...");
    const blogPath = path.join(process.cwd(), 'data', 'posts.json');
    try {
        const blogData = JSON.parse(await fs.readFile(blogPath, 'utf8'));
        for (const b of blogData) {
            const [rows] = await conn.execute("SELECT id FROM blogs WHERE title = ?", [b.title]);
            if (rows.length === 0) {
                await conn.execute(
                    "INSERT INTO blogs (title, category, image, excerpt, content, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                    [b.title, b.category, b.image, b.excerpt, b.content, new Date(b.date || Date.now())]
                );
                console.log(`Inserted Blog: ${b.title}`);
            } else {
                console.log(`Blog ${b.title} already exists.`);
            }
        }
    } catch (e) {
        console.error("Blog Migration Error (file likely missing or empty):", e.message);
    }

    console.log("Migration Complete.");
    conn.end();
}

migrate();
