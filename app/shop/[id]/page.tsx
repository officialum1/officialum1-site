import { Metadata } from 'next';
export const dynamic = 'force-dynamic';
import { query } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductClient from '@/components/ProductClient';
import Script from 'next/script';
import Link from 'next/link';
import { breadcrumbJsonLd, productJsonLd } from '@/lib/seo';
import { rankMathProductMetadata, rankMathSchemaEnabled } from '@/lib/rank-math-metadata';

// Fetch product helper
async function getProduct(id: string) {
    try {
        const rows = await query("SELECT * FROM products WHERE id = ?", [id]) as any[];
        return rows[0] || null;
    } catch (e) {
        return null;
    }
}

async function getProductReviewStats(productId: string | number) {
    try {
        const rows = await query(
            "SELECT COUNT(*) as c, AVG(rating) as avgRating FROM reviews WHERE status = 'approved' AND product_id = ?",
            [productId]
        ) as any[];
        const row = rows[0];
        const count = Number(row?.c || 0);
        const avg = row?.avgRating != null ? Number(row.avgRating) : 0;
        return { count, avg: Math.round(avg * 10) / 10 };
    } catch {
        return { count: 0, avg: 0 };
    }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const product = await getProduct(id);
    if (!product) {
        return {
            title: 'Product Not Found | OfficialUM1',
            description: 'The requested product could not be found.',
            robots: { index: false, follow: true },
        };
    }
    return rankMathProductMetadata(product);
}

export default async function SingleProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        return (
            <main>
                <Navbar />
                <div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>
                    <h1>Product Not Found</h1>
                    <Link href="/shop" className="btn btn-primary" style={{ marginTop: '2rem' }}>Back to Shop</Link>
                </div>
                <Footer />
            </main>
        );
    }

    // Fetch Bundle Contents
    let bundleContents: any[] = [];
    if (product.bundle_items) {
        try {
            const bundleIds = JSON.parse(product.bundle_items);
            if (Array.isArray(bundleIds) && bundleIds.length > 0) {
                // Determine placeholders
                const placeholders = bundleIds.map(() => '?').join(',');
                bundleContents = await query(`SELECT * FROM products WHERE id IN (${placeholders})`, bundleIds) as any[];
            }
        } catch (e) {
            console.error("Bundle Fetch Error", e);
        }
    }

    const reviewStats = await getProductReviewStats(product.id);
    const enableProduct = await rankMathSchemaEnabled('enable_product');
    const enableBreadcrumbs = await rankMathSchemaEnabled('enable_breadcrumbs');
    const enableFaq = await rankMathSchemaEnabled('enable_faq');

    const jsonLd = enableProduct
        ? productJsonLd(product, { reviewCount: reviewStats.count, avgRating: reviewStats.avg })
        : null;
    const breadcrumbSchema = enableBreadcrumbs
        ? breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: product.name, path: `/shop/${product.id}` },
        ])
        : null;

    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How long does delivery take?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Delivery is instant for most account types. Once your payment is confirmed, you will receive the credentials immediately via email and in your user dashboard."
                }
            },
            {
                "@type": "Question",
                "name": "Are these accounts safe to use?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, all our accounts are aged and verified to ensure maximum security and longevity. We follow strict safety protocols during the creation and aging process."
                }
            },
            {
                "@type": "Question",
                "name": "Do you offer a warranty?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, we provide a replacement warranty for all our products. If you encounter any issues with your purchase, our support team is available 24/7 to assist you."
                }
            }
        ]
    };

    return (
        <main>
            <Navbar />

            {jsonLd ? (
            <Script
                id="product-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            ) : null}
            {breadcrumbSchema ? (
            <Script
                id="product-breadcrumb-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            ) : null}
            {enableFaq ? (
            <Script
                id="faq-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            ) : null}

            <ProductClient product={product} bundleContents={bundleContents} />

            <Footer />
        </main>
    );
}
