import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendAuditReport } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const { email, password, telegram, referralCode } = await req.json();

        // 1. Validation
        if (!email || !password) return NextResponse.json({ error: "Email/Pass required" }, { status: 400 });

        // 2. Check Exists
        const existing: any = await query("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // 3. Generate Codes
        const newRefCode = Math.random().toString(36).substring(7).toUpperCase();
        const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

        // 4. Create User (Including Verification Token and is_verified=False)
        const result: any = await query(
            "INSERT INTO users (email, password, telegram, referral_code, referred_by, verification_token, is_verified) VALUES (?, ?, ?, ?, ?, ?, FALSE)",
            [email, password, telegram || '', newRefCode, referralCode || null, verificationToken]
        );

        // 5. Send Verification Email
        const origin = req.headers.get('origin') || 'https://officialum1.com';
        const verifyLink = `${origin}/verify-email?token=${verificationToken}`;

        await sendAuditReport(email, "Verify Your Account - OfficialUM1", {
            da: "ACTION REQUIRED",
            pa: "Verify Email",
            links: 0,
            details: `Thanks for signing up! Please verify your email to unlock all features.\n\n<a href="${verifyLink}" style="display:inline-block;padding:10px 20px;background:#4f46e5;color:white;text-decoration:none;border-radius:5px;">Verify Account</a>\n\nOr click here: ${verifyLink}`
        }, {});

        return NextResponse.json({
            success: true,
            user: {
                id: result.insertId,
                email,
                telegram: telegram || '',
                referralCode: newRefCode
            }
        });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
