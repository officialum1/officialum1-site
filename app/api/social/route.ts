import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const postsFile = path.join(process.cwd(), 'data', 'social_posts.json');

function getPosts() {
    if (!fs.existsSync(postsFile)) return [];
    return JSON.parse(fs.readFileSync(postsFile, 'utf8'));
}

function savePosts(data: any[]) {
    fs.writeFileSync(postsFile, JSON.stringify(data, null, 2));
}

export async function GET(request: Request) {
    return NextResponse.json(getPosts().reverse()); // Newest first
}

const settingsFile = path.join(process.cwd(), 'data', 'settings.json');

function getSettings() {
    if (!fs.existsSync(settingsFile)) return {};
    return JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const posts = getPosts();
        const settings = getSettings();

        if (body.action === 'create') {
            let status = 'Draft';
            let autoPostLog = [];

            // SIMULATED AUTO-POSTING LOGIC
            // In a real app, we would utilize 'twitter-api-v2' or 'axios' here.

            // Check Twitter
            if ((body.platform === 'Twitter' || body.platform === 'All') && settings.twitter_api_key) {
                // Attempt Tweet...
                console.log("Attempting to Tweet via API...");
                // if (success) { status = 'Posted'; autoPostLog.push('Twitter: Success'); }
            }

            // Check Facebook & Instagram
            if ((body.platform === 'Facebook' || body.platform === 'Instagram' || body.platform === 'All') && settings.facebook_page_token) {
                console.log("Attempting to Post to FB/IG...");
                // Note: Instagram Posting is complex (requires Image upload via Container).
                // For text-only, Telegram/Twitter/LinkedIn are best.
                // We'll simulate success for now.
            }

            // Check Telegram
            if ((body.platform === 'Telegram' || body.platform === 'All') && settings.telegram_bot_token && settings.telegram_chat_id) {
                console.log("Attempting to Post to Telegram...");
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
                    console.error('Telegram Error:', e);
                    autoPostLog.push('Telegram: Failed');
                }
            }

            const newPost = {
                id: `post_${Date.now()}`,
                content: body.content,
                platform: body.platform,
                status: status,
                author: body.staffName,
                createdAt: new Date().toISOString(),
                autoPostLog: autoPostLog
            };
            posts.push(newPost);
            savePosts(posts);
            return NextResponse.json({ success: true, post: newPost });
        }

        if (body.action === 'mark_posted') {
            const index = posts.findIndex((p: any) => p.id === body.id);
            if (index > -1) {
                posts[index].status = 'Posted';
                posts[index].postedAt = new Date().toISOString();
                savePosts(posts);
                return NextResponse.json({ success: true, post: posts[index] });
            }
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e) {
        return NextResponse.json({ error: 'Error processing request' }, { status: 500 });
    }
}
