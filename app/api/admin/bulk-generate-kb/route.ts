import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function POST(req: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { keywords } = await req.json();

        if (!keywords || !Array.isArray(keywords)) {
            return NextResponse.json({ error: "Keywords array required" }, { status: 400 });
        }

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

        const addedCount = 0;
        const results = [];

        for (const topic of keywords) {
            const prompt = `
            You are an SEO expert and Technical Writer. 
            Write an EPIC Knowledge Base Article about: "${topic}".
            Focus on helping users while ranking for keywords like "OfficialUM1", "Cheap Accounts", "Instant Delivery".
            
            Return the result as a STRICT JSON object (no markdown formatting around the json check) with the following structure:
            {
                "title": "Clear Title",
                "slug": "url-friendly-slug",
                "category": "One of: General, Accounts, Payments, Security, Affiliate",
                "content": "HTML formatted content (use <h2>, <p>, <ul>, <li>, <strong>). Do not include <html> or <body> tags.",
                "meta_description": "SEO optimized description",
                "keywords": "comma, separated, list, of, keywords"
            }
            `;

            let article = null;

            // Try OpenAI first
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
                    article = JSON.parse(data.choices[0].message.content);
                } catch (e) { console.error("OpenAI Error for", topic, e); }
            }

            if (!article && geminiKey) {
                try {
                    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                    });
                    const data = await geminiRes.json();
                    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
                        article = JSON.parse(text);
                    }
                } catch (e) { console.error("Gemini Error for", topic, e); }
            }

            if (article) {
                await query(
                    "INSERT INTO knowledge_base (title, slug, content, category, is_published, meta_description, keywords) VALUES (?, ?, ?, ?, 1, ?, ?)",
                    [article.title, article.slug, article.content, article.category, article.meta_description, article.keywords]
                );
                results.push(article.title);
            }
        }

        return NextResponse.json({ success: true, message: `Successfully generated ${results.length} articles.`, titles: results });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
