import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Fetch Wallet Balance & History
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

        // Fetch Balance
        const userRows: any = await query("SELECT wallet_balance, referral_code, referred_by FROM users WHERE id = ?", [userId]);
        if (userRows.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const user = userRows[0];

        // Fetch Transactions
        const transactions = await query("SELECT * FROM transactions WHERE userId = ? ORDER BY created_at DESC LIMIT 50", [userId]);

        return NextResponse.json({
            balance: user.wallet_balance,
            referralCode: user.referral_code,
            transactions
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST: Add Funds (Deposit)
export async function POST(req: Request) {
    try {
        const { userId, amount, source } = await req.json(); // source = 'stripe' | 'crypto' | 'admin'

        // Validation logic for "real" payments should ideally be here (verifying Stripe session etc.)
        // For MVP/Demo, we assume this endpoint is called AFTER successful payment verification in checkout/process 
        // OR simply for testing 'Admin' credits.

        // Update Balance
        await query("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?", [amount, userId]);

        // Log Transaction
        await query("INSERT INTO transactions (userId, type, amount, description) VALUES (?, 'deposit', ?, ?)", [userId, amount, `Deposit via ${source}`]);

        return NextResponse.json({ success: true, message: "Funds Added" });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
