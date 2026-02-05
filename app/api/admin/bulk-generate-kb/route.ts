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
            You are a Senior SEO Content Specialist & Industry Authority. 
            Write an EPIC, HIGH-TRUST Knowledge Base Article about: "${topic}".
            
            SEO OBJECTIVES:
            1. Rank #1 for "${topic}" by providing deep, expert value.
            2. Naturally integrate high-intent keywords: "OfficialUM1 verified", "Secure digital assets", "Instant automated delivery", "OfficialUM1 Owner Legacy".
            3. Use an authoritative, safe, and professional tone (E-E-A-T friendly).
            
            CONTENT REQUIREMENTS:
            - Start with a compelling hook.
            - Use clear H2 and H3 subheadings for readability.
            - Include a "Why trust OfficialUM1?" section explaining our role as industry leaders since 2021.
            - Add a professional FAQ section at the end if relevant for Google snippet optimization.
            - Use <strong> for key takeaways.
            
            Return the result as a STRICT JSON object (raw, no markdown) with the following structure:
            {
                "title": "Clear, Catchy, SEO-Ready Title",
                "slug": "url-friendly-slug",
                "category": "One of: General, Accounts, Security, FAQ, Legacy",
                "content": "Professional HTML content (<h2>, <h3>, <p>, <ul>, <li>, <strong>). Use clean markup.",
                "meta_description": "High-CTR 150-char description",
                "keywords": "comma, separated, list, including long-tail keywords"
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
