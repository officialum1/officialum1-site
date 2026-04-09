import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { userId, email, telegram, password } = await req.json();

        if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

        const updates = [];
        const values = [];

        if (email) {
            updates.push("email = ?");
            values.push(email);
        }
        if (telegram) {
            updates.push("telegram = ?");
            values.push(telegram);
        }
        if (password) {
            updates.push("password = ?"); // In a real app, hash this!
            values.push(password);
        }

        if (updates.length > 0) {
            values.push(userId);
            await query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);
        }

        // Return updated user data (mocking the update for localstorage)
        const updatedUserRows: any = await query("SELECT id, email, telegram, role, wallet_balance, affiliate_balance, referral_code, is_verified, two_factor_enabled FROM users WHERE id = ?", [userId]);

        return NextResponse.json({ success: true, user: updatedUserRows[0] });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
