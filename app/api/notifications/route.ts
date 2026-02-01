import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

        const notifications = await query("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20", [userId]);
        return NextResponse.json(notifications);
    } catch (e: any) {
        // Return empty list if table missing or error
        return NextResponse.json([]);
    }
}

export async function POST(req: Request) {
    try {
        const { userId, notificationId, action } = await req.json();

        if (action === 'markRead') {
            await query("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", [notificationId, userId]);
            return NextResponse.json({ success: true });
        }

        if (action === 'markAllRead') {
            await query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [userId]);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
