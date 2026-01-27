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
            role VARCHAR(50) DEFAULT 'buyer', -- 'admin', 'buyer', or 'seller'
            referral_code VARCHAR(50),
            referred_by VARCHAR(50),
            verification_token VARCHAR(255),
            is_verified BOOLEAN DEFAULT FALSE,
            reset_token VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Products Table
    await query(`
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price VARCHAR(50) NOT NULL,
            image TEXT,
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

    // Blogs Table
    await query(`
        CREATE TABLE IF NOT EXISTS blogs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            excerpt TEXT,
            content LONGTEXT,
            category VARCHAR(100),
            image VARCHAR(255),
            author VARCHAR(100) DEFAULT 'Admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Newsletter Table
    await query(`
        CREATE TABLE IF NOT EXISTS newsletter (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Migration: Support Ticket Attachments
    try { await query("ALTER TABLE tickets ADD COLUMN attachment TEXT"); } catch (e) { }

    // Testimonials Table
    await query(`
        CREATE TABLE IF NOT EXISTS testimonials (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            role VARCHAR(255),
            review TEXT NOT NULL,
            rating INT DEFAULT 5,
            approved BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Settings Table (Key-Value Store)
    await query(`
        CREATE TABLE IF NOT EXISTS settings (
            setting_key VARCHAR(100) PRIMARY KEY,
            setting_value TEXT
        )
    `);

    // --- NEW ADMIN TABLES ---

    // 1. Inventory
    await query(`
        CREATE TABLE IF NOT EXISTS inventory (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255),
            platform VARCHAR(50),
            purchasePrice DECIMAL(10,2),
            status VARCHAR(50) DEFAULT 'In Stock',
            purchaseDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            accountDetails LONGTEXT
        )
    `);

    // 2. Transactions (Balance History)
    await query(`
        CREATE TABLE IF NOT EXISTS transactions (
            id VARCHAR(50) PRIMARY KEY,
            type VARCHAR(50),
            platform VARCHAR(50),
            amount DECIMAL(10,2),
            description TEXT,
            processedBy VARCHAR(100),
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            inventoryId VARCHAR(50)
        )
    `);

    // 3. Leads (CRM)
    await query(`
        CREATE TABLE IF NOT EXISTS leads (
            id VARCHAR(50) PRIMARY KEY,
            clientName VARCHAR(255),
            platform VARCHAR(50),
            budget DECIMAL(10,2),
            status VARCHAR(50),
            notes TEXT,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 4. Employees (HR)
    await query(`
        CREATE TABLE IF NOT EXISTS employees (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255),
            password VARCHAR(255),
            position VARCHAR(100),
            department VARCHAR(100),
            salary DECIMAL(10,2),
            commissionRate DECIMAL(5,2),
            compensationType VARCHAR(50),
            allowedPlatforms TEXT,
            status VARCHAR(50),
            joinDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 5. Deliveries
    await query(`
        CREATE TABLE IF NOT EXISTS deliveries (
            token VARCHAR(100) PRIMARY KEY,
            orderId VARCHAR(50),
            itemName VARCHAR(255),
            details LONGTEXT,
            proofImage LONGTEXT,
            views INT DEFAULT 0,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 6. Social Posts
    await query(`
        CREATE TABLE IF NOT EXISTS social_posts (
            id VARCHAR(50) PRIMARY KEY,
            content TEXT,
            platform VARCHAR(50),
            status VARCHAR(50),
            likes INT DEFAULT 0,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // --- MIGRATIONS & NEW COLUMNS ---
    try { await query("ALTER TABLE users ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 0.00"); } catch (e) { }
    try { await query("ALTER TABLE users ADD COLUMN affiliate_balance DECIMAL(10,2) DEFAULT 0.00"); } catch (e) { }
    try { await query("ALTER TABLE users ADD COLUMN total_affiliate_earnings DECIMAL(10,2) DEFAULT 0.00"); } catch (e) { }
    try { await query("ALTER TABLE users ADD COLUMN permissions TEXT"); } catch (e) { }
    try { await query("ALTER TABLE orders ADD COLUMN review_sent BOOLEAN DEFAULT FALSE"); } catch (e) { }
    try { await query("ALTER TABLE testimonials ADD COLUMN order_id VARCHAR(50)"); } catch (e) { }
    try { await query("ALTER TABLE testimonials ADD COLUMN product_id INT"); } catch (e) { }

    // 8. Wallet Transactions
    await query(`
        CREATE TABLE IF NOT EXISTS wallet_transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL,
            type ENUM('deposit', 'purchase', 'refund', 'affiliate_payout') NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'completed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 9. Knowledge Base
    await query(`
        CREATE TABLE IF NOT EXISTS knowledge_base (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            content LONGTEXT NOT NULL,
            category VARCHAR(100) DEFAULT 'General',
            views INT DEFAULT 0,
            is_published BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 10. Promotional Codes (Expanded)
    try { await query("ALTER TABLE settings ADD COLUMN referral_commission_rate DECIMAL(5,2) DEFAULT 5.00"); } catch (e) { }
    try { await query("ALTER TABLE employees ADD COLUMN permissions TEXT"); } catch (e) { }

    // 11. Flash Sales & Bundles
    try { await query("ALTER TABLE products ADD COLUMN sale_price VARCHAR(50)"); } catch (e) { }
    try { await query("ALTER TABLE products ADD COLUMN sale_ends_at TIMESTAMP NULL"); } catch (e) { }
    try { await query("ALTER TABLE products ADD COLUMN bundle_items TEXT"); } catch (e) { } // JSON array of product IDs
}
