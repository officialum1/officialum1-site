import { MetadataRoute } from 'next';
import { query } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://officialum1.com';

    // Static Pages
    const routes: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1, },
        { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8, },
        { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9, },
        { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7, },
        { url: `${baseUrl}/reviews`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6, },
        { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5, },
        { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5, },
        { url: `${baseUrl}/refer`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6, },
        { url: `${baseUrl}/tools/password-generator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7, },
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

        return [...routes, ...productUrls, ...kbUrls];
    } catch (error) {
        console.error("Sitemap Generation Error:", error);
        return routes;
    }
}
