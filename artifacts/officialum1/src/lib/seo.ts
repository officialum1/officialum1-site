// ─────────────────────────────────────────────────────────────────────────────
// Centralized SEO utilities for OfficialUM1
// ─────────────────────────────────────────────────────────────────────────────

export const SITE_NAME = "OfficialUM1";
export const SITE_URL = "https://officialum1.com";
export const SITE_DESCRIPTION =
  "OfficialUM1 is a premium digital marketplace for aged social media accounts and a full-service digital agency offering SEO, web development, and US business formation.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph.jpg`;
export const BRAND_TWITTER = "@OfficialUM1";

// ── Title helpers ─────────────────────────────────────────────────────────────

export function makeTitle(pageTitle?: string): string {
  if (!pageTitle) return `${SITE_NAME} — Premium Digital Marketplace & Agency`;
  return `${pageTitle} | ${SITE_NAME}`;
}

export function makeProductTitle(name: string, platform?: string): string {
  if (platform) return `Buy ${name} — ${platform} Account for Sale | ${SITE_NAME}`;
  return `${name} — Digital Account for Sale | ${SITE_NAME}`;
}

export function makeBlogTitle(title: string): string {
  return `${title} | ${SITE_NAME} Blog`;
}

export function makeKBTitle(title: string): string {
  return `${title} | Help Center | ${SITE_NAME}`;
}

export function makeCategoryTitle(platform: string, type = "account"): string {
  return `${platform} Account for Sale — Buy Aged & Verified Accounts | ${SITE_NAME}`;
}

export function makeServiceTitle(name: string): string {
  return `${name} | Digital Agency Services | ${SITE_NAME}`;
}

// ── Meta description helpers ──────────────────────────────────────────────────

export function makeProductDesc(name: string, platform?: string, price?: number): string {
  const priceStr = price ? ` Starting at $${price}.` : "";
  if (platform)
    return `Buy ${name} — a verified ${platform} account with instant delivery and escrow protection.${priceStr} 1700+ happy clients. Replacement guarantee included.`;
  return `Buy ${name} — a premium digital account with instant delivery, escrow protection, and a full replacement guarantee.${priceStr}`;
}

export function makeBlogDesc(excerpt?: string, title?: string): string {
  if (excerpt && excerpt.length > 20) return excerpt.slice(0, 155).replace(/\s\w+$/, "") + "…";
  if (title) return `Read ${title} on the OfficialUM1 Blog — expert insights on digital growth, SEO, and social media strategy.`;
  return "Expert insights on digital growth, social media strategy, SEO, and building a trusted online presence.";
}

export function makeKBDesc(content?: string, title?: string): string {
  if (content && content.length > 30) return content.slice(0, 155).replace(/\s\w+$/, "") + "…";
  return `${title || "Help article"} — answers and guides from the OfficialUM1 Help Center.`;
}

export function makeCategoryDesc(platform: string): string {
  return `Buy aged, verified ${platform} accounts from a trusted marketplace. Instant delivery, escrow protection, and a replacement guarantee. Explore ${platform} accounts for sale at OfficialUM1.`;
}

// ── Canonical URL builder ─────────────────────────────────────────────────────

export function canonical(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}

// ── Breadcrumb helpers ────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  name: string;
  href: string;
}

export function makeProductBreadcrumbs(productName: string, category?: string): BreadcrumbItem[] {
  return [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    ...(category ? [{ name: category, href: `/shop?category=${encodeURIComponent(category)}` }] : []),
    { name: productName, href: "#" },
  ];
}

export function makeBlogBreadcrumbs(title: string, category?: string): BreadcrumbItem[] {
  return [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    ...(category ? [{ name: category, href: `/blog?category=${encodeURIComponent(category)}` }] : []),
    { name: title, href: "#" },
  ];
}

