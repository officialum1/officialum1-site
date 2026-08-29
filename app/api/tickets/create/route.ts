import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendAuditReport } from '@/lib/email';
import { sendTelegramAdminAlert } from '@/lib/telegram';

export async function POST(req: Request) {
    try {
        const { userId, userEmail, orderId, issue, description } = await req.json();

        if (!userId || !orderId || !issue) {
            return NextResponse.json({ error: 'Missing Required Fields' }, { status: 400 });
        }

        const ticketId = `TKT_${Date.now()}`;

        // Create Ticket
        await query(
            "INSERT INTO tickets (id, userId, orderId, type, status, issue, description, created_at) VALUES (?, ?, ?, ?, 'open', ?, ?, NOW())",
            [ticketId, userId, orderId, 'Support', issue, description]
        );

        // Notify Admin via Telegram
        await sendTelegramAdminAlert(`🎫 <b>New Support Ticket</b>\nUser: ${userEmail}\nOrder: ${orderId}\nIssue: ${issue}\nDesc: ${description}`);

        // Notify Admin via Email (Optional, depending on Settings)
        // await sendAuditReport(...)

        return NextResponse.json({ success: true, ticketId });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
    }
}
