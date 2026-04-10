import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        // Ensure table exists
        await query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                slug VARCHAR(100) NOT NULL UNIQUE,
                icon VARCHAR(50),
                image TEXT NULL,
                discount_percent DECIMAL(5,2) DEFAULT 0.00,
                sale_ends_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        const categories = await query("SELECT * FROM categories ORDER BY name ASC");
        return NextResponse.json(categories);
    } catch (e: any) {
        console.error("Categories GET Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const body = await req.json();
        const { action, name, slug, icon, image, discount_percent, sale_ends_at, id } = body;

        if (action === 'create') {
            await query(
                "INSERT INTO categories (name, slug, icon, image) VALUES (?, ?, ?, ?)",
                [name, slug, icon || '📁', image || null]
            );
        } else if (action === 'update') {
            await query(
                "UPDATE categories SET name = ?, slug = ?, icon = ?, image = ? WHERE id = ?",
                [name, slug, icon || '📁', image || null, id]
            );
        } else if (action === 'delete') {
            await query("DELETE FROM categories WHERE id = ?", [id]);
        } else if (action === 'set_discount') {
            await query(
                "UPDATE categories SET discount_percent = ?, sale_ends_at = ? WHERE id = ?",
                [discount_percent || 0, sale_ends_at || null, id]
            );
        } else if (action === 'clear_all_discounts') {
            await query("UPDATE categories SET discount_percent = 0, sale_ends_at = NULL");
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
