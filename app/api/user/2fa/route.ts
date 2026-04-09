import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { userId, enabled } = await req.json();

        if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

        await query("UPDATE users SET two_factor_enabled = ? WHERE id = ?", [enabled ? 1 : 0, userId]);

        return NextResponse.json({
            success: true,
            message: enabled ? "2FA Enabled Successfully!" : "2FA Disabled"
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
