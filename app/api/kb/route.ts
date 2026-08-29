import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { notifyGoogleIndexing } from '@/lib/google-indexing';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get('slug');
        const admin = searchParams.get('admin');

        if (slug) {
            const article = await query("SELECT * FROM knowledge_base WHERE slug = ?", [slug]) as any[];
            if (article.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
            if (!admin) {
                await query("UPDATE knowledge_base SET views = views + 1 WHERE id = ?", [article[0].id]);
            }
            return NextResponse.json(article[0]);
        }

        const shuffle = searchParams.get('mixed');
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
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const body = await req.json();
        let { title, slug, content, category, is_published, meta_description, keywords } = body;

        if (!title || !content) return NextResponse.json({ error: "Title and Content are required" }, { status: 400 });

        if (!slug) {
            slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }

        // Slug Collision Protection
        const existing = await query("SELECT id FROM knowledge_base WHERE slug = ?", [slug]) as any[];
        if (existing.length > 0) {
            slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
        }

        await query(
            "INSERT INTO knowledge_base (title, slug, content, category, is_published, meta_description, keywords) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [title, slug, content, category || 'General', is_published ? 1 : 0, meta_description || '', keywords || '']
        );

        // Notify Google
        if (is_published) {
            notifyGoogleIndexing(`https://officialum1.com/kb/${slug}`).catch(e => console.error(e));
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const body = await req.json();
        const { id, title, slug, content, category, is_published, meta_description, keywords } = body;

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        // 1. Version History
        try {
            const [old] = await query("SELECT title, content FROM knowledge_base WHERE id = ?", [id]) as any[];
            if (old) {
                await query(
                    "INSERT INTO kb_history (kb_id, old_title, old_content) VALUES (?, ?, ?)",
                    [id, old.title, old.content]
                );
            }
        } catch (e) {
            console.error("History logging failed", e); // Don't crash the whole update if history fails
        }

        // 2. Perform Update
        await query(
            "UPDATE knowledge_base SET title=?, slug=?, content=?, category=?, is_published=?, meta_description=?, keywords=? WHERE id=?",
            [title, slug, content, category, is_published ? 1 : 0, meta_description || '', keywords || '', id]
        );

        // Notify Google
        if (is_published) {
            notifyGoogleIndexing(`https://officialum1.com/kb/${slug}`).catch(e => console.error(e));
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
