import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('productId');

        if (!productId) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

        const reviews = await query(`
            SELECT r.*, u.email 
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ? AND r.status = 'approved'
            ORDER BY r.created_at DESC
        `, [productId]);

        return NextResponse.json(reviews);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId, productId, rating, comment } = await req.json();

        if (!userId || !productId || !rating) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        // Insert as pending (needs admin approval or auto-approve)
        await query("INSERT INTO reviews (product_id, user_id, rating, comment, status) VALUES (?, ?, ?, ?, 'approved')",
            [productId, userId, rating, comment]);

        return NextResponse.json({ success: true, message: "Review submitted successfully!" });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