export function makeKBBreadcrumbs(title: string, category?: string): BreadcrumbItem[] {
  return [
    { name: "Home", href: "/" },
    { name: "Knowledge Base", href: "/kb" },
    ...(category ? [{ name: category, href: `/kb?category=${encodeURIComponent(category)}` }] : []),
    { name: title, href: "#" },
  ];
}

export function makeSimpleBreadcrumbs(...items: BreadcrumbItem[]): BreadcrumbItem[] {
  return [{ name: "Home", href: "/" }, ...items];
}

// ── JSON-LD Schema generators ─────────────────────────────────────────────────

export interface OrganizationSchema {
  "@context": string;
  "@type": string;
  name: string;
  url: string;
  logo: string;
  description: string;
  foundingDate: string;
  address: object;
  contactPoint: object;
  sameAs: string[];
}

export function makeOrganizationSchema(): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "OfficialUM1",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.jpg`,
    description: SITE_DESCRIPTION,
    foundingDate: "2022",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Sahiwal",
      addressRegion: "Punjab",
      addressCountry: "PK",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+92-323-7102924",
      contactType: "customer service",
      availableLanguage: "English",
    },
    sameAs: [
      "https://x.com/OfficialUM1",
      "https://t.me/OfficialUM1",
    ],
  };
}

export function makeWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/shop?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function makeProductSchema(product: {
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  url?: string;
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || makeProductDesc(product.name, product.category),
    category: product.category || "Digital Account",
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      url: product.url || SITE_URL,
      priceCurrency: product.currency || "USD",
      price: product.price?.toFixed(2) || "0.00",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  };
  if (product.imageUrl) schema.image = product.imageUrl;
  if (product.rating && product.reviewCount && product.reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating.toFixed(1),
      reviewCount: product.reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
  }
  return schema;
}

export function makeBlogSchema(blog: {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  author?: string;
  createdAt?: string;
  imageUrl?: string;
  category?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt || blog.content?.slice(0, 160) || "",
    url: `${SITE_URL}/blog/${blog.slug}`,
    datePublished: blog.createdAt || new Date().toISOString(),
    dateModified: blog.createdAt || new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: blog.author || SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.jpg`,
      },
    },
    image: blog.imageUrl || DEFAULT_OG_IMAGE,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${blog.slug}`,
    },
    articleSection: blog.category || "Digital Marketing",
    inLanguage: "en-US",
  };
}

export function makeServiceSchema(service: {
  name: string;
  description: string;
  url: string;
  priceRange?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    url: service.url,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(service.priceRange ? { offers: { "@type": "Offer", priceCurrency: "USD", description: service.priceRange } } : {}),
    areaServed: "Worldwide",
    serviceType: "Digital Services",
  };
}

export function makeFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function makeBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.href.startsWith("http") ? item.href : `${SITE_URL}${item.href}`,
    })),
  };
}

export function makeReviewSchema(reviews: {
  author: string;
  rating: number;
  comment: string;
  productName?: string;
  createdAt?: string;
}[]) {
  return reviews.slice(0, 10).map((r) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    author: {
      "@type": "Person",
      name: r.author,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: r.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: r.comment,
    ...(r.productName ? { itemReviewed: { "@type": "Product", name: r.productName } } : {}),
    ...(r.createdAt ? { datePublished: r.createdAt } : {}),
  }));
}

// ── OG Image helper ───────────────────────────────────────────────────────────

export function makeOGImage(customImage?: string): string {
  return customImage || DEFAULT_OG_IMAGE;
}

// ── noindex pages ─────────────────────────────────────────────────────────────

export const NOINDEX_PATHS = new Set([
  "/cart",
  "/checkout",
  "/order-success",
  "/my-orders",
  "/dashboard",
  "/login",
  "/register",
  "/forgot-password",
  "/wishlist",
  "/support",
  "/admin",
]);

export function shouldNoindex(path: string): boolean {
  return NOINDEX_PATHS.has(path);
}
