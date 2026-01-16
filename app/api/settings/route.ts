import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'settings.json');

export async function GET() {
    try {
        const content = await fs.readFile(SETTINGS_PATH, 'utf8');
        return NextResponse.json(JSON.parse(content));
    } catch {
        return NextResponse.json({});
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const dir = path.dirname(SETTINGS_PATH);
        try { await fs.access(dir); } catch { await fs.mkdir(dir, { recursive: true }); }

        // Merge with existing
        let current = {};
        try {
            const content = await fs.readFile(SETTINGS_PATH, 'utf8');
            current = JSON.parse(content);
        } catch { }

        const newSettings = { ...current, ...body };
        await fs.writeFile(SETTINGS_PATH, JSON.stringify(newSettings, null, 2));

        return NextResponse.json({ success: true, settings: newSettings });
    } catch (error) {
        return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
    }
}
