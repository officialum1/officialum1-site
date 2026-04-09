import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { topic } = await req.json();

        if (!topic) return NextResponse.json({ error: "Topic is required" }, { status: 400 });

        // Fetch Keys
        let geminiKey = process.env.GEMINI_API_KEY;
        let openaiKey = process.env.OPENAI_API_KEY;

        if (!geminiKey || !openaiKey) {
            const rows = await query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('geminiKey', 'openaiKey')") as any[];
            rows.forEach((r: any) => {
                if (r.setting_key === 'geminiKey') geminiKey = r.setting_value;
                if (r.setting_key === 'openaiKey') openaiKey = r.setting_value;
            });
        }

        let result = null;

        const prompt = `
        You are an SEO expert and Technical Writer. 
        Write a Knowledge Base Article about: "${topic}".
        
        Return the result as a STRICT JSON object (no markdown formatting around the json check) with the following structure:
        {
            "title": "Clear, Question-based Title",
            "slug": "url-friendly-slug",
            "category": "One of: General, Accounts, Payments, Security, Affiliate",
            "content": "HTML formatted content (use <h2>, <p>, <ul>, <li>, <strong>). Do not include <html> or <body> tags. Keep it helpful, professional, and direct.",
            "meta_description": "SEO optimized description (max 160 chars)",
            "keywords": "comma, separated, list, of, keywords"
        }
        `;

        // Strategy 1: OpenAI
        if (openaiKey) {
            try {
                const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [
                            { role: "system", content: "You are a JSON generator. output only raw valid JSON." },
                            { role: "user", content: prompt }
                        ],
                        response_format: { type: "json_object" }
                    })
                });
                const data = await openaiRes.json();
                result = JSON.parse(data.choices[0].message.content);
            } catch (e) { console.error("OpenAI Error", e); }
        }

        // Strategy 2: Gemini
        if (!result && geminiKey) {
            try {
                const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
                const data = await geminiRes.json();
                let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    text = text.replace(/```json/g, '').replace(/```/g, '').trim(); // Cleanup markdown
                    result = JSON.parse(text);
                }
            } catch (e) { console.error("Gemini Error", e); }
        }

        if (!result) return NextResponse.json({ error: "Failed to generate content. Check API Keys." }, { status: 500 });

        return NextResponse.json({ success: true, data: result });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
