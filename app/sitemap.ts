import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://officialum1.com';

    // Static Pages — always returned even if DB is unreachable
    const routes: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'always', priority: 1, },
        { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8, },
        { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'always', priority: 0.9, },
        { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8, },
        { url: `${baseUrl}/reviews`, lastModified: new Date(), changeFrequency: 'always', priority: 0.9, },
        { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0, },
        { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9, },
        { url: `${baseUrl}/store`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8, },
        { url: `${baseUrl}/bundles`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8, },
        { url: `${baseUrl}/refer`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6, },
        { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5, },
        { url: `${baseUrl}/tools/password-generator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7, },
    ];

    // Only attempt DB queries at runtime (not during build)
    if (process.env.NODE_ENV === 'production' && process.env.DB_HOST) {
        try {
            const { query } = await import('@/lib/db');

            const [products, articles, blogs] = await Promise.allSettled([
                query("SELECT id, created_at FROM products") as Promise<any[]>,
                query("SELECT slug, created_at FROM knowledge_base WHERE is_published = 1") as Promise<any[]>,
                query("SELECT id, slug, created_at FROM blogs") as Promise<any[]>,
            ]);

            if (products.status === 'fulfilled') {
                products.value.forEach((product: any) => {
                    routes.push({
                        url: `${baseUrl}/shop/${product.id}`,
                        lastModified: new Date(product.created_at || new Date()),
                        changeFrequency: 'weekly',
                        priority: 0.8,
                    });
                });
            }

            if (articles.status === 'fulfilled') {
                articles.value.forEach((art: any) => {
                    routes.push({
                        url: `${baseUrl}/kb/${art.slug}`,
                        lastModified: new Date(art.created_at || new Date()),
                        changeFrequency: 'monthly',
                        priority: 0.7,
                    });
                });
            }

            if (blogs.status === 'fulfilled') {
                blogs.value.forEach((blog: any) => {
                    routes.push({
                        url: `${baseUrl}/blog/${blog.slug || blog.id}`,
                        lastModified: new Date(blog.created_at || new Date()),
                        changeFrequency: 'weekly',
                        priority: 0.8,
                    });
                });
            }
        } catch (error) {
            console.warn("Sitemap: DB unavailable, returning static routes only.", error);
        }
    }

    return routes;
}
