import { query } from '@/lib/db';
import { Metadata, ResolvingMetadata } from 'next';

export default async function sitemap() {
    const products: any = await query("SELECT id, name FROM products");
    const blogs: any = await query("SELECT id, title FROM blogs");
    // Assuming you have 'slug' or just using ID for blogs

    const baseUrl = 'https://officialum1.com';

    const productUrls = products.map((product: any) => ({
        url: `${baseUrl}/shop/${product.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    // If you have blog slugs
    /* const blogUrls = blogs.map((post: any) => ({
        url: `${baseUrl}/blog/${post.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
    })); */

    // Fetch Knowledge Base Articles
    const kbArticles: any = await query("SELECT slug, created_at FROM knowledge_base WHERE is_published = 1");

    const kbUrls = kbArticles.map((article: any) => ({
        url: `${baseUrl}/help/${article.slug}`,
        lastModified: new Date(article.created_at),
        changeFrequency: 'monthly',
        priority: 0.6,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/shop`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/help`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        ...productUrls,
        ...kbUrls,
        // ...blogUrls
    ];
}
