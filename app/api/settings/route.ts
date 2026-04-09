import { NextResponse } from 'next/server';
import { query, initDB } from '@/lib/db';

export async function GET() {
    try {
        // Ensure DB is ready (Lazy Init)
        await initDB();

        const rows = await query("SELECT setting_key, setting_value FROM settings") as any[];
        const settings: any = {};
        rows.forEach((row: any) => {
            try {
                settings[row.setting_key] = JSON.parse(row.setting_value);
            } catch {
                settings[row.setting_key] = row.setting_value;
            }
        });
        return NextResponse.json(settings);
    } catch (e) {
        console.error("Settings GET Error:", e);
        return NextResponse.json({});
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Upsert settings one by one
        for (const [key, value] of Object.entries(body)) {
            const strValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
            // MySQL Upsert
            await query(`
                INSERT INTO settings (setting_key, setting_value) 
                VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE setting_value = ?
            `, [key, strValue, strValue]);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Settings POST Error:", error);
        return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
    }
}
