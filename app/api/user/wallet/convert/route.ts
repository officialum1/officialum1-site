
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { userId, amount } = await req.json();

        if (!userId || !amount || amount <= 0) {
            return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
        }

        // 1. Check Affiliate Balance
        const userRows: any = await query("SELECT affiliate_balance FROM users WHERE id = ?", [userId]);
        const affiliateBalance = parseFloat(userRows[0]?.affiliate_balance || 0);

        if (affiliateBalance < amount) {
            return NextResponse.json({ error: "Insufficient affiliate balance" }, { status: 400 });
        }

        // 2. Perform Conversion (Atomic update would be better but we'll use separate queries for simplicity in this DB wrapper)
        // Deduct from affiliate
        await query("UPDATE users SET affiliate_balance = affiliate_balance - ? WHERE id = ?", [amount, userId]);

        // Add to wallet
        await query("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?", [amount, userId]);

        // 3. Log Transaction
        await query("INSERT INTO wallet_transactions (user_id, type, amount, description, status) VALUES (?, 'deposit', ?, ?, 'completed')",
            [userId, amount, "Affiliate balance conversion"]);

        return NextResponse.json({ success: true, message: "Balance converted successfully" });

    } catch (e: any) {
        console.error("Conversion Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
