import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const leads = await query("SELECT * FROM leads ORDER BY date DESC");
        return NextResponse.json(leads);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (body.action === 'add') {
            const newLead = {
                id: `lead_${Date.now()}`,
                clientName: body.clientName,
                platform: body.platform,
                budget: Number(body.budget),
                status: 'New',
                notes: body.notes || ''
            };

            await query(
                "INSERT INTO leads (id, clientName, platform, budget, status, notes) VALUES (?, ?, ?, ?, ?, ?)",
                [newLead.id, newLead.clientName, newLead.platform, newLead.budget, newLead.status, newLead.notes]
            );
            return NextResponse.json(newLead);
        }

        if (body.action === 'update_status') {
            await query("UPDATE leads SET status = ? WHERE id = ?", [body.status, body.id]);
            return NextResponse.json({ success: true });
        }

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
