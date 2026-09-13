import { MetadataRoute } from 'next';
import { query } from '@/lib/db';

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
        { url: `${baseUrl}/services/guest-posting`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
        { url: `${baseUrl}/services/wordpress-speed-optimization`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/services/seo-services-usa`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/services/seo-services-uk`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/services/white-label-seo`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/services/outsource-web-development`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
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

    try {
        // Fetch Products
        const products = await query("SELECT id, created_at FROM products") as any[];
        const productUrls = products.map((product) => ({
            url: `${baseUrl}/shop/${product.id}`,
            lastModified: new Date(product.created_at || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

        // Fetch KB Articles
        const articles = await query("SELECT slug, created_at FROM knowledge_base WHERE is_published = 1") as any[];
        const kbUrls = articles.map((art) => ({
            url: `${baseUrl}/kb/${art.slug}`,
            lastModified: new Date(art.created_at || new Date()),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        }));

        // Fetch Blog Posts
        const blogs = await query("SELECT id, slug, created_at FROM blogs") as any[];
        const blogUrls = blogs.map((blog) => ({
            url: `${baseUrl}/blog/${blog.slug || blog.id}`,
            lastModified: new Date(blog.created_at || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

        return [...routes, ...productUrls, ...kbUrls, ...blogUrls];
    } catch (error) {
        console.error("Sitemap Generation Error:", error);
        return routes;
    }
}
