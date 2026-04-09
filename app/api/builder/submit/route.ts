import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendTelegramAdminAlert } from '@/lib/telegram';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, platform, niche, requirements, budget } = body;

        if (!userId || !platform || !niche || !requirements || !budget) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // 1. Insert into database
        await query(
            "INSERT INTO builder_requests (user_id, platform, niche, requirements, budget, status) VALUES (?, ?, ?, ?, ?, 'pending')",
            [userId, platform, niche, requirements, budget]
        );

        // 2. Insert notification for the user
        await query(
            "INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Construction Started! 🛠️', ?, 'system')",
            [userId, `Your custom ${platform} request has been received and is being reviewed by our team.`]
        );

        // 3. Send Telegram Alert to Admin
        try {
            await sendTelegramAdminAlert(`🛠️ **New Custom Build Request!**\n\n👤 User: ${userId}\n📱 Platform: ${platform}\n🎯 Niche: ${niche}\n💰 Budget: $${budget}\n📝 Req: "${requirements.substring(0, 100)}..."`);
        } catch (e) {
            console.error("Telegram Alert Failed:", e);
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Builder Submission Error:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
