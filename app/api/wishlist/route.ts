import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    try {
        const items = await query(
            `SELECT w.*, p.name, p.price, p.image, p.platform, p.description, p.sale_price, p.sale_ends_at 
             FROM wishlists w
             JOIN products p ON w.product_id = p.id 
             WHERE w.user_id = ?`,
            [userId]
        );
        return NextResponse.json(items);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, productId, action } = body;

        if (!userId || !productId) return NextResponse.json({ error: 'Missing Required Fields' }, { status: 400 });

        if (action === 'add') {
            await query("INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)", [userId, productId]);
        } else if (action === 'remove') {
            await query("DELETE FROM wishlists WHERE user_id = ? AND product_id = ?", [userId, productId]);
        } else if (action === 'sync') {
            // Bulk add logic if needed, but for now single items are fine
            // If syncing from local to DB:
            const { items } = body;
            if (Array.isArray(items)) {
                for (const item of items) {
                    await query("INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)", [userId, item.id]);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
