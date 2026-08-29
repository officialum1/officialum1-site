import type { Metadata } from "next";
import BlogPageClient from "@/components/BlogPageClient";
import { getBlogsForListing } from "@/lib/blogs-listing";
import { SITE_URL, breadcrumbJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

const title = "Blog - SEO, Growth & Digital Strategy | OfficialUM1";
const description =
  "OfficialUM1 blog: SEO tactics, web performance, digital marketing playbooks, and growth notes for founders and agencies.";

function absoluteBlogImage(image?: string) {
  const value = image?.trim();
  if (!value) return `${SITE_URL}/logo.jpg`;
  if (value.startsWith("http")) return value;
  if (value.startsWith("/images/catalog/") || value === "/logo.jpg") return `${SITE_URL}${value}`;
  return `${SITE_URL}/logo.jpg`;
}

export const metadata: Metadata = pageMetadata({
  path: "/blog",
  title,
  description,
  keywords: "OfficialUM1 blog, SEO blog Pakistan, digital marketing articles, web development tips",
});

export default async function BlogPage() {
  const posts = await getBlogsForListing();

  const blogList = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog#blog`,
    name: "OfficialUM1 Blog",
    description,
    url: `${SITE_URL}/blog`,
    publisher: { "@id": `${SITE_URL}/#organization` },
    blogPost: posts.slice(0, 24).map((p: any) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.excerpt,
      url: `${SITE_URL}/blog/${p.slug || p.id}`,
      image: absoluteBlogImage(p.image),
    })),
  };

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      webPageJsonLd({
        path: "/blog",
        name: title,
        description,
        type: "CollectionPage",
      }),
      blogList,
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
      ]),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <BlogPageClient initialPosts={posts} />
    </>
  );
}
