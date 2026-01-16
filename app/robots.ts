import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/admin/'],
        },
        sitemap: 'https://officialum1.com/sitemap.xml',
        host: 'https://officialum1.com',
    };
}
