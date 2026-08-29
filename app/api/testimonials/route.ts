import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const isAdmin = searchParams.get('all') === 'true';

        let sql = "SELECT * FROM testimonials";
        if (!isAdmin) {
            sql += " WHERE approved = TRUE";
        }
        sql += " ORDER BY created_at DESC";

        const testimonials = await query(sql);
        return NextResponse.json(testimonials);
    } catch (e) {
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (body.action === 'approve') {
            await query("UPDATE testimonials SET approved = TRUE WHERE id = ?", [body.id]);
            return NextResponse.json({ success: true });
        } else if (body.action === 'delete') {
            await query("DELETE FROM testimonials WHERE id = ?", [body.id]);
            return NextResponse.json({ success: true });
        } else {
            // Create New
            const { name, role, review, rating, isAdmin, userId } = body;
            await query(
                "INSERT INTO testimonials (name, role, review, rating, approved, user_id) VALUES (?, ?, ?, ?, ?, ?)",
                [name, role || 'Buyer', review, rating || 5, isAdmin ? true : false, userId || null]
            );
            return NextResponse.json({ success: true });
        }
    } catch (e) {
        return NextResponse.json({ error: "Failed to handle review" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        await query("DELETE FROM testimonials WHERE id = ?", [id]);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
    }
}
