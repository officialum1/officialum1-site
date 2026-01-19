import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const results: any = await query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);

        if (results.length > 0) {
            const user = results[0];
            return NextResponse.json({ success: true, user: { id: user.id, email: user.email, telegram: user.telegram } });
        } else {
            // BACKWARD COMPAT (Fallback to JSON if DB fails/empty but not likely needed if we start fresh)
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }
    } catch {
        return NextResponse.json({ error: "Auth Error" }, { status: 500 });
    }
}
