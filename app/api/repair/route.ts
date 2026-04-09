import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // Drop problematic tables to force re-creation with correct schema
        await query("DROP TABLE IF EXISTS transactions");
        await query("DROP TABLE IF EXISTS deliveries");

        // Re-Create Transactions
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

        // Re-Create Deliveries
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

        return NextResponse.json({ success: true, message: 'Tables Repaired' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
