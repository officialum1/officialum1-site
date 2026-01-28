import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('productId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 5;
        const offset = (page - 1) * limit;

        if (!productId) return NextResponse.json([]);

        // Get reviews (Assuming user table join for email masking)
        const reviews = await query(`
            SELECT r.*, u.email as user_email 
            FROM reviews r 
            LEFT JOIN users u ON r.user_id = u.id 
            WHERE r.product_id = ? AND r.status = 'approved' 
            ORDER BY r.created_at DESC 
            LIMIT ? OFFSET ?
        `, [productId, limit, offset]);

        return NextResponse.json(reviews);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId, productId, rating, comment } = await req.json();

        if (!userId || !productId || !rating) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Verify purchase (Optional: Only allow if they bought it)
        // const hasBought = await query("SELECT id FROM orders WHERE userId = ? AND productId = ?", [userId, productId]);
        // if (!hasBought.length) return NextResponse.json({ error: "You must buy this item first!" }, { status: 403 });

        await query(
            "INSERT INTO reviews (product_id, user_id, rating, comment, status, created_at) VALUES (?, ?, ?, ?, 'approved', NOW())",
            [productId, userId, rating, comment]
        );
        // Note: Default status 'approved' for MVP. In prod, set to 'pending'.

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
