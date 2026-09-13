import fs from "fs";
import path from "path";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { query } from "@/lib/db";
import BlogProductCard from "@/components/BlogProductCard";
import { articleJsonLd, breadcrumbJsonLd, normalizeKeywords, stripHtml } from "@/lib/seo";
import { rankMathPostMetadata, rankMathSchemaEnabled } from "@/lib/rank-math-metadata";

type BlogPostRow = {
  id: string | number;
  title: string;
  category?: string;
  image?: string;
  excerpt?: string;
  content?: string;
  slug?: string;
  read_time?: string;
  readTime?: string;
  created_at?: string | Date;
  date?: string;
  meta_title?: string;
  meta_description?: string;
  focus_keyword?: string;
  seo_keywords?: string;
  canonical_url?: string;
  robots?: string;
  schema_type?: string;
};

import staticPosts from "@/data/posts.json";

async function getPost(slug: string): Promise<BlogPostRow | null> {
  try {
    const rows: any = await query("SELECT * FROM blogs WHERE id = ? OR slug = ?", [slug, slug]);
    if (Array.isArray(rows) && rows.length > 0) return rows[0];
  } catch {
    // Database query failed or unavailable
  }

  if (Array.isArray(staticPosts)) {
    const match = staticPosts.find(
      (p: any) => String(p.id) === slug || p.slug === slug
    );
    if (match) {
      return {
        id: match.id,
        title: match.title,
        category: match.category,
        image: match.image,
        excerpt: match.excerpt,
        content: match.content,
        slug: match.slug,
        read_time: match.readTime || match.read_time,
        date: match.date,
        meta_title: match.meta_title,
        meta_description: match.meta_description,
        schema_type: "BlogPosting",
        robots: "index,follow",
      };
    }
  }

  return null;
}

async function getFeaturedProduct(category?: string) {
  if (!category) return null;

  try {
    const productQuery = query(
      "SELECT * FROM products WHERE platform LIKE ? OR name LIKE ? ORDER BY id DESC LIMIT 1",
      [`%${category}%`, `%${category}%`],
    ).catch(() => []);

    const timeout = new Promise<any[]>((resolve) => {
      setTimeout(() => resolve([]), 2500);
    });

    const products: any = await Promise.race([productQuery, timeout]);
    return Array.isArray(products) && products.length > 0 ? products[0] : null;
  } catch {
    return null;
  }
}

function normalizeImage(image?: string) {
  const value = image?.trim();
  if (!value) return "/logo.jpg";
  if (value.startsWith("http")) return value;
  if (!value.startsWith("/")) return "/logo.jpg";

  const publicPath = path.join(process.cwd(), "public", value.replace(/^\/+/, ""));
  return fs.existsSync(publicPath) ? value : "/logo.jpg";
}

function absoluteImage(image?: string) {
  const normalized = normalizeImage(image);
  return normalized.startsWith("http") ? normalized : `https://officialum1.com${normalized}`;
}

