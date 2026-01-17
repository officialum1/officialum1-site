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

    // Settings Table (Key-Value Store)
    await query(`
        CREATE TABLE IF NOT EXISTS settings (
            setting_key VARCHAR(100) PRIMARY KEY,
            setting_value TEXT
        )
    `);
}
