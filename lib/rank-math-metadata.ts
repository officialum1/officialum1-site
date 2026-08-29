import type { Metadata } from "next";
import { applyTitleTemplate } from "@/lib/rank-math-config";
import { getRankMathConfig } from "@/lib/rank-math-server";
import { compactDescription, rankMathMetadata } from "@/lib/seo";

export async function rankMathHomeMetadata(): Promise<Metadata> {
  const rm = await getRankMathConfig();
  return rankMathMetadata({
    path: "/",
    title: rm.general.homepage_title,
    description: rm.general.homepage_description,
    fallbackDescription: rm.general.homepage_description,
    keywords: rm.general.homepage_keywords || rm.advanced.global_keywords,
    robots: rm.general.default_robots,
    ogImage: rm.advanced.og_default_image,
    type: "website",
  });
}

export async function rankMathPostMetadata(post: {
  title: string;
  excerpt?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  seo_keywords?: string | null;
  focus_keyword?: string | null;
  canonical_url?: string | null;
  robots?: string | null;
  image?: string | null;
  category?: string | null;
  slug?: string | number | null;
  id?: string | number;
  created_at?: string | Date | null;
  schema_type?: string | null;
}): Promise<Metadata> {
  const rm = await getRankMathConfig();
  const slugPath = post.slug || post.id;
  const templatedTitle = applyTitleTemplate(
    rm.titles.post_title_template,
    {
      title: post.title,
      sitename: rm.general.site_name,
      sep: rm.general.separator,
      excerpt: post.excerpt || "",
      category: post.category || "",
    },
    rm.general.separator
  );
  const templatedDescription = post.meta_description
    ? post.meta_description
    : applyTitleTemplate(
        rm.titles.post_description_template,
        {
          title: post.title,
          sitename: rm.general.site_name,
          sep: rm.general.separator,
          excerpt: compactDescription(post.excerpt, post.title),
          category: post.category || "",
        },
        rm.general.separator
      );

  return rankMathMetadata({
    path: `/blog/${slugPath}`,
    title: templatedTitle,
    description: post.excerpt,
    fallbackDescription: templatedDescription || `Read ${post.title} on ${rm.general.site_name}.`,
    seoTitle: post.meta_title || templatedTitle,
    seoDescription: post.meta_description || templatedDescription,
    keywords: post.seo_keywords,
    focusKeyword: post.focus_keyword,
    canonicalUrl: post.canonical_url,
    robots: post.robots || rm.general.default_robots,
    ogImage: post.image || rm.advanced.og_default_image,
    type: "article",
    publishedTime: post.created_at,
    modifiedTime: post.created_at,
    authors: [rm.knowledge_panel.founder_name],
  });
}

export async function rankMathProductMetadata(product: {
  id: string | number;
  name: string;
  description?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  focus_keyword?: string | null;
  canonical_url?: string | null;
  robots?: string | null;
  image?: string | null;
  platform?: string | null;
}): Promise<Metadata> {
  const rm = await getRankMathConfig();
  const templatedTitle = applyTitleTemplate(
    rm.titles.product_title_template,
    {
      title: product.name,
      sitename: rm.general.site_name,
      sep: rm.general.separator,
      category: product.platform || "",
    },
    rm.general.separator
  );

  return rankMathMetadata({
    path: `/shop/${product.id}`,
    title: templatedTitle,
    description: product.description,
    fallbackDescription: `Buy ${product.name} instantly at ${rm.general.site_name}.`,
    seoTitle: product.seo_title || templatedTitle,
    seoDescription: product.seo_description,
    keywords: product.seo_keywords,
    focusKeyword: product.focus_keyword,
    canonicalUrl: product.canonical_url,
    robots: product.robots || rm.general.default_robots,
    ogImage: product.image || rm.advanced.og_default_image,
    type: "website",
  });
}

export async function rankMathSchemaEnabled(
  key: keyof Awaited<ReturnType<typeof getRankMathConfig>>["schema"]
): Promise<boolean> {
  const rm = await getRankMathConfig();
  return !!rm.schema[key];
}
