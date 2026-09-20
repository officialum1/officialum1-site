import { MetadataRoute } from 'next';
import { query } from '@/lib/db';
import staticPosts from '@/data/posts.json';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://officialum1.com';

    // Static Pages
    const routes: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'always', priority: 1, },
        { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9, },
        { url: `${baseUrl}/services/digital-marketing-sahiwal`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
        { url: `${baseUrl}/services/seo-services-sahiwal`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
        { url: `${baseUrl}/services/web-design-sahiwal`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
        { url: `${baseUrl}/services/social-media-sahiwal`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/services/guest-posting`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/download-app`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/services/niche-edits`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/services/crypto-guest-posting`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/services/press-release-distribution`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/services/local-citations`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/services/wordpress-speed-optimization`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/services/wordpress-malware-removal`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/services/wordpress-to-nextjs-migration`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/services/website-maintenance`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
        { url: `${baseUrl}/services/ecommerce-cro`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
        { url: `${baseUrl}/services/local-seo`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
        { url: `${baseUrl}/services/web-development-usa`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/services/wordpress-speed-optimization-uk`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/services/seo-services-dubai`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/press`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
        { url: `${baseUrl}/press/officialum1-launches-nextjs-speed-architecture-2026`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
        { url: `${baseUrl}/services/seo-services-usa`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/services/seo-services-uk`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/services/white-label-seo`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/services/outsource-web-development`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/tools/speed-audit`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
        { url: `${baseUrl}/reviews`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
        { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9, },
        { url: `${baseUrl}/store`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8, },
        { url: `${baseUrl}/bundles`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8, },
        { url: `${baseUrl}/refer`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6, },
        { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6, },
        { url: `${baseUrl}/work`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        { url: `${baseUrl}/tools/password-generator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7, },
        { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
        { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
        { url: `${baseUrl}/refund`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
        { url: `${baseUrl}/delivery-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
        { url: `${baseUrl}/help`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
        { url: `${baseUrl}/support`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
        { url: `${baseUrl}/membership`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/builder`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/share-experience`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/services/form-business`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.65 },
        { url: `${baseUrl}/kb`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    ];

    // Fallback/Default blog entries from posts.json
    const staticBlogUrls: MetadataRoute.Sitemap = Array.isArray(staticPosts)
        ? staticPosts.map((post: any) => ({
            url: `${baseUrl}/blog/${post.slug || post.id}`,
            lastModified: new Date(post.date ? new Date(post.date) : new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }))
        : [];

    try {
        // Fetch Products
        const products = await query("SELECT id, created_at FROM products") as any[];
        const productUrls: MetadataRoute.Sitemap = Array.isArray(products)
            ? products.map((product) => ({
                url: `${baseUrl}/shop/${product.id}`,
                lastModified: new Date(product.created_at || new Date()),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            }))
            : [];

        // Fetch KB Articles
        const articles = await query("SELECT slug, created_at FROM knowledge_base WHERE is_published = 1") as any[];
        const kbUrls: MetadataRoute.Sitemap = Array.isArray(articles)
            ? articles.map((art) => ({
                url: `${baseUrl}/kb/${art.slug}`,
                lastModified: new Date(art.created_at || new Date()),
                changeFrequency: 'monthly' as const,
                priority: 0.7,
            }))
            : [];

        // Fetch DB Blog Posts
        let dbBlogs: any[] = [];
        try {
            dbBlogs = await query("SELECT id, slug, created_at FROM blogs") as any[];
        } catch {
            dbBlogs = [];
        }

        const dbBlogUrls: MetadataRoute.Sitemap = (dbBlogs && dbBlogs.length > 0)
            ? dbBlogs.map((blog) => ({
                url: `${baseUrl}/blog/${blog.slug || blog.id}`,
                lastModified: new Date(blog.created_at || new Date()),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            }))
            : [];

        // Deduplicate blogs by URL
        const allBlogUrlsMap = new Map<string, MetadataRoute.Sitemap[number]>();
        for (const item of [...staticBlogUrls, ...dbBlogUrls]) {
            allBlogUrlsMap.set(item.url, item);
        }

        return [...routes, ...productUrls, ...kbUrls, ...Array.from(allBlogUrlsMap.values())];
    } catch {
        return [...routes, ...staticBlogUrls];
    }
}
