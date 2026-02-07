import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

// ADMIN ONLY: Tool to fix the Z2U balance
export async function GET(request: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // 1. Wipe old Z2U
        await query("DELETE FROM transactions WHERE platform = 'Z2U'");

        // 2. Insert Correct $97 Record
        await query(
            "INSERT INTO transactions (id, type, platform, amount, description, processedBy, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                'trans_fix_z2u_97',
                'sale',
                'Z2U',
                97.00,
                'Historical Z2U Sales Correction',
                'Admin',
                '2026-02-01 12:00:00'
            ]
        );

        return NextResponse.json({ success: true, message: 'Z2U Balance Reset to $97' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
