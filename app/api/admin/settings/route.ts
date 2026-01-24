import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const settingsFile = path.join(process.cwd(), 'data', 'settings.json');

function getSettings() {
    if (!fs.existsSync(settingsFile)) return {};
    return JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
}

function saveSettings(data: any) {
    fs.writeFileSync(settingsFile, JSON.stringify(data, null, 2));
}

export async function GET(request: Request) {
    // SECURITY: In a real app, ensure only Admin can call this.
    // For now, we rely on the Admin Dashboard context.
    return NextResponse.json(getSettings());
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const current = getSettings();
        const updated = { ...current, ...body };
        saveSettings(updated);
        return NextResponse.json({ success: true, settings: updated });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
