import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import staticPosts from '@/data/posts.json';
import { submitToIndexNow, INDEXNOW_HOST, INDEXNOW_KEY, INDEXNOW_KEY_LOCATION } from '@/lib/indexnow';

export const dynamic = 'force-dynamic';

async function getAllSiteUrls(): Promise<string[]> {
    const baseUrl = `https://${INDEXNOW_HOST}`;

    // 1. Core static routes
    const coreRoutes = [
        `${baseUrl}/`,
        `${baseUrl}/services`,
        `${baseUrl}/services/digital-marketing-agency-in-pakistan`,
        `${baseUrl}/services/digital-marketing-sahiwal`,
        `${baseUrl}/services/seo-services-sahiwal`,
        `${baseUrl}/services/web-design-sahiwal`,
        `${baseUrl}/services/social-media-sahiwal`,
        `${baseUrl}/services/guest-posting`,
        `${baseUrl}/download-app`,
        `${baseUrl}/services/niche-edits`,
        `${baseUrl}/services/crypto-guest-posting`,
        `${baseUrl}/services/press-release-distribution`,
        `${baseUrl}/services/local-citations`,
        `${baseUrl}/services/wordpress-speed-optimization`,
        `${baseUrl}/services/wordpress-malware-removal`,
        `${baseUrl}/services/wordpress-to-nextjs-migration`,
        `${baseUrl}/services/website-maintenance`,
        `${baseUrl}/services/ecommerce-cro`,
        `${baseUrl}/services/local-seo`,
        `${baseUrl}/services/web-development-usa`,
        `${baseUrl}/services/wordpress-speed-optimization-uk`,
        `${baseUrl}/services/seo-services-dubai`,
        `${baseUrl}/services/seo-services-usa`,
        `${baseUrl}/services/seo-services-uk`,
        `${baseUrl}/services/white-label-seo`,
        `${baseUrl}/services/outsource-web-development`,
        `${baseUrl}/tools/speed-audit`,
        `${baseUrl}/shop`,
        `${baseUrl}/blog`,
        `${baseUrl}/reviews`,
        `${baseUrl}/about`,
        `${baseUrl}/faq`,
        `${baseUrl}/store`,
        `${baseUrl}/bundles`,
        `${baseUrl}/refer`,
        `${baseUrl}/contact`,
        `${baseUrl}/work`,
        `${baseUrl}/team`,
        `${baseUrl}/tools/password-generator`,
        `${baseUrl}/privacy`,
        `${baseUrl}/terms`,
        `${baseUrl}/refund`,
        `${baseUrl}/delivery-policy`,
        `${baseUrl}/help`,
        `${baseUrl}/support`,
        `${baseUrl}/membership`,
        `${baseUrl}/builder`,
        `${baseUrl}/share-experience`,
        `${baseUrl}/services/form-business`,
        `${baseUrl}/services/uk-company-formation`,
        `${baseUrl}/kb`,
    ];

    const dynamicUrls: string[] = [];

    // 2. Static Posts fallback
    if (Array.isArray(staticPosts)) {
        for (const post of staticPosts) {
            const slug = post.slug || post.id;
            if (slug) dynamicUrls.push(`${baseUrl}/blog/${slug}`);
        }
    }

    // 3. Database entities
    try {
        const [blogs, products, kb] = await Promise.all([
            query("SELECT id, slug FROM blogs").catch(() => []) as Promise<any[]>,
            query("SELECT id FROM products").catch(() => []) as Promise<any[]>,
            query("SELECT slug FROM knowledge_base WHERE is_published = 1").catch(() => []) as Promise<any[]>,
        ]);

        if (Array.isArray(blogs)) {
            for (const b of blogs) {
                const slug = b.slug || b.id;
                if (slug) dynamicUrls.push(`${baseUrl}/blog/${slug}`);
            }
        }

        if (Array.isArray(products)) {
            for (const p of products) {
                if (p.id) dynamicUrls.push(`${baseUrl}/shop/${p.id}`);
            }
        }

        if (Array.isArray(kb)) {
            for (const k of kb) {
                if (k.slug) dynamicUrls.push(`${baseUrl}/kb/${k.slug}`);
            }
        }
    } catch (e: any) {
        console.error('[CRON INDEXNOW] Error fetching dynamic URLs:', e.message);
    }

    // Deduplicate all URLs
    return Array.from(new Set([...coreRoutes, ...dynamicUrls]));
}

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        // If CRON_SECRET is configured, check authorization (e.g. Vercel Cron)
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            // Check query param fallback
            const { searchParams } = new URL(req.url);
            if (searchParams.get('key') !== cronSecret && searchParams.get('key') !== INDEXNOW_KEY) {
                return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
            }
        }

        const urls = await getAllSiteUrls();
        const results = await submitToIndexNow(urls);

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            host: INDEXNOW_HOST,
            keyLocation: INDEXNOW_KEY_LOCATION,
            totalUrls: urls.length,
            results,
        });
    } catch (error: any) {
        console.error('[CRON INDEXNOW] Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    return GET(req);
}
