import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendAuditReport, sendVerificationEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';

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

        // 3. Generate Codes & ID
        const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;
        const newRefCode = Math.random().toString(36).substring(7).toUpperCase();
        const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

        // Resolve Referral Code to User ID
        let referrerId = null;
        if (referralCode) {
            const refUser: any = await query("SELECT id FROM users WHERE referral_code = ?", [referralCode]);
            if (refUser.length > 0) {
                referrerId = refUser[0].id;
            }
        }

        // 4. Create User (Including Verification Token and is_verified=False)
        const hashedPassword = await bcrypt.hash(password, 10);

        await query(
            "INSERT INTO users (id, email, password, telegram, role, referral_code, referred_by, verification_token, is_verified) VALUES (?, ?, ?, ?, 'buyer', ?, ?, ?, FALSE)",
            [userId, email, hashedPassword, telegram || '', newRefCode, referrerId, verificationToken]
        );

        // 5. Send Verification Email
        const origin = req.headers.get('origin') || 'https://officialum1.com';
        const verifyLink = `${origin}/verify-email?token=${verificationToken}`;

        try {
            await sendVerificationEmail(email, verifyLink);
        } catch (emailError) {
            console.error("Failed to send verification email:", emailError);
            // Don't block registration, but log it
        }

        return NextResponse.json({
            success: true,
            user: {
                id: userId,
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
