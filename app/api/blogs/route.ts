import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { notifyGoogleIndexing } from '@/lib/google-indexing';

export async function GET() {
    try {
        const rows: any = await query("SELECT * FROM blogs ORDER BY created_at DESC");
        const formatted = rows.map((p: any) => ({
            id: p.id,
            title: p.title,
            category: p.category,
            image: p.image,
            excerpt: p.excerpt,
            content: p.content,
            slug: p.slug,
            read_time: p.read_time,
            date: new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }));
        return NextResponse.json(formatted);
    } catch (error) {
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Handle Delete
        if (body.action === 'delete') {
            await query("DELETE FROM blogs WHERE id = ?", [body.id]);
            return NextResponse.json({ success: true });
        }

        // Handle Create
        let slug = body.slug;
        if (!slug && body.title) {
            slug = body.title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }

        const res: any = await query(
            "INSERT INTO blogs (title, category, image, excerpt, content, slug, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
            [body.title, body.category, body.image, body.excerpt, body.content, slug]
        );

        const newPost = {
            ...body,
            id: res.insertId,
            slug: slug,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        };

        // Notify Google (Async, don't wait for response to return faster to user)
        if (slug) {
            notifyGoogleIndexing(`https://officialum1.com/blog/${slug}`).catch(e => console.error(e));
        }

        return NextResponse.json(newPost);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
