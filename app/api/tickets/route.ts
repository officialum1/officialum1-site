import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const ticketsFile = path.join(process.cwd(), 'data', 'tickets.json');

// GET: Fetch tickets
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const isAdmin = searchParams.get('isAdmin');

    try {
        const data = await fs.readFile(ticketsFile, 'utf8');
        let tickets = JSON.parse(data);

        // Filter: Admin sees all, User sees only theirs
        if (!isAdmin && email) {
            tickets = tickets.filter((t: any) => t.email === email);
        }

        return NextResponse.json(tickets);
    } catch (e) {
        return NextResponse.json([], { status: 200 }); // Return empty if file missing
    }
}

// POST: Create ticket or Reply
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = await fs.readFile(ticketsFile, 'utf8');
        const tickets = JSON.parse(data);

        if (body.action === 'reply') {
            // Add reply
            const ticketIndex = tickets.findIndex((t: any) => t.id === body.ticketId);
            if (ticketIndex === -1) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

            tickets[ticketIndex].replies.push({
                sender: body.sender, // 'admin' or 'user'
                message: body.message,
                date: new Date().toISOString()
            });
            // If admin replies, status might stay open or change. If user replies, keep open.
            if (body.sender === 'user') tickets[ticketIndex].status = 'open';

        } else {
            // Create New Ticket
            const newTicket = {
                id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
                userId: body.userId || 'guest',
                email: body.email,
                subject: body.subject,
                message: body.message,
                status: 'open',
                date: new Date().toISOString(),
                replies: []
            };
            tickets.unshift(newTicket);
        }

        await fs.writeFile(ticketsFile, JSON.stringify(tickets, null, 2));
        return NextResponse.json({ success: true });

    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
