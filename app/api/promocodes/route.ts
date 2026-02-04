import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const codeQuery = searchParams.get('code');

        if (codeQuery) {
            const rows: any = await query("SELECT * FROM coupons WHERE code = ?", [codeQuery]);
            if (rows.length > 0) {
                const r = rows[0];
                // Check Expiration
                if (r.expiry && new Date(r.expiry) < new Date()) {
                    return NextResponse.json({ success: false, error: 'Promo Code Expired' });
                }
                return NextResponse.json({ success: true, discount: r.value });
            }
            return NextResponse.json({ success: false, error: 'Invalid Code' });
        }

        const rows: any = await query("SELECT * FROM coupons ORDER BY created_at DESC");
        const formatted = rows.map((r: any) => ({
            id: r.id,
            code: r.code,
            discount: Number(r.value),
            expiresAt: r.expiry,
            createdAt: r.created_at
        }));
        return NextResponse.json(formatted);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const exist: any = await query("SELECT id FROM coupons WHERE code = ?", [body.code]);
        if (exist.length > 0) {
            return NextResponse.json({ error: 'Code already exists' }, { status: 400 });
        }

        await query(
            "INSERT INTO coupons (code, type, value, expiry, status) VALUES (?, 'percent', ?, ?, 'active')",
            [body.code, body.discount, body.expiresAt ? new Date(body.expiresAt) : null]
        );

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        await query("DELETE FROM coupons WHERE id = ?", [id]);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
