import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get('slug');
        const admin = searchParams.get('admin'); // Simple check if admin fetching

        if (slug) {
            const article = await query("SELECT * FROM knowledge_base WHERE slug = ?", [slug]) as any[];
            if (article.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
            // Increment view count if public
            if (!admin) {
                await query("UPDATE knowledge_base SET views = views + 1 WHERE id = ?", [article[0].id]);
            }
            return NextResponse.json(article[0]);
        }

        const shuffle = searchParams.get('mixed'); // "get mixed" for SEO freshness

        const sql = admin
            ? "SELECT * FROM knowledge_base ORDER BY created_at DESC"
            : shuffle
                ? "SELECT * FROM knowledge_base WHERE is_published = 1 ORDER BY RAND()"
                : "SELECT * FROM knowledge_base WHERE is_published = 1 ORDER BY category ASC, created_at DESC";

        const articles = await query(sql);
        return NextResponse.json(articles);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, slug, content, category, is_published, meta_description, keywords } = body;

        // Basic validation
        if (!title || !slug || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        await query(
            "INSERT INTO knowledge_base (title, slug, content, category, is_published, meta_description, keywords) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [title, slug, content, category || 'General', is_published ? 1 : 0, meta_description || '', keywords || '']
        );
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, title, slug, content, category, is_published, meta_description, keywords } = body;

        // 1. "Make sure we know what was there" - Backup before overwrite
        const [old] = await query("SELECT title, content FROM knowledge_base WHERE id = ?", [id]) as any[];
        if (old) {
            await query(
                "INSERT INTO kb_history (kb_id, old_title, old_content) VALUES (?, ?, ?)",
                [id, old.title, old.content]
            );
        }

        // 2. Perform Update
        await query(
            "UPDATE knowledge_base SET title=?, slug=?, content=?, category=?, is_published=?, meta_description=?, keywords=? WHERE id=?",
            [title, slug, content, category, is_published ? 1 : 0, meta_description || '', keywords || '', id]
        );
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await query("DELETE FROM knowledge_base WHERE id = ?", [id]);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
