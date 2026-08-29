import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { token } = await req.json();

        if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

        // Verify Token
        const users: any = await query("SELECT id, email FROM users WHERE verification_token = ?", [token]);

        if (users.length === 0) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        const user = users[0];

        // Update User
        await query("UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = ?", [user.id]);

        return NextResponse.json({ success: true, message: "Email Verified Successfully" });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
