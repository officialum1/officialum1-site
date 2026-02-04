import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

const TOPICS = [
    {
        title: "How to Get Premium Accounts for Cheap in 2026",
        category: "Guides",
        template: `In today's digital age, streaming services and premium tools are essential. However, the costs can add up quickly. 
        If you subscribe to Netflix, Spotify, Disney+, and a VPN, you could be spending over $100 a month!
        
        ## Why Pay More?
        OfficialUM1 offers a solution. We provide shared and private premium accounts at a fraction of the cost. 
        Whether you need a **Netflix 4K Ultra HD** account or **Spotify Premium** for ad-free music, we have you covered.
        
        ## Safety First
        Many users worry about the safety of buying accounts online. At OfficialUM1, we offer a warranty on all our products. 
        If an account stops working, our automated system replaces it instantly.
        
        ## Get Started
        Check out our [Shop](/shop) today and start saving money on your favorite subscriptions.`
    },
    {
        title: "Top 5 Benefits of Using a Private VPN",
        category: "Security",
        template: `Privacy is a luxury in 2026. With ISPs tracking your data and hackers lurking on public Wi-Fi, a VPN is no longer optional—it's necessary.
        
        ## 1. Encryption
        A VPN encrypts your traffic, making it unreadable to anyone intercepting it.
        
        ## 2. Access Geo-Restricted Content
        Want to watch Netflix Japan? A VPN lets you change your IP address to bypass regional blocks.
        
        ## 3. Avoid Bandwidth Throttling
        ISPs often slow down your speed if they detect streaming. A VPN hides your activity.
        
        ## Conclusion
        Don't browse unprotected. Grab a premium VPN account from our [Shop](/shop) today!`
    },
    {
        title: "Netflix vs Disney+: Which is Right for You?",
        category: "Reviews",
        template: `The streaming wars are heating up. Two giants, Netflix and Disney+, are battling for your screen time.
        
        ## Netflix
        - **Pros**: Huge library, excellent original content (Stranger Things, Squid Game).
        - **Cons**: Expensive ($22.99/mo for 4K).
        
        ## Disney+
        - **Pros**: Marvel, Star Wars, Pixar. Cheaper than Netflix.
        - **Cons**: App can be buggy, less content for adults.
        
        ## The Verdict
        Why choose? With OfficialUM1, you can get BOTH for less than the price of a coffee. 
        Visit our catalog effectively immediately.`
    }
];

export async function GET() {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
        const slug = topic.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        const exists: any = await query("SELECT id FROM blogs WHERE slug = ?", [slug]);
        if (exists.length > 0) return NextResponse.json({ message: "Exists" });

        const image = "https://images.unsplash.com/photo-1499750310159-5254f4cc1529?auto=format&fit=crop&w=800&q=80";
        await query(
            "INSERT INTO blogs (title, slug, category, image, excerpt, content, author) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [topic.title, slug, topic.category, image, topic.template.substring(0, 100) + '...', topic.template, 'AI Editor']
        );
        return NextResponse.json({ success: true, title: topic.title });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const body = await request.json();
        const { topic } = body;

        if (!topic) return NextResponse.json({ error: "Topic is required" }, { status: 400 });

        // Get API Keys from settings
        const settingsRes: any = await query("SELECT * FROM settings WHERE setting_key IN ('openaiKey', 'geminiKey')");
        const settings: any = {};
        settingsRes.forEach((s: any) => settings[s.setting_key] = s.setting_value);

        const openaiKey = settings.openaiKey || process.env.OPENAI_API_KEY;
        const geminiKey = settings.geminiKey || process.env.GEMINI_API_KEY;

        if (!openaiKey && !geminiKey) {
            return NextResponse.json({ error: "No AI API Keys configured (OpenAI or Gemini). Please check Settings." }, { status: 400 });
        }

        let title, category, excerpt, content;

        if (openaiKey) {
            // Use OpenAI (ChatGPT)
            const prompt = `Write a professional, SEO-optimized blog post about "${topic}". 
            Include a catchy title, a category (one word), a short excerpt (max 100 chars), and the full content in Markdown format. 
            Format your response strictly as a JSON object with keys: title, category, excerpt, content.
            Do not include any other text in your response.`;

            const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [{ role: "user", content: prompt }],
                    response_format: { type: "json_object" }
                })
            });

            if (!aiRes.ok) {
                const error = await aiRes.json();
                return NextResponse.json({ error: `OpenAI Error: ${error.error?.message || 'Unknown error'}` }, { status: 500 });
            }

            const aiData = await aiRes.json();
            const generated = JSON.parse(aiData.choices[0].message.content);
            title = generated.title;
            category = generated.category;
            excerpt = generated.excerpt;
            content = generated.content;
        } else {
            // Use Google Gemini (Fallback)
            const prompt = `Write a professional, SEO-optimized blog post about "${topic}". 
            Include a catchy title, a category (one word), a short excerpt (max 100 chars), and the full content in Markdown format. 
            Format your response strictly as a JSON object with keys: title, category, excerpt, content.
            Return ONLY the valid JSON block.`;

            const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!aiRes.ok) {
                const error = await aiRes.json();
                return NextResponse.json({ error: `Gemini Error: ${error.error?.message || 'Unknown error'}` }, { status: 500 });
            }

            const aiData = await aiRes.json();
            const text = aiData.candidates[0].content.parts[0].text;
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const generated = JSON.parse(cleaned);
            title = generated.title;
            category = generated.category;
            excerpt = generated.excerpt;
            content = generated.content;
        }
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        // Check if exists
        const exists: any = await query("SELECT id FROM blogs WHERE slug = ?", [slug]);
        if (exists.length > 0) {
            return NextResponse.json({ success: false, error: "A blog with this title already exists." });
        }

        const image = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80"; // Tech/Blog image

        await query(
            "INSERT INTO blogs (title, slug, category, image, excerpt, content, author) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [title, slug, category, image, excerpt, content, 'AI Content Writer']
        );

        return NextResponse.json({ success: true, title });

    } catch (e: any) {
        console.error("AI Blog Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
