import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const BASE_URL = 'https://officialum1.com';

export async function GET() {
    try {
        const products = await query('SELECT id, name, created_at FROM products WHERE stock > 0') as any[]; // Assuming stock > 0 means in stock
        const blogs = await query('SELECT id, title, created_at FROM blogs') as any[];
        const kb = await query('SELECT slug, created_at FROM knowledge_base WHERE is_published = 1') as any[]; // is_published exists in KB schema

        const staticPages = ['', 'shop', 'services', 'contact', 'blog', 'help'];

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticPages.map(page => `
    <url>
        <loc>${BASE_URL}/${page}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>${page === '' ? '1.0' : '0.8'}</priority>
    </url>
    `).join('')}

    ${products.map(p => `
    <url>
        <loc>${BASE_URL}/shop/${p.id}</loc>
        <lastmod>${new Date(p.created_at).toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    `).join('')}

    ${blogs.map(b => `
    <url>
        <loc>${BASE_URL}/blog/${b.id}</loc>
        <lastmod>${new Date(b.created_at).toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    `).join('')}

    ${kb.map(k => `
    <url>
        <loc>${BASE_URL}/help/${k.slug}</loc>
        <lastmod>${new Date(k.created_at).toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
    `).join('')}
</urlset>`;

        return new NextResponse(sitemap, {
            headers: {
                'Content-Type': 'application/xml',
            },
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
