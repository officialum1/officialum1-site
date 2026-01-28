
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        console.log('Starting Migration via API...');

        // 1. Users Table (Migration from JSON)
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                telegram VARCHAR(100),
                wallet_balance DECIMAL(10,2) DEFAULT 0.00,
                referral_code VARCHAR(50) UNIQUE,
                referred_by VARCHAR(50),
                reset_token VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table ready');

        // 2. Update Orders Table
        try {
            await query(`ALTER TABLE orders ADD COLUMN quantity INT DEFAULT 1`);
            console.log('Added quantity to orders');
        } catch (e: any) {
            console.log('quantity column skipped: ' + e.message);
        }

        try {
            await query(`ALTER TABLE orders ADD COLUMN delivery_info TEXT`);
            console.log('Added delivery_info to orders');
        } catch (e: any) {
            console.log('delivery_info column skipped: ' + e.message);
        }

        try {
            await query(`ALTER TABLE orders ADD COLUMN delivery_status VARCHAR(50) DEFAULT 'pending'`);
            console.log('Added delivery_status to orders');
        } catch (e: any) {
            console.log('delivery_status column skipped: ' + e.message);
        }

        // 2. Create Tickets Table
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
        console.log('Created tickets table');

        // 3. Create Ticket Replies Table
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
        console.log('Created ticket_replies table');

        // 4. Products Table (Safe Creation)
        console.log('Checking products table...');
        try {
            await query(`
                CREATE TABLE IF NOT EXISTS products (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    platform VARCHAR(100),
                    type VARCHAR(50), 
                    price VARCHAR(50),
                    description TEXT,
                    creds TEXT,
                    image TEXT,
                    stock INT DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('Products table checked/created');
        } catch (e: any) {
            console.error('Failed to create products table:', e.message);
        }

        // 5. Create Testimonials (Reviews) Table
        console.log('Setting up testimonials table...');
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
        console.log('Testimonials table ready');

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
        console.log('Blogs table ready');

        // 7. Wallet & Affiliate System
        try {
            await query("ALTER TABLE users ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 0.00");
            console.log('Added wallet_balance to users');
        } catch (e) { }
        try {
            await query("ALTER TABLE users ADD COLUMN referral_code VARCHAR(50) UNIQUE");
            console.log('Added referral_code to users');
        } catch (e) { }
        try {
            await query("ALTER TABLE users ADD COLUMN referred_by VARCHAR(50)");
            console.log('Added referred_by to users');
        } catch (e) { }

        try {
            await query("ALTER TABLE users ADD COLUMN verification_token VARCHAR(100)");
            console.log('Added verification_token to users');
        } catch (e) { }
        try {
            await query("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE");
            console.log('Added is_verified to users');
        } catch (e) { }

        await query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId VARCHAR(50) NOT NULL,
                type VARCHAR(50), -- deposit, purchase, refund, referral_bonus
                amount DECIMAL(10,2) NOT NULL,
                description VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Transactions table ready');

        // 8. Notifications Table
        await query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId VARCHAR(50) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'info', -- info, success, warning, alert
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Notifications table ready');

        // 9. Client Projects Table (Service Tracker)
        await query(`
            CREATE TABLE IF NOT EXISTS client_projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'Pending', -- Pending, In Progress, Review, Completed
                progress INT DEFAULT 0,
                updates TEXT, -- JSON array of updates: [{date, message}, ...]
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Client Projects table ready');

        // 6. Seed Initial Reviews (If empty)
        try {
            const reviews: any = await query("SELECT COUNT(*) as count FROM testimonials");
            if (reviews[0].count === 0) {
                console.log('Seeding initial reviews...');
                await query(`
                    INSERT INTO testimonials (name, role, review, rating, approved) VALUES 
                    ('Alex Morgan', 'Buyer - Instagram Followers', 'Incredible service! Delivered 10k followers in under an hour. Highly recommended.', 5, TRUE),
                    ('Sarah Jenkins', 'Buyer - Reddit Account', 'The account was high quality and aged properly. Will buy again.', 5, TRUE),
                    ('Michael Chen', 'Client - Web Design', 'OfficialUM1 built a stunning portfolio for me. The design is top notch.', 5, TRUE)
                `);
            }
        } catch (e) {
            console.log('Seeding skipped');
        }

        return NextResponse.json({ success: true, message: "Migration Complete and Tables Reset" });

    } catch (e: any) {
        console.error('Migration Failed:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
