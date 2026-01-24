import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        // Fetch all transactions
        const transactions: any = await query("SELECT * FROM transactions ORDER BY date DESC");
        return NextResponse.json(transactions);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Ensure 'currency' column exists (Migration)
        try {
            await query("ALTER TABLE transactions ADD COLUMN currency VARCHAR(10) DEFAULT 'USD'");
        } catch (e) {
            // Ignore if exists
        }

        if (body.action === 'add_funds') {
            const { platform, amount, currency, description, staffName } = body;

            const transactionId = `fund_${Date.now()}`;

            await query(
                "INSERT INTO transactions (id, type, platform, amount, description, processedBy, currency, date) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
                [transactionId, 'manual_adjustment', platform, amount, description || 'Manual Adjustment', staffName || 'Admin', currency]
            );

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
