import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { email, productId } = await req.json();

        if (!email || !productId) {
            return NextResponse.json({ error: 'Email and Product ID required' }, { status: 400 });
        }

        // Ensure table exists (Lazy initialization)
        try {
            await query(`
                CREATE TABLE IF NOT EXISTS inventory_notifications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) NOT NULL,
                    product_id INT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    status VARCHAR(50) DEFAULT 'pending'
                )
            `);
        } catch (e) { console.error("Table creation failed (might exist):", e); }

        // Check if already subscribed
        const existing = await query("SELECT * FROM inventory_notifications WHERE email = ? AND product_id = ? AND status = 'pending'", [email, productId]);
        if (Array.isArray(existing) && existing.length > 0) {
            return NextResponse.json({ message: 'You are already subscribed to this alert!' });
        }

        await query("INSERT INTO inventory_notifications (email, product_id) VALUES (?, ?)", [email, productId]);

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
    }
}
