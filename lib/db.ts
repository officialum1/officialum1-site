// Database Connection Hub - v2.0
import mysql from 'mysql2/promise';

const sslMode = (process.env.DB_SSL || 'auto').toLowerCase();

const basePoolConfig: mysql.PoolOptions = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT || 5000),
};

function createPool(useSsl: boolean) {
    return mysql.createPool({
        ...basePoolConfig,
        ...(useSsl
            ? {
                ssl: {
                    rejectUnauthorized: false,
                },
            }
            : {}),
    });
}

function shouldUseSslInitially() {
    return sslMode === 'true' || sslMode === 'auto';
}

function isUnsupportedSslError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : '';
    return code === 'HANDSHAKE_NO_SSL_SUPPORT' || /does not support secure connection/i.test(message);
}

let poolUsesSsl = shouldUseSslInitially();
let pool = createPool(poolUsesSsl);

async function switchPoolToPlaintext() {
    if (!poolUsesSsl) return;
    poolUsesSsl = false;
    const oldPool = pool;
    pool = createPool(false);
    try {
        await oldPool.end();
    } catch {
        // Ignore shutdown errors while swapping pools.
    }
}

async function runWithPool<T>(operation: () => Promise<T>): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        if (poolUsesSsl && sslMode === 'auto' && isUnsupportedSslError(error)) {
            console.warn('MySQL server does not support SSL. Retrying without SSL.');
            await switchPoolToPlaintext();
            return operation();
        }
        throw error;
    }
}

// Helper to query the database
export async function query(sql: string, params: any[] = []) {
    try {
        const [results] = await runWithPool(() => pool.query(sql, params));
        return results;
    } catch (error) {
        console.error('Database Query Error:', error);
        throw error;
    }
}

// Allow getting a dedicated connection for transactions
export async function getConnection() {
    return await runWithPool(() => pool.getConnection());
}

/**
 * Executes a callback within a database transaction.
 * @param callback A function that receives an object with a 'query' function to use within the transaction.
 */
export async function withTransaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
    const connection = await getConnection();
    await connection.beginTransaction();
    try {
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        console.error('Transaction Rollback Error:', error);
        throw error;
    } finally {
        connection.release();
    }
}


// Global Init Flag
let isInitialized = false;

