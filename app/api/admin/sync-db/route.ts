import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        console.log("Forcing Database Initialization...");
        await initDB(true);
        return NextResponse.json({ success: true, message: "Database tables synchronized successfully." });
    } catch (e: any) {
        console.error("Sync DB Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
