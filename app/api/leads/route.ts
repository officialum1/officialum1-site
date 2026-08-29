import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

function cleanString(value: unknown) {
    return String(value || '').trim();
}

function parseBudget(value: unknown) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function buildGuestPostingNotes(body: any) {
    const lines = [
        'Guest Posting Quote Request',
        `Package: ${cleanString(body.packageName) || 'Not selected'}`,
        `Domain: ${cleanString(body.domain) || 'Not provided'}`,
        `Niche: ${cleanString(body.niche) || 'Not provided'}`,
        `Target URL: ${cleanString(body.targetUrl) || 'Not provided'}`,
        `Anchor Text: ${cleanString(body.anchorText) || 'Not provided'}`,
        `Placements: ${cleanString(body.placements) || 'Not provided'}`,
        `Timeline: ${cleanString(body.timeline) || 'Not provided'}`,
        `Message: ${cleanString(body.message) || 'No extra requirements'}`,
        'Compliance note: publisher link attributes and editorial rules depend on each publisher policy.',
    ];

    return lines.join('\n');
}

export async function GET() {
    try {
        try {
            const leads = await query("SELECT * FROM leads ORDER BY createdAt DESC");
            return NextResponse.json(leads);
        } catch (createdAtError: any) {
            if (createdAtError?.code !== 'ER_BAD_FIELD_ERROR') throw createdAtError;
            const leads = await query("SELECT * FROM leads ORDER BY date DESC");
            return NextResponse.json(leads);
        }
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (body.action === 'guest_post_quote') {
            const email = cleanString(body.email);
            const domain = cleanString(body.domain);
            const clientName = cleanString(body.name) || domain || email;

            if (!clientName) {
                return NextResponse.json({ error: 'Name or domain is required.' }, { status: 400 });
            }

            if (!email || !email.includes('@')) {
                return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
            }

            if (!domain) {
                return NextResponse.json({ error: 'Website or domain is required.' }, { status: 400 });
            }

            const id = `gp_${Date.now()}`;
            const budget = parseBudget(body.budget);
            const notes = buildGuestPostingNotes(body);

            await query(
                "INSERT INTO leads (id, clientName, platform, budget, status, notes, buyerEmail) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [id, clientName, 'Guest Posting', budget, 'New', notes, email]
            );

            return NextResponse.json({
                success: true,
                id,
                clientName,
                platform: 'Guest Posting',
                budget,
                status: 'New',
            });
        }

        if (body.action === 'add') {
            const newLead = {
                id: `lead_${Date.now()}`,
                clientName: body.clientName,
                platform: body.platform,
                budget: Number(body.budget),
                status: 'New',
                notes: body.notes || '',
                buyerEmail: body.buyerEmail || null
            };

            await query(
                "INSERT INTO leads (id, clientName, platform, budget, status, notes, buyerEmail) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [newLead.id, newLead.clientName, newLead.platform, newLead.budget, newLead.status, newLead.notes, newLead.buyerEmail]
            );
            return NextResponse.json(newLead);
        }

        if (body.action === 'update_status') {
            await query("UPDATE leads SET status = ?, notes = ?, budget = ?, document_link = ? WHERE id = ?",
                [body.status, body.notes, body.budget, body.document_link, body.id]);
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

        if (body.action === 'capture') {
            const { email, productName, productId, amount } = body;
            const id = `cart_${Date.now()}`;
            // Avoid duplicates for same email+product in short window
            let existing: any[] = [];
            try {
                existing = await query("SELECT id FROM leads WHERE clientName = ? AND status = 'Abandoned' AND notes LIKE ? AND createdAt > DATE_SUB(NOW(), INTERVAL 1 HOUR)", [email, `%${productName}%`]) as any[];
            } catch (createdAtError: any) {
                if (createdAtError?.code !== 'ER_BAD_FIELD_ERROR') throw createdAtError;
                existing = await query("SELECT id FROM leads WHERE clientName = ? AND status = 'Abandoned' AND notes LIKE ? AND date > DATE_SUB(NOW(), INTERVAL 1 HOUR)", [email, `%${productName}%`]) as any[];
            }

            if (existing.length === 0) {
                await query(
                    "INSERT INTO leads (id, clientName, platform, budget, status, notes) VALUES (?, ?, ?, ?, ?, ?)",
                    [id, email, 'Abandoned Cart', parseFloat(amount) || 0, 'Abandoned', `Interested in ${productName} (${productId})`]
                );
            }
            return NextResponse.json({ success: true });
        }

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
