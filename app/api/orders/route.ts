
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const rows = await query("SELECT * FROM orders WHERE userId = ? ORDER BY date DESC", [userId]);
        return NextResponse.json(rows);
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}
