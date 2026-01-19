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

        // 3. Generate Referral Code for New User
        const newRefCode = Math.random().toString(36).substring(7).toUpperCase();

        // 4. Create User
        const result: any = await query(
            "INSERT INTO users (email, password, telegram, referral_code, referred_by) VALUES (?, ?, ?, ?, ?)",
            [email, password, telegram || '', newRefCode, referralCode || null]
        );

        // 5. Send Welcome Email
        await sendAuditReport(email, "Welcome to OfficialUM1!", {
            da: "ACCOUNT CREATED",
            pa: "Welcome Aboard",
            links: 0,
            details: `Thanks for signing up! \n\nYour Referral Code is: ${newRefCode}\nShare this to earn 5% commission on friends' purchases!`
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
