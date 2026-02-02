import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
    try {
        const { topic } = await req.json();

        if (!topic) return NextResponse.json({ error: "Topic is required" }, { status: 400 });

        // Fetch Keys
        let geminiKey = process.env.GEMINI_API_KEY;
        let openaiKey = process.env.OPENAI_API_KEY;
        let deepseekKey = process.env.DEEPSEEK_API_KEY;

        if (!geminiKey || !openaiKey || !deepseekKey) {
            const rows = await query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('geminiKey', 'openaiKey', 'deepseekKey')") as any[];
            rows.forEach((r: any) => {
                if (r.setting_key === 'geminiKey') geminiKey = r.setting_value;
                if (r.setting_key === 'openaiKey') openaiKey = r.setting_value;
                if (r.setting_key === 'deepseekKey') deepseekKey = r.setting_value;
            });
        }

        let content = "";

        // Strategy 0: DeepSeek (Newly added primary)
        if (deepseekKey) {
            try {
                console.log("Using DeepSeek API...");
                const dsRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${deepseekKey}`
                    },
                    body: JSON.stringify({
                        model: "deepseek-chat",
                        messages: [
                            { role: "system", content: "You are an expert SEO Blog Writer." },
                            { role: "user", content: `Write a comprehensive, SEO-optimized blog post about "${topic}". Start with the Title on the first line prefixed with '# '. Usage Markdown.` }
                        ],
                        temperature: 0.7
                    })
                });
                const dsData = await dsRes.json();
                if (dsData.choices?.[0]?.message?.content) {
                    content = dsData.choices[0].message.content;
                }
            } catch (e) {
                console.error("DeepSeek Failed, trying others...");
            }
        }

        // Strategy 1: OpenAI (Preferred if available)
        if (openaiKey) {
            try {
                const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${openaiKey}`
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [
                            { role: "system", content: "You are an expert SEO Blog Writer." },
                            { role: "user", content: `Write a comprehensive, SEO-optimized blog post about "${topic}". Start with the Title on the first line prefixed with '# '. Usage Markdown.` }
                        ]
                    })
                });
                const openaiData = await openaiRes.json();
                content = openaiData.choices[0].message.content;
            } catch (e) {
                console.error("OpenAI Failed, trying Gemini...");
            }
        }

        let lastError = null;

        // Strategy 2: Gemini (Fallback)
        if (!content && geminiKey) {
            console.log("Using Gemini API...");
            const prompt = `Write a comprehensive, SEO-optimized blog post about "${topic}". Start with the Title on the first line prefixed with '# '. Usage Markdown.`;
            try {
                const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
                const geminiData = await geminiRes.json();

                if (geminiData.error) {
                    lastError = geminiData.error.message || JSON.stringify(geminiData.error);
                    console.error("Gemini API Error:", lastError);
                } else if (geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
                    content = geminiData.candidates[0].content.parts[0].text;
                } else {
                    lastError = "Gemini returned no content candidates.";
                }
            } catch (e: any) {
                console.error("Gemini Request Failed", e);
                lastError = e.message;
            }
        }

        if (!content) {
            console.error("Keys Status:", { hasOpenAI: !!openaiKey, hasGemini: !!geminiKey });
            return NextResponse.json({ error: lastError || "Failed to generate content. Please check API Keys in Settings." }, { status: 500 });
        }

        // 2. Parse Title and Content
        const lines = content.split('\n');
        let title = `Guide: ${topic}`;
        let cleanContent = content;

        if (lines[0].startsWith('# ')) {
            title = lines[0].replace('# ', '').trim();
            cleanContent = lines.slice(1).join('\n').trim();
        }

        // 3. Save to Database
        await query(
            "INSERT INTO blogs (title, content, excerpt, category, author) VALUES (?, ?, ?, ?, ?)",
            [
                title,
                cleanContent,
                cleanContent.substring(0, 150) + "...", // Auto-generate excerpt
                "Guides",
                "OfficialUM1 Team"
            ]
        );

        return NextResponse.json({ success: true, title });

    } catch (e: any) {
        console.error("Blog Gen Error:", e);
        return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
    }
}
