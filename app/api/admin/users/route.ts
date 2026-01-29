import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const users = await query(`
            SELECT 
                u.id, 
                u.email, 
                u.telegram, 
                u.role, 
                u.wallet_balance, 
                u.referral_code, 
                u.created_at, 
                u.is_banned, 
                u.is_verified,
                (SELECT COUNT(*) FROM users ref WHERE ref.referred_by = u.referral_code) as referral_count
            FROM users u 
            ORDER BY u.created_at DESC
        `);
        return NextResponse.json(users);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId, action, amount } = await req.json();

        if (action === 'ban') {
            await query("UPDATE users SET is_banned = 1 WHERE id = ?", [userId]);
        } else if (action === 'unban') {
            await query("UPDATE users SET is_banned = 0 WHERE id = ?", [userId]);
        } else if (action === 'add_balance') {
            await query("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?", [amount, userId]);
            await query("INSERT INTO wallet_transactions (user_id, amount, type, description, status) VALUES (?, ?, 'deposit', 'Admin Adjustment', 'completed')",
                [userId, amount]);
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
