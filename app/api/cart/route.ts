import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('id');

    if (!cartId) return NextResponse.json({ error: 'Cart ID required' }, { status: 400 });

    try {
        const items = await query(
            `SELECT ci.*, p.name, p.price, p.image, p.platform 
             FROM cart_items ci 
             JOIN products p ON ci.product_id = p.id 
             WHERE ci.cart_id = ?`,
            [cartId]
        );
        return NextResponse.json({ items });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { cartId, items, email } = body;

        if (!cartId) return NextResponse.json({ error: 'Cart ID required' }, { status: 400 });

        await query(
            `INSERT INTO carts (id, guest_email, status, last_activity) 
             VALUES (?, ?, 'active', NOW()) 
             ON DUPLICATE KEY UPDATE 
             guest_email = VALUES(guest_email), 
             last_activity = NOW()`,
            [cartId, email || null]
        );

        await query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);

        if (items && items.length > 0) {
            const placeholders = items.map(() => "(?, ?, ?)").join(', ');
            const values = items.flatMap((item: any) => [cartId, item.id, item.quantity || 1]);

            await query(
                `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ${placeholders}`,
                values
            );
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
