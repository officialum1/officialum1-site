import fs from 'fs';
import path from 'path';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

async function getPost(id: string) {
    const filePath = path.join(process.cwd(), 'data', 'posts.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const posts = JSON.parse(fileContents);
    return posts.find((p: any) => p.id.toString() === id);
}

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

                <div
                    className="blog-content"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                    style={{ fontSize: '1.2rem', lineHeight: 1.8, color: '#ddd' }}
                />
            </div>
            <Footer />
        </main>
    );
}
