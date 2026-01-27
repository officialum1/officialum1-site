import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const kb = await query("SELECT * FROM knowledge_base ORDER BY created_at DESC");
        return NextResponse.json(kb);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, title, content, category, is_published, id } = body;

        if (action === 'create') {
            const slug = (title || "").toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            await query(
                "INSERT INTO knowledge_base (title, slug, content, category, is_published) VALUES (?, ?, ?, ?, ?)",
                [title, slug, content, category, is_published ? 1 : 0]
            );
            return NextResponse.json({ success: true });
        }

        if (action === 'update') {
            await query(
                "UPDATE knowledge_base SET title = ?, content = ?, category = ?, is_published = ? WHERE id = ?",
                [title, content, category, is_published ? 1 : 0, id]
            );
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        await query("DELETE FROM knowledge_base WHERE id = ?", [body.id]);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
