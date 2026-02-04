import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

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
    try {
        // Pick a random topic
        // In a real AI system, you'd call OpenAI here with a prompt.
        const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
        const slug = topic.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        // Check if exists
        const exists: any = await query("SELECT id FROM blogs WHERE slug = ?", [slug]);
        if (exists.length > 0) {
            return NextResponse.json({ message: "Content already exists, skipping." });
        }

        const image = "https://images.unsplash.com/photo-1499750310159-5254f4cc1529?auto=format&fit=crop&w=800&q=80"; // Generic Tech Image

        await query(
            "INSERT INTO blogs (title, slug, category, image, excerpt, content, author) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [topic.title, slug, topic.category, image, topic.template.substring(0, 100) + '...', topic.template, 'AI Editor']
        );

        return NextResponse.json({ success: true, title: topic.title });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
