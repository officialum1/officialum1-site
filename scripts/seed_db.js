const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

// Helper to read JSON, handling UTF-16LE or UTF-8
function readJsonFile(filePath) {
    try {
        const buffer = fs.readFileSync(filePath);
        let content;

        // Check for UTF-16LE BOM (FF FE)
        if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
            content = buffer.toString('utf16le');
        }
        // Check for UTF-8 BOM (EF BB BF)
        else if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
            content = buffer.slice(3).toString('utf8');
        }
        // Default to UTF-8
        else {
            content = buffer.toString('utf8');
        }

        // Remove any residual BOM or whitespace
        content = content.trim();
        if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);

        return JSON.parse(content);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return [];
    }
}

async function seed() {
    console.log('🌱 Starting Database Seeding...');

    // 1. Connect to Database
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const conn = await pool.getConnection();
        console.log('✅ Connected to MySQL');

        // --- SEED USERS ---
        const users = readJsonFile(path.join(__dirname, '../data/users.json'));
        if (users.length > 0) {
            console.log(`Processing ${users.length} users...`);
            for (const user of users) {
                // Check if exists
                const [existing] = await conn.execute('SELECT id FROM users WHERE email = ?', [user.email]);
                if (existing.length === 0) {
                    await conn.execute(
                        `INSERT INTO users (id, email, password, telegram, role) VALUES (?, ?, ?, ?, ?)`,
                        [user.id || `user_${Date.now()}`, user.email, user.password, user.telegram, user.role || 'buyer']
                    );
                }
            }
            console.log('✅ Users seeded');
        }

        // --- SEED PRODUCTS ---
        const products = readJsonFile(path.join(__dirname, '../data/products.json'));
        if (products.length > 0) {
            console.log(`Processing ${products.length} products...`);
            for (const p of products) {
                const [existing] = await conn.execute('SELECT id FROM products WHERE name = ?', [p.name]);
                if (existing.length === 0) {
                    await conn.execute(
                        `INSERT INTO products (name, price, image, platform, description, type, creds, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [p.name, p.price, p.image, p.platform, p.desc || p.description, p.type || 'account', p.creds || '', 10] // Default stock 10
                    );
                }
            }
            console.log('✅ Products seeded');
        }

        // --- SEED ORDERS ---
        const orders = readJsonFile(path.join(__dirname, '../data/orders.json'));
        if (orders.length > 0) {
            console.log(`Processing ${orders.length} orders...`);
            for (const o of orders) {
                const [existing] = await conn.execute('SELECT orderId FROM orders WHERE orderId = ?', [o.orderId]);
                if (existing.length === 0) {
                    await conn.execute(
                        `INSERT INTO orders (orderId, userId, productId, amount, method, status, date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [o.orderId, o.userId, o.productId, o.amount, o.method, o.status, new Date(o.date)]
                    );
                }
            }
            console.log('✅ Orders seeded');
        }

        // --- SEED TRANSACTIONS / BALANCE HISTORY ---
        const history = readJsonFile(path.join(__dirname, '../data/balance_history.json'));
        if (history.length > 0) {
            console.log(`Processing ${history.length} transactions...`);
            for (const t of history) {
                // history items might not have 'id' if tailored for JSON view, but let's check
                const tId = t.id || `trans_${Date.now()}_${Math.random()}`;
                const [existing] = await conn.execute('SELECT id FROM transactions WHERE id = ?', [tId]);
                if (existing.length === 0) {
                    await conn.execute(
                        `INSERT INTO transactions (id, type, platform, amount, description, processedBy, date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [tId, t.type || 'sale', t.platform, t.amount, t.description, t.processedBy, new Date(t.date)]
                    );
                }
            }
            console.log('✅ Transactions seeded');
        }

        conn.release();
        console.log('🎉 Seeding Complete!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Seeding Failed:', err);
        process.exit(1);
    }
}

seed();
