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
        const [results] = await pool.query(sql, params);
        return results;
    } catch (error) {
        console.error('Database Query Error:', error);
        throw error;
    }
}

// Allow getting a dedicated connection for transactions
export async function getConnection() {
    return await pool.getConnection();
}

/**
 * Executes a callback within a database transaction.
 * @param callback A function that receives an object with a 'query' function to use within the transaction.
 */
export async function withTransaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
    const connection = await pool.getConnection();
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

    // Users Table
    await query(`
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(50) PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(100) UNIQUE, -- Added for Staff/Public Profiles
            password VARCHAR(255),
            telegram VARCHAR(255),
            role VARCHAR(50) DEFAULT 'buyer', -- 'admin', 'buyer', or 'seller'
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Migration: Add username if missing
    try { await query("ALTER TABLE users ADD COLUMN username VARCHAR(100) UNIQUE"); } catch (e) { }

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
    try { await query("ALTER TABLE orders ADD COLUMN delivery_details TEXT"); } catch (e) { }
    try { await query("ALTER TABLE orders ADD COLUMN fulfilled_by VARCHAR(50)"); } catch (e) { }

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



    // Settings Table
    await query(`
        CREATE TABLE IF NOT EXISTS settings (
            setting_key VARCHAR(100) PRIMARY KEY,
            setting_value TEXT
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
            user_id VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    try { await query("ALTER TABLE testimonials ADD COLUMN user_id VARCHAR(50)"); } catch (e) { }

    // Settings Table (Key-Value Store)
    await query(`
        CREATE TABLE IF NOT EXISTS settings (
            setting_key VARCHAR(100) PRIMARY KEY,
            setting_value TEXT
        )
    `);

    // --- NEW ADMIN TABLES ---

    // 1. Inventory (Optimized for Search)
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
            account_meta JSON -- For any extra field-specific data
        )
    `);

    // Migration: Add searchable columns if missing
    try { await query("ALTER TABLE inventory ADD COLUMN account_email VARCHAR(255)"); } catch (e) { }
    try { await query("ALTER TABLE inventory ADD COLUMN account_username VARCHAR(255)"); } catch (e) { }
    try { await query("ALTER TABLE inventory ADD COLUMN account_password VARCHAR(255)"); } catch (e) { }
    try { await query("ALTER TABLE inventory ADD COLUMN account_region VARCHAR(50)"); } catch (e) { }
    try { await query("ALTER TABLE inventory ADD COLUMN account_level VARCHAR(50)"); } catch (e) { }
    try { await query("ALTER TABLE inventory ADD COLUMN account_meta JSON"); } catch (e) { }

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

    // Activity Logs (Internal Audit Trail)
    await query(`
        CREATE TABLE IF NOT EXISTS activity_logs (
            id VARCHAR(50) PRIMARY KEY,
            user VARCHAR(100),
            action VARCHAR(100),
            details TEXT,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 4. Shopping Cart Tables (Missing Sync Fix)
    await query(`
        CREATE TABLE IF NOT EXISTS carts (
            id VARCHAR(50) PRIMARY KEY,
            guest_email VARCHAR(255),
            status VARCHAR(50) DEFAULT 'active',
            last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS cart_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cart_id VARCHAR(50),
            product_id INT,
            quantity INT DEFAULT 1,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE
        )
    `);

    // 5. Wishlists (Migration to MySQL)
    await query(`
        CREATE TABLE IF NOT EXISTS wishlists (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50), -- Can be email or user ID
            product_id INT,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_wishlist (user_id, product_id)
        )
    `);

    isInitialized = true;
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
            username VARCHAR(100),
            joinDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Migration: Add username to employees
    try { await query("ALTER TABLE employees ADD COLUMN username VARCHAR(100)"); } catch (e) { }

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
    try { await query("ALTER TABLE products ADD COLUMN g2g_listing_id VARCHAR(100)"); } catch (e) { }
    try { await query("ALTER TABLE users ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 0.00"); } catch (e) { }
    try { await query("ALTER TABLE users ADD COLUMN affiliate_balance DECIMAL(10,2) DEFAULT 0.00"); } catch (e) { }
    try { await query("ALTER TABLE users ADD COLUMN total_affiliate_earnings DECIMAL(10,2) DEFAULT 0.00"); } catch (e) { }
    try { await query("ALTER TABLE users ADD COLUMN permissions TEXT"); } catch (e) { }
    try { await query("ALTER TABLE orders ADD COLUMN review_sent BOOLEAN DEFAULT FALSE"); } catch (e) { }
    try { await query("ALTER TABLE testimonials ADD COLUMN order_id VARCHAR(50)"); } catch (e) { }
    try { await query("ALTER TABLE testimonials ADD COLUMN product_id INT"); } catch (e) { }
    try { await query("ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT FALSE"); } catch (e) { }
    try { await query("ALTER TABLE users ADD COLUMN membership VARCHAR(50) DEFAULT 'none'"); } catch (e) { }
    try { await query("ALTER TABLE users ADD COLUMN membership_expires TIMESTAMP NULL"); } catch (e) { }
    try { await query("ALTER TABLE users ADD COLUMN total_spent DECIMAL(10,2) DEFAULT 0.00"); } catch (e) { }
    try { await query("ALTER TABLE users ADD COLUMN points INT DEFAULT 0"); } catch (e) { }
    try { await query("ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE"); } catch (e) { }
    try { await query("ALTER TABLE users ADD COLUMN tier VARCHAR(50) DEFAULT 'Bronze'"); } catch (e) { }

    try { await query("ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50)"); } catch (e) { }
    try { await query("ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0.00"); } catch (e) { }


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

    // 9. Knowledge Base (Optimized with Versioning)
    await query(`
        CREATE TABLE IF NOT EXISTS knowledge_base (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            content LONGTEXT NOT NULL,
            category VARCHAR(100) DEFAULT 'General',
            views INT DEFAULT 0,
            is_published BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // KB History / Audit Log (For "Knowing what was there")
    await query(`
        CREATE TABLE IF NOT EXISTS kb_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            kb_id INT NOT NULL,
            old_title TEXT,
            old_content LONGTEXT,
            changed_by VARCHAR(100) DEFAULT 'Admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    try { await query("ALTER TABLE knowledge_base ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"); } catch (e) { }
    try { await query("ALTER TABLE knowledge_base ADD COLUMN meta_description TEXT"); } catch (e) { }
    try { await query("ALTER TABLE knowledge_base ADD COLUMN keywords TEXT"); } catch (e) { }
    try { await query("ALTER TABLE knowledge_base MODIFY COLUMN content LONGTEXT"); } catch (e) { }

    // 10. Promotional Codes (Expanded)
    try { await query("ALTER TABLE settings ADD COLUMN referral_commission_rate DECIMAL(5,2) DEFAULT 5.00"); } catch (e) { }
    try { await query("ALTER TABLE employees ADD COLUMN permissions TEXT"); } catch (e) { }

    // 11. Flash Sales & Bundles
    try { await query("ALTER TABLE products ADD COLUMN sale_price VARCHAR(50)"); } catch (e) { }
    try { await query("ALTER TABLE products ADD COLUMN sale_ends_at TIMESTAMP NULL"); } catch (e) { }
    try { await query("ALTER TABLE products ADD COLUMN bundle_items TEXT"); } catch (e) { } // JSON array of product IDs

    // 12. Reviews Table (New)
    await query(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            user_id VARCHAR(50) NOT NULL,
            rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            status VARCHAR(20) DEFAULT 'approved',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Migration for Reviews (Exhaustive)
    try { await query("ALTER TABLE reviews ADD COLUMN product_id INT NOT NULL"); } catch (e) { }
    try { await query("ALTER TABLE reviews ADD COLUMN user_id VARCHAR(50) NOT NULL"); } catch (e) { }
    try { await query("ALTER TABLE reviews ADD COLUMN rating INT NOT NULL DEFAULT 5"); } catch (e) { }
    try { await query("ALTER TABLE reviews ADD COLUMN comment TEXT"); } catch (e) { }
    try { await query("ALTER TABLE reviews ADD COLUMN status VARCHAR(20) DEFAULT 'approved'"); } catch (e) { }
    try { await query("ALTER TABLE reviews ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"); } catch (e) { }

    // 13. Notifications Table
    await query(`
        CREATE TABLE IF NOT EXISTS notifications(
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info', -- 'deposit', 'order', 'support', 'system'
            is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
        `);

    // 14. Coupons Table
    await query(`
        CREATE TABLE IF NOT EXISTS coupons(
            id INT AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(50) UNIQUE NOT NULL,
            type ENUM('percent', 'flat') NOT NULL,
            value DECIMAL(10, 2) NOT NULL,
            min_amount DECIMAL(10, 2) DEFAULT 0.00,
            expiry TIMESTAMP NULL,
            status ENUM('active', 'inactive') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        `);

    // 15. Payouts Table (Affiliate Withdrawals)
    await query(`
        CREATE TABLE IF NOT EXISTS payouts(
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            method VARCHAR(50) NOT NULL, -- 'paypal', 'crypto', 'bank'
            details TEXT NOT NULL, -- address, email, etc.
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await query(`
        CREATE TABLE IF NOT EXISTS knowledge_base(
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            content LONGTEXT NOT NULL,
            category VARCHAR(100) DEFAULT 'General',
            views INT DEFAULT 0,
            is_published BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 17. KB History Table
    await query(`
        CREATE TABLE IF NOT EXISTS kb_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            kb_id INT NOT NULL,
            old_title VARCHAR(255),
            old_content LONGTEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (kb_id) REFERENCES knowledge_base(id) ON DELETE CASCADE
        )
    `);

    // 17. Blogs Table (SEO)
    await query(`
        CREATE TABLE IF NOT EXISTS blogs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255),
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

    // Add SEO Columns
    try { await query("ALTER TABLE knowledge_base ADD COLUMN meta_description TEXT"); } catch (e) { }
    try { await query("ALTER TABLE knowledge_base ADD COLUMN keywords TEXT"); } catch (e) { }

    // 17. Categories Table
    await query(`
        CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            slug VARCHAR(100) NOT NULL UNIQUE,
            icon VARCHAR(50),
            discount_percent DECIMAL(5,2) DEFAULT 0.00,
            sale_ends_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Migration: Add category_id to products
    try { await query("ALTER TABLE products ADD COLUMN category_id INT"); } catch (e) { }
    try { await query("ALTER TABLE products ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL"); } catch (e) { }
    try { await query("ALTER TABLE categories ADD COLUMN is_vip_only BOOLEAN DEFAULT FALSE"); } catch (e) { }
    try { await query("ALTER TABLE categories ADD COLUMN image TEXT NULL"); } catch (e) { }

    // --- NEW REVENUE ENGINE MIGRATIONS ---

    // 1. Leads Enhancements (Pitch & SEO Audit)
    try { await query("ALTER TABLE leads ADD COLUMN lighthouse_score VARCHAR(50)"); } catch (e) { }
    try { await query("ALTER TABLE leads ADD COLUMN personalized_pitch TEXT"); } catch (e) { }
    try { await query("ALTER TABLE leads ADD COLUMN website_url VARCHAR(255)"); } catch (e) { }

    // 3. Admin/Staff Username Login Support
    try { await query("ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE"); } catch (e) { }
    try { await query("ALTER TABLE employees ADD COLUMN username VARCHAR(50) UNIQUE"); } catch (e) { }

    // 2. Orders Enhancements (Progress Tracking)
    try { await query("ALTER TABLE orders ADD COLUMN progress_percent INT DEFAULT 0"); } catch (e) { }
    try { await query("ALTER TABLE orders ADD COLUMN report_link TEXT"); } catch (e) { }

    // 3. Market Intelligence Table
    await query(`
        CREATE TABLE IF NOT EXISTS market_intel (
            id INT AUTO_INCREMENT PRIMARY KEY,
            item_name VARCHAR(255) NOT NULL,
            platform VARCHAR(50), -- 'Z2U', 'G2G', etc.
            competitor_price DECIMAL(10,2),
            my_price DECIMAL(10,2),
            status VARCHAR(50), -- 'Competitive', 'Underpriced', 'Overpriced'
            last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // --- PERFORMANCE OPTIMIZATIONS: ADD INDEXES ---
    console.log("Adding performance indexes...");

    // Orders table indexes
    try { await query("CREATE INDEX idx_orders_userId ON orders(userId)"); } catch (e) { }
    try { await query("CREATE INDEX idx_orders_guestEmail ON orders(guestEmail)"); } catch (e) { }
    try { await query("CREATE INDEX idx_orders_status ON orders(status)"); } catch (e) { }
    try { await query("CREATE INDEX idx_orders_date ON orders(date)"); } catch (e) { }

    // Products table indexes
    try { await query("CREATE INDEX idx_products_platform ON products(platform)"); } catch (e) { }
    try { await query("CREATE INDEX idx_products_type ON products(type)"); } catch (e) { }
    try { await query("CREATE INDEX idx_products_stock ON products(stock)"); } catch (e) { }

    // Seller System Migrations
    try { await query("ALTER TABLE products ADD COLUMN user_id VARCHAR(50)"); } catch (e) { }
    try { await query("ALTER TABLE products ADD COLUMN status VARCHAR(50) DEFAULT 'active'"); } catch (e) { }
    try { await query("CREATE INDEX idx_products_user ON products(user_id)"); } catch (e) { }

    // Leads table indexes
    try { await query("CREATE INDEX idx_leads_status ON leads(status)"); } catch (e) { }
    try { await query("CREATE INDEX idx_leads_platform ON leads(platform)"); } catch (e) { }

    // Market Intel indexes
    try { await query("CREATE INDEX idx_market_platform ON market_intel(platform)"); } catch (e) { }
    try { await query("CREATE INDEX idx_market_status ON market_intel(status)"); } catch (e) { }

    // Users table indexes
    try { await query("CREATE INDEX idx_users_email ON users(email)"); } catch (e) { }
    try { await query("CREATE INDEX idx_users_role ON users(role)"); } catch (e) { }
    try { await query("CREATE INDEX idx_users_referral_code ON users(referral_code)"); } catch (e) { }

    // Inventory indexes for fast search
    try { await query("CREATE INDEX idx_inventory_email ON inventory(account_email)"); } catch (e) { }
    try { await query("CREATE INDEX idx_inventory_username ON inventory(account_username)"); } catch (e) { }
    try { await query("CREATE INDEX idx_inventory_platform ON inventory(platform)"); } catch (e) { }
    try { await query("CREATE INDEX idx_inventory_status ON inventory(status)"); } catch (e) { }

    // 18. Verification Requests
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

    // Migration: Update to LONGTEXT for Base64 Image Storage
    try { await query("ALTER TABLE verification_requests MODIFY COLUMN document_image LONGTEXT"); } catch (e) { }
    try { await query("ALTER TABLE verification_requests MODIFY COLUMN selfie_image LONGTEXT"); } catch (e) { }
    try { await query("ALTER TABLE verification_requests ADD COLUMN rejection_reason TEXT"); } catch (e) { }

    // 19. Official Documents Archive
    await query(`
        CREATE TABLE IF NOT EXISTS documents (
            id VARCHAR(50) PRIMARY KEY,
            type ENUM('invoice', 'contract', 'letter') NOT NULL,
            document_number VARCHAR(100) UNIQUE NOT NULL,
            recipient_name VARCHAR(255) NOT NULL,
            recipient_email VARCHAR(255),
            recipient_address TEXT,
            subject VARCHAR(255),
            content LONGTEXT, -- Stores body content or contract terms
            items JSON, -- Stores invoice line items
            amount DECIMAL(10, 2),
            currency VARCHAR(10) DEFAULT 'USD',
            status ENUM('draft', 'issued', 'void') DEFAULT 'issued',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_by VARCHAR(50) DEFAULT 'Admin'
        )
    `);

    // Index for quick document lookups
    try { await query("CREATE INDEX idx_docs_number ON documents(document_number)"); } catch (e) { }
    try { await query("CREATE INDEX idx_docs_recipient ON documents(recipient_name)"); } catch (e) { }

    // 20. PlayerUp Listings
    await query(`
        CREATE TABLE IF NOT EXISTS playerup_listings (
            id VARCHAR(50) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            url VARCHAR(255) UNIQUE NOT NULL,
            platform VARCHAR(50) DEFAULT 'Other',
            lastBumped TIMESTAMP NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            frequency VARCHAR(50) DEFAULT 'Every 24 hours',
            status VARCHAR(50) DEFAULT 'Inactive',
            username VARCHAR(100) DEFAULT 'officialum1'
        )
    `);

    // 21. Z2U Listings
    await query(`
        CREATE TABLE IF NOT EXISTS z2u_listings (
            id VARCHAR(50) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            url VARCHAR(255) UNIQUE NOT NULL,
            platform VARCHAR(50) DEFAULT 'Other',
            unit_price VARCHAR(50),
            stock VARCHAR(50),
            status VARCHAR(50) DEFAULT 'Active',
            lastSync TIMESTAMP NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    isInitialized = true;
}
