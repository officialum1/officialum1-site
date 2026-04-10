import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        // 1. Verify User Exists
        const users: any = await query("SELECT id FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return NextResponse.json({ error: "Email not found" }, { status: 404 });
        }

        // 2. Generate Reset Token (Simple random string)
        const resetToken = crypto.randomBytes(4).toString('hex').toUpperCase();

        // 3. Save Token to DB
        await query("UPDATE users SET reset_token = ? WHERE email = ?", [resetToken, email]);

        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://officialum1.com';
        const link = `${origin}/reset-password?token=${resetToken}`;
        await sendPasswordResetEmail(email, link);

        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error("Forgot Pass Error", e);
        return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 });
    }
}
