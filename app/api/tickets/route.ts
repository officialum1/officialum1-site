import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendTelegramAdminAlert } from '@/lib/telegram';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const isAdmin = searchParams.get('isAdmin') === 'true';

    try {
        let sql = "SELECT * FROM tickets";
        let params: any[] = [];

        if (!isAdmin && userId) {
            sql += " WHERE user_id = ?";
            params.push(userId);
        }

        sql += " ORDER BY created_at DESC";
        const tickets = await query(sql, params) as any[];

        // Fetch replies for each ticket
        for (let t of tickets) {
            t.replies = await query("SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC", [t.id]);
        }

        return NextResponse.json(tickets);
    } catch (e) {
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (body.action === 'reply') {
            await query(
                "INSERT INTO ticket_replies (ticket_id, sender, message) VALUES (?, ?, ?)",
                [body.ticketId, body.sender, body.message]
            );

            // Notification for Admin if User Replies
            if (body.sender === 'user') {
                await sendTelegramAdminAlert(`💬 <b>New Ticket Reply!</b>\nTicket ID: #${body.ticketId}\nMessage: ${body.message}`);
            }

            return NextResponse.json({ success: true });
        } else {
            // Create New Ticket
            const { userId, subject, message, attachment, email } = body;
            const res: any = await query(
                "INSERT INTO tickets (user_id, subject, message, attachment) VALUES (?, ?, ?, ?)",
                [userId, subject, message, attachment || null]
            );

            const newId = res.insertId;

            // Telegram Alert
            await sendTelegramAdminAlert(`🎫 <b>New Support Ticket!</b>\nFrom: ${email}\nSubject: ${subject}\nMessage: ${message}\nAttachment: ${attachment || 'None'}`);

            return NextResponse.json({ success: true, id: newId });
        }
    } catch (e) {
        return NextResponse.json({ error: "Failed to handle ticket" }, { status: 500 });
    }
}
