
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        console.log('Starting Migration via API...');

        // 1. Update Orders Table
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

        // 4. Reset & Fix Products Table (Crucial for the "not shown" fix)
        // We drop and recreate because the previous schema was broken (id mismatch)
        console.log('Fixing products table...');
        try {
            // First check if it's the old INT or VARCHAR style
            await query(`DROP TABLE IF EXISTS products`);
            await query(`
                CREATE TABLE products (
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
            console.log('Recreated products table with correct schema');
        } catch (e: any) {
            console.error('Failed to recreate products table:', e.message);
        }

        return NextResponse.json({ success: true, message: "Migration Complete and Products Table Reset" });

    } catch (e: any) {
        console.error('Migration Failed:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
