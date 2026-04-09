import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { userId, amount, method, details } = await req.json();

        // 1. Verify User Balance
        const userRows: any = await query("SELECT affiliate_balance FROM users WHERE id = ?", [userId]);
        if (userRows.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const currentBalance = parseFloat(userRows[0].affiliate_balance || '0');
        const reqAmount = parseFloat(amount);

        if (reqAmount < 10) return NextResponse.json({ error: "Minimum withdrawal is $10" }, { status: 400 });
        if (reqAmount > currentBalance) return NextResponse.json({ error: "Insufficient affiliate balance" }, { status: 400 });

        // 2. Deduct Balance
        await query("UPDATE users SET affiliate_balance = affiliate_balance - ? WHERE id = ?", [reqAmount, userId]);

        // 3. Create Payout Record
        await query(
            "INSERT INTO payouts (user_id, amount, method, details, status) VALUES (?, ?, ?, ?, 'pending')",
            [userId, reqAmount, method, details]
        );

        // 4. Notify Admin (Optional, usually via email or notification table)
        // await query("INSERT INTO notifications ...");

        return NextResponse.json({ success: true, message: "Withdrawal request submitted successfully!" });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
