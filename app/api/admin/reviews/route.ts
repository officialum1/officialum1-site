import { NextResponse } from 'next/server';
import { query, initDB } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET(req: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await initDB();

    try {
        const reviews = await query(`
            SELECT r.*, u.email, p.name as product_name
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN products p ON r.product_id = p.id
            ORDER BY r.created_at DESC
        `);

        return NextResponse.json(reviews);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await initDB();

    try {
        const { action, id, userId, productId, rating, comment, status } = await req.json();

        if (action === 'delete') {
            await query("DELETE FROM reviews WHERE id = ?", [id]);
            return NextResponse.json({ success: true });
        }

        if (action === 'update_status') {
            await query("UPDATE reviews SET status = ? WHERE id = ?", [status, id]);
            return NextResponse.json({ success: true });
        }

        // Add Manual Review
        if (!productId || !rating || !comment) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const finalUserId = userId || `admin_gen_${Math.random().toString(36).substring(7)}`;

        await query(
            "INSERT INTO reviews (product_id, user_id, rating, comment, status) VALUES (?, ?, ?, ?, 'approved')",
            [productId, finalUserId, rating, comment]
        );

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
