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

        // --- 1. TELEGRAM ---
        if ((platforms.includes('Telegram') || platforms.includes('All')) && settings.telegram_bot_token && settings.telegram_chat_id) {
            try {
                const tgRes = await fetch(`https://api.telegram.org/bot${settings.telegram_bot_token}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: settings.telegram_chat_id,
                        text: body.content
                    })
                });
                if (tgRes.ok) autoPostLog.push('Telegram: Sent ✅');
                else autoPostLog.push('Telegram: Failed ❌');
            } catch (e) {
                console.error('Telegram Error', e);
                autoPostLog.push('Telegram: Error ❌');
            }
        }

        // --- 2. TWITTER / X ---
        if ((platforms.includes('Twitter') || platforms.includes('All')) && settings.twitter_api_key && settings.twitter_access_token) {
            try {
                const { TwitterApi } = require('twitter-api-v2');
                const client = new TwitterApi({
                    appKey: settings.twitter_api_key,
                    appSecret: settings.twitter_api_secret,
                    accessToken: settings.twitter_access_token,
                    accessSecret: settings.twitter_access_secret,
                });
                await client.v2.tweet(body.content);
                autoPostLog.push('Twitter: Sent ✅');
            } catch (e) {
                console.error('Twitter Error', e);
                autoPostLog.push('Twitter: Failed (Check Keys) ❌');
            }
        }

        // --- 3. FACEBOOK PAGE ---
        if ((platforms.includes('Facebook') || platforms.includes('All')) && settings.facebook_page_id && settings.facebook_page_token) {
            try {
                const fbRes = await fetch(`https://graph.facebook.com/v19.0/${settings.facebook_page_id}/feed`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: body.content,
                        access_token: settings.facebook_page_token
                    })
                });
                if (fbRes.ok) autoPostLog.push('Facebook: Sent ✅');
                else {
                    const err = await fbRes.json();
                    console.error('FB Error', err);
                    autoPostLog.push('Facebook: Failed ❌');
                }
            } catch (e) {
                autoPostLog.push('Facebook: Error ❌');
            }
        }

        // --- 4. LINKEDIN ---
        if ((platforms.includes('LinkedIn') || platforms.includes('All')) && settings.linkedin_access_token) {
            try {
                let authorUrn = settings.linkedin_person_urn;

                // Auto-Detect URN if missing (requires 'openid' scope)
                if (!authorUrn || authorUrn === 'auto') {
                    try {
                        const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
                            headers: { 'Authorization': `Bearer ${settings.linkedin_access_token}` }
                        });
                        if (userRes.ok) {
                            const userData = await userRes.json();
                            authorUrn = userData.sub; // The 'sub' field is the Member ID
                        } else {
                            autoPostLog.push('LinkedIn: Could not auto-detect ID ⚠️');
                        }
                    } catch (e) {
                        console.error('LinkedIn ID Fetch Error', e);
                    }
                }

                if (authorUrn) {
                    // Ensure format is correct
                    if (!authorUrn.startsWith('urn:li:person:')) authorUrn = `urn:li:person:${authorUrn}`;

                    const liRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${settings.linkedin_access_token}`,
                            'Content-Type': 'application/json',
                            'X-Restli-Protocol-Version': '2.0.0'
                        },
                        body: JSON.stringify({
                            "author": authorUrn,
                            "lifecycleState": "PUBLISHED",
                            "specificContent": {
                                "com.linkedin.ugc.ShareContent": {
                                    "shareCommentary": { "text": body.content },
                                    "shareMediaCategory": "NONE"
                                }
                            },
                            "visibility": { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
                        })
                    });
                    if (liRes.ok) autoPostLog.push('LinkedIn: Sent ✅');
                    else {
                        const err = await liRes.json();
                        console.error('LinkedIn Publish Error', err);
                        autoPostLog.push('LinkedIn: Failed ❌');
                    }
                } else {
                    autoPostLog.push('LinkedIn: Missing Person URN ❌');
                }
            } catch (e) {
                autoPostLog.push('LinkedIn: Error ❌');
            }
        }

        // --- 5. INSTAGRAM (Via FB Graph) ---
        // Note: Needs IMAGE usually. Text-only might fail or require special endpoint.
        // Skipping text-only for IG to avoid errors, unless user explicitly requests image posting support.

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

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
        await query("DELETE FROM social_posts WHERE id = ?", [id]);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
