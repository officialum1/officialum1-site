import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET(req: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        const history = await query("SELECT * FROM kb_history WHERE kb_id = ? ORDER BY created_at DESC", [id]);
        return NextResponse.json({ history });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
