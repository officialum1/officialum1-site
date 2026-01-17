import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

// Helper to query the database
export async function query(sql: string, params: any[] = []) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database Query Error:', error);
        throw error;
    }
}

// 1. Initialize Tables (Run this once or check on startup)
export async function initDB() {
    // Users Table
    await query(`
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(50) PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255),
            telegram VARCHAR(255),
            role VARCHAR(50) DEFAULT 'user', -- 'admin' or 'user'
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Products Table
    await query(`
        CREATE TABLE IF NOT EXISTS products (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price VARCHAR(50) NOT NULL,
            image TEXT,
            category VARCHAR(100),
            platform VARCHAR(100),
            description TEXT,
            type VARCHAR(50), -- 'account' or 'service'
            creds TEXT, -- Credentials or Service Details
            stock INT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Orders Table
    await query(`
        CREATE TABLE IF NOT EXISTS orders (
            orderId VARCHAR(50) PRIMARY KEY,
            userId VARCHAR(50),
            guestEmail VARCHAR(255),
            productId VARCHAR(50),
            amount VARCHAR(50),
            originalPrice VARCHAR(50),
            promoCode VARCHAR(50),
            method VARCHAR(50),
            status VARCHAR(50), -- 'paid', 'pending'
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Migration: Add Quantity & Delivery Info (Safe Alter)
    try { await query("ALTER TABLE orders ADD COLUMN quantity INT DEFAULT 1"); } catch (e) { }
    try { await query("ALTER TABLE orders ADD COLUMN delivery_info TEXT"); } catch (e) { }
    try { await query("ALTER TABLE orders ADD COLUMN delivery_status VARCHAR(50) DEFAULT 'pending'"); } catch (e) { }

    // Tickets Table
    await query(`
        CREATE TABLE IF NOT EXISTS tickets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Ticket Replies Table
    await query(`
        CREATE TABLE IF NOT EXISTS ticket_replies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ticket_id INT NOT NULL,
            sender VARCHAR(50) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
        )
    `);

    // Settings Table (Key-Value Store)
    await query(`
        CREATE TABLE IF NOT EXISTS settings (
            setting_key VARCHAR(100) PRIMARY KEY,
            setting_value TEXT
        )
    `);
}
