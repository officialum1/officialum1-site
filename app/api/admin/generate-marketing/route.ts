import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from 'openai';

export async function POST(req: Request) {
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
            const genAI = new GoogleGenerativeAI(apiKey);
            const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await geminiModel.generateContent(prompt);
            content = result.response.text();
        } else {
            const openai = new OpenAI({ apiKey });
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
            });
            content = completion.choices[0].message.content || "";
        }

        return NextResponse.json({ content: content.trim() });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
