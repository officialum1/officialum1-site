import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const categories = await query("SELECT * FROM categories ORDER BY name ASC");
        return NextResponse.json(categories);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, name, slug, icon, discount_percent, sale_ends_at, id } = body;

        if (action === 'create') {
            await query(
                "INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)",
                [name, slug, icon || '📁']
            );
        } else if (action === 'update') {
            await query(
                "UPDATE categories SET name = ?, slug = ?, icon = ? WHERE id = ?",
                [name, slug, icon || '📁', id]
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
