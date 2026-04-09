import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        // Check if bonus table exists, if not create
        await query(`CREATE TABLE IF NOT EXISTS daily_bonus (user_id VARCHAR(50) PRIMARY KEY, last_claim TIMESTAMP)`);

        const rows = await query("SELECT last_claim FROM daily_bonus WHERE user_id = ?", [userId]) as any[];
        if (rows.length > 0) {
            return NextResponse.json({ lastClaim: rows[0].last_claim });
        }
        return NextResponse.json({ lastClaim: null });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        // Fetch bonus amount from settings (default 0.05)
        let bonusAmount = 0.05;
        const settingsRes: any = await query("SELECT setting_value FROM settings WHERE setting_key = 'daily_bonus_amount'");
        if (settingsRes.length > 0 && settingsRes[0].setting_value) {
            bonusAmount = parseFloat(settingsRes[0].setting_value);
        }

        // Verify 24h
        const rows = await query("SELECT last_claim FROM daily_bonus WHERE user_id = ?", [userId]) as any[];
        if (rows.length > 0) {
            const last = new Date(rows[0].last_claim).getTime();
            if (Date.now() - last < 86400000) {
                return NextResponse.json({ error: "Already claimed today!" }, { status: 400 });
            }
            await query("UPDATE daily_bonus SET last_claim = NOW() WHERE user_id = ?", [userId]);
        } else {
            await query("INSERT INTO daily_bonus (user_id, last_claim) VALUES (?, NOW())", [userId]);
        }

        // Add Balance
        await query("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?", [bonusAmount, userId]);
        await query("INSERT INTO wallet_transactions (user_id, amount, type, description, status) VALUES (?, ?, 'deposit', 'Daily Login Bonus', 'completed')",
            [userId, bonusAmount]);

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
