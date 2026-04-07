import { Helmet } from "react-helmet-async";
import {
  SITE_NAME,
  SITE_URL,
  DEFAULT_OG_IMAGE,
  BRAND_TWITTER,
  makeTitle,
  makeOGImage,
  canonical,
  shouldNoindex,
  makeBreadcrumbSchema,
  type BreadcrumbItem,
} from "@/lib/seo";
import { useLocation } from "wouter";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article" | "product";
  noindex?: boolean;
  canonical?: string;
  breadcrumbs?: BreadcrumbItem[];
  schema?: object | object[];
  keywords?: string;
  author?: string;
  publishedAt?: string;
  modifiedAt?: string;
}

export function SEO({
  title,
  description,
  image,
  type = "website",
  noindex,
  canonical: canonicalOverride,
  breadcrumbs,
  schema,
  keywords,
  author,
  publishedAt,
  modifiedAt,
}: SEOProps) {
  const [location] = useLocation();
  const pageTitle = makeTitle(title);
  const ogImage = makeOGImage(image);
  const canonicalUrl = canonicalOverride || canonical(location);
  const shouldBlock = noindex ?? shouldNoindex(location);

  const schemas: object[] = [];
  if (Array.isArray(schema)) schemas.push(...schema);
  else if (schema) schemas.push(schema);
  if (breadcrumbs && breadcrumbs.length > 1) {
    schemas.push(makeBreadcrumbSchema(breadcrumbs));
  }

  return (
    <Helmet>
      {/* Primary */}
      <title>{pageTitle}</title>
      {description && <meta name="description" content={description.slice(0, 160)} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}
      <link rel="canonical" href={canonicalUrl} />
      {shouldBlock && <meta name="robots" content="noindex, nofollow" />}
      {!shouldBlock && <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      {description && <meta property="og:description" content={description.slice(0, 160)} />}
      <meta property="og:type" content={type === "article" ? "article" : type === "product" ? "product" : "website"} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_US" />
      {publishedAt && <meta property="article:published_time" content={publishedAt} />}
      {modifiedAt && <meta property="article:modified_time" content={modifiedAt} />}

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={BRAND_TWITTER} />
      <meta name="twitter:title" content={pageTitle} />
      {description && <meta name="twitter:description" content={description.slice(0, 160)} />}
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD schemas */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
}

// ── Inline schema injector (for additional schemas on a page) ─────────────────
interface SchemaScriptProps {
  schema: object | object[];
}

export function SchemaScript({ schema }: SchemaScriptProps) {
  const schemas = Array.isArray(schema) ? schema : [schema];
  return (
    <>
      {schemas.map((s, i) => (
        <Helmet key={i}>
          <script type="application/ld+json">{JSON.stringify(s)}</script>
        </Helmet>
      ))}
    </>
  );
}
