import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function POST(req: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const { topic, channel, tone = 'persuasive', length = 'short' } = await req.json();

        // 1. Fetch AI Keys from Settings
        const settingsRows: any = await query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('geminiKey', 'openaiKey', 'marketing_ai_model')");
        const settings = settingsRows.reduce((acc: any, row: any) => {
            acc[row.setting_key] = row.setting_value;
            return acc;
        }, {});

        const model = settings.marketing_ai_model || 'gemini';
        const apiKey = model === 'gemini' ? settings.geminiKey : settings.openaiKey;

        if (!apiKey) {
            return NextResponse.json({ error: "AI API Key missing in settings." }, { status: 400 });
        }

        const prompt = `
        You are a World-Class Digital Marketing Expert & Copywriter.
        Target Platform: ${channel}
        Topic: ${topic}
        Tone: ${tone}
        Length Strategy: ${length}

        OBJECTIVE: Write a high-conversion, viral-ready post that drives sales 
        for OfficialUM1 (Premium Digital Assets & Accounts Marketplace).

        GUIDELINES:
        - Use emojis sparingly but effectively.
        - Include a clear Call to Action (CTA).
        - Focus on safety, speed, and OfficialUM1's 2021-2026 legacy.
        - If Twitter, keep it under 280 chars but packed with value.
        - If Telegram, make it look professional with bold titles and listicle features.

        Return strictly the generated content text.
        `;

        let content = "";

        if (model === 'gemini') {
            const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await geminiRes.json();
            content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } else {
            const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                })
            });
            const data = await openaiRes.json();
            content = data.choices?.[0]?.message?.content || "";
        }

        if (!content) throw new Error("AI failed to generate content.");

        return NextResponse.json({ content: content.trim() });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