function getPostDate(post: BlogPostRow) {
  if (post.date) return post.date;
  if (!post.created_at) return "Updated recently";

  return new Date(post.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getReadTime(post: BlogPostRow) {
  const value = (post.read_time || post.readTime || "5 min").trim();
  return value.toLowerCase().includes("read") ? value : `${value} read`;
}

function parseMarkdown(text: string) {
  if (!text) return "";

  let html = text
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/gim,
      '<a href="$2">$1</a>',
    )
    .replace(/\n\n/gim, "<br/><br/>");

  html = html.replace(/- (.*$)/gim, "<li>$1</li>");
  return sanitizeBlogHtml(html);
}

function sanitizeBlogHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?(html|head|body|main)[^>]*>/gi, "")
    .replace(/\s(?:class|style)=("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
      robots: { index: false, follow: true },
    };
  }

  const slugPath = post.slug || post.id;
  return rankMathPostMetadata(post);
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <main style={{ background: "var(--bg-base)", minHeight: "100vh", color: "var(--text-primary)" }}>
        <Navbar />
        <div className="container" style={{ paddingTop: "160px", paddingBottom: "100px", textAlign: "center" }}>
          <h1>Post not found</h1>
          <p style={{ color: "var(--text-muted)" }}>This article is unavailable or has been moved.</p>
        </div>
        <Footer />
      </main>
    );
  }

  const featuredProduct = await getFeaturedProduct(post.category);
  const image = normalizeImage(post.image);
  const canonicalSlug = post.slug || post.id;
  const htmlContent = parseMarkdown(post.content || "");
  const contentParts = htmlContent.split("</h2>");
  const hasH2 = contentParts.length > 1;
  const keywords = normalizeKeywords(post.seo_keywords, post.focus_keyword, post.category);
  const enableArticle = await rankMathSchemaEnabled("enable_article");
  const enableBreadcrumbs = await rankMathSchemaEnabled("enable_breadcrumbs");
  const graph = [
    ...(enableArticle
      ? [
          articleJsonLd({
            path: `/blog/${canonicalSlug}`,
            headline: post.title,
            description: post.meta_description || post.excerpt,
            image: post.image,
            schemaType: post.schema_type,
            datePublished: post.created_at,
            dateModified: post.created_at,
            category: post.category,
            keywords,
            wordCount: stripHtml(post.content || "").split(/\s+/).filter(Boolean).length,
          }),
        ]
      : []),
    ...(enableBreadcrumbs
      ? [
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${canonicalSlug}` },
          ]),
        ]
      : []),
  ];

  return (
    <main style={{ background: "var(--bg-base)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <Navbar />

      {graph.length > 0 ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      ) : null}

      <article className="blog-post-shell">
        <div className="container blog-post-container">
          <header className="blog-post-header">
            <a href="/blog" className="blog-post-back">
              Blog
            </a>
            <div className="blog-post-category">{post.category || "Growth"}</div>
            <h1>{post.title}</h1>
            <p>{post.excerpt}</p>
            <div className="blog-post-meta">
              <span>{getPostDate(post)}</span>
              <span>{getReadTime(post)}</span>
            </div>
          </header>

          <div className="blog-post-hero-image">
            <img src={image} alt={post.title} />
          </div>

          <div className="blog-post-content">
            {hasH2 ? (
              <>
                <div dangerouslySetInnerHTML={{ __html: `${contentParts[0]}</h2>` }} />
                {featuredProduct ? (
                  <BlogProductCard
                    id={featuredProduct.id}
                    name={featuredProduct.name}
                    price={featuredProduct.price}
                    platform={featuredProduct.platform}
                    image={featuredProduct.image}
                  />
                ) : null}
                <div dangerouslySetInnerHTML={{ __html: contentParts.slice(1).join("</h2>") }} />
              </>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            )}
          </div>

          {!hasH2 && featuredProduct ? (
            <BlogProductCard
              id={featuredProduct.id}
              name={featuredProduct.name}
              price={featuredProduct.price}
              platform={featuredProduct.platform}
              image={featuredProduct.image}
            />
          ) : null}
        </div>
      </article>

      <style dangerouslySetInnerHTML={{ __html: `
        .blog-post-shell {
          padding: 138px 0 100px;
          background: linear-gradient(180deg, #f7faf6 0%, #ffffff 100%);
        }

        .blog-post-container {
          max-width: 920px;
        }

        .blog-post-header {
          margin-bottom: 34px;
        }

        .blog-post-back {
          display: inline-flex;
          align-items: center;
          margin-bottom: 18px;
          color: var(--accent-blue);
          font-weight: 900;
          text-decoration: none;
        }

        .blog-post-category {
          display: inline-flex;
          border: 1px solid rgba(196, 71, 45, 0.28);
          border-radius: 999px;
          background: rgba(196, 71, 45, 0.10);
          color: #a83a26;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 900;
        }

        .blog-post-header h1 {
          margin: 18px 0 16px;
          color: var(--text-primary);
          font-size: clamp(34px, 5.6vw, 64px);
          font-weight: 900;
          line-height: 1.04;
          letter-spacing: 0;
          overflow-wrap: anywhere;
        }

        .blog-post-header p {
          max-width: 780px;
          margin: 0;
          color: var(--text-muted);
          font-size: 18px;
          line-height: 1.7;
        }

        .blog-post-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 22px;
          color: var(--text-muted);
          font-weight: 800;
        }

        .blog-post-meta span {
          border: 1px solid var(--border-subtle);
          border-radius: 999px;
          background: #ffffff;
          padding: 9px 13px;
        }

        .blog-post-hero-image {
          width: 100%;
          height: clamp(260px, 46vw, 470px);
          overflow: hidden;
          border: 1px solid var(--border-subtle);
          border-radius: 22px;
          background: #edf5f3;
          box-shadow: 0 20px 46px rgba(24, 32, 38, 0.08);
          margin-bottom: 42px;
        }

        .blog-post-hero-image img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .blog-post-content {
          border: 1px solid var(--border-subtle);
          border-radius: 22px;
          background: #ffffff !important;
          color: var(--text-muted) !important;
          padding: clamp(24px, 5vw, 54px);
          font-size: 18px;
          line-height: 1.82;
          box-shadow: 0 18px 42px rgba(24, 32, 38, 0.07);
        }

        .blog-post-content *,
        .blog-post-content section,
        .blog-post-content article,
        .blog-post-content div,
        .blog-post-content aside {
          max-width: 100%;
          color: var(--text-muted) !important;
          background-color: transparent !important;
          border-color: var(--border-subtle) !important;
          letter-spacing: 0 !important;
        }

        .blog-post-content h1,
        .blog-post-content h2,
        .blog-post-content h3 {
          color: var(--text-primary) !important;
          font-weight: 900;
          line-height: 1.18;
          letter-spacing: 0;
        }

        .blog-post-content h1 {
          font-size: 34px;
        }

        .blog-post-content h2 {
          margin: 38px 0 14px;
          font-size: clamp(28px, 4vw, 38px);
        }

        .blog-post-content h3 {
          margin: 30px 0 10px;
          font-size: 24px;
        }

        .blog-post-content p {
          margin: 0 0 18px;
          color: var(--text-muted) !important;
        }

        .blog-post-content blockquote,
        .blog-post-content pre,
        .blog-post-content code,
        .blog-post-content table,
        .blog-post-content ul,
        .blog-post-content ol {
          background: #f7faf6 !important;
          color: var(--text-muted) !important;
          border-color: var(--border-subtle) !important;
        }

        .blog-post-content strong {
          color: var(--text-primary) !important;
          font-weight: 900;
        }

        .blog-post-content a {
          color: var(--accent-blue) !important;
          font-weight: 900;
          text-decoration: underline;
          text-decoration-thickness: 2px;
          text-underline-offset: 3px;
        }

        .blog-post-content li {
          margin: 8px 0;
          padding-left: 4px;
        }

        @media (max-width: 640px) {
          .blog-post-shell {
            padding-top: 118px;
          }

          .blog-post-header h1 {
            font-size: 34px;
          }

          .blog-post-content {
            border-radius: 16px;
            font-size: 16.5px;
          }
        }
      ` }} />

      <Footer />
    </main>
  );
}
