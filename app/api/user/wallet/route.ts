import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Fetch Wallet Balance & History
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

        // Fetch Balance and Referral Info
        const userRows: any = await query("SELECT wallet_balance, referral_code, affiliate_balance, total_affiliate_earnings FROM users WHERE id = ?", [userId]);
        if (userRows.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const user = userRows[0];

        // Fetch Wallet Transactions
        const transactions = await query("SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50", [userId]);

        return NextResponse.json({
            balance: user.wallet_balance,
            affiliateBalance: user.affiliate_balance,
            totalAffiliate: user.total_affiliate_earnings,
            referralCode: user.referral_code,
            transactions
        });

    } catch (e: any) {
        console.error("Wallet Fetch Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST: Add Funds (Deposit)
export async function POST(req: Request) {
    try {
        const { userId, amount, source } = await req.json(); // source = 'stripe' | 'crypto' | 'admin'

        // Update Balance
        await query("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?", [amount, userId]);

        // Log Transaction using wallet_transactions table
        await query("INSERT INTO wallet_transactions (user_id, type, amount, description, status) VALUES (?, 'deposit', ?, ?, 'completed')",
            [userId, amount, `Deposit via ${source}`]);

        return NextResponse.json({ success: true, message: "Funds Added" });

    } catch (e: any) {
        console.error("Wallet Deposit Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
