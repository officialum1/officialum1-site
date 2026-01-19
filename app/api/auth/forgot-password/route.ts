import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendAuditReport } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        // 1. Verify User Exists
        const users: any = await query("SELECT id FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return NextResponse.json({ error: "Email not found" }, { status: 404 });
        }

        // 2. Generate Reset Token (Simple random string)
        const resetToken = Math.random().toString(36).substring(2, 10).toUpperCase();

        // 3. Save Token to DB
        await query("UPDATE users SET reset_token = ? WHERE email = ?", [resetToken, email]);

        // 4. Send Email
        await sendAuditReport(email, "Password Reset Request", {
            da: "RESET PASSWORD",
            pa: "Action Required",
            links: 0,
            details: `We received a request to reset your password.\n\nYour Temporary Reset Code is: **${resetToken}**\n\n(Use this code to login, then change your password in settings)`
        }, {});

        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error("Forgot Pass Error", e);
        return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 });
    }
}
