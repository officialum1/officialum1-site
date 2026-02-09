import { Metadata } from 'next';
export const dynamic = 'force-dynamic';
import { query } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductClient from '@/components/ProductClient';
import Script from 'next/script';
import Link from 'next/link';

// Fetch product helper
async function getProduct(id: string) {
    try {
        const rows = await query("SELECT * FROM products WHERE id = ?", [id]) as any[];
        return rows[0] || null;
    } catch (e) {
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const product = await getProduct(id);
    if (!product) {
        return {
            title: 'Product Not Found | OfficialUM1',
            description: 'The requested product could not be found.'
        };
    }
    return {
        title: `${product.name} | Buy Instantly`,
        description: product.description || `Buy ${product.name} instantly with automatic delivery. Best price and warranty guaranteed.`,
        openGraph: {
            title: product.name,
            description: product.description,
            images: [product.image || '/logo.jpg'],
            type: 'website'
        }
    };
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

    // Schema Markup (Product)
    const jsonLd = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": product.image ? `https://officialum1.com${product.image}` : "https://officialum1.com/logo.jpg",
        "description": product.description,
        "sku": product.id,
        "brand": {
            "@type": "Brand",
            "name": product.platform || "OfficialUM1"
        },
        "offers": {
            "@type": "Offer",
            "url": `https://officialum1.com/shop/${product.id}`,
            "priceCurrency": "USD",
            "price": product.sale_price || product.price,
            "availability": (Number(product.stock) > 0 || Number(product.inventoryStock) > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
                "@type": "Organization",
                "name": "OfficialUM1"
            }
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "120"
        }
    };

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

            <Script
                id="product-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Script
                id="faq-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />

            <ProductClient product={product} bundleContents={bundleContents} />

            <Footer />
        </main>
    );
}
