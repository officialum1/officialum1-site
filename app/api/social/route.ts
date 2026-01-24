import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Get Social Posts
export async function GET() {
    try {
        const posts = await query("SELECT * FROM social_posts ORDER BY date DESC");
        return NextResponse.json(posts);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// Add New Post
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Support multi-select
        const platforms = Array.isArray(body.platforms) ? body.platforms : [body.platform || 'All'];

        // Get Settings for API Keys
        const settingsRes: any = await query("SELECT * FROM settings");
        const settings: any = {};
        settingsRes.forEach((s: any) => settings[s.setting_key] = s.setting_value);

        const autoPostLog: string[] = [];

        // Telegram Sending Logic
        if ((platforms.includes('Telegram') || platforms.includes('All')) && settings.telegram_bot_token && settings.telegram_chat_id) {
            try {
                await fetch(`https://api.telegram.org/bot${settings.telegram_bot_token}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: settings.telegram_chat_id,
                        text: body.content
                    })
                });
                autoPostLog.push('Telegram: Sent');
            } catch (e) {
                console.error('Telegram Error', e);
            }
        }

        const newPost = {
            id: `post_${Date.now()}`,
            content: body.content,
            platform: platforms.join(', '),
            status: 'Posted',
            date: new Date().toISOString()
        };

        // Use NOW() for SQL date
        await query(
            "INSERT INTO social_posts (id, content, platform, status, likes) VALUES (?, ?, ?, ?, ?)",
            [newPost.id, newPost.content, newPost.platform, newPost.status, 0]
        );

        return NextResponse.json({ success: true, post: newPost, log: autoPostLog });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
