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

        return NextResponse.json({ orders, notifications });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
