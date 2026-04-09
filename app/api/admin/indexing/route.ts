import { NextResponse } from 'next/server';
import { getUrlStatus, notifyGoogleIndexing } from '@/lib/google-indexing';
import { isAuthenticated } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (url) {
        const result = await getUrlStatus(url);
        return NextResponse.json(result);
    }

    // Default: Return list of core pages and recent items to index
    try {
        const blogs = await query("SELECT title, slug FROM blogs ORDER BY created_at DESC LIMIT 5") as any[];
        const products = await query("SELECT id, name FROM products ORDER BY id DESC LIMIT 5") as any[];
        const kb = await query("SELECT title, slug FROM knowledge_base ORDER BY created_at DESC LIMIT 5") as any[];

        const core = [
            { title: 'Home', url: 'https://officialum1.com' },
            { title: 'Shop', url: 'https://officialum1.com/shop' },
            { title: 'Blog', url: 'https://officialum1.com/blog' },
            { title: 'Reviews', url: 'https://officialum1.com/reviews' },
            { title: 'About', url: 'https://officialum1.com/about' },
            { title: 'FAQ', url: 'https://officialum1.com/faq' },
            { title: 'Services', url: 'https://officialum1.com/services' },
        ];

        return NextResponse.json({
            core,
            recent: {
                blogs: blogs.map(b => ({ title: b.title, url: `https://officialum1.com/blog/${b.slug}` })),
                products: products.map(p => ({ title: p.name, url: `https://officialum1.com/shop/${p.id}` })),
                kb: kb.map(k => ({ title: k.title, url: `https://officialum1.com/kb/${k.slug}` }))
            }
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: "No URL provided" }, { status: 400 });

        await notifyGoogleIndexing(url);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
