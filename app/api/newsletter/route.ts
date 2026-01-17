import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendTelegramAdminAlert } from '@/lib/telegram';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: "Invalid Email" }, { status: 400 });
        }

        await query("INSERT INTO newsletter (email) VALUES (?)", [email]);

        // Telegram Alert
        await sendTelegramAdminAlert(`📧 <b>New Newsletter Subscriber!</b>\nEmail: ${email}`);

        return NextResponse.json({ success: true });
    } catch (e: any) {
        if (e.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ success: true, message: "Already subscribed!" });
        }
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
