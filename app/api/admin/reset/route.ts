import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
    try {
        // Optional: Require a specific header or body pass for extra safety
        // For now, relies on the fact that this is an Admin Route

        await query('SET FOREIGN_KEY_CHECKS = 0');
        await query('TRUNCATE TABLE inventory');
        await query('TRUNCATE TABLE transactions');
        await query('TRUNCATE TABLE deliveries');
        await query('TRUNCATE TABLE social_posts');
        try { await query('TRUNCATE TABLE leads'); } catch (e) { }
        try { await query('TRUNCATE TABLE reviews'); } catch (e) { }
        await query('SET FOREIGN_KEY_CHECKS = 1');

        return NextResponse.json({ success: true, message: 'System Reset Complete' });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
