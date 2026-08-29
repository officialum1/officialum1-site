import type { Metadata } from "next";

export const SITE_URL = "https://officialum1.com";

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.jpg`;

export type SeoRobotsValue =
  | "index,follow"
  | "noindex,follow"
  | "index,nofollow"
  | "noindex,nofollow";

export type RankMathSeoInput = {
  path: string;
  title: string;
  description?: string | null;
  fallbackDescription: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  keywords?: string | null;
  focusKeyword?: string | null;
  canonicalUrl?: string | null;
  robots?: string | null;
  ogImage?: string | null;
  type?: "website" | "article";
  publishedTime?: string | Date | null;
  modifiedTime?: string | Date | null;
  authors?: string[];
};

/** Next.js metadataBase + canonical per path */
export function canonicalPath(path: string): string {
  if (!path || path === "/") return SITE_URL;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

export function absoluteUrl(value?: string | null, fallback = "/logo.jpg"): string {
  const raw = value?.trim() || fallback;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${SITE_URL}${path}`;
}

export function stripHtml(value?: string | null): string {
  return (value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function compactDescription(value?: string | null, fallback = ""): string {
  const clean = stripHtml(value || fallback);
  if (clean.length <= 158) return clean;
  return `${clean.slice(0, 155).trim()}...`;
}

export function normalizeRobots(value?: string | null) {
  const raw = (value || "index,follow").toLowerCase();
  const noindex = raw.includes("noindex");
  const nofollow = raw.includes("nofollow");

  return {
    index: !noindex,
    follow: !nofollow,
    googleBot: {
      index: !noindex,
      follow: !nofollow,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  };
}

export function normalizeKeywords(...values: Array<string | null | undefined>): string | undefined {
  const keywords = values
    .flatMap((value) => (value || "").split(","))
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  return keywords.length ? Array.from(new Set(keywords)).join(", ") : undefined;
}

export function rankMathMetadata(opts: RankMathSeoInput): Metadata {
  const title = (opts.seoTitle || opts.title).trim();
  const description = compactDescription(opts.seoDescription || opts.description, opts.fallbackDescription);
  const canonical = opts.canonicalUrl?.trim() || canonicalPath(opts.path);
  const image = absoluteUrl(opts.ogImage);
  const keywords = normalizeKeywords(opts.keywords, opts.focusKeyword);

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical },
    robots: normalizeRobots(opts.robots),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "OfficialUM1",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      locale: "en_US",
      type: opts.type || "website",
      ...(opts.type === "article"
        ? {
            publishedTime: opts.publishedTime ? new Date(opts.publishedTime).toISOString() : undefined,
            modifiedTime: opts.modifiedTime ? new Date(opts.modifiedTime).toISOString() : undefined,
            authors: opts.authors,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@officialum1",
      images: [image],
    },
  };
}

export function pageMetadata(opts: {
  path: string;
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  type?: "website" | "article";
  noindex?: boolean;
}): Metadata {
  const url = canonicalPath(opts.path);
  const ogImage = opts.ogImage || "/logo.jpg";
  const absImage = ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage.startsWith("/") ? "" : "/"}${ogImage}`;

  return {
    title: opts.title,
    description: opts.description,
    ...(opts.keywords ? { keywords: opts.keywords } : {}),
    alternates: { canonical: url },
    robots: opts.noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: "OfficialUM1",
      images: [{ url: absImage, width: 1200, height: 630, alt: opts.title }],
      locale: "en_US",
      type: opts.type || "website",
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      creator: "@officialum1",
      images: [absImage],
    },
  };
}

export function webPageJsonLd(opts: {
  path: string;
  name: string;
  description: string;
  type?: string;
}) {
  const url = canonicalPath(opts.path);
  return {
    "@context": "https://schema.org",
    "@type": opts.type || "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: opts.name,
    description: opts.description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    inLanguage: "en",
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: canonicalPath(it.path),
    })),
  };
}

export function articleJsonLd(opts: {
  path: string;
  headline: string;
  description?: string | null;
  image?: string | null;
  schemaType?: string | null;
  datePublished?: string | Date | null;
  dateModified?: string | Date | null;
  authorName?: string;
  category?: string | null;
  keywords?: string | null;
  wordCount?: number;
}) {
  const url = canonicalPath(opts.path);
  return {
    "@context": "https://schema.org",
    "@type": opts.schemaType || "BlogPosting",
    "@id": `${url}#article`,
    headline: opts.headline,
    description: compactDescription(opts.description, opts.headline),
    image: absoluteUrl(opts.image),
    datePublished: opts.datePublished ? new Date(opts.datePublished).toISOString() : new Date().toISOString(),
    dateModified: opts.dateModified ? new Date(opts.dateModified).toISOString() : new Date().toISOString(),
    articleSection: opts.category || "Digital Marketing",
    keywords: opts.keywords || undefined,
    wordCount: opts.wordCount || undefined,
    inLanguage: "en",
    author: {
      "@type": "Person",
      name: opts.authorName || "Muhammad Umar Mumtaz",
      url: `${SITE_URL}/#founder`,
    },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

export function productJsonLd(product: any, opts?: { reviewCount?: number; avgRating?: number }) {
  const priceVal = product.sale_price || product.price;
  const priceNum = typeof priceVal === "string" ? parseFloat(priceVal.replace(/[^0-9.]/g, "")) : Number(priceVal);
  const url = `${SITE_URL}/shop/${product.id}`;
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": product.schema_type === "Service" ? "Service" : "Product",
    "@id": `${url}#product`,
    name: product.name,
    image: absoluteUrl(product.image),
    description: compactDescription(product.seo_description || product.description, `Buy ${product.name} from OfficialUM1.`),
    sku: String(product.id),
    url,
    brand: {
      "@type": "Brand",
      name: product.platform || "OfficialUM1",
    },
    seller: { "@id": ORG_ID },
  };

  if (jsonLd["@type"] === "Product") {
    jsonLd.offers = {
      "@type": "Offer",
      url,
      priceCurrency: "USD",
      price: Number.isFinite(priceNum) ? priceNum : 0,
      availability:
        Number(product.stock) > 0 || Number(product.inventoryStock) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@id": ORG_ID },
    };
  } else {
    jsonLd.provider = { "@id": ORG_ID };
    jsonLd.areaServed = "Worldwide";
  }

  if (opts?.reviewCount && opts.avgRating) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: String(opts.avgRating),
      reviewCount: String(opts.reviewCount),
      bestRating: "5",
      worstRating: "1",
    };
  }

  return jsonLd;
}

export function shopItemListJsonLd(products: any[], maxItems = 48) {
  const slice = products.slice(0, maxItems);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Digital products and accounts",
    numberOfItems: slice.length,
    itemListElement: slice.map((p: any, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/shop/${p.id}`,
      name: p.name,
    })),
  };
}
