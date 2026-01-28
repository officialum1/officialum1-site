import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get('slug');

        if (slug) {
            const article = await query("SELECT * FROM knowledge_base WHERE slug = ? AND is_published = 1", [slug]) as any[];
            if (article.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
            // Increment view count
            await query("UPDATE knowledge_base SET views = views + 1 WHERE id = ?", [article[0].id]);
            return NextResponse.json(article[0]);
        }

        const articles = await query("SELECT * FROM knowledge_base WHERE is_published = 1 ORDER BY category ASC, created_at DESC");
        return NextResponse.json(articles);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
