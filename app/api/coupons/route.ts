import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const codeQuery = searchParams.get('code');

        if (!codeQuery) return NextResponse.json({ error: "Code required" }, { status: 400 });

        const rows: any = await query("SELECT * FROM coupons WHERE code = ? AND status = 'active'", [codeQuery]);
        if (rows.length === 0) return NextResponse.json({ error: "Invalid or expired coupon" }, { status: 404 });

        const coupon = rows[0];

        // Check Expiry
        if (coupon.expiry && new Date(coupon.expiry) < new Date()) {
            return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            type: coupon.type,
            value: Number(coupon.value)
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
