import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { notifyGoogleIndexing } from '@/lib/google-indexing';
import { ensureSeoColumns } from '@/lib/seo-db';

function slugify(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export async function GET() {
    try {
        const rows: any = await query("SELECT * FROM blogs ORDER BY created_at DESC");
        const formatted = rows.map((p: any) => ({
            id: p.id,
            title: p.title,
            category: p.category || 'Growth',
            image: p.image,
            excerpt: p.excerpt,
            content: p.content,
            slug: p.slug,
            read_time: p.read_time,
            meta_title: p.meta_title,
            meta_description: p.meta_description,
            focus_keyword: p.focus_keyword,
            seo_keywords: p.seo_keywords,
            canonical_url: p.canonical_url,
            robots: p.robots || 'index,follow',
            schema_type: p.schema_type || 'BlogPosting',
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
        await ensureSeoColumns();
        const body = await request.json();

        // Handle Delete
        if (body.action === 'delete') {
            await query("DELETE FROM blogs WHERE id = ?", [body.id]);
            return NextResponse.json({ success: true });
        }

        // Handle Create
        let slug = body.slug?.trim();
        if (!slug && body.title) {
            slug = slugify(body.title);
        }

        const category = body.category?.trim() || 'Growth';
        const readTime = body.read_time || body.readTime || '5 min';
        const robots = body.robots || 'index,follow';
        const schemaType = body.schema_type || 'BlogPosting';

        const res: any = await query(
            `INSERT INTO blogs (
                title, category, image, excerpt, content, slug, read_time,
                meta_title, meta_description, focus_keyword, seo_keywords,
                canonical_url, robots, schema_type, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                body.title,
                category,
                body.image,
                body.excerpt,
                body.content,
                slug,
                readTime,
                body.meta_title || body.metaTitle || null,
                body.meta_description || body.metaDescription || null,
                body.focus_keyword || body.focusKeyword || null,
                body.seo_keywords || body.keywords || null,
                body.canonical_url || body.canonicalUrl || null,
                robots,
                schemaType,
            ]
        );

        const newPost = {
            ...body,
            category,
            id: res.insertId,
            slug,
            read_time: readTime,
            robots,
            schema_type: schemaType,
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

export async function DELETE(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        await query("DELETE FROM blogs WHERE id = ?", [body.id]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
