import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const rows = await query("SELECT * FROM builder_requests ORDER BY created_at DESC");
        return NextResponse.json(rows);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id, status } = await request.json();
        await query("UPDATE builder_requests SET status = ? WHERE id = ?", [status, id]);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
