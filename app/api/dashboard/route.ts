import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const email = searchParams.get('email');

        if (!userId && !email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let orders;
        if (userId) {
            orders = await query("SELECT * FROM orders WHERE userId = ? ORDER BY date DESC", [userId]);
        } else {
            orders = await query("SELECT * FROM orders WHERE guestEmail = ? ORDER BY date DESC", [email]);
        }

        const notifications = await query("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5", [userId || email]);

        let wallet = { balance: 0, affiliate_earnings: 0 };
        if (userId) {
            const userRows: any = await query("SELECT wallet_balance, total_affiliate_earnings FROM users WHERE id = ?", [userId]);
            if (userRows.length > 0) {
                wallet.balance = parseFloat(userRows[0].wallet_balance || 0);
                wallet.affiliate_earnings = parseFloat(userRows[0].total_affiliate_earnings || 0);
            }
        }

        let verification = { status: 'none' };
        if (userId) {
            const verifRows: any = await query("SELECT status FROM verification_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", [userId]);
            if (verifRows.length > 0) verification.status = verifRows[0].status;
        }

        return NextResponse.json({ orders, notifications, wallet, verification });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
