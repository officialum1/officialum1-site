import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const coupons = await query("SELECT * FROM coupons ORDER BY created_at DESC");
        return NextResponse.json(coupons);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const body = await req.json();
        const { action, id, code, type, value, min_amount, expiry, status } = body;

        if (action === 'create') {
            await query(
                "INSERT INTO coupons (code, type, value, min_amount, expiry, status) VALUES (?, ?, ?, ?, ?, ?)",
                [code.toUpperCase(), type, value, min_amount || 0, expiry || null, status || 'active']
            );
        } else if (action === 'update') {
            await query(
                "UPDATE coupons SET code = ?, type = ?, value = ?, min_amount = ?, expiry = ?, status = ? WHERE id = ?",
                [code.toUpperCase(), type, value, min_amount, expiry, status, id]
            );
        } else if (action === 'delete') {
            await query("DELETE FROM coupons WHERE id = ?", [id]);
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
