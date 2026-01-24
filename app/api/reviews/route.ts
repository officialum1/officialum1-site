import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { token, rating, comment } = body;

        if (!token || !rating) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        // Ensure table exists
        await query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                token VARCHAR(100),
                rating INT,
                comment TEXT,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Check if already reviewed?
        const existing: any = await query("SELECT * FROM reviews WHERE token = ?", [token]);
        if (existing.length > 0) {
            return NextResponse.json({ error: 'Already reviewed' }, { status: 400 });
        }

        await query(
            "INSERT INTO reviews (token, rating, comment) VALUES (?, ?, ?)",
            [token, rating, comment]
        );

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const reviews = await query("SELECT * FROM reviews ORDER BY date DESC");
        return NextResponse.json(reviews);
    } catch (e: any) {
        return NextResponse.json([]);
    }
}
