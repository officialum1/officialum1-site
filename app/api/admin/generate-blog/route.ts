import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
    try {
        const { topic } = await req.json();

        if (!topic) return NextResponse.json({ error: "Topic is required" }, { status: 400 });

        let apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            const rows = await query("SELECT setting_value FROM settings WHERE setting_key = 'geminiKey'") as any[];
            if (rows.length > 0) apiKey = rows[0].setting_value;
        }

        if (!apiKey) {
            return NextResponse.json({ error: "Gemini API Key Missing" }, { status: 500 });
        }

        // 1. Generate Blog Content using Gemini
        const prompt = `Write a comprehensive, SEO-optimized blog post about "${topic}". 
        The post should be formatted in Markdown.
        Structure:
        - Catchy Title
        - Introduction (Hook the reader)
        - 3-4 H2 Sections with detailed advice
        - Conclusion
        - Do NOT include 'Here is the blog post' or typical AI intros. Just the content.
        - Start with the Title on the first line prefixed with '# '.`;

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const geminiData = await geminiRes.json();

        let content = "";
        try {
            content = geminiData.candidates[0].content.parts[0].text;
        } catch (e) {
            console.error("Gemini Response Error:", JSON.stringify(geminiData));
            return NextResponse.json({ error: "Failed to generate content from AI" }, { status: 500 });
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
