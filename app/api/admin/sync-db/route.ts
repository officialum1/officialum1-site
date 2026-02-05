import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';

export async function GET() {
    try {
        console.log("Forcing Database Initialization...");
        await initDB(true);
        return NextResponse.json({ success: true, message: "Database tables synchronized successfully." });
    } catch (e: any) {
        console.error("Sync DB Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
