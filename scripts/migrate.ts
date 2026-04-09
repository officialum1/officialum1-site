
import { query } from '../lib/db';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

async function migrate() {
    console.log('Starting Migration...');

    try {
        // 1. Update Orders Table
        try {
            await query(`ALTER TABLE orders ADD COLUMN quantity INT DEFAULT 1`);
            console.log('Added quantity to orders');
        } catch (e: any) {
            if (!e.message.includes("Duplicate column")) console.error(e.message);
        }

        try {
            await query(`ALTER TABLE orders ADD COLUMN delivery_info TEXT`);
            console.log('Added delivery_info to orders');
        } catch (e: any) {
            if (!e.message.includes("Duplicate column")) console.error(e.message);
        }

        try {
            await query(`ALTER TABLE orders ADD COLUMN delivery_status VARCHAR(50) DEFAULT 'pending'`);
            console.log('Added delivery_status to orders');
        } catch (e: any) {
            if (!e.message.includes("Duplicate column")) console.error(e.message);
        }

        // 2. Create Tickets Table
        await query(`
            CREATE TABLE IF NOT EXISTS tickets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'open', -- 'open', 'closed', 'answered'
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Created tickets table');

        // 3. Create Ticket Replies Table
        await query(`
             CREATE TABLE IF NOT EXISTS ticket_replies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ticket_id INT NOT NULL,
                sender VARCHAR(50) NOT NULL, -- 'user' or 'admin'
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
            )
        `);
        console.log('Created ticket_replies table');

        console.log('Migration Complete!');
        process.exit(0);

    } catch (e) {
        console.error('Migration Failed:', e);
        process.exit(1);
    }
}

migrate();
