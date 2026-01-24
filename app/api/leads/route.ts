import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const leadsFile = path.join(process.cwd(), 'data', 'leads.json');

function getLeads() {
    if (!fs.existsSync(leadsFile)) return [];
    return JSON.parse(fs.readFileSync(leadsFile, 'utf8'));
}

function saveLeads(data: any[]) {
    fs.writeFileSync(leadsFile, JSON.stringify(data, null, 2));
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const email = searchParams.get('email');

    const leads = getLeads();

    if (role === 'staff' && email) {
        // Staff see only their leads? Or all leads? 
        // Usually CRM allows seeing entire pool or just own. 
        // Let's filter by 'assignedTo' matches name OR 'createdBy' matches email.
        // For MVP, allow staff to see ALL leads for collaboration, or filter.
        // Let's return ALL for now to maximize utility, or maybe filter by status.
        return NextResponse.json(leads);
    }

    return NextResponse.json(leads);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // action: 'create', 'update_status'
        const leads = getLeads();

        if (body.action === 'create') {
            const newLead = {
                id: `lead_${Date.now()}`,
                name: body.name,
                contact: body.contact, // Discord/Email
                source: body.source, // Z2U, Direct, etc
                status: 'New', // New, Contacted, In Progress, Closed
                notes: body.notes || '',
                value: body.value || 0,
                createdBy: body.staffName,
                createdAt: new Date().toISOString()
            };
            leads.push(newLead);
            saveLeads(leads);
            return NextResponse.json({ success: true, lead: newLead });
        }

        if (body.action === 'update_status') {
            const index = leads.findIndex((l: any) => l.id === body.id);
            if (index > -1) {
                leads[index].status = body.status;
                if (body.notes) leads[index].notes = body.notes;
                saveLeads(leads);
                return NextResponse.json({ success: true, lead: leads[index] });
            }
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e) {
        return NextResponse.json({ error: 'Error processing request' }, { status: 500 });
    }
}
