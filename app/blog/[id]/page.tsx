import fs from 'fs';
import path from 'path';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { query } from '@/lib/db';
import BlogProductCard from '@/components/BlogProductCard';

async function getPost(id: string) {
    const filePath = path.join(process.cwd(), 'data', 'posts.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const posts = JSON.parse(fileContents);
    return posts.find((p: any) => p.id.toString() === id);
}

// ... duplicate getPost removed above for cleanliness in actual tool call

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await getPost(id);
    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }
    return {
        title: `${post.title} | OfficialUM1 Blog`,
        description: post.excerpt,
        openGraph: {
            images: [post.image || '/logo.jpg'],
        }
    };
}

export default async function BlogPost({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await getPost(id);

    if (!post) {
        return <div style={{ padding: '100px', textAlign: 'center' }}>Post not found</div>;
    }

    // Find a relevant product based on category
    const products = await query("SELECT * FROM products WHERE platform LIKE ? OR name LIKE ? ORDER BY RAND() LIMIT 1", [`%${post.category}%`, `%${post.category}%`]) as any[];
    const featuredProduct = products[0];

    // Split content to insert banner in the middle (after first <h2> or first 4 paragraphs)
    const contentParts = post.content.split('</h2>');
    const hasH2 = contentParts.length > 1;

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px', maxWidth: '800px' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <span style={{ color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>{post.category}</span>
                    <h1 style={{ fontSize: '3rem', marginTop: '0.5rem', lineHeight: 1.2 }}>{post.title}</h1>
                    <div style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>{post.date} • {post.readTime}</div>
                </div>

                {post.image && (
                    <div style={{ width: '100%', height: '400px', borderRadius: '20px', overflow: 'hidden', marginBottom: '3rem' }}>
                        <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}

                <div className="blog-content" style={{ fontSize: '1.2rem', lineHeight: 1.8, color: '#ddd' }}>
                    {hasH2 ? (
                        <>
                            <div dangerouslySetInnerHTML={{ __html: contentParts[0] + '</h2>' }} />
                            {featuredProduct && (
                                <BlogProductCard
                                    id={featuredProduct.id}
                                    name={featuredProduct.name}
                                    price={featuredProduct.price}
                                    platform={featuredProduct.platform}
                                    image={featuredProduct.image}
                                />
                            )}
                            <div dangerouslySetInnerHTML={{ __html: contentParts.slice(1).join('</h2>') }} />
                        </>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    )}
                </div>

                {!hasH2 && featuredProduct && (
                    <BlogProductCard
                        id={featuredProduct.id}
                        name={featuredProduct.name}
                        price={featuredProduct.price}
                        platform={featuredProduct.platform}
                        image={featuredProduct.image}
                    />
                )}
            </div>
            <Footer />
        </main>
    );
}
