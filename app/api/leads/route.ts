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
            await query("UPDATE leads SET status = ?, notes = ? WHERE id = ?", [body.status, body.notes, body.id]);
            return NextResponse.json({ success: true });
        }

        if (body.action === 'generate_pitch') {
            const results = await query("SELECT * FROM leads WHERE id = ?", [body.id]) as any[];
            const lead = results[0];
            const pitch = `Hello ${lead.clientName || 'Team'},\n\nI noticed your work on ${lead.platform} and I believe OfficialUM1 can help scale your presence. Given your current stage, our custom development and SEO optimization would provide a significant edge. Would you be open to a quick chat about our specialized ${lead.platform} packages?\n\nBest,\nOfficialUM1 Team`;

            await query("UPDATE leads SET personalized_pitch = ? WHERE id = ?", [pitch, body.id]);
            return NextResponse.json({ pitch });
        }

        if (body.action === 'run_audit') {
            const score = Math.floor(Math.random() * 40) + 50; // Mock Lighthouse Score
            await query("UPDATE leads SET lighthouse_score = ? WHERE id = ?", [score.toString(), body.id]);
            return NextResponse.json({ score });
        }

        if (body.action === 'delete') {
            await query("DELETE FROM leads WHERE id = ?", [body.id]);
            return NextResponse.json({ success: true });
        }

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
