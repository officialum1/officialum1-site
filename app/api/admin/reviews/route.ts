import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Fetch all reviews (with product info)
export async function GET() {
    try {
        const sql = `
            SELECT r.*, p.name as product_name, u.email as user_email 
            FROM reviews r
            LEFT JOIN products p ON r.product_id = p.id
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
        `;
        const reviews = await query(sql);
        return NextResponse.json(reviews);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST: Moderate Action (Approve, Reject, Delete)
export async function POST(req: Request) {
    try {
        const { reviewId, action } = await req.json();

        if (action === 'approve') {
            await query("UPDATE reviews SET status = 'approved' WHERE id = ?", [reviewId]);
        } else if (action === 'reject') {
            await query("UPDATE reviews SET status = 'rejected' WHERE id = ?", [reviewId]);
        } else if (action === 'delete') {
            await query("DELETE FROM reviews WHERE id = ?", [reviewId]);
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