// 1. Initialize Tables (Run this once or check on startup)
export async function initDB(force = false) {
    if (isInitialized && !force) return;

    // --- CORE TABLES ---

    // Users Table
    await query(`
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(50) PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(100) UNIQUE,
            password VARCHAR(255),
            telegram VARCHAR(255),
            role VARCHAR(50) DEFAULT 'buyer',
            referral_code VARCHAR(50),
            referred_by VARCHAR(50),
            verification_token VARCHAR(255),
            is_verified BOOLEAN DEFAULT FALSE,
            is_banned BOOLEAN DEFAULT FALSE,
            membership VARCHAR(50) DEFAULT 'none',
            membership_expires TIMESTAMP NULL,
            total_spent DECIMAL(10,2) DEFAULT 0.00,
            points INT DEFAULT 0,
            reset_token VARCHAR(100),
            wallet_balance DECIMAL(10,2) DEFAULT 0.00,
            affiliate_balance DECIMAL(10,2) DEFAULT 0.00,
            total_affiliate_earnings DECIMAL(10,2) DEFAULT 0.00,
            permissions TEXT,
            two_factor_enabled BOOLEAN DEFAULT FALSE,
            tier VARCHAR(50) DEFAULT 'Bronze',
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
            type VARCHAR(50),
            creds TEXT,
            stock INT DEFAULT 1,
            g2g_listing_id VARCHAR(100),
            category_id INT,
            user_id VARCHAR(50),
            status VARCHAR(50) DEFAULT 'active',
            sale_price VARCHAR(50),
            sale_ends_at TIMESTAMP NULL,
            bundle_items TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Categories Table
    await query(`
        CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            slug VARCHAR(100) NOT NULL UNIQUE,
            icon VARCHAR(50),
            image TEXT NULL,
            discount_percent DECIMAL(5,2) DEFAULT 0.00,
            sale_ends_at TIMESTAMP NULL,
            is_vip_only BOOLEAN DEFAULT FALSE,
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
            status VARCHAR(50),
            method VARCHAR(50),
            quantity INT DEFAULT 1,
            delivery_info TEXT,
            delivery_status VARCHAR(50) DEFAULT 'pending',
            delivery_details TEXT,
            fulfilled_by VARCHAR(50),
            review_sent BOOLEAN DEFAULT FALSE,
            coupon_code VARCHAR(50),
            discount_amount DECIMAL(10,2) DEFAULT 0.00,
            progress_percent INT DEFAULT 0,
            report_link TEXT,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Inventory Table
    await query(`
        CREATE TABLE IF NOT EXISTS inventory (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255),
            platform VARCHAR(50),
            purchasePrice DECIMAL(10,2),
            status VARCHAR(50) DEFAULT 'In Stock',
            purchaseDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            accountDetails LONGTEXT,
            account_email VARCHAR(255),
            account_username VARCHAR(255),
            account_password VARCHAR(255),
            account_region VARCHAR(50),
            account_level VARCHAR(50),
            account_meta JSON,
            image LONGTEXT
        )
    `);

    // Settings Table
    await query(`
        CREATE TABLE IF NOT EXISTS settings (
            setting_key VARCHAR(100) PRIMARY KEY,
            setting_value TEXT,
            referral_commission_rate DECIMAL(5,2) DEFAULT 5.00
        )
    `);

    // Activity Logs
    await query(`
        CREATE TABLE IF NOT EXISTS activity_logs (
            id VARCHAR(50) PRIMARY KEY,
            user VARCHAR(100),
            action VARCHAR(100),
            details TEXT,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // --- SUPPORT & CONTENT ---

    // Tickets & Replies
    await query(`
        CREATE TABLE IF NOT EXISTS tickets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'open',
            attachment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

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
            slug VARCHAR(255) UNIQUE,
            category VARCHAR(100),
            image LONGTEXT,
            excerpt TEXT,
            content LONGTEXT,
            author VARCHAR(100) DEFAULT 'OfficialUM1 Team',
            views INT DEFAULT 0,
            read_time VARCHAR(20) DEFAULT '5 min',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Knowledge Base & History
    await query(`
        CREATE TABLE IF NOT EXISTS knowledge_base (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            content LONGTEXT NOT NULL,
            category VARCHAR(100) DEFAULT 'General',
            views INT DEFAULT 0,
            is_published BOOLEAN DEFAULT TRUE,
            meta_description TEXT,
            keywords TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS kb_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            kb_id INT NOT NULL,
            old_title TEXT,
            old_content LONGTEXT,
            changed_by VARCHAR(100) DEFAULT 'Admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (kb_id) REFERENCES knowledge_base(id) ON DELETE CASCADE
        )
    `);

    // --- BUSINESS & CRM ---

    // Leads (CRM)
    await query(`
        CREATE TABLE IF NOT EXISTS leads (
            id VARCHAR(50) PRIMARY KEY,
            clientName VARCHAR(255),
            platform VARCHAR(50),
            budget DECIMAL(10,2),
            status VARCHAR(50),
            notes TEXT,
            buyerEmail VARCHAR(255),
            document_link TEXT,
            website_url VARCHAR(255),
            lighthouse_score VARCHAR(50),
            personalized_pitch TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Transactions (Internal Finance)
    await query(`
        CREATE TABLE IF NOT EXISTS transactions (
            id VARCHAR(50) PRIMARY KEY,
            type VARCHAR(50),
            platform VARCHAR(50),
            amount DECIMAL(10,2),
            description TEXT,
            processedBy VARCHAR(100),
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            inventoryId VARCHAR(50),
            cost DECIMAL(10,2) DEFAULT 0.00,
            quantity INT DEFAULT 1
        )
    `);

    // Payouts
    await query(`
        CREATE TABLE IF NOT EXISTS payouts(
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            method VARCHAR(50) NOT NULL,
            details TEXT NOT NULL,
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // --- INTEGRATIONS ---

    // G2G Integration
    await query(`
        CREATE TABLE IF NOT EXISTS g2g_orders (
            order_id VARCHAR(100) PRIMARY KEY,
            product_name VARCHAR(255),
            amount DECIMAL(10,2) DEFAULT 0.00,
            profit DECIMAL(10,2) DEFAULT 0.00,
            status VARCHAR(50) DEFAULT 'Paid',
            raw_payload LONGTEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS g2g_offers (
            offer_id VARCHAR(100) PRIMARY KEY,
            product_id VARCHAR(50),
            product_name VARCHAR(255),
            unit_price DECIMAL(10,2) DEFAULT 0.00,
            currency VARCHAR(10) DEFAULT 'USD',
            api_qty INT DEFAULT 0,
            auto_sync BOOLEAN DEFAULT TRUE,
            last_checked TIMESTAMP NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Z2U Center
    await query(`
        CREATE TABLE IF NOT EXISTS z2u_listings (
            id VARCHAR(50) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            url VARCHAR(255) UNIQUE NOT NULL,
            platform VARCHAR(50) DEFAULT 'Other',
            price DECIMAL(10,2),
            stock INT,
            status VARCHAR(50) DEFAULT 'Active',
            last_sync TIMESTAMP NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS z2u_bump_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            message TEXT,
            type VARCHAR(50) DEFAULT 'info',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // --- UTILITIES ---

    // Deliveries
    await query(`
        CREATE TABLE IF NOT EXISTS deliveries (
            token VARCHAR(100) PRIMARY KEY,
            orderId VARCHAR(50),
            itemName VARCHAR(255),
            details LONGTEXT,
            proofImage LONGTEXT,
            views INT DEFAULT 0,
            ipAddress VARCHAR(100) DEFAULT NULL,
            userAgent VARCHAR(255) DEFAULT NULL,
            revealedAt TIMESTAMP NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Verification Requests
    await query(`
        CREATE TABLE IF NOT EXISTS verification_requests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL,
            type VARCHAR(50) DEFAULT 'identity',
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            document_image LONGTEXT,
            selfie_image LONGTEXT,
            notes TEXT,
            rejection_reason TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Live Traffic
    await query(`
        CREATE TABLE IF NOT EXISTS live_traffic(
            session_id VARCHAR(100) PRIMARY KEY,
            ip_address VARCHAR(100),
            current_page VARCHAR(255),
            user_agent VARCHAR(255),
            location VARCHAR(100) DEFAULT 'Unknown',
            last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Employees (HR)
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
            username VARCHAR(100),
            permissions TEXT,
            joinDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // --- SECONDARY TABLES & MIGRATIONS ---
    try {
        // Essential migrations that might be missing in production
        await query("CREATE INDEX idx_orders_userId ON orders(userId)");
        await query("CREATE INDEX idx_orders_status ON orders(status)");
        await query("CREATE INDEX idx_products_stock ON products(stock)");
        await query("CREATE INDEX idx_users_email ON users(email)");
    } catch (e) { }

    // Final Flag
    isInitialized = true;
    console.log("Database initialized successfully.");
}
